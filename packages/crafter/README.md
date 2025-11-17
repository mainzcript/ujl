# @ujl-framework/crafter - Visual Editor for UJL Content

This package contains the visual editor for UJL content. It provides a SvelteKit-based interface with drag & drop functionality for modules, live preview with real-time updates, a property panel for module properties, and a theme editor for `.ujlt.json` files. The Crafter enables editors to create and edit UJL content visually without having to write JSON code.

## Architecture

The Crafter uses a reactive architecture based on Svelte 5's runes and context API:

### Data Model

The Crafter manages two distinct document types:

- **`UJLCDocument`** (content): Contains the structure and content of a UJL page/document
  - Structure: `{ ujlc: { meta: {...}, root: UJLCSlotObject } }`
  - The `root` slot (`ujlc.root`) is an array of root-level modules that form the document structure
  - This is passed to components as `contentSlot` prop

- **`UJLTDocument`** (theme): Contains design tokens (colors, radius, etc.) for styling
  - Structure: `{ ujlt: { meta: {...}, tokens: UJLTTokenSet } }`
  - The `tokens` object (`ujlt.tokens`) contains color palettes and design values
  - This is passed to components as `tokenSet` prop

### Single Source of Truth

- **`app.svelte`** holds the central state:
  - `ujlcDocument: UJLCDocument` - The UJL content document (validated on initialization)
  - `ujltDocument: UJLTDocument` - The UJL theme document (validated on initialization)
  - Both are validated on initialization using `validateUJLCDocument` and `validateUJLTDocument`
  - These functions throw `ZodError` if validation fails, ensuring only valid documents are used

### Context API

All mutations go through a central **Crafter Context API** (`context.ts`):

- `updateTokenSet(fn)` - Updates theme tokens (colors, radius, etc.)
  - Receives a function that takes the current `UJLTTokenSet` and returns a new one
  - Updates `ujltDocument.ujlt.tokens` immutably
  - This is the only mutation entrypoint for theme changes

- `updateRootSlot(fn)` - Updates the root slot (module structure)
  - Receives a function that takes the current `UJLCSlotObject` (root slot) and returns a new one
  - Updates `ujlcDocument.ujlc.root` immutably
  - This is the only mutation entrypoint for content structure changes

This ensures:

- Clean separation of concerns
- No direct state mutations in child components
- Immutable updates for predictable reactivity
- Easy extension for future features (undo/redo, module selection, etc.)
  - The context API can be wrapped with history tracking without changing component code

### Component Structure

- **`app.svelte`**: Root component, manages state and provides context
  - Holds `ujlcDocument` and `ujltDocument` as reactive state
  - Extracts `ujltDocument.ujlt.tokens` → `tokenSet` prop
  - Extracts `ujlcDocument.ujlc.root` → `contentSlot` prop
  - Provides `CrafterContext` via Svelte context API

- **`sidebar-left.svelte`**: Receives `tokenSet` and `contentSlot` as props, routes to Editor/Designer
  - Switches between Editor mode (UJLC) and Designer mode (UJLT) based on user selection
  - Forwards props to the appropriate child component

- **`designer.svelte`**: Reads `tokens` (theme tokens) from props, uses context API for mutations
  - Provides UI for editing colors, radius, and other theme tokens
  - All changes go through `crafter.updateTokenSet()`

- **`editor.svelte`**: Reads `slot` (content structure) from props, uses context API for mutations
  - Currently shows a navigation tree of the document structure
  - Prepared for future features like drag & drop, module selection

- **`preview.svelte`**: Receives `ujlcDocument` and `ujltDocument` as props, renders via `@ujl-framework/adapter-svelte`
  - Composes the content document into an AST using `Composer`
  - Renders the AST with the theme tokens using `svelteAdapter`

### Data Flow

1. **Read**: Components receive data via props (read-only view)
   - `tokenSet` = `ujltDocument.ujlt.tokens` (theme tokens)
   - `contentSlot` = `ujlcDocument.ujlc.root` (root slot array)

2. **Write**: Components call context API methods to update state
   - `crafter.updateTokenSet(fn)` → updates `ujltDocument.ujlt.tokens`
   - `crafter.updateRootSlot(fn)` → updates `ujlcDocument.ujlc.root`

3. **React**: State changes trigger reactive updates, props flow down, UI re-renders
   - When `ujltDocument` or `ujlcDocument` change, new props are computed
   - Child components reactively update their UI
   - Preview re-renders with new content/theme

### Color Theme Generation

The Crafter includes a sophisticated color palette generation system that creates Tailwind-like color palettes from a single input color. The system:

- Finds the closest Tailwind reference color family in OKLab space
- Optionally interpolates between two families based on hue position
- Refines the palette to anchor the exact input color at the correct shade
- Derives light/dark + text colors using APCA contrast validation

The color utilities are organized into focused modules:

- `colorSpaces.ts`: Color space conversions (HEX ↔ OKLCH) and distance calculations
- `contrast.ts`: APCA contrast calculations and text color selection
- `palettes.ts`: Palette generation, interpolation, and refinement

All functions are re-exported from `colorPlate.ts` for backward compatibility.

Palette previews are rendered via a reusable `ColorPalettePreview` component located in the designer module, which displays shade stripes and light/dark mode examples for any generated palette.

### Example Usage

**Note:** This is an internal example from `packages/crafter/src/lib/components/modules/designer/designer.svelte`.

```svelte
<script>
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from './context.js';
	import { generateColorPalette } from '$lib/tools/colorPlate.js';
	import { mapGeneratedPaletteToColorSet } from '$lib/tools/paletteToColorSet.js';

	let { tokens }: { tokens: UJLTTokenSet } = $props();
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	function updatePrimaryColor(hex: string) {
		const newPalette = generateColorPalette(hex);
		const colorSet = mapGeneratedPaletteToColorSet(newPalette);

		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			color: {
				...oldTokens.color,
				primary: colorSet
			}
		}));
	}
</script>
```
