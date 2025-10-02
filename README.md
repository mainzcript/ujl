# UJL-Framework

**Unified JSON Layout (UJL)** - The Open-Source Web-Builder of the Future

## About UJL

UJL is a building block system for digital content. At its heart is an editor – the UJL **Crafter** – with which content can be managed and combined.
A central concept of UJL is the strict separation of content and design. Unlike HTML and CSS, where content and styling are technically separated, UJL works at a higher abstraction level. Content is structured and described through modules (**AtomicModules** & **LayoutModules**) as reusable building blocks in a JSON format (`.ujl`), while design specifications are centrally stored in a `.ujlt` file. The UJL Renderer combines both elements and generates a **ContentFrame** (HTML/CSS/JS) that consistently adheres to the corporate design.

### Core Concepts

- **Separation of Content and Design**: Content in `.ujl` files, design in `.ujlt` theme files
- **Modular & Open Source**: Fully open source and extensible
- **LLM-ready by Design**: Optimized for language models and AI assistants
- **Easy Integration**: Adapts to existing systems

## Project Structure

```
ujl/
├── packages/
│   ├── core/           # Schemas, Validator, Renderer
│   ├── ui/             # Shadcn-svelte UI Components
│   ├── crafter/        # Visual UJL Editor
│   └── examples/       # Example Material and Test Data
├── services/           # Backend Services
└── apps/
    ├── landing/        # Marketing Landing Page
    ├── demo/           # Demo Application
    └── docs/           # Documentation Website
```

## Installation

```bash
# Clone repository
git clone git@gitlab.rlp.net:ujl-framework/ujl.git
cd ujl

# Install dependencies
pnpm install
```

## Development

```bash
# Install all dependencies
pnpm install

# Until now there is only one package that can be developed: the UI package.
# We will add more packages soon.

# Start development for UI package (SvelteKit + Storybook)
pnpm ui:dev          # Start UI package development
pnpm ui:storybook    # Start Storybook for UI components

# Build UI package
pnpm ui:build        # Build UI package
pnpm ui:build-storybook  # Build Storybook

# Run linting (all packages)
pnpm lint

# Run type checking (all packages)
pnpm type-check

# Clean all build outputs
pnpm clean
```

## License

TODO: Looks like it will be an MIT license.
