# @ujl-framework/core

**The Heart of the UJL Framework** - A modular, type-safe system for building dynamic web layouts using an Abstract Syntax Tree (AST) architecture.

UJL Core provides the foundational building blocks for creating reusable, composable web layouts. Instead of writing HTML directly, you define layouts using `.ujlc.json` documents that get composed into AST nodes and rendered through adapters. This architectural approach enables **Brand-Compliance by Design** – design rules are enforced at the schema level, making it impossible for content editors to break brand guidelines or accessibility standards.

This separation enables powerful features like:

- **Modular Architecture**: Create reusable modules with fields and slots
- **Type Safety**: Full TypeScript support with compile-time validation
- **Extensibility**: Easy to add custom modules and field types
- **Multiple Outputs**: Render to HTML, Svelte components, or any format via adapters
- **AI-native**: JSON-based structure optimized for LLMs. AI generates structured data that is validated against schemas before rendering, ensuring brand compliance and accessibility
- **Brand-Compliance by Design**: Schema validation ensures only valid, brand-compliant layouts can be created
- **Accessibility Built-in**: Semantic HTML and WCAG-compliant structures are enforced through the module system

---

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
		const children = moduleData.slots.content.map(child => composer.composeModule(child));

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

### Media Library System

The core package provides a flexible media library system that supports both inline and backend storage modes:

**Storage Modes:**

- **Inline Storage** - Media stored as Base64-encoded data within UJLC documents
- **Backend Storage** - Media stored on a Payload CMS server with references in documents

**Media Library Configuration:**

Media library configuration is stored in the document metadata at `ujlc.meta.media_library`:

```typescript
{
  "ujlc": {
    "meta": {
      "media_library": {
        "storage": "inline" | "backend",
        "endpoint": "http://localhost:3000/api"  // Required for backend storage
      }
    },
    "images": {
      "image-001": {
        "id": "media-001",
        "storage": "inline",
        "data": "data:image/jpeg;base64,..."  // For inline storage
        // OR
        "mediaId": "67890abcdef12345"  // For backend storage
      }
    }
  }
}
```

**Media Entry Types:**

The `UJLCMediaEntry` type supports both storage modes:

```typescript
type UJLCMediaEntryInline = {
	id: string;
	storage: "inline";
	data: string; // Base64-encoded data URL
};

type UJLCMediaEntryBackend = {
	id: string;
	storage: "backend";
	mediaId: string; // Reference to Payload CMS media document
};
```

**ImageField Integration:**

The `ImageField` uses media library entries via the `UJLImageData` type:

```typescript
type UJLImageData = {
	mediaId: string; // References entry in ujlc.media
	alt: string;
};
```

For more details on media library setup and configuration, see the [Media Library Setup Guide](../crafter/MEDIA_LIBRARY_SETUP.md).

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

- Document, Paragraph, Text (base)
- Heading (h1-h6)
- Bold, Italic, Code (marks)
- HardBreak, Blockquote, HorizontalRule
- BulletList, OrderedList, ListItem

**Disabled Extensions (UI-only):**

- UndoRedo (editor state only)
- Dropcursor, Gapcursor (UI only)

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
	options: OptionsType
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
