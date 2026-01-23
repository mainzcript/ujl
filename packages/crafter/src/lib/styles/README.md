# Crafter Styles Architecture

## Shadow DOM Limitation

The Crafter uses Shadow DOM for style isolation. However, Svelte injects
component styles into `document.head`, not into the Shadow DOM.
This means `<style>` blocks in Svelte components do NOT work inside the Crafter.

## Solution: Co-Located CSS Files

Component styles that must work in the Shadow DOM are placed in separate `.css`
files next to their Svelte components and imported via `bundle.css`.

## Adding New Component Styles

1. Create `{component-name}.css` in the same folder as the Svelte component
2. Add `@import` to `styles/components.css`
3. Do NOT use `<style>` blocks in the Svelte component (ESLint will error)

## Directory Structure

```
src/lib/
├── styles/
│   ├── bundle.css              # Entry-point (imports everything)
│   ├── _bundled.css            # Generated output (Tailwind CLI)
│   ├── components.css          # Index: imports all component CSS
│   ├── README.md               # This file
│   ├── base/
│   │   └── tailwind-shadow.css # Tailwind Shadow DOM Fixes
│   └── global/
│       └── editor-mode.css     # Editor-Mode Selection Styles
│
└── components/
    └── ui/
        └── richtext-input/
            ├── richtext-input.svelte  # Component (no <style>)
            └── richtext-input.css     # Shadow DOM styles (co-located)
```

## Style Categories

- **base/** - Framework fixes (Tailwind Shadow DOM compatibility)
- **global/** - Global styles (editor mode, selection markers)
- **components.css** - Index that imports all component CSS files

## Convention

Each component CSS file should:

- Be named after its Svelte component
- Include a header comment referencing the component path
- Use scoped selectors (e.g., `.richtext-editor .ProseMirror`)

## Example Component CSS

```css
/**
 * MyComponent Shadow DOM Styles
 *
 * Component: src/lib/components/ui/my-component/my-component.svelte
 *
 * These styles must be in a separate CSS file (not in Svelte <style>)
 * because Svelte injects component styles into document.head,
 * not into the Shadow DOM where the Crafter runs.
 */

.my-component .some-element {
	/* styles */
}
```
