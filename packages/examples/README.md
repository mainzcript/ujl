# @ujl-framework/examples - Example Material and Test Data

This package contains example UJL content files (`.ujlc.json`), theme files (`.ujlt.json`), and test data that can be used across the UJL Framework for development, testing, and documentation purposes.

---

## Installation

```bash
pnpm add @ujl-framework/examples
```

## Usage

```typescript
import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };
import { Composer } from "@ujl-framework/core";
```

`showcaseDocument` is a comprehensive example UJL document demonstrating various module types. `defaultTheme` is a default theme (`.ujlt.json`) with complete design tokens including colors, radius, and flavor definitions.

## Structure

```
examples/
├── src/
│   ├── documents/        # Example .ujlc.json files
│   ├── themes/           # Example .ujlt.json files
│   └── index.ts          # Package exports
└── documents/            # Legacy location (still referenced in package.json)
```

## Component Library

This package includes a manual Component Library definition in `src/components/component-library.ts` that is used by the Crafter's component picker.

> **⚠️ TODO: Automatic Generation from Registry**
>
> The Component Library is currently manually maintained, which creates a maintenance burden. When modules are added or changed in `@ujl-framework/core`, this file must be manually updated.
>
> **Future Improvement:** The Component Library should be automatically generated from the Module Registry in `@ujl-framework/core`. This would eliminate manual maintenance and make it easier for developers to add new modules.
>
> See `src/components/component-library.ts` for TODO comments and details.

## Contributing

When adding new example files:

1. Place `.ujlc.json` files in `src/documents/`
2. Place `.ujlt.json` files in `src/themes/`
3. Import and export them in `src/index.ts`
4. Ensure they conform to the type definitions in `@ujl-framework/types`

When adding new modules to `@ujl-framework/core`:

1. **Currently:** Manually update `src/components/component-library.ts` with the new module definition
2. **Future:** This will be automatic once Component Library generation from Registry is implemented
