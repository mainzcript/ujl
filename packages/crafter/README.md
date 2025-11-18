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
  - `mode: CrafterMode` - The current sidebar mode ('editor' or 'designer'), controls which view is displayed
  - Both documents are validated on initialization using `validateUJLCDocument` and `validateUJLTDocument`
  - These functions throw `ZodError` if validation fails, ensuring only valid documents are used
  - The mode state is owned by `app.svelte` and passed down to `SidebarLeft` as a controlled prop

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

- **`sidebar-left.svelte`**: Receives `tokenSet`, `contentSlot`, and `mode` as props, routes to Editor/Designer
  - This is a controlled component - the mode state is owned by `app.svelte` and passed down
  - Switches between Editor mode (UJLC) and Designer mode (UJLT) based on the `mode` prop
  - Forwards props to the appropriate child component

- **`designer.svelte`**: Reads `tokens` (theme tokens) from props, uses context API for mutations
  - Provides UI for editing colors, radius, and other theme tokens
  - All changes go through `crafter.updateTokenSet()`

- **`editor.svelte`**: Reads `slot` (content structure) from props, uses context API for mutations
  - Currently a placeholder implementation
  - Will be extended with a navigation tree of the document structure

- **`preview.svelte`**: Receives `ujlcDocument` and `ujltDocument` as props, renders via `@ujl-framework/adapter-svelte`
  - Composes the content document into an AST using `Composer`
  - Renders the AST with the theme tokens using `AdapterRoot` component (reactive, Svelte-idiomatic)

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

The color utilities are organized into focused modules in `$lib/tools/colors/`:

- `colorSpaces.ts`: Color space conversions (HEX ↔ OKLCH) and distance calculations
- `contrast.ts`: APCA contrast calculations and text color selection
- `palettes.ts`: Palette generation, interpolation, and refinement
- `paletteToColorSet.ts`: Conversion from GeneratedPalette to UJLTColorSet
- `tailwindColorPlate.ts`: Tailwind reference color data

All functions and types are exported from `$lib/tools/colors/index.js`.

Color editing is handled via the `ColorPaletteInput` component located in `$lib/components/ui/color-palette-input/`, which combines a color picker with a palette preview and works with `UJLTColorSet` through unidirectional data flow (props down, events up) for seamless integration with theme tokens.

### Example Usage

**Note:** This is an internal example showing how color editing works with the new `ColorPaletteInput` component using unidirectional data flow.

```svelte
<script>
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from './context.js';
	import type { UJLTTokenSet, UJLTColorSet } from '@ujl-framework/types';
	import { ColorPaletteInput } from '$lib/components/ui/color-palette-input/index.js';

	let { tokens }: { tokens: UJLTTokenSet } = $props();
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	/**
	 * Helper function to update a single color token.
	 * This is the only mutation path for color tokens, ensuring unidirectional data flow.
	 */
	function updateColorToken(key: keyof UJLTTokenSet['color'], set: UJLTColorSet) {
		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			color: { ...oldTokens.color, [key]: set }
		}));
	}
</script>

<ColorPaletteInput
	label="Primary Color"
	colorSet={tokens.color.primary}
	onChange={(set) => updateColorToken('primary', set)}
/>
```

The `ColorPaletteInput` component:

- Receives `colorSet` as a read-only prop (no `$bindable`)
- Communicates changes via the `onChange` callback
- Handles all palette generation internally
- Works directly with `UJLTColorSet`, eliminating the need for manual hex-to-palette conversions

This follows Svelte 5 best practices: **Props down, events up** - no local state duplication or two-way bindings needed.
