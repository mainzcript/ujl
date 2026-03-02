import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";

/**
 * Returns a short-lived token for the Library service.
 * Uses LIBRARY_API_KEY server-side; the key is never sent to the client.
 *
 * Implementation: Calls the Library service to issue a token with the API key.
 */
export const GET: RequestHandler = async () => {
	const apiKey = env.LIBRARY_API_KEY;
	const libraryUrl = env.LIBRARY_URL;

	if (!apiKey || !libraryUrl) {
		return json(
			{ error: "LIBRARY_API_KEY and LIBRARY_URL must be configured in .env" },
			{ status: 500 },
		);
	}

	try {
		// Try to call Library service to issue a token
		const res = await fetch(`${libraryUrl}/api/access-tokens/issue`, {
			method: "POST",
			headers: {
				Authorization: `users API-Key ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ requestedBy: "dev-demo" }),
		});

		if (!res.ok) {
			const body = await res.text();
			console.error(`[library-token] Library responded ${res.status}:`, body);
			return json({ error: `Library returned ${res.status}`, details: body }, { status: 502 });
		}

		const data = (await res.json()) as { token?: string; doc?: { token?: string } };
		const token = data.token ?? data.doc?.token;

		if (!token) {
			console.error("[library-token] Library response missing token:", data);
			return json({ error: "Library did not return a token" }, { status: 502 });
		}

		return json({ token });
	} catch (e) {
		console.error("[library-token] Failed to fetch from Library:", e);
		return json({ error: "Failed to contact Library service" }, { status: 502 });
	}
};
