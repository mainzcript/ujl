# UJL Demo App

This application demonstrates the `@ujl-framework/adapter-web` package in a minimal vanilla TypeScript setup. It showcases how to use the framework-agnostic web adapter to render UJL documents as Custom Elements without requiring Svelte build tools.

---

## Installation

```bash
pnpm install
```

## Usage

### Development Server

```bash
pnpm run dev
```

The demo loads a showcase UJL document and renders it using the `webAdapter` function. Open the development server URL in your browser to see the rendered UJL content.

### What This Demo Shows

- **Framework-agnostic rendering**: Using UJL without Svelte build tools
- **Custom Elements**: Rendering UJL documents as Web Components
- **Theme support**: Applying design tokens to rendered content
- **Editor features**: Click-to-select functionality with metadata

## UJL Validator Usage

This demo also includes examples of using the UJL validator.

### CLI

```bash
# Using the demo package script
pnpm validate ./src/invalid.ujlc.json

# Or using the CLI tool directly
pnpm ujl-validate ./src/invalid.ujlt.json
```

### Programmatic Usage

```bash
npx tsx ./src/validation-showcase.ts
```

This demonstrates how to validate UJL documents programmatically using the `@ujl-framework/types` package.

## Project Structure

```
src/
├── main.ts              # Entry point, initializes webAdapter
├── invalid.ujlc.json    # Example invalid document for validation
├── invalid.ujlt.json    # Example invalid theme for validation
└── validation-showcase.ts  # Programmatic validation example
```

## Related

- [adapter-web README](../../packages/adapter-web/README.md) - Full adapter documentation
- [UJL Framework README](../../README.md) - Core concepts and architecture
