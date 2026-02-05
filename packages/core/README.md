# @ujl-framework/core

**The Heart of the UJL Framework** - A modular, type-safe system for building dynamic web layouts using an Abstract Syntax Tree (AST) architecture.

UJL Core provides the foundational building blocks for creating reusable, composable web layouts. Instead of writing HTML directly, you define layouts using `.ujlc.json` documents that get composed into AST nodes and rendered through adapters. This architectural approach enables **Brand-Compliance by Design** – design rules are enforced at the schema level, making it impossible for content editors to break brand guidelines or accessibility standards.

Die **modulare Architektur** ermöglicht wiederverwendbare Module mit Fields und Slots. Vollständige **TypeScript-Unterstützung** sorgt für Compile-Time-Validierung, während die **Erweiterbarkeit** das Hinzufügen eigener Module und Field-Types erlaubt. **Multiple Outputs** werden über Adapter ermöglicht (HTML, Svelte, Web Components). Die **AI-native JSON-Struktur** ist für LLMs optimiert und validiert KI-generierten Output gegen Schemas. **Brand-Compliance by Design** stellt durch Schema-Validierung sicher, dass nur valide, markenkonforme Layouts erstellt werden können. **Barrierefreiheit** ist durch semantisches HTML und WCAG-konforme Strukturen im Modulsystem eingebaut.

## Installation

```bash
pnpm add @ujl-framework/core
```

## Quick Start

```typescript
import { Composer } from "@ujl-framework/core";

// Create a UJLC document
const ujlcDocument = {
	ujlc: {
		meta: {
			title: "My First UJL Document",
			description: "A simple example",
			tags: ["example"],
			updated_at: "2024-01-15T10:30:00Z",
			_version: "0.0.1",
			_instance: "example-001",
			_embedding_model_hash: "model-hash-here",
		},
		root: [
			{
				type: "text",
				meta: {
					id: "text-001",
					updated_at: "2024-01-15T10:30:00Z",
					_embedding: [],
				},
				fields: { content: "Welcome to UJL Framework" },
				slots: {},
			},
			{
				type: "button",
				meta: {
					id: "button-001",
					updated_at: "2024-01-15T10:30:00Z",
					_embedding: [],
				},
				fields: { label: "Get Started", href: "https://ujl-framework.org" },
				slots: {},
			},
		],
	},
};

// Compose to AST
const composer = new Composer();
const ast = composer.compose(ujlcDocument);
// Use an adapter to render (e.g., HTML, Svelte, etc.)
```

## Architecture

### Data Flow

```
UJL Document (.ujlc.json)
    ↓
Composer (with Module Registry)
    ↓
AST (UJLAbstractNode with IDs)
    ↓
Adapter (HTML, Svelte, etc.)
    ↓
Output
```

### Core Concepts

For a high-level overview of UJL's architecture and core concepts, see the [UJL Framework README](../../../README.md#core-concepts).

This package implements the composition layer:

- **UJL Documents**: JSON-based layout descriptions (see types in `@ujl-framework/types`)
- **Composer**: Orchestrates composition using the module registry
- **Module Registry**: Manages available modules and provides type-safe access
- **AST Generation**: Creates abstract nodes with preserved IDs for downstream adapters

### Modules vs. AST Nodes

Understanding the distinction between **Modules** and **AST Nodes** is crucial for working with the UJL Framework.

**Modules** are the building blocks defined in `.ujlc.json` documents. They exist at the document level, are created by users or editors (via the Crafter or manually), and are registered in the Module Registry as `ModuleBase` implementations. Examples include `text`, `button`, `card`, `grid`, and `container` modules. These modules represent actual content components that can be edited and manipulated.

**AST Nodes**, on the other hand, are created during the composition phase by the Composer. They exist only in the Abstract Syntax Tree, not in the original document. Every AST node (except the root wrapper) has a `meta.moduleId` field that indicates which module it belongs to.

The key semantic distinction is:

- **`node.id`**: A unique, randomly generated identifier for the AST node itself (generated with `generateUid()`)
- **`meta.moduleId`**: "Zu welchem Modul gehört dieser Node?" (Set for all nodes except root wrapper)
- **`meta.isModuleRoot`**: "Ist dieser Node das Modul selbst?" (Only `true` for editable module nodes)

When a module is composed, it creates a primary AST node where `meta.isModuleRoot === true`. This node represents the module itself and is editable. However, modules may also generate additional AST nodes for structural purposes (like `grid-item` wrappers or internal buttons). These child nodes also have `meta.moduleId` set to the parent module's ID, but their `isModuleRoot` is `false` or `undefined`, making them non-editable parts of the module's structure.

**Example:**

When a Grid module is composed, the Grid module itself creates a `grid` AST node with:

- A unique `id` (generated with `generateUid()`)
- `meta.moduleId = "grid-001"` (from the UJLC document)
- `meta.isModuleRoot = true` (making it editable)

However, the Grid module also automatically creates `grid-item` AST nodes for each child with:

- Unique `id`s (generated with `generateUid()`)
- `meta.moduleId = "grid-001"` (they belong to the Grid module)
- `meta.isModuleRoot = false` (making them non-editable, but they still know they belong to the Grid module)

This architecture enables:

- Tracking modules through the composition pipeline
- Click-to-select in visual editors (only editable nodes are selectable)
- DOM element identification with `data-ujl-module-id` (set on all nodes with `meta.moduleId` when `showMetadata={true}`; editability is checked in the editor layer)
- Programmatic module manipulation

## Extensibility

### Creating Custom Fields

Extend `FieldBase<ValueT, ConfigT>` and implement three core methods:

```typescript
class EmailField extends FieldBase<string, EmailFieldConfig> {
	protected readonly defaultConfig = {
		label: "Email Address",
		description: "Enter a valid email address",
		default: "",
	};

	validate(raw: UJLCFieldObject): raw is string {
		return typeof raw === "string" && raw.includes("@");
	}

	fit(value: string): string {
		return value.toLowerCase().trim();
	}
}
```

**Key Methods:**

- `validate()`: Type checking and validation
- `fit()`: Apply business rules and constraints
- `parse()`: Combines validation and fitting (inherited)

### Creating Custom Modules

Extend `ModuleBase` and define your module structure:

```typescript
class CustomModule extends ModuleBase {
	readonly name = "custom-module";

	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];

	readonly slots = [{ key: "content", slot: new Slot({ label: "Content Area", max: 5 }) }];

	compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		const children = moduleData.slots.content.map((child) => composer.composeModule(child));

		return {
			type: "wrapper",
			props: {
				children: [{ type: "text", props: { content: moduleData.fields.title } }, ...children],
			},
		};
	}
}
```

**Template Files:** Use `src/fields/concretes/_template.ts` and `src/modules/concretes/_template.ts` as starting points.

### Registry Management

```typescript
// Default registry (includes all built-in modules)
const composer = new Composer();

// Add custom modules
composer.registerModule(new CustomModule());

// Custom registry
const registry = new ModuleRegistry();
registry.registerModule(new CustomModule());
const composer = new Composer(registry);
```

### Direct Module Registry Access

UI components can access modules directly from the registry. This provides a single source of truth without transformation overhead.

**Usage:**

```typescript
const composer = new Composer();

// Get all registered modules
const modules = composer.getRegistry().getAllModules();

// Get a specific module by type
const module = composer.getRegistry().getModule("text");

// Access module properties
if (module) {
	const label = module.label;
	const category = module.category;

	// Access field entries
	for (const fieldEntry of module.fields) {
		const fieldType = fieldEntry.field.getFieldType();
		const label = fieldEntry.field.config.label;
		const placeholder = fieldEntry.field.config.placeholder;
		const defaultValue = fieldEntry.field.config.default;
	}
}
```

**Module UI Metadata:**
All modules must provide UI metadata when implementing `ModuleBase`:

- `label: string` - Human-readable display name
- `description: string` - Description for component picker
- `category: ComponentCategory` - Category for grouping modules
- `tags: readonly string[]` - Searchable tags for filtering
- `icon: string` - SVG icon content (inner content of the SVG tag, without the svg wrapper). Use `getSvgIcon()` to get the complete SVG string with standardized attributes.

**Field Configuration:**
Fields support optional UI metadata in their config:

- `placeholder?: string` - Placeholder text for input fields

## Built-in Modules & Fields

### Modules

| Module           | Purpose           | Key Fields                                 | Key Slots           |
| ---------------- | ----------------- | ------------------------------------------ | ------------------- |
| `container`      | Layout wrapper    | None                                       | `body` (unlimited)  |
| `text`           | Text content      | `content`                                  | None                |
| `button`         | Clickable buttons | `label`, `href`                            | None                |
| `card`           | Content cards     | `title`, `description`                     | `content`           |
| `grid`           | Grid layout       | None                                       | `items` (unlimited) |
| `call-to-action` | Action blocks     | `headline`, `description`, `actionButton*` | None                |
| `image`          | Image display     | `image`, `alt`                             | None                |

### Fields

| Field           | Purpose            | Key Config                       |
| --------------- | ------------------ | -------------------------------- |
| `TextField`     | Text input         | `maxLength`, `default`           |
| `NumberField`   | Numeric input      | `min`, `max`, `default`          |
| `RichTextField` | Rich text (TipTap) | `default` (ProseMirror Document) |
| `ImageField`    | Image upload       | `default` (UJLImageData \| null) |

### Library System

The core package provides a flexible library system that supports both inline and backend storage modes. Currently, only images are supported, with plans for additional asset types in future releases.

**Storage Modes:**

- **Inline Storage** - Images stored as Base64-encoded data within UJLC documents
- **Backend Storage** - Images stored on a Payload CMS server with references in documents

**Library Configuration:**

Library configuration is stored in the document metadata at `ujlc.meta._library`:

```typescript
{
  "ujlc": {
    "meta": {
      "_library": {
        "storage": "inline" | "backend",
        "url": "http://localhost:3000"  // Required for backend storage
      }
    },
    "images": {
      "img-001": {
        "src": "data:image/jpeg;base64,...",  // For inline storage (Base64)
        "metadata": {
          "filename": "example.jpg",
          "mimeType": "image/jpeg",
          "filesize": 45678,
          "width": 1920,
          "height": 1080
        }
      }
      // OR for backend storage
      "img-002": {
        "src": "http://localhost:3000/api/images/67890abcdef12345",
        "metadata": { /* ... */ }
      }
    }
  }
}
```

**Image Entry Types:**

The `ImageEntry` type contains the image URL and metadata:

```typescript
type ImageEntry = {
	src: string; // Image URL (HTTP or Base64 Data-URL)
	metadata: ImageMetadata; // Technical metadata
};

type ImageMetadata = {
	filename: string;
	mimeType: string;
	filesize: number;
	width: number;
	height: number;
};
```

**ImageField Integration:**

The `ImageField` uses library entries (currently images) via the `UJLImageData` type:

```typescript
type UJLImageData = {
	imageId: string | number; // References entry in ujlc.images
	alt: string;
};
```

For more details on library setup and configuration, see the [Library Setup Guide](../crafter/MEDIA_LIBRARY_SETUP.md).

### Rich Text Schema

The core package exports a shared TipTap schema configuration (`ujlRichTextExtensions`) that ensures consistency between editors and serializers:

```typescript
import { ujlRichTextExtensions } from "@ujl-framework/core";
import { Editor } from "@tiptap/core";

const editor = new Editor({
	extensions: ujlRichTextExtensions,
});
```

**Supported Extensions:**

Das Schema unterstützt Document, Paragraph und Text als Basis-Elemente, Headings (h1-h6), die Marks Bold, Italic und Code sowie HardBreak, Blockquote, HorizontalRule und Listen (BulletList, OrderedList, ListItem). UndoRedo (nur Editor-State), Dropcursor und Gapcursor (UI-only) sind deaktiviert.

This schema is used by both the Crafter editor and the adapter serializers to ensure WYSIWYG consistency.

## API Reference

### Core Classes

```typescript
class Composer {
	constructor(registry?: ModuleRegistry);
	registerModule(module: AnyModule): void;
	unregisterModule(module: AnyModule | string): void;
	compose(doc: UJLCDocument): UJLAbstractNode;
	composeModule(moduleData: UJLCModuleObject): UJLAbstractNode;
}

class ModuleRegistry {
	registerModule(module: ModuleBase): void;
	unregisterModule(module: AnyModule | string): void;
	getModule(name: string): ModuleBase | undefined;
}

abstract class FieldBase<ValueT, ConfigT> {
	parse(raw: UJLCFieldObject): ValueT;
	abstract validate(raw: UJLCFieldObject): raw is ValueT;
	abstract fit(value: ValueT): ValueT;
	serialize(value: ValueT): UJLCFieldObject;
}

abstract class ModuleBase {
	abstract readonly name: string;
	abstract readonly fields: FieldSet;
	abstract readonly slots: SlotSet;
	abstract compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode;
}

type UJLAdapter<OutputType = string, OptionsType = undefined> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: OptionsType,
) => OutputType;
```

### Module ID Handling in Composer

The `composeModule` method automatically preserves IDs:

```typescript
public composeModule(moduleData: UJLCModuleObject): UJLAbstractNode {
	const module = this._module_registry.getModule(moduleData.type);
	if (module) {
		return module.compose(moduleData, this);
		// ID is automatically preserved from moduleData.meta.id to node.id
		// All AST nodes are guaranteed to have an id field (required)
		} else {
		// Fallback for unknown modules
		return {
			type: "error",
			props: {
				message: `Unknown module type: ${moduleData.type}`,
			},
			id: moduleData.meta.id,
		};
	}
}
```

This ensures all AST nodes have their IDs properly set for downstream use by adapters. The `id` field is required on all AST node types, ensuring reliable module identification and selection in editors.

## Development

### Build Commands

```bash
# Build the package
pnpm run build

# Type check
pnpm run check

# Format and lint
pnpm run format
pnpm run lint

# Clean build artifacts
pnpm run clean
```

### Project Structure

```
src/
├── fields/           # Field system
│   ├── base.ts      # FieldBase abstract class
│   └── concretes/   # Built-in field implementations
├── modules/         # Module system
│   ├── base.ts      # ModuleBase abstract class
│   ├── concretes/   # Built-in module implementations
│   └── registry.ts  # ModuleRegistry class
├── composer.ts      # Composer class
└── index.ts         # Main exports
```

For detailed type definitions and examples, see the source code.
