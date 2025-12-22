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

- **`UJLTDocument`** (theme): Contains design tokens (colors, typography, spacing, radius, etc.) for styling
  - Structure: `{ ujlt: { meta: {...}, tokens: UJLTTokenSet } }`
  - The `tokens` object (`ujlt.tokens`) contains color palettes, typography settings, spacing, radius, and other design values
  - This is passed to components as `tokenSet` prop

### Single Source of Truth

- **`app.svelte`** holds the central state:
  - `ujlcDocument: UJLCDocument` - The UJL content document (validated on initialization)
  - `ujltDocument: UJLTDocument` - The UJL theme document (validated on initialization)
  - `mode: CrafterMode` - The current sidebar mode ('editor' or 'designer'), controls which view is displayed
  - `expandedNodeIds: Set<string>` - Reactive set of expanded node IDs in the navigation tree
  - Both documents are validated on initialization using `validateUJLCDocument` and `validateUJLTDocument`
  - These functions throw `ZodError` if validation fails, ensuring only valid documents are used
  - The mode state is owned by `app.svelte` and passed down to `SidebarLeft` as a controlled prop

### Bidirectional Tree ↔ Preview Synchronization

The Crafter provides seamless bidirectional synchronization between the navigation tree and the visual preview:

#### Tree → Preview Scrolling

- Clicking a node in the tree automatically scrolls to that component in the preview
- **Smart scroll behavior**: only scrolls if >80% of the component is outside the viewport
- Smooth scrolling animation centers the component in the preview area
- Uses manual scroll calculation with `scrollTo()` for precise container scrolling
- Preview container uses `overflow-y-auto` for independent scrolling

#### Preview → Tree Auto-Expand & Scroll

- Clicking a component in the preview automatically:
  1. **Expands** all parent nodes in the tree to reveal the clicked component
  2. **Selects** the component (updates URL with `?selected=nodeId`)
  3. **Scrolls** the tree to center the selected component
- Uses path-finding algorithm (`findPathToNode()`) to determine which nodes need expansion
- Centralized expand state managed via Svelte 5 `$state` runes for reactivity
- Expansion state persists across tree interactions (manual collapse/expand still works)
- 200ms delay before scrolling to allow for expansion animations to complete

#### Implementation Details

- **Expand State Management**: `app.svelte` maintains `expandedNodeIds` Set with reactive mutations (`.add()`, `.delete()`)
- **Context API**: `expandToNode()`, `setNodeExpanded()`, `getExpandedNodeIds()` available via `CrafterContext`
- **Controlled Collapsibles**: `nav-tree-item.svelte` uses `open={isExpanded}` bound to central state
- **Path Finding**: `findPathToNode()` in `ujlc-tree.ts` recursively finds all parent IDs to target node
- **Preview Handler**: `handleModuleClick()` in `preview.svelte` orchestrates expand → select → scroll sequence

### Context API

All mutations go through a central **Crafter Context API** (`context.ts`):

#### Theme & Content Mutations

- `updateTokenSet(fn)` - Updates theme tokens (colors, typography, spacing, radius, etc.)
  - Receives a function that takes the current `UJLTTokenSet` and returns a new one
  - Updates `ujltDocument.ujlt.tokens` immutably
  - This is the only mutation entrypoint for theme changes

- `updateRootSlot(fn)` - Updates the root slot (module structure)
  - Receives a function that takes the current `UJLCSlotObject` (root slot) and returns a new one
  - Updates `ujlcDocument.ujlc.root` immutably
  - This is the only mutation entrypoint for content structure changes

- `setSelectedNodeId(nodeId)` - Updates selected node in URL
  - Updates URL parameter `?selected=<nodeId>` without page reload
  - Triggers tree and preview synchronization

#### Tree Expansion State

- `getExpandedNodeIds()` - Returns reactive Set of expanded node IDs
  - Returns getter function to maintain Svelte 5 reactivity
  - Usage: `const expandedNodeIds = $derived(crafter.getExpandedNodeIds())`

- `setNodeExpanded(nodeId, expanded)` - Toggles individual node expansion
  - Mutates the reactive Set directly (`.add()` or `.delete()`)
  - Triggers reactive updates in all components using the expansion state

- `expandToNode(nodeId)` - Expands all parents to reveal target node
  - Uses `findPathToNode()` to find all parent IDs from root to target
  - Adds all parent IDs to `expandedNodeIds` Set
  - Called when clicking components in preview to auto-reveal in tree

#### Content Operations

- `operations` - High-level operations for document manipulation (created via `createOperations()` factory):
  - **Node Operations:**
    - `copyNode(nodeId)` - Copies a node (preserves IDs, new IDs assigned at paste time)
    - `cutNode(nodeId)` - Cuts a node (removes and returns it for clipboard, IDs preserved until paste)
    - `deleteNode(nodeId)` - Deletes a node from the tree
    - `pasteNode(node, targetId, slotName?)` - Pastes a node into a target node's slot (generates new IDs for uniqueness)
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
  - All tree mutations use immutable utilities from `ujlc-tree.ts`
  - Component insertion uses `getComponentDefinition()` and `createNodeFromDefinition()` from component library

#### Helper Utilities

- `generateNodeId()` - Generates unique IDs using `generateUid(10)` from `@ujl-framework/core` (nanoid with 10 chars)
- `isDescendant(node, targetId)` - Checks if node is descendant of target
- `findPathToNode(nodes, targetId)` - Finds all parent IDs from root to target (exported from `ujlc-tree.ts`)

**Why Functional Updates?**

We use a functional update pattern (`update((prev) => next)`) instead of passing new values directly. This ensures:

1. **Atomic Updates**: The update function always receives the most current state at the moment of execution, preventing race conditions when multiple updates happen in quick succession.
2. **Single Source of Truth**: Components don't need to maintain local copies or read state before updating. They just describe _how_ the state should change.
3. **Predictability**: By enforcing immutable updates via pure functions, we keep the state history clean, enabling future features like reliable Undo/Redo.

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
  - Manages `expandedNodeIds` Set for tree expansion state
  - Extracts `ujltDocument.ujlt.tokens` → `tokenSet` prop
  - Extracts `ujlcDocument.ujlc.root` → `contentSlot` prop
  - Provides `CrafterContext` via Svelte context API
  - Creates operations factory via `createOperations()` and provides full `CrafterContext` via Svelte context API
  - Handles mode state (`'editor' | 'designer'`) and passes it down to `SidebarLeft`
  - Implements `setNodeExpanded()` and `expandToNode()` for tree expansion control

- **`sidebar-left.svelte`**: Receives `tokenSet`, `contentSlot`, and `mode` as props, routes to Editor/Designer
  - This is a controlled component - the mode state is owned by `app.svelte` and passed down
  - Switches between Editor mode (UJLC) and Designer mode (UJLT) based on the `mode` prop
  - Forwards props to the appropriate child component
  - Includes navigation sidebar with header, content area, and footer

- **`designer.svelte`**: Reads `tokens` (theme tokens) from props, uses context API for mutations
  - Provides UI for editing colors, typography (base, heading, highlight, link, code), spacing, radius, and other theme tokens
  - Typography editor includes font selection, size, line height, letter spacing, weight, and style toggles (italic, underline, text transform)
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
  - Renders nodes at any nesting level with **controlled collapsible structure**
  - **Controlled Expansion**: Uses central `expandedNodeIds` state from context
  - `open={isExpanded}` binds Collapsible to `expandedNodeIds.has(node.meta.id)`
  - `onOpenChange={handleOpenChange}` updates central state via `crafter.setNodeExpanded()`
  - Shows drop indicators (before/after/into) during drag operations
  - Provides context menu via dropdown for cut/copy/paste/delete/insert operations
  - Handles both single-slot and multi-slot nodes differently:
    - **Single-slot nodes**: Children displayed directly under the node without showing the slot as a separate group
    - **Multi-slot nodes**: Each slot shown as a named, collapsible group (e.g., "HEADER", "CONTENT", "FOOTER")
  - Only nodes with children show the chevron icon for expanding/collapsing
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

- **`ujlc-tree.ts`**: Immutable tree manipulation utilities
  - **Search**:
    - `findNodeById(nodes, targetId)` - Recursively finds nodes by ID
    - `findParentOfNode(nodes, targetId)` - Finds parent, slot name, and index of a node
    - `findPathToNode(nodes, targetId)` - Finds all parent IDs from root to target node (for auto-expansion)
  - **Modification**:
    - `removeNodeFromTree(nodes, targetId)` - Removes node immutably
    - `insertNodeIntoSlot(nodes, parentId, slotName, nodeToInsert)` - Inserts node at end of slot
    - `insertNodeAtPosition(nodes, targetId, position, nodeToInsert)` - Inserts node at specific position
    - `updateNodeInTree(nodes, targetId, updateFn)` - Updates node using function
  - **Display Helpers**:
    - `getDisplayName(node)` - Returns formatted display name (type + title/label/content preview)
    - `formatTypeName(type)` - Converts kebab-case to Title Case
    - `formatSlotName(slotName)` - Formats slot names for display
  - **Navigation Helpers**:
    - `getChildren(node)` - Returns all children from all slots
    - `hasChildren(node)` - Checks if node has any children
    - `hasSlots(node)` - Checks if node has any slots
    - `hasMultipleSlots(node)` - Checks if node has multiple slots
  - **Validation Helpers**:
    - `canAcceptDrop(node)` - Checks if node can accept dropped items
    - `canNodeAcceptPaste(node, clipboard)` - Checks if node can accept pasted content
    - `canSlotAcceptPaste(node, slotName, clipboard)` - Checks if slot can accept pasted content
  - All functions create new objects instead of mutating inputs, ensuring predictable reactivity

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
  - **⚠️ TODO:** Currently uses manually maintained Component Library - should be generated from Module Registry (see `@ujl-framework/core` and `@ujl-framework/examples` READMEs)

- **`preview.svelte`**: Visual preview component
  - Receives `ujlcDocument` and `ujltDocument` as props
  - Composes UJLC document to AST using `Composer` from `@ujl-framework/core`
  - Renders components via `AdapterRoot` from `@ujl-framework/adapter-svelte` with metadata and click handlers
  - **Click Handler**: `handleModuleClick()` implements preview → tree sync:
    1. Calls `crafter.expandToNode(moduleId)` to reveal clicked component in tree
    2. Calls `crafter.setSelectedNodeId(moduleId)` to update selection and URL
    3. Calls `scrollToNodeInTree(moduleId)` to scroll tree to component (200ms delay)
  - **Selection Effect**: `$effect()` watches `selectedNodeId` and automatically:
    - Highlights selected component with visual outline
    - Scrolls preview to component if >80% is out of view
    - Uses manual scroll calculation with `scrollTo()` for precise container scrolling
  - Preview container uses `overflow-y-auto` for independent scrolling
  - Smart scroll detection: only scrolls if >80% of component is outside viewport

### Data Flow

1. **Read**: Components receive data via props (read-only view)
   - `tokenSet` = `ujltDocument.ujlt.tokens` (theme tokens)
   - `contentSlot` = `ujlcDocument.ujlc.root` (root slot array)

2. **Write**: Components call context API methods to update state
   - `crafter.updateTokenSet(fn)` → updates `ujltDocument.ujlt.tokens`
   - `crafter.updateRootSlot(fn)` → updates `ujlcDocument.ujlc.root`
   - `crafter.operations.*()` → high-level operations that internally use `updateRootSlot()`
   - `crafter.setNodeExpanded(nodeId, expanded)` → updates `expandedNodeIds` Set
   - `crafter.expandToNode(nodeId)` → expands all parents to reveal target

3. **React**: State changes trigger reactive updates, props flow down, UI re-renders
   - When `ujltDocument` or `ujlcDocument` change, new props are computed
   - When `expandedNodeIds` changes, tree collapsibles update
   - Child components reactively update their UI
   - Preview re-renders with new content/theme

### Editor Features

#### Selection System

- Selected node/slot tracked via URL parameter `?selected=<id>` or `?selected=<parentId>:<slotName>`
- Navigating to a node updates the URL without page reload (`goto()` with `replaceState: true`)
- Visual feedback: Selected items highlighted with custom styling in both tree and preview
- Slot selection format: `parentId:slotName` (e.g., `"abc123:children"`)
- Clicking in preview auto-expands tree to reveal selected component

#### Clipboard Operations

- **Cross-browser clipboard support** via browser Clipboard API with localStorage fallback:
  - System clipboard integration enables copy/paste between different browsers and tabs
  - localStorage fallback for Safari (user interaction requirement) and page reloads
  - Clipboard data persists across page reloads and browser sessions
- **Local clipboard state** in `editor.svelte` supports both:
  - Regular nodes: `UJLCModuleObject`
  - Complete slots: `{ type: 'slot', slotName: string, content: UJLCModuleObject[] }`
- **Node operations:**
  - Copy: Duplicates node preserving IDs (new IDs assigned at paste time)
  - Cut: Removes node and saves to clipboard (IDs preserved until paste, then regenerated)
  - Paste: Inserts clipboard node into target's slot with new unique IDs (enables multiple pastes)
  - Delete: Removes node without clipboard (prevents deleting root)
- **Slot operations:**
  - Copy Slot: Copies entire slot content to clipboard (IDs preserved)
  - Cut Slot: Empties slot and saves content to clipboard (IDs preserved)
  - Paste Slot: Replaces target slot content with clipboard (new IDs generated, must match slot type)

#### Keyboard Shortcuts

Implemented in `editor.svelte` via `handleKeyDown()`:

- `Ctrl+C` / `Cmd+C` - Copy selected node (nodes only, not slots)
- `Ctrl+X` / `Cmd+X` - Cut selected node (nodes only, not slots)
- `Ctrl+V` / `Cmd+V` - Paste clipboard into selected node or slot
- `Ctrl+I` / `Cmd+I` - Insert component into selected node or slot
- `Delete` / `Backspace` - Delete selected node (nodes only, not slots, root node cannot be deleted)

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

All tree manipulations in `ujlc-tree.ts` are **immutable**:

- **Search**: `findNodeById()`, `findParentOfNode()`, `findPathToNode()` - recursive traversal
- **Modification**: `removeNodeFromTree()`, `insertNodeIntoSlot()`, `insertNodeAtPosition()`, `updateNodeInTree()`
- **Display**: `getDisplayName()` shows type + title/label/content preview
- **Navigation**: `getChildren()`, `hasChildren()`, `hasSlots()`, `hasMultipleSlots()`
- **Validation**: `canAcceptDrop()`, `canNodeAcceptPaste()`, `canSlotAcceptPaste()`

All functions create new objects instead of mutating inputs, ensuring predictable reactivity.

### Theme Token Generation

#### Color Theme Generation

The Crafter generates Tailwind-like OKLCH color palettes from a single input color and derives light/dark variants plus complete foreground matrices for all flavor combinations using APCA contrast. Only the `shades` field of each color set stores actual OKLCH values; all other color tokens (e.g. `light`, `dark`, `lightForeground`, `darkForeground`) are shade references that point to entries in `shades`.

**Ambient Flavor Special Handling:**
The ambient flavor is unique as it serves as the base background color. Instead of a single input color, it accepts two distinct colors (`lightHex` and `darkHex`) to independently control the appearance of light and dark modes. The system interpolates a shade palette that transitions from the light color (shades 50-100) to the dark color (shades 900-950).

All color utilities live in the `$lib/tools/colors/` toolkit and are re-exported from `$lib/tools/colors/index.js` for a single, cohesive API.
Color editing in the UI is handled by the `ColorPaletteInput` component, which receives a `colorSet` and the shared `palette` as read-only props, plus the current `flavor`, and reports changes via an `onChange` or `onOriginalChange` callback, following a unidirectional data flow (props down, events up).

#### Typography & Spacing

The Designer mode provides comprehensive typography editing for five typography styles:

- **Base Text**: Font, size, line height, letter spacing, weight, italic, underline, text transform
- **Headings**: Same as base, plus flavor selection (ambient, primary, secondary, accent)
- **Code**: Font (monospace), size, line height, letter spacing, weight
- **Highlight**: Flavor selection, bold, italic, underline
- **Link**: Bold, underline

Typography tokens are edited via dedicated group components (`base-typography-group.svelte`, `heading-typography-group.svelte`, etc.) that provide UI controls for each property. All typography changes flow through `updateBaseTypography()`, `updateHeadingTypography()`, etc. functions in `designer.svelte`, which use the context API's `updateTokenSet()` for immutable updates.

**Spacing & Radius:**
The Designer also provides controls for global spacing and border radius tokens via the `AppearanceGroup` component. These values are used throughout the theme for consistent spacing and rounded corners.

## Testing-Strategie:

### Übersicht

Das UJL Crafter Projekt verwendet eine zweigleisige Test-Strategie mit **Unit Tests** (Vitest) für Logik/Komponenten und **E2E Tests** (Playwright) für User-Flows. Die Tests sind tief in die CI/CD-Pipeline integriert und stellen sicher, dass sowohl isolierte Funktionalität als auch komplette User-Journeys zuverlässig funktionieren.

---

### Test-Frameworks

#### Vitest (Unit Tests)

- **Framework**: Vitest 3.2.3 mit JSDOM-Umgebung
- **Testing Library**: @testing-library/svelte 5.2.3
- **Coverage**: v8 Provider (Text, JSON, HTML Reports)
- **Konfiguration**: `vitest.config.ts`
- **Test-Pattern**: `src/**/*.{test,spec}.{js,ts}`

#### Playwright (E2E Tests)

- **Framework**: Playwright 1.56.1
- **Browser**: Chromium (weitere optional aktivierbar)
- **Konfiguration**: `playwright.config.ts`
- **Test-Pattern**: `e2e/**/*.test.ts`
- **Timeouts**: 30s pro Test, 120s für Webserver-Start

---

### Unit Tests

#### Abgedeckte Bereiche

##### 1. **Designer Update Functions** (`designer.test.ts`)

Unit tests for theme token update functions:

- **Typography Updates**:
  - `updateBaseTypography()` - Merges partial updates, preserves existing fields, handles multiple fields
  - `updateHeadingTypography()` - Same as base, plus flavor updates
- **Token Updates**:
  - `updateSpacingToken()` - Updates spacing value, preserves other tokens, handles zero values
  - `updateRadiusToken()` - Updates radius value, preserves other tokens, handles zero values

**Test Pattern**: Uses mock `CrafterContext` to test update logic without Svelte component rendering. Validates merge behavior, field preservation, and edge cases.

##### 2. **Tree Utilities** (`ujlc-tree.test.ts`)

Umfassende Tests für die Baum-Manipulation-Logik:

- **Node-Operationen**:
  - `findNodeById()` - Findet Nodes auf allen Verschachtelungsebenen
  - `findParentOfNode()` - Ermittelt Parent-Node, Slot-Namen und Index
  - `removeNodeFromTree()` - Immutable Node-Entfernung
  - `insertNodeIntoSlot()` - Einfügen in bestehende/neue Slots
  - `insertNodeAtPosition()` - Positioniertes Einfügen (before/middle/after)
  - `updateNodeInTree()` - Immutable Node-Updates (Felder, Metadaten)

- **Slot-Operationen**:
  - `getFirstSlotName()` - Erster Slot-Name
  - `hasSlots()` - Slot-Existenz-Check
  - `hasMultipleSlots()` - Multi-Slot-Detection
  - `getAllSlotEntries()` - Alle Slots inkl. leerer

- **Display & Utility**:
  - `getDisplayName()` - Generiert Anzeigenamen (Title/Label/Headline/Content)
  - `formatTypeName()` - Kebab-case → Title Case Konvertierung
  - `getChildren()` - Alle Kinder über alle Slots
  - `hasChildren()` - Kinder-Existenz-Check

- **Drag & Drop / Clipboard**:
  - `canAcceptDrop()` - Drop-Ziel-Validierung
  - `canNodeAcceptPaste()` - Paste-Ziel-Validierung (Node/Slot-Clipboard)

**Besonderheiten**:

- Alle Operationen sind **immutable** (Original-Tree unverändert)
- Tests verwenden Mock-Factory (`createMockNode`, `createMockTree`, `createMockMultiSlotTree`)
- Edge-Cases: Leere Trees, nicht existierende Nodes, verschachtelte Multi-Slot-Strukturen

##### 3. **Context API** (`context.test.ts`)

Tests für zentrale App-Context-Funktionen:

- **ID-Generierung**:
  - `generateNodeId()` - 10-Zeichen IDs, Einzigartigkeit, valide Zeichen

- **Path-Finding**:
  - `findPathToNode()` - Findet Parent-Pfade für Tree-Expansion
  - Funktioniert mit tief verschachtelten Nodes
  - Gibt leeres Array für Root-Nodes zurück
  - Null für nicht existierende Nodes

**Test-Daten**: Verwendet Mock-Factory für konsistente Test-Trees

#### Test-Setup (`setup.ts`)

- **Cleanup**: Automatisches Cleanup nach jedem Test via `@testing-library/svelte`
- **Custom Matchers**:
  - `toBeValidNodeId(string)` - Validiert 10-Zeichen Node-IDs

---

### E2E Tests

#### Abgedeckte User-Flows

##### 1. **Typography & Spacing Editor** (`typography-spacing.test.ts`)

E2E tests for Designer mode typography and spacing editing:

- **Typography Groups**: Verifies all typography groups (Base Text, Headings, Code, Highlight, Link) are visible and collapsible
- **Font Selection**: Tests font combobox interaction and selection persistence
- **Size Updates**: Tests number slider with input for typography size changes
- **Flavor Selection**: Tests heading typography flavor selection (ambient, primary, secondary, accent)
- **Spacing Updates**: Tests spacing token editing via number slider
- **Radius Updates**: Tests radius token editing via number slider

**Test Pattern**: Switches to Designer mode, opens collapsible groups, interacts with UI controls, and verifies changes persist.

##### 2. **Page Setup** (`page-setup.test.ts`)

Grundlegende App-Struktur und -Verhalten:

- **Disclaimer-Dialog**:
  - Erscheint beim ersten Besuch
  - "Got it"-Button schließt Dialog
  - Wird nach Dismissal nicht mehr angezeigt (LocalStorage)

- **Layout-Struktur**:
  - 3 Hauptbereiche sichtbar: Sidebar Left, Preview, Sidebar Right
  - Header mit Breadcrumb-Navigation
  - Sticky Header-Positionierung

- **Sidebar-Trigger**:
  - Mode-Switcher (Editor/Designer) in Sidebar Left
  - Dropdown-Menü funktioniert
  - Mode-Wechsel aktualisiert Sidebar-Inhalt

##### 3. **Editor Mode** (`editor.test.ts`)

Navigation Tree und Node-Interaktionen:

- **Navigation Tree**:
  - Sichtbar mit Root-Node "Document"
  - Root-Nodes werden angezeigt
  - Nodes haben Text-Content

- **Node-Expansion**:
  - Chevron-Click togglet Expansion
  - `data-state="open/closed"` korrekt gesetzt
  - Collapsible-Animation funktioniert

- **Node-Selection**:
  - Click auf Node-Button selektiert Node
  - URL-Parameter `?selected=nodeId` wird gesetzt
  - Selektierter Node ist visuell hervorgehoben

##### 4. **Preview Interactions** (`preview.test.ts`)

Preview-Rendering und Editor-Synchronisation:

- **Basic Rendering**:
  - Preview rendert Komponenten mit `data-ujl-module-id`
  - Clickable Components haben `role="button"`
  - Content wird korrekt angezeigt

- **Click-to-Select**:
  - Click auf Preview-Component selektiert Node im Tree
  - URL enthält `?selected=moduleId`
  - Component erhält `.ujl-selected` CSS-Klasse

- **Expand-to-Node**:
  - Click auf tief verschachtelte Component expandiert Parent-Nodes
  - Tree wird automatisch zum selektierten Node gescrollt
  - Path-Finding-Algorithmus funktioniert korrekt

- **Hover Effects**:
  - Hover auf Component zeigt Outline (2px solid)
  - Child-Hover entfernt Parent-Outline (CSS `:has()` Selector)
  - Hover-State wird korrekt verwaltet

- **Tree-to-Preview Scroll**:
  - Click auf Tree-Node scrollt Preview zu Component
  - Nur wenn Component außerhalb Viewport (Smart Scrolling)
  - Scroll-Position bleibt stabil wenn bereits sichtbar

- **Theme Changes**:
  - Preview-Selection bleibt bei Theme-Änderungen erhalten
  - Designer-Mode: Theme-Änderungen reflektieren sich im Preview
  - Selection-State bleibt über Mode-Wechsel hinweg erhalten

##### 5. **Sidebar Right** (`sidebar-right.test.ts`)

Export/Import und Property-Editing:

- **Export-Dropdown**:
  - Button öffnet Dropdown-Menü
  - "Export Theme" und "Export Content" Optionen sichtbar
  - Dropdown schließt nach Aktion

- **Import-Dropdown**:
  - Button öffnet Dropdown-Menü
  - "Import Theme" und "Import Content" Optionen sichtbar

- **Property Editing** (wenn Node selektiert):
  - Field-Inputs werden für selektierten Node angezeigt
  - Inputs sind korrekt an Node-Fields gebunden

#### Test-Utilities

##### Test Attributes (`test-attrs.ts`)

Conditional Test-Attribute für E2E-Tests:

```typescript
testId('my-component'); // → {data-testid: 'my-component'}
testAttrs({ nodeId: '123' }); // → {data-node-id: '123'}
test('item', { nodeId: '123' }); // → Kombiniert testId + testAttrs
```

**Aktivierung**: Nur wenn `PUBLIC_TEST_MODE=true` gesetzt ist
**Verwendung**: Ermöglicht stabile Selektoren ohne Prod-Overhead

---

### CI/CD Integration

#### GitLab CI Pipeline (`.gitlab-ci.yml`)

#### Stages

1. **install** - Dependencies installieren (mit Cache)
2. **build** - Packages + Docs bauen
3. **test** - Unit + E2E Tests parallel
4. **quality** - Linting + Type-Checking
5. **deploy** - GitLab Pages (nur main/develop)

##### Test-Jobs

###### `test_unit`

```yaml
stage: test
image: node:22-slim
script: pnpm test
retry: max 2
```

- Führt alle Vitest-Tests aus
- Cached Dependencies von install-Stage
- Retries bei Runner-Failures

###### `test_e2e`

```yaml
stage: test
image: mcr.microsoft.com/playwright:v1.56.1-jammy
script: pnpm test:e2e:ci
artifacts:
  - test-results/ (JUnit XML)
  - playwright-report/ (HTML)
```

- Playwright-Browser im Docker-Image enthalten
- JUnit-Reports für GitLab-Integration
- HTML-Reports als Artifacts (1 Woche Retention)
- Retries: 2x bei fehlgeschlagenen Tests

---

### Test-Ausführung

#### Lokal

##### Unit Tests

```bash
pnpm test              # Einmalige Ausführung
pnpm test:unit         # Watch-Mode
pnpm test:ui           # Vitest UI öffnen
pnpm test:coverage     # Coverage-Report
```

##### E2E Tests

```bash
pnpm test:e2e          # Headless
pnpm test:e2e:headed   # Mit Browser-Fenster
pnpm test:e2e:ui       # Playwright UI
pnpm test:e2e:debug    # Debug-Mode
pnpm test:e2e:codegen  # Test-Generator
```

#### CI

```bash
# In GitLab CI automatisch ausgeführt
pnpm test              # Unit Tests
pnpm test:e2e:ci       # E2E mit JUnit-Reporter
```

---

### Coverage

#### Ausschlüsse

- `node_modules/`
- `src/tests/` (Test-Utilities)
- `**/*.d.ts` (Type Definitions)
- `**/*.config.*` (Config-Files)
- `**/mockData.ts` (Test-Daten)
- `**/*.{test,spec}.ts` (Test-Files selbst)

#### Reports

- **Text**: Console-Output
- **JSON**: Maschinen-lesbar
- **HTML**: Interaktiver Browser-Report

---

### Best Practices

#### Unit Tests

1. **Isolation**: Jeder Test läuft isoliert (Cleanup nach jedem Test)
2. **Immutability**: Tests verifizieren, dass Originaldaten unverändert bleiben
3. **Edge Cases**: Leere Inputs, nicht existierende Daten, Grenzwerte
4. **Mock Data**: Konsistente Mock-Factory für reproduzierbare Tests

#### E2E Tests

1. **BeforeEach Setup**: Immer sauberer State (Clear Storage, Dismiss Disclaimer)
2. **Explicit Waits**: `waitForTimeout()` für Animationen, `waitForLoadState()` für Navigation
3. **Smart Selectors**: Bevorzuge `data-testid` über CSS-Selektoren
4. **Retry Logic**: CI-Tests mit 2x Retry bei Flakiness
5. **Artifacts**: Screenshots/Videos bei Failures für Debugging

#### Test-Attribute

- Nur in Test-Mode aktiviert (`PUBLIC_TEST_MODE=true`)
- Keine Performance-Impact in Production
- Stabile Selektoren unabhängig von UI-Änderungen
