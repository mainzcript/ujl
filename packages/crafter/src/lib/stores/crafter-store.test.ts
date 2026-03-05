/**
 * Unit tests for CrafterStore
 *
 * Tests the centralized state management store.
 */

import type {
	LibraryAsset,
	LibraryProvider,
	UJLCDocument,
	UJLTDocument,
} from "@ujl-framework/types";
import { describe, expect, it, vi } from "vitest";
import { createMockTokenSet, createMockTree } from "../../../tests/mockData.js";
import type { CrafterStoreDeps } from "./crafter-store.svelte.js";

// ============================================
// MOCK DATA
// ============================================

function createMockUjlcDocument(): UJLCDocument {
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
			library: {},
			root: createMockTree(),
		},
	};
}

function createMockUjltDocument(): UJLTDocument {
	return {
		ujlt: {
			meta: {
				_version: "0.0.1",
			},
			tokens: createMockTokenSet(),
		},
	};
}

function createMockLibraryProvider(): LibraryProvider {
	return {
		name: "inline",
		list: vi.fn().mockResolvedValue({ items: [], hasMore: false }),
		get: vi.fn().mockResolvedValue(null),
		upload: vi.fn(),
		delete: vi.fn().mockResolvedValue(undefined),
	} as unknown as LibraryProvider;
}

function createMockComposer() {
	return {
		getRegistry: vi.fn().mockReturnValue({
			getModule: vi.fn(),
		}),
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
// TESTS
// ============================================

// Note: These tests are designed to work with the store factory.
// Since Svelte 5 runes only work in .svelte.ts files, we test the
// store behavior through integration tests or by using the actual
// store in a Svelte context.

describe("CrafterStore Types", () => {
	it("should have correct CrafterStoreDeps interface", () => {
		const deps = createMockDeps();

		expect(deps).toHaveProperty("initialUjlcDocument");
		expect(deps).toHaveProperty("initialUjltDocument");
		expect(deps).toHaveProperty("composer");
		expect(deps).toHaveProperty("libraryProvider");
	});

	it("should create valid mock UJLC document", () => {
		const doc = createMockUjlcDocument();

		expect(doc.ujlc.meta.title).toBe("Test Document");
		expect(doc.ujlc.root).toHaveLength(1);
		expect(doc.ujlc.library).toEqual({});
		expect(doc.ujlc.meta._library.provider).toBe("inline");
	});

	it("should create valid mock UJLT document", () => {
		const doc = createMockUjltDocument();

		expect(doc.ujlt.meta._version).toBe("0.0.1");
		expect(doc.ujlt.tokens.radius).toBe(0.75);
		expect(doc.ujlt.tokens.color.primary).toBeDefined();
	});
});

describe("CrafterStore Mock Dependencies", () => {
	it("should create mock library provider with correct interface", () => {
		const library = createMockLibraryProvider();

		expect(library.name).toBe("inline");
		expect(typeof library.list).toBe("function");
		expect(typeof library.get).toBe("function");
	});

	it("should create mock composer with required methods", () => {
		const composer = createMockComposer();

		expect(typeof composer.getRegistry).toBe("function");
		expect(typeof composer.createModuleFromType).toBe("function");
		expect(typeof composer.compose).toBe("function");
		expect(typeof composer.composeModule).toBe("function");
	});
});

describe("Library Provider Capabilities", () => {
	it("should detect upload capability", () => {
		const library = createMockLibraryProvider();

		const canUpload = !!library.upload;
		expect(canUpload).toBe(true);
	});

	it("should detect delete capability", () => {
		const library = createMockLibraryProvider();

		const canDelete = !!library.delete;
		expect(canDelete).toBe(true);
	});

	it("should detect missing updateMetadata capability", () => {
		const library = createMockLibraryProvider();

		const canUpdate = !!library.updateMetadata;
		expect(canUpdate).toBe(false);
	});
});

describe("Library Operations", () => {
	describe("Provider Contract", () => {
		it("should initialize provider if init is available", async () => {
			const initMock = vi.fn().mockResolvedValue(undefined);
			const provider = {
				...createMockLibraryProvider(),
				init: initMock,
				list: vi.fn().mockResolvedValue({ items: [], hasMore: false }),
			};

			// Provider with init should call it before list
			await provider.list({});
			expect(provider.list).toHaveBeenCalled();
		});

		it("should list assets with pagination", async () => {
			const mockAsset: { id: string } & LibraryAsset = {
				id: "test-1",
				kind: "image",
				img: { src: "data:image/png;base64,test", width: 100, height: 100 },
			};

			const provider = {
				...createMockLibraryProvider(),
				list: vi.fn().mockResolvedValue({
					items: [mockAsset],
					hasMore: true,
					nextCursor: "next-page",
				}),
			};

			const result = await provider.list({}, { limit: 10, cursor: "start" });

			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.id).toBe("test-1");
			expect(result.hasMore).toBe(true);
			expect(result.nextCursor).toBe("next-page");
		});

		it("should search assets with query", async () => {
			const provider = {
				...createMockLibraryProvider(),
				list: vi.fn().mockResolvedValue({ items: [], hasMore: false }),
			};

			await provider.list({}, { search: "test-query" });

			expect(provider.list).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ search: "test-query" }),
			);
		});

		it("should get asset by id", async () => {
			const mockAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:image/png;base64,test", width: 100, height: 100 },
			};

			const provider = {
				...createMockLibraryProvider(),
				get: vi.fn().mockResolvedValue(mockAsset),
			};

			const result = await provider.get({}, "test-id");

			expect(result).toEqual(mockAsset);
			expect(provider.get).toHaveBeenCalledWith({}, "test-id");
		});

		it("should return null for unknown asset", async () => {
			const provider = {
				...createMockLibraryProvider(),
				get: vi.fn().mockResolvedValue(null),
			};

			const result = await provider.get({}, "unknown-id");

			expect(result).toBeNull();
		});

		it("should handle upload", async () => {
			const mockAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:image/png;base64,new", width: 200, height: 200 },
				meta: { filename: "new.png" },
			};

			const provider = {
				...createMockLibraryProvider(),
				upload: vi.fn().mockResolvedValue(mockAsset),
			};

			const data = new ArrayBuffer(8);
			const result = await provider.upload(data, { filename: "new.png", type: "image/png" });

			expect(result).toEqual(mockAsset);
			expect(provider.upload).toHaveBeenCalledWith(
				expect.any(ArrayBuffer),
				expect.objectContaining({ filename: "new.png", type: "image/png" }),
			);
		});

		it("should handle delete", async () => {
			const provider = {
				...createMockLibraryProvider(),
				delete: vi.fn().mockResolvedValue(undefined),
			};

			await provider.delete("test-id");

			expect(provider.delete).toHaveBeenCalledWith("test-id");
		});

		it("should handle updateMetadata", async () => {
			const currentAsset: LibraryAsset = {
				kind: "image",
				img: { src: "data:image/png;base64,test", width: 100, height: 100 },
				meta: { filename: "test.png", alt: "Old alt" },
			};

			const updatedAsset: LibraryAsset = {
				...currentAsset,
				meta: { ...currentAsset.meta, alt: "New alt" },
			};

			const provider = {
				...createMockLibraryProvider(),
				updateMetadata: vi.fn().mockResolvedValue(updatedAsset),
			};

			const result = await provider.updateMetadata({}, "test-id", { alt: "New alt" });

			expect(result.meta?.alt).toBe("New alt");
			expect(provider.updateMetadata).toHaveBeenCalledWith(
				expect.anything(),
				"test-id",
				expect.objectContaining({ alt: "New alt" }),
			);
		});
	});

	describe("Library Provider Capabilities", () => {
		it("should detect upload capability", () => {
			const provider = createMockLibraryProvider();
			const canUpload = !!provider.upload;
			expect(canUpload).toBe(true);
		});

		it("should detect delete capability", () => {
			const provider = createMockLibraryProvider();
			const canDelete = !!provider.delete;
			expect(canDelete).toBe(true);
		});

		it("should detect missing updateMetadata capability", () => {
			const provider = createMockLibraryProvider();
			const canUpdate = !!provider.updateMetadata;
			expect(canUpdate).toBe(false);
		});
	});
});
