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

## Modules vs. AST Nodes

The adapter relies on the distinction between **Modules** and **AST Nodes** to determine how nodes should be rendered and handled. For a complete explanation of this fundamental concept, see the [Core package documentation](../../core/README.md#modules-vs-ast-nodes).

**In summary:** The adapter sets `data-ujl-module-id` attributes on all nodes with `meta.moduleId` when `showMetadata={true}`. Editor-specific functionality (like click handling) should be implemented in your editor layer using event listeners on the rendered DOM elements.

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
- `showMetadata`: If `true`, adds `data-ujl-module-id` attributes to module nodes (default: `false`)

### Editor Features

The adapter supports optional metadata attributes for building visual editors:

```svelte
<AdapterRoot node={ast} {tokenSet} {mode} showMetadata={true} />
```

**When `showMetadata={true}`:**

- All nodes with `meta.moduleId` receive a `data-ujl-module-id` attribute
- This enables programmatic module selection and highlighting
- Useful for visual editors like the Crafter

**Note:** The adapter focuses on pure rendering. Editor-specific functionality (like click handling) should be implemented in your editor layer (e.g., the Crafter) using event listeners on the rendered DOM elements.

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
	showMetadata: true
});

// Cleanup
await mountedComponent.unmount();
```

## Helper Functions

The adapter provides utility functions for working with AST nodes:

```typescript
import { getModuleId } from '@ujl-framework/adapter-svelte';

// Get the module ID from a node (which module it belongs to)
const moduleId = getModuleId(node); // Returns node.meta?.moduleId ?? null
```

**Use Cases:**

- `getModuleId`: Get which module a node belongs to (works for all nodes with moduleId)

## API Reference

### AdapterRoot Component

```typescript
interface AdapterRootProps {
	node: UJLAbstractNode;
	tokenSet?: UJLTTokenSet;
	mode?: 'light' | 'dark' | 'system';
	showMetadata?: boolean;
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
};

type MountedComponent = {
	instance: Component;
	unmount: () => Promise<void>;
};
```

## Event Handling in Editor Layers

The adapter focuses on pure rendering. For editor functionality (like click-to-select), implement event listeners in your editor layer.

**Example: Implementing click handling in an editor:**

```typescript
import { getModuleId } from '@ujl-framework/adapter-svelte';

function handleClick(event: MouseEvent) {
	const clickedElement = (event.target as HTMLElement).closest('[data-ujl-module-id]');
	if (!clickedElement) return;

	const moduleId = clickedElement.getAttribute('data-ujl-module-id');
	if (!moduleId) return;

	// Check if the clicked node is editable (isModuleRoot === true) in your AST
	// Then handle selection, highlighting, etc.
	const node = findNodeByModuleId(ast, moduleId);
	if (node?.meta?.isModuleRoot === true) {
		selectModule(moduleId);
	}
}
```

**Key points:**

- The adapter only adds `data-ujl-module-id` attributes when `showMetadata={true}`
- Event handling must be implemented in your editor layer (e.g., the Crafter)
- Check `meta.isModuleRoot === true` in your AST to determine if a node is editable
- Non-editable nodes (like `grid-item` wrappers) have `meta.moduleId` but `isModuleRoot === false`

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
│   │   ├── nodes/          # AST node component implementations
│   │   ├── ASTNode.svelte  # Central router component
│   │   └── AdapterRoot.svelte  # Root component with theme support
│   ├── utils/
│   │   └── events.ts       # Event handling utilities (getModuleId)
│   ├── styles/             # CSS styles
│   ├── types.ts            # TypeScript definitions
│   └── adapter.ts          # Imperative mounting API
└── routes/                 # Development playground
```

## Rich Text Serialization

The adapter provides a synchronous, SSR-safe ProseMirror-to-HTML serializer:

```typescript
import { prosemirrorToHtml } from '@ujl-framework/adapter-svelte';
import type { ProseMirrorDocument } from '@ujl-framework/types';

const html = prosemirrorToHtml(doc);
```

The serializer is SSR-safe (no browser APIs required) and supports all node and mark types defined in the UJL rich text schema. For schema details, see `@ujl-framework/core` documentation.

## RichText Component

For rendering ProseMirror documents in Svelte components, use the `RichText` component:

```svelte
<script>
	import { RichText } from '@ujl-framework/adapter-svelte';
	import type { ProseMirrorDocument } from '@ujl-framework/types';
</script>

<RichText document={doc} as="div" size="lg" intensity="muted" />
```

The component accepts all `Text` component props (`size`, `weight`, `intensity`, `as`) and automatically serializes the ProseMirror document to HTML. This is the recommended approach for rendering rich text content in node components.

## Relationship to adapter-web

The `adapter-web` package builds on top of this adapter, compiling Svelte components into standalone Web Components. See [adapter-web README](../adapter-web/README.md#relationship-to-adapter-svelte) for details.
