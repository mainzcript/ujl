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
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/merriweather";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/oswald";
import "@fontsource-variable/raleway";
import "@fontsource-variable/roboto";

import { UJLCrafter, type LibraryOptions } from "@ujl-framework/crafter";
import { backendLibraryDocument, defaultTheme, showcaseDocument } from "@ujl-framework/examples";
import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";
import { TestimonialModule } from "./modules/testimonial.js";

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

/**
 * Library storage mode: 'inline' or 'backend'
 * - inline: Library is stored as Base64 directly in the UJLC document
 * - backend: Library is stored on a Payload CMS server
 */
const STORAGE_MODE = import.meta.env.VITE_LIBRARY_STORAGE || "inline";

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
	if (STORAGE_MODE === "backend") {
		// Validate backend configuration
		if (!BACKEND_URL) {
			throw new Error(
				"Backend mode requires VITE_BACKEND_URL. " + "Please configure it in your .env file.",
			);
		}
		if (!BACKEND_API_KEY) {
			throw new Error(
				"Backend mode requires VITE_BACKEND_API_KEY. " + "Please configure it in your .env file.",
			);
		}

		console.log(`[dev-demo] Using backend storage: ${BACKEND_URL}`);
		return {
			storage: "backend",
			url: BACKEND_URL,
			apiKey: BACKEND_API_KEY,
		};
	}

	console.log("[dev-demo] Using inline storage (library embedded in document)");
	return { storage: "inline" };
}

// ============================================
// DOCUMENT SELECTION
// ============================================

/**
 * Select the appropriate example document based on storage mode
 */
function getExampleDocument(): UJLCDocument {
	if (STORAGE_MODE === "backend") {
		console.log("[dev-demo] Loading backend-library example document");
		return backendLibraryDocument as unknown as UJLCDocument;
	}
	console.log("[dev-demo] Loading showcase example document");
	return showcaseDocument as unknown as UJLCDocument;
}

// ============================================
// CRAFTER INITIALIZATION
// ============================================

const library = getLibraryConfig();
const document = getExampleDocument();

const crafter = new UJLCrafter({
	target: "#app",
	document,
	theme: defaultTheme as unknown as UJLTDocument,
	library,
	modules: [new TestimonialModule()],
});

// ============================================
// EVENT HANDLERS (OPTIONAL)
// ============================================

// Log document changes (useful for debugging)
crafter.onDocumentChange((doc) => {
	console.log("[dev-demo] Document changed:", doc.ujlc.meta.title);
});

// Log theme changes
crafter.onThemeChange((theme) => {
	console.log("[dev-demo] Theme changed:", theme.ujlt.meta._version);
});

// Log notifications from the Crafter
crafter.onNotification((type, message, description) => {
	console.log(`[dev-demo] Notification (${type}): ${message}`, description || "");
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

console.log("[dev-demo] UJL Crafter initialized. Access via window.crafter in console.");
