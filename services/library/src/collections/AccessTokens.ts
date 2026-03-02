import type { CollectionConfig } from "payload";

/**
 * AccessTokens collection for UJL Library
 *
 * Stores short-lived session tokens issued to clients (e.g. Crafter) when
 * an app backend authenticates with an API key. Tokens are validated via
 * Bearer header; API keys are never sent to the browser.
 *
 * Access: create is only via the /api/access-tokens/issue endpoint (API key auth).
 * Read/update/delete are admin-only. Expired tokens are cleaned up by a scheduled task.
 */
export const AccessTokens: CollectionConfig = {
	slug: "access_tokens",
	admin: {
		useAsTitle: "token",
		description: "Short-lived tokens for API access. Issued via POST /api/access-tokens/issue.",
		defaultColumns: ["token", "user", "issuedAt", "expiresAt"],
		group: "Auth",
	},
	access: {
		create: () => false, // Only created by the issue endpoint (Local API with overrideAccess)
		read: ({ req: { user } }) => !!user,
		update: () => false,
		delete: ({ req: { user } }) => !!user,
	},
	fields: [
		{
			name: "token",
			type: "text",
			required: true,
			unique: true,
			admin: {
				description: "The secret token string (Bearer).",
				readOnly: true,
			},
		},
		{
			name: "user",
			type: "relationship",
			relationTo: "users",
			required: true,
			admin: {
				description: "User (API key holder) who requested this token.",
			},
		},
		{
			name: "issuedAt",
			type: "date",
			required: true,
			admin: {
				description: "When the token was issued.",
			},
		},
		{
			name: "expiresAt",
			type: "date",
			required: true,
			index: true,
			admin: {
				description: "When the token expires (typically issuedAt + 15 min).",
			},
		},
		{
			name: "ipAddress",
			type: "text",
			admin: {
				description: "Client IP when token was requested (audit).",
			},
		},
		{
			name: "userAgent",
			type: "text",
			admin: {
				description: "Client User-Agent when token was requested (audit).",
			},
		},
	],
	timestamps: false,
};
