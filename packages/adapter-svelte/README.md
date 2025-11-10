# @ujl-framework/adapter-svelte - Svelte Adapter for UJL Framework

This package provides a Svelte adapter for the UJL Framework, converting UJL AST nodes into mounted Svelte components using Svelte 5's mount() API. It enables seamless integration between UJL's modular architecture and Svelte's reactive component system.

---

## Installation

```bash
pnpm add @ujl-framework/adapter-svelte svelte @ujl-framework/core @ujl-framework/ui
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
			target: '#my-container'
		});

		return () => {
			mountedComponent?.unmount();
		};
	});
</script>

<div id="my-container"></div>
```

> **Note**: When using the adapter within a Svelte component, wrap the adapter call in `onMount()` and return a cleanup function that calls `unmount()` to ensure proper lifecycle management.

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

**Returns:**

- `MountedComponent` with `instance` and `unmount()` method

### Types

```typescript
type SvelteAdapterOptions = {
	target: string | HTMLElement;
};

type MountedComponent = {
	instance: Component;
	unmount: () => Promise<void>;
};
```

## Exported Components

The adapter exports the following component (for advanced use cases):

- `AdapterRoot` - Root component that combines theme support and AST node rendering

Most users should simply use `svelteAdapter()` directly rather than importing components.
