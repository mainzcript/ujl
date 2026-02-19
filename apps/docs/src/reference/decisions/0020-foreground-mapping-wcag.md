---
title: "ADR-020: Foreground Mapping for WCAG Contrast"
description: "How UJL enforces WCAG-compliant text colors automatically through theme-level mappings."
---

# ADR-020: Foreground Mapping for WCAG Contrast

**Status:** Accepted

## Context

WCAG accessibility requires minimum contrast ratios between text and background (4.5:1 for AA). Manual contrast checks are error-prone and don't scale across a design system with multiple color variants and component types.

The problem: designers need to verify every background/foreground combination manually. In a system with 11 color shades × multiple flavors × dark/light mode, this is many combinations, and one incorrect mapping creates an accessibility failure across every component that uses it.

## Decision

UJL defines foreground mappings in the UJLT theme. For each color flavor and shade, the theme specifies which text color to use on both light and dark backgrounds:

```typescript
// In UJLT theme
{
  "primary": {
    "shades": { "50": {...}, "500": {...}, "950": {...} },
    "lightForeground": { "primary": "950" }, // text on primary/light bg
    "darkForeground":  { "primary": "50"  }  // text on primary/dark bg
  }
}
```

These mappings are output as CSS custom properties:

```css
[data-ujl-theme="brand"] {
	--primary-light-foreground-primary: var(--primary-950);
	--primary-dark-foreground-primary: var(--primary-50);
}

.button-primary {
	background-color: oklch(var(--primary-500));
	color: oklch(var(--primary-light-foreground-primary));
}
```

Dark mode is handled by a class toggle, components don't need different color logic:

```css
[data-ujl-theme="brand"].dark {
	--primary-light-foreground-primary: var(--primary-dark-foreground-primary);
}
```

## Rationale

By defining foreground mappings in the theme rather than per-component, the designer makes the WCAG decision once and it applies everywhere. When the palette changes, only the mappings need to be re-verified, not every individual component.

OKLCH's perceptual uniformity ([ADR-009](/reference/decisions/0009-oklch-color-space)) is what makes this reliable: because lightness steps are visually uniform, a shade that passes contrast at 4.5:1 genuinely looks different enough to read.

**Alternatives considered:** per-component color assignments (must be re-verified on every palette change), automated contrast calculation at render time (adds runtime cost, requires the full palette at render), CSS `prefers-color-scheme` only (insufficient control for design system governance).

## Consequences

WCAG contrast compliance is enforced at the theme level, not the component level. Designers verify mappings once; components consume them automatically. Dark mode is handled by CSS variable reassignment with no component logic changes required.

Trade-off: designers must maintain foreground mappings as part of the theme authoring process. The theme becomes more complex. Per-component color overrides are not supported by design.

**Related:** [ADR-009](/reference/decisions/0009-oklch-color-space) (OKLCH makes accurate contrast calculation possible), [ADR-001](/reference/decisions/0001-content-design-separation) (design rules enforced in UJLT)
