import type { UJLCModuleObject } from "@ujl-framework/types";
import { ModuleBase } from "./base.js";
import type { AnyModule } from "./index.js";

/**
 * Registry for managing UJL modules
 *
 * Provides dynamic registration and lookup of modules by name.
 * Used by the Composer to find and instantiate modules.
 */
export class ModuleRegistry {
	protected _modules: AnyModule[] = [];

	public registerModule(module: ModuleBase) {
		if (this._modules.some((m) => m.name === module.name)) {
			throw new Error(`Module ${module.name} already registered`);
		}
		this._modules.push(module);
	}

	public unregisterModule(module: AnyModule | string) {
		if (typeof module === "string") {
			this._modules = this._modules.filter((m) => m.name !== module);
		} else {
			this._modules = this._modules.filter((m) => m !== module);
		}
	}

	public getModule(name: string): AnyModule | undefined {
		return this._modules.find((module) => module.name === name);
	}

	/**
	 * Get all registered modules
	 * @returns Array of all registered modules (immutable copy)
	 */
	public getAllModules(): AnyModule[] {
		return [...this._modules];
	}

	/**
	 * Generate a human-readable label from module name
	 * Example: "call-to-action" → "Call To Action"
	 * @param name - Module name (e.g., "call-to-action")
	 * @returns Human-readable label (e.g., "Call To Action")
	 */
	public static generateLabelFromName(name: string): string {
		return name
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	/**
	 * Create a new UJLCModuleObject from a module type with default values
	 * Uses module field defaults to ensure new instances start with valid configuration
	 * @param type - Module type name
	 * @param id - Unique ID for the new module
	 * @returns New UJLCModuleObject with default field values and empty slots
	 * @throws Error if module type not found
	 */
	public createModuleFromType(type: string, id: string): UJLCModuleObject {
		const module = this.getModule(type);
		if (!module) {
			throw new Error(`Module type "${type}" not found in registry`);
		}

		// Extract default field values
		const fields: Record<string, unknown> = {};
		for (const fieldEntry of module.fields) {
			fields[fieldEntry.key] = fieldEntry.field.config.default;
		}

		// Create empty slots
		const slots: Record<string, UJLCModuleObject[]> = {};
		for (const slotEntry of module.slots) {
			slots[slotEntry.key] = [];
		}

		return {
			type: module.name,
			fields,
			slots,
			meta: {
				id,
				updated_at: new Date().toISOString(),
				_embedding: [],
			},
		};
	}
}
