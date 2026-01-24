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

Das Validierungs-System erkennt automatisch den Dokumenttyp aus der JSON-Struktur (`ujlt` oder `ujlc` Root-Property) und liefert detaillierte Statistiken und Warnungen. TypeScript-Typen werden aus Zod-Schemas generiert, was vollständige Type-Safety gewährleistet. Intelligente Checks validieren Farbkontraste, ID-Eindeutigkeit und Verschachtelungstiefe. Das CLI-Tool `ujl-validate` ermöglicht die Integration in CI/CD-Pipelines.

## Library Types

This package includes comprehensive type definitions for the library system. Currently, only image types are defined, with additional media types planned for future releases.

### Image Entry Types

```typescript
// Image entry with URL and metadata
type ImageEntry = {
	src: string; // Image URL (HTTP or Base64 Data-URL)
	metadata: ImageMetadata; // Technical metadata about the image
};

// Image metadata
type ImageMetadata = {
	filename: string;
	mimeType: string;
	filesize: number;
	width: number;
	height: number;
};

// Image source for AST rendering
type ImageSource = {
	src: string; // Image URL (HTTP or Base64 Data-URL)
};
```

### Image Library Configuration

The `UJLCMeta` type includes optional image library configuration:

```typescript
type UJLCMeta = {
	title: string;
	// ... other meta fields
	_library?: {
		storage: "inline" | "backend";
		url?: string; // Required for backend storage
	};
};
```

### Image Field Types

The `UJLImageData` type is used by the ImageField:

```typescript
type UJLImageData = {
	imageId: string | number; // References entry in ujlc.images
	alt: string;
};
```

### UJLC Document Structure

Image entries are stored in the document at `ujlc.images`:

```typescript
type UJLCDocument = {
	ujlc: {
		meta: UJLCMeta;
		images: Record<string, ImageEntry>; // Library entries (currently images)
		root: UJLCModuleObject[];
	};
};
```
