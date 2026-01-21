/**
 * UJL Crafter - Visual Editor for UJL Documents
 *
 * @module ujl-crafter
 */

// Einzige öffentliche API
export { UJLCrafter, type UJLCrafterOptions, type ImageLibraryOptions } from './UJLCrafter.js';

// Callback-Types (nur für API-Nutzer relevant)
export type {
	NotificationType,
	NotificationCallback,
	DocumentChangeCallback,
	ThemeChangeCallback
} from './UJLCrafter.js';
