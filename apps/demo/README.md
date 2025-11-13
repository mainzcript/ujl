# UJL Demo App

This application demonstrates the `@ujl-framework/adapter-web` package in a minimal vanilla TypeScript setup. It showcases how to use the framework-agnostic web adapter to render UJL documents as Custom Elements without requiring Svelte build tools.

## Usage

```bash
pnpm install
pnpm run dev
```

The demo loads a showcase UJL document and renders it using the `webAdapter` function.


## UJL-Validator Usage

### CLI
```bash
pnpm validate ./src/invalid.ujlc.json # command from demo package.json

or

pnpm ujl-validate ./src/invalid.ujlt.json # command from imported core package
```

### Programmatic Usage

```bash
npx tsx ./src/validation-showcase.ts
```