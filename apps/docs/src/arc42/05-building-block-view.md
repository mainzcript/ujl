---
title: "Bausteinsicht"
description: "Bausteinsicht und Moduldiagramm des UJL-Systems"
---

# Bausteinsicht

## Übersicht der Hierarchie-Ebenen

Die Dokumentation folgt einer hierarchischen Gliederung: **Level 1** zeigt das Gesamtsystem mit seinen Hauptbausteinen (Packages, Apps, Services). **Level 2** beschreibt die interne Struktur ausgewählter Bausteine im Detail. **Level 3** bietet eine Detail-Sicht auf kritische Komponenten wie den Composer oder die Module Registry.

## 5.1 Whitebox Gesamtsystem (Level 1)

### Übersichtsdiagramm

```mermaid
graph TB
    subgraph "Foundation Layer"
        Types[types<br/>Type Definitions & Validation]
    end

    subgraph "Core Layer"
        Core[core<br/>Composer & Module System]
    end

    subgraph "UI Layer"
        UI[ui<br/>Component Library]
    end

    subgraph "Adapter Layer"
        AdapterSvelte[adapter-svelte<br/>Svelte 5 Components]
        AdapterWeb[adapter-web<br/>Web Components]
    end

    subgraph "Application Layer"
        Crafter[crafter<br/>Visual Editor]
        Demo[demo<br/>Demo Application]
        Docs[docs<br/>Documentation]
        Examples[examples<br/>Example Documents]
    end

    subgraph "Service Layer"
        ImageService[library<br/>Payload CMS Backend]
    end

    Types --> Core
    Core --> UI
    UI --> AdapterSvelte
    AdapterSvelte --> AdapterWeb

    Core --> Crafter
    AdapterSvelte --> Crafter
    UI --> Crafter
    Types --> Crafter
    Crafter -.->|API Calls| ImageService

    Core --> Demo
    AdapterWeb --> Demo
    Examples --> Demo
    Types --> Demo

    Examples --> Types

    style Types fill:#8b5cf6
    style Core fill:#3b82f6
    style UI fill:#10b981
    style AdapterSvelte fill:#f59e0b
    style AdapterWeb fill:#f59e0b
    style Crafter fill:#ef4444
    style ImageService fill:#6366f1
```

### Begründung der Zerlegung

Die Architektur folgt dem **Layered Architecture Pattern** mit klaren Verantwortlichkeiten:

1. **Foundation Layer**: Gemeinsame Typen und Validierung (single source of truth)
2. **Core Layer**: Geschäftslogik (Composition, Module Registry)
3. **UI Layer**: Wiederverwendbare UI-Komponenten
4. **Adapter Layer**: Framework-spezifisches Rendering
5. **Application Layer**: End-user Applications
6. **Service Layer**: Backend-Services

**Vorteile:**

- Klare Dependency-Direction (top-down)
- Testbarkeit durch Schichten-Isolation
- Austauschbarkeit (z.B. Adapter-Layer)
- Monorepo mit pnpm Workspaces ermöglicht koordinierte Releases

### Enthaltene Bausteine (Level 1)

| Baustein           | Verantwortung                                             | Package-Name                    |
| ------------------ | --------------------------------------------------------- | ------------------------------- |
| **types**          | TypeScript-Typen und Zod-Schemas für alle UJL-Dokumente   | `@ujl-framework/types`          |
| **core**           | Composer, Module Registry, Field System, Media Library    | `@ujl-framework/core`           |
| **ui**             | shadcn-svelte UI-Komponenten (Button, Card, Dialog, etc.) | `@ujl-framework/ui`             |
| **adapter-svelte** | Svelte 5 Adapter (AST → Svelte Components)                | `@ujl-framework/adapter-svelte` |
| **adapter-web**    | Web Components Adapter (AST → Custom Elements)            | `@ujl-framework/adapter-web`    |
| **crafter**        | Visual Editor (WYSIWYG) für Content und Themes            | `@ujl-framework/crafter`        |
| **dev-demo**       | Demo-Applikation (zeigt UJL in Aktion)                    | App (kein npm-Paket)            |
| **docs**           | Dokumentations-Website (VitePress)                        | `@ujl-framework/docs`           |
| **examples**       | Beispiel-Dokumente und Themes (.ujlc.json, .ujlt.json)    | `@ujl-framework/examples`       |
| **library**        | Payload CMS Image Management Backend                      | `services/library`              |

### Wichtige Schnittstellen (Level 1)

#### Schnittstelle 1: UJL Document Formats

**Format:** JSON (.ujlc.json, .ujlt.json)

**Producer:** Crafter, AI-Systeme, manuelle Editoren

**Consumer:** core (Composer), types (Validation)

**Struktur:**

```typescript
// UJLC Content Document
interface UJLCDocument {
	ujlc: {
		meta: UJLCMeta;
		images: Record<string, ImageEntry>;
		root: UJLCModuleObject[];
	};
}

// UJLT Theme Document
interface UJLTDocument {
	ujlt: {
		meta: UJLTMeta;
		tokens: UJLTTokenSet;
	};
}
```

#### Schnittstelle 2: Abstract Syntax Tree (AST)

**Format:** TypeScript Type (UJLAbstractNode)

**Producer:** core (Composer)

**Consumer:** adapter-svelte, adapter-web

**Struktur:**

```typescript
type UJLAbstractNode = {
	type: string; // 'text', 'button', 'container', etc.
	id: string; // Unique Module ID (preserved from UJLC)
	props: Record<string, unknown>; // Node-specific properties
};
```

**Garantien:**

- Jeder Node hat eindeutige ID (wichtig für Editor-Integration)
- Type-Field ermöglicht Dispatch im Adapter
- Props sind node-spezifisch (keine generische Struktur)

#### Schnittstelle 3: Payload CMS Media API

**Protokoll:** REST (JSON)

**Endpunkt:** `http://localhost:3000/api/images`

**Authentication:** API-Key via `Authorization: users API-Key <key>`

**Wichtigste Operationen:**

| Methode | Endpoint          | Funktion                                  |
| ------- | ----------------- | ----------------------------------------- |
| GET     | `/api/images`     | Liste alle Bilder (Pagination, Filtering) |
| GET     | `/api/images/:id` | Einzelnes Bild                            |
| POST    | `/api/images`     | Upload (multipart/form-data)              |
| PATCH   | `/api/images/:id` | Metadata-Update                           |
| DELETE  | `/api/images/:id` | Löschung                                  |

**Consumer:** crafter (Media Library Browser/Uploader)

**Fallback:** Inline Storage (Base64 in .ujlc.json) wenn Backend nicht verfügbar

## 5.2 Foundation Layer (Level 2)

### 5.2.1 Baustein: types

**Zweck:** Single Source of Truth für alle Typen und Validierungslogik

#### Whitebox: types (Level 2)

```mermaid
graph TB
    subgraph "types Package"
        AST[ast.ts<br/>AST Node Types]
        UJLC[ujl-content.ts<br/>UJLC Schemas & Types]
        UJLT[ujl-theme.ts<br/>UJLT Schemas & Types]
        Media[media.ts<br/>Media Types]
        Prosemirror[prosemirror.ts<br/>Rich Text Types]
        Validation[validation.ts<br/>Validation Functions]
        CLI[cli.ts<br/>ujl-validate CLI]
    end

    CLI --> Validation
    Validation --> UJLC
    Validation --> UJLT
    UJLC --> Media
    UJLC --> Prosemirror
```

#### Enthaltene Elemente

| Datei            | Verantwortung             | Exports                                                                                       |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| `ast.ts`         | AST Node Type Definitions | `UJLAbstractNode`, Node-spezifische Types                                                     |
| `ujl-content.ts` | UJLC Zod Schemas & Types  | `UJLCDocumentSchema`, `UJLCModuleObject` (Type), `validateUJLCDocument()`, `validateModule()` |
| `ujl-theme.ts`   | UJLT Zod Schemas & Types  | `UJLTDocumentSchema`, `UJLTTokenSetSchema`, `validateUJLTDocument()`                          |
| `image.ts`       | Image Library Types       | `ImageEntry`, `ImageMetadata`, `ImageSource`, `ImageProvider`                                 |
| `prosemirror.ts` | ProseMirror Types         | `ProseMirrorDocument`, `ProseMirrorNode`, `ProseMirrorMark`                                   |
| `cli.ts`         | CLI Entry Point           | Binary: `ujl-validate`                                                                        |

#### Schnittstellen und Abhängigkeiten

**Externe Abhängigkeiten:**

- `zod` 4.2 - Schema Validation & Type Inference

**Consumer:**

- `@ujl-framework/core` (imports all types)
- `@ujl-framework/adapter-svelte` (imports AST types)
- `@ujl-framework/adapter-web` (imports AST types)
- `@ujl-framework/crafter` (imports all types)
- `apps/dev-demo` (imports document types)

#### Besondere Merkmale

**Zod Type Inference:**

```typescript
// Schema Definition
export const UJLCModuleObjectSchema = z.object({
	type: z.string(),
	meta: UJLCModuleMetaSchema,
	fields: z.record(z.string(), UJLCFieldObjectSchema),
	slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema))),
});

// Type automatisch inferiert (DRY)
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;
```

**Rekursive Schemas mit `z.lazy()`:**

```typescript
// Ermöglicht unbegrenzte Modul-Verschachtelung
slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema)));
```

**CLI Tool:**

```bash
# Auto-detect document type
ujl-validate ./my-content.ujlc.json

# Output: Validation success/failure + Statistics
```

## 5.3 Core Layer (Level 2)

### 5.3.1 Baustein: core

**Zweck:** Herzstück des UJL-Systems - Composition, Module Registry, Field System

#### Whitebox: core (Level 2)

```mermaid
graph TB
    subgraph "core Package"
        Composer[composer.ts<br/>Main Composition Logic]

        subgraph "Module System"
            ModuleRegistry[registry.ts<br/>Module Management]
            ModuleBase[base.ts<br/>Abstract Module Class]
            DefaultRegistry[default-registry.ts<br/>Built-in Modules Factory]
            ModuleConcretes[concretes/<br/>Built-in Module Implementations]
        end

        subgraph "Field System"
            FieldBase[field-base.ts<br/>Abstract Field Class]
            FieldConcretes[field-concretes/<br/>Built-in Field Implementations]
        end

        subgraph "Image System"
            ImageLibrary[image/library.ts<br/>Image Management]
        end

        subgraph "Rich Text System"
            TipTapSchema[tiptap-schema.ts<br/>Shared Rich Text Schema]
        end
    end

    Composer --> ModuleRegistry
    Composer --> ImageLibrary
    ModuleRegistry --> ModuleBase
    DefaultRegistry --> ModuleConcretes
    ModuleConcretes --> ModuleBase
    ModuleConcretes --> FieldBase
    FieldConcretes --> FieldBase
    ModuleConcretes --> TipTapSchema
```

#### 5.3.1.1 Komponent: Composer

**Verantwortung:** Orchestriert Composition von UJL-Dokumenten zu AST

**Schnittstelle:**

```typescript
class Composer {
	constructor(registry?: ModuleRegistry);

	// Hauptmethode: UJLC Document → AST (async wegen Bildauflösung)
	async compose(doc: UJLCDocument, imageProvider?: ImageProvider): Promise<UJLAbstractNode>;

	// Hilfsmethode: Einzelnes Modul → AST Node (async)
	async composeModule(moduleData: UJLCModuleObject): Promise<UJLAbstractNode>;

	// Registry Management
	registerModule(module: AnyModule): void;
	unregisterModule(module: AnyModule | string): void;
	getRegistry(): ModuleRegistry;

	// Image Library Access
	getImageLibrary(): ImageLibrary | null; // Gibt Image Library zurück (oder null, wenn nicht initialisiert)
}
```

**Ablauf:**

```
UJLCDocument
    ↓
Composer.compose()
    ↓
Loop: doc.ujlc.root.forEach()
    ↓
Composer.composeModule(moduleData)
    ↓
registry.getModule(moduleData.type)
    ↓
module.compose(moduleData, composer)  ← Recursive Call
    ↓
UJLAbstractNode (with ID preserved)
```

**Wichtige Eigenschaften:**

- ID Propagation: `moduleData.meta.id` → `node.id`
- Rekursive Composition für verschachtelte Module (Slots)
- Media Resolver Integration (optional)
- Error Handling: Unbekannte Modultypen → Error Node

#### 5.3.1.2 Komponent: Module Registry

**Verantwortung:** Zentrale Verwaltung aller verfügbaren Module

**Schnittstelle:**

```typescript
class ModuleRegistry {
	// Registrierung
	registerModule(module: ModuleBase): void;
	unregisterModule(module: AnyModule | string): void;

	// Lookup
	getModule(name: string): AnyModule | undefined;
	getAllModules(): AnyModule[];

	// Factory
	createModuleFromType(type: string, id: string): UJLCModuleObject;
}
```

**Built-in Modules (Default Registry):**

| Modul          | Typ              | Kategorie   | Beschreibung                              |
| -------------- | ---------------- | ----------- | ----------------------------------------- |
| Text           | `text`           | Content     | Text-Darstellung (ProseMirror)            |
| Button         | `button`         | Interactive | Klickbarer Button mit Link                |
| Container      | `container`      | Layout      | Generischer Layout-Container              |
| Grid           | `grid`           | Layout      | Grid-Layout (mit GridItem Children)       |
| Card           | `card`           | Content     | Content-Card (Titel, Beschreibung, Slot)  |
| Image          | `image`          | Media       | Bild-Darstellung mit Alt-Text             |
| Call-to-Action | `call-to-action` | Interactive | CTA-Block (Headline, Description, Button) |

**Erweiterbarkeit:**

```typescript
// Custom Module registrieren
const composer = new Composer();
composer.registerModule(new CustomModule());

// Oder: Custom Registry
const registry = new ModuleRegistry();
registry.registerModule(new CustomModule());
const composer = new Composer(registry);
```

#### 5.3.1.3 Komponent: Module Base Class

**Verantwortung:** Abstrakte Basisklasse für alle Module (Vertrag definieren)

**Schnittstelle:**

```typescript
abstract class ModuleBase {
	// Identifikation
	abstract readonly name: string;
	abstract readonly label: string;
	abstract readonly description: string;
	abstract readonly category: ComponentCategory;
	abstract readonly tags: readonly string[];
	abstract readonly icon: string; // SVG inner content

	// Struktur
	abstract readonly fields: FieldSet;
	abstract readonly slots: SlotSet;

	// Composition
	abstract compose(
		moduleData: UJLCModuleObject,
		composer: Composer
	): UJLAbstractNode | Promise<UJLAbstractNode>;

	// Helpers
	getSvgIcon(): string; // Wraps icon in <svg> tag
}
```

**Beispiel-Implementierung:**

```typescript
class TextModule extends ModuleBase {
	readonly name = "text";
	readonly label = "Text";
	readonly description = "Rich text content with formatting";
	readonly category = "content";
	readonly tags = ["text", "content", "rich-text"] as const;
	readonly icon = '<path d="M4 6h16M4 12h16M4 18h16"/>';

	readonly fields = [
		{
			key: "content",
			field: new RichTextField({
				label: "Content",
				default: { type: "doc", content: [] },
			}),
		},
	];

	readonly slots = [];

	compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		return {
			type: "text",
			id: moduleData.meta.id,
			props: {
				content: moduleData.fields.content as ProseMirrorDocument,
			},
		};
	}
}
```

#### 5.3.1.4 Komponent: Field Base Class

**Verantwortung:** Abstrakte Basisklasse für Field-Typen (Validation & Fitting)

**Schnittstelle:**

```typescript
abstract class FieldBase<ValueT, ConfigT> {
	protected abstract readonly defaultConfig: ConfigT;

	// Constructor merges user config with defaults
	constructor(config?: Partial<ConfigT>);

	// Validation Pipeline
	abstract validate(raw: UJLCFieldObject): raw is ValueT;
	abstract fit(value: ValueT): ValueT;

	// Combined: Validate → Fit
	parse(raw: UJLCFieldObject): ValueT {
		if (!this.validate(raw)) {
			throw new Error("Invalid field value");
		}
		return this.fit(raw);
	}

	// Serialization (für Editor)
	serialize(value: ValueT): UJLCFieldObject;

	// Metadata
	getFieldType(): string;
}
```

**Built-in Field Types:**

| Field           | Value Type             | Config                                | Zweck                        |
| --------------- | ---------------------- | ------------------------------------- | ---------------------------- |
| `TextField`     | `string`               | `maxLength`, `default`, `placeholder` | Einzeiliger Text             |
| `RichTextField` | `ProseMirrorDocument`  | `default`                             | Rich Text (TipTap)           |
| `NumberField`   | `number`               | `min`, `max`, `default`               | Numerischer Input            |
| `ImageField`    | `UJLImageData \| null` | `default`                             | Bild-Auswahl (Media Library) |

**Validation vs. Fitting:**

```typescript
class NumberField extends FieldBase<number, NumberFieldConfig> {
	validate(raw: UJLCFieldObject): raw is number {
		return typeof raw === "number"; // Type Guard
	}

	fit(value: number): number {
		// Apply constraints (min, max)
		if (this.config.min !== undefined && value < this.config.min) {
			return this.config.min;
		}
		if (this.config.max !== undefined && value > this.config.max) {
			return this.config.max;
		}
		return value;
	}
}
```

#### 5.3.1.5 Komponent: Media Library

**Verantwortung:** Abstraktion für Media Storage (Inline vs. Backend)

**Schnittstelle:**

```typescript
class ImageLibrary {
	constructor(
		initialImages: Record<string, ImageEntry>,
		provider?: ImageProvider // Optional: Backend Integration
	);

	// Resolve Media by ID
	async resolve(id: string): Promise<UJLImageData | null>;

	// Add Media Entry
	addEntry(entry: ImageEntry): void;

	// Get all entries
	getAllEntries(): ImageEntry[];
}

interface ImageProvider {
	resolve(id: string | number): Promise<ImageSource | null>; // Returns image source
}
```

**Storage Modes:**

1. **Inline Storage (Default):**
   - Media eingebettet als Base64 in `.ujlc.json`
   - Keine externe Abhängigkeit
   - Vollständige Portabilität

2. **Backend Storage (Payload CMS):**
   - Image-Referenz in `.ujlc.json` (nur `imageId`)
   - Resolver lädt Images von API
   - Features: Responsive Images, Metadaten, Versionierung

#### 5.3.1.6 Komponent: TipTap Schema

**Verantwortung:** Shared Rich Text Schema für Editor & Serializer

**Export:**

```typescript
// Exportiert TipTap Extensions Configuration
export const ujlRichTextExtensions = [
	StarterKit.configure({
		// Serializable Extensions
		heading: { levels: [1, 2, 3, 4, 5, 6] },
		bold: {},
		italic: {},
		code: {},
		blockquote: {},
		bulletList: {},
		orderedList: {},
		listItem: {},
		hardBreak: {},
		horizontalRule: {},

		// UI Extensions disabled (not serializable)
		dropcursor: false,
		gapcursor: false,
	}),
];
```

**Verwendung:**

```typescript
// Im Crafter Editor
import { Editor } from "@tiptap/core";
import { ujlRichTextExtensions } from "@ujl-framework/core";

const editor = new Editor({
	extensions: ujlRichTextExtensions,
});

// Im Adapter Serializer
import { ujlRichTextExtensions } from "@ujl-framework/core";
// Gleiche Extensions → WYSIWYG-Garantie
```

## 5.4 UI Layer (Level 2)

### 5.4.1 Baustein: ui

**Zweck:** Wiederverwendbare UI-Komponenten (shadcn-svelte basiert)

#### Whitebox: ui (Level 2)

```mermaid
graph TB
    subgraph "ui Package"
        Components[components/ui/<br/>Svelte Components]
        Hooks[hooks/<br/>Svelte 5 Hooks]
        Utils[utils/<br/>Utility Functions]
        Styles[styles/<br/>CSS Styles]
    end

    Components --> Hooks
    Components --> Utils
    Components --> Styles
```

#### Enthaltene Komponenten-Kategorien

| Kategorie        | Komponenten                             | Zweck                |
| ---------------- | --------------------------------------- | -------------------- |
| **Layout**       | Container, Grid, GridItem               | Layout-Strukturen    |
| **Typography**   | Text, Heading, Highlight                | Text-Darstellung     |
| **Interactive**  | Button, Link                            | Interaktive Elemente |
| **Overlay**      | Dialog, Drawer, Popover, Sheet, Tooltip | Overlay-Komponenten  |
| **Navigation**   | Breadcrumb, Tabs, Accordion             | Navigations-Elemente |
| **Data Display** | Table, Card, Alert, Badge               | Daten-Darstellung    |

#### Besondere Merkmale

**Tailwind CSS Integration:**

```typescript
// tailwind-variants für Type-Safe Variants
import { tv } from "tailwind-variants";

const button = tv({
	base: "inline-flex items-center justify-center rounded-md",
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground",
			destructive: "bg-destructive text-destructive-foreground",
			outline: "border border-input bg-background",
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
		},
	},
});
```

**Dark Mode Support:**

```typescript
// mode-watcher für Theme Management
import { mode } from 'mode-watcher';

<Button variant={$mode === 'dark' ? 'outline' : 'default'}>
  Click me
</Button>
```

**Abhängigkeiten:**

- `bits-ui` - Headless UI Primitives (Accessibility)
- `svelte-sonner` - Toast Notifications
- `paneforge` - Resizable Panels
- `tailwindcss` 4.x - Styling

**Consumer:**

- `@ujl-framework/adapter-svelte` (verwendet alle UI-Komponenten)
- `@ujl-framework/crafter` (verwendet UI-Komponenten für Editor-UI)

## 5.5 Adapter Layer (Level 2)

### 5.5.1 Baustein: adapter-svelte

**Zweck:** Konvertiert AST zu Svelte 5 Components (für Svelte-Apps)

#### Whitebox: adapter-svelte (Level 2)

```mermaid
graph TB
    subgraph "adapter-svelte Package"
        AdapterRoot[AdapterRoot.svelte<br/>Root Component]
        ASTNode[ASTNode.svelte<br/>Recursive Router]

        subgraph "Node Components"
            ButtonNode[Button.svelte]
            TextNode[Text.svelte]
            ContainerNode[Container.svelte]
            GridNode[Grid.svelte]
            CardNode[Card.svelte]
            ImageNode[Image.svelte]
            CTANode[CallToAction.svelte]
            ErrorNode[Error.svelte]
            WrapperNode[Wrapper.svelte]
        end

        Utils[prosemirror-serializer.ts<br/>Rich Text → HTML]
        RichTextComponent[RichText.svelte<br/>Rich Text Renderer]
        Adapter[adapter.ts<br/>Imperative Mount API]
    end

    AdapterRoot --> ASTNode
    ASTNode --> ButtonNode
    ASTNode --> TextNode
    ASTNode --> ContainerNode
    ASTNode --> GridNode
    ASTNode --> CardNode
    ASTNode --> ImageNode
    ASTNode --> CTANode
    ASTNode --> ErrorNode
    ASTNode --> WrapperNode

    TextNode --> Utils
    RichTextComponent --> Utils
    Adapter --> AdapterRoot
```

#### 5.5.1.1 Komponent: AdapterRoot

**Verantwortung:** Root Component mit Theme-Provider und Metadata-Support

**Props:**

```typescript
interface AdapterRootProps {
	node: UJLAbstractNode; // AST Root Node
	tokenSet?: UJLTTokenSet; // Design Tokens (optional)
	mode?: "light" | "dark" | "system"; // Theme Mode
	showMetadata?: boolean; // Add data-ujl-module-id attributes
	eventCallback?: (moduleId: string) => void; // Click-to-select
}
```

**Funktionalität:**

1. **Token Injection:** Generiert CSS Custom Properties aus TokenSet
2. **Theme Mode:** Setzt `data-mode` Attribut für Dark/Light Mode
3. **Metadata:** Optional `data-ujl-module-id` für Editor-Integration
4. **Event Delegation:** Click Events → eventCallback (Editor-Interaktion)

**CSS Custom Properties:**

```css
:root {
	--color-primary-50: oklch(97% 0.01 260);
	--color-primary-500: oklch(60% 0.15 260);
	--color-primary-950: oklch(20% 0.05 260);

	--font-base-family: "Inter", sans-serif;
	--font-base-size-md: 16px;

	--spacing-md: 16px;
	--radius-md: 8px;
}
```

#### 5.5.1.2 Komponent: ASTNode (Recursive Router)

**Verantwortung:** Dispatcht AST Node zu entsprechendem Svelte Component

**Implementation:**

```svelte
<script lang="ts">
  import type { UJLAbstractNode } from '@ujl-framework/types';

  // Node Components
  import Button from './nodes/Button.svelte';
  import Text from './nodes/Text.svelte';
  import Container from './nodes/Container.svelte';
  // ... weitere Imports

  let { node, showMetadata, eventCallback } = $props<{
    node: UJLAbstractNode;
    showMetadata?: boolean;
    eventCallback?: (moduleId: string) => void;
  }>();
</script>

{#if node.type === 'button'}
  <Button {node} {showMetadata} {eventCallback} />
{:else if node.type === 'text'}
  <Text {node} {showMetadata} {eventCallback} />
{:else if node.type === 'container'}
  <Container {node} {showMetadata} {eventCallback}>
    {#each node.props.children as child}
      <svelte:self node={child} {showMetadata} {eventCallback} />
    {/each}
  </Container>
{:else}
  <Error {node} />
{/if}
```

**Wichtig:** Rekursive Selbstreferenz mit `<svelte:self>` für verschachtelte Nodes

#### 5.5.1.3 Komponent: prosemirror-serializer

**Verantwortung:** Synchrone, SSR-safe Konvertierung ProseMirror → HTML

**Schnittstelle:**

```typescript
export function prosemirrorToHtml(doc: ProseMirrorDocument): string;
```

**Implementation (Auszug):**

```typescript
function serializeNode(node: ProseMirrorNode): string {
	switch (node.type) {
		case "paragraph":
			return `<p>${serializeNodes(node.content)}</p>`;
		case "heading":
			const level = node.attrs?.level ?? 1;
			return `<h${level}>${serializeNodes(node.content)}</h${level}>`;
		case "text":
			return applyMarks(escapeHtml(node.text), node.marks);
		case "hardBreak":
			return "<br>";
		// ... weitere Node-Typen
	}
}

function applyMarks(text: string, marks?: ProseMirrorMark[]): string {
	if (!marks) return text;
	return marks.reduce((html, mark) => {
		switch (mark.type) {
			case "bold":
				return `<strong>${html}</strong>`;
			case "italic":
				return `<em>${html}</em>`;
			case "code":
				return `<code>${html}</code>`;
			default:
				return html;
		}
	}, text);
}
```

**Eigenschaften:**

- SSR-Safe (keine Browser-APIs)
- Synchron (kein async/await)
- XSS-Prevention (HTML Escaping)
- WYSIWYG-Garantie (gleiche Extensions wie Editor)

#### 5.5.1.4 Komponent: Imperative Adapter

**Verantwortung:** Programmatische Component Mounting (für nicht-Svelte-Kontexte)

**Schnittstelle:**

```typescript
export function svelteAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: SvelteAdapterOptions
): MountedComponent;

type SvelteAdapterOptions = {
	target: string | HTMLElement;
	mode?: "light" | "dark" | "system";
	showMetadata?: boolean;
	eventCallback?: (moduleId: string) => void;
};

type MountedComponent = {
	instance: Component;
	unmount: () => Promise<void>;
};
```

**Verwendung:**

```typescript
import { svelteAdapter } from "@ujl-framework/adapter-svelte";

const mounted = svelteAdapter(ast, tokenSet, {
	target: "#my-container",
	mode: "system",
	showMetadata: true,
	eventCallback: id => console.log("Clicked:", id),
});

// Cleanup
await mounted.unmount();
```

### 5.5.2 Baustein: adapter-web

**Zweck:** Framework-agnostic Custom Element (für React, Vue, Angular, etc.)

#### Whitebox: adapter-web (Level 2)

```mermaid
graph TB
    subgraph "adapter-web Package"
        WebAdapter[adapter.ts<br/>Main Adapter Function]
        UJLContent[UJLContent.svelte<br/>Custom Element Definition]
        Types[types.ts<br/>Type Definitions]
    end

    subgraph "Build Process (Vite)"
        Bundle[Bundled Output<br/>index.js + index.d.ts]
    end

    WebAdapter --> UJLContent
    UJLContent -.->|compiles to| Bundle

    style Bundle fill:#f59e0b
```

#### Besonderheit: Svelte Compilation zu Web Components

**Vite Config (Auszug):**

```typescript
export default defineConfig({
	build: {
		lib: {
			entry: "src/index.ts",
			formats: ["es"], // Nur ESM
			fileName: "index",
		},
		rollupOptions: {
			external: [], // Keine Externals → Svelte wird gebundelt
		},
	},
});
```

**Custom Element Registration:**

```typescript
// UJLContent.svelte
<svelte:options customElement="ujl-content" />

<script lang="ts">
  import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';

  export let node: UJLAbstractNode;
  export let tokenSet: UJLTTokenSet;
  export let showMetadata: boolean = false;
  export let eventCallback: ((moduleId: string) => void) | undefined = undefined;
</script>

<!-- Render mit adapter-svelte -->
<AdapterRoot {node} {tokenSet} {showMetadata} {eventCallback} />
```

**Wichtig:** Props müssen als Properties gesetzt werden (nicht als Attribute)

```typescript
// Correct
const el = document.createElement("ujl-content") as UJLContentElement;
el.node = astNode;
el.tokenSet = tokenSet;

// Wrong (Attributes sind Strings)
el.setAttribute("node", JSON.stringify(astNode)); // Funktioniert nicht
```

#### Komponent: webAdapter Function

**Schnittstelle:**

```typescript
export function webAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions
): MountedElement;

type WebAdapterOptions = {
	target: string | HTMLElement;
	showMetadata?: boolean;
	eventCallback?: (moduleId: string) => void;
};

type MountedElement = {
	element: HTMLElement;
	unmount: () => void;
};
```

**Implementation:**

```typescript
export function webAdapter(
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions
): MountedElement {
	const target =
		typeof options.target === "string" ? document.querySelector(options.target) : options.target;

	if (!target) throw new Error("Target not found");

	const el = document.createElement("ujl-content") as UJLContentElement;
	el.node = node;
	el.tokenSet = tokenSet;
	el.showMetadata = options.showMetadata ?? false;
	el.eventCallback = options.eventCallback;

	target.appendChild(el);

	return {
		element: el,
		unmount: () => el.remove(),
	};
}
```

## 5.6 Application Layer (Level 2)

### 5.6.1 Baustein: crafter

**Zweck:** Visual Editor für UJLC und UJLT Dokumente

#### Whitebox: crafter (Level 2)

```mermaid
graph TB
    subgraph "crafter Package (SvelteKit)"
        App[app.svelte<br/>Root Component + State]
        Context[context.ts<br/>Crafter Context API]

        subgraph "Header"
            HeaderComp[header.svelte<br/>Top Toolbar]
            ModeSwitcher[mode-switcher.svelte<br/>Editor/Designer Toggle]
        end

        subgraph "Sidebar Left"
            SidebarLeftComp[sidebar-left.svelte<br/>Mode Router]
            Editor[editor.svelte<br/>Content Editor]
            Designer[designer.svelte<br/>Theme Editor]
        end

        subgraph "Body"
            Preview[preview.svelte<br/>Live Preview]
        end

        subgraph "Sidebar Right"
            SidebarRightComp[sidebar-right.svelte<br/>Property Inspector]
            Export[export.svelte<br/>Export/Import]
        end

        subgraph "Services"
            ImageService[image-service.ts<br/>Abstract Interface]
            InlineImage[inline-image-service.ts<br/>Inline Storage]
            BackendImage[backend-image-service.ts<br/>Payload CMS Integration]
        end

        subgraph "Components"
            NavTree[nav-tree.svelte<br/>Tree View + Drag & Drop]
            ImagePicker[image-picker.svelte<br/>Image Selection Dialog]
            ComponentPicker[component-picker.svelte<br/>Module Insertion]
        end
    end

    App --> Context
    App --> HeaderComp
    App --> SidebarLeftComp
    App --> Preview
    App --> SidebarRightComp

    HeaderComp --> ModeSwitcher

    SidebarLeftComp --> Editor
    SidebarLeftComp --> Designer

    Editor --> NavTree
    Editor --> ComponentPicker

    SidebarRightComp --> Export

    NavTree --> Context
    Preview --> Context

    ImagePicker --> ImageService
    ImageService --> InlineImage
    ImageService --> BackendImage

    BackendImage -.->|API Calls| PayloadCMS[(Payload CMS<br/>Image Service)]
```

#### 5.6.1.1 Komponent: app.svelte (State Management)

**Verantwortung:** Root Component mit zentralem State

**State (Svelte 5 Runes):**

```typescript
let ujlcDocument = $state<UJLCDocument>(initialUJLC);
let ujltDocument = $state<UJLTDocument>(initialUJLT);
let mode = $state<"editor" | "designer">("editor");
let expandedNodeIds = $state<Set<string>>(new Set());
```

**Context Provider:**

```typescript
import { setContext } from "svelte";
import { createCrafterContext } from "./context";

const context = createCrafterContext(ujlcDocument, ujltDocument, mode, expandedNodeIds);

setContext("crafter", context);
```

#### 5.6.1.2 Komponent: Crafter Context API

**Verantwortung:** Zentralisierte State-Mutationen (Functional Updates)

**Schnittstelle (Auszug):**

```typescript
interface CrafterContext {
	// State Accessors
	getUJLCDocument(): UJLCDocument;
	getUJLTDocument(): UJLTDocument;
	getMode(): "editor" | "designer";
	getExpandedNodeIds(): Set<string>;

	// State Updates (Functional)
	updateRootSlot(fn: (root: UJLCModuleObject[]) => UJLCModuleObject[]): void;
	updateTokenSet(fn: (tokens: UJLTTokenSet) => UJLTTokenSet): void;

	// Selection
	setSelectedNodeId(nodeId: string | null): void;
	getSelectedNodeId(): string | null;

	// Tree Expansion
	setNodeExpanded(nodeId: string, expanded: boolean): void;
	expandToNode(nodeId: string): void; // Expand all parents

	// Operations
	operations: {
		copyNode(nodeId: string): void;
		cutNode(nodeId: string): void;
		pasteNode(targetId: string, position: "before" | "after" | "into"): void;
		deleteNode(nodeId: string): void;
		moveNode(nodeId: string, targetId: string, position: string): void;
		insertNode(moduleType: string, targetId: string, position: string): void;
	};
}
```

**Functional Updates (Immutable):**

```typescript
// Direktes Mutation (verboten)
ujlcDocument.ujlc.root.push(newModule);

// Functional Update (empfohlen)
context.updateRootSlot(root => [...root, newModule]);
```

#### 5.6.1.3 Komponent: Editor Mode

**Verantwortung:** Content-Editing mit Drag & Drop, Clipboard, Keyboard Shortcuts

**Features:**

- Navigation Tree (Hierarchie-Ansicht)
- Drag & Drop (Node/Slot Reordering)
- Clipboard (Ctrl+C/X/V mit Clipboard API + localStorage Fallback)
- Keyboard Shortcuts (Ctrl+C/X/V/I, Delete)
- Component Picker (Module Registry → Searchable List)
- Click-to-Select (Preview → Tree Synchronization)

**Clipboard-Architektur:**

```typescript
interface ClipboardManager {
	copy(nodeId: string): Promise<void>;
	cut(nodeId: string): Promise<void>;
	paste(targetId: string, position: string): Promise<void>;

	// Dual-Storage Strategy
	// 1. Clipboard API (modern browsers)
	// 2. localStorage Fallback (older browsers)
}
```

#### 5.6.1.4 Komponent: Designer Mode

**Verantwortung:** Theme-Editing (Colors, Typography, Spacing, Radius)

**Features:**

- Color Palette Editor (OKLCH-basiert)
- Automatic Shade Generation (11 Shades: 50-950)
- Typography Editor (Font Family, Size, Weight)
- Spacing & Radius Editor (Token Management)
- Live Preview (Echtzeit-Updates)

**Color Palette Generator:**

```typescript
function generateColorPalette(baseColor: OklchColor): ColorPalette {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

	return shades.reduce((palette, shade) => {
		palette[shade] = {
			l: calculateLightness(shade), // Perzeptuell uniform
			c: baseColor.c * calculateChromaFactor(shade),
			h: baseColor.h,
		};
		return palette;
	}, {});
}
```

#### 5.6.1.5 Komponent: Media Service

**Verantwortung:** Abstraktion für Media Storage (Inline vs. Backend)

**Interface:**

```typescript
interface ImageService {
	// List Images
	list(): Promise<ImageEntry[]>;

	// Upload Image
	upload(file: File, metadata: ImageMetadata): Promise<ImageEntry>;

	// Update Metadata
	updateMetadata(id: string, metadata: Partial<ImageMetadata>): Promise<void>;

	// Delete Image
	delete(id: string): Promise<void>;

	// Get Storage Mode
	getStorageMode(): "inline" | "backend";
}
```

**Implementierungen:**

1. **InlineImageService:**
   - Base64-Encoding via FileReader
   - Storage in UJLC Document (ujlc.images)
   - Compression via compressorjs

2. **BackendImageService:**
   - Payload CMS API Integration
   - multipart/form-data Upload
   - API-Key Authentication

**Service Factory:**

```typescript
function createImageService(config: ImageLibraryConfig): ImageService {
	if (config.storage === "backend" && config.url) {
		return new BackendImageService(config.url, apiKey);
	}
	return new InlineImageService(ujlcDocument);
}
```

### 5.6.2 Baustein: demo

**Zweck:** Demonstration der UJL-Integration

**Struktur:**

```
demo/
├── src/
│   ├── main.ts           # Entry Point
│   ├── index.html        # HTML Template
│   └── styles.css        # Global Styles
└── vite.config.ts        # Vite Configuration
```

**main.ts (Auszug):**

```typescript
import { webAdapter } from "@ujl-framework/adapter-web";
import { Composer } from "@ujl-framework/core";
import showcaseDocument from "@ujl-framework/examples/documents/showcase";
import defaultTheme from "@ujl-framework/examples/themes/default";

const composer = new Composer();
const ast = await composer.compose(showcaseDocument);
const tokenSet = defaultTheme.ujlt.tokens;

webAdapter(ast, tokenSet, {
	target: "#app",
	showMetadata: false,
});
```

### 5.6.3 Baustein: docs

**Zweck:** Dokumentations-Website (VitePress)

**Struktur:**

```
docs/
├── src/
│   ├── arc42/            # Architecture Documentation (this file)
│   ├── docs/             # User Documentation
│   └── .vitepress/       # VitePress Configuration
└── package.json
```

**Technologie:** VitePress 2.0 (Vue-based Static Site Generator)

### 5.6.4 Baustein: examples

**Zweck:** Beispiel-Dokumente und Themes

**Struktur:**

```
examples/
├── src/
│   ├── documents/
│   │   └── showcase.ujlc.json    # Umfassendes Showcase-Dokument
│   ├── themes/
│   │   └── default.ujlt.json     # Default Theme
│   └── index.ts                   # Re-Exports
└── package.json
```

**Exports:**

```typescript
// Direct Import
import showcaseDocument from "@ujl-framework/examples/documents/showcase";
import defaultTheme from "@ujl-framework/examples/themes/default";

// Named Export
import { showcaseDocument, defaultTheme } from "@ujl-framework/examples";
```

## 5.7 Service Layer (Level 2)

### 5.7.1 Baustein: media (Payload CMS)

**Zweck:** Backend für Media Management mit Payload CMS

#### Whitebox: media Service (Level 2)

```mermaid
graph TB
    subgraph "media Service (Docker)"
        NextApp[Next.js 15 App]
        PayloadCMS[Payload CMS 3.x]

        subgraph "Collections"
            ImagesCollection[Images Collection<br/>Images with Metadata]
            UsersCollection[Users Collection<br/>API Key Management]
        end

        subgraph "Storage"
            LocalStorage[local/<br/>File Storage]
        end

        subgraph "Processing"
            Sharp[Sharp<br/>Image Processing]
        end
    end

    subgraph "External"
        PostgreSQL[(PostgreSQL 17<br/>Database)]
        Crafter[Crafter<br/>API Client]
    end

    NextApp --> PayloadCMS
    PayloadCMS --> ImagesCollection
    PayloadCMS --> UsersCollection
    PayloadCMS --> PostgreSQL

    ImagesCollection --> Sharp
    Sharp --> LocalStorage

    Crafter -.->|REST API| NextApp
```

#### Komponent: Images Collection

**Schema:**

```typescript
export const Images: CollectionConfig = {
	slug: "images",
	upload: {
		staticDir: "uploads/images", // Upload-Verzeichnis
		mimeTypes: ["image/*"],
		imageSizes: [
			// Responsive Sizes (Tailwind-Breakpoints)
			{ name: "xs", width: 320, position: "center" },
			{ name: "sm", width: 640, position: "center" },
			{ name: "md", width: 768, position: "center" },
			{ name: "lg", width: 1024, position: "center" },
			{ name: "xl", width: 1280, position: "center" },
			{ name: "xxl", width: 1536, position: "center" },
			{ name: "xxxl", width: 1920, position: "center" },
			{ name: "max", width: 2560, position: "center" },
		],
		formatOptions: { format: "webp", options: { quality: 80 } },
		focalPoint: true, // Smart Cropping via Focal Point
	},
	fields: [
		{ name: "title", type: "text" }, // Interner Name
		{ name: "description", type: "textarea", localized: true },
		{ name: "alt", type: "text", localized: true },
		{
			name: "credit",
			type: "group", // IPTC-orientierte Credit-Informationen
			fields: [
				{ name: "creator", type: "text" },
				{ name: "creditLine", type: "text" },
				{ name: "copyrightNotice", type: "text" },
				{ name: "licenseUrl", type: "text" },
			],
		},
	],
};
```

**REST API:**

| Methode | Endpoint          | Funktion                                  |
| ------- | ----------------- | ----------------------------------------- |
| GET     | `/api/images`     | List (mit Pagination, Filtering, Sorting) |
| GET     | `/api/images/:id` | Get Single                                |
| POST    | `/api/images`     | Upload (multipart/form-data)              |
| PATCH   | `/api/images/:id` | Update Metadata                           |
| DELETE  | `/api/images/:id` | Delete                                    |

**Authentication:**

```typescript
// API Key in User Document
const response = await fetch("http://localhost:3000/api/images", {
	headers: {
		Authorization: "users API-Key YOUR_API_KEY",
	},
});
```

#### Deployment: Docker Compose

**docker-compose.yml (Auszug):**

```yaml
services:
  payload:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URI=postgres://postgres:password@postgres:5432/ujl-media
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:17-alpine
    environment:
      - POSTGRES_DB=ujl-media
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

**Startup:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f payload
```

## 5.8 Deployment- und Build-Struktur

### Build-Reihenfolge (Dependency Order)

```mermaid
graph TB
    Types[1. types]
    Core[2. core]
    UI[3. ui]
    AdapterSvelte[4. adapter-svelte]
    AdapterWeb[5. adapter-web]
    Crafter[6. crafter]
    Demo[7. demo]
    Docs[8. docs]
    Examples[examples]

    Types --> Core
    Core --> UI
    UI --> AdapterSvelte
    AdapterSvelte --> AdapterWeb

    Types --> Crafter
    Core --> Crafter
    UI --> Crafter
    AdapterSvelte --> Crafter

    Types --> Demo
    Core --> Demo
    AdapterWeb --> Demo
    Examples --> Demo

    Types --> Examples

    style Types fill:#8b5cf6
    style Core fill:#3b82f6
    style UI fill:#10b981
    style AdapterSvelte fill:#f59e0b
    style AdapterWeb fill:#f59e0b
    style Crafter fill:#ef4444
    style Demo fill:#6366f1
    style Docs fill:#6366f1
```

**Build-Kommando (Monorepo-Root):**

```bash
pnpm run build
```

**Interne Reihenfolge (package.json):**

```json
{
	"scripts": {
		"build": "pnpm run types:build && pnpm run core:build && pnpm run ui:build && pnpm run adapter-svelte:build && pnpm run adapter-web:build && pnpm run crafter:build && pnpm run demo:build && pnpm run docs:build",
		"types:build": "pnpm --filter @ujl-framework/types build",
		"core:build": "pnpm --filter @ujl-framework/core build",
		"ui:build": "pnpm --filter @ujl-framework/ui build"
		// ...
	}
}
```

### Artifact-Typen

| Package        | Build Tool | Output                                              | Distribution          |
| -------------- | ---------- | --------------------------------------------------- | --------------------- |
| types          | TypeScript | `dist/*.js` + `dist/*.d.ts`                         | NPM (geplant)         |
| core           | TypeScript | `dist/*.js` + `dist/*.d.ts`                         | NPM (geplant)         |
| ui             | SvelteKit  | `dist/*.js` + `dist/*.svelte` + `dist/styles/*.css` | NPM (geplant)         |
| adapter-svelte | SvelteKit  | `dist/*.js` + `dist/*.svelte` + `dist/styles/*.css` | NPM (geplant)         |
| adapter-web    | Vite       | `dist/index.js` (bundled) + `dist/index.d.ts`       | NPM (geplant)         |
| crafter        | SvelteKit  | `dist/**/*` (SvelteKit Package)                     | NPM (geplant)         |
| demo           | Vite       | `dist/**/*` (Static Files)                          | Private               |
| docs           | VitePress  | `.vitepress/dist/**/*` (Static Site)                | GitLab Pages          |
| media          | Next.js    | Docker Image                                        | Docker Hub (optional) |

## 5.9 Querschnittliche Aspekte

### 5.9.1 Versionierung (Changesets)

**Strategie:** Fixed Versioning (alle Packages synchron)

**Workflow:**

```bash
# Feature Branch: Create Changeset
pnpm changeset

# Select changed packages
# Enter changelog entry
# Commit .changeset/xyz.md

# develop Branch: Apply Changesets
pnpm version-packages

# → Updates package.json versions
# → Generates CHANGELOG.md entries
# → Commit version bump

# Manual Publish (when ready)
pnpm publish -r --access public
```

**Changeset Config (`.changeset/config.json`):**

```json
{
	"fixed": [
		["@ujl-framework/*"] // All packages linked
	],
	"changelog": "@changesets/cli/changelog",
	"commit": false,
	"access": "public"
}
```

### 5.9.2 Testing-Strategie

**Unit Tests (Vitest):**

- Alle Core-Packages (types, core, ui)
- Coverage-Ziel: 80%+ für kritische Pfade
- Test Pattern: `**/*.test.ts`

**E2E Tests (Playwright):**

- crafter (Visual Editor Workflows)
- media (API Integration Tests)
- Test Pattern: `e2e/**/*.test.ts`

**Test Attributes (Conditional):**

```typescript
// Only in test mode (PUBLIC_TEST_MODE=true)
import { testId } from './test-attrs';

<Button {...testId('submit-button')}>
  Submit
</Button>

// → Generates: data-testid="submit-button" (nur im Test-Modus)
```

### 5.9.3 CI/CD Pipeline (GitLab CI)

**Stages:**

1. **install** - `pnpm install --frozen-lockfile` (mit Cache)
2. **build** - `pnpm run build` (alle Packages)
3. **test** - `pnpm run test` (Vitest Unit Tests)
4. **quality** - `pnpm run lint` + `pnpm run check` (ESLint + TypeScript)
5. **deploy** - GitLab Pages (nur main/develop Branch)

**Cache Strategy:**

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .pnpm-store/
    - packages/*/node_modules/
```

### Architektur-Highlights

1. **Layered Architecture**: Klare Trennung von Foundation, Core, UI, Adapter, Application
2. **Dependency Inversion**: Höhere Schichten abhängig von niedrigeren (nie umgekehrt)
3. **Plugin Architecture**: Module Registry mit Extension Points
4. **Adapter Pattern**: Framework-Agnostic Rendering
5. **Schema-First**: Zod als Single Source of Truth
6. **Monorepo**: Koordinierte Releases mit Changesets

### Zukünftige Erweiterungen

**Geplante Bausteine:**

- **adapter-pdf**: PDF Export (für Dokumentation)

**Geplante Features:**

- **Semantic Search**: pgvector Integration für Media Library
- **AI Integration**: LLM-basierte Content-Generierung
- **Theme Marketplace**: Community Themes (UJLT-Dateien)
- **Module Marketplace**: Community Module (NPM Packages)
