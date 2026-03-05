# UJL Demo

Minimal Vite + TypeScript example that mounts the UJL Crafter.

## Quick Start

```bash
pnpm install
pnpm --filter @ujl-framework/demo dev
```

Open [http://localhost:5174](http://localhost:5174).

## What this demo does

- Uses `UJLCrafter` from `@ujl-framework/crafter`
- Loads `showcaseDocument` and `defaultTheme` from `@ujl-framework/examples`
- Imports the default Designer fonts via Fontsource
- Mounts the editor into `#app`
- Exposes the instance as `window.crafter` for quick debugging
