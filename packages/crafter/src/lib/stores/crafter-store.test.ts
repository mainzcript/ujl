/**
 * Unit tests for CrafterStore
 *
 * Tests the centralized state management store.
 */

import type { LibraryBase } from "@ujl-framework/core";
import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";
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

function createMockLibrary(): LibraryBase {
	return {
		name: "inline",
		checkConnection: vi.fn().mockResolvedValue({ connected: true }),
		upload: vi.fn(),
		get: vi.fn().mockResolvedValue(null),
		list: vi.fn().mockResolvedValue([]),
		delete: vi.fn().mockResolvedValue(true),
		resolve: vi.fn().mockResolvedValue(null),
	} as unknown as LibraryBase;
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
	} as unknown as import("@ujl-framework/core").Composer;
}

function createMockDeps(overrides?: Partial<CrafterStoreDeps>): CrafterStoreDeps {
	return {
		initialUjlcDocument: createMockUjlcDocument(),
		initialUjltDocument: createMockUjltDocument(),
		composer: createMockComposer(),
		library: createMockLibrary(),
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
		expect(deps).toHaveProperty("library");
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
	it("should create mock library provider", () => {
		const library = createMockLibrary();

		expect(library.name).toBe("inline");
		expect(library.checkConnection).toBeDefined();
		expect(library.upload).toBeDefined();
		expect(library.get).toBeDefined();
		expect(library.list).toBeDefined();
		expect(library.delete).toBeDefined();
		expect(library.resolve).toBeDefined();
	});

	it("should create mock composer", () => {
		const composer = createMockComposer();

		expect(composer.getRegistry).toBeDefined();
		expect(composer.createModuleFromType).toBeDefined();

		// Test createModuleFromType
		const node = composer.createModuleFromType("text", "test-id");
		expect(node.type).toBe("text");
		expect(node.meta.id).toBe("test-id");
	});
});

describe("Operations", () => {
	// Note: Operations are tested in the existing context.test.ts
	// These tests verify the operations module is correctly extracted

	it("should export createOperations function", async () => {
		const { createOperations } = await import("./operations.js");
		expect(typeof createOperations).toBe("function");
	});

	it("should export CrafterOperations type", async () => {
		// Type-only test - if this compiles, the type is exported correctly
		const operations: import("./operations.js").CrafterOperations = {
			copyNode: vi.fn(),
			moveNode: vi.fn(),
			reorderNode: vi.fn(),
			deleteNode: vi.fn(),
			cutNode: vi.fn(),
			pasteNode: vi.fn(),
			insertNode: vi.fn(),
			copySlot: vi.fn(),
			cutSlot: vi.fn(),
			pasteSlot: vi.fn(),
			moveSlot: vi.fn(),
			updateNodeField: vi.fn(),
			updateNodeFields: vi.fn(),
		};

		expect(operations).toBeDefined();
	});
});
