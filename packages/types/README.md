# @ujl-framework/types

**Type Definitions and Validation** - TypeScript types, Zod schemas, and validation utilities for the UJL Framework.

This package provides runtime validation for both theme and content files using Zod schemas. It also includes all TypeScript type definitions for the UJL Framework, ensuring type safety across the entire ecosystem.

## Installation

```bash
pnpm add @ujl-framework/types
```

## Validation

### Quick Start

```bash
# Auto-detect type from JSON structure
pnpm run validate ./path/to/file.json

# Use the CLI tool directly
ujl-validate ./path/to/file.json
```

### Programmatic Usage

```typescript
import {
	validateUJLCDocumentSafe,
	validateUJLTDocumentSafe,
	validateModule,
	validateSlot,
} from "@ujl-framework/types";

// Validate documents (safe - returns result object)
const result = validateUJLCDocumentSafe(document);
if (result.success) {
	console.log("Valid:", result.data);
} else {
	console.error("Invalid:", result.error.issues);
}

// Validate partial structures
const module = validateModule(moduleData);
const slot = validateSlot(slotData);
```

**Available Functions:**

- `validateUJLCDocumentSafe(data)` / `validateUJLCDocument(data)` - Content validation
- `validateUJLTDocumentSafe(data)` / `validateUJLTDocument(data)` - Theme validation
- `validateModule(data)` - Single module validation
- `validateSlot(data)` - Slot validation
- `validateTokenSet(data)` - Token set validation

## Library Types

Image assets use the `LibraryAssetImage` type:

```typescript
interface LibraryAssetImage {
	kind: "image";
	img: {
		src: string;
		width?: number;
		height?: number;
		srcset?: ImageSrcSet;
	};
	meta?: ImageMetadata; // Alt, caption, credits
	sources?: PictureSource[]; // Art direction
}
```

Stored in `ujlc.library` as `Record<string, LibraryAssetImage>`.

Terminology mapping:

- `LibraryAssetImage.img` = transport-level image payload (`src`, optional `srcset`, dimensions)
- AST image nodes (`UJLAbstractImageNode`) use `props.asset` to hold the selected `LibraryAssetImage`
- `ImageSource` / `ImageSrcSetType` are helper types used inside `LibraryAssetImage` (not a separate asset model)

**For full type definitions, see:**

- `library.ts` - Asset types and provider interfaces
- `ujl-content.ts` - Document and module types
- `ujl-theme.ts` - Theme and token types
- `ast.ts` - AST node types
