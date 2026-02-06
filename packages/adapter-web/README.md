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
import { webAdapter } from "@ujl-framework/adapter-web";
import { Composer } from "@ujl-framework/core";

// Create or import your UJL document (ujlDocument) and token set (tokenSet) here

const composer = new Composer();
const ast = composer.compose(ujlDocument);

// Target can be a CSS selector string or an HTMLElement
const mountedElement = webAdapter(ast, tokenSet, {
	target: "#my-container",
	showMetadata: true,
});

// Cleanup
mountedElement.unmount();
```

### Custom Element API (Advanced)

You can also use the Custom Element directly, but note that props must be set as **Properties**, not HTML attributes:

```typescript
const el = document.createElement("ujl-content") as UJLContentElement;
el.node = astNode;
el.tokenSet = tokenSet;
el.showMetadata = true;
document.body.appendChild(el);
```

> **Important**: Props (`node`, `tokenSet`, `showMetadata`) must be set as **Properties**, not HTML attributes, since attributes are strings. The programmatic API handles this automatically.

## Editor Features

The adapter supports the same optional editor features as `adapter-svelte`:

**`showMetadata` (boolean, default: `false`)**

- When `true`, adds `data-ujl-module-id` attributes to all module elements
- Enables programmatic module selection and highlighting
- Useful for building visual editors

**Note:** The adapter focuses on pure rendering. Editor-specific functionality (like click handling) should be implemented in your editor layer using event listeners on the rendered DOM elements.

### Example: Visual Editor Integration

```typescript
import { webAdapter } from "@ujl-framework/adapter-web";
import { Composer } from "@ujl-framework/core";

const composer = new Composer();
const ast = composer.compose(ujlDocument);

let selectedModuleId = null;

const mounted = webAdapter(ast, tokenSet, {
	target: "#preview",
	showMetadata: true,
});

// Implement click handling in your editor layer
const previewElement = document.querySelector("#preview");
previewElement?.addEventListener("click", (event) => {
	const clickedElement = event.target.closest("[data-ujl-module-id]");
	if (!clickedElement) return;

	const moduleId = clickedElement.getAttribute("data-ujl-module-id");
	if (!moduleId) return;

	// Check editability in AST (meta.isModuleRoot === true)
	// Then handle selection, highlighting, etc.

	// Update selection
	selectedModuleId = moduleId;

	// Remove previous highlights
	document
		.querySelectorAll("[data-ujl-module-id].selected")
		.forEach((el) => el.classList.remove("selected"));

	// Highlight selected module
	const element = document.querySelector(`[data-ujl-module-id="${moduleId}"]`);
	if (element) {
		element.classList.add("selected");
	}

	// Update sidebar, inspector, etc.
	updateEditorUI(moduleId);
});
```

## API Reference

### webAdapter

```typescript
function webAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions,
): MountedElement;
```

**Parameters:**

- `node`: The UJL AST node to render
- `tokenSet`: Design token set (`UJLTTokenSet`) to apply to the rendered AST
- `options.target`: DOM element or selector where the Custom Element should be mounted
- `options.showMetadata`: If `true`, adds `data-ujl-module-id` attributes (default: `false`)

**Returns:**

- `MountedElement` with `element` and `unmount()` method

### Types

```typescript
type WebAdapterOptions = {
	target: string | HTMLElement;
	showMetadata?: boolean;
};

type MountedElement = {
	element: HTMLElement;
	unmount: () => void;
};
```

## Relationship to adapter-svelte

This adapter is built on top of `adapter-svelte` and automatically inherits all features and AST node support. When new AST nodes are added to `adapter-svelte`, they automatically work in `adapter-web` without any additional code.

The adapter compiles `adapter-svelte` components at build time using Vite's library mode into a standalone Custom Element, bundling Svelte and all dependencies. This eliminates the need for Svelte as a runtime dependency while maintaining full compatibility. Styles from `adapter-svelte/bundle.css` (with Shadow DOM compatibility workarounds) are automatically injected into the Shadow DOM as inline styles.

### Inherited Features

All features from `adapter-svelte` are available in `adapter-web`:

- Full AST node support (all module types)
- Theme token support with light/dark/system modes
- Metadata attributes (`showMetadata`)
- All styling and layout capabilities

## Editor Integration

The adapter is designed for pure rendering. For editor functionality (like click-to-select), implement event listeners in your editor layer. See [adapter-svelte Editor Integration](../adapter-svelte/README.md#editor-integration) for implementation details.

This approach:

- Keeps the adapter focused on rendering
- Allows flexible editor implementations
- Enables different event types (click, hover, etc.)
- Maintains clean separation of concerns

## Development

### Build Commands

```bash
# Build the package
pnpm run build

# Format and lint
pnpm run format
pnpm run lint
```

### Project Structure

```
src/
├── adapter.ts          # Main adapter implementation
├── types.ts            # TypeScript definitions
└── components/
    └── UJLContent.svelte  # Custom Element wrapper
```
