import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import { describe, expect, it, vi } from "vitest";
import type { Composer } from "../composer.js";
import { TextField } from "../fields/concretes/text-field.js";
import { ModuleBase } from "./base.js";
import { ModuleRegistry } from "./registry.js";

// ============================================
// TEST HELPERS
// ============================================

class MockModule extends ModuleBase {
	public readonly name: string;
	public readonly label: string;
	public readonly description = "A mock module for testing";
	public readonly category = "content" as const;
	public readonly tags = ["test"] as const;
	public readonly icon = '<rect width="16" height="16"/>';
	public readonly fields = [
		{
			key: "title",
			field: new TextField({ label: "Title", description: "Title field", default: "Hello" }),
		},
	];
	public readonly slots = [];

	constructor(name = "mock", label = "Mock") {
		super();
		this.name = name;
		this.label = label;
	}

	public compose(_moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		return { type: "text", id: "test-id", props: {} };
	}
}

function createRegistry(): ModuleRegistry {
	return new ModuleRegistry();
}

// ============================================
// TESTS
// ============================================

describe("ModuleRegistry", () => {
	describe("registerModule", () => {
		it("should register a module successfully", () => {
			const registry = createRegistry();
			const module = new MockModule();

			registry.registerModule(module);

			expect(registry.getModule("mock")).toBe(module);
		});

		it("should throw when registering a duplicate module name", () => {
			const registry = createRegistry();

			registry.registerModule(new MockModule("alpha"));

			expect(() => registry.registerModule(new MockModule("alpha"))).toThrowError(
				"Module alpha already registered",
			);
		});

		it("should allow registering multiple modules with different names", () => {
			const registry = createRegistry();

			registry.registerModule(new MockModule("alpha"));
			registry.registerModule(new MockModule("beta"));

			expect(registry.getAllModules()).toHaveLength(2);
		});
	});

	describe("unregisterModule", () => {
		it("should remove a module by instance", () => {
			const registry = createRegistry();
			const module = new MockModule();
			registry.registerModule(module);

			registry.unregisterModule(module);

			expect(registry.getModule("mock")).toBeUndefined();
		});

		it("should remove a module by name string", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));

			registry.unregisterModule("alpha");

			expect(registry.getModule("alpha")).toBeUndefined();
		});

		it("should not throw when unregistering an unknown module name", () => {
			const registry = createRegistry();

			expect(() => registry.unregisterModule("nonexistent")).not.toThrow();
		});

		it("should only remove the targeted module", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));
			registry.registerModule(new MockModule("beta"));

			registry.unregisterModule("alpha");

			expect(registry.getModule("alpha")).toBeUndefined();
			expect(registry.getModule("beta")).toBeDefined();
		});
	});

	describe("hasModule", () => {
		it("should return true for a registered module", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));

			expect(registry.hasModule("alpha")).toBe(true);
		});

		it("should return false for an unknown module", () => {
			const registry = createRegistry();

			expect(registry.hasModule("nonexistent")).toBe(false);
		});

		it("should return false after a module has been unregistered", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));
			registry.unregisterModule("alpha");

			expect(registry.hasModule("alpha")).toBe(false);
		});
	});

	describe("getModule", () => {
		it("should return the module for a known name", () => {
			const registry = createRegistry();
			const module = new MockModule("alpha");
			registry.registerModule(module);

			expect(registry.getModule("alpha")).toBe(module);
		});

		it("should return undefined for an unknown name", () => {
			const registry = createRegistry();

			expect(registry.getModule("nonexistent")).toBeUndefined();
		});
	});

	describe("getAllModules", () => {
		it("should return an empty array for an empty registry", () => {
			const registry = createRegistry();

			expect(registry.getAllModules()).toEqual([]);
		});

		it("should return all registered modules", () => {
			const registry = createRegistry();
			const alpha = new MockModule("alpha");
			const beta = new MockModule("beta");
			registry.registerModule(alpha);
			registry.registerModule(beta);

			const all = registry.getAllModules();

			expect(all).toContain(alpha);
			expect(all).toContain(beta);
			expect(all).toHaveLength(2);
		});

		it("should return an independent copy that does not affect the registry", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));

			const copy = registry.getAllModules();
			copy.push(new MockModule("injected"));

			expect(registry.getAllModules()).toHaveLength(1);
		});
	});

	describe("createModuleFromType", () => {
		it("should create a module object with default field values", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule());

			const result = registry.createModuleFromType("mock", "test-id-1");

			expect(result.type).toBe("mock");
			expect(result.meta.id).toBe("test-id-1");
			expect(result.fields["title"]).toBe("Hello");
		});

		it("should create empty slots for each slot entry", () => {
			const registry = createRegistry();

			class ModuleWithSlot extends MockModule {
				public readonly name = "slotted";
				public readonly slots = [
					{
						key: "body",
						slot: { parse: (v: unknown) => v, config: {} } as never,
					},
				];
			}

			registry.registerModule(new ModuleWithSlot());

			const result = registry.createModuleFromType("slotted", "test-id-2");

			expect(result.slots["body"]).toEqual([]);
		});

		it("should set a valid ISO timestamp in meta.updated_at", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule());

			const result = registry.createModuleFromType("mock", "ts-test");

			expect(() => new Date(result.meta.updated_at)).not.toThrow();
			expect(new Date(result.meta.updated_at).toISOString()).toBe(result.meta.updated_at);
		});

		it("should throw for an unknown module type", () => {
			const registry = createRegistry();

			expect(() => registry.createModuleFromType("nonexistent", "id-x")).toThrowError(
				'Module type "nonexistent" not found in registry',
			);
		});
	});

	describe("onChanged", () => {
		it("should notify listeners when a module is registered", () => {
			const registry = createRegistry();
			const listener = vi.fn();
			registry.onChanged(listener);

			registry.registerModule(new MockModule());

			expect(listener).toHaveBeenCalledOnce();
		});

		it("should notify listeners when a module is unregistered", () => {
			const registry = createRegistry();
			registry.registerModule(new MockModule("alpha"));
			const listener = vi.fn();
			registry.onChanged(listener);

			registry.unregisterModule("alpha");

			expect(listener).toHaveBeenCalledOnce();
		});

		it("should not notify when unregistering an unknown module", () => {
			const registry = createRegistry();
			const listener = vi.fn();
			registry.onChanged(listener);

			registry.unregisterModule("nonexistent");

			expect(listener).not.toHaveBeenCalled();
		});

		it("should support multiple listeners", () => {
			const registry = createRegistry();
			const listenerA = vi.fn();
			const listenerB = vi.fn();
			registry.onChanged(listenerA);
			registry.onChanged(listenerB);

			registry.registerModule(new MockModule());

			expect(listenerA).toHaveBeenCalledOnce();
			expect(listenerB).toHaveBeenCalledOnce();
		});

		it("should stop notifying after unsubscribe", () => {
			const registry = createRegistry();
			const listener = vi.fn();
			const unsubscribe = registry.onChanged(listener);

			unsubscribe();
			registry.registerModule(new MockModule());

			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("generateLabelFromName", () => {
		it("should capitalize a single-word name", () => {
			expect(ModuleRegistry.generateLabelFromName("text")).toBe("Text");
		});

		it("should convert a hyphenated name to title case", () => {
			expect(ModuleRegistry.generateLabelFromName("call-to-action")).toBe("Call To Action");
		});

		it("should handle a two-word name", () => {
			expect(ModuleRegistry.generateLabelFromName("hero-banner")).toBe("Hero Banner");
		});
	});
});
