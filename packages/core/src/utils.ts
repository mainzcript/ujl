import { nanoid } from "nanoid";

/**
 * Generates a unique ID using nanoid
 * Returns a URL-safe random string of the specified length
 *
 * Uses nanoid for:
 * - Better browser compatibility (works in older browsers)
 * - Custom length support (shorter IDs for better UX)
 * - URL-safe characters (A-Za-z0-9_-)
 * - High performance and small bundle size (~130 bytes)
 *
 * @param length - Optional custom length (default: 21, nanoid default)
 * @returns A unique random ID string
 *
 * @example
 * ```ts
 * const id = generateUid(); // "V1StGXR8_Z5jdHi6B-myT" (21 chars)
 * const shortId = generateUid(10); // "V1StGXR8_Z" (10 chars)
 * ```
 */
export function generateUid(length: number = 21): string {
	return nanoid(length);
}
