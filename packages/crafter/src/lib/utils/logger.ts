/**
 * Centralized logging utility for the Crafter application.
 * Debug and info logs are suppressed in production mode.
 */
export const logger = {
	debug: (message: string, ...args: unknown[]) => {
		if (import.meta.env.PROD) return;
		console.debug(`[Crafter] ${message}`, ...args);
	},
	info: (message: string, ...args: unknown[]) => {
		if (import.meta.env.PROD) return;
		console.info(`[Crafter] ${message}`, ...args);
	},
	warn: (message: string, ...args: unknown[]) => {
		console.warn(`[Crafter] ${message}`, ...args);
	},
	error: (message: string, ...args: unknown[]) => {
		console.error(`[Crafter] ${message}`, ...args);
	}
};
