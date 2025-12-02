# @ujl-framework/core

**The Heart of the UJL Framework** - A modular, type-safe system for building dynamic web layouts using an Abstract Syntax Tree (AST) architecture.

UJL Core provides the foundational building blocks for creating reusable, composable web layouts. Instead of writing HTML directly, you define layouts using `.ujlc.json` documents that get composed into AST nodes and rendered through adapters. This separation enables powerful features like:

- **Modular Architecture**: Create reusable modules with fields and slots
- **Type Safety**: Full TypeScript support with compile-time validation
- **Extensibility**: Easy to add custom modules and field types
- **Multiple Outputs**: Render to HTML, Svelte components, or any format via adapters
- **LLM-Ready**: JSON-based structure optimized for AI assistance

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

- **UJL Documents**: JSON-based layout descriptions with metadata and hierarchical module structure
- **Modules**: Reusable building blocks with fields (data) and slots (content areas)
- **Fields**: Type-safe data containers with validation, parsing, and fitting logic
- **Slots**: Nested content areas that can contain other modules
- **Composer**: Orchestrates the composition process using the module registry
- **AST**: Abstract intermediate representation that separates composition from rendering
- **Module IDs**: Unique identifiers preserved from UJLC documents to AST nodes for tracking and selection
- **Adapters**: Convert AST nodes to specific output formats (HTML, Svelte components, etc.)

### Module ID Propagation

The Composer automatically transfers module IDs from the UJLC document to the AST:

```typescript
// In UJLC document
{
	type: "text",
	meta: { id: "text-001" },  // ← ID defined here
	fields: { content: "Hello" }
}

// After composition
{
	type: "text",
	id: "text-001",  // ← ID preserved in AST
	props: { content: "Hello" }
}
```

This enables:

- Tracking modules through the composition pipeline
- Click-to-select in visual editors
- DOM element identification with `data-ujl-module-id`
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

> **⚠️ TODO: Component Library Generation**
>
> Currently, the Component Library (used by the Crafter's component picker) is manually maintained in `@ujl-framework/examples`. This creates a maintenance burden and makes it difficult for developers to add new modules.
>
> **Future Improvement:** The Component Library should be automatically generated from the Module Registry. This requires:
>
> 1. Extending `ModuleBase` with optional metadata (label, description, category, tags)
> 2. Creating a function to convert `ModuleBase` instances to `ComponentDefinition`
> 3. Generating the library from the registry at runtime or build time
>
> See `packages/core/src/modules/base.ts` and `packages/core/src/modules/registry.ts` for TODO comments.

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

### Fields

| Field         | Purpose       | Key Config              |
| ------------- | ------------- | ----------------------- |
| `TextField`   | Text input    | `maxLength`, `default`  |
| `NumberField` | Numeric input | `min`, `max`, `default` |

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
