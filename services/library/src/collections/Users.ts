import type { CollectionConfig } from "payload";
import { bearerTokenStrategy } from "../auth/bearerTokenStrategy";

/**
 * Users collection for UJL Library
 *
 * Manages authentication and API key access for the Library service.
 * Supports: (1) API key via useAPIKey, (2) Bearer tokens via bearerTokenStrategy
 * (short-lived tokens from POST /access-tokens/issue).
 */
export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		useAsTitle: "email",
	},
	auth: {
		useAPIKey: true,
		strategies: [bearerTokenStrategy],
	},
	fields: [],
};
