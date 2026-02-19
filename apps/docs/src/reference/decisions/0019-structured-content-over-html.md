---
title: "ADR-019: Structured Content over HTML Strings"
description: "Why UJL stores all content as structured data rather than HTML markup."
---

# ADR-019: Structured Content over HTML Strings

**Status:** Accepted

## Context

Traditional CMS systems store rich text as HTML strings: `<p>Welcome to <strong>UJL</strong></p>`. This approach has structural problems that are particularly acute for a system built around compliance guarantees:

**Validation is hard.** HTML is ambiguous and requires a parser. Schema validation against HTML strings is impractical. Invalid markup can propagate undetected.

**XSS is a risk.** Unescaped user input in HTML strings can inject scripts. Every rendering path must sanitize carefully.

**WYSIWYG is unreliable.** If the editor and renderer use different HTML parsers or serializers, the rendered output doesn't match what the editor showed.

**Content is not queryable.** HTML strings can't be traversed or transformed without parsing.

## Decision

UJL stores all content as structured data. No HTML strings at any layer:

- **Rich text** → ProseMirror JSON (see the TipTap integration)
- **Modules** → UJLC JSON with typed fields and slots
- **Images** → metadata objects with Base64 or URL references

Example rich text node stored in a field:

```json
{
	"type": "doc",
	"content": [
		{
			"type": "heading",
			"attrs": { "level": 1 },
			"content": [{ "type": "text", "text": "Welcome to UJL" }]
		}
	]
}
```

Rendering uses a shared SSR-safe serializer, the same schema is used by both the editor (TipTap) and the renderer (adapter-svelte). The serializer is pure TypeScript with no browser dependencies.

## Rationale

Structured data enables the rest of UJL's architecture. Zod can validate it. The Composer can transform it deterministically. The AST adapter pattern depends on it. Accessibility properties (alt text, heading levels, ARIA roles) are first-class fields rather than embedded HTML attributes.

For AI integration specifically: language models generate structured JSON reliably. They generate valid, accessible HTML strings much less reliably.

**Alternatives considered:** HTML strings (XSS risk, unvalidatable, WYSIWYG unreliable), Markdown (limited semantics, parser dependency), custom DSL (unnecessary complexity without clear benefit).

## Consequences

All content is validatable by schema. XSS is structurally eliminated, there's no HTML string to inject into. The editor and renderer share the same data representation, guaranteeing WYSIWYG fidelity. Content is traversable and transformable as data.

Trade-off: a serializer is required to render structured data to HTML. The bundle includes ProseMirror and the serializer. Migrating existing HTML content into UJL requires a parsing step.

**Related:** [ADR-001](/reference/decisions/0001-content-design-separation) (structured data as core principle), [ADR-003](/reference/decisions/0003-ast-adapter-pattern) (AST relies on structured intermediate representation), [ADR-005](/reference/decisions/0005-zod-schema-validation) (structured data enables Zod validation)
