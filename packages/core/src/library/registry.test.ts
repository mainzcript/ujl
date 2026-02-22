import type { AssetEntry, AssetMetadata, ImageSource, UJLCLibrary } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import type { ConnectionStatus, UpdateLibraryFn, UploadResult } from "./base.js";
import { LibraryBase } from "./base.js";
import { InlineLibraryProvider } from "./inline-provider.js";
import { createDefaultLibraryRegistry, LibraryRegistry } from "./registry.js";

// ============================================
// TEST HELPERS
// ============================================

class MockProvider extends LibraryBase {
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
	describe("registerProvider", () => {
		it("should register a provider successfully", () => {
			const registry = new LibraryRegistry();
			const provider = new MockProvider("inline");

			registry.registerProvider(provider);

			expect(registry.getProvider("inline")).toBe(provider);
		});

		it("should throw when registering a duplicate provider name", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));

			expect(() => registry.registerProvider(new MockProvider("inline"))).toThrowError(
				'Library provider "inline" is already registered',
			);
		});

		it("should allow registering multiple providers with different names", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));
			registry.registerProvider(new MockProvider("backend"));

			expect(registry.getAllProviders()).toHaveLength(2);
		});
	});

	describe("unregisterProvider", () => {
		it("should remove a provider by instance", () => {
			const registry = new LibraryRegistry();
			const provider = new MockProvider("inline");
			registry.registerProvider(provider);

			registry.unregisterProvider(provider);

			expect(registry.getProvider("inline")).toBeUndefined();
		});

		it("should remove a provider by name string", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));

			registry.unregisterProvider("inline");

			expect(registry.getProvider("inline")).toBeUndefined();
		});

		it("should not throw when unregistering an unknown provider name", () => {
			const registry = new LibraryRegistry();

			expect(() => registry.unregisterProvider("nonexistent")).not.toThrow();
		});

		it("should not throw when unregistering an unknown provider instance", () => {
			const registry = new LibraryRegistry();
			const orphan = new MockProvider("orphan");

			expect(() => registry.unregisterProvider(orphan)).not.toThrow();
		});

		it("should only remove the targeted provider", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));
			registry.registerProvider(new MockProvider("backend"));

			registry.unregisterProvider("inline");

			expect(registry.getProvider("inline")).toBeUndefined();
			expect(registry.getProvider("backend")).toBeDefined();
		});
	});

	describe("hasProvider", () => {
		it("should return true for a registered provider", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));

			expect(registry.hasProvider("inline")).toBe(true);
		});

		it("should return false for an unknown provider", () => {
			const registry = new LibraryRegistry();

			expect(registry.hasProvider("nonexistent")).toBe(false);
		});

		it("should return false after a provider has been unregistered", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));
			registry.unregisterProvider("inline");

			expect(registry.hasProvider("inline")).toBe(false);
		});
	});

	describe("getProvider", () => {
		it("should return the provider for a known name", () => {
			const registry = new LibraryRegistry();
			const provider = new MockProvider("inline");
			registry.registerProvider(provider);

			expect(registry.getProvider("inline")).toBe(provider);
		});

		it("should return undefined for an unknown name", () => {
			const registry = new LibraryRegistry();

			expect(registry.getProvider("nonexistent")).toBeUndefined();
		});
	});

	describe("getAllProviders", () => {
		it("should return an empty array for an empty registry", () => {
			const registry = new LibraryRegistry();

			expect(registry.getAllProviders()).toEqual([]);
		});

		it("should return all registered providers", () => {
			const registry = new LibraryRegistry();
			const inline = new MockProvider("inline");
			const backend = new MockProvider("backend");
			registry.registerProvider(inline);
			registry.registerProvider(backend);

			const all = registry.getAllProviders();

			expect(all).toContain(inline);
			expect(all).toContain(backend);
			expect(all).toHaveLength(2);
		});

		it("should return an independent copy that does not affect the registry", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));

			const copy = registry.getAllProviders();
			copy.push(new MockProvider("injected"));

			expect(registry.getAllProviders()).toHaveLength(1);
		});
	});

	describe("re-registration after unregistration", () => {
		it("should allow re-registering a provider after it has been removed", () => {
			const registry = new LibraryRegistry();
			registry.registerProvider(new MockProvider("inline"));
			registry.unregisterProvider("inline");

			const newProvider = new MockProvider("inline");
			registry.registerProvider(newProvider);

			expect(registry.getProvider("inline")).toBe(newProvider);
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

		expect(registry.hasProvider("inline")).toBe(true);
		expect(registry.getProvider("inline")).toBeInstanceOf(InlineLibraryProvider);
	});

	it("should allow registering additional providers on top", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		registry.registerProvider(new MockProvider("backend"));

		expect(registry.hasProvider("backend")).toBe(true);
		expect(registry.getAllProviders()).toHaveLength(2);
	});

	it("should throw if 'inline' is registered again", () => {
		const { getLibrary, updateLibrary } = makeLibraryStore();
		const registry = createDefaultLibraryRegistry(getLibrary, updateLibrary);

		expect(() => registry.registerProvider(new MockProvider("inline"))).toThrowError(
			'Library provider "inline" is already registered',
		);
	});
});
