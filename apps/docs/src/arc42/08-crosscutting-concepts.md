---
title: "Querschnittliche Konzepte"
description: "Wichtige Konzepte, die mehrere Bausteine betreffen"
---

# Querschnittliche Konzepte

## Übersicht der Konzepte

```mermaid
graph TB
    subgraph DomainConcepts["Domain Concepts"]
        AST["AST-basierte Composition"]
        ModuleSystem["Modulares System"]
        TokenSystem["Design Token System"]
    end

    subgraph DevelopmentConcepts["Development Concepts"]
        Validation["Schema-basierte Validierung"]
        ErrorHandling["Fehlerbehandlung"]
        StateManagement["Zustandsverwaltung"]
    end

    subgraph ArchitectureConcepts["Architecture Concepts"]
        Layering["Schichten-Architektur"]
        Extensibility["Erweiterbarkeit"]
        Testing["Testbarkeit"]
    end

    subgraph UXConcepts["UX Concepts"]
        Theming["Theming und Styling"]
        EventHandling["Event Handling"]
        Accessibility["Barrierefreiheit"]
    end

    AST --> ModuleSystem
    ModuleSystem --> TokenSystem
    Validation --> ErrorHandling
    Layering --> Extensibility
    Theming --> EventHandling
```

## 8.1 Domain Model

### 8.1.1 UJL Document Formats

Das UJL-Framework definiert zwei zentrale Dokumentformate, die als JSON-Dateien gespeichert werden:

**UJLC (Content Document)** - Beschreibt die Struktur und Inhalte einer Seite:

```typescript
interface UJLCDocument {
	ujlc: {
		meta: UJLCMeta;
		images: Record<string, ImageEntry>;
		root: UJLCModuleObject[];
	};
}
```

**UJLT (Theme Document)** - Definiert das visuelle Erscheinungsbild:

```typescript
interface UJLTDocument {
	ujlt: {
		meta: UJLTMeta;
		tokens: UJLTTokenSet;
	};
}
```

### 8.1.2 AST-basierte Composition

Das zentrale Architekturprinzip ist die Trennung von Dokumentstruktur (UJLC) und Rendering (AST):

```mermaid
flowchart LR
    UJLC["UJLC Document"] --> Composer
    Composer --> AST["Abstract Syntax Tree"]
    AST --> AdapterSvelte["Svelte Adapter"]
    AST --> AdapterWeb["Web Adapter"]
    AdapterSvelte --> SvelteComponents["Svelte Components"]
    AdapterWeb --> WebComponents["Web Components"]
```

**Vorteile:**

- **Entkopplung**: Content-Struktur unabhängig vom Rendering-Framework
- **Erweiterbarkeit**: Neue Adapter ohne Änderung der Core-Logik
- **Testbarkeit**: AST-Generierung isoliert testbar
- **ID-Propagation**: Modul-IDs werden vom UJLC durch den AST bis zum DOM durchgereicht

**AST Node Struktur:**

```typescript
type UJLAbstractNode = {
	type: string;
	id: string;
	props: Record<string, unknown>;
	meta?: {
		moduleId?: string; // Modul-ID aus UJLC-Dokument (für Editor-Integration)
		isModuleRoot?: boolean; // true = editierbares Modul, false = Layout-Wrapper
	};
};
```

**Metadaten-Felder:**

- `meta.moduleId`: Referenz zur ursprünglichen Modul-ID im UJLC-Dokument. Wird verwendet für Click-to-Select im Editor und `data-ujl-module-id` Attribute.
- `meta.isModuleRoot`: Kennzeichnet, ob dieser Node das Root-Element eines editierbaren Moduls ist. Layout-Wrapper und Kinder-Nodes haben `isModuleRoot=false`.

### 8.1.3 Modulares System

Module sind die Grundbausteine des UJL-Systems. Jedes Modul definiert:

- **Fields**: Eingabefelder mit Validierung und Default-Werten
- **Slots**: Container für verschachtelte Module
- **Compose-Methode**: Transformation zu AST-Nodes

```mermaid
classDiagram
    class ModuleBase {
        +name: string
        +label: string
        +description: string
        +category: ComponentCategory
        +tags: string[]
        +icon: string
        +fields: FieldSet
        +slots: SlotSet
        +compose(moduleData, composer) UJLAbstractNode
    }

    class TextModule {
        +name = text
        +fields = content RichTextField
        +slots = empty
    }

    class ContainerModule {
        +name = container
        +fields = empty
        +slots = body Slot
    }

    ModuleBase <|-- TextModule
    ModuleBase <|-- ContainerModule
```

**Module Registry Pattern:**

```typescript
// Registrierung
const composer = new Composer();
composer.registerModule(new CustomModule());

// Lookup
const module = composer.getRegistry().getModule("text");

// Composition (async)
const ast = await composer.compose(ujlcDocument);
```

## 8.2 Schema-basierte Validierung

### 8.2.1 Zod als Single Source of Truth

Das UJL-Framework verwendet [Zod](https://zod.dev/) für Schema-Definition und Validierung. Typen werden automatisch aus Schemas inferiert (DRY-Prinzip):

```typescript
// Schema-Definition
export const UJLCModuleObjectSchema = z.object({
	type: z.string(),
	meta: UJLCModuleMetaSchema,
	fields: z.record(z.string(), UJLCFieldObjectSchema),
	slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema))),
});

// Type-Inference (automatisch)
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;
```

**Wichtige Zod-Patterns:**

| Pattern                  | Verwendung                 | Beispiel                 |
| ------------------------ | -------------------------- | ------------------------ |
| `z.lazy()`               | Rekursive Strukturen       | Verschachtelte Module    |
| `z.discriminatedUnion()` | Varianten-Typen            | Inline vs. Backend Image |
| `.default()`             | Default-Werte              | Optional Fields          |
| `.safeParse()`           | Nicht-werfende Validierung | CLI-Tools                |

### 8.2.2 Validierungs-API

Das `@ujl-framework/types` Package exportiert zwei Validierungs-Varianten:

**Throwing Validation (für vertrauenswürdige Quellen):**

```typescript
import { validateUJLCDocument, validateUJLTDocument } from "@ujl-framework/types";

// Wirft Error bei ungültigem Input
const validatedDoc = validateUJLCDocument(rawData);
```

**Safe Validation (für nicht-vertrauenswürdige Quellen):**

```typescript
import { validateUJLCDocumentSafe } from "@ujl-framework/types";

const result = validateUJLCDocumentSafe(rawData);

if (result.success) {
	console.log("Valid:", result.data);
} else {
	console.error("Invalid:", result.error.issues);
}
```

### 8.2.3 Field-Level Validierung

Fields implementieren ein zweistufiges Validierungsmodell:

```mermaid
flowchart LR
    Input["Raw Input"] --> Validate{"validate"}
    Validate -->|"Type Guard"| Fit["fit"]
    Fit -->|"Constraints"| Output["Valid Value"]
    Validate -->|"Invalid"| Default["Default Value"]
```

**Template Method Pattern:**

```typescript
abstract class FieldBase<ValueT, ConfigT> {
	// Type Guard - prüft Typ
	abstract validate(raw: UJLCFieldObject): raw is ValueT;

	// Constraint Application - wendet Regeln an
	abstract fit(value: ValueT): ValueT;

	// Combined Pipeline
	parse(raw: UJLCFieldObject): ValueT {
		if (!this.validate(raw)) {
			return this.config.default;
		}
		return this.fit(raw);
	}
}
```

**Beispiel NumberField:**

```typescript
class NumberField extends FieldBase<number, NumberFieldConfig> {
	validate(raw: UJLCFieldObject): raw is number {
		return typeof raw === "number" && !isNaN(raw);
	}

	fit(value: number): number {
		const { min, max } = this.config;
		if (min !== undefined && value < min) return min;
		if (max !== undefined && value > max) return max;
		return value;
	}
}
```

## 8.3 Fehlerbehandlung

### 8.3.1 Error-Strategie

Das UJL-Framework verfolgt eine **graceful degradation**-Strategie:

| Kontext       | Strategie   | Verhalten                                               |
| ------------- | ----------- | ------------------------------------------------------- |
| Validierung   | Safe Parse  | Rückgabe von Result-Objekten                            |
| Composition   | Error Nodes | Unbekannte Module werden als Error-Komponente gerendert |
| Image Loading | Fallback    | Placeholder bei fehlenden Bildern                       |
| API Calls     | Try-Catch   | Benutzerfreundliche Fehlermeldungen                     |

### 8.3.2 Error Node Pattern

Bei unbekannten Modultypen erzeugt der Composer einen Error-Node anstelle eines Absturzes:

```typescript
// In Composer.composeModule()
if (!module) {
	return {
		type: "error",
		id: moduleData.meta.id,
		props: {
			message: `Unknown module type: ${moduleData.type}`,
		},
	};
}
```

### 8.3.3 Zod Error Reporting

Validierungsfehler werden mit vollständigem Pfad ausgegeben:

```typescript
const result = validateUJLCDocumentSafe(data);

if (!result.success) {
	for (const issue of result.error.issues) {
		console.error(`${issue.path.join(" → ")}: ${issue.message}`);
	}
}

// Ausgabe:
// ujlc → root → 0 → fields → content: Expected string, received number
```

### 8.3.4 Error-Kategorien

UJL unterscheidet zwischen verschiedenen Fehlerkategorien:

| Kategorie            | Schweregrad | Beispiel              | Behandlung                         |
| -------------------- | ----------- | --------------------- | ---------------------------------- |
| **Validation Error** | Mittel      | Schema-Verletzung     | Safe Parse, Fehlermeldung          |
| **Runtime Error**    | Hoch        | Module nicht gefunden | Error Node, Graceful Degradation   |
| **Network Error**    | Mittel      | API nicht erreichbar  | Retry, Fallback, User Notification |
| **User Error**       | Niedrig     | Ungültige Eingabe     | Inline-Validierung, Hilfetext      |
| **System Error**     | Kritisch    | Out of Memory         | Logging, Monitoring Alert          |

**Error-Code-Konvention:**

```typescript
enum UJLErrorCode {
	// Validation Errors (1xxx)
	VALIDATION_SCHEMA = 1001,
	VALIDATION_TYPE = 1002,
	VALIDATION_REQUIRED = 1003,

	// Composition Errors (2xxx)
	COMPOSITION_MODULE_NOT_FOUND = 2001,
	COMPOSITION_CIRCULAR_DEPENDENCY = 2002,
	COMPOSITION_INVALID_SLOT = 2003,

	// Media Errors (3xxx)
	MEDIA_NOT_FOUND = 3001,
	MEDIA_UPLOAD_FAILED = 3002,
	MEDIA_INVALID_FORMAT = 3003,

	// System Errors (5xxx)
	SYSTEM_INTERNAL = 5000,
	SYSTEM_TIMEOUT = 5001,
}
```

### 8.3.5 Error-Recovery-Strategien

**Automatische Recovery:**

```typescript
// Retry mit Exponential Backoff
async function fetchWithRetry(url: string, maxRetries = 3) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fetch(url);
		} catch (error) {
			if (i === maxRetries - 1) throw error;
			await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
		}
	}
}
```

**Fallback-Mechanismen:**

```typescript
// Image Fallback Chain
async function resolveImage(id: string): Promise<ImageData> {
	try {
		// 1. Try Backend API
		return await fetchImageFromAPI(id);
	} catch {
		try {
			// 2. Try Local Cache
			return await getImageFromCache(id);
		} catch {
			// 3. Return Placeholder
			return DEFAULT_PLACEHOLDER;
		}
	}
}
```

### 8.3.6 Error-Logging-Konventionen

**Log-Struktur:**

```typescript
interface ErrorLog {
	timestamp: string;
	level: "error" | "warn" | "info";
	code: UJLErrorCode;
	message: string;
	context: {
		component: string;
		action: string;
		userId?: string;
	};
	stack?: string;
	metadata?: Record<string, unknown>;
}
```

**Logging in verschiedenen Kontexten:**

```typescript
// Crafter Editor
console.error("[UJL:Editor]", {
	code: UJLErrorCode.COMPOSITION_MODULE_NOT_FOUND,
	message: 'Module "hero" not found in registry',
	context: { component: "ModulePicker", action: "addModule" },
});

// Core Composer
console.error("[UJL:Composer]", {
	code: UJLErrorCode.VALIDATION_SCHEMA,
	message: "Invalid UJLC document",
	context: { component: "Composer", action: "compose" },
	metadata: { documentId: "abc123" },
});

// Payload CMS
console.error("[UJL:Media]", {
	code: UJLErrorCode.MEDIA_UPLOAD_FAILED,
	message: "Image upload failed",
	context: { component: "ImageUpload", action: "upload" },
	metadata: { fileName: "image.jpg", size: 5242880 },
});
```

**Structured Logging (Production):**

```typescript
import pino from "pino";

const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	formatters: {
		level: label => ({ level: label }),
	},
});

logger.error({
	code: UJLErrorCode.MEDIA_NOT_FOUND,
	message: "Image not found",
	context: { component: "MediaResolver", action: "resolve" },
	imageId: "img_123",
});
```

## 8.4 Zustandsverwaltung (State Management)

### 8.4.1 Svelte 5 Runes

Der Crafter verwendet Svelte 5 Runes für reaktive Zustandsverwaltung:

```typescript
// Mutable State
let ujlcDocument = $state<UJLCDocument>(initialDoc);
let expandedNodeIds = $state<Set<string>>(new Set());

// Derived State (computed, async)
const ast = $derived.by(async () => await composer.compose(ujlcDocument));

// Props (immutable from parent)
let { tokenSet, mode } = $props<{
	tokenSet: UJLTTokenSet;
	mode: "light" | "dark" | "system";
}>();
```

### 8.4.2 Unidirectional Data Flow

Das UJL-Framework folgt dem **Flux-Pattern** mit unidirektionalem Datenfluss:

```mermaid
flowchart TB
    State["Central State (app.svelte)"] -->|"Props"| Children["Child Components"]
    Children -->|"Events"| Context["Crafter Context"]
    Context -->|"Mutations"| State

    subgraph ReadOnly["Read-Only"]
        Children
    end

    subgraph WriteOnly["Write-Only"]
        Context
    end
```

**Regeln:**

1. **State-Ownership**: Nur `app.svelte` besitzt den zentralen State
2. **Props sind Read-Only**: Kinder empfangen Daten als Props
3. **Mutations über Context**: Änderungen nur über Context-API
4. **Functional Updates**: Immutable Update-Pattern

### 8.4.3 Crafter Context API

Die Context-API zentralisiert alle State-Mutationen:

```typescript
interface CrafterContext {
	// State Updates (Functional)
	updateRootSlot(fn: (root: UJLCModuleObject[]) => UJLCModuleObject[]): void;
	updateTokenSet(fn: (tokens: UJLTTokenSet) => UJLTTokenSet): void;

	// Selection
	setSelectedNodeId(nodeId: string | null): void;
	getSelectedNodeId(): string | null;

	// Tree Operations
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

**Functional Update Pattern:**

```typescript
// Direkte Mutation (verboten)
// ujlcDocument.ujlc.root.push(newModule);

// Functional Update (empfohlen)
context.updateRootSlot(root => [...root, newModule]);
```

## 8.5 Theming und Styling

### 8.5.1 Design Token System

Das UJL-Framework verwendet ein Token-basiertes Design-System mit OKLCH-Farben:

```mermaid
graph TB
    subgraph TokenCategories["Token Categories"]
        Colors["Color Tokens (OKLCH-basiert)"]
        Typography["Typography Tokens (Font, Size, Weight)"]
        Spacing["Spacing Tokens (rem-basiert)"]
        Radius["Radius Tokens (Border Radius)"]
    end

    subgraph ColorFlavors["Color Flavors"]
        Primary["Primary"]
        Secondary["Secondary"]
        Accent["Accent"]
        Success["Success"]
        Warning["Warning"]
        Destructive["Destructive"]
        Info["Info"]
        Ambient["Ambient"]
    end

    Colors --> Primary
    Colors --> Secondary
    Colors --> Accent
    Colors --> Success
    Colors --> Warning
    Colors --> Destructive
    Colors --> Info
    Colors --> Ambient
```

### 8.5.2 OKLCH Color System

Farben werden im OKLCH-Farbraum gespeichert für perzeptuelle Uniformität:

```typescript
type OklchColor = {
	l: number; // Lightness (0-1)
	c: number; // Chroma (>=0)
	h: number; // Hue (0-360)
};
```

**Shade-System (11 Abstufungen pro Flavor):**

| Shade   | Lightness | Verwendung            |
| ------- | --------- | --------------------- |
| 50      | 97%       | Hintergründe (hell)   |
| 100-400 | 90-70%    | Helle Akzente         |
| 500     | 60%       | Basis-Farbe           |
| 600-900 | 50-25%    | Dunkle Akzente        |
| 950     | 15%       | Hintergründe (dunkel) |

### 8.5.3 CSS Custom Properties

Tokens werden zur Laufzeit als CSS Custom Properties injiziert:

```typescript
function generateThemeCSSVariables(tokens: UJLTTokenSet): Record<string, string> {
	return {
		// Colors
		"--primary-500": "oklch(60% 0.15 260)",
		"--primary-light": "oklch(97% 0.01 260)",
		"--primary-dark": "oklch(20% 0.05 260)",

		// Typography
		"--typography-base-font": '"Inter", sans-serif',
		"--typography-base-size-md": "16px",

		// Spacing and Radius
		"--spacing": "1rem",
		"--radius": "0.5rem",
	};
}
```

**Anwendung in Komponenten:**

```css
.button-primary {
	background-color: var(--primary-500);
	color: var(--primary-light-foreground-primary);
	border-radius: var(--radius);
	padding: var(--spacing);
}
```

### 8.5.4 Dark/Light Mode

Das Theme-System unterstützt drei Modi:

| Mode     | Verhalten                        |
| -------- | -------------------------------- |
| `light`  | Helle Varianten (Shade 50-400)   |
| `dark`   | Dunkle Varianten (Shade 600-950) |
| `system` | Folgt OS-Präferenz               |

## 8.6 Event Handling

### 8.6.1 Event Callback Pattern

Module-Komponenten unterstützen ein einheitliches Event-Callback-Pattern für Editor-Integration:

```typescript
interface NodeComponentProps {
	node: UJLAbstractNode;
	showMetadata?: boolean;
	eventCallback?: (moduleId: string) => void;
}
```

**Factory-Funktion für Click-Handler:**

```typescript
function createModuleClickHandler(
	moduleId: string | undefined,
	eventCallback: ((id: string) => void) | undefined
): ((event: MouseEvent) => void) | undefined {
	if (!eventCallback || !moduleId) return undefined;

	return (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		eventCallback(moduleId);
	};
}
```

### 8.6.2 Bidirektionale Synchronisation

Der Crafter implementiert bidirektionale Synchronisation zwischen Tree und Preview:

```mermaid
sequenceDiagram
    participant Tree as Navigation Tree
    participant State as Central State
    participant Preview as Live Preview

    Note over Tree,Preview: Tree zu Preview
    Tree->>State: setSelectedNodeId(id)
    State->>Preview: Highlight Module
    Preview->>Preview: scrollIntoView()

    Note over Tree,Preview: Preview zu Tree
    Preview->>State: eventCallback(id)
    State->>Tree: expandToNode(id)
    Tree->>Tree: scrollIntoView()
```

### 8.6.3 Event-Propagation Control

Um korrekte Modul-Selektion zu gewährleisten:

```typescript
function handleClick(event: MouseEvent) {
	// Verhindert Standard-Aktionen (Links, Buttons)
	event.preventDefault();

	// Verhindert Bubbling zu Parent-Modulen
	event.stopPropagation();

	// Callback mit Modul-ID
	eventCallback(node.id);
}
```

## 8.7 Testbarkeit

### 8.7.1 Test-Strategie

Das UJL-Framework verfolgt eine mehrschichtige Test-Strategie:

| Ebene       | Framework  | Fokus                      | Coverage-Ziel  |
| ----------- | ---------- | -------------------------- | -------------- |
| Unit        | Vitest     | Fields, Modules, Utilities | 80%+           |
| Integration | Vitest     | Composer, Registry         | 70%+           |
| E2E         | Playwright | User Workflows             | Critical Paths |

### 8.7.2 Test Utilities

**Mock Data Factories:**

```typescript
// In tests/mockData.ts
export function createMockTree(): UJLCModuleObject[] {
	/* ... */
}
export function createMockTokenSet(): UJLTTokenSet {
	/* ... */
}
export function createMockNode(type: string): UJLAbstractNode {
	/* ... */
}
```

**Test Attributes (Conditional):**

```typescript
// In test-attrs.ts
export function testId(id: string): Record<string, string> {
	if (import.meta.env.PUBLIC_TEST_MODE !== "true") return {};
	return { "data-testid": id };
}
```

**Vorteile:**

- Zero Runtime-Overhead in Production
- Stabile Selektoren für E2E-Tests
- Kein Aufblähen des DOM ohne Test-Modus

### 8.7.3 Vitest-Konfiguration

```typescript
// vitest.config.ts (Standard für alle Packages)
export default defineConfig({
	test: {
		include: ["**/*.test.ts"],
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
		},
	},
});
```

## 8.8 Erweiterbarkeit

### 8.8.1 Plugin-Architecture

Das UJL-Framework ist an mehreren Punkten erweiterbar:

```mermaid
graph TB
    subgraph ExtensionPoints["Extension Points"]
        CustomModules["Custom Modules"]
        CustomFields["Custom Fields"]
        CustomAdapters["Custom Adapters"]
        StorageAdapters["Storage Adapters"]
    end

    subgraph Registration["Registration"]
        ModuleRegistry["Module Registry"]
        ImageService["Image Service Interface"]
        AdapterInterface["Adapter Interface"]
    end

    CustomModules --> ModuleRegistry
    CustomFields --> ModuleRegistry
    CustomAdapters --> AdapterInterface
    StorageAdapters --> ImageService
```

### 8.8.2 Custom Module erstellen

```typescript
// 1. Module-Klasse definieren
class CustomModule extends ModuleBase {
	readonly name = "custom";
	readonly label = "Custom Module";
	readonly description = "A custom module";
	readonly category = "content";
	readonly tags = ["custom"] as const;
	readonly icon = "..."; // SVG path content

	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];

	readonly slots = [{ key: "content", slot: new Slot({ label: "Content", max: 10 }) }];

	compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		return {
			type: "custom",
			id: moduleData.meta.id,
			props: {
				title: this.fields[0].field.parse(moduleData.fields.title),
				children: moduleData.slots.content.map(child => composer.composeModule(child)),
			},
		};
	}
}

// 2. Im Composer registrieren
const composer = new Composer();
composer.registerModule(new CustomModule());
```

### 8.8.3 Custom Field erstellen

```typescript
class EmailField extends FieldBase<string, EmailFieldConfig> {
	protected readonly defaultConfig = {
		label: "Email",
		default: "",
		placeholder: "name@example.com",
	};

	validate(raw: UJLCFieldObject): raw is string {
		return typeof raw === "string";
	}

	fit(value: string): string {
		// Normalisierung
		const trimmed = value.toLowerCase().trim();

		// Validierung (Basic)
		if (!trimmed.includes("@")) {
			return this.config.default;
		}

		return trimmed;
	}

	getFieldType(): string {
		return "email";
	}
}
```

### 8.8.4 Image Service erweitern

```typescript
// Custom Storage Backend
class S3ImageService implements ImageService {
	async upload(file: File, metadata: ImageMetadata): Promise<ImageEntry> {
		// S3 Upload Logic
		const key = await this.s3Client.upload(file);
		const url = await this.s3Client.getSignedUrl(key);
		return {
			src: url,
			metadata: metadata,
		};
	}

	async list(): Promise<ImageEntry[]> {
		// S3 List Logic
	}

	// ... weitere Methoden
}
```

## 8.9 Barrierefreiheit (Accessibility)

### 8.9.1 Semantisches HTML

Module erzeugen semantisch korrektes HTML:

| Modul     | HTML-Element | ARIA-Attribute            |
| --------- | ------------ | ------------------------- |
| Text      | p, h1-h6     | -                         |
| Button    | button, a    | role="button" (wenn Link) |
| Image     | img          | alt (required)            |
| Container | section, div | aria-label (optional)     |

### 8.9.2 Farbkontrast

Das OKLCH-System gewährleistet WCAG-konforme Kontraste:

```typescript
function resolveForegroundColor(
	background: OklchColor,
	foreground: "primary" | "secondary" | "muted"
): OklchColor {
	// Berechnet kontrastreiches Vordergrund-Farbsystem
	const contrastRatio = calculateContrastRatio(background, candidate);

	// WCAG AA: 4.5:1 für normalen Text
	// WCAG AAA: 7:1 für normalen Text
	if (contrastRatio >= 4.5) return candidate;

	// Fallback zu high-contrast variant
	return getHighContrastVariant(background);
}
```

### 8.9.3 Keyboard Navigation

Der Crafter unterstützt vollständige Keyboard-Navigation:

| Shortcut        | Aktion           |
| --------------- | ---------------- |
| Tab / Shift+Tab | Focus-Navigation |
| Enter / Space   | Aktivierung      |
| Ctrl+C          | Kopieren         |
| Ctrl+X          | Ausschneiden     |
| Ctrl+V          | Einfügen         |
| Delete          | Löschen          |
| Ctrl+I          | Modul einfügen   |
| Arrow Up/Down   | Tree-Navigation  |

## 8.10 Image Library Konzept

### 8.10.1 Duale Storage-Strategie

Das Image Library System unterstützt zwei Storage-Modi:

```mermaid
graph TB
    subgraph InlineStorage["Inline Storage"]
        InlineDoc["UJLC Document"]
        Base64["Base64 Data"]
        InlineDoc --> Base64
    end

    subgraph BackendStorage["Backend Storage"]
        BackendDoc["UJLC Document"]
        ImageRef["Image Reference"]
        PayloadCMS["Payload CMS"]
        BackendDoc --> ImageRef
        ImageRef --> PayloadCMS
    end
```

**Inline Storage:**

```json
{
	"ujlc": {
		"images": {
			"image-001": {
				"src": "data:image/jpeg;base64,/9j/4AAQ...",
				"metadata": {
					"alt": "...",
					"title": "..."
				}
			}
		}
	}
}
```

**Backend Storage:**

```json
{
	"ujlc": {
		"meta": {
			"_library": {
				"storage": "backend",
				"url": "http://localhost:3000/api"
			}
		},
		"images": {
			"img-001": {
				"src": "http://localhost:3000/api/images/67890abcdef12345",
				"metadata": {
					"filename": "example.jpg",
					"mimeType": "image/jpeg",
					"filesize": 45678,
					"width": 1920,
					"height": 1080
				}
			}
		}
	}
}
```

### 8.10.2 Image Service Interface

```typescript
interface ImageService {
	// Connection
	checkConnection(): Promise<boolean>;

	// CRUD Operations
	upload(file: File, metadata: ImageMetadata): Promise<ImageEntry>;
	get(id: string): Promise<ImageEntry | null>;
	list(): Promise<ImageEntry[]>;
	delete(id: string): Promise<void>;

	// Configuration
	getStorageMode(): "inline" | "backend";
}
```

### 8.10.3 Responsive Images

Der Backend-Storage (Payload CMS) generiert automatisch responsive Varianten basierend auf Tailwind-Breakpoints:

| Size | Width  | Format | Verwendung      |
| ---- | ------ | ------ | --------------- |
| xs   | 320px  | WebP   | Admin Thumbnail |
| sm   | 640px  | WebP   | Mobile          |
| md   | 768px  | WebP   | Tablet          |
| lg   | 1024px | WebP   | Desktop         |
| xl   | 1280px | WebP   | Large Desktop   |
| xxl  | 1536px | WebP   | Extra Large     |
| xxxl | 1920px | WebP   | Full HD         |
| max  | 2560px | WebP   | 2K/Retina       |

## 8.11 Rich Text System

### 8.11.1 TipTap/ProseMirror Integration

Das UJL-Framework verwendet TipTap (ProseMirror-Wrapper) für Rich Text:

```typescript
// Shared Schema (packages/core)
export const ujlRichTextExtensions = [
	StarterKit.configure({
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

		// Disabled (UI-only)
		dropcursor: false,
		gapcursor: false,
	}),
];
```

### 8.11.2 WYSIWYG-Garantie

Gleiches Schema in Editor und Serializer garantiert WYSIWYG:

```mermaid
flowchart LR
    Editor["TipTap Editor"] -->|"ujlRichTextExtensions"| JSON["ProseMirror JSON"]
    JSON -->|"prosemirrorToHtml"| HTML["Rendered HTML"]

    subgraph SharedSchema["Shared Schema"]
        ujlRichTextExtensions
    end
```

### 8.11.3 SSR-Safe Serializer

Der HTML-Serializer ist SSR-kompatibel (keine Browser-APIs):

```typescript
// packages/adapter-svelte
export function prosemirrorToHtml(doc: ProseMirrorDocument): string {
	return serializeNodes(doc.content);
}

function serializeNode(node: ProseMirrorNode): string {
	switch (node.type) {
		case "paragraph":
			return "<p>" + serializeNodes(node.content) + "</p>";
		case "heading":
			const level = node.attrs?.level ?? 1;
			return "<h" + level + ">" + serializeNodes(node.content) + "</h" + level + ">";
		case "text":
			return applyMarks(escapeHtml(node.text), node.marks);
		// ...
	}
}
```

## 8.12 Build und Deployment

### 8.12.1 Monorepo-Struktur

Das UJL-Framework ist als pnpm Workspace Monorepo organisiert:

```
ujl/
├── packages/
│   ├── types/           # Foundation Layer
│   ├── core/            # Core Layer
│   ├── ui/              # UI Layer
│   ├── adapter-svelte/  # Adapter Layer
│   ├── adapter-web/     # Adapter Layer
│   ├── crafter/         # Application Layer
│   └── examples/        # Example Documents
├── apps/
│   ├── demo/            # Demo Application
│   └── docs/            # Documentation
└── services/
    └── library/         # Payload CMS Backend
```

### 8.12.2 Dependency Management

Build-Reihenfolge folgt der Dependency-Hierarchie:

```bash
# Korrekte Reihenfolge (automatisch via pnpm)
pnpm run build

# Interne Reihenfolge:
# 1. types - 2. core - 3. ui - 4. adapter-svelte - 5. adapter-web - 6. crafter
```

### 8.12.3 Versionierung mit Changesets

```bash
# Feature Branch: Changeset erstellen
pnpm changeset

# Main Branch: Versionen anwenden
pnpm version-packages

# Release: Packages veröffentlichen
pnpm publish -r --access public
```

## 8.13 Logging und Monitoring

### 8.13.1 Logging-Strategie

UJL verwendet strukturiertes Logging über alle Komponenten hinweg:

**Log-Levels:**

| Level     | Verwendung                                 | Beispiel                          |
| --------- | ------------------------------------------ | --------------------------------- |
| **error** | Fehler, die Funktionalität beeinträchtigen | Module not found, API failure     |
| **warn**  | Potenzielle Probleme                       | Deprecated field used, slow query |
| **info**  | Wichtige Systemereignisse                  | Server started, build completed   |
| **debug** | Detaillierte Entwicklungsinformationen     | Function calls, state changes     |

**Namenskonvention:**

```typescript
// Format: [UJL:Package:Component] Message
console.log("[UJL:Core:Composer] Composing document...");
console.error("[UJL:Crafter:ModulePicker] Failed to load modules");
console.warn("[UJL:Types:Validator] Using deprecated field structure");
```

**Kontext-basiertes Logging:**

```typescript
interface LogContext {
	package: string; // 'core', 'crafter', 'adapter-svelte'
	component: string; // 'Composer', 'ModulePicker'
	action: string; // 'compose', 'validate', 'upload'
	userId?: string;
	documentId?: string;
}

function log(level: string, message: string, context: LogContext) {
	const prefix = `[UJL:${context.package}:${context.component}]`;
	console[level](`${prefix} ${message}`, {
		action: context.action,
		...context,
	});
}
```

### 8.13.2 Performance-Monitoring

**Performance-Metriken:**

```typescript
// Composer Performance
const start = performance.now();
const ast = await composer.compose(document);
const duration = performance.now() - start;

if (duration > 100) {
	console.warn(`[UJL:Core:Composer] Slow composition: ${duration}ms`, {
		nodeCount: countNodes(ast),
		moduleCount: document.ujlc.root.length,
	});
}
```

**Crafter-Metriken:**

| Metrik               | Zielwert | Logging-Trigger |
| -------------------- | -------- | --------------- |
| Document Composition | <100ms   | >200ms → warn   |
| Module Picker Load   | <50ms    | >100ms → warn   |
| Image Upload         | <2s      | >5s → warn      |
| Autosave             | <200ms   | >500ms → warn   |

## 8.14 Caching-Strategie

### 8.14.1 Client-Side Caching

**Browser Cache (HTTP):**

```nginx
# Static Assets (Vite Build)
location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML (SSR Pages)
location ~* \.html$ {
    expires 5m;
    add_header Cache-Control "public, must-revalidate";
}
```

**Service Worker Cache (Optional):**

```typescript
// Workbox Strategy
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

// Static Assets: Cache-First
registerRoute(
	({ request }) => request.destination === "script" || request.destination === "style",
	new CacheFirst({ cacheName: "ujl-static" })
);

// API Calls: Network-First mit Fallback
registerRoute(
	({ url }) => url.pathname.startsWith("/api/"),
	new NetworkFirst({ cacheName: "ujl-api", networkTimeoutSeconds: 3 })
);
```

### 8.14.2 In-Memory Caching

**Module Registry Cache:**

```typescript
class ModuleRegistry {
	private cache = new Map<string, Module>();

	getModule(type: string): Module | undefined {
		// Cache Hit
		if (this.cache.has(type)) {
			return this.cache.get(type);
		}

		// Cache Miss: Load and Cache
		const module = this.loadModule(type);
		if (module) {
			this.cache.set(type, module);
		}
		return module;
	}
}
```

**Composer Caching (Optional):**

```typescript
import LRU from "lru-cache";

const astCache = new LRU<string, ASTNode>({
	max: 100, // Max 100 Documents
	maxSize: 50 * 1024 * 1024, // 50MB
	sizeCalculation: ast => JSON.stringify(ast).length,
});

async function cachedCompose(document: UJLCDocument): Promise<ASTNode> {
	const cacheKey = hashDocument(document);

	if (astCache.has(cacheKey)) {
		return astCache.get(cacheKey)!;
	}

	const ast = await composer.compose(document);
	astCache.set(cacheKey, ast);
	return ast;
}
```

### 8.14.3 API-Response Caching

**Media API (Payload CMS):**

```typescript
// Cache-Control Headers für Images
app.get("/api/images/:id", async (req, res) => {
	const image = await Image.findById(req.params.id);

	res.setHeader("Cache-Control", "public, max-age=604800"); // 7 Tage
	res.setHeader("ETag", image.etag);

	if (req.headers["if-none-match"] === image.etag) {
		return res.status(304).end();
	}

	res.json(image);
});
```

### 8.14.4 CDN-Caching

**CloudFlare Page Rules (Beispiel):**

```yaml
# Static Assets
/assets/*:
  Cache Level: Cache Everything
  Edge Cache TTL: 1 month
  Browser Cache TTL: 1 year

# Media Files
/media/*:
  Cache Level: Cache Everything
  Edge Cache TTL: 1 week
  Browser Cache TTL: 1 week

# API
/api/*:
  Cache Level: Bypass
```

## 8.15 Security und Authorization

### 8.15.1 Input-Validierung

Alle externen Inputs werden validiert:

```typescript
// Schema-basierte Validierung
const result = validateUJLCDocumentSafe(untrustedInput);

if (!result.success) {
	throw new ValidationError("Invalid document", result.error);
}

// Zusätzliche Business-Rules
if (document.ujlc.root.length > 1000) {
	throw new Error("Document too large (max 1000 modules)");
}
```

### 8.15.2 XSS-Prevention

**Rich Text Sanitization:**

```typescript
import DOMPurify from "isomorphic-dompurify";

function sanitizeHTML(html: string): string {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: ["p", "strong", "em", "a", "ul", "ol", "li"],
		ALLOWED_ATTR: ["href", "title"],
		ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
	});
}
```

**Template Escaping (Svelte):**

```svelte
<!-- Automatisches Escaping -->
<p>{userInput}</p>

<!-- Sanitized HTML -->
<div>{@html sanitize(richText)}</div>
```

### 8.15.3 CSRF-Protection

**Payload CMS (built-in):**

```typescript
// CSRF Token automatisch in Forms
export default buildConfig({
	csrf: ["http://localhost:3000", "https://your-domain.com"],
});
```

**SvelteKit (built-in):**

```typescript
// CSRF-Protection in Form Actions
export const actions = {
	default: async ({ request }) => {
		// SvelteKit validiert CSRF-Token automatisch
		const data = await request.formData();
		// ...
	},
};
```

### 8.15.4 API-Key-Authentifizierung

**Media Service:**

```typescript
// Middleware für API-Key-Check
app.use("/api/images", (req, res, next) => {
	const apiKey = req.headers["x-api-key"];

	if (!apiKey || apiKey !== process.env.API_KEY) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	next();
});
```

### 8.15.5 Rate Limiting

**Express Rate Limiter:**

```typescript
import rateLimit from "express-rate-limit";

const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 Minuten
	max: 100, // Max 100 Uploads
	message: "Too many uploads, please try again later",
});

app.post("/api/images", uploadLimiter, uploadHandler);
```

### 8.15.6 Secrets Management

**Environment Variables:**

```bash
# .env (NICHT in Git committen)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
PAYLOAD_SECRET=$(openssl rand -base64 32)
API_KEY=$(openssl rand -base64 32)
```

**Vault Integration (Production):**

```typescript
// HashiCorp Vault
import Vault from "node-vault";

const vault = Vault({
	endpoint: process.env.VAULT_ADDR,
	token: process.env.VAULT_TOKEN,
});

const secrets = await vault.read("secret/data/ujl");
const dbPassword = secrets.data.data.POSTGRES_PASSWORD;
```

## 8.16 Internationalisierung (i18n)

### 8.16.1 Content-Mehrsprachigkeit (geplant)

UJL unterstützt mehrsprachige Inhalte auf Document-Ebene:

**UJLC mit i18n-Support:**

```json
{
	"ujlc": {
		"meta": { "version": "1.0.0" },
		"i18n": {
			"defaultLocale": "de",
			"locales": ["de", "en", "fr"]
		},
		"root": [
			{
				"type": "text",
				"meta": { "id": "text_1" },
				"fields": {
					"content": {
						"de": "Willkommen",
						"en": "Welcome",
						"fr": "Bienvenue"
					}
				}
			}
		]
	}
}
```

### 8.16.2 UI-Mehrsprachigkeit

**Crafter UI:**

```typescript
import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";

// Translations laden
addMessages("de", {
	"module.add": "Modul hinzufügen",
	"module.delete": "Modul löschen",
});

addMessages("en", {
	"module.add": "Add Module",
	"module.delete": "Delete Module",
});

// Initialisierung
init({
	fallbackLocale: "en",
	initialLocale: getLocaleFromNavigator(),
});
```

**Verwendung in Components:**

```svelte
<script>
  import { _ } from 'svelte-i18n';
</script>

<button>{$_('module.add')}</button>
```

### 8.16.3 Date/Time/Number Formatting

```typescript
import { format } from "date-fns";
import { de, enUS, fr } from "date-fns/locale";

const locales = { de, en: enUS, fr };

function formatDate(date: Date, locale: string): string {
	return format(date, "PPP", { locale: locales[locale] });
}

// Outputs:
// de: "24. Januar 2026"
// en: "January 24, 2026"
// fr: "24 janvier 2026"
```
