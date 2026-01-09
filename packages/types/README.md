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

## Media Library Types

This package includes comprehensive type definitions for the media library system:

### Media Entry Types

```typescript
// Inline storage - media embedded as Base64
type UJLCMediaEntryInline = {
	id: string;
	storage: "inline";
	data: string; // Base64-encoded data URL
};

// Backend storage - media stored on Payload CMS
type UJLCMediaEntryBackend = {
	id: string;
	storage: "backend";
	mediaId: string; // Reference to Payload CMS media document
};

// Union type for all media entries
type UJLCMediaEntry = UJLCMediaEntryInline | UJLCMediaEntryBackend;
```

### Media Library Configuration

The `UJLCMeta` type includes optional media library configuration:

```typescript
type UJLCMeta = {
	title: string;
	// ... other meta fields
	media_library?: {
		storage: "inline" | "backend";
		endpoint?: string; // Required for backend storage
	};
};
```

### Image Field Types

The `UJLImageData` type is used by the ImageField:

```typescript
type UJLImageData = {
	mediaId: string; // References entry in ujlc.media
	alt: string;
};
```

### UJLC Document Structure

Media entries are stored in the document at `ujlc.media`:

```typescript
type UJLCDocument = {
	ujlc: {
		meta: UJLCMeta;
		media: Record<string, UJLCMediaEntry>; // Media library entries
		root: UJLCModuleObject[];
	};
};
```
