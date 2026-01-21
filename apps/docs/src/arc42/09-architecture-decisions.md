---
title: "Architekturentscheidungen"
description: "Wichtige Architekturentscheidungen und deren Begründung"
---

# Architekturentscheidungen

Dieses Kapitel dokumentiert die zentralen Architekturentscheidungen des UJL Frameworks nach dem arc42-Standard. Jede Entscheidung wird mit Kontext, Begründung und Konsequenzen beschrieben.

## 9.1 ADR-001: Strikte Trennung von Content (UJLC) und Design (UJLT)

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Traditionelle Web-Technologien (HTML/CSS) trennen technisch Content und Styling, aber in der Praxis können Redakteure durch inline-Styles oder falsche CSS-Klassen das Corporate Design brechen. Brand Compliance und Accessibility sind nicht architektonisch garantiert.

### Entscheidung

UJL implementiert eine strikte Trennung auf höherer Abstraktionsebene:

- **UJLC-Dokumente** (`.ujlc.json`): Enthalten ausschließlich strukturierte Content-Daten in Modulen, Feldern und Slots. Keine Design-Informationen.
- **UJLT-Dokumente** (`.ujlt.json`): Enthalten zentral verwaltete Design-Tokens (Farben, Typografie, Spacing, Radius). Keine Content-Daten.
- **Composer**: Kombiniert beide Dokumente zur Laufzeit zu einem Abstract Syntax Tree (AST).

**Technische Umsetzung:**

```typescript
// packages/types/src/ujl-content.ts
export const UJLCDocumentSchema = z.object({
	ujlc: z.object({
		meta: UJLCMetaSchema,
		media: z.record(z.string(), UJLCMediaEntrySchema),
		root: z.array(z.lazy(() => UJLCModuleObjectSchema)),
	}),
});

// packages/types/src/ujl-theme.ts
export const UJLTDocumentSchema = z.object({
	ujlt: z.object({
		tokens: UJLTTokenSetSchema, // Farben, Typografie, Spacing
	}),
});
```

### Begründung

- **Brand-Compliance by Design**: Redakteure können Design-Regeln nicht brechen, da sie keine Design-Informationen bearbeiten
- **Accessibility Guaranteed**: WCAG-konforme Strukturen sind im Modulsystem architektonisch verankert
- **Zentrale Theme-Verwaltung**: Ein Theme für alle Dokumente, konsistente CI/CD
- **AI-native**: Strukturierte JSON-Daten sind optimal für LLMs, die gegen Schemas validiert werden
- **Versionierung**: Content und Design können unabhängig versioniert werden

### Konsequenzen

**Positiv:**

- Garantierte Markenkonsistenz
- Zentrale Theme-Updates wirken sofort auf alle Dokumente
- Vereinfachte Content-Erstellung für Redakteure
- Bessere AI-Integration durch strukturierte Daten

**Negativ:**

- Weniger Flexibilität für individuelle Design-Anpassungen pro Dokument
- Komplexere Architektur im Vergleich zu traditionellem HTML/CSS
- Erfordert initiales Setup eines Theme-Systems

---

## 9.2 ADR-002: Modulares Plugin-System mit Registry Pattern

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Das Framework muss erweiterbar sein, ohne die Kernfunktionalität zu gefährden. Entwickler sollen eigene Module hinzufügen können, die nahtlos in das System integriert werden.

### Entscheidung

Implementierung eines **Module Registry Pattern** mit abstrakter `ModuleBase`-Klasse:

```typescript
// packages/core/src/modules/base.ts
export abstract class ModuleBase {
	abstract readonly name: string;
	abstract readonly label: string;
	abstract readonly description: string;
	abstract readonly category: ComponentCategory;
	abstract readonly tags: readonly string[];
	abstract readonly icon: string;
	abstract readonly fields: FieldSet;
	abstract readonly slots: SlotSet;

	abstract compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode;
}

// packages/core/src/modules/registry.ts
export class ModuleRegistry {
	registerModule(module: ModuleBase): void;
	getModule(name: string): AnyModule | undefined;
	getAllModules(): AnyModule[];
	createModuleFromType(type: string, id: string): UJLCModuleObject;
}
```

**Field System** mit `FieldBase<ValueT, ConfigT>`:

```typescript
// packages/core/src/fields/base.ts
export abstract class FieldBase<ValueT, ConfigT> {
	abstract validate(raw: UJLCFieldObject): raw is ValueT;
	abstract fit(value: ValueT): ValueT;
	parse(raw: UJLCFieldObject): ValueT; // Kombination aus validate + fit
	serialize(value: ValueT): UJLCFieldObject;
}
```

### Begründung

- **Type Safety**: TypeScript Generics für vollständige Typsicherheit
- **Validation**: Zod-Schemas stellen Datenintegrität sicher
- **Extensibility**: Neue Module ohne Änderung des Core-Codes
- **Composition over Inheritance**: Module komponieren sich aus Fields und Slots
- **Single Source of Truth**: Registry als zentrale Verwaltung

### Konsequenzen

**Positiv:**

- Einfache Erweiterung durch Drittanbieter
- Vollständige Typsicherheit zur Compile-Zeit
- Runtime-Validierung durch Zod
- Klare Schnittstellen durch abstrakte Klassen

**Negativ:**

- Mehr Boilerplate-Code für neue Module
- Lernkurve für das Modulsystem
- Template-Dateien erforderlich für Konsistenz

**Beispiel-Implementierung:**

```typescript
// Eigenes Custom Module
class CustomModule extends ModuleBase {
	readonly name = "custom-module";
	readonly label = "Custom Module";
	readonly fields = [{ key: "title", field: new TextField({ label: "Title", default: "" }) }];
	readonly slots = [{ key: "content", slot: new Slot({ label: "Content", max: 5 }) }];

	compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		// Implementation
	}
}

// Registrierung
composer.registerModule(new CustomModule());
```

---

## 9.3 ADR-003: Adapter Pattern für Framework-Agnostisches Rendering

### Status

✅ Akzeptiert und umgesetzt

### Kontext

UJL soll in verschiedenen Frameworks und Umgebungen einsetzbar sein (Svelte, React, Vue, Vanilla JS). Die Core-Logik soll unabhängig vom Rendering-Framework bleiben.

### Entscheidung

Implementierung eines **Adapter Pattern** mit standardisierter Schnittstelle:

```typescript
// packages/types/src/ast.ts
export type UJLAdapter<OutputType = string, OptionsType = undefined> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: OptionsType
) => OutputType;
```

**Implementierte Adapter:**

1. **Svelte Adapter** (`adapter-svelte`):

```typescript
export const svelteAdapter: UJLAdapter<MountedComponent, SvelteAdapterOptions> = (
	node,
	tokenSet,
	options
) => {
	const instance = mount(AdapterRoot, {
		target: resolveTarget(options.target),
		props: { node, tokenSet, mode: options.mode, showMetadata, eventCallback },
	});
	return { instance, unmount: async () => unmount(instance) };
};
```

2. **Web Adapter** (`adapter-web`):

```svelte
<!-- packages/adapter-web/src/components/UJLContent.svelte -->
<svelte:options customElement={{ tag: 'ujl-content' }} />
<script>
  import { AdapterRoot } from '@ujl-framework/adapter-svelte';
  export let node: UJLAbstractNode;
  export let tokenSet: UJLTTokenSet;
</script>
<AdapterRoot {node} {tokenSet} />
```

### Begründung

- **Separation of Concerns**: Core-Logik unabhängig von UI-Framework
- **Multiple Targets**: Ein AST, viele Rendering-Ziele
- **Framework-Agnostic**: Web Components für universelle Nutzung
- **Maintainability**: Adapter erben automatisch neue AST-Node-Typen
- **Progressive Enhancement**: Neue Adapter ohne Core-Änderungen

### Konsequenzen

**Positiv:**

- Flexibilität bei Framework-Wahl
- Web Components für universelle Einsetzbarkeit
- Automatische Feature-Vererbung (`adapter-web` → `adapter-svelte`)
- Einfache Erweiterung um neue Adapter (PDF, ...)

**Negativ:**

- Mehrfachimplementierung für jeden Adapter
- Unterschiedliche Bundle-Größen je nach Adapter
- Adapter müssen synchron gehalten werden

**Komponenten-Hierarchie:**

```
AdapterRoot.svelte                    # Entry Point + Theme Context
  └─ ASTNode.svelte                   # Router für Node-Typen
      ├─ nodes/Button.svelte
      ├─ nodes/Container.svelte
      ├─ nodes/Card.svelte
      ├─ nodes/Grid.svelte
      └─ ... (weitere Module)
```

---

## 9.4 ADR-004: Dual Media Storage Strategy (Inline vs. Backend)

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Verschiedene Anwendungsfälle erfordern unterschiedliche Media-Strategien:

- **Standalone-Dokumente**: Sollen portabel sein ohne externe Abhängigkeiten
- **Enterprise CMS**: Zentrale Media-Verwaltung mit Metadaten und Versionierung

### Entscheidung

Implementierung einer **Dual Storage Strategy** mit Resolver Pattern:

```typescript
// packages/core/src/media/library.ts
export class MediaLibrary {
	constructor(initialMedia: Record<string, MediaLibraryEntry>, resolver?: MediaResolver);

	async resolve(id: string | number): Promise<UJLImageData | null>;
}

export interface MediaResolver {
	resolve(id: string): Promise<string | null>; // Returns data URL
}
```

**Storage Modes:**

1. **Inline Storage** (Default):

```json
{
	"ujlc": {
		"meta": {
			"media_library": { "storage": "inline" }
		},
		"media": {
			"media-001": {
				"id": "media-001",
				"storage": "inline",
				"data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
			}
		}
	}
}
```

2. **Backend Storage** (Payload CMS):

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

**Payload CMS Integration:**

```typescript
// services/media/src/collections/Media.ts
export const Media: CollectionConfig = {
	slug: "media",
	upload: {
		imageSizes: [
			{ name: "small", width: 500 },
			{ name: "medium", width: 750 },
			{ name: "large", width: 1000 },
			{ name: "xlarge", width: 1920 },
		],
		formatOptions: { format: "webp" },
		focalPoint: true,
	},
	fields: [
		{ name: "title", type: "text", localized: true },
		{ name: "alt", type: "text", localized: true },
		{ name: "description", type: "textarea", localized: true },
		{ name: "author", type: "text" },
		{ name: "license", type: "text" },
		{ name: "tags", type: "array" },
	],
};
```

### Begründung

- **Flexibility**: Beide Strategien für unterschiedliche Use Cases
- **Portability**: Inline-Dokumente können ohne Backend verteilt werden
- **Scalability**: Backend-Storage für große Media-Libraries
- **Metadata**: Payload CMS bietet umfangreiche Metadaten-Verwaltung
- **Performance**: Lazy Resolution während Composition

### Konsequenzen

**Positiv:**

- Volle Portabilität mit Inline-Storage
- Enterprise-Features mit Backend-Storage
- Seamless switching zwischen Modi
- Responsive images mit Payload CMS

**Negativ:**

- Große Dokument-Dateien bei Inline-Storage
- Externe Abhängigkeit bei Backend-Storage
- Komplexere Setup-Prozedur für Backend

---

## 9.5 ADR-005: Zod-basierte Runtime Validation mit TypeScript Type Inference

### Status

✅ Akzeptiert und umgesetzt

### Kontext

UJL-Dokumente werden aus externen Quellen geladen (Dateien, CMS, AI-generiert). Reine TypeScript-Typen bieten nur Compile-Time-Sicherheit, keine Runtime-Validierung.

### Entscheidung

**Zod als Single Source of Truth** für Schemas mit Type Inference:

```typescript
// packages/types/src/ujl-content.ts
export const UJLCModuleObjectSchema = z.lazy(() =>
	z.object({
		type: z.string(),
		meta: UJLCModuleMetaSchema,
		fields: z.record(z.string(), UJLCFieldObjectSchema),
		slots: z.record(z.string(), z.array(UJLCModuleObjectSchema)), // Rekursiv
	})
);

// Type-Generierung aus Schema
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;

// Validator-Funktionen
export function validateUJLCDocument(data: unknown): UJLCDocument {
	return UJLCDocumentSchema.parse(data); // Throws on error
}

export function validateUJLCDocumentSafe(data: unknown) {
	return UJLCDocumentSchema.safeParse(data); // Returns Result<T, ZodError>
}
```

**Rekursive Typen mit `z.lazy()`:**

```typescript
// Ermöglicht unendliche Verschachtelung von Modulen
const UJLCModuleObjectSchema = z.lazy(() =>
	z.object({
		slots: z.record(z.string(), z.array(UJLCModuleObjectSchema)),
	})
);
```

### Begründung

- **Single Source of Truth**: Schema-Definition generiert Types
- **Runtime Safety**: Validierung beim Laden externer Daten
- **Error Messages**: Detaillierte Fehlermeldungen bei Validierung
- **Type Inference**: Automatische Type-Generierung aus Schemas
- **Recursive Structures**: Support für beliebig verschachtelte Module

### Konsequenzen

**Positiv:**

- Garantierte Datenintegrität zur Laufzeit
- Automatische Type-Synchronisation
- Bessere Developer Experience mit IDE-Support
- AI-generierte Dokumente können validiert werden

**Negativ:**

- Runtime-Overhead durch Validierung
- Bundle-Size durch Zod-Library
- Komplexere Schema-Definitionen

**CLI Tool für Validierung:**

```bash
# packages/types/src/cli.ts
pnpm run validate ./path/to/file.json

# Auto-detection von UJLC vs UJLT
# Detaillierte Fehlerberichte bei Validierung
```

---

## 9.6 ADR-006: Svelte 5 als primäres UI-Framework

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Wahl eines modernen UI-Frameworks für Crafter (Editor) und Adapter. Alternativen: React, Vue, Solid, Qwik.

### Entscheidung

**Svelte 5** mit folgenden Features:

```typescript
// packages/adapter-svelte/src/lib/adapter.ts
import { mount, unmount } from "svelte";

export const svelteAdapter = (node, tokenSet, options) => {
	const instance = mount(AdapterRoot, {
		target: resolveTarget(options.target),
		props: { node, tokenSet, mode: options.mode },
	});
	return { instance, unmount: async () => unmount(instance) };
};
```

**Svelte 5 Runes in Crafter:**

```svelte
<!-- packages/crafter/src/lib/components/app.svelte -->
<script lang="ts">
  let ujlcDocument = $state(initialDocument);
  let ujltDocument = $state(initialTheme);

  const ast = $derived.by(() => composer.compose(ujlcDocument));
  const tokenSet = $derived(ujltDocument.ujlt.tokens);
</script>
```

**Custom Elements für Web Adapter:**

```svelte
<!-- packages/adapter-web/src/components/UJLContent.svelte -->
<svelte:options customElement={{ tag: 'ujl-content' }} />
```

### Begründung

- **Performance**: Compiled Code, keine Virtual DOM
- **Bundle Size**: Kleinere Bundles als React/Vue
- **Reactivity**: Svelte 5 Runes bieten fine-grained reactivity
- **mount() API**: Programmatische Kontrolle über Component Lifecycle
- **Custom Elements**: Native Web Components Support
- **Developer Experience**: Weniger Boilerplate, bessere Lesbarkeit

### Konsequenzen

**Positiv:**

- Kleinste Bundle-Größe aller großen Frameworks
- Bessere Performance durch Compilation
- Einfache Custom Elements Generierung
- Fine-grained Reactivity mit Runes

**Negativ:**

- Kleinere Community als React
- Weniger Drittanbieter-Libraries
- Svelte 5 ist noch relativ neu (Runes-System)

**Alternative Frameworks erwogen:**

- **React**: Größere Bundle-Size, Virtual DOM overhead
- **Vue**: Gute Alternative, aber größerer Runtime
- **Solid**: Exzellente Performance, aber kleinere Community

---

## 9.7 ADR-007: Payload CMS für Media Management Backend

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Backend-Storage für Media Library erfordert ein Content Management System mit Bild-Upload, Metadaten-Verwaltung und API.

### Entscheidung

**Payload CMS 3.69** als Backend-Service:

```typescript
// services/media/src/payload.config.ts
export default buildConfig({
	collections: [Users, Media],
	admin: { user: Users.slug },
	typescript: { outputFile: path.resolve(__dirname, "payload-types.ts") },
	db: postgresAdapter({
		pool: { connectionString: process.env.DATABASE_URI },
	}),
});
```

**Media Collection mit Image Processing:**

```typescript
// services/media/src/collections/Media.ts
export const Media: CollectionConfig = {
	slug: "media",
	upload: {
		imageSizes: [
			{ name: "thumbnail", width: 400, height: 300 },
			{ name: "small", width: 500, height: null },
			{ name: "medium", width: 750 },
			{ name: "large", width: 1000 },
			{ name: "xlarge", width: 1920 },
		],
		formatOptions: { format: "webp" },
		focalPoint: true,
		crop: true,
	},
	access: {
		read: () => true, // Public read
		create: isAuthenticated,
		update: isAuthenticated,
		delete: isAuthenticated,
	},
};
```

### Begründung

- **TypeScript-First**: Generiert Types aus Schema
- **Headless CMS**: RESTful API out-of-the-box
- **Image Processing**: WebP-Konvertierung, responsive sizes
- **Focal Point**: Smart cropping für responsive images
- **i18n Support**: Mehrsprachige Metadaten
- **Self-Hosted**: Keine Vendor Lock-in
- **PostgreSQL**: Robuste, skalierbare Datenbank

### Konsequenzen

**Positiv:**

- Professionelle Media-Verwaltung
- Automatische Bild-Optimierung
- RESTful API mit Filtering/Sorting
- Metadata-Management (Alt-Text, Lizenz, Tags)
- Multi-Language Support

**Negativ:**

- Externe Service-Abhängigkeit
- Setup-Komplexität (Docker, PostgreSQL)
- Hosting-Kosten für Backend

**Docker Setup:**

```yaml
# services/media/docker-compose.yml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  payload:
    build: .
    depends_on: [postgres]
    environment:
      DATABASE_URI: postgres://postgres:${POSTGRES_PASSWORD}@postgres:5432/ujl-media
```

**Alternative CMS erwogen:**

- **Strapi**: Ähnlich, aber schwächeres TypeScript-Support
- **Custom Backend**: Zu viel Entwicklungsaufwand

---

## 9.8 ADR-008: TipTap/ProseMirror für Rich Text Editing

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Rich Text Editing erfordert eine strukturierte, serialisierbare Darstellung. HTML-Strings sind schwer zu validieren und können unsicher sein.

### Entscheidung

**TipTap (ProseMirror-Wrapper)** mit gemeinsamer Schema-Konfiguration:

```typescript
// packages/core/src/tiptap-schema.ts
export const ujlRichTextExtensions = [
	StarterKit.configure({
		// Serialisierbare Extensions
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

		// UI-Extensions deaktiviert (nicht serialisierbar)
		undoRedo: false,
		dropcursor: false,
		gapcursor: false,
	}),
];
```

**ProseMirror Document Type:**

```typescript
// packages/types/src/prosemirror.ts
export type ProseMirrorDocument = {
	type: "doc";
	content: ProseMirrorNode[];
};

export type ProseMirrorNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: ProseMirrorMark[];
	text?: string;
};
```

**SSR-Safe Serialization:**

```typescript
// packages/adapter-svelte/src/lib/components/ui/rich-text/prosemirror.ts
export function prosemirrorToHtml(doc: ProseMirrorDocument): string {
	if (!doc || doc.type !== "doc") return "";
	return serializeNodes(doc.content);
}

function serializeNode(node: ProseMirrorNode): string {
	switch (node.type) {
		case "paragraph":
			return `<p>${serializeNodes(node.content)}</p>`;
		case "heading":
			return `<h${node.attrs?.level}>${serializeNodes(node.content)}</h${node.attrs?.level}>`;
		case "text":
			return applyMarks(escapeHtml(node.text), node.marks);
		// ...
	}
}
```

### Begründung

- **Structured Data**: JSON-Dokumente statt HTML-Strings
- **Type Safety**: ProseMirror Types validierbar mit Zod
- **WYSIWYG**: Gleiche Schema in Editor und Renderer
- **SSR-Safe**: Synchrone Serialisierung ohne Browser-APIs
- **Extensibility**: Neue Nodes/Marks einfach hinzufügbar
- **AI-Friendly**: Strukturierte JSON-Daten für LLMs

### Konsequenzen

**Positiv:**

- Garantierte WYSIWYG-Konsistenz
- Sicherer als HTML-Strings (kein XSS)
- Validierbare Struktur mit Zod
- Server-Side Rendering möglich

**Negativ:**

- Komplexere Schema-Verwaltung
- Größere Bundle-Size durch ProseMirror
- Lernkurve für ProseMirror-Konzepte

**Editor Integration im Crafter:**

```svelte
<!-- packages/crafter/src/lib/components/ui/richtext-input/richtext-input.svelte -->
<script>
  const editor = new Editor({
    element: editorElement,
    extensions: ujlRichTextExtensions,  // Shared schema
    content: value ?? EMPTY_DOCUMENT,
    onUpdate: ({ editor: e }) => {
      const json = e.getJSON() as ProseMirrorDocument;
      onChange(json);  // Serialized to JSON
    }
  });
</script>
```

**Alternative Editoren erwogen:**

- **Quill**: Weniger strukturiert, Delta-Format
- **Lexical**: Modern, aber weniger ausgereift
- **ContentEditable**: Zu low-level, Cross-Browser-Probleme

---

## 9.9 ADR-009: OKLCH Farbraum für Design Tokens

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Traditionelle Farbsysteme (RGB, HSL) sind nicht perzeptuell uniform. Farb-Shades mit gleichem Helligkeits-Delta sehen unterschiedlich hell aus.

### Entscheidung

**OKLCH (Oklab Lightness Chroma Hue)** als Farbraum:

```typescript
// packages/types/src/ujl-theme.ts
export const UJLTColorSchema = z.object({
	l: z.number().min(0).max(100), // Lightness (0-100)
	c: z.number().min(0), // Chroma (0+)
	h: z.number().min(0).max(360), // Hue (0-360)
});

export const UJLTColorSetSchema = z.object({
	50: UJLTColorSchema,
	100: UJLTColorSchema,
	// ... bis 950
	950: UJLTColorSchema,
});
```

**Color Palette Generierung:**

```typescript
// packages/crafter/src/lib/utils/colors/generator.ts
export function generateColorPalette(baseColor: OklchColor): ColorPalette {
	const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

	return shades.reduce((palette, shade) => {
		palette[shade] = {
			l: calculateLightness(shade), // Perzeptuell uniform
			c: baseColor.c,
			h: baseColor.h,
		};
		return palette;
	}, {});
}
```

**Foreground Color Resolution:**

```typescript
// packages/types/src/resolvers.ts
export function resolveForegroundColor(
	palette: UJLTColorSet,
	bgFlavor: UJLTFlavor,
	fgFlavor: UJLTFlavor,
	mode: UJLTThemeMode
): UJLTColor {
	const bgColor = palette[bgFlavor][mode === "light" ? "50" : "950"];
	const contrastRatio = calculateContrast(bgColor, fgColor);

	// WCAG AA conformance (4.5:1 für Text)
	return ensureContrast(fgColor, bgColor, 4.5);
}
```

### Begründung

- **Perceptual Uniformity**: Gleiche L-Deltas = gleiche wahrgenommene Helligkeit
- **Better Contrast**: Präzisere Kontrast-Berechnungen
- **Color Consistency**: Farb-Shades sehen harmonischer aus
- **Accessibility**: Verlässliche WCAG-Kontrast-Berechnungen
- **Future-Proof**: CSS Color Level 4 Standard

### Konsequenzen

**Positiv:**

- Bessere Accessibility durch präzise Kontraste
- Harmonischere Farbpaletten
- Mathematisch korrekte Farb-Interpolation
- Native Browser-Support (CSS `oklch()`)

**Negativ:**

- Komplexere Berechnungen als HSL
- Weniger bekannt als RGB/HSL
- Fallback für ältere Browser nötig

**CSS Output:**

```css
:root {
	--color-primary-50: oklch(97% 0.01 250);
	--color-primary-500: oklch(60% 0.15 250);
	--color-primary-950: oklch(20% 0.05 250);
}
```

**Alternative Farbräume erwogen:**

- **HSL**: Nicht perzeptuell uniform
- **RGB**: Keine intuitive Helligkeits-Kontrolle
- **LCH**: Ähnlich OKLCH, aber weniger akkurat

---

## 9.10 ADR-010: pnpm Workspaces + Changesets für Monorepo

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Verwaltung mehrerer interdependenter Packages erfordert ein robustes Monorepo-System mit koordinierter Versionierung.

### Entscheidung

**pnpm Workspaces** mit **Changesets** für Version Management:

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
  - "services/*"
```

**Workspace Protocol für interne Dependencies:**

```json
// packages/crafter/package.json
{
	"dependencies": {
		"@ujl-framework/core": "workspace:*",
		"@ujl-framework/ui": "workspace:*",
		"@ujl-framework/types": "workspace:*"
	}
}
```

**Changesets Konfiguration:**

```json
// .changeset/config.json
{
	"changelog": "@changesets/changelog-github",
	"commit": false,
	"fixed": [
		[
			"@ujl-framework/core",
			"@ujl-framework/ui",
			"@ujl-framework/crafter",
			"@ujl-framework/adapter-svelte",
			"@ujl-framework/adapter-web",
			"@ujl-framework/types",
			"@ujl-framework/examples",
			"ujl-demo",
			"@ujl-framework/docs",
			"@ujl-framework/media"
		]
	],
	"access": "public",
	"baseBranch": "develop"
}
```

**Workflow:**

```bash
# Feature Branch
pnpm changeset           # Create .changeset/*.md

# develop Branch
pnpm version-packages    # Update versions + CHANGELOG
git commit -m "Version packages"
# Manual publish when ready
```

### Begründung

- **pnpm Efficiency**: Fastest package manager, disk-space efficient
- **Workspace Protocol**: Type-safe local dependencies
- **Changesets**: Koordinierte Versionierung aller Packages
- **Fixed Versioning**: Alle Packages synchron versioniert
- **Changelog Generation**: Automatische CHANGELOG.md Updates

### Konsequenzen

**Positiv:**

- Effizientes Dependency Management
- Koordinierte Releases aller Packages
- Automatische Changelog-Generierung
- Type-Safety über Package-Grenzen

**Negativ:**

- Komplexe Build-Dependency-Chains
- Lernkurve für Changesets
- Fixed Versioning erhöht Major-Versions schneller

**Build Dependency Chain:**

```
types:build
  ↓
core:build
  ↓
ui:build
  ↓
adapter-svelte:build
  ↓
adapter-web:build
  ↓
demo:build
```

**GitLab CI/CD Integration:**

```yaml
# .gitlab-ci.yml
install:
  script:
    - corepack enable
    - corepack prepare pnpm@10.26.2 --activate
    - pnpm install --frozen-lockfile
  cache:
    - key: $CI_COMMIT_REF_SLUG
      paths:
        - node_modules/
        - .pnpm-store/

build:
  script:
    - pnpm run build
  artifacts:
    paths:
      - apps/docs/.vitepress/dist/
```

**Alternative Monorepo-Tools erwogen:**

- **npm Workspaces**: Langsamer, weniger Features
- **Yarn Workspaces**: Gute Alternative, aber pnpm effizienter
- **Turborepo**: Zusätzliche Komplexität, pnpm ausreichend
- **Nx**: Overkill für aktuellen Scope

---

## 9.11 ADR-011: Playwright für E2E Testing des Crafters

### Status

✅ Akzeptiert und umgesetzt

### Kontext

Der UJL Crafter ist eine komplexe SvelteKit-Anwendung mit Drag & Drop, Tree-Navigation und Echtzeit-Preview. Unit-Tests decken nicht alle Interaktionen ab.

### Entscheidung

**Playwright** für End-to-End Testing:

```typescript
// packages/crafter/playwright.config.ts
export default defineConfig({
	testDir: "./e2e",
	timeout: 30000,
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : 2,
	reporter: process.env.CI ? ["list", "junit"] : ["html", "list"],

	webServer: {
		command: "pnpm run dev",
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: { PUBLIC_TEST_MODE: "true" },
	},

	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
});
```

**Test Attributes für stabile Selektoren:**

```typescript
// packages/crafter/src/lib/utils/test-attrs.ts
export function testId(id: string) {
	return import.meta.env.PUBLIC_TEST_MODE === "true" ? { "data-testid": id } : {};
}

export function testAttrs(attrs: Record<string, string>) {
	return import.meta.env.PUBLIC_TEST_MODE === "true"
		? Object.fromEntries(Object.entries(attrs).map(([k, v]) => [`data-${k}`, v]))
		: {};
}
```

**Beispiel E2E Test:**

```typescript
// packages/crafter/e2e/editor.test.ts
test("navigation tree is visible", async ({ page }) => {
	await page.goto("/");

	const navTree = page.locator('[data-testid="nav-tree"]');
	await expect(navTree).toBeVisible();

	const rootNode = navTree.locator('[data-tree-node-id="__root__"]');
	await expect(rootNode).toContainText("Document");
});

test("can select node by clicking in preview", async ({ page }) => {
	await page.goto("/");

	// Click element in preview
	await page.locator('[data-ujl-module-id="text-001"]').click();

	// Check URL parameter
	await expect(page).toHaveURL(/selected=text-001/);

	// Check tree selection
	const treeNode = page.locator('[data-tree-node-id="text-001"]');
	await expect(treeNode).toHaveAttribute("data-selected", "true");
});
```

### Begründung

- **Real Browser Testing**: Chromium, Firefox, WebKit support
- **Stable Selectors**: `data-testid` ohne Production-Overhead
- **Screenshot/Video**: Debugging fehlgeschlagener Tests
- **CI/CD Integration**: GitLab CI mit Artifacts
- **Cross-Browser**: Multi-Browser-Testing möglich

### Konsequenzen

**Positiv:**

- Vollständige User-Flow-Abdeckung
- Screenshot-basiertes Debugging
- Stabile Selektoren mit `data-testid`
- CI/CD Integration

**Negativ:**

- Längere Test-Ausführungszeit als Unit-Tests
- Flakiness bei komplexen Interaktionen
- Setup-Komplexität

**Getestete User Flows:**

1. **Page Setup** (`page-setup.test.ts`):
   - Disclaimer dialog
   - Layout structure (sidebars, preview)
   - Mode switcher

2. **Editor** (`editor.test.ts`):
   - Navigation tree visibility
   - Node expansion/collapse
   - Node selection

3. **Preview** (`preview.test.ts`):
   - Component rendering
   - Click-to-select
   - Tree synchronization

4. **Typography & Spacing** (`typography-spacing.test.ts`):
   - Designer mode
   - Token editing
   - Font selection

5. **Sidebar Right** (`sidebar-right.test.ts`):
   - Export/Import dropdowns
   - Property editing

**Alternative Testing-Frameworks erwogen:**

- **Cypress**: Gute Alternative, aber langsamer als Playwright
- **Testing Library**: Nur für Unit-Tests, nicht E2E
- **Selenium**: Veraltet, Playwright moderner

---

## 9.12 Zusammenfassung: Architektur-Trade-offs

| Entscheidung           | Vorteil                     | Nachteil                 | Akzeptierter Trade-off                |
| ---------------------- | --------------------------- | ------------------------ | ------------------------------------- |
| **UJLC/UJLT Trennung** | Brand Compliance garantiert | Weniger Flexibilität     | Markenkonsistenz wichtiger            |
| **Module Registry**    | Erweiterbar, typsicher      | Mehr Boilerplate         | Type Safety rechtfertigt Aufwand      |
| **Adapter Pattern**    | Framework-agnostisch        | Mehrfach-implementierung | Flexibilität wichtiger                |
| **Dual Media Storage** | Portabilität + Enterprise   | Komplexität              | Beide Use Cases essentiell            |
| **Zod Validation**     | Runtime Safety              | Performance Overhead     | Sicherheit wichtiger                  |
| **Svelte 5**           | Performance, Bundle Size    | Kleinere Community       | Technische Vorteile überwiegen        |
| **Payload CMS**        | Feature-reich, TypeScript   | Setup-Komplexität        | Professionelle Media-Verwaltung nötig |
| **TipTap/ProseMirror** | Strukturiert, WYSIWYG       | Lernkurve, Bundle Size   | Strukturierte Daten essentiell        |
| **OKLCH Farbraum**     | Bessere Accessibility       | Komplexer als HSL        | Accessibility nicht verhandelbar      |
| **pnpm + Changesets**  | Koordinierte Releases       | Komplexe Build-Chain     | Monorepo-Effizienz wichtig            |
| **Playwright E2E**     | Vollständige Abdeckung      | Längere Test-Zeiten      | User Flows müssen getestet werden     |

---

## 9.13 Offene Architekturentscheidungen

Folgende Entscheidungen sind noch nicht final getroffen:

### 9.13.1 Lizenzmodell

**Status:** 🔄 In Diskussion

**Optionen:**

- MIT License (maximal permissiv)
- Apache 2.0 (Patent-Schutz)
- AGPL-3.0 (Copyleft für SaaS)

**Tendenz:** MIT License

### 9.13.2 Semantic Search mit pgvector

**Status:** 📋 TODO

**Kontext:** Media Library könnte Embeddings für semantische Suche speichern.

**Technologie:** pgvector Extension für PostgreSQL

### 9.13.3 Weitere Adapter

**Status:** 🔮 Zukunft

**Kontext:** Aktuell nur Svelte + Web Adapter implementiert.

**Offene Fragen:**

- Community-Contributions vs. offiziell maintained?
- Adapter-API ausreichend dokumentiert?

---

_Letzte Aktualisierung: 2026-01-10_
