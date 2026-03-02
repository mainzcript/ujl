import type { AuthStrategy } from "payload";
import type { User } from "../payload-types";

/**
 * Authenticates requests that send Authorization: Bearer <token>.
 * The token must exist in access_tokens and not be expired.
 * On success, req.user is set to the user associated with that token.
 */
export const bearerTokenStrategy: AuthStrategy = {
	name: "bearer-access-token",
	authenticate: async ({ headers, payload }) => {
		const authHeader = headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return { user: null };
		}
		const token = authHeader.slice(7).trim();
		if (!token) {
			return { user: null };
		}

		const now = new Date();
		const result = await payload.find({
			collection: "access_tokens",
			where: {
				and: [{ token: { equals: token } }, { expiresAt: { greater_than: now.toISOString() } }],
			},
			depth: 1,
			limit: 1,
		});

		const accessTokenDoc = result.docs[0];
		if (!accessTokenDoc?.user) {
			return { user: null };
		}

		const userId =
			typeof accessTokenDoc.user === "number"
				? accessTokenDoc.user
				: (accessTokenDoc.user as User).id;
		const userDoc =
			typeof accessTokenDoc.user === "object"
				? (accessTokenDoc.user as User)
				: await payload.findByID({
						collection: "users",
						id: userId,
						depth: 0,
					});

		return {
			user: userDoc ? { ...userDoc, collection: "users" as const } : null,
		};
	},
};
