import type { LibraryBase } from "./base.js";
import { InlineLibraryProvider } from "./inline-provider.js";

/**
 * Registry for managing UJL library adapters
 *
 * Holds named adapters that the Composer uses to resolve asset IDs during
 * composition. The Composer reads `doc.ujlc.meta._library.adapter` and
 * calls `getAdapter(name)` to find the right adapter automatically.
 *
 * By default the registry is pre-populated with the `"inline"` adapter.
 * Register additional adapters before passing the registry to the Composer:
 *
 * ```typescript
 * const libraryRegistry = new LibraryRegistry();
 * libraryRegistry.registerAdapter(new BackendLibraryProvider({ url, apiKey }));
 *
 * const composer = new Composer(undefined, libraryRegistry);
 * ```
 *
 * The Composer and the Crafter share one registry instance via dependency injection.
 */
export class LibraryRegistry {
	private _adapters: LibraryBase[] = [];

	/**
	 * Register an adapter.
	 * @throws Error if an adapter with the same name is already registered
	 */
	public registerAdapter(adapter: LibraryBase): void {
		if (this._adapters.some((a) => a.name === adapter.name)) {
			throw new Error(`Library adapter "${adapter.name}" is already registered`);
		}
		this._adapters.push(adapter);
	}

	/**
	 * Unregister an adapter by instance or name.
	 */
	public unregisterAdapter(adapter: LibraryBase | string): void {
		if (typeof adapter === "string") {
			this._adapters = this._adapters.filter((a) => a.name !== adapter);
		} else {
			this._adapters = this._adapters.filter((a) => a !== adapter);
		}
	}

	/**
	 * Check whether an adapter with the given name is registered.
	 */
	public hasAdapter(name: string): boolean {
		return this._adapters.some((a) => a.name === name);
	}

	/**
	 * Look up an adapter by name.
	 * @returns The adapter instance, or undefined if not found
	 */
	public getAdapter(name: string): LibraryBase | undefined {
		return this._adapters.find((a) => a.name === name);
	}

	/**
	 * Get all registered adapters (immutable copy).
	 */
	public getAllAdapters(): LibraryBase[] {
		return [...this._adapters];
	}
}

/**
 * Create a default LibraryRegistry pre-populated with the InlineLibraryProvider.
 *
 * The inline adapter requires `getLibrary` / `updateLibrary` accessors which
 * are provided by the Crafter store. When using the Composer standalone
 * (outside the Crafter), pass a registry configured for your use case.
 *
 * @internal Used by Composer constructor when no registry is provided.
 */
export function createDefaultLibraryRegistry(
	getLibrary: () => Record<string, unknown>,
	updateLibrary: (fn: (lib: Record<string, unknown>) => Record<string, unknown>) => void,
): LibraryRegistry {
	const registry = new LibraryRegistry();
	// Cast through unknown — the inline adapter only reads/writes the record;
	// the generic shape is compatible at runtime even without the full AssetEntry type.
	registry.registerAdapter(new InlineLibraryProvider(getLibrary as never, updateLibrary as never));
	return registry;
}
