import type { AssetMetadata } from "@ujl-framework/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackendLibraryProvider } from "./backend-provider.js";

// ============================================
// TEST HELPERS
// ============================================

const BASE_URL = "http://localhost:3000";
const API_KEY = "test-api-key";
const COLLECTION = "images";
const API_BASE = `${BASE_URL}/api/${COLLECTION}`;

const PROXY_URL = "/api/library";

const SAMPLE_METADATA: AssetMetadata = {
	filename: "photo.jpg",
	width: 1920,
	height: 1080,
};

/** Minimal PayloadImageDoc fixture */
function makePayloadDoc(overrides: Record<string, unknown> = {}) {
	return {
		id: "doc-abc123",
		filename: "photo.jpg",
		mimeType: "image/jpeg",
		filesize: 2048,
		width: 1920,
		height: 1080,
		url: "/media/photo.jpg",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
		...overrides,
	};
}

function makePayloadListResponse(docs: ReturnType<typeof makePayloadDoc>[]) {
	return {
		docs,
		totalDocs: docs.length,
		limit: 100,
		totalPages: 1,
		page: 1,
		pagingCounter: 1,
		hasPrevPage: false,
		hasNextPage: false,
		prevPage: null,
		nextPage: null,
	};
}

function makeFile(name = "photo.jpg", type = "image/jpeg"): File {
	return new File(["data"], name, { type });
}

// ============================================
// TESTS — Direct mode
// ============================================

describe("BackendLibraryProvider (direct mode)", () => {
	let adapter: BackendLibraryProvider;

	beforeEach(() => {
		adapter = new BackendLibraryProvider({ url: BASE_URL, apiKey: API_KEY });
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("name", () => {
		it("should expose name 'backend'", () => {
			expect(adapter.name).toBe("backend");
		});
	});

	describe("checkConnection", () => {
		it("should return connected: true on 200 response", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			const status = await adapter.checkConnection();

			expect(status.connected).toBe(true);
			expect(fetch).toHaveBeenCalledWith(`${API_BASE}?limit=1`, expect.any(Object));
		});

		it("should include Authorization header in direct mode", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await adapter.checkConnection();

			const [, init] = vi.mocked(fetch).mock.calls[0];
			const headers = (init as RequestInit).headers as Record<string, string>;
			expect(headers["Authorization"]).toBe(`users API-Key ${API_KEY}`);
		});

		it("should return connected: false with auth error on 401", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

			const status = await adapter.checkConnection();

			expect(status.connected).toBe(false);
			expect(status.error).toMatch(/authentication/i);
		});

		it("should return connected: false with status message on non-200", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Error", { status: 500 }));

			const status = await adapter.checkConnection();

			expect(status.connected).toBe(false);
			expect(status.error).toContain("500");
		});

		it("should return connected: false when fetch throws", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

			const status = await adapter.checkConnection();

			expect(status.connected).toBe(false);
			expect(status.error).toContain(API_BASE);
		});
	});

	describe("upload", () => {
		it("should POST to API base and return assetId from doc.id", async () => {
			const doc = makePayloadDoc();
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify({ doc }), { status: 201 }),
			);

			const result = await adapter.upload(makeFile(), SAMPLE_METADATA);

			expect(result.assetId).toBe("doc-abc123");
			const [url, init] = vi.mocked(fetch).mock.calls[0];
			expect(url).toBe(API_BASE);
			expect((init as RequestInit).method).toBe("POST");
		});

		it("should resolve the best responsive image size for the entry src", async () => {
			const doc = makePayloadDoc({
				sizes: {
					sm: { url: "/media/photo-sm.jpg", width: 640, height: 360 },
					xl: { url: "/media/photo-xl.jpg", width: 1280, height: 720 },
					max: { url: "/media/photo-max.jpg", width: 2560, height: 1440 },
				},
			});
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify({ doc }), { status: 201 }),
			);

			const result = await adapter.upload(makeFile(), SAMPLE_METADATA);

			// max is highest priority
			expect(result.entry.src).toBe(`${BASE_URL}/media/photo-max.jpg`);
		});

		it("should fall back to doc.url when no sizes are present", async () => {
			const doc = makePayloadDoc(); // no sizes
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify({ doc }), { status: 201 }),
			);

			const result = await adapter.upload(makeFile(), SAMPLE_METADATA);

			expect(result.entry.src).toBe(`${BASE_URL}/media/photo.jpg`);
		});

		it("should throw when the backend returns an error", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify({ errors: [{ message: "File too large" }] }), { status: 413 }),
			);

			await expect(adapter.upload(makeFile(), SAMPLE_METADATA)).rejects.toThrow("File too large");
		});

		it("should throw a generic error when response body is not JSON", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Bad Gateway", { status: 502 }));

			await expect(adapter.upload(makeFile(), SAMPLE_METADATA)).rejects.toThrow("Upload failed");
		});
	});

	describe("get", () => {
		it("should return AssetEntry for a known asset ID", async () => {
			const doc = makePayloadDoc();
			vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(doc), { status: 200 }));

			const entry = await adapter.get("doc-abc123");

			expect(entry).not.toBeNull();
			expect(entry!.metadata.filename).toBe("photo.jpg");
			expect(fetch).toHaveBeenCalledWith(`${API_BASE}/doc-abc123`, expect.any(Object));
		});

		it("should return null for a 404 response", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

			const entry = await adapter.get("missing");

			expect(entry).toBeNull();
		});

		it("should return null when fetch throws", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

			const entry = await adapter.get("doc-abc123");

			expect(entry).toBeNull();
		});
	});

	describe("list", () => {
		it("should return all docs from the API", async () => {
			const docs = [makePayloadDoc({ id: "a" }), makePayloadDoc({ id: "b" })];
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse(docs)), { status: 200 }),
			);

			const items = await adapter.list();

			expect(items).toHaveLength(2);
			expect(items[0].id).toBe("a");
			expect(items[1].id).toBe("b");
			expect(fetch).toHaveBeenCalledWith(`${API_BASE}?limit=100`, expect.any(Object));
		});

		it("should return empty array on error", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

			const items = await adapter.list();

			expect(items).toEqual([]);
		});

		it("should return empty array on non-ok response", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Error", { status: 500 }));

			const items = await adapter.list();

			expect(items).toEqual([]);
		});
	});

	describe("delete", () => {
		it("should DELETE the asset and return true on success", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 200 }));

			const result = await adapter.delete("doc-abc123");

			expect(result).toBe(true);
			const [url, init] = vi.mocked(fetch).mock.calls[0];
			expect(url).toBe(`${API_BASE}/doc-abc123`);
			expect((init as RequestInit).method).toBe("DELETE");
		});

		it("should return false on 404", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

			const result = await adapter.delete("missing");

			expect(result).toBe(false);
		});

		it("should return false when fetch throws", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

			const result = await adapter.delete("doc-abc123");

			expect(result).toBe(false);
		});
	});

	describe("resolve", () => {
		it("should return ImageSource for a known asset by string ID", async () => {
			const doc = makePayloadDoc();
			vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(doc), { status: 200 }));

			const source = await adapter.resolve("doc-abc123");

			expect(source).not.toBeNull();
			expect(source!.src).toBe(`${BASE_URL}/media/photo.jpg`);
		});

		it("should coerce numeric ID to string and resolve", async () => {
			const doc = makePayloadDoc({ id: "42" });
			vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(doc), { status: 200 }));

			const source = await adapter.resolve(42);

			expect(source).not.toBeNull();
			expect(fetch).toHaveBeenCalledWith(`${API_BASE}/42`, expect.any(Object));
		});

		it("should return null for an unknown ID", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

			const source = await adapter.resolve("unknown");

			expect(source).toBeNull();
		});
	});

	describe("custom collectionSlug", () => {
		it("should use a custom collection slug in the API base", async () => {
			const customAdapter = new BackendLibraryProvider({
				url: BASE_URL,
				apiKey: API_KEY,
				collectionSlug: "assets",
			});
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await customAdapter.checkConnection();

			const [url] = vi.mocked(fetch).mock.calls[0];
			expect(url).toContain("/api/assets?limit=1");
		});
	});

	describe("trailing slash normalisation", () => {
		it("should strip a trailing slash from the base URL", async () => {
			const slashAdapter = new BackendLibraryProvider({
				url: `${BASE_URL}/`,
				apiKey: API_KEY,
			});
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await slashAdapter.checkConnection();

			const [url] = vi.mocked(fetch).mock.calls[0];
			// Must not contain double slashes
			expect(url).not.toContain("//api/");
		});
	});
});

// ============================================
// TESTS — Proxy mode
// ============================================

describe("BackendLibraryProvider (proxy mode)", () => {
	let adapter: BackendLibraryProvider;

	beforeEach(() => {
		adapter = new BackendLibraryProvider({ proxyUrl: PROXY_URL });
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("name", () => {
		it("should expose name 'backend'", () => {
			expect(adapter.name).toBe("backend");
		});
	});

	describe("headers", () => {
		it("should NOT include an Authorization header in proxy mode", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await adapter.checkConnection();

			const [, init] = vi.mocked(fetch).mock.calls[0];
			const headers = (init as RequestInit).headers as Record<string, string>;
			expect(headers?.["Authorization"]).toBeUndefined();
		});
	});

	describe("checkConnection", () => {
		it("should call proxyUrl?limit=1", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			const status = await adapter.checkConnection();

			expect(status.connected).toBe(true);
			expect(fetch).toHaveBeenCalledWith(`${PROXY_URL}?limit=1`, expect.any(Object));
		});
	});

	describe("trailing slash normalisation", () => {
		it("should strip a trailing slash from the proxy URL", async () => {
			const trailingAdapter = new BackendLibraryProvider({ proxyUrl: `${PROXY_URL}/` });
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await trailingAdapter.checkConnection();

			const [url] = vi.mocked(fetch).mock.calls[0];
			expect(url).toBe(`${PROXY_URL}?limit=1`);
		});
	});

	describe("get", () => {
		it("should call proxyUrl/{id}", async () => {
			const doc = makePayloadDoc({ id: "p1" });
			vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(doc), { status: 200 }));

			await adapter.get("p1");

			expect(fetch).toHaveBeenCalledWith(`${PROXY_URL}/p1`, expect.any(Object));
		});

		it("should use the URL returned by the proxy as-is (no prefix applied)", async () => {
			// In proxy mode baseUrl is null so no prefix is added to relative URLs
			const doc = makePayloadDoc({ url: "/media/photo.jpg" });
			vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(doc), { status: 200 }));

			const entry = await adapter.get("p1");

			expect(entry!.src).toBe("/media/photo.jpg");
		});
	});

	describe("upload", () => {
		it("should POST to proxyUrl", async () => {
			const doc = makePayloadDoc();
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify({ doc }), { status: 201 }),
			);

			await adapter.upload(makeFile(), SAMPLE_METADATA);

			const [url, init] = vi.mocked(fetch).mock.calls[0];
			expect(url).toBe(PROXY_URL);
			expect((init as RequestInit).method).toBe("POST");
		});
	});

	describe("list", () => {
		it("should call proxyUrl?limit=100", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(
				new Response(JSON.stringify(makePayloadListResponse([])), { status: 200 }),
			);

			await adapter.list();

			expect(fetch).toHaveBeenCalledWith(`${PROXY_URL}?limit=100`, expect.any(Object));
		});
	});

	describe("delete", () => {
		it("should DELETE proxyUrl/{id}", async () => {
			vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 200 }));

			const result = await adapter.delete("p1");

			expect(result).toBe(true);
			const [url, init] = vi.mocked(fetch).mock.calls[0];
			expect(url).toBe(`${PROXY_URL}/p1`);
			expect((init as RequestInit).method).toBe("DELETE");
		});
	});
});
