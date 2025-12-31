# @ujl-framework/crafter - Visual Editor for UJL Content

This package contains the visual editor for UJL content. It provides a SvelteKit-based interface with drag & drop functionality for modules, live preview with real-time updates, a property panel for module properties, and a theme editor for `.ujlt.json` files. The Crafter enables editors to create and edit UJL content visually without having to write JSON code.

## Architecture

The Crafter uses a reactive architecture based on Svelte 5's runes and context API. For UJL document structure (`UJLCDocument`, `UJLTDocument`), see [@ujl-framework/types](../types/README.md).

### Single Source of Truth

`app.svelte` holds the central state: `ujlcDocument`, `ujltDocument` (validated on initialization), `mode` ('editor' | 'designer'), and `expandedNodeIds` for tree expansion. All state is managed reactively via Svelte 5 runes.

### Bidirectional Tree ↔ Preview Synchronization

The Crafter provides seamless bidirectional synchronization between the navigation tree and the visual preview:

- **Tree → Preview**: Clicking a node scrolls to the component in the preview (smart scrolling only when needed)
- **Preview → Tree**: Clicking a component expands parent nodes, selects the component, and scrolls the tree to reveal it

Implementation uses centralized expand state via Svelte 5 `$state` runes and path-finding algorithms. See `context.ts` and `ujlc-tree.ts` for details.

### Context API

All mutations go through a central **Crafter Context API** (`context.ts`) using functional updates for atomic, predictable state changes:

- **Theme & Content**: `updateTokenSet(fn)`, `updateRootSlot(fn)` - Immutable updates for theme tokens and content structure
- **Selection**: `setSelectedNodeId(nodeId)` - Updates URL and triggers synchronization
- **Tree Expansion**: `getExpandedNodeIds()`, `setNodeExpanded()`, `expandToNode()` - Manages tree expansion state
- **Operations**: `operations.*` - High-level document manipulation (copy, cut, paste, delete, move, insert nodes/slots)

All operations use immutable utilities and validate inputs. See `context.ts` for complete API documentation.

### Component Structure

Key components:

- **`app.svelte`**: Root component managing state (`ujlcDocument`, `ujltDocument`, `expandedNodeIds`, mode) and providing `CrafterContext`
- **`sidebar-left.svelte`**: Routes between Editor and Designer modes based on `mode` prop
- **`designer.svelte`**: Theme editor UI (colors, typography, spacing, radius) using `updateTokenSet()`
- **`editor.svelte`**: Content editor with clipboard, keyboard shortcuts, and component insertion
- **`nav-tree.svelte`**: Navigation tree with drag & drop, selection via URL parameters
- **`preview.svelte`**: Visual preview using `Composer` and `AdapterRoot`, handles click-to-select synchronization

For implementation details, see component source files in `src/lib/components/`.

### Data Flow

Components receive data via props (read-only) and update state through the Context API. State changes trigger reactive updates via Svelte 5 runes, causing props to recompute and UI to re-render.

### Editor Features

- **Selection**: Tracked via URL parameter `?selected=<id>`, visual feedback in tree and preview
- **Clipboard**: Cross-browser support (Clipboard API + localStorage fallback), supports nodes and slots
- **Keyboard Shortcuts**: `Ctrl+C/X/V/I`, `Delete` for copy, cut, paste, insert, delete operations
- **Drag & Drop**: Node and slot dragging with position calculation (before/after/into), validation prevents invalid drops
- **Component Insertion**: Searchable component picker from Module Registry, grouped by category

For implementation details, see `editor.svelte`, `nav-tree-drag-handler.svelte.ts`, and `ujlc-tree.ts`.

### Theme Token Generation

The Designer generates OKLCH color palettes from input colors, derives light/dark variants, and provides typography editing for base text, headings, code, highlight, and links. Spacing and radius tokens are also configurable. See `$lib/utils/colors/` and `designer.svelte` for implementation details.

## Testing Strategy

The Crafter follows the unified testing guidelines documented in [Testing Guidelines](../../../docs/testing.md). This section covers Crafter-specific details.

### E2E Tests with Playwright

The Crafter uses Playwright for end-to-end testing of user workflows.

#### Configuration

- **Framework**: Playwright 1.56.1
- **Browser**: Chromium (additional browsers optionally available)
- **Configuration**: `playwright.config.ts`
- **Test Pattern**: `e2e/**/*.test.ts`
- **Timeouts**: 30s per test, 120s for webserver startup

#### Covered User Flows

1. **Typography & Spacing Editor** (`typography-spacing.test.ts`)
   - Typography groups visibility and interaction
   - Font selection, size updates, flavor selection
   - Spacing and radius token editing

2. **Page Setup** (`page-setup.test.ts`)
   - Disclaimer dialog behavior
   - Layout structure (Sidebar Left, Preview, Sidebar Right)
   - Mode switcher functionality

3. **Editor Mode** (`editor.test.ts`)
   - Navigation tree visibility and interaction
   - Node expansion/collapse
   - Node selection with URL parameters

4. **Preview Interactions** (`preview.test.ts`)
   - Component rendering with metadata
   - Click-to-select functionality
   - Tree-to-preview synchronization
   - Hover effects and theme changes

5. **Sidebar Right** (`sidebar-right.test.ts`)
   - Export/Import dropdowns
   - Property editing for selected nodes

#### Test Utilities

**Test Attributes** (`test-attrs.ts`): Conditional test attributes for E2E tests.

```typescript
testId('my-component'); // → {data-testid: 'my-component'}
testAttrs({ nodeId: '123' }); // → {data-node-id: '123'}
test('item', { nodeId: '123' }); // → Combines testId + testAttrs
```

- **Activation**: Only when `PUBLIC_TEST_MODE=true` is set
- **Usage**: Enables stable selectors without production overhead

For test execution commands and general testing guidelines, see [Testing Guidelines](../../../docs/testing.md). For CI/CD pipeline information, see the [UJL Framework README](../../../README.md#cicd).
