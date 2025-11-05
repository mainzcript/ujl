# @ujl-framework/adapter-svelte - Svelte Adapter for UJL Framework

This package provides a Svelte adapter for the UJL Framework, converting UJL AST nodes into mounted Svelte components using Svelte 5's mount() API. It enables seamless integration between UJL's modular architecture and Svelte's reactive component system.

---

## Installation and Usage

### Prerequisites

This adapter requires the following peer dependencies:

```bash
pnpm add svelte @ujl-framework/core @ujl-framework/ui
```

### Installation

```bash
pnpm add @ujl-framework/adapter-svelte
```

### Example Documents

For development and testing, you can use the example documents from the `@ujl-framework/examples` package:

```bash
pnpm add -D @ujl-framework/examples
```

This package provides pre-built UJL documents that you can use in your applications.

### Basic Usage

Use the adapter directly in JavaScript/TypeScript code outside of Svelte components:

```typescript
import { svelteAdapter } from '@ujl-framework/adapter-svelte';
import { Composer } from '@ujl-framework/core';
import type { UJLTDocument } from '@ujl-framework/core';
import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

// Extract token set from theme document
const themeDocument = defaultTheme as unknown as UJLTDocument;
const tokenSet = themeDocument.ujlt.tokens;

// Compose and render
const composer = new Composer();
const ast = composer.compose(showcaseDocument);

// Mount to DOM (tokenSet is required)
const mountedComponent = svelteAdapter(ast, tokenSet, {
	target: '#my-container'
});

// Cleanup when done
mountedComponent.unmount();
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
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST (required)
- `options.target`: DOM element or selector where the component should be mounted

**Returns:**

- `MountedComponent`: Object containing the mounted component instance and cleanup function

### Types

```typescript
type SvelteAdapterOptions = {
	target: string | HTMLElement;
};

type MountedComponent = {
	instance: Component;
	unmount: () => void;
};
```

## Available Components

The adapter provides the following Svelte components:

- **ASTNode**: Central router component that delegates to specific node components
- **Container**: Renders container AST nodes with children using the UI Package's Container component for responsive layout
- **Wrapper**: Renders wrapper AST nodes with children
- **Raw**: Renders raw HTML content using `{@html}` (handles `raw-html` AST nodes)
- **Error**: Displays error messages using the UI Package's Alert component with destructive styling
- **Text**: Renders text content from `text` AST nodes
- **Button**: Renders clickable buttons from `button` AST nodes
- **Card**: Renders content cards from `card` AST nodes with title, description, and children
- **Grid**: Renders responsive grid layouts from `grid` AST nodes
- **GridItem**: Renders individual grid items from `grid-item` AST nodes
- **CallToAction**: Renders call-to-action sections from `call-to-action` AST nodes with buttons

## Features

- **Direct Component Rendering**: Mounts Svelte components directly to DOM elements
- **Svelte 5 Runes**: Uses modern Svelte 5 reactivity system
- **Type Safety**: Full TypeScript support with strict typing
- **Recursive Rendering**: Handles nested AST structures automatically
- **Error Handling**: Graceful error display for unknown node types
- **Cleanup Support**: Proper component unmounting and memory management
- **UI Package Integration**: Uses components from `@ujl-framework/ui` for consistent design
- **Design System**: Leverages established design tokens and responsive layouts
- **Theme Support**: Required token set for consistent design system integration

## Architecture

The adapter follows a clean separation of concerns:

1. **AST Composition**: UJL documents are composed into AST using `@ujl-framework/core`
2. **Component Mapping**: AST nodes are mapped to specific Svelte components
3. **UI Integration**: Node components leverage `@ujl-framework/ui` for consistent design
4. **Direct Mounting**: Components are mounted directly to DOM using Svelte 5's `mount()` API
5. **Recursive Rendering**: Child nodes are rendered recursively through the component tree

## Development

Start the development server:

```sh
pnpm run dev
```

Build the package:

```sh
pnpm run build
```

Run type checking:

```sh
pnpm run check
```

## Integration with UJL Framework

This adapter is designed to work seamlessly with the UJL Framework's modular architecture:

- **Modules**: UJL modules compose into AST nodes
- **AST**: Abstract Syntax Tree represents the document structure
- **Adapters**: Convert AST to various output formats (HTML, Svelte, etc.)
- **Components**: Svelte components render the final UI

The adapter enables UJL's powerful composition system to work with Svelte's reactive component model, providing the best of both worlds.
