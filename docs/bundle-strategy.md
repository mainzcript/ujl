# Bundle Strategy & Performance

This document explains the UJL Framework's bundle architecture, the reasoning behind architectural decisions, and provides practical guidance for performance optimization.

## Context & Problem Statement

When building a WYSIWYG editor framework, bundle size becomes a critical concern. Large bundles negatively impact initial page load times, especially on slower networks. However, a rich text editor inherently requires substantial dependencies: a framework runtime (Svelte), a rich text editing engine (TipTap/ProseMirror), UI components, and editor-specific features like image compression and color pickers.

The challenge is balancing two competing requirements:

1. **Ease of use**: Developers should be able to drop in the editor with minimal setup
2. **Performance**: Applications shouldn't pay the cost of loading a 2 MB editor on every page

The UJL Framework solves this through an **adapter-based architecture** that provides multiple integration paths, each optimized for different use cases.

## Architecture Overview

The UJL Framework is structured as a layered monorepo with distinct packages serving different purposes:

```
┌─────────────────────────────────────────────────────────────┐
│                    @ujl-framework/crafter                   │
│              Full Bundle (2.0 MB / 600 KB gzip)             │
│  Includes: Svelte runtime + TipTap + UI + Editor features  │
│              Framework-agnostic, drop-in ready              │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ uses
                              │
┌─────────────────────────────────────────────────────────────┐
│               @ujl-framework/adapter-svelte                 │
│             Svelte Components (380 KB / 120 KB gzip)        │
│           peerDependencies: svelte ^5.0.0                   │
│          For SvelteKit apps with own build pipeline         │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ uses
                              │
┌─────────────────────────────────────────────────────────────┐
│                   @ujl-framework/ui                         │
│            Component Library (2.6 MB / 800 KB gzip)         │
│    peerDependencies: svelte, @sveltejs/kit, tailwindcss    │
│              Reusable UI components and tokens              │
└─────────────────────────────────────────────────────────────┘
```

Additionally, there are supporting packages:

- **`@ujl-framework/adapter-web`** (900 KB / 280 KB gzip): Web Component for framework-agnostic rendering (read-only, no editor)
- **`@ujl-framework/core`** (150 KB / 50 KB gzip): Document composition and AST utilities
- **`@ujl-framework/types`** (30 KB / 10 KB gzip): TypeScript type definitions

### Why This Architecture?

This architecture provides **two integration paths** for different scenarios:

**Path 1: Full Bundle (Crafter)** - For developers who want a drop-in editor without managing dependencies. Crafter bundles everything, including the Svelte runtime, making it framework-agnostic. This is the "batteries included" option.

**Path 2: Lean Build (adapter-svelte + ui)** - For SvelteKit applications that already have Svelte in their build pipeline. These packages declare Svelte as a peer dependency, avoiding duplication and enabling better tree-shaking through the consumer's bundler.

This design means we **already have** both a "Full" and a "Lean" variant - they serve different use cases by design.

## Why Is Crafter 2 MB?

Crafter is a complete WYSIWYG editor that bundles multiple layers of functionality:

- **Svelte Runtime** (~50 KB): Required to run Svelte components in any environment
- **TipTap + ProseMirror** (~800 KB): The rich text editing engine that powers the editor
- **UI Components** (~400 KB): Editor toolbar, panels, dialogs, and controls
- **Editor Features** (~750 KB): Image compression (compressorjs), color pickers, upload handling, etc.

**Is 2 MB too large?**

No. This is **industry-standard** for WYSIWYG editors:

- **Monaco Editor** (VS Code's editor): ~4 MB
- **CKEditor 5**: ~2 MB
- **TinyMCE**: ~1.5 MB

When compressed with gzip or brotli (which is standard for production), Crafter shrinks to approximately **600 KB**, which is well within acceptable ranges for a rich text editor.

### Why Bundle Everything?

Crafter intentionally bundles all dependencies (including the Svelte runtime) to achieve **framework-agnostic deployment**. This means:

1. **No peer dependencies**: Consumers don't need to install Svelte, TipTap, or any other dependency
2. **No version conflicts**: The editor's dependencies are locked to tested versions
3. **Shadow DOM isolation**: Styles are completely encapsulated, preventing CSS conflicts
4. **Zero configuration**: `<script src="crafter.js">` works in any HTML page

This makes Crafter ideal for:

- Embedding in content management systems
- Integration into existing applications (React, Vue, Angular, vanilla JS)
- Rapid prototyping without build configuration

**Trade-off**: The bundle is larger because dependencies are included. However, this is an intentional design choice prioritizing ease of use over bundle size.

## Why Are adapter-svelte and ui Small?

In contrast to Crafter, `adapter-svelte` and `ui` use **peer dependencies**:

```json
// adapter-svelte/package.json
"peerDependencies": {
  "svelte": "^5.0.0"
}

// ui/package.json
"peerDependencies": {
  "svelte": "^5.0.0",
  "@sveltejs/kit": "^2.0.0",
  "tailwindcss": "^4.1.17"
}
```

This means the consumer's application must provide these dependencies. When used in a SvelteKit project, the following benefits emerge:

1. **Svelte is deduplicated**: The application and the editor share the same Svelte runtime
2. **Natural tree-shaking**: The consumer's bundler (Vite) can eliminate unused code
3. **Smaller total bundle**: No duplication of Svelte or other shared dependencies

This makes `adapter-svelte` ideal for:

- SvelteKit applications
- Projects that already use Svelte
- Developers who want fine-grained control over dependencies

**Trade-off**: Requires a build pipeline and knowledge of peer dependencies. Not suitable for drop-in usage.

## Package Overview

| Package                         | Size (uncompressed) | Size (gzip) | Strategy         | Use Case                     |
| ------------------------------- | ------------------- | ----------- | ---------------- | ---------------------------- |
| `@ujl-framework/crafter`        | ~2.0 MB             | ~600 KB     | Full Bundle      | Drop-in Editor               |
| `@ujl-framework/adapter-web`    | ~900 KB             | ~280 KB     | Web Component    | Framework-agnostic Rendering |
| `@ujl-framework/adapter-svelte` | ~380 KB             | ~120 KB     | Svelte Component | SvelteKit Apps               |
| `@ujl-framework/ui`             | ~2.6 MB             | ~800 KB     | Component Lib    | Svelte Projects              |
| `@ujl-framework/core`           | ~150 KB             | ~50 KB      | Utility Library  | Document Composition         |
| `@ujl-framework/types`          | ~30 KB              | ~10 KB      | TypeScript Types | Type Definitions             |

## Performance Optimization Strategy

During the bundle optimization initiative, we evaluated several approaches:

### What We Considered (But Rejected)

**Dual-Build Approach**: Creating separate "Full" and "Peer" builds of Crafter was proposed. This was **rejected** because:

1. The "Lean" variant already exists as `adapter-svelte` - this is by design
2. A "Peer" build of Crafter would break its framework-agnostic nature
3. Consumers would need to manage Svelte versions, defeating the purpose of a drop-in bundle
4. Maintenance complexity would double (two builds, two test matrices)

**Code-Splitting in Crafter**: Using Rollup's `manualChunks` to split the bundle was considered but **rejected** because:

1. Library builds must be self-contained - the entire bundle must load anyway
2. Code-splitting only benefits applications where users navigate between routes
3. Crafter is typically loaded once and used continuously (no navigation)

### What We Implemented

We focused on **pragmatic optimizations** with measurable impact:

#### 1. Consumer-Side Lazy Loading (Biggest Impact)

The most significant optimization is **not loading Crafter at all** until it's needed. Many applications have pages where the editor isn't immediately visible (e.g., landing pages, dashboards with an "Edit" button).

**Before Optimization:**

```typescript
// Editor loaded immediately on page load (2 MB / 600 KB gzip)
import { UJLCrafter } from "@ujl-framework/crafter";
const editor = new UJLCrafter({ target: "#editor" });
```

**After Optimization:**

```typescript
// Editor loaded only when user clicks "Edit" button
async function loadEditor() {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	return new UJLCrafter({ target: "#editor" });
}

document.querySelector("#edit-btn")?.addEventListener("click", async () => {
	const editor = await loadEditor();
});
```

**Impact**:

- Initial bundle size: **-2.0 MB** (-600 KB gzip)
- Time to Interactive: **-30-50%** (on pages without editor)
- Editor loads in ~200-300ms when requested

**This optimization requires no changes to the framework** - it's purely a consumption pattern documented for users.

#### 2. Framework-Side Lazy Loading

We identified dependencies that are only used in specific features and lazy-loaded them:

**Compressorjs** (image compression library, ~30 KB):

```typescript
// Before: Loaded immediately
import Compressor from "compressorjs";

// After: Loaded only when image compression is needed
let CompressorClass: typeof import("compressorjs").default | null = null;

async function getCompressor() {
	if (!CompressorClass) {
		const module = await import("compressorjs");
		CompressorClass = module.default;
	}
	return CompressorClass;
}
```

This means compressorjs is only loaded when a user actually uploads an image, not on editor initialization.

**Impact**: -30 KB initial bundle size

#### 3. Parallel Font Loading (Documentation Site)

In the documentation site's `CrafterDemo.vue` component, fonts were loaded synchronously, blocking the editor. We changed this to parallel loading:

```typescript
// Before: Sequential loading (fonts block editor)
import "@fontsource-variable/inter";
import "@fontsource-variable/open-sans";
// ... 8 more fonts

// After: Parallel loading
async function loadFonts() {
	await Promise.all([
		import("@fontsource-variable/inter"),
		import("@fontsource-variable/open-sans"),
		// ... 8 more fonts
	]);
}

onMounted(async () => {
	// Load fonts and Crafter in parallel
	const [, { UJLCrafter }] = await Promise.all([loadFonts(), import("@ujl-framework/crafter")]);
});
```

**Impact**: Fonts and editor load concurrently instead of sequentially, improving perceived performance.

#### 4. Bundle Size Monitoring

We added `size-limit` to prevent bundle size regressions:

```json
// .size-limit.json
[
	{
		"name": "@ujl-framework/crafter",
		"path": "packages/crafter/dist/index.js",
		"limit": "2.5 MB"
	},
	{
		"name": "@ujl-framework/adapter-web",
		"path": "packages/adapter-web/dist/index.js",
		"limit": "1 MB"
	}
	// ... more packages
]
```

Running `pnpm run size` in CI will fail if any package exceeds its limit, preventing accidental size increases.

#### 5. Bundle Analysis Tooling

We added `rollup-plugin-visualizer` to generate interactive bundle composition reports:

```bash
pnpm --filter @ujl-framework/crafter build:analyze
```

This generates `packages/crafter/stats.html`, showing exactly what's in the bundle and where the size comes from.

## Usage Guide

### When to Use Crafter (Full Bundle)

Use Crafter when:

- You want a drop-in editor without managing dependencies
- You're integrating into a non-Svelte project (React, Vue, Angular, vanilla JS)
- You need framework-agnostic Web Components
- You're building a CMS or embedding an editor in an existing application

**Example:**

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";

const editor = new UJLCrafter({
	target: "#editor",
	content: ujlcDocument,
	tokenSet: ujltTokenSet,
});
```

### When to Use adapter-svelte (Lean Build)

Use `adapter-svelte` when:

- You have a SvelteKit application
- You want to minimize bundle size through peer dependencies
- You need native Svelte component integration

**Example:**

```svelte
<script>
	import { AdapterRoot } from "@ujl-framework/adapter-svelte";
	import "@ujl-framework/adapter-svelte/styles";
</script>

<AdapterRoot node={ast} {tokenSet} mode="system" />
```

### When to Use Lazy Loading

Lazy loading the editor is beneficial when:

- The editor is not immediately visible on page load
- Your application has landing pages or dashboards where editing is optional
- Your application uses route-based navigation and the editor is only on certain routes

**Do NOT use lazy loading when:**

- The editor is always visible and needed immediately
- Your application is a single-page editor-focused tool

**Implementation Examples:**

#### Vanilla JavaScript

```typescript
// Load editor on-demand
async function loadEditor() {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	return new UJLCrafter({ target: "#editor" });
}

// Example: Load on button click
document.querySelector("#edit-btn")?.addEventListener("click", async () => {
	const editor = await loadEditor();
});
```

#### SvelteKit (Route-based Code Splitting)

```typescript
// routes/edit/+page.ts
export const load = async () => {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	return { UJLCrafter };
};
```

```svelte
<!-- routes/edit/+page.svelte -->
<script lang="ts">
	import { onMount } from "svelte";

	let { data } = $props();
	let editorContainer: HTMLElement;

	onMount(() => {
		const editor = new data.UJLCrafter({
			target: editorContainer,
		});
		return () => editor.destroy();
	});
</script>

<div bind:this={editorContainer}></div>
```

#### React

```tsx
import { lazy, Suspense, useState } from "react";

const UJLEditor = lazy(() => import("./UJLEditorWrapper"));

function App() {
	const [showEditor, setShowEditor] = useState(false);

	return (
		<div>
			<button onClick={() => setShowEditor(true)}>Open Editor</button>

			{showEditor && (
				<Suspense fallback={<div>Loading editor...</div>}>
					<UJLEditor />
				</Suspense>
			)}
		</div>
	);
}
```

```tsx
// UJLEditorWrapper.tsx
import { useEffect, useRef } from "react";
import { UJLCrafter } from "@ujl-framework/crafter";

export default function UJLEditorWrapper() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const editor = new UJLCrafter({
			target: containerRef.current,
		});

		return () => editor.destroy();
	}, []);

	return <div ref={containerRef} />;
}
```

#### Vue 3

```vue
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

const showEditor = ref(false);
const UJLEditor = defineAsyncComponent(() => import("./UJLEditorWrapper.vue"));
</script>

<template>
	<button @click="showEditor = true">Open Editor</button>

	<Suspense v-if="showEditor">
		<template #default>
			<UJLEditor />
		</template>
		<template #fallback>
			<div>Loading editor...</div>
		</template>
	</Suspense>
</template>
```

## Performance Metrics

| Scenario                         | Without Lazy Loading | With Lazy Loading |
| -------------------------------- | -------------------- | ----------------- |
| Initial Bundle                   | +2.0 MB              | +0 KB             |
| Initial Bundle (gzip)            | +600 KB              | +0 KB             |
| Time to Interactive (pages w/o editor) | Baseline       | -30-50%           |
| Editor Load Time (when requested)| 0 ms (already loaded)| ~200-300 ms       |

## Bundle Analysis Tools

### Visualizing Bundle Composition

Generate an interactive bundle analysis report:

```bash
pnpm --filter @ujl-framework/crafter build:analyze
```

This creates `packages/crafter/stats.html` with an interactive treemap showing:

- Which dependencies contribute to bundle size
- Gzip and Brotli compressed sizes
- Module relationships and imports

### Monitoring Bundle Sizes

Check current bundle sizes against limits:

```bash
pnpm run size
```

This runs `size-limit` with the following configuration:

| Package          | Limit  | Actual (brotli) |
| ---------------- | ------ | --------------- |
| `crafter`        | 2.5 MB | ~540 KB         |
| `adapter-web`    | 1.0 MB | ~142 KB         |
| `core`           | 200 KB | ~23 KB          |
| `types`          | 60 KB  | ~9 KB           |

If any package exceeds its limit, the command will fail, preventing bundle size regressions in CI/CD.

## Summary

The UJL Framework's bundle strategy is **intentionally multi-faceted**:

1. **Crafter (Full Bundle)**: Framework-agnostic, drop-in ready, 2 MB uncompressed / 600 KB gzip. This is industry-standard for WYSIWYG editors and prioritizes ease of use.

2. **adapter-svelte (Lean Build)**: Peer dependency-based, 380 KB uncompressed / 120 KB gzip. Optimized for SvelteKit applications with existing build pipelines.

3. **Consumer-Side Lazy Loading**: The biggest performance optimization (**-2 MB / -600 KB gzip**) comes from not loading the editor until needed. This is a usage pattern, not a framework change.

4. **Framework-Side Lazy Loading**: Features like image compression are loaded on-demand, reducing initial bundle by ~30 KB.

5. **Monitoring**: Bundle size limits and analysis tools prevent regressions and provide visibility into bundle composition.

This architecture balances **ease of use** (drop-in bundles) with **performance** (lazy loading, peer dependencies) without sacrificing either. Developers choose the integration path that matches their requirements.
