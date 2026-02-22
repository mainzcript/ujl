import type { AssetEntry, AssetMetadata, UJLCLibrary } from "@ujl-framework/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InlineLibraryProvider } from "./inline-provider.js";

// ============================================
// TEST HELPERS
// ============================================

/**
 * Create a minimal in-memory library store and return the adapter
 * along with helpers to inspect the stored state.
 */
function createAdapter() {
	let library: UJLCLibrary = {};

	const getLibrary = () => library;
	const updateLibrary = (fn: (current: UJLCLibrary) => UJLCLibrary) => {
		library = fn(library);
	};

	const adapter = new InlineLibraryProvider(getLibrary, updateLibrary);

	return { adapter, getLibrary };
}

const SAMPLE_METADATA: AssetMetadata = {
	filename: "photo.jpg",
	width: 800,
	height: 600,
};

const SAMPLE_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgAB";

/**
 * Create a File-like object. We mock FileReader globally so we don't need
 * a real browser environment.
 */
function makeFile(name = "photo.jpg", type = "image/jpeg"): File {
	return new File(["dummy content"], name, { type });
}

// ============================================
// FileReader mock (jsdom / node env fallback)
// ============================================

class MockFileReader {
	result: string | ArrayBuffer | null = null;
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;

	readAsDataURL(_file: Blob) {
		// Simulate async resolution
		setTimeout(() => {
			this.result = SAMPLE_BASE64;
			this.onload?.();
		}, 0);
	}
}

class FailingFileReader {
	result: string | ArrayBuffer | null = null;
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;

	readAsDataURL(_file: Blob) {
		setTimeout(() => {
			this.onerror?.();
		}, 0);
	}
}

// ============================================
// TESTS
// ============================================

describe("InlineLibraryProvider", () => {
	describe("name", () => {
		it("should expose name 'inline'", () => {
			const { adapter } = createAdapter();
			expect(adapter.name).toBe("inline");
		});
	});

	describe("checkConnection", () => {
		it("should always return connected: true", async () => {
			const { adapter } = createAdapter();
			const status = await adapter.checkConnection();
			expect(status).toEqual({ connected: true });
		});
	});

	describe("upload", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should store an asset and return its assetId", async () => {
			const { adapter, getLibrary } = createAdapter();

			const result = await adapter.upload(makeFile(), SAMPLE_METADATA);

			expect(result.assetId).toBeDefined();
			expect(typeof result.assetId).toBe("string");
			expect(result.assetId.length).toBeGreaterThan(0);

			const stored = getLibrary()[result.assetId];
			expect(stored).toBeDefined();
			expect(stored.src).toBe(SAMPLE_BASE64);
		});

		it("should store AssetEntry with correct metadata", async () => {
			const { adapter, getLibrary } = createAdapter();
			const file = makeFile();

			const result = await adapter.upload(file, SAMPLE_METADATA);
			const entry = getLibrary()[result.assetId];

			expect(entry.metadata.filename).toBe(SAMPLE_METADATA.filename);
			expect(entry.metadata.width).toBe(SAMPLE_METADATA.width);
			expect(entry.metadata.height).toBe(SAMPLE_METADATA.height);
		});

		it("should return the same entry as stored in the library", async () => {
			const { adapter, getLibrary } = createAdapter();

			const result = await adapter.upload(makeFile(), SAMPLE_METADATA);

			expect(result.entry).toEqual(getLibrary()[result.assetId]);
		});

		it("should generate unique asset IDs for multiple uploads", async () => {
			const { adapter } = createAdapter();

			const [r1, r2] = await Promise.all([
				adapter.upload(makeFile(), SAMPLE_METADATA),
				adapter.upload(makeFile(), SAMPLE_METADATA),
			]);

			expect(r1.assetId).not.toBe(r2.assetId);
		});

		it("should accumulate entries in the library", async () => {
			const { adapter, getLibrary } = createAdapter();

			await adapter.upload(makeFile("a.jpg"), SAMPLE_METADATA);
			await adapter.upload(makeFile("b.jpg"), SAMPLE_METADATA);

			expect(Object.keys(getLibrary())).toHaveLength(2);
		});

		it("should throw when FileReader fails to read the file", async () => {
			vi.stubGlobal("FileReader", FailingFileReader);

			const { adapter } = createAdapter();

			await expect(adapter.upload(makeFile(), SAMPLE_METADATA)).rejects.toThrow(
				"Failed to read file",
			);
		});
	});

	describe("get", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return the entry for a known asset ID", async () => {
			const { adapter } = createAdapter();
			const { assetId } = await adapter.upload(makeFile(), SAMPLE_METADATA);

			const entry = await adapter.get(assetId);

			expect(entry).not.toBeNull();
			expect(entry!.src).toBe(SAMPLE_BASE64);
		});

		it("should return null for an unknown asset ID", async () => {
			const { adapter } = createAdapter();

			const entry = await adapter.get("nonexistent-id");

			expect(entry).toBeNull();
		});

		it("should accept numeric IDs coerced to strings", async () => {
			// resolve() calls get(String(id)) — verify get handles that gracefully
			const { adapter } = createAdapter();

			const entry = await adapter.get("42");

			expect(entry).toBeNull();
		});
	});

	describe("list", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return an empty array when the library is empty", async () => {
			const { adapter } = createAdapter();

			expect(await adapter.list()).toEqual([]);
		});

		it("should list all stored assets with their IDs", async () => {
			const { adapter } = createAdapter();
			const { assetId: id1 } = await adapter.upload(makeFile("a.jpg"), SAMPLE_METADATA);
			const { assetId: id2 } = await adapter.upload(makeFile("b.jpg"), SAMPLE_METADATA);

			const items = await adapter.list();

			expect(items).toHaveLength(2);
			const ids = items.map((i) => i.id);
			expect(ids).toContain(id1);
			expect(ids).toContain(id2);
		});

		it("should include the AssetEntry in each list item", async () => {
			const { adapter } = createAdapter();
			await adapter.upload(makeFile(), SAMPLE_METADATA);

			const [item] = await adapter.list();

			expect(item.entry.src).toBe(SAMPLE_BASE64);
			expect(item.entry.metadata.filename).toBe(SAMPLE_METADATA.filename);
		});
	});

	describe("delete", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should remove an existing asset and return true", async () => {
			const { adapter } = createAdapter();
			const { assetId } = await adapter.upload(makeFile(), SAMPLE_METADATA);

			const result = await adapter.delete(assetId);

			expect(result).toBe(true);
			expect(await adapter.get(assetId)).toBeNull();
		});

		it("should return false when the asset does not exist", async () => {
			const { adapter } = createAdapter();

			const result = await adapter.delete("nonexistent-id");

			expect(result).toBe(false);
		});

		it("should not affect other entries when deleting one", async () => {
			const { adapter } = createAdapter();
			const { assetId: id1 } = await adapter.upload(makeFile("a.jpg"), SAMPLE_METADATA);
			const { assetId: id2 } = await adapter.upload(makeFile("b.jpg"), SAMPLE_METADATA);

			await adapter.delete(id1);

			expect(await adapter.get(id1)).toBeNull();
			expect(await adapter.get(id2)).not.toBeNull();
		});

		it("should leave the library empty after deleting the last entry", async () => {
			const { adapter } = createAdapter();
			const { assetId } = await adapter.upload(makeFile(), SAMPLE_METADATA);

			await adapter.delete(assetId);

			expect(await adapter.list()).toHaveLength(0);
		});
	});

	describe("resolve", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should return an ImageSource for a known string ID", async () => {
			const { adapter } = createAdapter();
			const { assetId } = await adapter.upload(makeFile(), SAMPLE_METADATA);

			const source = await adapter.resolve(assetId);

			expect(source).not.toBeNull();
			expect(source!.src).toBe(SAMPLE_BASE64);
		});

		it("should accept numeric IDs by coercing them to strings", async () => {
			// resolve(number) must coerce to String(id) before calling get()
			let library: UJLCLibrary = {};
			const seedEntry: AssetEntry = {
				src: "data:image/png;base64,ABC",
				metadata: {
					filename: "img.png",
					width: 100,
					height: 100,
				},
			};
			// Use the updateLibrary closure exposed by createAdapter to seed a numeric-like key
			const getLibrary = () => library;
			const updateLibrary = (fn: (c: typeof library) => typeof library) => {
				library = fn(library);
			};
			const seededAdapter = new InlineLibraryProvider(getLibrary, updateLibrary);
			updateLibrary((current) => ({ ...current, "99": seedEntry }));

			const source = await seededAdapter.resolve(99);

			expect(source).not.toBeNull();
			expect(source!.src).toBe("data:image/png;base64,ABC");
		});

		it("should return null for an unknown ID", async () => {
			const { adapter } = createAdapter();

			const source = await adapter.resolve("unknown");

			expect(source).toBeNull();
		});
	});

	describe("immutability", () => {
		beforeEach(() => {
			vi.stubGlobal("FileReader", MockFileReader);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("should not mutate the previous library state", async () => {
			const { adapter, getLibrary } = createAdapter();
			const snapshot = getLibrary();

			await adapter.upload(makeFile(), SAMPLE_METADATA);

			// The original snapshot should still be empty
			expect(Object.keys(snapshot)).toHaveLength(0);
		});
	});
});
