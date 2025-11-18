# @ujl-framework/adapter-svelte - Svelte Adapter for UJL Framework

This package provides a Svelte adapter for the UJL Framework, converting UJL AST nodes into mounted Svelte components using Svelte 5's mount() API. It enables seamless integration between UJL's modular architecture and Svelte's reactive component system.

---

## Installation

```bash
pnpm add @ujl-framework/adapter-svelte svelte @ujl-framework/core @ujl-framework/ui @ujl-framework/types
```

> **Note**: Styles are **not** automatically imported. You must explicitly import `@ujl-framework/adapter-svelte/styles` in your application. In SvelteKit, this is typically done in your root `+layout.svelte` file.

### Style Injection

The package provides two style exports:

- **`./styles`** - Source CSS file that will be processed by Tailwind CSS in your build pipeline. Use this for regular SvelteKit applications:

  ```svelte
  import '@ujl-framework/adapter-svelte/styles';
  ```

- **`./bundle.css`** - Pre-built, minified CSS bundle ready for direct use. Use this when you need the processed CSS without Tailwind compilation (e.g., for Shadow DOM injection in Custom Elements):
  ```typescript
  import bundleStylesUrl from '@ujl-framework/adapter-svelte/bundle.css?url';
  ```

We recommend using the `./styles` export in your Svelte application.

## Usage

The adapter provides two ways to render UJL content:

### Recommended: Using `AdapterRoot` Component (Svelte Components)

For Svelte components, use `AdapterRoot` directly. This approach is more idiomatic and leverages Svelte's reactive system:

```svelte
<script lang="ts">
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';

	let {
		ujlcDocument,
		ujltDocument,
		mode = 'system'
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: 'light' | 'dark' | 'system';
	} = $props();

	// Compose document to AST (reactive)
	const ast = $derived.by(() => {
		const composer = new Composer();
		return composer.compose(ujlcDocument);
	});

	// Extract token set (reactive)
	const tokenSet = $derived(ujltDocument.ujlt.tokens);
</script>

<AdapterRoot node={ast} {tokenSet} {mode} />
```

**Benefits:**

- Automatic reactivity - updates when props change
- No manual lifecycle management
- More Svelte-idiomatic code
- Simpler and cleaner

### Alternative: Using `svelteAdapter` Function (Imperative Mounting)

For imperative mounting scenarios (e.g., outside Svelte components, dynamic DOM manipulation), use `svelteAdapter`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { svelteAdapter } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import { Composer } from '@ujl-framework/core';

	// create or import your UJL document (ujlDocument) and token set (tokenSet) here

	let mountedComponent;

	onMount(() => {
		const composer = new Composer();
		const ast = composer.compose(ujlDocument);

		mountedComponent = svelteAdapter(ast, tokenSet, {
			target: '#my-container',
			mode: 'system'
		});

		return () => {
			mountedComponent?.unmount();
		};
	});
</script>

<div id="my-container"></div>
```

> **Note**: When using `svelteAdapter`, wrap the adapter call in `onMount()` and return a cleanup function that calls `unmount()` to ensure proper lifecycle management.

## API Reference

### svelteAdapter

```typescript
function svelteAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: SvelteAdapterOptions
): MountedComponent;
```

**Parameters:**

- `node`: The UJL AST node to render
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST
- `options.target`: DOM element or selector where the component should be mounted
- `options.mode`: Theme mode - 'light', 'dark', or 'system' (optional, default: 'system')

**Returns:**

- `MountedComponent` with `instance` and `unmount()` method

### AdapterRoot

```typescript
// Component props
interface AdapterRootProps {
	node: UJLAbstractNode;
	tokenSet?: UJLTTokenSet;
	mode?: 'light' | 'dark' | 'system';
}
```

**Props:**

- `node`: The UJL AST node to render
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST (optional)
- `mode`: Theme mode - 'light', 'dark', or 'system' (default: 'system')

### Types

```typescript
type SvelteAdapterOptions = {
	target: string | HTMLElement;
	mode?: 'light' | 'dark' | 'system';
};

type MountedComponent = {
	instance: Component;
	unmount: () => Promise<void>;
};
```
