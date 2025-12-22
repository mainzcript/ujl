/**
 * Browser clipboard integration for UJL editor.
 */

import type { UJLCModuleObject } from '@ujl-framework/types';
import { logger } from '$lib/utils/logger.js';

/**
 * Clipboard data format for UJL editor
 */
export type UJLClipboardData =
	| UJLCModuleObject
	| {
			type: 'slot';
			slotName: string;
			content: UJLCModuleObject[];
	  };

/**
 * Prefix marker for UJL clipboard data in browser clipboard
 * This allows us to identify UJL clipboard data vs. regular text
 */
const UJL_CLIPBOARD_PREFIX = '__UJL_CLIPBOARD__:';

/**
 * Storage key for persisting clipboard data across page reloads
 */
const CLIPBOARD_STORAGE_KEY = '__UJL_CLIPBOARD_STORAGE__';

/**
 * Serializes UJL clipboard data to a JSON string with prefix marker.
 */
export function serializeClipboard(data: UJLClipboardData): string {
	return UJL_CLIPBOARD_PREFIX + JSON.stringify(data);
}

/**
 * Deserializes clipboard data from a JSON string.
 * Returns null if the data is not valid UJL clipboard data.
 */
export function deserializeClipboard(text: string): UJLClipboardData | null {
	if (!text.startsWith(UJL_CLIPBOARD_PREFIX)) {
		return null;
	}

	try {
		const json = text.slice(UJL_CLIPBOARD_PREFIX.length);
		const data = JSON.parse(json) as unknown;

		// Validate structure: must have meta.id (node) or type === 'slot'
		if (
			data &&
			typeof data === 'object' &&
			('meta' in data || (data as { type?: string }).type === 'slot')
		) {
			return data as UJLClipboardData;
		}
	} catch {
		// Invalid JSON
	}

	return null;
}

/**
 * Checks if browser clipboard API is available.
 */
export function isClipboardAvailable(): boolean {
	return typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText;
}

/**
 * Writes UJL clipboard data to the browser's system clipboard.
 * Also persists to localStorage for cross-reload support (Safari workaround).
 * Silently fails if clipboard API is not available.
 */
export async function writeToBrowserClipboard(data: UJLClipboardData): Promise<void> {
	// Persist to localStorage (works even without clipboard API)
	try {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(CLIPBOARD_STORAGE_KEY, serializeClipboard(data));
		}
	} catch {
		// Silently fail if localStorage unavailable (private mode, quota exceeded)
	}

	if (!isClipboardAvailable()) {
		return;
	}

	try {
		await navigator.clipboard.writeText(serializeClipboard(data));
	} catch (error) {
		// Silently fail if clipboard unavailable (permissions or context)
		logger.warn('Failed to write to browser clipboard:', error);
	}
}

/**
 * Reads UJL clipboard data from the browser's system clipboard.
 * Falls back to localStorage if clipboard API is unavailable (Safari workaround).
 * Returns null if clipboard is not available or contains non-UJL data.
 *
 * Priority: System clipboard first (for cross-browser support), then localStorage (for Safari/page-reload).
 */
export async function readFromBrowserClipboard(): Promise<UJLClipboardData | null> {
	// Try browser clipboard API first (enables cross-browser support)
	if (isClipboardAvailable() && navigator.clipboard?.readText) {
		try {
			const text = await navigator.clipboard.readText();
			const data = deserializeClipboard(text);
			// If we got valid data from clipboard API, update localStorage for future fallback
			if (data && typeof localStorage !== 'undefined') {
				try {
					localStorage.setItem(CLIPBOARD_STORAGE_KEY, text);
				} catch {
					// Silently fail if localStorage unavailable
				}
			}
			// Return system clipboard data (even if null) to prioritize cross-browser support
			return data;
		} catch {
			// Silently fail if clipboard unreadable (permissions or context)
			// Will fall through to localStorage fallback
		}
	}

	// Fallback to localStorage (works without user interaction, Safari/page-reload workaround)
	try {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
			if (stored) {
				const data = deserializeClipboard(stored);
				if (data) {
					return data;
				}
			}
		}
	} catch {
		// Silently fail if localStorage unavailable
	}

	return null;
}

/**
 * Writes UJL clipboard data using ClipboardEvent (no permissions required).
 */
export function writeToClipboardEvent(event: ClipboardEvent, data: UJLClipboardData): void {
	if (!event.clipboardData) {
		logger.warn('ClipboardEvent has no clipboardData');
		return;
	}

	event.preventDefault();
	event.clipboardData.setData('text/plain', serializeClipboard(data));
}

/**
 * Reads UJL clipboard data from ClipboardEvent (no permissions required).
 */
export function readFromClipboardEvent(event: ClipboardEvent): UJLClipboardData | null {
	if (!event.clipboardData) {
		return null;
	}

	const text = event.clipboardData.getData('text/plain');
	return text ? deserializeClipboard(text) : null;
}
