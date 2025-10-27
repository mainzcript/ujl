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
