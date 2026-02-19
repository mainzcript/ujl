---
title: "ADR-009: OKLCH Color Space for Design Tokens"
description: "Why UJL uses OKLCH instead of RGB, HSL, or hex for theme color tokens."
---

# ADR-009: OKLCH Color Space for Design Tokens

**Status:** Accepted

## Context

Colors are central to both accessibility and brand compliance. Traditional color spaces have limitations that matter for UJL's guarantees:

**RGB/Hex**, not perceptually uniform. Equal numeric steps don't produce visually equal steps. Generating consistent palettes (50-950 shades) is unreliable.

**HSL**, more intuitive than RGB, but Lightness is not perceptually uniform. The same L value looks different across hues. WCAG contrast calculations based on HSL are imprecise.

UJL needs to generate consistent 11-shade palettes, calculate WCAG contrast ratios accurately (4.5:1 for AA), and interpolate between colors harmoniously.

## Decision

UJL uses **OKLCH** (Oklab Lightness, Chroma, Hue) as the primary color space for design tokens:

```typescript
type UJLTOklch = {
	l: number; // Lightness (0-1), perceptually uniform
	c: number; // Chroma (0+), saturation
	h: number; // Hue (0-360)
};
```

Tokens are stored as OKLCH values and output as CSS custom properties:

```css
[data-ujl-theme="brand"] {
	--primary-50: 97.2% 0.012 264;
	--primary-500: 54.6% 0.245 263;
	--primary-950: 12.9% 0.042 265;
}

.button-primary {
	background-color: oklch(var(--primary-500));
	color: oklch(var(--primary-light-foreground-primary));
}
```

Native CSS `oklch()` is used directly, no conversion to RGB at the CSS level (modern browser support: Chrome 111+, Firefox 113+, Safari 15.4+).

## Rationale

OKLCH is perceptually uniform in a way that RGB and HSL are not. Equal lightness steps look visually equal across hues. This makes automated palette generation reliable, and WCAG contrast calculations accurate, which is essential for the foreground mapping system ([ADR-020](/reference/decisions/0020-foreground-mapping-wcag)).

**Color space comparison:**

| Space     | Perceptually uniform | Gamut          | Browser support |
| --------- | -------------------- | -------------- | --------------- |
| RGB/Hex   | ✗                    | sRGB           | 100%            |
| HSL       | ✗                    | sRGB           | 100%            |
| LCH       | ✓                    | sRGB           | >90%            |
| **OKLCH** | **✓**                | **Display-P3** | **>90%**        |

**Alternatives considered:** RGB/Hex (not perceptually uniform, poor palette generation), HSL (better intuition, still not perceptually uniform), LCH (perceptually uniform but smaller gamut than OKLCH), Display-P3 directly (not a color model, no perceptual uniformity).

## Consequences

Palette generation is consistent and predictable. WCAG contrast ratios can be calculated reliably. Wide-gamut colors are accessible where supported. Foreground mappings work correctly because lightness is genuinely uniform.

Trade-off: OKLCH is less intuitive than HSL for manual editing. Design tools like Figma use RGB natively. Older browsers need a fallback (inline duplicate or `@supports`).

**Related:** [ADR-001](/reference/decisions/0001-content-design-separation) (OKLCH tokens live in UJLT), [ADR-020](/reference/decisions/0020-foreground-mapping-wcag) (foreground mapping depends on accurate lightness)
