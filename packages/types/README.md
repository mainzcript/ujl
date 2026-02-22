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

The validation system automatically detects the document type from the JSON structure (`ujlt` or `ujlc` root property) and provides detailed statistics and warnings. TypeScript types are inferred from Zod schemas, ensuring full type safety. Smart checks validate color contrasts, ID uniqueness, and nesting depth. The `ujl-validate` CLI tool enables integration into CI/CD pipelines.

## Library Types

This package includes type definitions for the asset library system.

### Asset Entry Types

```typescript
// Asset entry with URL and metadata
type AssetEntry = {
	src: string; // Asset URL (HTTP or Base64 Data-URL)
	metadata: AssetMetadata; // Descriptive metadata about the asset
};

// Asset metadata
// mimeType and filesize are intentionally omitted — providers read them
// directly from the File object or from the backend response.
type AssetMetadata = {
	filename: string;
	width: number;
	height: number;
};

// Image source for AST rendering
type ImageSource = {
	src: string; // Image URL (HTTP or Base64 Data-URL)
};
```

### Library Provider Configuration

The `UJLCMeta` type includes optional library provider configuration:

```typescript
type UJLCMeta = {
	title: string;
	// ... other meta fields
	_library?: {
		provider: "inline" | "backend";
		url?: string; // Required for backend provider (direct mode)
	};
};
```

### Image Field Types

The `UJLImageData` type is used by the ImageField:

```typescript
type UJLImageData = {
	imageId: string | number; // References entry in ujlc.library
	alt: string;
};
```

### UJLC Document Structure

Asset entries are stored in the document at `ujlc.library`:

```typescript
type UJLCDocument = {
	ujlc: {
		meta: UJLCMeta;
		library: Record<string, AssetEntry>; // Library entries (assets)
		root: UJLCModuleObject[];
	};
};
```
