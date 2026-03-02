import type { Payload, PayloadRequest } from "payload";

/**
 * Deletes all access_tokens documents where expiresAt is in the past.
 * Safe to call from cron (e.g. every 5 min) or after token issue.
 *
 * When called from an endpoint, pass req for transaction context.
 * When called from a scheduled job without a request, pass undefined for req.
 */
export async function cleanupExpiredAccessTokens(
	payload: Payload,
	req?: PayloadRequest,
): Promise<{ deleted: number }> {
	const now = new Date().toISOString();
	const result = await payload.delete({
		collection: "access_tokens",
		where: {
			expiresAt: { less_than: now },
		},
		overrideAccess: true,
		...(req && { req }),
	});
	const deleted = result.docs?.length ?? 0;
	return { deleted };
}
