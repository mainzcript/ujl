/**
 * UJL Dev Demo – Crafter Integration Example
 *
 * This file demonstrates how to integrate the UJL Crafter into a vanilla
 * TypeScript application. It supports two library storage modes:
 *
 * 1. Inline (default): Library stored as Base64 in the document
 * 2. Backend: Library stored on a Payload CMS server (services/library)
 *
 * Configuration is done via environment variables (see .env.example).
 */

// ============================================
// FONT IMPORTS (required for Crafter UI)
// ============================================
import '@fontsource-variable/inter';
import '@fontsource-variable/open-sans';
import '@fontsource-variable/roboto';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/oswald';
import '@fontsource-variable/raleway';
import '@fontsource-variable/merriweather';
import '@fontsource-variable/noto-sans';
import '@fontsource-variable/nunito-sans';
import '@fontsource-variable/jetbrains-mono';

import { UJLCrafter, type LibraryOptions } from '@ujl-framework/crafter';
import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

/**
 * Library storage mode: 'inline' or 'backend'
 * - inline: Library is stored as Base64 directly in the UJLC document
 * - backend: Library is stored on a Payload CMS server
 */
const STORAGE_MODE = import.meta.env.VITE_LIBRARY_STORAGE || 'inline';

/**
 * Backend URL (only used when STORAGE_MODE is 'backend')
 * Example: http://localhost:3000
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string | undefined;

/**
 * Backend API key for authentication (only used when STORAGE_MODE is 'backend')
 * Get this from the Library Admin UI: Users → Your User → API Key
 */
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY as string | undefined;

// ============================================
// LIBRARY CONFIGURATION
// ============================================

function getLibraryConfig(): LibraryOptions {
	if (STORAGE_MODE === 'backend') {
		// Validate backend configuration
		if (!BACKEND_URL) {
			throw new Error(
				'Backend mode requires VITE_BACKEND_URL. ' + 'Please configure it in your .env file.'
			);
		}
		if (!BACKEND_API_KEY) {
			throw new Error(
				'Backend mode requires VITE_BACKEND_API_KEY. ' + 'Please configure it in your .env file.'
			);
		}

		console.log(`[dev-demo] Using backend storage: ${BACKEND_URL}`);
		return {
			storage: 'backend',
			url: BACKEND_URL,
			apiKey: BACKEND_API_KEY
		};
	}

	console.log('[dev-demo] Using inline storage (library embedded in document)');
	return { storage: 'inline' };
}

// ============================================
// CRAFTER INITIALIZATION
// ============================================

const library = getLibraryConfig();

const crafter = new UJLCrafter({
	target: '#app',
	document: showcaseDocument as unknown as UJLCDocument,
	theme: defaultTheme as unknown as UJLTDocument,
	library
});

// ============================================
// EVENT HANDLERS (OPTIONAL)
// ============================================

// Log document changes (useful for debugging)
crafter.onDocumentChange((doc) => {
	console.log('[dev-demo] Document changed:', doc.ujlc.meta.title);
});

// Log theme changes
crafter.onThemeChange((theme) => {
	console.log('[dev-demo] Theme changed:', theme.ujlt.meta._version);
});

// Log notifications from the Crafter
crafter.onNotification((type, message, description) => {
	console.log(`[dev-demo] Notification (${type}): ${message}`, description || '');
});

// ============================================
// EXPOSE FOR DEBUGGING
// ============================================

// Make crafter available in browser console for debugging
declare global {
	interface Window {
		crafter: UJLCrafter;
	}
}
window.crafter = crafter;

console.log('[dev-demo] UJL Crafter initialized. Access via window.crafter in console.');
