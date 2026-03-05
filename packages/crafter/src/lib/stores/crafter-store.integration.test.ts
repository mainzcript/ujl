/**
 * Integration tests for CrafterStore library operations
 *
 * These tests use a Svelte component wrapper to test the actual store
 * with real Svelte 5 runes, verifying the full reactive behavior.
 */

import { cleanup, render } from "@testing-library/svelte";
import type {
	LibraryAsset,
	LibraryProvider,
	UJLCDocument,
	UJLTDocument,
} from "@ujl-framework/types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMockTokenSet, createMockTree } from "../../../tests/mockData.js";
import TestWrapper from "./crafter-store-wrapper.svelte";
import type { CrafterStoreDeps } from "./crafter-store.svelte.js";
import type { CrafterContext } from "./index.js";

// ============================================
// MOCK DATA FACTORIES
// ============================================

function createMockUjlcDocument(library: Record<string, LibraryAsset> = {}): UJLCDocument {
	return {
		ujlc: {
			meta: {
				title: "Test Document",
				description: "Test Description",
				tags: ["test"],
				updated_at: "2024-01-01T00:00:00Z",
				_version: "0.0.1",
				_instance: "test-001",
				_embedding_model_hash: "test-hash",
				_library: { provider: "inline" },
			},
			library,
			root: createMockTree(),
		},
	};
}

function createMockUjltDocument(): UJLTDocument {
	return {
		ujlt: {
			meta: { _version: "0.0.1" },
			tokens: createMockTokenSet(),
		},
	};
}

function createMockLibraryProvider(overrides?: Partial<LibraryProvider>): LibraryProvider {
	return {
		name: "mock",
		list: vi.fn().mockResolvedValue({ items: [], hasMore: false }),
		get: vi.fn().mockResolvedValue(null),
		upload: vi.fn(),
		delete: vi.fn().mockResolvedValue(undefined),
		updateMetadata: vi.fn(),
		...overrides,
	};
}

function createMockComposer() {
	return {
		getRegistry: vi.fn().mockReturnValue({ getModule: vi.fn() }),
		createModuleFromType: vi.fn().mockImplementation((type: string, id: string) => ({
			type,
			meta: { id, updated_at: new Date().toISOString(), _embedding: [] },
			fields: {},
			slots: {},
		})),
		compose: vi.fn().mockResolvedValue({ type: "root", children: [] }),
		composeModule: vi.fn().mockResolvedValue({ type: "test", children: [] }),
	} as unknown as import("@ujl-framework/core").Composer;
}

function createMockDeps(overrides?: Partial<CrafterStoreDeps>): CrafterStoreDeps {
	return {
		initialUjlcDocument: createMockUjlcDocument(),
		initialUjltDocument: createMockUjltDocument(),
		composer: createMockComposer(),
		libraryProvider: createMockLibraryProvider(),
		...overrides,
	};
}

// ============================================
// TEST HELPERS
// ============================================

async function renderStore(deps: CrafterStoreDeps): Promise<CrafterContext> {
	let store: CrafterContext | undefined;

	render(TestWrapper, {
		deps,
		onStoreReady: (s) => {
			store = s;
		},
	});

	// Wait for effect to run
	await new Promise((resolve) => setTimeout(resolve, 10));

	if (!store) {
		throw new Error("Store not initialized");
	}

	return store;
}

// ============================================
// TESTS
// ============================================

describe("CrafterStore Library Operations - Integration", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	describe("loadMoreLibraryItems", () => {
		it("should append items and advance cursor", async () => {
			// Type for items returned from provider (with ID)
			type LibraryItem = { id: string } & LibraryAsset;

			const mockItems: LibraryItem[] = [
				{
					id: "img-1",
					kind: "image",
					img: { src: "data:test1", width: 100, height: 100 },
					meta: { filename: "test1.png" },
				},
				{
					id: "img-2",
					kind: "image",
					img: { src: "data:test2", width: 200, height: 200 },
					meta: { filename: "test2.png" },
				},
			];

			const provider = createMockLibraryProvider({
				list: vi.fn().mockResolvedValue({
					items: mockItems,
					hasMore: true,
					nextCursor: "page2",
				}),
			});

			const store = await renderStore(createMockDeps({ libraryProvider: provider }));

			// Initial state
			expect(store.libraryItems).toHaveLength(0);

			// Load first page
			await store.loadMoreLibraryItems(2);

			// Should have items
			expect(store.libraryItems).toHaveLength(2);
			expect(store.libraryItems[0]?.id).toBe("img-1");
			expect(store.libraryHasMore).toBe(true);

			// Provider called with correct params
			expect(provider.list).toHaveBeenCalledWith(
				{}, // empty library initially
				{ limit: 2, cursor: undefined },
			);
		});

		it("should append subsequent pages", async () => {
			const page1Items = [
				{
					id: "img-1",
					kind: "image" as const,
					img: { src: "data:1", width: 100, height: 100 },
					meta: { filename: "1.png" },
				},
			];
			const page2Items = [
				{
					id: "img-2",
					kind: "image" as const,
					img: { src: "data:2", width: 100, height: 100 },
					meta: { filename: "2.png" },
				},
			];

			let callCount = 0;
			const provider = createMockLibraryProvider({
				list: vi.fn().mockImplementation(() => {
					callCount++;
					if (callCount === 1) {
						return Promise.resolve({
							items: page1Items,
							hasMore: true,
							nextCursor: "page2",
						});
					}
					return Promise.resolve({
						items: page2Items,
						hasMore: false,
						nextCursor: undefined,
					});
				}),
			});

			const store = await renderStore(createMockDeps({ libraryProvider: provider }));

			// Load first page
			await store.loadMoreLibraryItems(1);
			expect(store.libraryItems).toHaveLength(1);

			// Load second page - should append
			await store.loadMoreLibraryItems(1);
			expect(store.libraryItems).toHaveLength(2);
			expect(store.libraryItems[1]?.id).toBe("img-2");

			// Second call should use cursor
			expect(provider.list).toHaveBeenLastCalledWith(
				{},
				expect.objectContaining({ cursor: "page2" }),
			);
		});
	});

	describe("searchLibraryItems", () => {
		it("should reset pagination and search", async () => {
			const searchResults: Array<{ id: string } & LibraryAsset> = [
				{
					id: "search-1",
					kind: "image",
					img: { src: "data:search", width: 100, height: 100 },
					meta: { filename: "search-result.png" },
				} as { id: string } & LibraryAsset,
			];

			const provider = createMockLibraryProvider({
				list: vi.fn().mockResolvedValue({
					items: searchResults,
					hasMore: false,
				}),
			});

			const store = await renderStore(createMockDeps({ libraryProvider: provider }));

			// Add some initial items
			await store.loadMoreLibraryItems(10);

			// Reset and search
			await store.searchLibraryItems("vacation");

			// Should have search results only
			expect(store.libraryItems).toHaveLength(1);
			expect(store.libraryItems[0]?.id).toBe("search-1");

			// Called with search term
			expect(provider.list).toHaveBeenCalledWith(
				{},
				expect.objectContaining({ search: "vacation" }),
			);
		});
	});

	describe("selectLibraryAsset", () => {
		it("should persist remote asset into doc.ujlc.library", async () => {
			const remoteAsset: { id: string } & LibraryAsset = {
				id: "remote-123",
				kind: "image",
				img: { src: "data:remote", width: 800, height: 600 },
				meta: { filename: "remote.png" },
			} as { id: string } & LibraryAsset;

			const provider = createMockLibraryProvider({
				list: vi.fn().mockResolvedValue({
					items: [remoteAsset],
					hasMore: false,
				}),
			});

			const store = await renderStore(createMockDeps({ libraryProvider: provider }));

			// Load items to populate cache
			await store.loadMoreLibraryItems(10);

			// Verify asset is NOT in document library initially
			expect(store.libraryData["remote-123"]).toBeUndefined();

			// Select the asset
			const selectedId = await store.selectLibraryAsset("remote-123");

			// Should return same ID
			expect(selectedId).toBe("remote-123");

			// Verify asset IS now in document library
			expect(store.libraryData["remote-123"]).toBeDefined();
			expect(store.libraryData["remote-123"]?.meta?.filename).toBe("remote.png");
		});

		it("should return immediately if asset already in library", async () => {
			const existingAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:existing", width: 100, height: 100 },
				meta: { filename: "existing.png" },
			} as LibraryAsset;

			const provider = createMockLibraryProvider({
				get: vi.fn().mockResolvedValue(existingAsset),
			});

			const store = await renderStore(
				createMockDeps({
					libraryProvider: provider,
					initialUjlcDocument: createMockUjlcDocument({
						"existing-456": existingAsset,
					}),
				}),
			);

			// Select existing asset
			const selectedId = await store.selectLibraryAsset("existing-456");

			// Should return immediately
			expect(selectedId).toBe("existing-456");
			// get should not be called
			expect(provider.get).not.toHaveBeenCalled();
		});
	});

	describe("uploadLibraryAsset", () => {
		it("should write into library and prepend cache", async () => {
			const uploadedAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:uploaded", width: 1920, height: 1080 },
				meta: { filename: "uploaded.png", fileSize: 1024 },
			} as LibraryAsset;

			const provider = createMockLibraryProvider({
				upload: vi.fn().mockResolvedValue(uploadedAsset),
			});

			const store = await renderStore(createMockDeps({ libraryProvider: provider }));

			// Create a mock file
			const mockFile = new File([new Uint8Array(1024)], "uploaded.png", { type: "image/png" });

			// Upload
			const result = await store.uploadLibraryAsset(mockFile);

			// Verify result has ID
			expect(result.id).toBeDefined();
			expect(typeof result.id).toBe("string");

			// Verify in document library
			expect(store.libraryData[result.id]).toBeDefined();
			expect(store.libraryData[result.id]?.meta?.filename).toBe("uploaded.png");

			// Verify prepended to cache
			expect(store.libraryItems[0]?.id).toBe(result.id);
		});
	});

	describe("deleteLibraryAsset", () => {
		it("should remove from library and cache", async () => {
			const assetToDelete: LibraryAsset = {
				kind: "image",
				img: { src: "data:delete", width: 100, height: 100 },
				meta: { filename: "delete.png" },
			} as LibraryAsset;

			const provider = createMockLibraryProvider({
				delete: vi.fn().mockResolvedValue(undefined),
			});

			const store = await renderStore(
				createMockDeps({
					libraryProvider: provider,
					initialUjlcDocument: createMockUjlcDocument({
						"delete-789": assetToDelete,
					}),
				}),
			);

			// Verify exists initially
			expect(store.libraryData["delete-789"]).toBeDefined();

			// Delete
			await store.deleteLibraryAsset("delete-789");

			// Verify removed from document library
			expect(store.libraryData["delete-789"]).toBeUndefined();
		});
	});

	describe("updateLibraryMetadata", () => {
		it("should update both library and cache", async () => {
			const originalAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:orig", width: 100, height: 100 },
				meta: { filename: "orig.png", alt: "Old alt" },
			} as LibraryAsset;

			const updatedAsset: LibraryAsset = {
				...originalAsset,
				meta: { ...originalAsset.meta, alt: "New alt", caption: "New caption" },
			};

			const provider = createMockLibraryProvider({
				updateMetadata: vi.fn().mockResolvedValue(updatedAsset),
				list: vi.fn().mockResolvedValue({
					items: [{ id: "update-abc", ...originalAsset }],
					hasMore: false,
				}),
			});

			const store = await renderStore(
				createMockDeps({
					libraryProvider: provider,
					initialUjlcDocument: createMockUjlcDocument({
						"update-abc": originalAsset,
					}),
				}),
			);

			// Load to populate cache
			await store.loadMoreLibraryItems(10);

			// Verify initial state
			expect(store.libraryData["update-abc"]?.meta?.alt).toBe("Old alt");
			expect(store.libraryItems[0]?.meta?.alt).toBe("Old alt");

			// Update metadata
			await store.updateLibraryMetadata("update-abc", { alt: "New alt", caption: "New caption" });

			// Verify updated in document library
			expect(store.libraryData["update-abc"]?.meta?.alt).toBe("New alt");
			expect(store.libraryData["update-abc"]?.meta?.caption).toBe("New caption");

			// Verify updated in cache
			expect(store.libraryItems[0]?.meta?.alt).toBe("New alt");
		});
	});

	describe("setUjlcDocument", () => {
		it("should reset expanded node set with a new reactive Set instance", async () => {
			const store = await renderStore(createMockDeps());

			store.setNodeExpanded("node-a", true);
			expect(store.expandedNodeIds.has("node-a")).toBe(true);
			const expandedBeforeReset = store.expandedNodeIds;

			store.setUjlcDocument(createMockUjlcDocument());

			expect(store.expandedNodeIds.size).toBe(0);
			expect(store.expandedNodeIds).not.toBe(expandedBeforeReset);
		});
	});
});
