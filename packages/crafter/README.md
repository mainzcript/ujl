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

- `operations` - High-level operations for document manipulation (created via `createOperations()` factory):
  - **Node Operations:**
    - `copyNode(nodeId)` - Copies a node (returns it with new ID without removing from tree)
    - `cutNode(nodeId)` - Cuts a node (removes and returns it for clipboard)
    - `deleteNode(nodeId)` - Deletes a node from the tree
    - `pasteNode(node, targetId, slotName?)` - Pastes a node into a target node's slot
    - `moveNode(nodeId, targetId, slotName?, position?)` - Moves a node to target parent's slot or position
    - `reorderNode(nodeId, targetId, position)` - Reorders a node relative to a sibling
    - `insertNode(componentType, targetId, slotName?, position?)` - Inserts a new node from component library
  - **Slot Operations:**
    - `copySlot(parentId, slotName)` - Copies a complete slot with all its content
    - `cutSlot(parentId, slotName)` - Cuts a complete slot (empties it and saves to clipboard)
    - `pasteSlot(slotData, targetParentId)` - Pastes slot content into a target node's matching slot
    - `moveSlot(sourceParentId, sourceSlotName, targetParentId, targetSlotName)` - Moves entire slot between parents

  - All operations return `boolean` (success/failure) or the affected node/slot data
  - Operations validate inputs and prevent invalid modifications (e.g., moving node into itself, deleting root)
  - All tree mutations use immutable utilities from `ujlc-tree-utils.ts`
  - Component insertion uses `getComponentDefinition()` and `createNodeFromDefinition()` from component library

- **Helper Utilities:**
  - `generateNodeId()` - Generates unique IDs using `nanoid(10)`
  - `isDescendant(node, targetId)` - Checks if node is descendant of target (prevents circular moves)

This ensures:

- Clean separation of concerns
- No direct state mutations in child components
- Immutable updates for predictable reactivity
- Validation and error handling at the operation level
- Easy extension for future features (undo/redo, module selection, etc.)
  - The context API can be wrapped with history tracking without changing component code

### Component Structure

- **`app.svelte`**: Root component, manages state and provides context
  - Holds `ujlcDocument` and `ujltDocument` as reactive state
  - Extracts `ujltDocument.ujlt.tokens` → `tokenSet` prop
  - Extracts `ujlcDocument.ujlc.root` → `contentSlot` prop
  - Creates operations factory via `createOperations()` and provides full `CrafterContext` via Svelte context API
  - Handles mode state (`'editor' | 'designer'`) and passes it down to `SidebarLeft`

- **`sidebar-left.svelte`**: Receives `tokenSet`, `contentSlot`, and `mode` as props, routes to Editor/Designer
  - This is a controlled component - the mode state is owned by `app.svelte` and passed down
  - Switches between Editor mode (UJLC) and Designer mode (UJLT) based on the `mode` prop
  - Forwards props to the appropriate child component
  - Includes navigation sidebar with header, content area, and footer

- **`designer.svelte`**: Reads `tokens` (theme tokens) from props, uses context API for mutations
  - Provides UI for editing colors, radius, and other theme tokens
  - All changes go through `crafter.updateTokenSet()`

- **`editor.svelte`**: Reads `slot` (content structure) from props, uses context API for mutations
  - Manages local clipboard state for cut/copy/paste operations (supports both nodes and slots)
  - Implements keyboard shortcuts (Ctrl+C/X/V/I, Delete) for editor operations
  - Handles component insertion via `ComponentPicker` dialog
  - Delegates rendering to `nav-tree.svelte` for the interactive document structure
  - All structural changes go through `crafter.operations.*` methods and use immutable tree utilities

- **`nav-tree.svelte`**: Main navigation tree component
  - Receives nodes array, clipboard state, and operation callbacks
  - Creates drag handler with `createDragHandler()` for drag & drop support
  - Manages selected node state via URL parameters (`?selected=<id>`)
  - Renders tree items recursively via `NavTreeItem` component
  - Supports both node dragging and slot dragging

- **`nav-tree-item.svelte`**: Individual tree node component
  - Renders nodes at any nesting level with collapsible structure
  - Shows drop indicators (before/after/into) during drag operations
  - Provides context menu via dropdown for cut/copy/paste/delete/insert operations
  - Handles both single-slot and multi-slot nodes differently
  - For multi-slot nodes or empty slots, delegates to `NavTreeSlotGroup`
  - Supports drag & drop for node reordering and moving

- **`nav-tree-slot-group.svelte`**: Slot group component for multi-slot nodes
  - Renders individual slot containers with formatted slot names
  - Shows empty state for slots without children
  - Provides slot-specific operations (copy/cut/paste slot content)
  - Supports dragging entire slots between parent nodes
  - Highlights drop targets during slot drag operations

- **`nav-tree-drag-handler.svelte.ts`**: Drag & drop state management
  - Manages reactive drag state using Svelte 5 runes
  - Supports two drag types: `'node'` (individual modules) and `'slot'` (entire slot contents)
  - Calculates drop position (before/after/into) based on mouse position
  - Prevents invalid drops (node onto itself, into descendants)
  - Provides unified event handlers for both node and slot dragging
  - Returns drag state and handlers for use in tree components

- **`ujlc-tree-utils.ts`**: Immutable tree manipulation utilities
  - `findNodeById()` - Recursively finds nodes by ID
  - `findParentOfNode()` - Finds parent, slot name, and index of a node
  - `removeNodeFromTree()` - Removes node immutably
  - `insertNodeIntoSlot()` - Inserts node at end of slot
  - `insertNodeAtPosition()` - Inserts node at specific position
  - `updateNodeInTree()` - Updates node using function
  - Display helpers: `getDisplayName()`, `formatTypeName()`, `formatSlotName()`
  - Navigation helpers: `getChildren()`, `hasChildren()`, `hasSlots()`, `canAcceptDrop()`
  - Clipboard helpers: `canNodeAcceptPaste()`, `canSlotAcceptPaste()`

- **`editor-toolbar.svelte`**: Context menu toolbar for nodes
  - Renders operation buttons (Insert, Cut, Copy, Paste, Delete)
  - Shows keyboard shortcuts for each operation
  - Dynamically enables/disables buttons based on `canCopy`, `canCut`, `canPaste`, `canInsert` props
  - Triggers callbacks with node ID when operations are selected

- **`component-picker.svelte`**: Dialog for inserting new components
  - Displays searchable component library grouped by category
  - Filters components by label, description, or tags
  - Uses `componentLibrary` from `@ujl-framework/examples/components`
  - Calls `onSelect(componentType)` callback when component is chosen
  - Resets search state when dialog closes

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
   - `crafter.operations.*()` → high-level operations that internally use `updateRootSlot()`

3. **React**: State changes trigger reactive updates, props flow down, UI re-renders
   - When `ujltDocument` or `ujlcDocument` change, new props are computed
   - Child components reactively update their UI
   - Preview re-renders with new content/theme

### Editor Features

#### Selection System

- Selected node/slot tracked via URL parameter `?selected=<id>` or `?selected=<parentId>:<slotName>`
- Navigating to a node updates the URL without page reload (`goto()` with `replaceState: true`)
- Visual feedback: Selected items highlighted with custom styling
- Slot selection format: `parentId:slotName` (e.g., `"abc123:children"`)

#### Clipboard Operations

- **Local clipboard state** in `editor.svelte` supports both:
  - Regular nodes: `UJLCModuleObject`
  - Complete slots: `{ type: 'slot', slotName: string, content: UJLCModuleObject[] }`
- **Node operations:**
  - Copy: Duplicates node with new unique ID (validates after generation)
  - Cut: Removes node and saves to clipboard (prevents cutting root)
  - Paste: Inserts clipboard node into target's slot (checks for slot compatibility)
  - Delete: Removes node without clipboard (prevents deleting root)
- **Slot operations:**
  - Copy Slot: Copies entire slot content to clipboard
  - Cut Slot: Empties slot and saves content to clipboard
  - Paste Slot: Replaces target slot content with clipboard (must match slot type)

#### Keyboard Shortcuts

Implemented in `editor.svelte` via `handleKeyDown()`:

- `Ctrl+C` / `Cmd+C` - Copy selected node (nodes only, not slots)
- `Ctrl+X` / `Cmd+X` - Cut selected node (nodes only, not slots)
- `Ctrl+V` / `Cmd+V` - Paste clipboard into selected node or slot
- `Ctrl+I` / `Cmd+I` - Insert component into selected node or slot
- `Delete` - Delete selected node (nodes only, not slots)

All shortcuts respect current selection and validate operations before execution.

#### Drag & Drop

Managed by `nav-tree-drag-handler.svelte.ts` with two drag types:

- **Node dragging** (`dragType: 'node'`):
  - Calculates drop position based on mouse Y coordinate:
    - Top 25%: `before` (insert before target)
    - Bottom 25%: `after` (insert after target)
    - Middle 50%: `into` (insert into target's slot)
  - Prevents invalid drops (node onto itself, into descendants)
  - Visual feedback via drop indicators and target highlighting
- **Slot dragging** (`dragType: 'slot'`):
  - Always uses `into` position (slots can only be dropped into nodes)
  - Moves entire slot content from source to target parent
  - Validates that target has matching slot type
  - Prevents dropping slot onto itself

Drag state includes:

- `draggedNodeId` / `draggedSlotName` + `draggedSlotParentId`
- `dropTargetId` + `dropTargetSlot`
- `dropPosition`: `'before' | 'after' | 'into' | null`

#### Component Insertion

- Opens searchable `ComponentPicker` dialog via Insert operation
- Filters component library by label, description, or tags
- Groups results by category (Layout, Content, Media, etc.)
- Creates new node from component definition with unique ID
- Inserts at position (before/after/into) relative to target
- Falls back to first slot if target has single slot

#### Tree Utilities

All tree manipulations in `ujlc-tree-utils.ts` are **immutable**:

- **Search**: `findNodeById()`, `findParentOfNode()` - recursive traversal
- **Modification**: `removeNodeFromTree()`, `insertNodeIntoSlot()`, `insertNodeAtPosition()`, `updateNodeInTree()`
- **Display**: `getDisplayName()` shows type + title/label/content preview
- **Navigation**: `getChildren()`, `hasChildren()`, `hasSlots()`, `hasMultipleSlots()`
- **Validation**: `canAcceptDrop()`, `canNodeAcceptPaste()`, `canSlotAcceptPaste()`

All functions create new objects instead of mutating inputs, ensuring predictable reactivity.

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
