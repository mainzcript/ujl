<div align="center">

<img src="apps/docs/src/public/assets/logo-icon.png" alt="UJL Framework" width="120" />

# UJL Framework

**No more off-brand websites.**

An AI-native framework that generates accessible, on-brand UI from structured content and design rules.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@ujl-framework/crafter.svg)](https://www.npmjs.com/package/@ujl-framework/crafter)

[Documentation](https://ujl-framework.org) · [Getting Started](https://ujl-framework.org/guide/quickstart) · [Live Demo](https://ujl-framework.org/guide/quickstart#demo)

</div>

---

## What is UJL?

UJL (Unified JSON Layout) is an open-source framework for building web content with **brand compliance and WCAG accessibility built in, not bolted on**. Unlike traditional page builders where design rules can be broken, UJL enforces them architecturally through strict separation of content and design.

**The problem:** Editors want to create content quickly. Designers need brand guidelines to hold. Developers get caught in the middle. Reviews, approvals, and fixes eat time.

**The solution:** UJL moves enforcement into the architecture. Content and design rules are described in a way that the system can only produce valid, compliant results. Not by convention. Not by process. **By construction.**

## Key Features

- **Brand Compliance by Design** – Design changes apply globally and instantly. Editors compose freely within guardrails they cannot override.
- **Accessibility Guaranteed** – WCAG contrast ratios and semantic HTML are enforced architecturally, not verified after the fact.
- **AI-Native** – Structured JSON optimized for language models. Schema validation ensures AI-generated content is always compliant.
- **Open Source & Integrable** – MIT licensed and framework-agnostic. Embed the full editor anywhere, or use the lean Svelte adapter inside your own stack.

## Quick Start

### Install

```bash
npm install @ujl-framework/crafter
```

### Minimal Example

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

new UJLCrafter({ target: "#app" });
```

### With Document and Theme

The Crafter is stateless. Pass it a document and theme, it calls you back on changes. How and where you persist data is entirely up to you.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
  target: "#app",
  content: ujlcDocument,    // your .ujlc.json document
  tokenSet: ujltTokenSet,   // your .ujlt.json theme
  onChange: (updatedDoc) => {
    // persist however you like
    saveDocument(updatedDoc);
  },
});
```

### Try the Demo

Clone this repository and run the included demo:

```bash
git clone https://github.com/mainzcript/ujl.git
cd ujl
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

Open `http://localhost:5174` to see the Crafter in action.

## Project Structure

```
ujl/
├── packages/
│   ├── core/           # Schemas, Validator, Renderer, Composer
│   ├── types/          # TypeScript types and Zod schemas
│   ├── ui/             # Shadcn-svelte UI Components
│   ├── crafter/        # Visual UJL Editor (~600 KB gzip)
│   ├── adapter-svelte/ # Svelte 5 Adapter (~120 KB gzip)
│   ├── adapter-web/    # Web Components Adapter (~280 KB gzip)
│   └── examples/       # Example Content & Test Data
├── services/
│   └── library/        # UJL Library – Asset Management API (Payload CMS)
└── apps/
    └── docs/           # Documentation Website (VitePress)
```

## Packages

| Package                         | Purpose                                 | Size (gzip) | npm                                                                                                                           |
| ------------------------------- | --------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@ujl-framework/crafter`        | Full visual editor, embed anywhere      | ~600 KB     | [![npm](https://img.shields.io/npm/v/@ujl-framework/crafter)](https://npmjs.com/package/@ujl-framework/crafter)               |
| `@ujl-framework/adapter-web`    | Web Components rendering, no editor     | ~280 KB     | [![npm](https://img.shields.io/npm/v/@ujl-framework/adapter-web)](https://npmjs.com/package/@ujl-framework/adapter-web)       |
| `@ujl-framework/adapter-svelte` | Svelte 5 native rendering for SvelteKit | ~120 KB     | [![npm](https://img.shields.io/npm/v/@ujl-framework/adapter-svelte)](https://npmjs.com/package/@ujl-framework/adapter-svelte) |
| `@ujl-framework/core`           | Composition utilities                   | ~50 KB      | [![npm](https://img.shields.io/npm/v/@ujl-framework/core)](https://npmjs.com/package/@ujl-framework/core)                     |
| `@ujl-framework/types`          | TypeScript definitions                  | ~10 KB      | [![npm](https://img.shields.io/npm/v/@ujl-framework/types)](https://npmjs.com/package/@ujl-framework/types)                   |

## Documentation

- [**Full Documentation**](https://ujl-framework.org) – Architecture, guides, and API reference
- [**Getting Started**](https://ujl-framework.org/guide/quickstart) – Installation and first steps
- [**Live Demo**](https://ujl-framework.org/guide/quickstart#demo) – Try the Crafter in your browser
- [**Packages Overview**](https://ujl-framework.org/reference/packages) – What each package does
- [**Roadmap**](https://ujl-framework.org/about/roadmap) – Where UJL is going

## Core Concepts

### Strict Content/Design Separation

Content lives in **`.ujlc.json`** files (UJL Content Document). Design rules live in **`.ujlt.json`** files (UJL Theme Document). The Composer combines them into an Abstract Syntax Tree (AST), which Adapters render into your target framework.

```
.ujlc.json (content) + .ujlt.json (theme) → Composer → AST → Adapter → Output
```

Because design rules aren't embedded in content, a theme update propagates everywhere instantly. Because editors only touch `.ujlc`, they literally cannot change colors or typography—the data model doesn't allow it.

### AI-Native Architecture

Structured JSON is optimized for language models. Schema validation ensures AI-generated content is always compliant. Small models, big results.

### Not a CMS

UJL is a **visual layout layer**, not a content management system. It doesn't handle routing, user accounts, publishing workflows, or content storage. It integrates with existing CMS and frontend stacks—it doesn't replace them.

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Testing and code review
- Release process
- Pull request guidelines

For AI assistants working on this project, see [AGENTS.md](AGENTS.md) for a high-level overview.

## Community

- [Issues](https://github.com/mainzcript/ujl/issues) – Report bugs or request features
- [Website](https://ujl-framework.org) – Full documentation and guides

## Built by

<div align="center">

**[mainzcript](https://mainzcript.eu)** – Growing. Own. IT.

</div>

UJL is developed and maintained by [mainzcript GbR](https://mainzcript.eu), a young software studio based in Mainz, Germany.

## License

MIT – see [LICENSE](LICENSE) for details.

---

<div align="center">

**[Documentation](https://ujl-framework.org)** · **[Getting Started](https://ujl-framework.org/guide/quickstart)** · **[GitHub](https://github.com/mainzcript/ujl)**

</div>
