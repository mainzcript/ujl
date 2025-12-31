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

## Contributing

When adding new example files:

1. Place `.ujlc.json` files in `src/documents/`
2. Place `.ujlt.json` files in `src/themes/`
3. Import and export them in `src/index.ts`
4. Ensure they conform to the type definitions in `@ujl-framework/types`

When adding new modules to `@ujl-framework/core`:

1. Implement `ModuleBase` with optional UI metadata (label, description, category, tags)
2. Register the module in the default registry
3. Modules are automatically available in the registry - no manual updates needed!
