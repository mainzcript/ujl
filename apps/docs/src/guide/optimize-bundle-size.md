---
title: "How to Optimize UJL Bundle Size"
description: "Practical strategies for reducing UJL's impact on your page load, lazy loading, adapter selection, and monitoring."
---

# How to Optimize UJL Bundle Size

The Crafter is a full WYSIWYG editor. Like any rich text editor (Monaco, CKEditor, TinyMCE), it has a meaningful bundle size. This guide shows you how to keep that cost manageable.

## Understand the Numbers

| Package                         | Uncompressed | Gzip    | Strategy                        |
| ------------------------------- | ------------ | ------- | ------------------------------- |
| `@ujl-framework/crafter`        | ~2.0 MB      | ~600 KB | Full bundle, batteries included |
| `@ujl-framework/adapter-web`    | ~900 KB      | ~280 KB | Web Components, rendering only  |
| `@ujl-framework/adapter-svelte` | ~380 KB      | ~120 KB | Svelte peer dependency          |
| `@ujl-framework/core`           | ~150 KB      | ~50 KB  | Composition utilities           |
| `@ujl-framework/types`          | ~30 KB       | ~10 KB  | TypeScript definitions          |

**Is 600 KB gzip too large?** For a WYSIWYG editor: no. The comparable benchmarks are Monaco Editor (~4 MB), CKEditor 5 (~2 MB), and TinyMCE (~1.5 MB). The question isn't whether Crafter is large, it's whether you load it only when needed.

## Strategy 1: Lazy-Load the Crafter (Biggest Impact)

The most effective optimization is not loading the editor until the user actually needs it. Most applications have pages where editing is optional.

**Before:**

```javascript
// Editor loads on every page, 600 KB gzip always
import { UJLCrafter } from "@ujl-framework/crafter";
const editor = new UJLCrafter({ target: "#editor" });
```

**After:**

```javascript
// Editor only loads when the user clicks "Edit"
async function loadEditor() {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	return new UJLCrafter({ target: "#editor" });
}

document.querySelector("#edit-btn")?.addEventListener("click", async () => {
	await loadEditor();
});
```

**Impact:** -600 KB from initial bundle, -30-50% time to interactive on pages without the editor. The editor loads in ~200-300 ms when requested.

### SvelteKit (route-based code splitting)

```typescript
// routes/edit/+page.ts
export const load = async () => {
	const { UJLCrafter } = await import("@ujl-framework/crafter");
	return { UJLCrafter };
};
```

### React

```tsx
import { lazy, Suspense, useState } from "react";

const UJLEditor = lazy(() => import("./UJLEditorWrapper"));

function App() {
	const [showEditor, setShowEditor] = useState(false);

	return (
		<>
			<button onClick={() => setShowEditor(true)}>Open Editor</button>
			{showEditor && (
				<Suspense fallback={<div>Loading editor...</div>}>
					<UJLEditor />
				</Suspense>
			)}
		</>
	);
}
```

### Vue 3

```vue
<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

const showEditor = ref(false);
const UJLEditor = defineAsyncComponent(() => import("./UJLEditorWrapper.vue"));
</script>

<template>
	<button @click="showEditor = true">Open Editor</button>
	<Suspense v-if="showEditor">
		<UJLEditor />
		<template #fallback>Loading editor...</template>
	</Suspense>
</template>
```

## Strategy 2: Use adapter-svelte in SvelteKit

If you're building a SvelteKit application, use `@ujl-framework/adapter-svelte` instead of the full Crafter for the rendering side. It declares Svelte as a peer dependency, so your build pipeline can deduplicate and tree-shake:

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

This is 120 KB gzip instead of 600 KB, but only for rendering, not editing.

## Strategy 3: Monitor Bundle Size

UJL ships with `size-limit` configuration to prevent regressions in CI:

```bash
pnpm run size
```

This checks all packages against defined limits and fails if any exceed them, protecting against accidental size increases during development.

To inspect what's inside the bundle:

```bash
pnpm --filter @ujl-framework/crafter build:analyze
```

This generates `packages/crafter/stats.html`, an interactive treemap showing which dependencies contribute to the bundle and by how much.

## When NOT to Lazy-Load

Lazy loading adds ~200-300 ms latency when the editor loads. Skip it when:

- The editor is always visible immediately on page load
- Your application is a single-purpose editor tool (no navigation between routes)
- The extra latency is noticeable and unacceptable for your UX

In those cases, the synchronous import is correct.
