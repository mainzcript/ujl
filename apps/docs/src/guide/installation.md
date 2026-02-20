---
title: "How to Install & Integrate UJL"
description: "Full guide to integrating UJL into your project, editor setup, rendering, lazy loading, SvelteKit."
---

# How to Install & Integrate UJL

UJL separates content, design, and structure so editors can never accidentally break brand guidelines or accessibility requirements. This guide covers the full integration.

## Prerequisites

- **Node.js** 22.0.0 or higher, check with `node --version`
- **pnpm** (recommended) or npm

```bash
# Enable pnpm via corepack
corepack enable
```

## Packages

| Package                         | Purpose                                    | Size (gzip) |
| ------------------------------- | ------------------------------------------ | ----------- |
| `@ujl-framework/crafter`        | Full visual editor, embed anywhere         | ~600 KB     |
| `@ujl-framework/adapter-web`    | Rendering only, Web Components, no editor  | ~280 KB     |
| `@ujl-framework/adapter-svelte` | Svelte-native rendering for SvelteKit apps | ~120 KB     |

```bash
# For visual editing
pnpm add @ujl-framework/crafter

# For rendering only
pnpm add @ujl-framework/adapter-web
```

## Embedding the Crafter

### Minimal setup

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

new UJLCrafter({ target: "#app" });
```

### With document and theme

The Crafter is stateless: pass an initial document and theme, and handle change events yourself. Persistence (database, API, localStorage) is your responsibility.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#app",
	document: ujlcDocument, // your .ujlc.json document
	theme: ujltDocument, // your .ujlt.json theme
});

// Listen for document changes
crafter.onDocumentChange((updatedDoc) => {
	// persist however you like
	saveDocument(updatedDoc);
});

// Show a Save button and react to it
crafter.onSave((doc, theme) => {
	saveDocument(doc);
});
```

### With backend image storage

To use the UJL Library Service for image management (responsive variants, metadata, i18n):

```javascript
const crafter = new UJLCrafter({
	target: "#app",
	document: ujlcDocument,
	theme: ujltDocument,
	library: {
		storage: "backend",
		url: "https://your-library.example.com",
		apiKey: "your-api-key",
	},
});
```

See the [Library Service README](https://github.com/mainzcript/ujl/tree/main/services/library) for setup instructions (Docker + PostgreSQL).

### With custom modules

Register your own modules alongside the built-in ones. Custom modules appear immediately in the component picker.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";
import { ModuleBase, TextField } from "@ujl-framework/core";

class HeroModule extends ModuleBase {
	readonly name = "hero";
	readonly label = "Hero";
	readonly description = "Full-width hero section";
	readonly category = "layout";
	readonly tags = ["hero", "banner"];
	readonly icon = '<rect width="20" height="12" x="2" y="6" rx="2"/>';
	readonly fields = [
		{ key: "headline", field: new TextField({ label: "Headline", description: "", default: "" }) },
	];
	readonly slots = [];

	compose(moduleData) {
		const headline = this.parseField(moduleData, "headline", "");
		return this.createNode("raw-html", { content: `<section><h1>${headline}</h1></section>` }, moduleData);
	}
}

// Register at initialization (recommended – modules are ready before first render)
const crafter = new UJLCrafter({
	target: "#app",
	modules: [new HeroModule()],
});

// Or dynamically at runtime
crafter.registerModule(new AnotherModule());
crafter.unregisterModule("hero");
```

For a complete module implementation guide, see [`@ujl-framework/core` – Creating Custom Modules](https://github.com/mainzcript/ujl/tree/main/packages/core#creating-custom-modules).

## Rendering Without the Editor

Use `@ujl-framework/adapter-web` to render UJL documents as Web Components, no editing functionality, much smaller bundle:

```html
<script type="module" src="node_modules/@ujl-framework/adapter-web/dist/index.js"></script>

<ujl-renderer id="my-renderer"></ujl-renderer>

<script>
	const renderer = document.getElementById("my-renderer");
	renderer.setDocument(ujlcDocument, ujltTokenSet);
</script>
```

## SvelteKit Integration

For SvelteKit projects, use `@ujl-framework/adapter-svelte` directly to keep Svelte as a peer dependency and enable tree-shaking:

```bash
pnpm add @ujl-framework/adapter-svelte
```

```svelte
<script>
	import { AdapterRoot } from "@ujl-framework/adapter-svelte";
	import "@ujl-framework/adapter-svelte/styles";
</script>

<AdapterRoot node={ast} {tokenSet} mode="system" />
```

## Lazy Loading the Crafter

The Crafter bundle is ~600 KB gzip. On pages where editing is optional, lazy-load it to avoid paying that cost upfront:

```javascript
// Only load when the user actually clicks "Edit"
document.querySelector("#edit-btn")?.addEventListener("click", async () => {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	new UJLCrafter({ target: "#editor" });
});
```

**Impact:** -600 KB from initial bundle, -30-50% time to interactive on non-editor pages. The editor loads in ~200-300 ms when requested, imperceptible for most workflows.

For SvelteKit, React, and Vue lazy-loading patterns, see [How to Optimize Bundle Size](/guide/optimize-bundle-size).

## Local Development

To run the included dev demo locally:

```bash
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

This starts the Crafter demo at `http://localhost:5174`.
