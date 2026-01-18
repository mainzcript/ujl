import type { UJLAbstractNode, UJLCDocument, UJLCModuleObject } from "@ujl-framework/types";
import { MediaLibrary, type MediaResolver } from "./media/index.js";
import { createDefaultRegistry } from "./modules/default-registry.js";
import { ModuleRegistry, type AnyModule } from "./modules/index.js";
import { generateUid } from "./utils.js";

/**
 * Composer class for converting UJL documents to Abstract Syntax Trees
 *
 * The composer handles the composition phase of the UJL pipeline,
 * converting UJL documents into AST nodes that can then be rendered
 * by various adapters.
 */
export class Composer {
	protected _module_registry: ModuleRegistry;
	protected _media_library: MediaLibrary | null = null;

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
	 * @returns Composed abstract syntax tree node (async for media resolution)
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
					moduleId: moduleData.meta.id, // Error node represents a failed module
					isModuleRoot: true,
				},
			};
		}
	}

	/**
	 * Compose a UJL document into an abstract syntax tree
	 * @param doc - The UJL document to compose
	 * @param mediaResolver - Optional resolver for backend media storage
	 * @returns Composed abstract syntax tree node (async for media resolution)
	 */
	public async compose(doc: UJLCDocument, mediaResolver?: MediaResolver): Promise<UJLAbstractNode> {
		// Initialize media library from document with optional resolver
		this._media_library = new MediaLibrary(doc.ujlc.media ?? {}, mediaResolver);

		const children: UJLAbstractNode[] = [];

		for (const rawModule of doc.ujlc.root) {
			children.push(await this.composeModule(rawModule));
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
	 * Get the module registry instance
	 * Useful for accessing registry methods and modules directly
	 */
	public getRegistry(): ModuleRegistry {
		return this._module_registry;
	}

	/**
	 * Get the media library instance
	 * Only available during composition
	 * @returns The media library instance or null if not composing
	 */
	public getMediaLibrary(): MediaLibrary | null {
		return this._media_library;
	}

	/**
	 * Create a new module instance from type with default values
	 * Convenience method that delegates to registry
	 */
	public createModuleFromType(type: string, id: string): UJLCModuleObject {
		return this._module_registry.createModuleFromType(type, id);
	}
}
