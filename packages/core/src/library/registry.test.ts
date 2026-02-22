import type { AssetEntry, AssetMetadata, ImageSource, UJLCLibrary } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import type { ConnectionStatus, UpdateLibraryFn, UploadResult } from "./base.js";
import { LibraryBase } from "./base.js";
import { InlineLibraryProvider } from "./inline-provider.js";
import { createDefaultLibraryRegistry, LibraryRegistry } from "./registry.js";

// ============================================
// TEST HELPERS
// ============================================

class MockAdapter extends LibraryBase {
	public readonly name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	public async checkConnection(): Promise<ConnectionStatus> {
		return { connected: true };
	}

	public async upload(_file: File, _metadata: AssetMetadata): Promise<UploadResult> {
		return {
			assetId: "mock-id",
			entry: { src: "data:image/png;base64,ABC", metadata: _metadata },
		};
	}

	public async get(_assetId: string): Promise<AssetEntry | null> {
		return null;
	}

	public async list(): Promise<Array<{ id: string; entry: AssetEntry }>> {
		return [];
	}

	public async delete(_assetId: string): Promise<boolean> {
		return false;
	}

	public async resolve(_id: string | number): Promise<ImageSource | null> {
		return null;
	}
}

// ============================================
// TESTS
// ============================================

describe("LibraryRegistry", () => {
	describe("registerAdapter", () => {
		it("should register an adapter successfully", () => {
			const registry = new LibraryRegistry();
			const adapter = new MockAdapter("inline");

			registry.registerAdapter(adapter);

			expect(registry.getAdapter("inline")).toBe(adapter);
		});

		it("should throw when registering a duplicate adapter name", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));

			expect(() => registry.registerAdapter(new MockAdapter("inline"))).toThrowError(
				'Library adapter "inline" is already registered',
			);
		});

		it("should allow registering multiple adapters with different names", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));
			registry.registerAdapter(new MockAdapter("backend"));

			expect(registry.getAllAdapters()).toHaveLength(2);
		});
	});

	describe("unregisterAdapter", () => {
		it("should remove an adapter by instance", () => {
			const registry = new LibraryRegistry();
			const adapter = new MockAdapter("inline");
			registry.registerAdapter(adapter);

			registry.unregisterAdapter(adapter);

			expect(registry.getAdapter("inline")).toBeUndefined();
		});

		it("should remove an adapter by name string", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));

			registry.unregisterAdapter("inline");

			expect(registry.getAdapter("inline")).toBeUndefined();
		});

		it("should not throw when unregistering an unknown adapter name", () => {
			const registry = new LibraryRegistry();

			expect(() => registry.unregisterAdapter("nonexistent")).not.toThrow();
		});

		it("should not throw when unregistering an unknown adapter instance", () => {
			const registry = new LibraryRegistry();
			const orphan = new MockAdapter("orphan");

			expect(() => registry.unregisterAdapter(orphan)).not.toThrow();
		});

		it("should only remove the targeted adapter", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));
			registry.registerAdapter(new MockAdapter("backend"));

			registry.unregisterAdapter("inline");

			expect(registry.getAdapter("inline")).toBeUndefined();
			expect(registry.getAdapter("backend")).toBeDefined();
		});
	});

	describe("hasAdapter", () => {
		it("should return true for a registered adapter", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));

			expect(registry.hasAdapter("inline")).toBe(true);
		});

		it("should return false for an unknown adapter", () => {
			const registry = new LibraryRegistry();

			expect(registry.hasAdapter("nonexistent")).toBe(false);
		});

		it("should return false after an adapter has been unregistered", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));
			registry.unregisterAdapter("inline");

			expect(registry.hasAdapter("inline")).toBe(false);
		});
	});

	describe("getAdapter", () => {
		it("should return the adapter for a known name", () => {
			const registry = new LibraryRegistry();
			const adapter = new MockAdapter("inline");
			registry.registerAdapter(adapter);

			expect(registry.getAdapter("inline")).toBe(adapter);
		});

		it("should return undefined for an unknown name", () => {
			const registry = new LibraryRegistry();

			expect(registry.getAdapter("nonexistent")).toBeUndefined();
		});
	});

	describe("getAllAdapters", () => {
		it("should return an empty array for an empty registry", () => {
			const registry = new LibraryRegistry();

			expect(registry.getAllAdapters()).toEqual([]);
		});

		it("should return all registered adapters", () => {
			const registry = new LibraryRegistry();
			const inline = new MockAdapter("inline");
			const backend = new MockAdapter("backend");
			registry.registerAdapter(inline);
			registry.registerAdapter(backend);

			const all = registry.getAllAdapters();

			expect(all).toContain(inline);
			expect(all).toContain(backend);
			expect(all).toHaveLength(2);
		});

		it("should return an independent copy that does not affect the registry", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));

			const copy = registry.getAllAdapters();
			copy.push(new MockAdapter("injected"));

			expect(registry.getAllAdapters()).toHaveLength(1);
		});
	});

	describe("re-registration after unregistration", () => {
		it("should allow re-registering an adapter after it has been removed", () => {
			const registry = new LibraryRegistry();
			registry.registerAdapter(new MockAdapter("inline"));
			registry.unregisterAdapter("inline");

			const newAdapter = new MockAdapter("inline");
			registry.registerAdapter(newAdapter);

			expect(registry.getAdapter("inline")).toBe(newAdapter);
		});
	});
});

// ============================================
// TESTS — createDefaultLibraryRegistry
// ============================================

describe("createDefaultLibraryRegistry", () => {
	function makeLibraryStore() {
		let library: UJLCLibrary = {};
		const getLibrary = () => library;
		const updateLibrary: UpdateLibraryFn = (fn) => {
			library = fn(library);
		};
		return { getLibrary, updateLibrary };
	}

	it("should return a LibraryRegistry instance", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		expect(registry).toBeInstanceOf(LibraryRegistry);
	});

	it("should pre-register an InlineLibraryProvider", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		expect(registry.hasAdapter("inline")).toBe(true);
		expect(registry.getAdapter("inline")).toBeInstanceOf(InlineLibraryProvider);
	});

	it("should allow registering additional adapters on top", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		registry.registerAdapter(new MockAdapter("backend"));

		expect(registry.hasAdapter("backend")).toBe(true);
		expect(registry.getAllAdapters()).toHaveLength(2);
	});

	it("should throw if 'inline' is registered again", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		expect(() => registry.registerAdapter(new MockAdapter("inline"))).toThrowError(
			'Library adapter "inline" is already registered',
		);
	});
});
