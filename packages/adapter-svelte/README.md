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
	const composer = new Composer();
	const ast = $derived.by(() => composer.compose(ujlcDocument));

	// Extract token set (reactive)
	const tokenSet = $derived(ujltDocument.ujlt.tokens);
</script>

<AdapterRoot node={ast} {tokenSet} {mode} />
```

**Props:**

- `node`: The UJL AST node to render
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST (optional)
- `mode`: Theme mode - 'light', 'dark', or 'system' (default: 'system')
- `showMetadata`: If `true`, adds `data-ujl-module-id` attributes to module elements (default: `false`)
- `eventCallback`: Callback function triggered when a module is clicked, receives the module ID

### Editor Features

The adapter supports optional features for building visual editors:

```svelte
<script lang="ts">
	function handleModuleClick(moduleId: string) {
		console.log('Module clicked:', moduleId);
		// Update your editor state, highlight in sidebar, etc.
	}
</script>

<AdapterRoot node={ast} {tokenSet} {mode} showMetadata={true} eventCallback={handleModuleClick} />
```

**When `showMetadata={true}`:**

- All rendered modules receive a `data-ujl-module-id` attribute with their unique ID
- This enables programmatic module selection and highlighting
- Useful for visual editors like the Crafter

**When `eventCallback` is provided:**

- Modules become clickable and trigger the callback with their ID
- Events use `preventDefault()` to prevent default actions (e.g., button clicks)
- Events use `stopPropagation()` to prevent event bubbling to parent modules
- This enables click-to-select functionality in editors

### Legacy: Using `svelteAdapter` Function (Imperative Mounting)

For programmatic mounting (e.g., in non-Svelte contexts), use the imperative API:

```typescript
import { svelteAdapter } from '@ujl-framework/adapter-svelte';
import { Composer } from '@ujl-framework/core';

const composer = new Composer();
const ast = composer.compose(ujlcDocument);
const tokenSet = ujltDocument.ujlt.tokens;

const mountedComponent = svelteAdapter(ast, tokenSet, {
	target: '#my-container',
	mode: 'system',
	showMetadata: true,
	eventCallback: (moduleId) => console.log('Clicked:', moduleId)
});

// Cleanup
await mountedComponent.unmount();
```

## API Reference

### AdapterRoot Component

```typescript
interface AdapterRootProps {
	node: UJLAbstractNode;
	tokenSet?: UJLTTokenSet;
	mode?: 'light' | 'dark' | 'system';
	showMetadata?: boolean;
	eventCallback?: (moduleId: string) => void;
}
```

### svelteAdapter Function

```typescript
function svelteAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: SvelteAdapterOptions
): MountedComponent;
```

### Types

```typescript
type SvelteAdapterOptions = {
	target: string | HTMLElement;
	mode?: 'light' | 'dark' | 'system';
	showMetadata?: boolean;
	eventCallback?: (moduleId: string) => void;
};

type MountedComponent = {
	instance: Component;
	unmount: () => Promise<void>;
};
```

## Event Handling Implementation

When `eventCallback` is provided, all module components implement the following pattern:

```typescript
function handleClick(event: MouseEvent) {
	if (eventCallback && node.id) {
		event.preventDefault();
		event.stopPropagation();
		eventCallback(node.id);
	}
}
```

This ensures:

- Only the clicked module triggers the callback
- Parent modules don't receive the event
- Default behaviors (navigation, form submission) are suppressed in editor mode
- The correct module ID is always passed to the callback (all AST nodes have a required `id` field)

## Development

### Build Commands

```bash
# Build the package
pnpm run build

# Type check
pnpm run check

# Format and lint
pnpm run format
pnpm run lint
```

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── nodes/          # Module component implementations
│   │   ├── ASTNode.svelte  # Central router component
│   │   └── AdapterRoot.svelte  # Root component with theme support
│   ├── styles/             # CSS styles
│   ├── types.ts            # TypeScript definitions
│   └── adapter.ts          # Imperative mounting API
└── routes/                 # Development playground
```

## Relationship to adapter-web

The `adapter-web` package is built on top of `adapter-svelte` and automatically inherits all features and AST node support. When new AST nodes are added to `adapter-svelte`, they automatically work in `adapter-web` without any additional code.
