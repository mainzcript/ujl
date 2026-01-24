---
title: "Laufzeitsicht"
description: "Laufzeitszenarien und Interaktionen zwischen Systemkomponenten"
---

# Laufzeitsicht

## 6.1 Übersicht der Laufzeitszenarien

Die folgenden Szenarien decken die wichtigsten Abläufe des UJL-Frameworks ab:

| Szenario                     | Beschreibung                          | Beteiligte Bausteine                |
| ---------------------------- | ------------------------------------- | ----------------------------------- |
| **6.2 Document Composition** | UJL-Dokument zu AST transformieren    | `core`, `types`                     |
| **6.3 Adapter Rendering**    | AST zu UI-Komponenten rendern         | `adapter-svelte`, `ui`              |
| **6.4 Crafter Editor Flow**  | Dokument-Bearbeitung im Visual Editor | `crafter`, `core`, `adapter-svelte` |
| **6.5 Media Upload**         | Medien hochladen und referenzieren    | `crafter`, `media`                  |
| **6.6 Validation Flow**      | Dokumente validieren                  | `types`                             |

## 6.2 Document Composition

### Übersicht

Die Composition ist der zentrale Transformationsschritt: Ein UJLC-Dokument (JSON) wird in einen Abstract Syntax Tree (AST) umgewandelt, der von Adaptern gerendert werden kann.

### Sequenzdiagramm

```mermaid
sequenceDiagram
    participant Client as Consumer
    participant Composer as Composer
    participant Registry as ModuleRegistry
    participant Module as Module
    participant ImageLib as ImageLibrary

    Client->>Composer: compose(ujlcDocument, imageProvider?)
    activate Composer

    Composer->>ImageLib: new ImageLibrary(doc.ujlc.images, provider)
    activate ImageLib
    ImageLib-->>Composer: imageLibrary
    deactivate ImageLib

    loop Für jedes Modul in doc.ujlc.root
        Composer->>Composer: composeModule(moduleData)
        activate Composer
        Composer->>Registry: getModule(moduleData.type)
        Registry-->>Composer: module | undefined

        alt Modul gefunden
            Composer->>Module: compose(moduleData, composer)
            activate Module

            opt Falls Modul Image-Felder hat
                Module->>ImageLib: resolve(imageId)
                ImageLib-->>Module: UJLImageData | null
            end

            opt Falls Modul Slots hat
                loop Für jedes Kind in slots
                    Module->>Composer: composeModule(childModule)
                    Composer-->>Module: childNode (rekursiv)
                end
            end

            Module-->>Composer: UJLAbstractNode
            deactivate Module
        else Modul nicht gefunden
            Composer->>Composer: Erzeuge Error-Node
        end
        deactivate Composer
    end

    Composer-->>Client: UJLAbstractNode (Wrapper mit children)
    deactivate Composer
```

### Ablaufbeschreibung

1. **Initialisierung**: Der Consumer ruft `await Composer.compose(ujlcDocument, imageProvider?)` auf (async)
2. **Image Library Setup**: Die ImageLibrary wird mit den eingebetteten Bildern und optionalem Backend-Provider initialisiert
3. **Root-Iteration**: Für jedes Modul im `root`-Array wird `await composeModule()` aufgerufen (async)
4. **Module Lookup**: Die Registry liefert das passende Modul für den `type`
5. **Module Composition**: Das Modul transformiert seine Daten in einen AST-Node
6. **Rekursion**: Für verschachtelte Module (Slots) erfolgt ein rekursiver Aufruf
7. **Ergebnis**: Ein Wrapper-Node mit allen Kind-Nodes wird zurückgegeben

### Beteiligte Komponenten

| Komponente       | Verantwortung                                          |
| ---------------- | ------------------------------------------------------ |
| `Composer`       | Orchestriert die Composition, verwaltet ImageLibrary   |
| `ModuleRegistry` | Hält alle registrierten Module, Type → Module Lookup   |
| `ModuleBase`     | Definiert `compose()`-Schnittstelle für Module         |
| `ImageLibrary`   | Löst Image-IDs zu Bild-Daten auf (Inline oder Backend) |

### Datenstrukturen

**Eingabe (UJLCDocument):**

```typescript
{
  ujlc: {
    meta: { title: "...", _version: "..." },
    images: { "image-001": { src: "data:image/...", metadata: {...} } },
    root: [
      {
        type: "text",
        meta: { id: "text-001", updated_at: "..." },
        fields: { content: { type: "doc", content: [...] } },
        slots: {}
      }
    ]
  }
}
```

**Ausgabe (UJLAbstractNode):**

```typescript
{
  type: "wrapper",
  id: "__root__",
  props: {
    children: [
      {
        type: "text",
        id: "text-001",
        props: { content: { type: "doc", content: [...] } }
      }
    ]
  }
}
```

### Fehlerbehandlung

| Fehler               | Behandlung                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Unbekannter Modultyp | Error-Node wird erzeugt: `{ type: "error", props: { message: "Unknown module type: xyz" } }` |
| Media nicht gefunden | `null` wird zurückgegeben, Modul entscheidet über Fallback                                   |
| Ungültige Felder     | Modul-interne Validation mit Field-System                                                    |

## 6.3 Adapter Rendering

### Übersicht

Der Adapter transformiert den AST in renderfähige UI-Komponenten. Das UJL-Framework bietet zwei Adapter: `adapter-svelte` für Svelte-Anwendungen und `adapter-web` für framework-agnostische Web Components.

### Sequenzdiagramm

```mermaid
sequenceDiagram
    participant App as Application
    participant Adapter as svelteAdapter
    participant Root as AdapterRoot
    participant Theme as UJLTheme
    participant ASTRouter as ASTNode
    participant NodeComp as Node Component

    App->>Adapter: svelteAdapter(ast, tokenSet, options)
    activate Adapter

    Adapter->>Adapter: Resolve target element
    Adapter->>Root: mount(AdapterRoot, props)
    activate Root

    Root->>Theme: Render UJLTheme with tokenSet
    activate Theme
    Theme->>Theme: Generate CSS Custom Properties
    Theme->>Theme: Apply data-mode attribute

    Theme->>ASTRouter: Render ASTNode with ast
    activate ASTRouter

    ASTRouter->>ASTRouter: Switch on node.type

    alt node.type === "container"
        ASTRouter->>NodeComp: Render Container
    else node.type === "text"
        ASTRouter->>NodeComp: Render Text
    else node.type === "button"
        ASTRouter->>NodeComp: Render Button
    else ...weitere Typen
        ASTRouter->>NodeComp: Render ComponentX
    else unknown
        ASTRouter->>NodeComp: Render Error
    end

    activate NodeComp
    NodeComp->>NodeComp: Render mit UI-Komponenten

    opt Hat Kind-Nodes (children)
        loop Für jedes child in props.children
            NodeComp->>ASTRouter: Render ASTNode (child)
            Note over ASTRouter: Rekursiver Aufruf
        end
    end

    opt eventCallback provided
        NodeComp->>NodeComp: Attach click handler
        Note over NodeComp: onclick calls eventCallback(node.id)
    end

    NodeComp-->>ASTRouter: Rendered Component
    deactivate NodeComp

    ASTRouter-->>Theme: Component Tree
    deactivate ASTRouter

    Theme-->>Root: Themed Content
    deactivate Theme

    Root-->>Adapter: Mounted Component
    deactivate Root

    Adapter-->>App: MountedComponent object
    deactivate Adapter
```

### Ablaufbeschreibung

1. **Adapter-Aufruf**: Die Anwendung ruft `svelteAdapter(ast, tokenSet, options)` auf
2. **Target Resolution**: Der Adapter löst das Ziel-Element auf (Selector oder HTMLElement)
3. **Component Mount**: `AdapterRoot` wird mit Props gemountet
4. **Theme Application**: Design Tokens werden als CSS Custom Properties injiziert
5. **AST Routing**: `ASTNode` routet basierend auf `node.type` zur entsprechenden Komponente
6. **Rekursives Rendering**: Für Kind-Nodes erfolgt ein rekursiver `<ASTNode>`-Aufruf
7. **Event Binding**: Optional werden Click-Handler für Editor-Integration registriert

### Komponenten-Hierarchie

```
AdapterRoot
└── UJLTheme (CSS Custom Properties, Dark/Light Mode)
    └── ASTNode (Type Router)
        ├── Container
        │   └── ASTNode → ...
        ├── Text
        ├── Button
        ├── Card
        │   └── ASTNode → ...
        ├── Grid
        │   └── GridItem
        │       └── ASTNode → ...
        ├── Image
        ├── CallToAction
        └── Error (Fallback)
```

### Theme Token Injection

Das Theme-System generiert CSS Custom Properties aus dem `UJLTTokenSet`:

```css
:root {
	/* Color Tokens */
	--color-primary-50: oklch(97% 0.01 260);
	--color-primary-500: oklch(60% 0.15 260);
	--color-primary-950: oklch(20% 0.05 260);

	/* Typography Tokens */
	--font-base-family: "Inter", sans-serif;
	--font-base-size-md: 16px;

	/* Spacing & Radius */
	--spacing-md: 16px;
	--radius-md: 8px;
}

[data-mode="dark"] {
	/* Dark mode overrides via light/dark references */
}
```

### Event-Handling (Editor-Modus)

::: warning Adapter-Unterstützung
Die `eventCallback`-Funktion ist aktuell nur in `adapter-web` vollständig implementiert. Für `adapter-svelte` ist die Unterstützung geplant, aber noch nicht umgesetzt.
:::

Wenn `eventCallback` und `showMetadata` gesetzt sind (nur `adapter-web`):

```typescript
// In Node Component
function handleClick(event: MouseEvent) {
	if (eventCallback && node.id) {
		event.preventDefault();
		event.stopPropagation();
		eventCallback(node.id);
	}
}
```

**Effekte:**

- `data-ujl-module-id` Attribute werden gesetzt
- Click-Events propagieren die Module-ID
- Default-Aktionen werden verhindert (z.B. Button-Clicks)

## 6.4 Crafter Editor Flow

### Übersicht

Der Crafter ist der Visual Editor für UJL-Dokumente. Er nutzt Svelte 5 Runes für reaktives State-Management und eine zentrale Context-API für Mutationen.

### Hauptszenario: Modul bearbeiten

```mermaid
sequenceDiagram
    participant User as User
    participant Preview as Preview
    participant Context as CrafterContext
    participant Tree as NavTree
    participant Props as PropertyPanel
    participant Composer as Composer

    User->>Preview: Klick auf Modul
    activate Preview
    Preview->>Context: eventCallback(moduleId)
    deactivate Preview

    activate Context
    Context->>Context: setSelectedNodeId(moduleId)
    Context->>Context: Update URL: ?selected=moduleId
    Context->>Context: expandToNode(moduleId)
    Context-->>Tree: Selection changed
    Context-->>Props: Selection changed
    deactivate Context

    activate Tree
    Tree->>Tree: Scroll to selected node
    Tree->>Tree: Highlight selected node
    deactivate Tree

    activate Props
    Props->>Context: getSelectedNode()
    Context-->>Props: UJLCModuleObject
    Props->>Props: Render field editors
    deactivate Props

    User->>Props: Ändert Feld-Wert
    activate Props
    Props->>Context: operations.updateNodeField(nodeId, field, value)
    deactivate Props

    activate Context
    Context->>Context: updateRootSlot((root) => immutableUpdate)
    Context->>Context: Trigger reactive update
    deactivate Context

    Note over Composer: $derived.by() Reaktion
    activate Composer
    Composer->>Composer: compose(ujlcDocument)
    Composer-->>Preview: Neuer AST
    deactivate Composer

    activate Preview
    Preview->>Preview: Re-render mit neuem AST
    deactivate Preview
```

### State-Management

**Zentrale State-Variablen (app.svelte):**

```typescript
let ujlcDocument = $state<UJLCDocument>(initialUJLC);
let ujltDocument = $state<UJLTDocument>(initialUJLT);
let mode = $state<"editor" | "designer">("editor");
let expandedNodeIds = $state<Set<string>>(new Set());
let selectedNodeId = $state<string | null>(null);
```

**Reactive AST Composition:**

```typescript
// In Preview-Komponente
const composer = new Composer();
const ast = $derived.by(async () => await composer.compose(ujlcDocument));
```

### Context Operations

Die Context-API stellt immutable Update-Funktionen bereit:

| Operation                           | Beschreibung                      | Pattern                          |
| ----------------------------------- | --------------------------------- | -------------------------------- |
| `updateRootSlot(fn)`                | Root-Slot immutabel aktualisieren | `(root) => [...root, newModule]` |
| `updateNodeField(id, field, value)` | Einzelnes Feld aktualisieren      | Immutable nested update          |
| `moveNode(id, targetId, pos)`       | Modul verschieben                 | Remove + Insert                  |
| `deleteNode(id)`                    | Modul löschen                     | `removeNodeFromTree()`           |
| `pasteNode(node, targetId)`         | Modul einfügen                    | Clone + Insert                   |

### Drag & Drop Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Source as Source Node
    participant Target as Target Node
    participant Handler as DragHandler
    participant Context as CrafterContext

    User->>Source: dragstart
    activate Handler
    Handler->>Handler: Store dragged node info
    Handler->>Handler: Set drag effect
    deactivate Handler

    User->>Target: dragover
    activate Handler
    Handler->>Handler: Calculate drop position
    Handler->>Handler: Validate drop (nicht in sich selbst)
    Handler->>Target: Show drop indicator
    deactivate Handler

    User->>Target: drop
    activate Handler
    Handler->>Handler: Get position (before/after/into)
    Handler->>Context: operations.moveNode(sourceId, targetId, position)
    deactivate Handler

    activate Context
    Context->>Context: Validate: not circular
    Context->>Context: updateRootSlot((root) => {
    Note over Context: removeNodeFromTree()
    Note over Context: insertNodeAtPosition()
    Context->>Context: })
    deactivate Context
```

### Clipboard Operations

```mermaid
sequenceDiagram
    participant User as User
    participant Editor as Editor
    participant Clipboard as ClipboardManager
    participant Context as CrafterContext

    User->>Editor: Ctrl+C (Copy)
    activate Editor
    Editor->>Context: operations.copyNode(selectedNodeId)
    Context->>Clipboard: Write to clipboard
    Note over Clipboard: 1. Clipboard API (modern)
    Note over Clipboard: 2. localStorage (fallback)
    deactivate Editor

    User->>Editor: Ctrl+V (Paste)
    activate Editor
    Editor->>Clipboard: Read from clipboard
    Clipboard-->>Editor: ClipboardData
    Editor->>Context: operations.pasteNode(data, targetId)

    activate Context
    Context->>Context: deepCloneModuleWithNewIds(node)
    Note over Context: Generiert neue IDs für alle Nodes
    Context->>Context: insertNodeIntoSlot(...)
    deactivate Context
    deactivate Editor
```

## 6.5 Media Upload Flow

### Übersicht

Das UJL-Framework unterstützt zwei Media-Storage-Modi:

- **Inline**: Base64-encoded in UJLC-Dokument
- **Backend**: Payload CMS API

::: info Crafter Konfiguration
Der Crafter verwendet **App-Options** zur Bestimmung des Storage-Modus (`preferredStorage`, `backendUrl`, `backendApiKey`), nicht die Dokument-Konfiguration (`meta._library`). Die Dokument-Config dient nur als Metadaten-Information, wird aber vom Crafter ignoriert. Die tatsächliche Storage-Entscheidung erfolgt über die Crafter-Initialisierung.
:::

### Sequenzdiagramm: Inline Upload

```mermaid
sequenceDiagram
    participant User as User
    participant Picker as ImagePicker
    participant Service as InlineImageService
    participant Compress as Compressor
    participant Context as CrafterContext

    User->>Picker: Datei auswählen
    activate Picker
    Picker->>Service: upload(file, metadata)
    deactivate Picker

    activate Service
    Service->>Compress: compressImage(file)
    activate Compress
    Compress->>Compress: Resize & compress
    Note over Compress: Ziel: ≤100KB
    Compress-->>Service: compressedFile
    deactivate Compress

    Service->>Service: FileReader.readAsDataURL()
    Note over Service: Async Base64 encoding

    Service->>Service: generateUid()
    Service->>Context: updateImages((images) => ({...images, [id]: entry}))

    Service-->>Picker: { imageId, entry }
    deactivate Service

    activate Picker
    Picker->>Context: operations.updateNodeField(nodeId, fieldName, {imageId, alt})
    deactivate Picker

    Note over Context: Document updated with image reference
```

### Sequenzdiagramm: Backend Upload

```mermaid
sequenceDiagram
    participant User as User
    participant Picker as ImagePicker
    participant Service as BackendImageService
    participant API as Payload CMS API
    participant Context as CrafterContext

    User->>Picker: Datei auswählen
    activate Picker
    Picker->>Service: upload(file, metadata)
    deactivate Picker

    activate Service
    Service->>Service: Create FormData
    Service->>API: POST /api/images (multipart/form-data)
    Note over Service,API: Authorization: users API-Key {key}

    activate API
    API->>API: Process image (Sharp)
    Note over API: Generate sizes: thumbnail, small, medium, large, xlarge
    API->>API: Store in filesystem
    API->>API: Save metadata to PostgreSQL
    API-->>Service: PayloadMediaDoc
    deactivate API

    Service->>Service: Transform to ImageEntry
    Note over Service: Select best image size (xlarge > large > ...)
    Service->>Service: Construct full URL

    Service-->>Picker: { imageId, entry }
    deactivate Service

    activate Picker
    Picker->>Context: operations.updateNodeField(nodeId, fieldName, {imageId, alt})
    deactivate Picker
```

### Storage-Modus Konfiguration

Die Konfiguration wird im UJLC-Dokument gespeichert:

```typescript
// Inline Storage (Default)
{
  ujlc: {
    meta: {
      _library: { storage: "inline" }
    },
    images: {
      "img-001": {
        src: "data:image/jpeg;base64,...",
        metadata: {
          filename: "example.jpg",
          mimeType: "image/jpeg",
          filesize: 45678,
          width: 1920,
          height: 1080
        }
      }
    }
  }
}

// Backend Storage
{
  ujlc: {
    meta: {
      _library: {
        storage: "backend",
        url: "http://localhost:3000/api"
      }
    },
    images: {
      "img-001": {
        src: "http://localhost:3000/api/images/67890abcdef12345",
        metadata: {
          filename: "example.jpg",
          mimeType: "image/jpeg",
          filesize: 45678,
          width: 1920,
          height: 1080
        }
      }
    }
  }
}
```

### Media Resolution im Adapter

```mermaid
sequenceDiagram
    participant Module as Image Module
    participant Library as ImageLibrary
    participant Provider as ImageProvider
    participant Backend as Payload CMS

    Module->>Library: resolve(imageId)
    activate Library

    Library->>Library: Check inline storage

    alt Found in inline storage
        Library-->>Module: { src: "data:..." }
    else Not found & provider exists
        Library->>Provider: resolve(imageId)
        activate Provider
        Provider->>Backend: GET /api/images/{imageId}
        Backend-->>Provider: Image data
        Provider-->>Library: ImageSource
        deactivate Provider
        Library-->>Module: { src: URL }
    else Not found anywhere
        Library-->>Module: null
    end

    deactivate Library
```

## 6.6 Validation Flow

### Übersicht

Die Validierung erfolgt über Zod-Schemas und kann sowohl programmatisch als auch via CLI ausgeführt werden.

### CLI Validation Flow

```mermaid
sequenceDiagram
    participant User as User
    participant CLI as ujl-validate CLI
    participant Parser as JSON Parser
    participant Detector as Type Detector
    participant Validator as Zod Validator

    User->>CLI: ujl-validate ./file.json
    activate CLI

    CLI->>Parser: Read & parse file
    Parser-->>CLI: JSON object

    CLI->>Detector: detectDocumentType(json, filename)
    activate Detector
    Detector->>Detector: Check file extension
    Detector->>Detector: Check content keys (ujlt/ujlc)
    Detector->>Detector: Validate consistency
    Detector-->>CLI: 'ujlt' | 'ujlc' | error
    deactivate Detector

    alt Type = ujlt
        CLI->>Validator: validateUJLTDocument(json)
        activate Validator
        Validator->>Validator: UJLTDocumentSchema.parse()
        alt Valid
            Validator-->>CLI: UJLTDocument (typed)
        else Invalid
            Validator-->>CLI: ZodError
        end
        deactivate Validator
    else Type = ujlc
        CLI->>Validator: validateUJLCDocument(json)
        activate Validator
        Validator->>Validator: UJLCDocumentSchema.parse()
        alt Valid
            Validator-->>CLI: UJLCDocument (typed)
        else Invalid
            Validator-->>CLI: ZodError
        end
        deactivate Validator
    end

    CLI->>CLI: Generate statistics
    CLI->>User: Output result
    deactivate CLI
```

### Programmatic Validation

```typescript
import { validateUJLCDocumentSafe } from "@ujl-framework/types";

// Safe parsing (never throws)
const result = validateUJLCDocumentSafe(jsonData);

if (result.success) {
	// TypeScript knows: result.data is UJLCDocument
	const doc: UJLCDocument = result.data;
	console.log("Valid:", doc.ujlc.meta.title);
} else {
	// TypeScript knows: result.error is ZodError
	for (const issue of result.error.issues) {
		console.error(`${issue.path.join(".")}: ${issue.message}`);
	}
}
```

### Schema Hierarchie

```mermaid
graph TD
    subgraph "UJLC Validation"
        UJLCDoc[UJLCDocumentSchema]
        UJLCObj[UJLCObjectSchema]
        UJLCMeta[UJLCDocumentMetaSchema]
        UJLCImages[ImageLibraryObjectSchema]
        UJLCSlot[UJLCSlotObjectSchema]
        UJLCModule[UJLCModuleObjectSchema]

        UJLCDoc --> UJLCObj
        UJLCObj --> UJLCMeta
        UJLCObj --> UJLCImages
        UJLCObj --> UJLCSlot
        UJLCSlot --> UJLCModule
        UJLCModule -->|recursive via z.lazy| UJLCModule
    end

    subgraph "UJLT Validation"
        UJLTDoc[UJLTDocumentSchema]
        UJLTObj[UJLTObjectSchema]
        UJLTMeta[UJLTMetaSchema]
        UJLTTokens[UJLTTokenSetSchema]
        UJLTColor[UJLTColorSetSchema]
        OKLCH[OKLCHSchema]

        UJLTDoc --> UJLTObj
        UJLTObj --> UJLTMeta
        UJLTObj --> UJLTTokens
        UJLTTokens --> UJLTColor
        UJLTColor --> OKLCH
    end
```

### Validation Output

**Erfolgreiche Validierung:**

```
✅ Document is VALID!

📄 Document Details:
   Title: My Landing Page
   Description: Product showcase
   Version: 0.0.1
   Tags: landing, product, showcase
   Last Updated: 2026-01-14T10:30:00Z

📊 Content Statistics:
   Total Modules: 15
   Root Modules: 3
   Max Nesting Depth: 4
   Unique Module IDs: 15/15

🧩 Module Types:
   - container: 3x (20.0%)
   - text: 5x (33.3%)
   - button: 2x (13.3%)
   - card: 3x (20.0%)
   - image: 2x (13.3%)

🔍 Validation Checks:
   ✓ All module IDs are unique
   ✓ Nesting depth OK (4 levels)
```

**Fehlerhafte Validierung:**

```
❌ Content Document is INVALID!

🐛 Error Details:

Error 1:
   Path: ujlc → root → 0 → meta → id
   Issue: Required
   Code: invalid_type
   Location: ujlc.root.0.meta

Error 2:
   Path: ujlc → root → 1 → fields → content → type
   Issue: Invalid literal value, expected "doc"
   Code: invalid_literal
   Location: ujlc.root.1.fields.content
```

## 6.7 Cross-Flow Interaktionen

### Gesamtablauf: Dokument erstellen und anzeigen

```mermaid
sequenceDiagram
    participant Editor as Content Editor
    participant Crafter as Crafter
    participant Validator as Validator
    participant Composer as Composer
    participant Adapter as Adapter
    participant Browser as Browser

    Editor->>Crafter: Öffnet Dokument
    Crafter->>Validator: validateUJLCDocument()
    Validator-->>Crafter: UJLCDocument (validated)

    Crafter->>Composer: compose(document)
    Composer-->>Crafter: UJLAbstractNode (AST)

    Crafter->>Adapter: Render AdapterRoot with AST
    Adapter-->>Crafter: Rendered Components

    Editor->>Crafter: Bearbeitet Inhalt
    Note over Crafter: Context.operations.updateNodeField()

    Crafter->>Composer: compose(updatedDocument)
    Composer-->>Crafter: Updated AST

    Crafter->>Adapter: Re-render
    Adapter-->>Browser: Updated UI

    Editor->>Crafter: Exportiert Dokument
    Crafter->>Validator: validateUJLCDocument()
    Crafter-->>Editor: .ujlc.json Datei
```

### Datenfluss-Übersicht

```mermaid
flowchart TD
    subgraph Input["UJLC Document (JSON)"]
        Doc["ujlc: meta, media, root"]
    end

    subgraph Validation["Validation (Zod)"]
        Val["validateUJLCDocument()"]
    end

    subgraph Composition["Composition (Core)"]
        Comp["Composer.compose()"]
        CompDetails["Module Registry Lookup<br/>Media Resolution<br/>Recursive Slot Processing"]
    end

    subgraph AST["AST (Abstract Syntax Tree)"]
        ASTNode["type, id, props"]
    end

    subgraph Adapters["Adapter Layer"]
        Svelte["adapter-svelte<br/>Svelte 5 Components"]
        Web["adapter-web<br/>Custom Element"]
    end

    subgraph Output["Rendered UI"]
        UI["Design Tokens applied<br/>Interactive components<br/>data-ujl-module-id attributes"]
    end

    Input --> Validation
    Validation --> Composition
    Comp --> CompDetails
    Composition --> AST
    AST --> Svelte
    AST --> Web
    Svelte --> Output
    Web --> Output
```

## <!-- TODO: Adapters on same level? -->

## 6.8 Performance-Aspekte

### Reactive Updates im Crafter

Der Crafter nutzt Svelte 5 Runes für effiziente reaktive Updates:

```typescript
// State
let ujlcDocument = $state<UJLCDocument>(initial);

// Derived (automatisch re-computed bei Änderungen)
const ast = $derived.by(async () => await composer.compose(ujlcDocument));

// Effect (Side-effects bei Änderungen)
$effect(() => {
	// Wird ausgeführt wenn ujlcDocument sich ändert
	saveToLocalStorage(ujlcDocument);
});
```

### Lazy Media Loading

Media wird nur bei Bedarf geladen:

```typescript
// Im Image-Modul
const imageData = $derived.by(async () => {
	if (node.props.image?.imageId) {
		return await imageLibrary.resolve(node.props.image.imageId);
	}
	return null;
});
```

### Optimierungen

| Bereich           | Optimierung                                          |
| ----------------- | ---------------------------------------------------- |
| **AST-Rendering** | `{#each}` mit `key` für effizientes DOM-Diffing      |
| **Media**         | Responsive Image Sizes (thumbnail → xlarge)          |
| **Compression**   | Client-side Image Compression vor Upload             |
| **Validation**    | Lazy-Evaluation mit `z.lazy()` für rekursive Schemas |
