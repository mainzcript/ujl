# UJL-Framework

**Unified JSON Layout (UJL)** - The Open-Source Web-Builder of the Future

## About UJL

**Unified JSON Layout (UJL)** is a building block system for digital content with a core promise:

> **Create and maintain brand-compliant and accessible websites with AI.**

UJL comes with an editor – the UJL **Crafter** – that enables content teams to work autonomously while guaranteeing brand compliance and accessibility. Unlike traditional solutions where design rules can be broken, UJL enforces them architecturally through strict separation of content and design.

A central concept of UJL is the strict separation of content and design. Unlike HTML and CSS, where content and styling are technically separated, UJL works at a higher abstraction level. Content is structured and described through modules as reusable building blocks in a JSON format (`.ujlc.json`), while design specifications are centrally stored in a `.ujlt.json` file. The UJL Renderer combines both elements and generates a **ContentFrame** (HTML/CSS/JS) that consistently adheres to the corporate design.

### Core Concepts

- **Brand-Compliance by Design**: Design rules are technically enforced, not optional. Editors cannot break brand guidelines.
- **Accessibility Guaranteed**: WCAG compliance is built into the architecture, not added as an afterthought.
- **Separation of Content and Design**: Content in `.ujlc.json` files, design in `.ujlt.json` theme files
- **AI-native**: JSON structure optimized for language models. AI generates structured data validated against schemas.
- **Modular & Open Source**: Fully open source (MIT license) and extensible
- **Easy Integration**: Adapts to existing systems (CMS, SaaS platforms)
- **Framework-Agnostic**: Works with any framework via adapters (Svelte, Web Components, and more)

## Project Structure

```
ujl/
├── packages/
│   ├── core/           # Schemas, Validator, Renderer, Image Library System
│   ├── types/          # TypeScript types and Zod schemas
│   ├── ui/             # Shadcn-svelte UI Components
│   ├── crafter/        # Visual UJL Editor with Image Library Integration
│   ├── adapter-svelte/ # Svelte Adapter (Svelte 5)
│   ├── adapter-web/    # Web Adapter (Custom Elements)
│   └── examples/       # Example Material and Test Data
├── services/
│   └── library/        # UJL Library – Asset Management API (Payload CMS)
└── apps/
    └── docs/           # Documentation Website
```

## Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Developer Guidelines](./docs/) - Testing, code review, and more
- [AI Agent Context](./AGENTS.md) - High-level overview for AI assistants
- [User Documentation](./apps/docs/) - Architecture and getting started

## Getting Started

For a full setup walkthrough, see the VitePress docs:

- [Installation & Integration](./apps/docs/src/docs/02-installation.md)

If you want a minimal local demo first:

```bash
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

This launches the Crafter demo on `http://localhost:5174`.

## CI/CD & Releases

**CI Pipeline** runs automatically on pull requests targeting `main` via GitHub Actions:
- Build all packages
- Run unit tests (Vitest)
- Run E2E tests (Playwright)
- Quality checks (ESLint, TypeScript)

**Releases** are performed manually using Changesets. For the complete release process and version management, see the [Contributing Guide](./CONTRIBUTING.md#release-process).

## License

MIT
