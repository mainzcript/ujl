---
title: "Lösungsstrategie"
description: "Lösungsstrategie und Architektur-Konzept von UJL"
---

# Lösungsstrategie

## Überblick: Strategische Positionierung

UJL verfolgt einen **architektonischen Ansatz** zur Lösung des Brand-Compliance-Dilemmas. Anstatt Markenkonsistenz und Barrierefreiheit durch Prozesse, Reviews oder Schulungen zu erzwingen, werden diese Eigenschaften in die technische Architektur eingebettet:

Diese Strategie unterscheidet UJL fundamental von klassischen Page Buildern, die Gestaltungsfreiheit bieten und Compliance nachträglich prüfen. UJL dreht die Logik um: Compliance ist die Voraussetzung, Gestaltungsfreiheit existiert innerhalb definierter Leitplanken.

## 4.1 Kernstrategien zur Zielerreichung

### Strategie 1: Strikte Content-Design-Trennung

**Qualitätsziel:** Brand-Compliance by Design (Priorität 1)

**Problem:** Traditionelle Web-Technologien (HTML/CSS) ermöglichen es Redakteur:innen, Design-Regeln durch inline-Styles oder falsche CSS-Klassen zu brechen.

**Lösung:** Architektonische Trennung auf Datenebene

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  UJLC Document  │     │  UJLT Document  │     │   Composer       │
│  (Content)      │────▶│  (Design)       │────▶│   + Registry     │
│  .ujlc.json     │     │  .ujlt.json     │     │   ↓              │
│                 │     │                 │     │   AST            │
│ - Modules       │     │ - Colors        │     │   ↓              │
│ - Fields        │     │ - Typography    │     │   Adapter        │
│ - Slots         │     │ - Spacing       │     │   ↓              │
│                 │     │ - Radius        │     │   Output         │
└─────────────────┘     └─────────────────┘     └──────────────────┘
```

**Technische Umsetzung:**

Die Trennung erfolgt auf zwei Ebenen: **UJLC-Dokumente** enthalten ausschließlich strukturierte Content-Daten in Form von Modulen mit typisierten Fields und Slots. **UJLT-Dokumente** hingegen enthalten zentral verwaltete Design-Tokens wie Farben (im OKLCH-Farbraum), Typografie, Spacing und Radius. Der **Composer** kombiniert beide zur Laufzeit zu einem Abstract Syntax Tree (AST), während **Zod-Schemas** beide Dokumenttypen validieren.

**Konsequenzen:**

Diese Architektur führt dazu, dass Redakteur:innen Design-Regeln technisch nicht brechen können und Theme-Updates sofort global auf alle Dokumente wirken. Das ermöglicht zentrale Governance ohne manuelle Reviews, bedeutet aber auch weniger Flexibilität für individuelle Design-Anpassungen pro Dokument.

**Referenz:** Siehe [ADR-001](./09-architecture-decisions#_9-1-adr-001-strikte-trennung-von-content-ujlc-und-design-ujlt)

### Strategie 2: Schema-First mit Runtime-Validierung

**Qualitätsziel:** Validierbarkeit & Robustheit (Priorität 3), Type Safety

**Problem:** Externe Daten (CMS-Import, Datei-Upload, zukünftig KI-generierte Inhalte) können ungültige Strukturen enthalten. Reine TypeScript-Typen bieten nur Compile-Time-Sicherheit.

**Lösung:** Zod als Single Source of Truth

```typescript
// Schema Definition (Zod)
export const UJLCModuleObjectSchema = z.object({
	type: z.string(),
	meta: UJLCModuleMetaSchema,
	fields: z.record(z.string(), UJLCFieldObjectSchema),
	slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema))),
});

// Type Inference (automatisch)
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;

// Runtime Validation
export function validateUJLCDocument(data: unknown): UJLCDocument {
	return UJLCDocumentSchema.parse(data); // Throws on invalid
}
```

**Vorteile:**

Zod als Schema-Bibliothek bringt mehrere entscheidende Vorteile: Das **DRY-Prinzip** wird eingehalten, da die Schema-Definition automatisch TypeScript-Types generiert. **Runtime Safety** ist gewährleistet durch Validierung bei Datei-Upload, CMS-Import und zukünftig AI-Generierung. Zod liefert **detaillierte Fehler** mit JSON-Path-basierten Fehlermeldungen, was das Debugging erheblich erleichtert. Durch `z.lazy()` werden **rekursive Strukturen** wie unendliche Modul-Verschachtelung ermöglicht. Insgesamt ermöglicht die Architektur **deterministische Validierung** von externen Daten aus CMS, Import oder zukünftig LLM-Output.

**Konsequenzen:**

Die Entscheidung garantiert Datenintegrität zur Laufzeit und ermöglicht automatische Type-Synchronisation zwischen Schema und TypeScript-Types. Als Trade-off entsteht ein Runtime-Overhead durch Validierung (etwa 5–10ms pro Dokument) sowie eine größere Bundle-Größe durch Zod (etwa 12KB gzip).

**Referenz:** Siehe [ADR-005](./09-architecture-decisions#_9-5-adr-005-zod-basierte-runtime-validation-mit-typescript-type-inference)

### Strategie 3: Abstract Syntax Tree (AST) als Zwischen-Repräsentation

**Qualitätsziel:** Framework-Agnostizität, Erweiterbarkeit

**Problem:** Direktes Rendering von UJL-Dokumenten bindet an spezifisches Framework (z.B. Svelte). Andere Frameworks (React, Vue) erfordern vollständige Neuimplementierung.

**Lösung:** Adapter Pattern mit AST als Zwischenschicht

```
UJL Document (.ujlc.json)
    ↓
Composer (with Module Registry)
    ↓
AST (Framework-Agnostic)
    ↓
    ├─→ Svelte Adapter → Svelte Components
    ├─→ Web Adapter → Custom Elements (<ujl-content>)
    ├─→ HTML Adapter (future) → Static HTML
    └─→ PDF Adapter (future) → PDF Documents
```

**AST-Node-Struktur:**

```typescript
type UJLAbstractNode =
	| { type: "text"; id: string; props: { content: ProseMirrorDoc } }
	| { type: "button"; id: string; props: { label: string; href: string } }
	| { type: "container"; id: string; props: { children: UJLAbstractNode[] } }
	| { type: "image"; id: string; props: { image: UJLImageData } };
// ... weitere Node-Typen
```

**Adapter-Schnittstelle:**

```typescript
type UJLAdapter<OutputType = string, OptionsType = undefined> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: OptionsType
) => OutputType;
```

**Vorteile:**

1. **Separation of Concerns**: Composition-Logik unabhängig von UI-Framework
2. **Multiple Targets**: Ein AST, viele Rendering-Ziele
3. **Feature-Vererbung**: Neue AST-Nodes funktionieren automatisch in allen Adaptern
4. **Testbarkeit**: AST-Generierung kann isoliert getestet werden

**Konsequenzen:**

- Flexibilität bei Framework-Wahl
- Einfache Erweiterung um neue Output-Formate
- Module-IDs bleiben erhalten (wichtig für Editor-Integration)
- Mehrfachimplementierung für jeden Adapter
- Adapter müssen synchron gehalten werden

**Referenz:** Siehe [ADR-003](./09-architecture-decisions#_9-3-adr-003-adapter-pattern-für-framework-agnostisches-rendering)

### Strategie 4: Plugin-Architektur mit Module Registry

**Qualitätsziel:** Erweiterbarkeit, Type Safety

**Problem:** Entwickler:innen sollen eigene Module hinzufügen können, ohne Core-Code zu ändern. System muss trotzdem type-safe bleiben.

**Lösung:** Registry Pattern mit abstrakten Base-Klassen

```typescript
// Abstrakte Basisklasse für alle Module
abstract class ModuleBase {
	abstract readonly name: string;
	abstract readonly label: string;
	abstract readonly category: ComponentCategory;
	abstract readonly fields: FieldSet;
	abstract readonly slots: SlotSet;

	abstract compose(
		moduleData: UJLCModuleObject,
		composer: Composer
	): UJLAbstractNode | Promise<UJLAbstractNode>;
}

// Zentrale Registry
class ModuleRegistry {
	registerModule(module: ModuleBase): void;
	getModule(name: string): AnyModule | undefined;
	getAllModules(): AnyModule[];
	createModuleFromType(type: string, id: string): UJLCModuleObject;
}

// Composer nutzt Registry für Dispatch
class Composer {
	composeModule(moduleData: UJLCModuleObject): UJLAbstractNode {
		const module = this.registry.getModule(moduleData.type);
		return module.compose(moduleData, this);
	}
}
```

**Field-System mit Validation & Fitting:**

```typescript
abstract class FieldBase<ValueT, ConfigT> {
	// Validation: Type Guard
	abstract validate(raw: UJLCFieldObject): raw is ValueT;

	// Fitting: Apply Constraints
	abstract fit(value: ValueT): ValueT;

	// Parse: Validate → Fit
	parse(raw: UJLCFieldObject): ValueT {
		if (!this.validate(raw)) throw new Error("Invalid field value");
		return this.fit(raw);
	}
}
```

**Beispiel Custom Module:**

```typescript
class CustomModule extends ModuleBase {
	readonly name = "custom-module";
	readonly label = "Custom Module";
	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];
	readonly slots = [{ key: "content", slot: new Slot({ label: "Content", max: 5 }) }];

	compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		const children = moduleData.slots.content.map(child => composer.composeModule(child));
		return {
			type: "wrapper",
			id: moduleData.meta.id,
			props: { children },
		};
	}
}

// Registrierung
composer.registerModule(new CustomModule());
```

**Vorteile:**

1. **Zero Configuration**: Default Registry mit Built-in Modules
2. **Type Safety**: TypeScript Generics für Field-Typen
3. **Validation Pipeline**: `validate()` → `fit()` für Datenintegrität
4. **Single Responsibility**: Jedes Modul kümmert sich um eigene Composition
5. **UI-Metadata**: Module exportieren Label, Description, Icon für Editor

**Konsequenzen:**

- Einfache Erweiterung durch Drittanbieter
- Vollständige Typsicherheit zur Compile-Zeit
- Runtime-Validierung durch Zod in Field-Klassen
- Mehr Boilerplate-Code für neue Module (~50-100 LOC)
- Lernkurve für Modulsystem (Template-Dateien helfen)

**Referenz:** Siehe [ADR-002](./09-architecture-decisions#_9-2-adr-002-modulares-plugin-system-mit-registry-pattern)

### Strategie 5: OKLCH-Farbraum für Accessibility

**Qualitätsziel:** Accessibility als Standard (Priorität 2)

**Problem:** Traditionelle Farbräume (RGB, HSL) sind nicht perzeptuell uniform. Farb-Shades mit gleichem Helligkeits-Delta sehen unterschiedlich hell aus. Kontrast-Berechnungen sind unzuverlässig.

**Lösung:** OKLCH (Oklab Lightness Chroma Hue) als Farbraum

```typescript
// OKLCH Color Definition
type UJLTColor = {
	l: number; // Lightness (0-100), perzeptuell uniform
	c: number; // Chroma (0+), Farbsättigung
	h: number; // Hue (0-360), Farbton
};

// Color Palette mit 11 Shades
type UJLTColorSet = {
	50: UJLTColor; // Hellste Shade
	100: UJLTColor;
	200: UJLTColor;
	// ...
	900: UJLTColor;
	950: UJLTColor; // Dunkelste Shade
};
```

**Automatische Palette-Generierung:**

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

**Automatische Kontrast-Prüfung:**

```typescript
function resolveForegroundColor(
	bgPalette: UJLTColorSet,
	fgPalette: UJLTColorSet,
	mode: "light" | "dark"
): UJLTColor {
	const bgColor = bgPalette[mode === "light" ? "50" : "950"];
	const fgColor = fgPalette[mode === "light" ? "950" : "50"];

	const contrastRatio = calculateContrast(bgColor, fgColor);

	// WCAG AA: Mindestens 4.5:1 für Text
	if (contrastRatio < 4.5) {
		return adjustForContrast(fgColor, bgColor, 4.5);
	}

	return fgColor;
}
```

**Vorteile:**

1. **Perceptual Uniformity**: Gleiche L-Deltas = gleiche wahrgenommene Helligkeit
2. **Bessere Kontraste**: Präzisere WCAG-Kontrast-Berechnungen
3. **Harmonische Paletten**: Mathematisch korrekte Farb-Interpolation
4. **Native Browser-Support**: CSS `oklch()` in modernen Browsern
5. **Design-Token-Mapping**: Direkter Export zu Tailwind CSS

**CSS-Output:**

```css
:root {
	--color-primary-50: oklch(97% 0.01 250);
	--color-primary-500: oklch(60% 0.15 250);
	--color-primary-950: oklch(20% 0.05 250);
}
```

**Konsequenzen:**

- Garantierte WCAG AA-Konformität durch automatische Checks
- Harmonischere Farbpaletten als mit HSL
- Verlässliche Accessibility-Garantien
- Komplexere Berechnungen als HSL (Laufzeit-Overhead minimal)
- Weniger bekannt → Lernkurve für Designer:innen
- Fallback für ältere Browser nötig (RGB-Konvertierung)

**Referenz:** Siehe [ADR-009](./09-architecture-decisions#_9-9-adr-009-oklch-farbraum-für-design-tokens)

### Strategie 6: Strukturierte Daten statt HTML

**Qualitätsziel:** Validierbarkeit & Robustheit (Priorität 3), Security

**Problem:** HTML-Strings sind schwer zu validieren, bergen XSS-Risiken und sind schwer von KI zuverlässig zu generieren. WYSIWYG-Konsistenz zwischen Editor und Output ist nicht garantiert.

**Lösung:** TipTap/ProseMirror für Rich Text, strukturierte JSON-Dokumente

```typescript
// ProseMirror Document (JSON)
type ProseMirrorDocument = {
	type: "doc";
	content: ProseMirrorNode[];
};

type ProseMirrorNode = {
	type: string; // 'paragraph', 'heading', 'text', etc.
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: ProseMirrorMark[]; // 'bold', 'italic', 'code'
	text?: string;
};
```

**Shared Schema für Editor & Renderer:**

```typescript
// packages/core/src/tiptap-schema.ts
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

		// UI-Extensions disabled (not serializable)
		undoRedo: false,
		dropcursor: false,
		gapcursor: false,
	}),
];
```

**SSR-Safe Serialization:**

```typescript
// Synchrone HTML-Generierung ohne Browser-APIs
export function prosemirrorToHtml(doc: ProseMirrorDocument): string {
	if (!doc || doc.type !== "doc") return "";
	return serializeNodes(doc.content);
}

function serializeNode(node: ProseMirrorNode): string {
	switch (node.type) {
		case "paragraph":
			return `<p>${serializeNodes(node.content)}</p>`;
		case "heading":
			const level = node.attrs?.level ?? 1;
			return `<h${level}>${serializeNodes(node.content)}</h${level}>`;
		case "text":
			return applyMarks(escapeHtml(node.text), node.marks);
		// ... weitere Node-Typen
	}
}
```

**Vorteile:**

1. **WYSIWYG-Garantie**: Gleiches Schema in Editor und Renderer
2. **Type Safety**: ProseMirror-Dokumente validierbar mit Zod
3. **XSS-Prevention**: Keine Direct HTML-Injection, strukturierte Daten
4. **Validierbarkeit**: JSON-Struktur ist validierbar und für zukünftige LLM-Generierung besser geeignet als HTML
5. **SSR-Compatible**: Synchrone Serialization ohne Browser-Dependencies

**Konsequenzen:**

- Garantierte Editor-Output-Konsistenz
- Sicherer als HTML-Strings
- Validierbare Struktur
- Komplexere Schema-Verwaltung (~200 LOC)
- Größere Bundle-Size durch ProseMirror (~40KB gzip)

**Referenz:** Siehe [ADR-008](./09-architecture-decisions#_9-8-adr-008-tiptap-prosemirror-für-rich-text-editing)

### Strategie 7: Dual Storage Strategy für Medien

**Qualitätsziel:** Portabilität, Enterprise-Tauglichkeit

**Problem:** Unterschiedliche Anwendungsfälle erfordern unterschiedliche Media-Strategien:

- **Standalone-Dokumente**: Sollen portabel sein ohne externe Abhängigkeiten
- **Enterprise CMS**: Zentrale Media-Verwaltung mit Metadaten, Responsive Images, Versionierung

**Lösung:** Abstrahierte Media Library mit Resolver Pattern

```typescript
// Image Library mit Provider
class ImageLibrary {
	constructor(
		initialImages: Record<string, ImageEntry>,
		provider?: ImageProvider // Optional: Externe Image-Quelle
	);

	async resolve(id: string): Promise<UJLImageData | null> {
		// 1. Check local cache
		const local = this.images[id];
		if (local) {
			return { imageId: id, src: local.src, alt: local.metadata.alt || "" };
		}

		// 2. Use provider for backend storage
		if (this.provider) {
			const imageSource = await this.provider.resolve(id);
			if (imageSource) {
				return { imageId: id, src: imageSource.src, alt: "" };
			}
		}

		return null;
	}
}

// Provider Interface
interface ImageProvider {
	resolve(id: string | number): Promise<ImageSource | null>; // Returns image source
}
```

**Storage Mode 1: Inline (Default)**

```json
{
	"ujlc": {
		"meta": {
			"_library": { "storage": "inline" }
		},
		"images": {
			"img-001": {
				"src": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
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

**Vorteile:**

- Vollständige Portabilität (keine externe Abhängigkeit)
- Funktioniert offline
- Einfaches Setup

**Nachteile:**

- Große Dokument-Dateien (Base64)
- Keine Responsive Images
- Keine Metadaten-Verwaltung

**Storage Mode 2: Backend (Payload CMS)**

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

**Payload CMS Images Collection:**

```typescript
export const Images: CollectionConfig = {
	slug: "images",
	upload: {
		staticDir: "uploads/images",
		imageSizes: [
			// Responsive Sizes (Tailwind-Breakpoints)
			{ name: "xs", width: 320 },
			{ name: "sm", width: 640 },
			{ name: "md", width: 768 },
			{ name: "lg", width: 1024 },
			{ name: "xl", width: 1280 },
			{ name: "xxl", width: 1536 },
			{ name: "xxxl", width: 1920 },
			{ name: "max", width: 2560 },
		],
		formatOptions: { format: "webp", options: { quality: 80 } },
		focalPoint: true, // Smart cropping via focal point
	},
	fields: [
		{ name: "title", type: "text" },
		{ name: "description", type: "textarea", localized: true },
		{ name: "alt", type: "text", localized: true },
		{ name: "credit", type: "group", fields: [...] }, // IPTC-Credit
	],
};
```

**Vorteile:**

- Professionelle Media-Verwaltung
- Responsive Images (WebP, mehrere Sizes)
- Metadaten (Alt-Text, Lizenz, Tags, i18n)
- Focal Point für Smart Cropping

**Nachteile:**

- Externe Service-Abhängigkeit
- Setup-Komplexität (Docker, PostgreSQL)
- Hosting-Kosten

**Konsequenzen:**

- Flexibilität für unterschiedliche Use Cases
- Seamless Switching zwischen Modi (Resolver austauschbar)
- Enterprise-Features ohne Vendor Lock-in (Self-Hosted)
- Komplexere Architektur durch Abstraktion

**Referenz:** Siehe [ADR-004](./09-architecture-decisions#_9-4-adr-004-dual-media-storage-strategy-inline-vs-backend)

## 4.2 Technologie-Entscheidungen

### Übersicht: Gewählte Technologien

| Schicht                | Technologie                  | Begründung                                                                                 |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| **UI Framework**       | Svelte 5                     | Minimale Bundle-Größe durch Compilation, Fine-grained Reactivity, Custom Elements Support  |
| **Type System**        | TypeScript 5.9 (Strict)      | Compile-Time Safety, IDE-Support, generierte Declaration Files                             |
| **Runtime Validation** | Zod 4.2                      | Schema → Type Inference, detaillierte Fehler, rekursive Schemas                            |
| **Styling**            | Tailwind CSS 4               | Utility-First, Tree-Shaking, Design-Token-Integration via CSS Custom Properties            |
| **Rich Text**          | TipTap 3 (ProseMirror)       | Strukturierte JSON-Dokumente, WYSIWYG-Konsistenz, SSR-Safe Serialization                   |
| **Color System**       | OKLCH (colorjs.io)           | Perzeptuell uniforme Paletten, präzise Kontrast-Berechnungen, WCAG-Konformität             |
| **Media Backend**      | Payload CMS 3                | TypeScript-First, RESTful API, Image Processing (WebP, Focal Point), Self-Hosted           |
| **Database**           | PostgreSQL 17                | Relational DB für Media Metadata, pgvector-ready für zukünftige Semantic Search            |
| **Build Tool**         | Vite 7                       | Schnelles HMR, optimierte Production Builds, ESM-Native, SvelteKit-Integration             |
| **Monorepo**           | pnpm Workspaces + Changesets | Effiziente Disk-Space-Nutzung, koordinierte Versionierung, Semantic Versioning Automation  |
| **Testing**            | Vitest 4 + Playwright 1.57   | Unit Tests (Jest-API), E2E Tests (Cross-Browser), Test Attributes ohne Production Overhead |
| **Documentation**      | VitePress                    | Markdown-basiert, Vue-powered, schnell, integrierbar mit CI/CD                             |
| **CI/CD**              | GitLab CI                    | Multi-Stage Pipeline, Caching, GitLab Pages Deployment                                     |

### Entscheidungstreiber für Technologie-Wahl

#### 1. Svelte 5 als UI Framework

**Alternative Kandidaten:** React, Vue, Solid

**Entscheidungskriterien (Skala 1–5):**

| Kriterium         | Svelte 5 | React 19 | Vue 3 | Solid |
| ----------------- | -------- | -------- | ----- | ----- |
| Bundle-Größe      | 5        | 2        | 3     | 4     |
| Performance       | 5        | 3        | 4     | 5     |
| Custom Elements   | 5        | 3        | 4     | 3     |
| Developer UX      | 5        | 3        | 4     | 3     |
| Community         | 3        | 5        | 4     | 2     |
| Tooling-Ökosystem | 4        | 5        | 4     | 2     |

**Entscheidung:** Svelte 5

**Begründung:**

- **Bundle-Größe:** `adapter-web` mit Svelte 5 Runtime <80KB (gzip), React equivalent >150KB
- **Compilation:** Kein Virtual DOM Overhead, direktes DOM-Manipulation
- **Runes API:** Fine-grained Reactivity für Crafter State Management
- **Custom Elements:** Native Support (`<svelte:options customElement>`)
- **mount() API:** Programmatische Kontrolle über Component Lifecycle (Adapter Pattern)

**Trade-off akzeptiert:**

- Kleinere Community als React → Ausgleich durch gute Dokumentation
- Weniger Drittanbieter-Libraries → Ausgleich durch shadcn-svelte, bits-ui

**Referenz:** Siehe [ADR-006](./09-architecture-decisions#_9-6-adr-006-svelte-5-als-primäres-ui-framework)

#### 2. Zod für Runtime Validation

**Alternative Kandidaten:** Yup, Joi, AJV (JSON Schema)

**Entscheidungskriterien (Skala 1–5):**

| Kriterium         | Zod | Yup | Joi | AJV |
| ----------------- | --- | --- | --- | --- |
| Type Inference    | 5   | 3   | 1   | 2   |
| TypeScript-First  | 5   | 3   | 2   | 3   |
| Rekursive Schemas | 5   | 3   | 3   | 4   |
| Fehlerberichte    | 5   | 4   | 3   | 2   |
| Bundle-Größe      | 4   | 4   | 2   | 5   |
| DX (Developer UX) | 5   | 3   | 3   | 2   |

**Entscheidung:** Zod

**Begründung:**

- **Type Inference:** `z.infer<typeof schema>` eliminiert doppelte Type-Definitionen
- **Recursive Schemas:** `z.lazy()` für unbegrenzte Modul-Verschachtelung
- **Error Messages:** JSON-Path-basierte Fehler für präzises Debugging
- **TypeScript-Native:** Keine Schema-zu-Type-Konvertierung nötig
- **Tree-Shaking:** Ungenutzte Validators werden entfernt

**Beispiel Type Inference:**

```typescript
const UserSchema = z.object({
	name: z.string(),
	age: z.number().min(18),
});

// Type automatisch generiert:
type User = z.infer<typeof UserSchema>;
// → { name: string; age: number }
```

**Trade-off akzeptiert:**

- Langsamer als AJV (JSON Schema Validator) → Ausgleich durch Caching
- ~12KB Bundle-Größe → Akzeptabel für garantierte Type Safety

**Referenz:** Siehe [ADR-005](./09-architecture-decisions#_9-5-adr-005-zod-basierte-runtime-validation-mit-typescript-type-inference)

#### 3. Payload CMS für Media Backend

**Alternative Kandidaten:** Strapi, Custom Backend (Express + Sharp), Supabase Storage

**Entscheidungskriterien (Skala 1–5):**

| Kriterium           | Payload CMS | Strapi | Custom | Supabase |
| ------------------- | ----------- | ------ | ------ | -------- |
| TypeScript-First    | 5           | 3      | 4      | 3        |
| Image Processing    | 5           | 3      | 4      | 2        |
| Self-Hosted         | 5           | 5      | 5      | 3        |
| Setup-Komplexität   | 4           | 3      | 2      | 5        |
| Metadata-Management | 5           | 4      | 3      | 3        |
| i18n Support        | 5           | 4      | 2      | 2        |

**Entscheidung:** Payload CMS

**Begründung:**

- **TypeScript-Native:** Generiert Types aus Schema-Definitionen
- **Image Processing:** WebP-Konvertierung, responsive Sizes, Focal Point
- **RESTful API:** Out-of-the-box mit Filtering, Sorting, Pagination
- **Self-Hosted:** Docker Compose Setup, kein Vendor Lock-in
- **i18n Support:** Mehrsprachige Metadaten (Alt-Text, Title, Description)

**Features für UJL:**

```typescript
// Automatische Responsive Images (Tailwind-Breakpoints)
sizes: {
  xs: { width: 320 },
  sm: { width: 640 },
  md: { width: 768 },
  lg: { width: 1024 },
  xl: { width: 1280 },
  xxl: { width: 1536 },
  xxxl: { width: 1920 },
  max: { width: 2560 }
}

// Focal Point für Smart Cropping
focalPoint: true  // → focalX, focalY (0-100)

// WebP Conversion mit Qualitätseinstellung
formatOptions: { format: 'webp', options: { quality: 80 } }
```

**Trade-off akzeptiert:**

- Externe Service-Abhängigkeit → Ausgleich durch Inline Storage Fallback
- Setup-Komplexität (Docker + PostgreSQL) → Ausgleich durch Docker Compose

**Referenz:** Siehe [ADR-007](./09-architecture-decisions#_9-7-adr-007-payload-cms-für-media-management-backend)

#### 4. pnpm + Changesets für Monorepo

**Alternative Kandidaten:** npm Workspaces, Yarn Workspaces, Lerna, Turborepo

**Entscheidungskriterien (Skala 1–5):**

| Kriterium             | pnpm + Changesets | npm Workspaces | Yarn + Lerna | Turborepo | Nx  |
| --------------------- | ----------------- | -------------- | ------------ | --------- | --- |
| Disk Efficiency       | 5                 | 2              | 3            | 3         | 3   |
| Install Speed         | 5                 | 3              | 4            | 4         | 3   |
| Versioning Automation | 5                 | 2              | 4            | 2         | 2   |
| Setup-Komplexität     | 4                 | 5              | 3            | 3         | 2   |
| Caching               | 4                 | 3              | 3            | 5         | 5   |

**Entscheidung:** pnpm Workspaces + Changesets

**Begründung:**

- **Disk Efficiency:** Content-addressable Storage (global Store für alle Projekte)
- **Install Speed:** Parallelisierte Installs, hardlinks statt copies
- **Strict Dependencies:** Packages sehen nur deklarierte Dependencies (verhindert Phantom Dependencies)
- **Changesets:** Koordinierte Versionierung mit automatischen Changelogs
- **Fixed Versioning:** Alle Packages synchron versioniert (wichtig für UJL-Ökosystem)

**Workspace Protocol:**

```json
{
	"dependencies": {
		"@ujl-framework/core": "workspace:*", // → Latest workspace version
		"@ujl-framework/types": "workspace:^" // → Compatible workspace version
	}
}
```

**Changesets Workflow:**

```bash
# Feature Branch: Create Changeset
pnpm changeset

# develop Branch: Version Packages
pnpm version-packages  # → Updates CHANGELOG.md, package.json

# Manual Publish (when ready)
pnpm publish -r --access public
```

**Trade-off akzeptiert:**

- Lernkurve für Changesets → Ausgleich durch Templates und Dokumentation
- Fixed Versioning erhöht Major-Versions schneller → Akzeptiert für Konsistenz

**Referenz:** Siehe [ADR-010](./09-architecture-decisions#_9-10-adr-010-pnpm-workspaces-changesets-für-monorepo)

## 4.3 Qualitätsziel-Strategie-Mapping

Diese Tabelle zeigt, wie strategische Entscheidungen die definierten Qualitätsziele ([Kapitel 1.2](./01-introduction-and-goals#_1-2-quality-goals)) erreichen:

| Qualitätsziel                    | Strategie                                         | Technologie                     | Erfolgsmetrik                                                                                   |
| -------------------------------- | ------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Brand-Compliance by Design**   | Content-Design-Trennung                           | UJLC/UJLT, Zod, Module Registry | 0 Design-Drift in User Studies                                                                  |
| **Accessibility als Standard**   | OKLCH-Farbraum, Automatische Kontrast-Checks      | OKLCH, colorjs.io               | 100% WCAG AA (4.5:1 Kontrast)                                                                   |
| **Validierbarkeit & Robustheit** | Schema-First, Strukturierte Daten                 | Zod, ProseMirror, JSON          | Architektur ermöglicht deterministische Validierung externer Daten (CMS, Import, zukünftig LLM) |
| **Erweiterbarkeit**              | Plugin-Architektur, Adapter Pattern               | Module Registry, AST            | <100 LOC für Custom Module, <50 LOC für Adapter                                                 |
| **Performance**                  | Svelte 5 Compilation, Tree-Shaking                | Svelte 5, Vite                  | <100KB Bundle (adapter-web), <200ms Crafter                                                     |
| **Developer Experience**         | TypeScript Strict, Type Inference, Templates      | TypeScript, Zod, pnpm           | <1h Onboarding (Custom Module), 100% Type Coverage                                              |
| **Maintainability**              | Monorepo, Automated Testing, Coordinated Releases | pnpm, Changesets, Vitest        | 80%+ Test Coverage (kritische Paths)                                                            |

## 4.4 Trade-offs und bewusste Entscheidungen

### Accepted Trade-offs

Die folgenden Trade-offs wurden bewusst akzeptiert, da die Vorteile die Nachteile überwiegen:

#### 1. Bundle-Größe vs. Runtime Safety

**Trade-off:** Zod + ProseMirror erhöhen Bundle-Größe (~50KB gzip kombiniert)

**Entscheidung:** Akzeptiert

**Begründung:** Runtime Validation ist essentiell für externe Daten (CMS, AI, User-Upload). Strukturierte Rich Text Daten sind ein architektonisches Qualitätsziel. Moderne Browser cachen Bundles effizient, und die Alternative (keine Validation) hätte ein höheres Sicherheitsrisiko.

#### 2. Lernkurve vs. Erweiterbarkeit

**Trade-off:** Module Registry Pattern erfordert mehr Boilerplate (~50-100 LOC pro Modul)

**Entscheidung:** Akzeptiert

**Begründung:** Klare Schnittstellen reduzieren langfristig den Maintenance-Aufwand. Template-Dateien (`_template.ts`) reduzieren die initiale Hürde, und Type Safety rechtfertigt den zusätzlichen Code. Die Alternative (freie Modulstruktur) hätte inkonsistente Module-Qualität zur Folge.

#### 3. Flexibilität vs. Governance

**Trade-off:** UJLC/UJLT-Trennung verhindert individuelle Design-Anpassungen pro Dokument

**Entscheidung:** Akzeptiert

**Begründung:** Brand-Compliance by Design ist das primäre Qualitätsziel (Priorität 1), und zentrale Theme-Verwaltung ist ein architektonisches Kernelement. Die Alternative (per-document Styling) würde Design-Drift ermöglichen. Use Cases mit individuellen Styles können eigene UJLT-Dateien verwenden.

#### 4. Setup-Komplexität vs. Enterprise-Features

**Trade-off:** Payload CMS Media Backend erfordert Docker + PostgreSQL Setup

**Entscheidung:** Akzeptiert

**Begründung:** Enterprise Features (Responsive Images, Metadaten, i18n) sind essentiell für professionelle Nutzung. Inline Storage bietet einen Fallback für einfache Use Cases, und Docker Compose reduziert die Setup-Komplexität. Die Alternative (nur Inline Storage) hätte keine Skalierbarkeit.

#### 5. Community-Größe vs. Performance

**Trade-off:** Svelte 5 hat eine kleinere Community als React

**Entscheidung:** Akzeptiert

**Begründung:** Performance und Bundle-Größe sind messbare Qualitätsmetriken. Das Adapter Pattern ermöglicht zukünftige React-Adapter, die Svelte-Community ist aktiv und wächst (SvelteKit, Svelte 5 Runes), und shadcn-svelte sowie bits-ui liefern professionelle Component-Bibliotheken.

### Rejected Alternatives

Die folgenden Alternativen wurden explizit verworfen:

#### 1. HTML/CSS-basierte Content-Dokumente (verworfen)

Redakteur:innen könnten Design-Regeln durch inline-Styles brechen. Es gibt keine architektonische Garantie für Brand-Compliance.

**Gewählte Alternative:** Strukturierte JSON-Dokumente (UJLC) mit Zod-Validierung

#### 2. Styled Components / CSS-in-JS (verworfen)

Runtime-Overhead, größere Bundle-Größe und keine Design-Token-Integration sprechen gegen diesen Ansatz.

**Gewählte Alternative:** Tailwind CSS mit CSS Custom Properties für Design-Tokens

#### 3. GraphQL API für Media Backend (verworfen)

GraphQL wäre Over-Engineering für den Media-Use-Case; eine RESTful API ist ausreichend.

**Gewählte Alternative:** Payload CMS mit RESTful API

#### 4. Lerna für Monorepo-Versionierung (verworfen)

Lerna ist veraltet, und Changesets bietet eine bessere Developer Experience.

**Gewählte Alternative:** pnpm Workspaces + Changesets

#### 5. React als primäres UI Framework (verworfen)

Größere Bundle-Größe, Virtual DOM Overhead und fehlende Compilation sind die Nachteile.

**Gewählte Alternative:** Svelte 5 mit Compilation und Fine-grained Reactivity

## 4.5 Implementierungsstrategie

### Build-Zeit vs. Laufzeit-Entscheidungen

| Concern                   | Build-Zeit                       | Laufzeit                                        |
| ------------------------- | -------------------------------- | ----------------------------------------------- |
| **Type Checking**         | TypeScript Compilation           | -                                               |
| **Schema Validation**     | - (nicht möglich)                | Zod Validation bei Dokument-Load                |
| **CSS Generation**        | Tailwind JIT Compilation         | CSS Custom Properties für Theme-Tokens          |
| **Component Compilation** | Svelte → JavaScript              | -                                               |
| **Image Optimization**    | - (bei Backend Storage: Payload) | - (bei Inline Storage: Client-Side Compression) |
| **Rich Text Rendering**   | - (strukturierte Daten)          | prosemirrorToHtml() Serialization               |
| **Module Composition**    | - (dynamisch)                    | Composer.compose() mit Registry                 |

### Deployment-Strategie

**Packages:**

- **Published to NPM** (geplant): `@ujl-framework/types`, `@ujl-framework/core`, `@ujl-framework/ui`, `@ujl-framework/adapter-svelte`, `@ujl-framework/adapter-web`, `@ujl-framework/crafter`
- **Private**: `@ujl-framework/examples`
- **Self-Hosted Service**: `@ujl-framework/media` (Docker Compose)

**Crafter Deployment:**

- **Option 1:** SvelteKit SSR auf Vercel, Netlify, Node.js-Server
- **Option 2:** Static Export (`adapter-static`) für S3, GitHub Pages
- **Option 3:** Docker Container (Crafter + Media Service)

**CI/CD Pipeline:**

```yaml
Stages:
1. install    → pnpm install --frozen-lockfile (cached)
2. build      → pnpm run build (types → core → ui → adapters → crafter → docs)
3. test       → pnpm run test (Vitest Unit Tests)
4. quality    → pnpm run lint + pnpm run check (ESLint + TypeScript)
5. deploy     → GitLab Pages (docs only on main/develop)
```

Die folgenden Prinzipien leiten alle architektonischen Entscheidungen:

1. **Separation of Concerns**
   - Content ≠ Design ≠ Rendering
   - Jede Schicht ist unabhängig austauschbar

2. **Schema-First Development**
   - Zod Schemas als Single Source of Truth
   - Types werden automatisch inferiert
   - Runtime Validation für externe Daten

3. **Composition over Inheritance**
   - Module komponieren sich aus Fields und Slots
   - Keine tiefen Vererbungshierarchien
   - Plugin-Architektur mit Registry

4. **Immutability & Functional Updates**
   - Keine direkten Mutations
   - Funktionale Updates (`updateTokenSet(fn)`)
   - Predictable State für bessere Debugging-Erfahrung

5. **Progressive Enhancement**
   - Inline Storage als Basis (funktioniert überall)
   - Backend Storage als Enhancement (Enterprise Features)
   - Graceful Degradation bei fehlenden Features

6. **Developer Experience First**
   - TypeScript Strict Mode für vollständige Type Safety
   - Template-Dateien für schnelles Onboarding
   - Detaillierte Fehlerberichte (Zod, TypeScript)

7. **Performance by Default**
   - Svelte 5 Compilation (keine Runtime-Overhead)
   - Tree-Shaking (ungenutzte Module entfernt)
   - Lazy Loading (Media Library, Dynamic Imports)

8. **Security by Design**
   - Zod Validation verhindert ungültige Daten
   - ProseMirror-Dokumente verhindern XSS
   - API Keys über Environment Variables

## Nächste Schritte

Für detaillierte Informationen zu einzelnen Architektur-Elementen siehe:

- **[Baustein-Sicht (Kapitel 5)](./05-building-block-view)** - Detaillierte Package-Struktur und Komponenten
- **[Laufzeitsicht (Kapitel 6)](./06-runtime-view)** - Ablaufdiagramme und Interaktionsszenarien
- **[Verteilungssicht (Kapitel 7)](./07-deployment-view)** - Deployment-Topologien und Infrastruktur
- **[Querschnittliche Konzepte (Kapitel 8)](./08-crosscutting-concepts)** - Übergreifende Architektur-Aspekte
- **[Architekturentscheidungen (Kapitel 9)](./09-architecture-decisions)** - ADRs mit Kontext und Konsequenzen
