# @ujl-framework/crafter - Visual Editor for UJL Content

This package contains the visual editor for UJL content. It provides a SvelteKit-based interface with drag & drop functionality for modules, live preview with real-time updates, a property panel for module properties, and a theme editor for `.ujlt.json` files. The Crafter enables editors to create and edit UJL content visually without having to write JSON code.

## Architecture

The Crafter uses a reactive architecture based on Svelte 5's runes and context API. For UJL document structure (`UJLCDocument`, `UJLTDocument`), see [@ujl-framework/types](../types/README.md).

### Single Source of Truth

The `CrafterStore` (created via `createCrafterStore()` in `stores/crafter-store.svelte.ts`) holds the central state:

- `ujlcDocument`, `ujltDocument` (validated on initialization)
- `mode` ('editor' | 'designer')
- `selectedNodeId` for current selection
- `expandedNodeIds` for tree expansion state
- `isMediaLibraryViewActive` and `mediaLibraryContext` for media panel

All state is managed reactively via Svelte 5 runes (`$state`, `$derived`) inside a `.svelte.ts` module, enabling full reactivity while keeping logic outside of components.

### Dependency Injection

The store receives its dependencies via factory injection:

```typescript
const store = createCrafterStore({
	initialUjlcDocument,
	initialUjltDocument,
	composer,
	createMediaService: mediaServiceFactory
});
```

This pattern enables testability and decouples the store from concrete implementations.

### Bidirectional Tree ↔ Preview Synchronization

The Crafter provides seamless bidirectional synchronization between the navigation tree and the visual preview:

- **Tree → Preview**: Clicking a node scrolls to the component in the preview (smart scrolling only when needed)
- **Preview → Tree**: Clicking a component expands parent nodes, selects the component, and scrolls the tree to reveal it

Implementation uses centralized expand state via the store and path-finding algorithms. See `stores/crafter-store.svelte.ts` and `utils/ujlc-tree.ts` for details.

### Context API

The store is provided to child components via Svelte context:

```typescript
// In ujl-crafter.svelte
setContext(CRAFTER_CONTEXT, store);

// In child components
const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
```

Child components access state directly via properties (no getter functions):

```typescript
// Direct property access
const mode = crafter.mode;
const selectedNodeId = crafter.selectedNodeId;
const rootSlot = crafter.rootSlot;

// Functional updates for mutations
crafter.updateTokenSet((tokens) => ({ ...tokens /* changes */ }));
crafter.updateRootSlot((slot) => ({ ...slot /* changes */ }));

// High-level operations
crafter.operations.insertNode(type, targetId, slotName, position);
crafter.operations.deleteNode(nodeId);
crafter.operations.moveNode(nodeId, targetId, slotName, position);
```

All operations use immutable utilities and validate inputs. See `context.ts` for type definitions and `stores/operations.ts` for implementation.

### Component Structure

Key components:

- **`ujl-crafter.svelte`**: Root component creating the store and providing it via context
- **`editor.svelte`**: Content editor with clipboard, keyboard shortcuts, and component insertion
- **`nav-tree.svelte`**: Navigation tree with drag & drop, selection via URL parameters
- **`preview.svelte`**: Visual preview using `Composer` and `AdapterRoot`, handles click-to-select synchronization
- **`properties-panel.svelte`**: Property editing for selected nodes
- **`designer-panel.svelte`**: Theme editor UI (colors, typography, spacing, radius)

For implementation details, see component source files in `src/lib/components/ujl-crafter/`.

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CrafterStore                             │
│  (Single Source of Truth - Svelte 5 Runes)                  │
│                                                             │
│  $state: ujlcDocument, ujltDocument, mode, selectedNodeId   │
│  $derived: rootSlot, tokens, mediaService, operations       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ setContext(CRAFTER_CONTEXT, store)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Child Components                          │
│  (Read via direct properties, Write via actions/updates)    │
│                                                             │
│  const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT)│
│  crafter.mode, crafter.selectedNodeId (read)                │
│  crafter.setSelectedNodeId(), crafter.operations.* (write)  │
└─────────────────────────────────────────────────────────────┘
```

Components access state via direct property access and update state through setter functions and operations. State changes trigger reactive updates via Svelte 5 runes, causing UI to re-render automatically.

### Editor Features

- **Selection**: Tracked via URL parameter `?selected=<id>`, visual feedback in tree and preview
- **Clipboard**: Cross-browser support (Clipboard API + localStorage fallback), supports nodes and slots
- **Keyboard Shortcuts**: `Ctrl+C/X/V/I`, `Delete` for copy, cut, paste, insert, delete operations
- **Drag & Drop**: Node and slot dragging with position calculation (before/after/into), validation prevents invalid drops
- **Component Insertion**: Searchable component picker from Module Registry, grouped by category
- **Media Library**: Integrated media management with support for inline and backend storage modes

For implementation details, see `editor.svelte`, `nav-tree-drag-handler.svelte.ts`, and `ujlc-tree.ts`.

### Media Library Integration

The Crafter provides a unified media management system that supports two storage modes:

**Storage Modes:**

- **Inline Storage** (default) - Media stored as Base64 within UJLC documents
- **Backend Storage** - Media stored on a Payload CMS server

**Key Components:**

- `media-picker.svelte` - UI component for selecting and uploading media
- `media-library-browser.svelte` - Browse and select from existing media
- `media-library-uploader.svelte` - Upload new media files
- `media-service.ts` - Abstract service interface for media operations
- `inline-media-service.ts` - Implementation for inline storage
- `backend-media-service.ts` - Implementation for backend storage via Payload CMS

**Configuration:**

Media library configuration is stored in the UJLC document at `ujlc.meta.media_library`:

```json
{
	"ujlc": {
		"meta": {
			"media_library": {
				"storage": "backend",
				"endpoint": "http://localhost:3000/api"
			}
		}
	}
}
```

**Environment Variables:**

For backend storage, configure the API key in `env/.env.local`:

```env
PUBLIC_MEDIA_API_KEY=your-api-key-here
```

See [MEDIA_LIBRARY_SETUP.md](./MEDIA_LIBRARY_SETUP.md) for detailed setup instructions.

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
