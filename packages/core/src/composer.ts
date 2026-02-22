import type { UJLAbstractNode, UJLCDocument, UJLCModuleObject } from "@ujl-framework/types";
import type { LibraryBase } from "./library/base.js";
import { LibraryRegistry } from "./library/registry.js";
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
 * The Composer automatically selects the correct library provider for the
 * document being composed by reading `doc.ujlc.meta._library.provider` and
 * looking it up in the LibraryRegistry. No manual provider passing is needed.
 */
export class Composer {
	protected _module_registry: ModuleRegistry;
	protected _library_registry: LibraryRegistry;
	protected _active_library: LibraryBase | null = null;

	/**
	 * Create a new composer instance.
	 * @param moduleRegistry - Optional module registry (defaults to built-in modules)
	 * @param libraryRegistry - Optional library registry (defaults to empty registry)
	 */
	constructor(moduleRegistry?: ModuleRegistry, libraryRegistry?: LibraryRegistry) {
		this._module_registry = moduleRegistry ?? createDefaultRegistry();
		this._library_registry = libraryRegistry ?? new LibraryRegistry();
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
	 * @returns Composed abstract syntax tree node (async for asset resolution)
	 */
	public async composeModule(moduleData: UJLCModuleObject): Promise<UJLAbstractNode> {
		const module = this._module_registry.getModule(moduleData.type);
		if (module) {
			return await module.compose(moduleData, this);
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
	 * The Composer reads `doc.ujlc.meta._library.provider` and looks up
	 * the matching provider in the LibraryRegistry automatically.
	 * If no matching provider is registered, `getLibrary()` returns null
	 * during composition and modules will receive null for unresolvable assets.
	 *
	 * @param doc - The UJL document to compose
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(doc: UJLCDocument): Promise<UJLAbstractNode> {
		// Select the library provider based on the document's _library.provider config
		const adapterName = doc.ujlc.meta._library.provider;
		this._active_library = this._library_registry.getProvider(adapterName) ?? null;

		const children: UJLAbstractNode[] = [];

		for (const rawModule of doc.ujlc.root) {
			children.push(await this.composeModule(rawModule));
		}

		// Reset active library after composition
		this._active_library = null;

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
	 * Get the library registry instance.
	 */
	public getLibraryRegistry(): LibraryRegistry {
		return this._library_registry;
	}

	/**
	 * Get the active library provider for the document currently being composed.
	 * Only available during composition (between `compose()` start and finish).
	 * @returns The active library provider, or null if not composing or no provider found
	 */
	public getLibrary(): LibraryBase | null {
		return this._active_library;
	}

	/**
	 * Create a new module instance from type with default values.
	 * Convenience method that delegates to registry.
	 */
	public createModuleFromType(type: string, id: string): UJLCModuleObject {
		return this._module_registry.createModuleFromType(type, id);
	}
}
