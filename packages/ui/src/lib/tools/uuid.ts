/**
 * Generates a UUID for theme IDs
 * Uses crypto.randomUUID() for native browser support
 */
export function uuid(): string {
	return crypto.randomUUID().replace(/-/g, '');
}
