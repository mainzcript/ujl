---
title: "ADR-003: AST Adapter Pattern"
description: "Why UJL uses an Abstract Syntax Tree as the boundary between composition and rendering."
---

# ADR-003: AST Adapter Pattern

**Status:** Accepted

## Context

Rendering UJL documents directly would tie the core to a specific framework (Svelte, React, etc.). Supporting other frameworks or output targets would require reimplementing the entire composition logic.

Requirements: core logic stays framework-agnostic; multiple render targets are supported without duplicating business logic; composition is testable without DOM or framework dependencies; the editor can map rendered nodes back to editable modules.

## Decision

The Composer produces an **Abstract Syntax Tree (AST)** as an intermediate representation. Adapters transform the AST into concrete output:

```typescript
type UJLAbstractNode = {
	type: string; // "text", "button", "container", etc.
	id: string; // unique node ID
	props: Record<string, unknown>;
	meta?: {
		moduleId?: string; // maps back to the UJLC module (editor integration)
		isModuleRoot?: boolean; // marks editable module roots
	};
};
```

One UJLC module can produce multiple AST nodes (e.g., a grid module creates a `grid-container` node with child `grid-item` nodes). The `meta.moduleId` field enables click-to-select in the Crafter editor.

**Current adapters:**

| Adapter          | Output              | Bundle (gzip) |
| ---------------- | ------------------- | ------------- |
| `adapter-svelte` | Svelte 5 components | ~120 KB       |
| `adapter-web`    | Web Components      | ~280 KB       |

New adapters (React, Vue, static HTML, PDF) can be added without changing core or existing adapters.

## Rationale

The AST is the right boundary because it's the point at which framework-specific knowledge begins. Everything before it (reading UJLC/UJLT, running modules, resolving images) is pure data transformation. Everything after it is framework-specific rendering.

The `meta.moduleId` concept enables the editor's click-to-select feature without coupling the editor to any specific adapter.

**Alternatives considered:** direct framework rendering (ties core to Svelte), template-based transformation (insufficient control, hard to extend), virtual DOM (unnecessary complexity for this use case), compiler-based codegen (requires build step, incompatible with runtime editing).

## Consequences

Adding a new rendering target requires only a new adapter package. The composition pipeline is testable without a DOM or Svelte environment. The editor can highlight and select any rendered node regardless of which adapter is used.

Trade-off: each adapter must implement all node types. Adapters must be kept in sync as new node types are added. The AST adds one abstraction layer, though its overhead is minimal.

**Related:** [ADR-002](/reference/decisions/0002-registry-plugin-system) (modules produce AST nodes), [ADR-019](/reference/decisions/0019-structured-content-over-html) (structured data over markup)
