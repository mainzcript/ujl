# @ujl-framework/core

**The Heart of the UJL Framework** - A modular, type-safe system for building dynamic web layouts using an Abstract Syntax Tree (AST) architecture.

UJL Core provides the foundational building blocks for creating reusable, composable web layouts from JSON documents. Design rules are enforced at the schema level, making it impossible for content editors to break brand guidelines or accessibility standards.

**Key features:**

- **Modular architecture** - Reusable modules with fields and slots
- **Full TypeScript support** - Compile-time validation
- **Extensibility** - Add custom modules and field types
- **Multiple outputs** - Via adapters (HTML, Svelte, Web Components)
- **AI-native JSON** - Optimized for LLMs, validated against schemas
- **Brand-Compliance by Design** - Schema validation ensures valid layouts
- **Accessibility** - Built-in through semantic HTML and WCAG-compliant structures

## Installation

```bash
pnpm add @ujl-framework/core
```

## Quick Start

```typescript
import { Composer } from "@ujl-framework/core";

const ujlcDocument = {
	ujlc: {
		meta: { title: "Example" /* ... */ },
		root: [
			{
				type: "text",
				meta: { id: "text-001" /* ... */ },
				fields: { content: "Welcome to UJL Framework" },
				slots: {},
			},
		],
	},
};

const composer = new Composer();
const ast = await composer.compose(ujlcDocument);
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

### Modules vs. AST Nodes

**Modules** are building blocks in `.ujlc.json` documents. They exist at the document level and are editable.

**AST Nodes** are created by the Composer during composition. Every node has:

- **`node.id`** - Unique, randomly generated identifier
- **`meta.moduleId`** - Which module this node belongs to
- **`meta.isModuleRoot`** - `true` for editable module nodes

Child nodes (like `grid-item` wrappers) have `meta.moduleId` but `isModuleRoot: false`.

## Extensibility

### Creating Custom Fields

```typescript
class EmailField extends FieldBase<string, EmailFieldConfig> {
	protected readonly defaultConfig = {
		label: "Email Address",
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

### Creating Custom Modules

```typescript
class CustomModule extends ModuleBase {
	readonly name = "custom-module";
	readonly label = "Custom Module";
	readonly description = "A custom module example";
	readonly category = "content" as const;
	readonly tags = ["custom"] as const;
	readonly icon = '<rect width="18" height="18" x="3" y="3" rx="2"/>';

	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];

	readonly slots = [{ key: "content", slot: new Slot({ label: "Content", max: 5 }) }];

	// Return an instance-specific name when the module should be shown
	// differently from its static type label in authoring UIs.
	getInstanceLabel(moduleData: UJLCModuleObject): string | null {
		const title = this.parseField(moduleData, "title", "").trim();
		return title || null;
	}

	async compose(
		moduleData: UJLCModuleObject,
		composer: Composer,
		doc: UJLCDocument,
	): Promise<UJLAbstractNode> {
		const title = this.parseField(moduleData, "title", "");
		const children: UJLAbstractNode[] = [];

		for (const child of moduleData.slots.content ?? []) {
			children.push(await composer.composeModule(child, doc));
		}

		return this.createNode("wrapper", { children }, moduleData);
	}
}
```

### Naming in Authoring UIs

Modules expose two different naming concepts:

- `label` is the static type name of the module. It is used in places like the component picker and as the fallback display name when an instance has no meaningful individual name.
- `getInstanceLabel(moduleData)` returns an optional, instance-specific name for a concrete module in a document.

Authoring UIs should not guess instance names from arbitrary field keys. Instead, they should resolve names centrally through `ModuleRegistry.getDisplayName(moduleData)`:

```typescript
const moduleData = doc.ujlc.root[0];
const displayName = composer.getRegistry().getDisplayName(moduleData);

// Example outcomes:
// "Spring Campaign"
// "Image"
```

If `getInstanceLabel()` returns a non-empty string, `getDisplayName()` returns that instance name. Otherwise it falls back to the module's static `label`.

### Registry Management

```typescript
// Default registry
const composer = new Composer();

// Add custom modules
composer.registerModule(new CustomModule());

// Custom registry
const registry = new ModuleRegistry();
registry.registerModule(new CustomModule());
const composer = new Composer(registry);
```

### Access Module Metadata

```typescript
const composer = new Composer();
const modules = composer.getRegistry().getAllModules();

const module = composer.getRegistry().getModule("text");
if (module) {
	console.log(module.label, module.category);
	for (const field of module.fields) {
		console.log(field.key, field.field.config.label);
	}
}

const moduleData = ujlcDocument.ujlc.root[0];
console.log(composer.getRegistry().getDisplayName(moduleData));
```

## Built-in Modules & Fields

### Modules

| Module           | Purpose        | Fields                    | Slots     |
| ---------------- | -------------- | ------------------------- | --------- |
| `container`      | Layout wrapper | -                         | `body`    |
| `text`           | Text content   | `content`                 | -         |
| `button`         | Buttons        | `label`, `href`           | -         |
| `card`           | Content cards  | `title`, `description`    | `content` |
| `grid`           | Grid layout    | -                         | `items`   |
| `call-to-action` | Action blocks  | `headline`, `description` | -         |
| `image`          | Image display  | `image`, `alt`            | -         |

### Fields

| Field           | Purpose         | Config                                 |
| --------------- | --------------- | -------------------------------------- |
| `TextField`     | Text input      | `maxLength`, `default`                 |
| `NumberField`   | Numeric input   | `min`, `max`, `default`                |
| `RichTextField` | Rich text       | `default` (ProseMirror)                |
| `ImageField`    | Image reference | `default` (`string \| number \| null`) |

## Library System

The Composer is stateless. Modules access assets directly from `doc.ujlc.library` during composition.

**Key principle:** Rendering uses inline data; the `LibraryProvider` is only used for Crafter operations (upload, list, metadata).

```typescript
// In a module's compose() method:
async compose(moduleData, composer, doc) {
	const imageId = this.parseField(moduleData, "image", null);
	const asset = imageId ? doc.ujlc.library[imageId] : null;
	// Use asset.img.src, asset.meta.alt, etc.
}
```

Assets are stored as `LibraryAssetImage` objects with:

- `img.src` - Required fallback URL
- `img.srcset` - Responsive images
- `meta` - Alt, caption, credits
- `sources` - Art direction

**Providers** (Crafter concern):

- `InlineLibraryProvider` is provided by `@ujl-framework/crafter`
- Custom providers implement the `LibraryProvider` interface from `@ujl-framework/types`

See `@ujl-framework/types` for complete type definitions.

## Rich Text Schema

```typescript
import { ujlRichTextExtensions } from "@ujl-framework/core";
import { Editor } from "@tiptap/core";

const editor = new Editor({
	extensions: ujlRichTextExtensions,
});
```

**Supported:** Paragraph, Text, Headings (h1-h6), Bold, Italic, Code, HardBreak, Blockquote, HorizontalRule, Lists (Bullet, Ordered).

## API Reference

### Core Classes

```typescript
class Composer {
	constructor(registry?: ModuleRegistry);
	compose(doc: UJLCDocument): Promise<UJLAbstractNode>;
	composeModule(moduleData: UJLCModuleObject, doc: UJLCDocument): Promise<UJLAbstractNode>;
	registerModule(module: AnyModule): void;
	getRegistry(): ModuleRegistry;
}

abstract class ModuleBase {
	abstract readonly name: string;
	abstract readonly label: string;
	abstract readonly description: string;
	abstract readonly category: ComponentCategory;
	abstract readonly tags: readonly string[];
	abstract readonly icon: string;
	abstract readonly fields: FieldSet;
	abstract readonly slots: SlotSet;
	abstract getInstanceLabel(moduleData: UJLCModuleObject): string | null;
	abstract compose(
		moduleData: UJLCModuleObject,
		composer: Composer,
		doc: UJLCDocument
	): UJLAbstractNode | Promise<UJLAbstractNode>;

	// Helpers
	protected parseField<T>(moduleData: UJLCModuleObject, key: string, fallback: T): T;
	protected escapeHtml(value: string): string;
	protected createNode<T>(type: T, props: ..., moduleData: UJLCModuleObject, isModuleRoot?: boolean): ...;
}

abstract class FieldBase<ValueT, ConfigT> {
	parse(raw: UJLCFieldObject): ValueT;
	abstract validate(raw: UJLCFieldObject): raw is ValueT;
	abstract fit(value: ValueT): ValueT;
}
```

## Development

```bash
# Build
pnpm run build

# Type check
pnpm run check

# Format and lint
pnpm run format
pnpm run lint
```

## Project Structure

```
src/
├── fields/
│   ├── base.ts           # FieldBase
│   └── concretes/        # Built-in fields
├── modules/
│   ├── base.ts           # ModuleBase
│   ├── concretes/        # Built-in modules
│   └── registry.ts       # ModuleRegistry
├── composer.ts           # Composer
└── index.ts
```
