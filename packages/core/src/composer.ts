import { createDefaultRegistry } from "./modules/default-registry.js";
import { ModuleRegistry, type AnyModule } from "./modules/index.js";
import type { UJLAbstractNode, UJLDocument, UJLModuleObject } from "./types";

/**
 * Composer class for converting UJL documents to Abstract Syntax Trees
 *
 * The composer handles the composition phase of the UJL pipeline,
 * converting UJL documents into AST nodes that can then be rendered
 * by various adapters.
 */
export class Composer {
	protected _module_registry: ModuleRegistry;

	/**
	 * Create a new composer instance
	 * @param registry - Optional module registry (defaults to built-in modules)
	 */
	constructor(registry?: ModuleRegistry) {
		this._module_registry = registry ?? createDefaultRegistry();
	}

	public registerModule(module: AnyModule) {
		this._module_registry.registerModule(module);
	}

	public unregisterModule(module: AnyModule | string) {
		this._module_registry.unregisterModule(module);
	}

	/**
	 * Compose a single module into an abstract syntax tree node
	 * @param moduleData - The module data to compose
	 * @returns Composed abstract syntax tree node
	 */
	public composeModule(moduleData: UJLModuleObject): UJLAbstractNode {
		const module = this._module_registry.getModule(moduleData.type);
		if (module) {
			return module.compose(moduleData, this);
		} else {
			// Fallback for unknown modules
			return {
				type: "error",
				props: {
					message: `Unknown module type: ${moduleData.type}`,
				},
			};
		}
	}

	/**
	 * Compose a UJL document into an abstract syntax tree
	 * @param doc - The UJL document to compose
	 * @returns Composed abstract syntax tree node
	 */
	public compose(doc: UJLDocument): UJLAbstractNode {
		const children: UJLAbstractNode[] = [];

		for (const rawModule of doc.ujl.root) {
			children.push(this.composeModule(rawModule));
		}

		// Return a root wrapper node
		return {
			type: "wrapper",
			props: { children },
		};
	}
}
