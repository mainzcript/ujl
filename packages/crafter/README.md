# @ujl-framework/crafter

**Visual Editor for UJL Content** - A Svelte based visual editor for creating and editing UJL content documents (`.ujlc.json`) and theme documents (`.ujlt.json`).

The Crafter provides a WYSIWYG editing experience with two distinct modes: **Editor** for content editing and **Designer** for theme customization. It features a modular architecture with centralized state management, dependency injection, and support for both inline and backend image storage.

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

### With Backend Asset Storage

```typescript
// Direct mode: API key held server-side (local dev, SSR)
const crafter = new UJLCrafter({
	target: "#editor-container",
	document: myContentDocument,
	theme: myPreviewTheme,
	library: {
		provider: "backend",
		url: "http://localhost:3000",
		apiKey: "your-api-key",
	},
});

// Proxy mode: requests forwarded via a BFF (deployed browser setups)
const crafter = new UJLCrafter({
	target: "#editor-container",
	library: {
		provider: "backend",
		proxyUrl: "/api/library-proxy",
	},
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

The Crafter supports two provider modes: **Inline** (default, Base64 in document) and **Backend** (Payload CMS server). Configuration is passed via `UJLCrafterOptions.library`.

| Provider  | Required Options               | Description                         |
| --------- | ------------------------------ | ----------------------------------- |
| `inline`  | None                           | Assets stored as Base64 in document |
| `backend` | `url` + `apiKey` or `proxyUrl` | Assets stored on Payload CMS server |

For backend storage setup and troubleshooting, see the [UJL Library README](../../services/library/README.md).

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
	library?:
		| { provider: "inline" }
		| { provider: "backend"; url: string; apiKey: string }
		| { provider: "backend"; proxyUrl: string };
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
│   ├── service-adapters/       # Legacy placeholder (adapters live in @ujl-framework/core)
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
- [UJL Library](../../services/library/README.md)
