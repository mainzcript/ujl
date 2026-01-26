/**
 * File utilities for importing and exporting UJL documents.
 *
 * These helpers are intentionally UI-agnostic and can be reused from
 * different components. They do not depend on Svelte APIs.
 */

import { logger } from './logger.js';

/**
 * Downloads an arbitrary data object as a pretty-printed JSON file.
 *
 * @param data - The data object to serialize
 * @param filename - The filename for the downloaded file
 */
export function downloadJsonFile(data: unknown, filename: string): void {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

/**
 * Reads a File as text and parses it as JSON.
 *
 * @param file - The File object to read
 * @returns A promise resolving to the parsed JSON value or null on failure
 */
export async function readJsonFile(file: File): Promise<unknown | null> {
	try {
		const text = await file.text();
		return JSON.parse(text);
	} catch (error) {
		logger.error('Failed to read or parse JSON file:', error);
		return null;
	}
}
