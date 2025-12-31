# @ujl-framework/types

**Type Definitions and Validation** - TypeScript types, Zod schemas, and validation utilities for the UJL Framework.

This package provides runtime validation for both theme and content files using Zod schemas. It also includes all TypeScript type definitions for the UJL Framework, ensuring type safety across the entire ecosystem.

---

## Installation

```bash
pnpm add @ujl-framework/types
```

## Validation

### Quick Start

```bash
# Auto-detect type from JSON structure
pnpm run validate ./path/to/file.json

# Or use the CLI tool directly (after installation)
ujl-validate ./path/to/file.json

# Validate specific files
pnpm run validate ./default.ujlt.json
pnpm run validate ./showcase.ujlc.json
```

### Programmatic Usage

```typescript
import {
	validateUJLCDocumentSafe,
	validateUJLTDocumentSafe,
	validateModule,
	validateSlot,
} from "@ujl-framework/types";

// Validate complete documents (safe - returns result object)
const themeResult = validateUJLTDocumentSafe(theme);
if (themeResult.success) {
	console.log("Valid:", themeResult.data);
} else {
	console.error("Invalid:", themeResult.error.issues);
}

// Validate partial structures (throws on error)
const validatedModule = validateModule(moduleData);
const validatedSlot = validateSlot(slotData);
```

**Available Functions:**

- `validateUJLTDocumentSafe(data)` - Safe validation for theme documents
- `validateUJLCDocumentSafe(data)` - Safe validation for content documents
- `validateUJLTDocument(data)` - Throwing validation for theme documents
- `validateUJLCDocument(data)` - Throwing validation for content documents
- `validateModule(data)` - Validate a single module
- `validateSlot(data)` - Validate a slot (array of modules)
- `validateTokenSet(data)` - Validate theme token set only

### Features

- **Auto-detection** - Automatically detects document type from JSON structure (checks for `ujlt` or `ujlc` root property)
- **Rich output** - Detailed statistics and validation warnings
- **Type-safe** - Generated TypeScript types from Zod schemas
- **Smart checks** - Validates color contrasts, unique IDs, nesting depth
- **CLI Tool** - Standalone `ujl-validate` command for CI/CD integration
