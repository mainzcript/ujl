/**
 * UJL Crafter - Visual Editor for UJL Documents
 *
 * @module ujl-crafter
 */

// Only public API
export { UJLCrafter, type UJLCrafterOptions, type LibraryOptions } from './UJLCrafter.js';

// Callback types (only relevant for API consumers)
export type {
	NotificationType,
	NotificationCallback,
	DocumentChangeCallback,
	ThemeChangeCallback
} from './UJLCrafter.js';
