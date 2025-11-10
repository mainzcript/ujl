# @ujl-framework/adapter-web - Web Adapter for UJL Framework

This package provides a framework-agnostic Web adapter for the UJL Framework, converting UJL AST nodes into Custom Elements (`<ujl-content>`) using native Web Components. The adapter uses `adapter-svelte` components at build time, resulting in a standalone Web Component without Svelte runtime dependency.

---

## Installation

```bash
pnpm add @ujl-framework/adapter-web
```

If you're using TypeScript or need the `Composer` class, also install:

```bash
pnpm add @ujl-framework/core
```

> **Note**: Svelte is bundled with the Custom Element (no runtime dependency). Styles are automatically injected into the Shadow DOM. TypeScript definitions are included, but require `@ujl-framework/core` for type references.

## Usage

### Programmatic API (Recommended)

```typescript
import { webAdapter } from '@ujl-framework/adapter-web';
import { Composer } from '@ujl-framework/core';

// Create or import your UJL document (ujlDocument) and token set (tokenSet) here

const composer = new Composer();
const ast = composer.compose(ujlDocument);

// Target can be a CSS selector string or an HTMLElement
const mountedElement = webAdapter(ast, tokenSet, {
	target: '#my-container'
});

// Cleanup
mountedElement.unmount();
```

### Custom Element API (Advanced)

You can also use the Custom Element directly, but note that props must be set as **Properties**, not HTML attributes:

```typescript
const el = document.createElement('ujl-content') as UJLContentElement;
el.node = astNode;
el.tokenSet = tokenSet;
document.body.appendChild(el);
```

> **Important**: Props (`node`, `tokenSet`) must be set as **Properties**, not HTML attributes, since attributes are strings. The programmatic API handles this automatically.

## API Reference

### webAdapter

```typescript
function webAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions
): MountedElement;
```

**Parameters:**

- `node`: The UJL AST node to render
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST
- `options.target`: DOM element or selector where the Custom Element should be mounted

**Returns:**

- `MountedElement` with `element` and `unmount()` method

### Types

```typescript
type WebAdapterOptions = {
	target: string | HTMLElement;
};

type MountedElement = {
	element: HTMLElement;
	unmount: () => void;
};
```

## Relationship to adapter-svelte

This adapter is built on top of `adapter-svelte` and automatically inherits all features and AST node support. When new AST nodes are added to `adapter-svelte`, they automatically work in `adapter-web` without any additional code.

The adapter compiles `adapter-svelte` components at build time using Vite's library mode into a standalone Custom Element, bundling Svelte and all dependencies. This eliminates the need for Svelte as a runtime dependency while maintaining full compatibility. Styles from `adapter-svelte/bundle.css` (with Shadow DOM compatibility workarounds) are automatically injected into the Shadow DOM as inline styles.
