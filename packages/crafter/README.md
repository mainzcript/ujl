# @ujl-framework/crafter - Visual Editor for UJL Content

This package contains the visual editor for UJL content. It provides a SvelteKit-based interface with drag & drop functionality for modules, live preview with real-time updates, a property panel for module properties, and a theme editor for `.ujlt.json` files. The Crafter enables editors to create and edit UJL content visually without having to write JSON code.

# Component Hierarchy Documentation

## Overview

This document describes the component hierarchy system for the UJL Framework editor. The system provides an interactive tree view for navigating and manipulating UJLC (Universal JSON Layout Content) documents with drag-and-drop support.

## Architecture

### Component Structure

```
app.svelte
├─ Context Providers (Document + Theme)
├─ sidebar-left.svelte
│  └─ editor.svelte
│     ├─ editor-toolbar.svelte (Cut/Paste/Delete)
│     └─ nav-tree.svelte (Tree View)
└─ body.svelte (Live Preview)
```

### Data Flow

```
Document Context (Svelte 5 Runes)
    ↓
editor.svelte (Operations)
    ↓
nav-tree.svelte (Visualization)
    ↓
User Interactions (Drag & Drop, Click)
    ↓
Context Updates
    ↓
body.svelte Re-renders
```

## Core Components

### 1. Document Context (`document-context.svelte.ts`)

**Purpose:** Central state management for UJLC documents using Svelte 5 Context API.

**Key Features:**

- Reactive document state with `$state` runes
- Clipboard management for cut/paste operations
- Methods for document manipulation
- Type-safe with full TypeScript support

**API:**

```typescript
class DocumentContext {
	// Properties
	document: UJLCDocument;
	clipboard: UJLCModuleObject | null;

	// Getters/Setters
	get root(): UJLCModuleObject[];
	set root(nodes: UJLCModuleObject[]);

	// Methods
	setDocument(doc: UJLCDocument): void;
	updateMeta(updates: Partial<Meta>): void;
	cutNode(node: UJLCModuleObject): void;
	clearClipboard(): void;
	getClipboard(): UJLCModuleObject | null;
	toJSON(): string;
	fromJSON(json: string): boolean;
}

// Usage
const documentContext = getDocumentContext();
documentContext.root = newNodes; // Triggers reactivity
```

### 2. Nav Tree (`nav-tree.svelte`)

**Purpose:** Renders the hierarchical tree view of UJLC document structure.

**Key Features:**

- Recursive tree rendering
- Intelligent slot visualization (single vs. multiple slots)
- Drag & Drop support (move and reorder)
- Visual feedback for drag operations
- Keyboard accessible

**Props:**

```typescript
{
  nodes: UJLCModuleObject[];
  onNodeMove?: (nodeId: string, targetId: string, slotName?: string) => boolean;
  onNodeReorder?: (nodeId: string, targetId: string, position: 'before' | 'after') => boolean;
}
```

**Slot Visualization Logic:**

```
Component with MULTIPLE slots (e.g., body + header):
├─ 📁 BODY (collapsible slot group)
│  ├─ Text Node
│  └─ Button Node
└─ 📁 HEADER (collapsible slot group)
   └─ Title Node

Component with SINGLE slot (e.g., only body):
├─ Text Node (direct children, no slot label)
└─ Button Node
```

### 3. Editor (`editor.svelte`)

**Purpose:** Manages document editing operations and coordinates between UI and context.

**Key Responsibilities:**

- Handle Cut/Paste/Delete operations
- Validate drag & drop operations
- Manage keyboard shortcuts
- Coordinate with document context

**Keyboard Shortcuts:**

| Shortcut       | Action                             |
| -------------- | ---------------------------------- |
| `Ctrl/Cmd + C` | Cut selected node                  |
| `Ctrl/Cmd + X` | Cut selected node (alternative)    |
| `Ctrl/Cmd + V` | Paste node into selected container |
| `Delete`       | Delete selected node               |

**Operations:**

```typescript
// Cut: Removes node and saves to clipboard
handleCut(): void

// Paste: Inserts clipboard content into selected node
handlePaste(): void

// Delete: Removes node without clipboard
handleDelete(): void

// Move: Drag & drop into different parent
handleNodeMove(nodeId, targetId, slotName?): boolean

// Reorder: Drag & drop within same parent
handleNodeReorder(nodeId, targetId, position): boolean
```

### 4. Tree Utilities (`ujlc-tree-utils.ts`)

**Purpose:** Immutable tree manipulation functions.

**Functions:**

```typescript
// Search
findNodeById(nodes, targetId): UJLCModuleObject | null
findParentOfNode(nodes, targetId): { parent, slotName, index } | null

// Manipulation
removeNodeFromTree(nodes, targetId): UJLCModuleObject[]
insertNodeIntoSlot(nodes, parentId, slotName, node): UJLCModuleObject[]
insertNodeAtPosition(nodes, parentId, slotName, node, position): UJLCModuleObject[]

// Utilities
getFirstSlotName(node): string | null
hasSlots(node): boolean
```

**Important:** All functions are **immutable** and return new tree structures.

## Drag & Drop System

### Drop Zones

1. **On Nodes:** Drop before, after, or into a node
2. **On Slot Groups:** Drop directly into specific slots (BODY, HEADER, etc.)

### Visual Feedback

```css
.drop-indicator-before {
	/* Blue line above target */
}
.drop-indicator-after {
	/* Blue line below target */
}
.drop-target {
	/* Dashed outline on node */
}
.drop-target-slot {
	/* Dashed outline on slot group */
}
```

### Drop Position Calculation

```
┌─────────────────┐
│  25% = BEFORE   │  ← Top quarter
├─────────────────┤
│                 │
│  50% = INTO     │  ← Middle half
│                 │
├─────────────────┤
│  25% = AFTER    │  ← Bottom quarter
└─────────────────┘
```

### Validation Rules

**Move Operations:**

- ✅ Can move into nodes with slots
- ✅ Can move into specific slot groups
- ❌ Cannot move root node
- ❌ Cannot move node into itself or its descendants
- ❌ Cannot move into nodes without slots

**Reorder Operations:**

- ✅ Can reorder siblings within same slot
- ❌ Cannot reorder across different slots
- ❌ Cannot reorder root nodes

## Node Display Names

The tree automatically generates readable labels:

```typescript
// Priority order:
1. Type + Title:    "Card: Feature Title"
2. Type + Label:    "Button: Click Me"
3. Type + Headline: "Call To Action: Ready to start?"
4. Type + Content:  "Text: Welcome to UJL Framework..." (truncated at 40 chars)
5. Type only:       "Container"
```

Type names are formatted: `"call-to-action"` → `"Call To Action"`

## State Management Pattern

### Context API

**Advantages:**

- Hierarchical scope (only available within app tree)
- Type-safe with Symbol keys
- Automatic reactivity with Svelte 5 runes
- No global pollution

**When to use:**

- Data is specific to component subtree
- Clear parent-child relationship
- Limited scope preferred

**Example:**

```svelte
<!-- app.svelte (Provider) -->
<script>
  setDocumentContext(initialDocument);
</script>

<!-- editor.svelte (Consumer) -->
<script>
  const ctx = getDocumentContext();
  ctx.root = newNodes; // Triggers reactivity everywhere
</script>
```

## Accessibility

All interactive elements follow ARIA best practices:

```html
<!-- Draggable nodes -->
<div role="button" tabindex="0" draggable="true">
	<!-- Slot groups -->
	<div role="button" tabindex="0" ondragover ondragleave ondrop></div>
</div>
```

## Performance Considerations

### Immutability

All tree operations are immutable, creating new objects:

- ✅ Predictable state changes
- ✅ Easy debugging
- ✅ Undo/Redo support (future)
- ⚠️ Memory overhead for large trees

### Reactivity

- Svelte 5 runes (`$state`, `$derived`, `$effect`) provide fine-grained reactivity
- Only affected components re-render
- Body preview re-renders on document changes via `$effect`

### Keyed Lists

All loops use unique keys:

```svelte
{#each nodes as node (node.meta.id)}
```

This ensures efficient DOM updates.

## Troubleshooting

### Common Issues

**1. Changes not reflecting in body preview**

- Check if `$effect` in body.svelte is running
- Verify documentContext is properly updated
- Check browser console for errors

**2. Drag & Drop not working**

- Verify event handlers are attached
- Check if `draggedNodeId` state is set
- Ensure `draggable="true"` attribute is present

**3. "Context not found" error**

- Ensure `setDocumentContext()` is called in parent
- Check component is child of context provider
- Verify import paths are correct

**4. Slots not displaying correctly**

- Check `hasMultipleSlots()` logic
- Verify slot names in UJLC document
- Inspect with console.log in `getSlotEntries()`
