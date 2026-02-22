import type { LibraryBase } from "./base.js";
import { InlineLibraryProvider } from "./inline-provider.js";

/**
 * Registry for managing UJL library providers
 *
 * Holds named providers that the Composer uses to resolve asset IDs during
 * composition. The Composer reads `doc.ujlc.meta._library.provider` and
 * calls `getProvider(name)` to find the right provider automatically.
 *
 * By default the registry is empty. Use `createDefaultLibraryRegistry()` to
 * get an instance pre-populated with the `InlineLibraryProvider`.
 * Register additional providers before passing the registry to the Composer:
 *
 * ```typescript
 * const libraryRegistry = new LibraryRegistry();
 * libraryRegistry.registerProvider(new BackendLibraryProvider({ url, apiKey }));
 *
 * const composer = new Composer(undefined, libraryRegistry);
 * ```
 *
 * The Composer and the Crafter share one registry instance via dependency injection.
 */
export class LibraryRegistry {
	private _providers: LibraryBase[] = [];

	/**
	 * Register a provider.
	 * @throws Error if a provider with the same name is already registered
	 */
	public registerProvider(provider: LibraryBase): void {
		if (this._providers.some((p) => p.name === provider.name)) {
			throw new Error(`Library provider "${provider.name}" is already registered`);
		}
		this._providers.push(provider);
	}

	/**
	 * Unregister a provider by instance or name.
	 */
	public unregisterProvider(provider: LibraryBase | string): void {
		if (typeof provider === "string") {
			this._providers = this._providers.filter((p) => p.name !== provider);
		} else {
			this._providers = this._providers.filter((p) => p !== provider);
		}
	}

	/**
	 * Check whether a provider with the given name is registered.
	 */
	public hasProvider(name: string): boolean {
		return this._providers.some((p) => p.name === name);
	}

	/**
	 * Look up a provider by name.
	 * @returns The provider instance, or undefined if not found
	 */
	public getProvider(name: string): LibraryBase | undefined {
		return this._providers.find((p) => p.name === name);
	}

	/**
	 * Get all registered providers (immutable copy).
	 */
	public getAllProviders(): LibraryBase[] {
		return [...this._providers];
	}
}

/**
 * Create a default LibraryRegistry pre-populated with the InlineLibraryProvider.
 *
 * The inline provider requires `getLibrary` / `updateLibrary` accessors which
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
	// Cast through unknown — the inline provider only reads/writes the record;
	// the generic shape is compatible at runtime even without the full AssetEntry type.
	registry.registerProvider(new InlineLibraryProvider(getLibrary as never, updateLibrary as never));
	return registry;
}
