/**
 * UJL Crafter - Visual Editor for UJL Documents
 *
 * @module ujl-crafter
 */

// Only public API
export { UJLCrafter, type LibraryOptions, type UJLCrafterOptions } from "./UJLCrafter.js";

// Callback types (only relevant for API consumers)
export type {
	DocumentChangeCallback,
	NotificationCallback,
	NotificationType,
	ThemeChangeCallback,
} from "./UJLCrafter.js";
