---
title: "ADR-002: Registry & Plugin System"
description: "Why UJL treats modules as runtime-registered plugins rather than a static list."
---

# ADR-002: Registry & Plugin System

**Status:** Accepted, in implementation

## Context

A framework that only supports built-in modules cannot serve diverse use cases. Equally, extensibility must not destabilize the core or produce breaking changes every time a new module is added.

Requirements: teams can add custom modules; built-in modules can be replaced; the UJLC data contract (schema) remains stable; modules define their own validatable fields and slots.

## Decision

UJL treats modules as plugins registered at runtime through a `ModuleRegistry`. Modules extend `ModuleBase`:

```typescript
class CustomModule extends ModuleBase {
	readonly name = "custom-card";
	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];
	readonly slots = [{ key: "body", slot: new Slot({ label: "Body", max: 5 }) }];

	async compose(moduleData, composer): Promise<UJLAbstractNode> {
		return {
			type: "custom-card",
			id: generateUid(),
			props: {
				title: this.fields[0].field.parse(moduleData.fields.title),
				children: await Promise.all(
					(moduleData.slots.body ?? []).map((m) => composer.composeModule(m)),
				),
			},
		};
	}
}

composer.registerModule(new CustomModule());
```

Fields encapsulate validation and normalization, `parse()` applies type checking, constraint fitting, and default fallback in one call.

**Integration via the Crafter:** When using the visual editor, `UJLCrafter` is the official entry point for module registration. Modules passed at initialization are available in the component picker before the first render:

```typescript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#editor",
	modules: [new CustomModule()],
});

// Dynamic registration after initialization is also supported
crafter.registerModule(new AnotherModule());
```

## Rationale

Runtime registration means new modules don't require changes to core packages. The UJLC schema remains stable because it's defined at the field and slot level within each module, not globally. Module isolation makes individual testing straightforward.

**Alternatives considered:** static module list (no extensibility, every addition requires a core PR), plugin system without central registry (no collision protection, hard to introspect), inheritance-only approach (tight coupling, poor testability), functional composition (insufficient structure for validation encapsulation).

## Consequences

Custom modules can be added without forking or modifying the framework. The UJLC data contract is stable. Fields handle type safety and constraint enforcement centrally.

Trade-off: each module requires ~50-100 lines of boilerplate. Developers need to understand the Field and Slot system. There is a small runtime cost for registry lookups.

**Related:** [ADR-003](/reference/decisions/0003-ast-adapter-pattern) (modules produce AST nodes), [ADR-005](/reference/decisions/0005-zod-schema-validation) (Zod used for field schemas)
