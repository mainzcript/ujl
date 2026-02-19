---
title: "How to Get Started with UJL"
description: "Get UJL running in minutes, try the live demo or install the package."
---

# How to Get Started with UJL

The fastest way to see UJL in action is the live demo below. To integrate UJL into your own project, jump straight to [Install](#install).

## Demo {#demo}

<ClientOnly>
	<CrafterDemo />
</ClientOnly>

**What you can do in the demo:**

- **Editor mode**, edit content: text, images, buttons, and more
- **Designer mode**, adjust design tokens: colors, fonts, spacing
- All changes are local to your browser and reset on reload
- For production use, see [Installation](/guide/installation)

## Install {#install}

UJL has two main packages depending on your use case:

```bash
# Full visual editor, embed anywhere (framework-agnostic)
npm install @ujl-framework/crafter

# Rendering only, display UJL documents without an editor
npm install @ujl-framework/adapter-web
```

## Minimal example

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

new UJLCrafter({ target: "#app" });
```

The Crafter is stateless, you pass it a document and theme, it calls you back on changes. How and where you persist data is entirely up to you.

## Next steps

- [Full Installation Guide](/guide/installation), real projects, SvelteKit, lazy loading
- [Core Concepts](/guide/concepts), understand UJLC/UJLT, the Composer, the AST, and Adapters
- [Architecture Overview](/reference/overview), how all the packages fit together
