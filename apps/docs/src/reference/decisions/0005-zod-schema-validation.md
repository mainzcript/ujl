---
title: "ADR-005: Zod for Runtime Schema Validation"
description: "Why UJL uses Zod as the single source of truth for schemas and TypeScript types."
---

# ADR-005: Zod for Runtime Schema Validation

**Status:** Accepted

## Context

UJL documents arrive from external sources: file uploads, CMS exports, and future AI-generated content. TypeScript types only provide compile-time safety, at runtime, invalid data can crash the system or produce invalid output.

Requirements: runtime validation with clear error messages, support for recursive structures (nested modules), automatic TypeScript type inference from the same schema (DRY), performance under 10 ms per document.

## Decision

UJL uses **Zod** as the single source of truth for schemas. TypeScript types are inferred from Zod schemas rather than defined separately:

```typescript
export const UJLCModuleObjectSchema = z.object({
	type: z.string(),
	meta: UJLCModuleMetaSchema,
	fields: z.record(z.string(), UJLCFieldObjectSchema),
	slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema))),
});

// TypeScript type is derived automatically, no duplication
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;
```

Recursive structures (nested modules) use `z.lazy()`. Validation errors include JSON paths, making debugging practical:

```
ujlc → root → 0 → fields → content: Expected string, received number
```

Both throwing (`parse`) and non-throwing (`safeParse`) variants are available. The CLI tool (`ujl-validate`) uses `safeParse` to validate documents from the command line.

## Rationale

**Why Zod over AJV?** AJV is faster (~2-5 ms vs. ~6 ms) and smaller (~8 KB vs. ~12 KB gzip), but requires codegen for TypeScript types and has a more verbose API. For UJL's use case (validating documents, not high-frequency data streams), the performance difference is negligible. Zod's `z.infer<>` eliminates an entire category of type/schema drift bugs.

**Alternatives considered:** AJV (better performance, worse DX and TS integration), Yup (weaker TypeScript support, form-focused), io-ts (functional style, steep learning curve), TypeScript-only (no runtime safety).

## Consequences

One schema definition produces both runtime validation and TypeScript types. External content (CMS, file uploads, AI-generated) is always validated before entering the system. Field-level error paths make debugging practical.

Trade-off: +12 KB gzip for the Zod library. ~6 ms validation overhead per document. Team members need to learn the Zod API. Zod major versions can include breaking changes.

**Related:** [ADR-001](/reference/decisions/0001-content-design-separation) (UJLC/UJLT validated by Zod), [ADR-002](/reference/decisions/0002-registry-plugin-system) (Fields use Zod internally)
