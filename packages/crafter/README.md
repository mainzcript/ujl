# @ujl-framework/crafter - Visual Editor for UJL Content

This package contains the visual editor for UJL content. It provides a SvelteKit-based interface with drag & drop functionality for modules, live preview with real-time updates, a property panel for module properties, and a theme editor for `.ujlt.json` files. The Crafter enables editors to create and edit UJL content visually without having to write JSON code.

## Architecture

The Crafter uses a reactive architecture based on Svelte 5's runes and context API:

### Single Source of Truth

- **`app.svelte`** holds the central state:
  - `ujlcDocument: UJLCDocument` - The UJL content document
  - `ujltDocument: UJLTDocument` - The UJL theme document
  - Both are validated on initialization using `validateUJLCDocument` and `validateUJLTDocument`

### Context API

All mutations go through a central **Crafter Context API** (`context.ts`):

- `updateTokenSet(fn)` - Updates theme tokens (colors, radius, etc.)
- `updateSlot(fn)` - Updates content slots (module structure)

This ensures:

- Clean separation of concerns
- No direct state mutations in child components
- Easy extension for future features (undo/redo, module selection, etc.)

### Component Structure

- **`app.svelte`**: Root component, manages state and provides context
- **`sidebar-left.svelte`**: Receives `tokenSet` and `contentSlot` as props, routes to Editor/Designer
- **`designer.svelte`**: Reads `tokens` from props, uses context API for mutations
- **`editor.svelte`**: Reads `slot` from props, uses context API for mutations (prepared for future features)
- **`preview.svelte`**: Receives `ujlcDocument` and `ujltDocument` as props, renders via `@ujl-framework/adapter-svelte`

### Data Flow

1. **Read**: Components receive data via props (read-only view)
2. **Write**: Components call context API methods to update state
3. **React**: State changes trigger reactive updates, props flow down, UI re-renders

### Example Usage

```svelte
<script>
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from './context.js';

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
