---
title: "How to Implement Custom Modules"
description: "Step-by-step guide to creating your own UJL modules with fields, slots, and composition logic."
---

# How to Implement Custom Modules

UJL's module system is open by design. You add your own modules without touching the framework source, and the Crafter's component picker picks them up automatically. This guide walks through every step.

**Prerequisites:** Install `@ujl-framework/core`. You will need it to create your module class, define fields and slots, and implement the composition logic.

```bash
pnpm add @ujl-framework/core
```

---

## Anatomy of a Module

Every module is a class that extends `ModuleBase`. TypeScript enforces all required properties at compile time.

```typescript
import { ModuleBase, TextField, Slot } from "@ujl-framework/core";
import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "@ujl-framework/core";

export class TestimonialModule extends ModuleBase {
	// --- Identity (required) ---
	readonly name = "testimonial"; // unique key, used in .ujlc.json
	readonly label = "Testimonial"; // shown in component picker
	readonly description = "A customer quote with author attribution";
	readonly category = "content" as const;
	readonly tags = ["quote", "review", "customer"] as const;
	readonly icon =
		'<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>';

	// --- Fields (typed data inputs) ---
	readonly fields = [
		{
			key: "quote",
			field: new TextField({
				label: "Quote",
				description: "The customer's words",
				default: "",
				maxLength: 500,
			}),
		},
		{
			key: "author",
			field: new TextField({
				label: "Author",
				description: "Full name of the person",
				default: "",
				maxLength: 100,
			}),
		},
		{
			key: "role",
			field: new TextField({
				label: "Role",
				description: "Job title or company",
				default: "",
				maxLength: 100,
			}),
		},
	];

	// --- Slots (child module areas) ---
	readonly slots = []; // no nested modules needed here

	// --- Composition ---
	compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		// escapeHtml() is required here: values are interpolated directly into a raw HTML string.
		const quote = this.escapeHtml(this.parseField(moduleData, "quote", ""));
		const author = this.escapeHtml(this.parseField(moduleData, "author", ""));
		const role = this.escapeHtml(this.parseField(moduleData, "role", ""));

		return this.createNode(
			"raw-html",
			{
				content: `<figure>
				<blockquote>${quote}</blockquote>
				<figcaption>${author}${role ? ` · ${role}` : ""}</figcaption>
			</figure>`,
			},
			moduleData,
		);
	}
}
```

::: warning Always escape user text in raw-html
`raw-html` renders content without sanitization. Any user-provided text interpolated directly into the HTML string is a potential XSS vector. Call `this.escapeHtml()` on every field value before interpolating it, as shown above. Values that go through standard adapter bindings (text nodes, attributes) are escaped automatically — only raw HTML interpolation requires manual escaping.
:::

---

## Required Properties

### `name`

The unique string identifier. Must be kebab-case and globally unique within your registry. This value is persisted in `.ujlc.json` files.

```typescript
readonly name = "hero-section"; // not "HeroSection" or "hero_section"
```

### `label`, `description`, `tags`

Shown in the Crafter's component picker. `tags` are used for full-text search.

```typescript
readonly label = "Hero Section";
readonly description = "Full-width intro with headline and CTA";
readonly tags = ["hero", "banner", "header", "landing"] as const;
```

### `category`

Groups modules in the component picker. Must be one of the six allowed values:

| Value         | Use case                                         |
| ------------- | ------------------------------------------------ |
| `layout`      | Structural containers (grid, section, container) |
| `content`     | Text, media, informational blocks                |
| `image`       | Image-centric modules                            |
| `interactive` | Buttons, forms, interactive elements             |
| `data`        | Tables, lists, data displays                     |
| `navigation`  | Menus, breadcrumbs, links                        |

```typescript
readonly category = "layout" as const; // TypeScript requires `as const`
```

### `icon`

The inner SVG content (without the `<svg>` wrapper). Use [Lucide icons](https://lucide.dev) for consistency with the built-in modules. Copy the `<path>`, `<rect>`, etc. elements only.

```typescript
readonly icon = '<rect width="18" height="18" x="3" y="3" rx="2"/>'; // ✓
readonly icon = '<svg ...><rect .../></svg>';                          // ✗ no wrapper
```

Call `module.getSvgIcon()` to get the complete `<svg>` element for rendering.

---

## Fields

Fields are typed inputs with built-in validation and normalization. Use `parseField()` in `compose()` to extract values safely – it validates the raw data, applies constraints, and falls back to your default automatically.

```typescript
const value = this.parseField(moduleData, "fieldKey", fallbackValue);
```

`parseField` returns values as-is. If the value will be interpolated into a raw HTML string (i.e., used in a `"raw-html"` node), wrap it with `this.escapeHtml()`:

```typescript
// Escaped value — required when interpolating into raw HTML
const title = this.escapeHtml(this.parseField(moduleData, "title", ""));
```

### Available field types

| Class           | Type                       | Key config options         |
| --------------- | -------------------------- | -------------------------- |
| `TextField`     | `string`                   | `maxLength`, `placeholder` |
| `NumberField`   | `number`                   | `min`, `max`               |
| `RichTextField` | `ProseMirrorDocument`      | `default` (full document)  |
| `ImageField`    | `string \| number \| null` | (none)                     |

All fields share the base config:

```typescript
{
  label: string;       // shown in the properties panel
  description: string; // help text below the input
  default: T;          // fallback value (required)
  placeholder?: string; // optional hint text
}
```

### Rich text fields

`RichTextField` stores a ProseMirror document. Provide a valid empty document as the default:

```typescript
import { RichTextField } from "@ujl-framework/core";

{
  key: "body",
  field: new RichTextField({
    label: "Body",
    description: "Main content area",
    default: {
      type: "doc",
      content: [{ type: "paragraph", content: [] }],
    },
  }),
}
```

### Image fields

`ImageField` stores an asset ID (string for inline provider, number for backend). Resolve the ID to actual image data during composition:

```typescript
import { ImageField } from "@ujl-framework/core";

// In fields:
{ key: "cover", field: new ImageField({ label: "Cover Image", description: "", default: null }) }

// In compose() – note: must be async
async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
  const imageId = this.parseField(moduleData, "cover", null);
  const library = composer.getLibrary();

  const image = imageId && library
    ? await library.resolve(imageId)
    : null;

  return this.createNode("raw-html", {
    content: image ? `<img src="${image.src}" alt="">` : "",
  }, moduleData);
}
```

---

## Slots

Slots are named child areas that can contain other modules. The `max` config controls how many items the slot accepts (`0` = unlimited).

```typescript
import { Slot } from "@ujl-framework/core";

readonly slots = [
  {
    key: "content",
    slot: new Slot({
      label: "Content",
      description: "Add modules to this area",
      max: 0, // 0 = unlimited
    }),
  },
];
```

In `compose()`, iterate over the slot and delegate each child to the `Composer`:

```typescript
async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
  const children: UJLAbstractNode[] = [];

  for (const child of moduleData.slots.content ?? []) {
    children.push(await composer.composeModule(child));
  }

  return this.createNode("wrapper", { children }, moduleData);
}
```

---

## The `compose()` Method

`compose()` converts the module's raw data into an `UJLAbstractNode`. The adapter then transforms that node into the final output (Svelte component, Web Component, etc.).

**Rules:**

- Use `this.createNode(type, props, moduleData)` to build the root node. It generates a fresh `id`, sets `meta.moduleId`, and marks the node as `isModuleRoot: true` automatically
- For internal child nodes (e.g., a button inside a card), pass `false` as the fourth argument: `this.createNode(type, props, moduleData, false)`
- Return `Promise<UJLAbstractNode>` if you need `async` (e.g., image resolution); return `UJLAbstractNode` synchronously otherwise

```typescript
compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
  return this.createNode("raw-html", { content: "<p>Hello world</p>" }, moduleData);
}
```

::: tip Built-in node types
Two types work out of the box with every adapter, no extra setup needed:

- **`"raw-html"`**: renders `props.content` as raw HTML. Use this when your module produces fields (text, images) without child modules.
- **`"wrapper"`**: iterates over `props.children` (an array of `UJLAbstractNode`) and renders each child in order. Use this when your module composes child modules from slots.

If you use a custom type, you need to add a corresponding rendering component to `adapter-svelte` or `adapter-web`.

For theme-aware spacing inside `"raw-html"` content, use the `--spacing` CSS variable instead of hardcoded values: `padding: calc(var(--spacing) * 1.5)`. This variable is generated from the active token set and scales with the user's theme.
:::

---

## Registering the Module

### Via the Crafter (recommended for editor use)

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#editor",
	modules: [new TestimonialModule()], // available immediately in component picker
});

// Dynamic registration at runtime
crafter.registerModule(new AnotherModule());
```

### Via the Composer (for rendering without the editor)

Install the rendering adapter alongside `@ujl-framework/core`:

```bash
pnpm add @ujl-framework/core @ujl-framework/adapter-web
```

Register your modules on the `Composer`, compose the document, then pass the AST to the adapter:

```typescript
import { Composer } from "@ujl-framework/core";
import { webAdapter } from "@ujl-framework/adapter-web";

const composer = new Composer();
composer.registerModule(new TestimonialModule());

const ast = await composer.compose(ujlcDocument);
webAdapter(ast, ujltTokenSet, { target: "#app" });
```

::: tip Zero-config rendering types
Use `"raw-html"` for modules with fields, `"wrapper"` for modules with slots. Both render out of the box. Only add a custom adapter type when you need purpose-built rendering logic that neither covers.
:::

Both paths use the same `ModuleRegistry` under the hood. Registering a module with the same `name` twice throws an error – use `registry.hasModule(name)` to check first if needed.

---

## Complete Example

A `PricingCard` module with two text fields and a slot for feature list items:

```typescript
import { ModuleBase, TextField, Slot } from "@ujl-framework/core";
import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "@ujl-framework/core";

export class PricingCardModule extends ModuleBase {
	readonly name = "pricing-card";
	readonly label = "Pricing Card";
	readonly description = "A pricing plan card with a feature list";
	readonly category = "content" as const;
	readonly tags = ["pricing", "plan", "tier", "card"] as const;
	readonly icon =
		'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>';

	readonly fields = [
		{
			key: "planName",
			field: new TextField({
				label: "Plan Name",
				description: "e.g. Pro, Enterprise",
				default: "",
				maxLength: 50,
			}),
		},
		{
			key: "price",
			field: new TextField({
				label: "Price",
				description: "e.g. €49/mo",
				default: "",
				maxLength: 20,
			}),
		},
	];

	readonly slots = [
		{
			key: "features",
			slot: new Slot({ label: "Features", description: "Add feature list items", max: 0 }),
		},
	];

	async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		// escapeHtml() required: both values are interpolated into a raw HTML string below
		const planName = this.escapeHtml(this.parseField(moduleData, "planName", ""));
		const price = this.escapeHtml(this.parseField(moduleData, "price", ""));

		// Header as a raw-html child node (fields → HTML string)
		const header = this.createNode(
			"raw-html",
			{ content: `<div><h2>${planName}</h2><p>${price}</p></div>` },
			moduleData,
			false,
		);

		// Feature items as composed child nodes (slot → UJLAbstractNode[])
		const features: UJLAbstractNode[] = [];
		for (const child of moduleData.slots.features ?? []) {
			features.push(await composer.composeModule(child));
		}

		// wrapper renders children in order
		return this.createNode("wrapper", { children: [header, ...features] }, moduleData);
	}
}
```

---

## Related

- [ADR-002: Registry & Plugin System](/reference/decisions/0002-registry-plugin-system) – the architectural decision behind this system
- [Install & Integrate](/guide/installation) – how to register modules in the Crafter
- [`@ujl-framework/core` README](https://github.com/mainzcript/ujl/tree/main/packages/core) – full API reference
