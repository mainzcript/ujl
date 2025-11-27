import { ModuleBase } from "./base.js";
import type { AnyModule } from "./index.js";

/**
 * Registry for managing UJL modules
 *
 * Provides dynamic registration and lookup of modules by name.
 * Used by the Composer to find and instantiate modules.
 *
 * TODO: Add method to generate ComponentLibrary from registered modules
 * This would allow automatic generation of ComponentLibrary for the Crafter's component picker,
 * eliminating the need for manual maintenance in packages/examples/src/components/component-library.ts
 *
 * Example:
 * ```typescript
 * const registry = new ModuleRegistry();
 * registry.registerModule(new ContainerModule());
 * const componentLibrary = registry.generateComponentLibrary();
 * ```
 */
export class ModuleRegistry {
	protected _modules: AnyModule[] = [];

	public registerModule(module: ModuleBase) {
		if (this._modules.some(m => m.name === module.name)) {
			throw new Error(`Module ${module.name} already registered`);
		}
		this._modules.push(module);
	}

	public unregisterModule(module: AnyModule | string) {
		if (typeof module === "string") {
			this._modules = this._modules.filter(m => m.name !== module);
		} else {
			this._modules = this._modules.filter(m => m !== module);
		}
	}

	public getModule(name: string): AnyModule | undefined {
		return this._modules.find(module => module.name === name);
	}
}
