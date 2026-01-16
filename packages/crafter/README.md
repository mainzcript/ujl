# @ujl-framework/crafter

**Visual Editor for UJL Content** - A SvelteKit-based visual editor for creating and editing UJL content documents (`.ujlc.json`) and theme documents (`.ujlt.json`).

The Crafter provides a WYSIWYG editing experience with two distinct modes: **Editor** for content editing and **Designer** for theme customization. It features a modular architecture with centralized state management, dependency injection, and support for both inline and backend media storage.

---

## Installation

```bash
pnpm add @ujl-framework/crafter
```

**Peer Dependencies:**

```bash
pnpm add @ujl-framework/core @ujl-framework/adapter-svelte @ujl-framework/types @ujl-framework/ui svelte
```

## Quick Start

### Using the Imperative API (Recommended)

The `UJLCrafter` class provides a programmatic API for embedding the editor in any application:

```typescript
import { UJLCrafter } from '@ujl-framework/crafter';
import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';

// Initialize the editor
const crafter = new UJLCrafter({
	target: '#editor-container',
	document: myContentDocument, // Optional
	theme: myThemeDocument // Optional
});

// Listen for document changes
const unsubscribe = crafter.onDocumentChange((doc) => {
	console.log('Document changed:', doc);
	// Save to backend, update state, etc.
});

// Listen for theme changes
crafter.onThemeChange((theme) => {
	console.log('Theme changed:', theme);
});

// Get current state
const currentDoc = crafter.getDocument();
const currentTheme = crafter.getTheme();
const mode = crafter.getMode(); // 'editor' | 'designer'

// Programmatically control the editor
crafter.setMode('designer');
crafter.selectNode('module-123');

// Cleanup
crafter.destroy();
```

### Using the Svelte Component (Advanced)

For direct Svelte integration, you can use the component directly:

```svelte
<script lang="ts">
	import UJLCrafterSvelte from '@ujl-framework/crafter/ujl-crafter.svelte';
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';

	let document: UJLCDocument = $state(/* ... */);
	let theme: UJLTDocument = $state(/* ... */);
</script>

<UJLCrafterSvelte {document} {theme} />
```

> **Note**: The component API is less stable than the imperative API. Prefer `UJLCrafter` class for production use.

## Architecture

### Data Flow

```
UJLC Document / UJLT Document
    ↓
CrafterStore (Single Source of Truth)
    ↓
Composer (AST Generation)
    ↓
Adapter (Svelte Components)
    ↓
Preview Canvas
```

### Core Concepts

**Two Editing Modes:**

- **Editor Mode** (`'editor'`): Content editing mode for `.ujlc.json` documents
  - Module tree navigation
  - Property editing
  - Drag & drop module manipulation
  - Media library integration

- **Designer Mode** (`'designer'`): Theme editing mode for `.ujlt.json` documents
  - Design token editing
  - Color palette management
  - Typography configuration
  - Spacing and layout tokens

**State Management:**

The Crafter uses a centralized store (`CrafterStore`) built with Svelte 5 runes:

- **Single Source of Truth**: All state managed in one place
- **Dependency Injection**: All dependencies passed via factory
- **Immutable Updates**: All state changes are immutable
- **Unidirectional Data Flow**: State flows down, actions flow up

**Component Structure:**

```
UJLCrafter (Root)
├── Header (Toolbar, mode switching, import/export)
├── Sidebar (Editor: module tree, component picker)
├── Canvas (Preview with viewport simulation)
└── Panel (Properties or Designer based on mode)
```

## Features

### Content Editing (Editor Mode)

- **Module Tree Navigation**: Hierarchical view of all modules with expand/collapse
- **Click-to-Select**: Click any module in preview to select and edit
- **Property Panel**: Edit module fields with type-safe inputs
- **Drag & Drop**: Reorder modules within slots
- **Component Picker**: Add new modules from the registry
- **Operations**: Copy, move, delete, duplicate modules
- **Rich Text Editing**: TipTap-based rich text editor for text fields
- **Media Library**: Upload and manage images with inline or backend storage

### Theme Editing (Designer Mode)

- **Token Editing**: Edit design tokens (colors, typography, spacing)
- **Color Palette**: Visual color picker with OKLCH support
- **Typography Groups**: Configure base, heading, link, code, and highlight typography
- **Live Preview**: See changes reflected immediately in the preview

### Media Library

The Crafter supports two storage modes for media:

- **Inline Storage** (default): Media stored as Base64 in UJLC documents
- **Backend Storage**: Media stored on Payload CMS with references in documents

For detailed setup instructions, see [MEDIA_LIBRARY_SETUP.md](./MEDIA_LIBRARY_SETUP.md).

### Viewport Simulation

Preview your content at different viewport sizes:

- Desktop (1024px)
- Tablet (768px)
- Mobile (375px)
- Responsive (full width)

### Import/Export

- **Import**: Load `.ujlc.json` or `.ujlt.json` files
- **Export**: Download current documents as JSON files
- **Validation**: All imports are validated against Zod schemas

## API Reference

### UJLCrafter Class

```typescript
class UJLCrafter {
	constructor(options: UJLCrafterOptions);

	// State Access
	getDocument(): UJLCDocument;
	getTheme(): UJLTDocument;
	getMode(): 'editor' | 'designer';
	getSelectedNodeId(): string | null;

	// State Mutation
	setDocument(document: UJLCDocument): void;
	setTheme(theme: UJLTDocument): void;
	setMode(mode: 'editor' | 'designer'): void;
	selectNode(nodeId: string | null): void;

	// Event Handlers
	onDocumentChange(callback: DocumentChangeCallback): () => void;
	onThemeChange(callback: ThemeChangeCallback): () => void;
	onNotification(callback: NotificationCallback): () => void;

	// Lifecycle
	destroy(): void;
}
```

### Types

```typescript
interface UJLCrafterOptions {
	target: string | HTMLElement;
	document?: UJLCDocument;
	theme?: UJLTDocument;
}

type DocumentChangeCallback = (document: UJLCDocument) => void;
type ThemeChangeCallback = (theme: UJLTDocument) => void;
type NotificationCallback = (
	type: 'success' | 'error' | 'info' | 'warning',
	message: string,
	description?: string
) => void;
```

## CrafterStore API

The store provides a reactive API for state management:

```typescript
interface CrafterStore {
	// State (readonly)
	ujlcDocument: UJLCDocument;
	ujltDocument: UJLTDocument;
	mode: 'editor' | 'designer';
	selectedNodeId: string | null;
	expandedNodeIds: Set<string>;
	isMediaLibraryViewActive: boolean;
	mediaLibraryContext: MediaLibraryContext | null;
	viewportType: string | undefined;

	// Computed (readonly)
	rootSlot: UJLCSlotObject;
	media: UJLCMediaLibrary;
	meta: UJLCDocumentMeta;
	tokens: UJLTTokenSet;
	viewportSize: ViewportSize;

	// Services
	mediaService: MediaService;
	composer: Composer;

	// Actions
	setMode(mode: CrafterMode): void;
	setSelectedNodeId(nodeId: string | null): void;
	setNodeExpanded(nodeId: string, expanded: boolean): void;
	expandToNode(nodeId: string): void;
	setMediaLibraryViewActive(active: boolean, context?: MediaLibraryContext): void;
	setViewportType(type: string | undefined): void;

	// Functional Updates
	updateRootSlot(fn: (slot: UJLCSlotObject) => UJLCSlotObject): void;
	updateTokenSet(fn: (tokens: UJLTTokenSet) => UJLTTokenSet): void;
	updateMedia(fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary): void;
	setUjlcDocument(doc: UJLCDocument): void;
	setUjltDocument(doc: UJLTDocument): void;

	// Operations
	operations: CrafterOperations;
}
```

### Operations

High-level document manipulation operations:

```typescript
interface CrafterOperations {
	copyNode(nodeId: string): UJLCModuleObject | null;
	moveNode(nodeId: string, targetId: string, position: 'before' | 'after' | 'into'): boolean;
	deleteNode(nodeId: string): boolean;
	duplicateNode(nodeId: string): string | null;
	addModule(type: string, targetSlotId: string, position?: number): string | null;
}
```

## Media Service

The Crafter uses a pluggable media service architecture:

```typescript
interface MediaService {
	checkConnection(): Promise<ConnectionStatus>;
	upload(file: File, metadata: MediaMetadata): Promise<UploadResult>;
	get(mediaId: string): Promise<MediaLibraryEntry | null>;
	list(): Promise<MediaLibraryEntry[]>;
	delete(mediaId: string): Promise<boolean>;
}
```

Two implementations are provided:

- **InlineMediaService**: Stores media as Base64 in UJLC documents
- **BackendMediaService**: Uses Payload CMS API for storage

## Development

### Build Commands

```bash
# Development server
pnpm run dev

# Build
pnpm run build

# Type check
pnpm run check

# Format and lint
pnpm run format
pnpm run lint

# Tests
pnpm run test:unit
pnpm run test:e2e
pnpm run test:all
```

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── app/         # App shell components
│   │   │   ├── field-input/ # Field input components
│   │   │   └── ...          # Other UI components
│   │   └── ujl-crafter/     # Main Crafter components
│   │       ├── canvas/      # Preview canvas
│   │       ├── header/      # Toolbar and controls
│   │       ├── panel/       # Properties and designer panels
│   │       ├── sidebar/     # Editor sidebar
│   │       ├── ujl-crafter.svelte
│   │       └── UJLCrafter.ts
│   ├── services/            # Media service implementations
│   ├── stores/              # State management
│   │   ├── crafter-store.svelte.ts
│   │   └── operations.ts
│   └── utils/               # Utility functions
├── routes/                  # SvelteKit routes (dev app)
└── index.ts                # Public API exports
```

### Testing

The package includes both unit tests (Vitest) and E2E tests (Playwright):

```bash
# Unit tests
pnpm run test:unit

# E2E tests
pnpm run test:e2e

# All tests
pnpm run test:all
```

## Integration with UJL Framework

The Crafter integrates seamlessly with other UJL Framework packages:

- **@ujl-framework/core**: Uses `Composer` for AST generation and module registry
- **@ujl-framework/adapter-svelte**: Renders preview using Svelte adapter
- **@ujl-framework/types**: Validates documents with Zod schemas
- **@ujl-framework/ui**: Uses base UI components for the editor interface

## Related Documentation

- [Media Library Setup Guide](./MEDIA_LIBRARY_SETUP.md) - Configure backend media storage
- [UJL Framework README](../../README.md) - High-level framework overview
- [Core Package README](../core/README.md) - Composer and module system
- [Adapter Svelte README](../adapter-svelte/README.md) - Svelte rendering adapter
