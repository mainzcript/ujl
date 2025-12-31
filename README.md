# UJL-Framework

**Unified JSON Layout (UJL)** - The Open-Source Web-Builder of the Future

## About UJL

**Unified JSON Layout (UJL)** is a building block system for digital content with a core promise:

> **Create and maintain brand-compliant and accessible websites with AI.**

UJL is an editor – the UJL **Crafter** – that enables content teams to work autonomously while guaranteeing brand compliance and accessibility. Unlike traditional solutions where design rules can be broken, UJL enforces them architecturally through strict separation of content and design.

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
│   ├── core/           # Schemas, Validator, Renderer
│   ├── ui/             # Shadcn-svelte UI Components
│   ├── crafter/        # Visual UJL Editor
│   ├── adapter-svelte/ # Svelte Adapter (Svelte 5)
│   ├── adapter-web/    # Web Adapter (Custom Elements)
│   └── examples/       # Example Material and Test Data
├── services/           # Backend Services (Docker-based)
│   └── media/          # Payload CMS-based Media Management
└── apps/
    ├── demo/           # Demo Application
    └── docs/           # Documentation Website
```

## Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Developer Guidelines](./docs/) - Testing, code review, and more
- [AI Agent Context](./AGENTS.md) - High-level overview for AI assistants
- [User Documentation](./apps/docs/) - Architecture and getting started

## CI/CD

The project uses GitLab CI/CD with the following pipeline stages:

- **install** - Install dependencies (with cache)
- **build** - Build packages + docs
- **test** - Unit tests (Vitest) across all packages
- **quality** - Linting + type checking
- **deploy** - GitLab Pages (only main/develop)

Configuration: [`.gitlab-ci.yml`](./.gitlab-ci.yml)

## License

Open source (license is still pending, but will most likely be MIT). The project will definitely be released under a permissive open source license.
