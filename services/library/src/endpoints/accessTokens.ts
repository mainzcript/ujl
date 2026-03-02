import crypto from "crypto";
import type { Endpoint } from "payload";
import { APIError } from "payload";
import { cleanupExpiredAccessTokens } from "../hooks/cleanupAccessTokens";

const TTL_MINUTES = Number(process.env.ACCESS_TOKEN_TTL_MINUTES) || 15;

/**
 * POST /access-tokens/issue
 *
 * Requires: Authorization: users API-Key <valid-api-key>
 * Body (optional): { requestedBy?: string }
 * Response: { token: string, expiresAt: string (ISO) }
 *
 * Issues a short-lived Bearer token for the authenticated user (API key holder).
 * The token is stored in access_tokens and can be used as Authorization: Bearer <token>
 * for subsequent API calls (e.g. images create/update/delete).
 */
export const issueAccessToken: Endpoint = {
	path: "/access-tokens/issue",
	method: "post",
	handler: async (req) => {
		if (!req.user) {
			throw new APIError("Unauthorized. Send Authorization: users API-Key <your-api-key>.", 401);
		}

		const issuedAt = new Date();
		const expiresAt = new Date(issuedAt.getTime() + TTL_MINUTES * 60 * 1000);
		const token = crypto.randomBytes(32).toString("base64url");

		const userId = req.user.id;
		const headers = req.headers as Headers | undefined;
		const ipAddress =
			headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ??
			headers?.get?.("x-real-ip") ??
			undefined;
		const userAgent = headers?.get?.("user-agent") ?? undefined;

		const doc = await req.payload.create({
			collection: "access_tokens",
			data: {
				token,
				user: userId,
				issuedAt: issuedAt.toISOString(),
				expiresAt: expiresAt.toISOString(),
				...(ipAddress && { ipAddress }),
				...(userAgent && { userAgent }),
			},
			overrideAccess: true,
			req,
		});

		// Opportunistic cleanup of expired tokens (same request)
		await cleanupExpiredAccessTokens(req.payload, req);

		return Response.json({
			token: doc.token,
			expiresAt: doc.expiresAt,
		});
	},
};

const CLEANUP_SECRET = process.env.ACCESS_TOKEN_CLEANUP_SECRET;

/**
 * POST /access-tokens/cleanup
 *
 * Requires: X-Access-Token-Cleanup-Secret: <ACCESS_TOKEN_CLEANUP_SECRET>
 * (If ACCESS_TOKEN_CLEANUP_SECRET is not set, returns 503.)
 *
 * Deletes expired access_tokens. Intended for cron (e.g. every 5 min).
 */
export const cleanupAccessTokensEndpoint: Endpoint = {
	path: "/access-tokens/cleanup",
	method: "post",
	handler: async (req) => {
		if (!CLEANUP_SECRET) {
			return Response.json(
				{ error: "Cleanup not configured. Set ACCESS_TOKEN_CLEANUP_SECRET." },
				{ status: 503 },
			);
		}
		const headerSecret = req.headers.get("x-access-token-cleanup-secret");
		if (headerSecret !== CLEANUP_SECRET) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}
		const { deleted } = await cleanupExpiredAccessTokens(req.payload, req);
		return Response.json({ deleted });
	},
};
