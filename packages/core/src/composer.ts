import type { UJLAbstractNode, UJLCDocument, UJLCModuleObject } from "@ujl-framework/types";
import { createDefaultRegistry } from "./modules/default-registry.js";
import { ModuleRegistry, type ModuleBase } from "./modules/index.js";
import { generateUid } from "./utils.js";

/**
 * Composer class for converting UJL documents to Abstract Syntax Trees
 *
 * The composer handles the composition phase of the UJL pipeline,
 * converting UJL documents into AST nodes that can then be rendered
 * by various adapters.
 *
 * The Composer is completely stateless and performs pure transformations
 * from UJLC documents to AST. Asset resolution happens synchronously
 * from the document's library object.
 */
export class Composer {
	protected _module_registry: ModuleRegistry;

	/**
	 * Create a new composer instance.
	 * @param moduleRegistry - Optional module registry (defaults to built-in modules)
	 */
	constructor(moduleRegistry?: ModuleRegistry) {
		this._module_registry = moduleRegistry ?? createDefaultRegistry();
	}

	public registerModule(module: ModuleBase) {
		this._module_registry.registerModule(module);
	}

	public unregisterModule(module: ModuleBase | string) {
		this._module_registry.unregisterModule(module);
	}

	/**
	 * Compose a single module into an abstract syntax tree node.
	 * @param moduleData - The module data to compose
	 * @returns Composed abstract syntax tree node (async for potential future extensibility)
	 */
	public async composeModule(
		moduleData: UJLCModuleObject,
		doc: UJLCDocument,
	): Promise<UJLAbstractNode> {
		const module = this._module_registry.getModule(moduleData.type);
		if (module) {
			return await module.compose(moduleData, this, doc);
		} else {
			// Fallback for unknown modules
			return {
				type: "error",
				props: {
					message: `Unknown module type: ${moduleData.type}`,
				},
				id: generateUid(),
				meta: {
					moduleId: moduleData.meta.id,
					isModuleRoot: true,
				},
			};
		}
	}

	/**
	 * Compose a UJL document into an abstract syntax tree.
	 *
	 * @param doc - The UJL document to compose
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(doc: UJLCDocument): Promise<UJLAbstractNode> {
		const children: UJLAbstractNode[] = [];

		for (const rawModule of doc.ujlc.root) {
			children.push(await this.composeModule(rawModule, doc));
		}

		// Return a root wrapper node
		return {
			type: "wrapper",
			props: { children },
			id: "__root__",
			// meta.moduleId NOT set - Root wrapper is not a module
		};
	}

	/**
	 * Get the module registry instance.
	 * Useful for accessing registry methods and modules directly.
	 */
	public getRegistry(): ModuleRegistry {
		return this._module_registry;
	}

	/**
	 * Create a new module instance from type with default values.
	 * Convenience method that delegates to registry.
	 */
	public createModuleFromType(type: string, id: string): UJLCModuleObject {
		return this._module_registry.createModuleFromType(type, id);
	}
}
