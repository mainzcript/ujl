---
title: "ADR-001: Content/Design Separation (UJLC/UJLT)"
description: "Why UJL separates content and design into two distinct document formats."
---

# ADR-001: Content/Design Separation (UJLC/UJLT)

**Status:** Accepted since project inception

## Context

Traditional web technologies allow editors to override design rules through inline styles, CSS classes, or direct markup. This leads to brand inconsistencies, accessibility problems from inconsistent contrast and typography, high maintenance costs when updating themes, and governance overhead from repeated manual reviews.

The core requirement: enforce brand compliance and accessibility architecturally, not through organizational process.

## Decision

UJL separates content and design into two distinct document formats at the data level:

**UJLC** (`.ujlc.json`), content only: structured modules with typed fields and slots. No color values. No font names. No spacing numbers.

**UJLT** (`.ujlt.json`), design only: tokens for colors (OKLCH), typography, spacing, and radius. No content.

The Composer combines both at runtime:

```typescript
const ast = await composer.compose(ujlcDocument, ujltDocument);
```

Because design values don't exist in the content format, editors have no mechanism to change them, not as a UI restriction, but as a data model constraint.

## Rationale

Separating at the data level (rather than, say, restricting the editor UI) provides stronger guarantees. A restricted UI can be worked around; a data format that doesn't contain a field for "font color" cannot be used to set one.

This approach also decouples the roles of editor (touches UJLC) and designer (touches UJLT) at the architectural level. A UJLT update propagates globally to all documents automatically, with no manual migration required.

**Alternatives considered:** CSS-in-JS (overridable at runtime), Tailwind classes in content (requires CSS knowledge, error-prone), HTML/CSS as the content format (unvalidatable, XSS risk), per-document theme variants (increases complexity without meaningful benefit).

## Consequences

Design changes are global and instant. Brand compliance is guaranteed by the data model, not by process. Editors cannot introduce visual inconsistencies. Theme reuse across documents is structural, not coincidental.

Trade-off: per-document styling is not possible by design. Edge cases that traditional systems handle via CSS overrides require new module variants in UJL. The learning curve is steeper for teams used to freeform editors.

**Related:** [ADR-005](/reference/decisions/0005-zod-schema-validation) (schema validation for UJLC/UJLT), [ADR-009](/reference/decisions/0009-oklch-color-space) (OKLCH for theme tokens)
