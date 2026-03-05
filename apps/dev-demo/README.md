# UJL Dev Demo

Minimal integration demo for the UJL Crafter – a visual editor for UJL documents.

This app is a **SvelteKit** application that demonstrates how to embed the Crafter with inline library storage (assets stored as Base64 directly in the document).

## Quick Start

```bash
# From the repository root
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

This starts the Crafter at [http://localhost:5174](http://localhost:5174).

## Project Structure

```
apps/dev-demo/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   ├── routes/
│   │   ├── +layout.svelte      # Fonts, global styles
│   │   └── +page.svelte        # Crafter mount
│   └── lib/
│       └── modules/
│           └── testimonial.ts  # Example custom module
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Configuration

No environment configuration required for the basic demo. The Crafter uses `InlineLibraryProvider` by default, storing all assets directly in the `.ujlc.json` document.

## Debugging

The Crafter instance is exposed on `window.crafter`:

```javascript
window.crafter.getDocument();
window.crafter.getTheme();
window.crafter.getMode();
```

## Custom Library Providers

To use a custom library provider (e.g. your own API for asset storage), pass a provider implementing the `LibraryProvider` interface when initializing the Crafter:

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#editor",
	libraryProvider: myCustomProvider, // Your LibraryProvider implementation
});
```

See the [Library Providers guide](https://ujl-framework.org/guide/library-providers) for details on implementing custom providers.

## Related Documentation

- [UJL Crafter](../../packages/crafter/README.md) – Visual editor component
- [UJL Framework](../../README.md) – Project overview
