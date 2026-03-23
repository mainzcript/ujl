# @ujl-framework/crafter

**Visual Editor for UJL Content** - A Svelte based visual editor for creating and editing UJL content documents (`.ujlc.json`) and theme documents (`.ujlt.json`).

The Crafter provides a WYSIWYG editing experience with two distinct modes: **Editor** for content editing and **Designer** for theme customization. It features a modular architecture with centralized state management, dependency injection, and inline image storage by default (with optional custom library providers).

---

## Installation

```bash
pnpm add @ujl-framework/crafter
```

> **Note:** The Crafter is a fully encapsulated bundle with Shadow DOM. All styles are automatically injected - no CSS import required. All dependencies (including the Svelte runtime) are bundled.

**Fonts:**

The Crafter does not bundle fonts. To use the fonts available in Designer Mode, import them in your application (e.g., via [Fontsource](https://fontsource.org/)). A backend-based font service is planned for future versions.

```typescript
import "@fontsource-variable/inter";
import "@fontsource-variable/open-sans";
// ... add more as needed
```

## Usage

The Crafter is a self-contained ES module that bundles all dependencies including the Svelte runtime. Styles are automatically injected into the Shadow DOM - no CSS import required.

### Basic Example

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#editor-container",
	document: myContentDocument, // Optional: Initial content
	theme: myPreviewTheme, // Optional: Theme for preview content
	editorTheme: myEditorTheme, // Optional: Theme for Crafter UI
});

// Cleanup when done
crafter.destroy();
```

### With Custom Modules

Custom modules extend `ModuleBase` from `@ujl-framework/core` and can be registered
at initialization or dynamically at runtime.

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";
import { ModuleBase } from "@ujl-framework/core";

class HeroModule extends ModuleBase {
	readonly name = "hero";
	readonly label = "Hero";
	readonly description = "Full-width hero section";
	readonly category = "layout" as const;
	readonly tags = ["hero", "banner", "header"];
	readonly icon = '<rect width="20" height="12" x="2" y="6" rx="2"/>';
	readonly fields = [];
	readonly slots = [];

	getInstanceLabel(_moduleData) {
		return null;
	}

	compose(moduleData) {
		return this.createNode("wrapper", {}, moduleData);
	}
}

// Register at initialization (recommended)
const crafter = new UJLCrafter({
	target: "#editor-container",
	modules: [new HeroModule()],
});

// Or register dynamically after initialization
crafter.registerModule(new AnotherModule());

// Unregister a module by name or instance
crafter.unregisterModule("hero");
```

Crafter resolves authoring names through the Core registry API. In places like the navigation tree and drag ghost it uses `ModuleRegistry.getDisplayName(moduleData)`:

- if your module returns a non-empty `getInstanceLabel()`, that instance name is shown
- otherwise Crafter falls back to the module's static `label`

For custom modules, implement `getInstanceLabel()` whenever a concrete module instance can have a meaningful name. Return `null` for modules such as `Image`, `Container`, or similar types where the static type label is already the best display name.

### With a custom library provider

By default the Crafter uses `InlineLibraryProvider` from `@ujl-framework/crafter` (assets stored in the document). To use a different storage (e.g. your own API), pass a **libraryProvider** that implements the UJL `LibraryProvider` interface. See the [Library Providers guide](https://ujl-framework.org/guide/library-providers) in the docs for details.

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";
import { InlineLibraryProvider } from "@ujl-framework/crafter"; // optional: explicit default

const crafter = new UJLCrafter({
	target: "#editor-container",
	document: myContentDocument,
	theme: myPreviewTheme,
	// libraryProvider: new InlineLibraryProvider(), // default when omitted
	// libraryProvider: myCustomProvider, // your implementation of LibraryProvider
});
```

### Event Handling

```typescript
// Listen for document changes
const unsubscribe = crafter.onDocumentChange((doc) => {
	console.log("Document changed:", doc);
});

// Listen for theme changes
crafter.onThemeChange((theme) => {
	console.log("Theme changed:", theme);
});

// Enable Save button with callback
crafter.onSave((document, theme) => {
	saveToServer(document);
});

// Get current state
const currentDoc = crafter.getDocument();
const currentTheme = crafter.getTheme();
const mode = crafter.getMode(); // 'editor' | 'designer'

// Programmatically control the editor
crafter.setMode("designer");
crafter.selectNode("module-123");
```

## Architecture

The Crafter follows the UJL Framework's core principle of separating content and design. It operates in two modes: **Editor Mode** for editing content documents (`.ujlc.json`) and **Designer Mode** for editing theme documents (`.ujlt.json`).

All state is managed centrally in the `CrafterStore`, which uses Svelte 5 runes for reactivity. The store holds the current documents, transforms them via the `Composer` into an AST, and renders the preview using `@ujl-framework/adapter-svelte`.

The Crafter also distinguishes between two independent themes: the **Editor Theme** controls the styling of the Crafter UI itself, while the **Preview Theme** controls how the content appears in the preview canvas. This allows you to use a consistent editor appearance across projects while previewing content with different themes.

## Features

In **Editor Mode**, the Crafter provides module tree navigation, click-to-select in the preview, drag & drop reordering, a property panel with type-safe inputs, and an image library for image management. In **Designer Mode**, you can edit design tokens (colors, typography, spacing) with live preview. The editor also includes viewport simulation (Desktop/Tablet/Mobile) and import/export for `.ujlc.json` and `.ujlt.json` files.

## Asset Library

The Crafter uses a stateless `LibraryProvider` for asset operations. The provider handles upload, metadata management, and asset listing, but **does not store state**—all asset data lives in the document's `ujlc.library` object.

**Key Principle:** The Composer (used for rendering) is completely stateless and reads assets directly from `doc.ujlc.library`. The `LibraryProvider` is only used for Crafter operations (upload, list, delete, metadata update). UJL ships only `InlineLibraryProvider`; for other storage you implement the `LibraryProvider` interface yourself. See the [Library Providers guide](https://ujl-framework.org/guide/library-providers) in the docs.

## API Reference

```typescript
class UJLCrafter {
	constructor(options: UJLCrafterOptions);

	// State
	getDocument(): UJLCDocument;
	getTheme(): UJLTDocument;
	getMode(): "editor" | "designer";
	getSelectedNodeId(): string | null;
	getShadowRoot(): ShadowRoot | null;

	setDocument(document: UJLCDocument): void;
	setTheme(theme: UJLTDocument): void;
	setMode(mode: "editor" | "designer"): void;
	selectNode(nodeId: string | null): void;

	// Module Registry
	registerModule(module: ModuleBase): void;
	unregisterModule(module: ModuleBase | string): void;

	// Events (return unsubscribe function)
	onDocumentChange(callback: (doc: UJLCDocument) => void): () => void;
	onThemeChange(callback: (theme: UJLTDocument) => void): () => void;
	onNotification(callback: (type, message, description?) => void): () => void;
	onSave(callback: (doc: UJLCDocument, theme: UJLTDocument) => void): () => void;

	// Lifecycle
	destroy(): void;
}

interface UJLCrafterOptions {
	target: string | HTMLElement;
	document?: UJLCDocument;
	theme?: UJLTDocument;
	editorTheme?: UJLTDocument;
	libraryProvider?: LibraryProvider; // Provider for Crafter operations (upload, list, etc.)
	modules?: ModuleBase[]; // Custom modules to register alongside built-in modules
	testMode?: boolean; // Enable data-testid attributes for E2E testing (default: false)
}
```

## Development

```bash
pnpm run dev      # Development server (Tailwind CSS + Vite in parallel)
pnpm run build    # Production build
pnpm run check    # Type check (TypeScript + Svelte)
pnpm run lint     # Check formatting and code quality
pnpm run format   # Auto-fix formatting
pnpm run test     # Run tests
```

The `dev` command uses `concurrently` to run Tailwind CSS watch and Vite in parallel.

### E2E Tests (Playwright)

The E2E tests start (or reuse) a dev server on port `5173` (see `playwright.config.ts`).

- Make sure nothing else is listening on `http://localhost:5173` when running `pnpm run test:e2e` (e.g. VitePress in `apps/docs` also uses `5173` by default).
- If you need a different port, update `baseURL` and `webServer.port` in `packages/crafter/playwright.config.ts`.

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (inputs, pickers, etc.)
│   │   └── ujl-crafter/        # Main Crafter components
│   │       ├── canvas/         # Preview canvas
│   │       ├── header/         # App header with mode switch, viewport controls
│   │       ├── panel/          # Right panel (properties, designer)
│   │       ├── sidebar/        # Left sidebar (nav tree, component picker)
│   │       ├── UJLCrafter.ts   # Public API class
│   │       ├── ujl-crafter-element.svelte  # Custom Element wrapper (Shadow DOM)
│   │       └── ujl-crafter.svelte          # Main UI component
│   ├── library-providers/      # Built-in library providers (e.g. InlineLibraryProvider)
│   ├── stores/                 # CrafterStore (Svelte 5 runes)
│   ├── styles/                 # CSS architecture (see below)
│   └── utils/                  # Helpers (clipboard, colors, DOM utilities)
└── dev/                        # Development app for local testing
```

### Styles Architecture

The Crafter uses Shadow DOM for style isolation. Due to a Svelte limitation, component styles defined in `<style>` blocks are injected into `document.head` instead of the Shadow DOM.

**Solution:** Component styles are placed in co-located `.css` files and imported via `bundle.css`. An ESLint rule prevents accidental use of `<style>` blocks.

See [src/lib/styles/README.md](src/lib/styles/README.md) for details.

## Related

- [UJL Framework README](../../README.md)
