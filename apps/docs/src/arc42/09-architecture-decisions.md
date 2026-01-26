---
title: "Architekturentscheidungen"
description: "Wichtige Architekturentscheidungen und deren Begründung"
---

# Architekturentscheidungen

Die folgenden Entscheidungen beschreiben die wesentlichen Architektur-Weichenstellungen von UJL und ihre Konsequenzen für Erweiterbarkeit, Validierung, Rendering und Betrieb. Jede Entscheidung folgt dem Industry-Standard-ADR-Format mit Status, Kontext, Entscheidung, Konsequenzen und betrachteten Alternativen.

Im Mittelpunkt stehen die Trennung von Content und Theme, die AST-Adapter-Architektur, das Registry-basierte Modulsystem, die Bildspeicherung (Inline vs. Backend) sowie die Tooling- und Technologieentscheidungen rund um Svelte, Zod und Monorepo-Management.

## ADR-Übersicht

| ADR     | Titel                                                      | Kategorie           | Status   |
| ------- | ---------------------------------------------------------- | ------------------- | -------- |
| ADR-001 | Strikte Trennung von Content (UJLC) und Design (UJLT)      | Kern-Architektur    | ACCEPTED |
| ADR-002 | Plugin-System mit Registry Pattern                         | Kern-Architektur    | ACCEPTED |
| ADR-003 | Adapter Pattern für Framework-Agnostisches Rendering       | Kern-Architektur    | ACCEPTED |
| ADR-004 | Dual Image Storage Strategy (Inline vs. Backend)           | Content-Management  | ACCEPTED |
| ADR-005 | Zod für Runtime Validation mit Type Inference              | Validierung & Types | ACCEPTED |
| ADR-006 | Svelte als primäres UI-Framework                           | Technologie-Stack   | ACCEPTED |
| ADR-007 | Payload CMS für Library Service                            | Infrastruktur       | ACCEPTED |
| ADR-008 | TipTap/ProseMirror für Structured Rich Text                | Content-Management  | ACCEPTED |
| ADR-009 | OKLCH Farbraum für Design Tokens                           | Design-System       | ACCEPTED |
| ADR-010 | pnpm Workspaces + Changesets für Monorepo                  | DevOps & Tooling    | ACCEPTED |
| ADR-011 | Playwright für E2E Testing des Crafters                    | Testing             | ACCEPTED |
| ADR-012 | GitLab CI/CD mit Build-, Test-, Quality- und Deploy-Stages | DevOps & Tooling    | ACCEPTED |
| ADR-013 | VitePress für technische Dokumentation                     | Dokumentation       | ACCEPTED |
| ADR-014 | Vitest für Unit Tests                                      | Testing             | ACCEPTED |
| ADR-015 | TypeScript Strict Mode für Maximum Type Safety             | Validierung & Types | ACCEPTED |
| ADR-016 | Image Library Abstraction mit Provider-Interface           | Content-Management  | ACCEPTED |
| ADR-017 | Embedding Strategy für KI-gestützte Content-Suche          | Infrastruktur       | PROPOSED |
| ADR-018 | Svelte Runes für reaktive State Management                 | Technologie-Stack   | ACCEPTED |
| ADR-019 | Strukturierter Content statt HTML-Strings                  | Content-Management  | ACCEPTED |
| ADR-020 | Foreground-Mapping für WCAG-konforme Kontraste             | Design-System       | ACCEPTED |
| ADR-021 | Monorepo Package Layering (Packages → Apps → Docs)         | Architektur         | ACCEPTED |
| ADR-022 | Test Attributes ohne Production Overhead                   | Testing             | ACCEPTED |

## 9.1 ADR-001: Strikte Trennung von Content (UJLC) und Design (UJLT)

### Status

**ACCEPTED** - Implementiert seit Projektbeginn

### Kontext

Traditionelle Web-Technologien wie HTML und CSS ermöglichen es Redakteur:innen, Design-Regeln durch inline-Styles, CSS-Klassen oder direktes Markup zu umgehen. Dies führt zu Brand-Inkonsistenzen, da jedes Dokument visuell anders aussehen kann, zu Accessibility-Problemen durch inkonsistente Kontraste und Typografie, zu erhöhtem Wartungsaufwand bei Theme-Updates sowie zu Governance-Overhead durch notwendige manuelle Review-Prozesse. Die zentrale Anforderung war, Brand-Compliance und Accessibility architektonisch durchzusetzen und nicht nur durch organisatorische Prozesse zu steuern.

### Entscheidung

UJL trennt Content und Design auf Datenebene durch zwei separate Dokumentformate. UJLC (Content Document) enthält ausschließlich strukturierte Content-Daten in Form von Modulen mit typisierten Fields und Slots:

```json
{
  "ujlc": {
    "meta": { "id": "doc-001", "title": "Landing Page" },
    "images": { ... },
    "root": [
      {
        "type": "text",
        "meta": { "id": "m1" },
        "fields": { "content": { ... } },
        "slots": {}
      }
    ]
  }
}
```

UJLT (Theme Document) enthält ausschließlich Design-Tokens wie Farben im OKLCH-Farbraum, Typografie, Spacing und Radius:

```json
{
  "ujlt": {
    "meta": { "id": "theme-corporate" },
    "tokens": {
      "colors": { "primary": { "500": { "l": 0.546, "c": 0.245, "h": 262.881 } } },
      "typography": { ... },
      "spacing": 4,
      "radius": 12
    }
  }
}
```

Der Composer kombiniert beide Dokumenttypen zur Laufzeit zu einem Abstract Syntax Tree:

```typescript
const ast = await composer.compose(ujlcDocument, ujltDocument);
```

### Konsequenzen

#### Vorteile

Die architektonische Trennung erzwingt technisch, dass Redakteur:innen Design-Regeln nicht brechen können. Theme-Updates wirken sofort global auf alle Dokumente, ohne dass manuelle Anpassungen in einzelnen Dokumenten nötig sind. Die Governance erfolgt über Schema-Validierung statt über manuelle Review-Prozesse, was den Aufwand reduziert und Fehler vermeidet. Die klare Verantwortlichkeitstrennung zwischen Designern (Theme-Pflege) und Redakteuren (Content-Pflege) vereinfacht Workflows. Ein Theme kann für viele Dokumente wiederverwendet werden, was Konsistenz über verschiedene Projekte hinweg ermöglicht.

#### Nachteile

Die strikte Trennung reduziert die Flexibilität für per-Dokument-Styling, sodass individuelle Design-Anpassungen nicht möglich sind. Nutzer müssen das Konzept der Trennung verstehen, was eine gewisse Lernkurve mit sich bringt. Der Setup-Overhead durch zwei separate Dateien statt einer einzigen ist höher. Edge Cases, die in traditionellen Systemen durch CSS-Overrides gelöst würden, erfordern in UJL die Implementierung neuer Module.

### Betrachtete Alternativen

CSS-in-JS-Lösungen wie Styled Components wurden verworfen, da Styling zur Laufzeit die architektonische Durchsetzung untergräbt und Redakteure Styles überschreiben könnten. Tailwind-Klassen im Content wurden ausgeschlossen, da Redakteure CSS-Wissen benötigen würden und die Fehleranfälligkeit bei falschen Klassen hoch ist. HTML/CSS als Content-Format ist schwer zu validieren, birgt XSS-Risiken und bietet keine strukturierte Datengrundlage. Theme-Varianten pro Dokument wären ein Kompromiss zwischen Flexibilität und Konsistenz gewesen, hätten aber die Komplexität erhöht ohne klaren Gewinn zu bringen.

### Verwandte Entscheidungen

Die Entscheidung steht in direktem Zusammenhang mit ADR-005 zur Schema-Validierung für UJLC und UJLT sowie mit ADR-009 zur Verwendung des OKLCH-Farbraums für Theme-Tokens.

## 9.2 ADR-002: Modulares Plugin-System mit Registry Pattern

### Status

**ACCEPTED** - Implementiert

### Kontext

Ein Framework, das nur Built-in-Module unterstützt, kann nicht für verschiedene Use Cases genutzt werden. Gleichzeitig darf Erweiterbarkeit nicht den Core destabilisieren oder zu Breaking Changes bei jedem neuen Modul führen. Die Anforderungen umfassten, dass Teams eigene Module hinzufügen können, Built-in-Module ersetzbar sein sollen, der Datenvertrag (UJLC-Schema) stabil bleiben muss und Module validierbare Fields und Slots definieren sollen.

### Entscheidung

UJL behandelt Module als Plugins, die zur Laufzeit über eine Registry registriert werden. Die Implementierung erfolgt über eine ModuleBase-Klasse, die Module erweitern:

```typescript
class CustomModule extends ModuleBase {
	readonly name = "custom-card";
	readonly label = "Custom Card";
	readonly category = "content";

	readonly fields = [
		{ key: "title", field: new TextField({ label: "Title", default: "" }) },
		{ key: "image", field: new ImageField({ label: "Image" }) },
	];

	readonly slots = [{ key: "body", slot: new Slot({ label: "Body Content", max: 5 }) }];

	async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		return {
			type: "custom-card",
			id: generateUid(),
			meta: { moduleId: moduleData.meta.id, isModuleRoot: true },
			props: {
				title: this.fields[0].field.parse(moduleData.fields.title),
				image: this.fields[1].field.parse(moduleData.fields.image),
				children: await Promise.all(
					(moduleData.slots.body ?? []).map(child => composer.composeModule(child))
				),
			},
		};
	}
}

const composer = new Composer();
composer.registerModule(new CustomModule());
const module = composer.getRegistry().getModule("custom-card");
const node = await composer.composeModule(moduleData);
```

Das Field-System kapselt Validierung und Normalisierung über eine abstrakte Basisklasse:

```typescript
abstract class FieldBase<ValueT, ConfigT> {
	abstract validate(raw: UJLCFieldObject): raw is ValueT;
	abstract fit(value: ValueT): ValueT;

	parse(raw: UJLCFieldObject): ValueT {
		if (!this.validate(raw)) return this.config.default;
		return this.fit(raw);
	}
}
```

### Konsequenzen

#### Vorteile

Die Erweiterbarkeit ohne Core-Brüche ermöglicht neue Module ohne Änderungen am Core-Code. Der stabile Datenvertrag bedeutet, dass das UJLC-Schema unverändert bleibt, auch wenn neue Module hinzugefügt werden. Die gekapselte Validierung in Fields übernimmt Type Guards und Constraints zentral. TypeScript-Support für Custom Modules bietet Typsicherheit während der Entwicklung. Module können isoliert getestet werden, was die Testbarkeit erhöht.

#### Nachteile

Der Boilerplate-Code ist nicht zu vernachlässigen, da jedes Modul eine Struktur von etwa 50-100 Zeilen Code benötigt. Die Lernkurve für Entwickler ist steil, da sie das Field- und Slot-System verstehen müssen. Der Template-Bedarf durch ModuleBase zwingt zu einer bestimmten Struktur. Es entsteht eine kleine Performance-Einbuße durch den Runtime-Lookup in der Registry.

### Betrachtete Alternativen

Eine statische Module-Liste wurde verworfen, da sie keine Erweiterbarkeit bietet und jedes neue Modul einen Core-Pull-Request benötigen würde. Ein Plugin-System ohne zentrale Registry hätte keine zentrale Verwaltung ermöglicht und Namenskollisionen wären möglich gewesen. Vererbungsbasierte Module wären zu stark gekoppelt und schwer testbar gewesen. Functional Composition hätte zu wenig Struktur geboten und die Validierung nicht gekapselt.

### Verwandte Entscheidungen

Diese Entscheidung hängt eng mit ADR-003 zusammen, da Module zu AST-Nodes transformiert werden, sowie mit ADR-005, da Zod-Schemas für Fields verwendet werden.

## 9.3 ADR-003: Adapter Pattern für Framework-Agnostisches Rendering

### Status

**ACCEPTED** - Implementiert

### Kontext

Direktes Rendering von UJL-Dokumenten bindet an ein spezifisches Framework wie Svelte. Andere Frameworks wie React oder Vue oder alternative Targets wie HTML oder PDF würden eine vollständige Neuimplementierung erfordern. Die Anforderungen umfassten, dass die Core-Logik framework-agnostisch bleibt, unterschiedliche Render-Targets unterstützt werden, die Composition-Logik wiederverwendbar ist und Testbarkeit ohne Framework-Abhängigkeiten gewährleistet wird. Performance war bei dieser Entscheidung kein Hauptkriterium, da Flexibilität und Framework-Unabhängigkeit wichtiger waren als potenzielle AST-Overhead-Kosten.

### Entscheidung

UJL erzeugt zunächst einen Abstract Syntax Tree (AST), der dann über Adapter in konkrete Targets transformiert wird. Der Fluss verläuft vom UJL-Dokument über den Composer mit Module Registry zum AST, der dann von verschiedenen Adaptern verarbeitet wird: Svelte-Adapter für Svelte-Komponenten, Web-Adapter für Custom Elements, zukünftig HTML-Adapter für statisches HTML und PDF-Adapter für PDF-Dokumente.

Die AST-Node-Struktur ist definiert als:

```typescript
type UJLAbstractNode = {
	type: string; // "text", "button", "container", etc.
	id: string; // Unique Node ID
	props: Record<string, unknown>; // Node-specific properties
	meta?: {
		moduleId?: string; // UJLC Module ID (for editor integration)
		isModuleRoot?: boolean; // true = editable module root
	};
};
```

Ein wichtiges Konzept ist die 1:N Module-zu-Node-Transformation. Ein UJLC-Modul kann mehrere AST-Nodes erzeugen, beispielsweise strukturelle Wrapper für Layouts:

```typescript
{
  type: "grid-container",
  id: generateUid(),
  meta: { moduleId: "grid-001", isModuleRoot: true },
  props: {
    children: [
      {
        type: "grid-item",
        id: generateUid(),
        meta: { moduleId: "grid-001", isModuleRoot: false },
        props: { ... }
      }
    ]
  }
}
```

Das Feld meta.moduleId ermöglicht Click-to-Select im Editor, während meta.isModuleRoot editierbare Nodes markiert.

### Konsequenzen

#### Vorteile

Die Framework-Unabhängigkeit bedeutet, dass die Core-Logik ohne UI-Framework läuft. Neue Rendering-Targets können ohne Core-Änderungen hinzugefügt werden, was die Rendering-Flexibilität erhöht. Die AST-Erzeugung ist isoliert testbar ohne DOM-Abhängigkeiten. Die Editor-Integration profitiert davon, dass moduleId ein DOM-zu-Dokument-Mapping ermöglicht. Ein AST kann für viele Outputs wiederverwendet werden.

#### Nachteile

Der Implementierungsaufwand pro Target ist hoch, da jeder Adapter alle Node-Typen unterstützen muss. Unterschiedliche Adapter führen zu unterschiedlichen Bundle-Größen. Die Versioning-Komplexität steigt, da Adapter synchron gehalten werden müssen. Der AST-Overhead ist eine zusätzliche Abstraktion, wurde aber nicht gemessen und wird als minimal eingeschätzt.

### Betrachtete Alternativen

Direktes Framework-Rendering wurde verworfen, da es an Svelte gebunden hätte und keine Wiederverwendbarkeit geboten hätte. Template-basierte Transformation hätte zu wenig Kontrolle geboten und wäre schwer erweiterbar gewesen. Ein Virtual DOM wie bei React wäre zu komplex gewesen und hätte keinen Mehrwert für den Use Case gebracht. Compiler-basierte Codegen wäre zu starr gewesen, da der Editor Runtime-Rendering benötigt.

### Metriken

Der Svelte-Adapter hat eine Bundle-Größe von etwa 45 KB (gzip) und unterstützt 15 Node-Typen. Der Web-Adapter ist mit etwa 12 KB (gzip) deutlich kleiner und unterstützt ebenfalls 15 Node-Typen.

### Verwandte Entscheidungen

Die Entscheidung steht in Beziehung zu ADR-002, da Module zu AST-Nodes transformiert werden, sowie zu ADR-006, da Svelte als primärer Adapter gewählt wurde.

## 9.4 ADR-004: Dual Image Storage Strategy (Inline vs. Backend)

### Status

**ACCEPTED** - Evolutionär entstanden

### Kontext

Bilder sind ein zentraler Bestandteil von UJL-Dokumenten, aber Use Cases unterscheiden sich fundamental. Standalone-Dokumente sollen ohne Backend funktionieren, müssen portabel sein für Demos und Offline-Nutzung, wobei eine kleine Anzahl Bilder akzeptabel ist. Production-Workflows benötigen hingegen Asset-Management für Metadaten, Versionierung und Credits, erfordern responsive Varianten in WebP und verschiedenen Größen, und große Bild-Bibliotheken würden Dokument-Dateien unhandlich machen. Die Evolution verlief so, dass Inline Storage zuerst implementiert wurde und Backend Storage später hinzugefügt wurde, als CMS-Integration nötig wurde.

### Entscheidung

UJL unterstützt zwei Storage-Modi, die über eine Image Library Abstraktion umgeschaltet werden. Inline Storage speichert Bilder als Base64 im Dokument:

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
					"filename": "hero.jpg",
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

Backend Storage verwendet URL-Referenzen:

```json
{
	"ujlc": {
		"meta": {
			"_library": {
				"storage": "backend",
				"url": "http://localhost:3000"
			}
		},
		"images": {
			"img-001": {
				"src": "http://localhost:3000/api/images/67890abcdef12345",
				"metadata": {
					"filename": "hero.jpg",
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

Die Image Library nutzt eine Provider-Abstraction:

```typescript
class ImageLibrary {
	constructor(initialImages: Record<string, ImageEntry>, provider?: ImageProvider);

	async resolve(id: string): Promise<UJLImageData | null> {
		const local = this.images[id];
		if (local) return { imageId: id, src: local.src };

		if (this.provider) {
			const imageSource = await this.provider.resolve(id);
			if (imageSource) return { imageId: id, src: imageSource.src };
		}

		return null;
	}
}
```

Die Crafter-Konfiguration entscheidet über den Storage-Modus, nicht die Dokument-Metadaten:

```typescript
const crafterConfig = {
	imageStorage: "backend",
	libraryServiceUrl: "http://localhost:3000",
};
```

### Konsequenzen

#### Vorteile

Die Flexibilität eines Dokument-Formats mit zwei Deployment-Modi ermöglicht unterschiedliche Einsatzszenarien. Inline-Dokumente funktionieren portabel ohne Backend-Abhängigkeit. Backend-Storage skaliert für große Bild-Bibliotheken. Asset-Management bietet Metadaten, responsive Varianten und Internationalisierung im Backend. Die Migration zwischen Modi ist geplant und würde Dokumente zwischen Modi konvertieren können.

#### Nachteile

Die Komplexität entsteht durch zwei Code-Paths für Bild-Handling. Inline Storage führt zu großen ujlc.json-Dateien. Die Infrastruktur-Anforderungen für Backend Storage umfassen den Library Service mit Docker und PostgreSQL. Der Konfigurations-Overhead erfordert, dass der Storage-Modus korrekt gesetzt wird.

### Betrachtete Alternativen

Nur Inline Storage wurde verworfen, da es nicht für große Projekte skaliert. Nur Backend Storage hätte keine Offline- oder Standalone-Nutzung ermöglicht. File-System-basierte Lösungen hätten Portabilität erschwert und keine Web-Integration geboten. CDN-Only wäre zu komplex für Entwicklungs-Workflows gewesen.

### Migration-Status

Die automatische Migration zwischen Storage-Modi ist geplant, aber nicht implementiert. Vorgesehen sind inline zu backend durch Upload aller Bilder zum Library Service, backend zu inline durch Download und Embedding aller Bilder, sowie backend zu backend durch Re-Upload zu einer neuen Library Service Instanz.

### Verwandte Entscheidungen

Die Entscheidung hängt mit ADR-007 zusammen, da Payload als Backend für Image Storage verwendet wird, sowie mit ADR-016, das das Provider-Interface für Storage definiert.

## 9.5 ADR-005: Zod-basierte Runtime Validation mit TypeScript Type Inference

### Status

**ACCEPTED** - Implementiert

### Kontext

UJL-Dokumente stammen häufig aus externen Quellen wie Datei-Uploads, bei denen User ujlc.json-Dateien hochladen, CMS-Importen, bei denen externe Systeme UJL-Dokumente generieren, und zukünftig auch von KI-Systemen, bei denen LLMs UJL-Content generieren könnten. Das Problem besteht darin, dass reine TypeScript-Typen nur Compile-Time-Sicherheit bieten. Zur Laufzeit können ungültige Daten das System zum Absturz bringen. Die Anforderungen umfassten Runtime-Validierung mit verständlichen Fehlermeldungen, Unterstützung für rekursive Strukturen wie verschachtelte Module, automatische TypeScript-Type-Generierung nach dem DRY-Prinzip und performante Validierung unter 10ms pro Dokument. Die Technologie-Evaluation fiel zwischen AJV (JSON Schema) und Zod (TypeScript-first).

### Entscheidung

UJL nutzt Zod als Single Source of Truth für Schemas und Typen. Die Schema-Definition erfolgt in Zod, wobei TypeScript-Typen automatisch inferiert werden:

```typescript
export const UJLCModuleObjectSchema = z.object({
	type: z.string(),
	meta: UJLCModuleMetaSchema,
	fields: z.record(z.string(), UJLCFieldObjectSchema),
	slots: z.record(z.string(), z.array(z.lazy(() => UJLCModuleObjectSchema))),
});

export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;

export function validateUJLCDocument(data: unknown): UJLCDocument {
	return UJLCDocumentSchema.parse(data);
}

export function validateUJLCDocumentSafe(
	data: unknown
): SafeParseReturnType<unknown, UJLCDocument> {
	return UJLCDocumentSchema.safeParse(data);
}
```

Wichtige Zod-Features für UJL sind z.lazy() für rekursive Strukturen wie verschachtelte Module, z.discriminatedUnion() für Varianten-Typen wie Inline vs. Backend Image, .default() für Default-Werte bei Fields ohne Pflichtwert, und .safeParse() für nicht-werfende Validierung in CLI-Tools.

Die Fehlerbehandlung mit JSON-Pfad funktioniert folgendermaßen:

```typescript
const result = validateUJLCDocumentSafe(data);

if (!result.success) {
	for (const issue of result.error.issues) {
		console.error(`${issue.path.join(" → ")}: ${issue.message}`);
	}
}
```

Dies erzeugt Ausgaben wie: ujlc → root → 0 → fields → content: Expected string, received number

### Konsequenzen

#### Vorteile

Das DRY-Prinzip wird durch ein Schema mit automatischen TypeScript-Typen umgesetzt. Runtime-Safety ermöglicht die Validierung externer Daten aus CMS, Import und zukünftigen KI-Systemen. Präzise Fehler mit JSON-Pfad und Fehlerbeschreibung erleichtern das Debugging. Rekursive Schemas durch z.lazy() ermöglichen verschachtelte Module. Type Inference erreicht 100 Prozent Type Coverage ohne Duplikation. Die Developer Experience profitiert von Autocomplete in der IDE durch TypeScript.

#### Nachteile

Die Bundle-Größe erhöht sich um etwa 12 KB (gzip) für die Zod-Library. Der Runtime-Overhead beträgt etwa 5-10ms pro Dokument-Validierung. Entwickler müssen die Zod-API kennen, was eine Lernkurve bedeutet. Zod-Updates können Breaking Changes enthalten.

### Warum Zod statt AJV?

Bei der TypeScript Integration bietet Zod native Type Inference, während AJV Codegen via CLI benötigt. Die Developer Experience ist bei Zod durch die Fluent API und IDE-Support besser als bei AJV mit JSON Schema, das verbose ist. Recursive Schemas funktionieren bei Zod mit z.lazy() out of the box, während sie bei AJV möglich, aber umständlich sind. Bei der Performance liegt AJV mit etwa 2-5ms vor Zod mit etwa 5-10ms. Die Bundle Size ist bei AJV mit etwa 8 KB kleiner als bei Zod mit etwa 12 KB. Bezüglich Standard Compliance nutzt AJV den JSON Schema Standard, während Zod ein eigenes Format verwendet. Das Fazit ist, dass Zod durch Type Inference und Developer Experience gewinnt, da der Performance-Unterschied für den UJL-Use-Case vernachlässigbar unter 10ms liegt.

### Betrachtete Alternativen

AJV (JSON Schema) wurde wegen schlechterer TypeScript-Integration und Codegen-Overhead verworfen. Yup hatte schwächeren TypeScript-Support und ist primär für Forms gedacht. io-ts war zu funktional mit steiler Lernkurve. Nur TypeScript zu verwenden hätte keine Runtime-Validierung geboten.

### Metriken

Ein Benchmark auf MacBook Pro M1 mit 1000 Validierungen ergab durchschnittlich etwa 6.2ms pro Dokument:

```typescript
const doc = loadUJLCDocument("example.ujlc.json");
const start = performance.now();
for (let i = 0; i < 1000; i++) {
	validateUJLCDocument(doc);
}
const end = performance.now();
console.log(`Average: ${(end - start) / 1000}ms per validation`);
```

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-001, da UJLC und UJLT mit Zod validiert werden, sowie zu ADR-002, da Fields Zod für Validierung nutzen.

## 9.6 ADR-006: Svelte als primäres UI-Framework

### Status

**ACCEPTED** - Implementiert

### Kontext

UJL benötigt ein UI-Framework für den Crafter (Editor) mit komplexer interaktiver UI inklusive Tree-Navigation, Drag & Drop und Live Preview, für den primären Adapter zum Rendering von UJL-Dokumenten als Svelte-Komponenten sowie für Web Components zum Export von UJL-Inhalten als Custom Elements. Die Anforderungen umfassten eine kleine Bundle-Größe unter 100 KB für den Crafter, gute Performance mit unter 200ms Initial Render, Custom Elements Support für Framework-Agnostik und Fine-grained Reactivity für Editor-State. Evaluiert wurden React, Vue und Svelte.

### Entscheidung

UJL setzt auf Svelte mit Runes für Crafter und primären Adapter. Die Entscheidungskriterien waren nach Wichtigkeit geordnet erstens Custom Elements Support mit höchster Priorität, da Web Components Kernziel der Architektur waren und Svelte's svelte:options customElement den Export trivial macht. Zweitens Bundle-Größe und Performance mit höchster Priorität, da Svelte zu Vanilla JS ohne Runtime-Framework kompiliert. Der Svelte-Adapter hat etwa 45 KB (gzip), der Web-Adapter etwa 12 KB (gzip), während React etwa 42 KB (react + react-dom) und Vue etwa 34 KB (runtime) benötigen. Drittens Fine-grained Reactivity mit hoher Priorität, da Svelte Runes perfekt zu Editor-State-Management passen:

```typescript
let _ujlcDocument = $state<UJLCDocument>(initialDoc);
let _selectedNodeId = $state<string | null>(null);
const rootSlot = $derived(_ujlcDocument.ujlc.root);
```

Viertens Framework-Agnostik durch Compilation mit hoher Priorität, da Svelte zu imperativen DOM-Operationen kompiliert, was besser für Framework-Unabhängigkeit ist als VDOM bei React oder Vue. Fünftens Eleganz und Team-Präferenz mit niedriger Priorität, da das Team Svelte intuitiver und weniger boilerplate-lastig fand als React.

### Konsequenzen

#### Vorteile

Die kleine Bundle-Größe von etwa 45 KB für adapter-svelte ist ein klarer Vorteil. Custom Elements werden nativ unterstützt durch Web Components Support. Die Performance profitiert von Compilation statt Runtime-Framework. Fine-grained Reactivity durch Runes ermöglicht präzises State-Management. Die Developer Experience ist besser durch weniger Boilerplate als bei React oder Vue.

#### Nachteile

Das kleinere Ökosystem bedeutet weniger Libraries als bei React. Team-Onboarding ist aufwendiger, da Svelte weniger verbreitet ist als React. Die SSR-Komplexität ist höher, da SvelteKit weniger mature ist als Next.js.

### Betrachtete Alternativen

React wurde trotz größtem Ökosystem und gutem Hiring verworfen, da Custom Elements umständlich sind und die Bundle-Size sowie der VDOM-Overhead zu groß waren. Vue bot eine gute Balance mit Options und Composition API sowie mittlere Bundle-Size, wurde aber verworfen, da Custom Elements weniger elegant sind. Solid hatte beste Performance, aber ein sehr kleines Ökosystem und wurde als zu experimentell eingestuft. Lit bietet Web Components nativ, ist aber kein Full-Framework und zu low-level für den Crafter.

### Metriken

Der Crafter Bundle hat ein Target von unter 100 KB und erreicht tatsächlich etwa 87 KB. Der Adapter-Svelte hat ein Target von unter 50 KB und erreicht etwa 45 KB. Der Adapter-Web hat ein Target von unter 20 KB und erreicht etwa 12 KB. Das Initial Render Target von unter 200ms wird mit etwa 150ms erreicht.

### Verwandte Entscheidungen

Diese Entscheidung hängt mit ADR-003 zusammen, da Svelte als primärer Adapter verwendet wird, sowie mit ADR-018, das Runes statt Stores festlegt.

## 9.7 ADR-007: Payload CMS für den Library Service

### Status

**ACCEPTED** - Implementiert

### Kontext

Für Backend Image Storage benötigt UJL einen Service mit Upload und Storage zum Hochladen und Verwalten von Bildern, Metadaten für Alt-Text, Credits, Dateiname, Größe und Internationalisierung, Bildverarbeitung für responsive Varianten in WebP und verschiedenen Größen, einer REST oder GraphQL API für Zugriff durch Crafter und Rendering sowie Self-Hosting ohne Abhängigkeit von externen SaaS-Anbietern. Evaluiert wurden Strapi, Directus, Custom Backend mit Express oder Fastify, Supabase oder Firebase, Laravel sowie Payload CMS.

### Entscheidung

UJL nutzt Payload CMS für den Library Service. Die Payload Collection für Images ist konfiguriert mit Upload-Einstellungen für statisches Verzeichnis und MIME-Types, Image-Größen von xs (320px) bis max (2560px), Fields für alt, credits und description (alle lokalisiert) sowie focalPoint, und Access-Kontrolle mit öffentlichem read aber API-Key-geschütztem create, update und delete:

```typescript
export const Images: CollectionConfig = {
	slug: "images",
	upload: {
		staticDir: "./uploads/images",
		mimeTypes: ["image/*"],
		imageSizes: [
			{ name: "xs", width: 320, height: undefined },
			{ name: "sm", width: 640, height: undefined },
			{ name: "md", width: 768, height: undefined },
			{ name: "lg", width: 1024, height: undefined },
			{ name: "xl", width: 1280, height: undefined },
			{ name: "xxl", width: 1536, height: undefined },
			{ name: "xxxl", width: 1920, height: undefined },
			{ name: "max", width: 2560, height: undefined },
		],
	},
	fields: [
		{ name: "alt", type: "text", localized: true },
		{ name: "credits", type: "text", localized: true },
		{ name: "description", type: "textarea", localized: true },
		{ name: "focalPoint", type: "point" },
	],
	access: {
		read: () => true,
		create: requireAPIKey,
		update: requireAPIKey,
		delete: requireAPIKey,
	},
};
```

Die entscheidenden Faktoren waren erstens TypeScript-First, da Payload in TypeScript geschrieben ist und First-Class TS-Support bietet. Zweitens die Bildverarbeitung mit automatischen responsive Varianten in WebP und Focal Point Support. Drittens i18n mit nativer Lokalisierung für Alt-Text, Credits und mehr. Viertens die Flexibilität durch Hooks, Custom Endpoints und volle Kontrolle.

### KI-Features (Enterprise) - Nicht verwendet

Payload bietet in der Enterprise-Version AI Search für semantische Suche mit Embeddings sowie Auto-Embedding für automatische Embedding-Generierung. Diese Features werden nicht genutzt, da UJL UJLC-Module embeddet und nicht Payload-Collections, die Embedding-Pipeline austauschbar bleiben soll ohne Vendor-Lock-in, und ein eigener Vektorraum für Module und Medien vorgesehen ist (siehe ADR-017).

### Konsequenzen

#### Vorteile

Das Out-of-the-box Asset-Management bietet Upload, Metadaten und API sofort. Responsive Images werden automatisch in WebP generiert. TypeScript-Native bedeutet volle Type-Safety. Die i18n-Unterstützung ermöglicht lokalisierte Alt-Texte und Credits. Self-Hosting vermeidet SaaS-Abhängigkeiten. REST und GraphQL bieten flexible API-Nutzung.

#### Nachteile

Die Infrastruktur-Anforderungen umfassen Docker und PostgreSQL. Der Setup-Aufwand beinhaltet Payload-Konfiguration und Deployment. Laufende Kosten entstehen durch Hosting und Wartung. Vendor-Komplexität bedeutet, dass Payload-Updates Breaking sein können. Die Learning Curve erfordert, dass das Team Payload kennenlernt.

### Deployment

Das Deployment erfolgt über Docker Compose:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ujl_library
      POSTGRES_USER: ujl
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  library:
    build: ./services/library
    environment:
      DATABASE_URL: postgresql://ujl:${DB_PASSWORD}@postgres:5432/ujl_library
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
```

### Verwandte Entscheidungen

Diese Entscheidung hängt mit ADR-004 zusammen, da Backend Storage Payload nutzt, sowie mit ADR-017, das eine eigene Embedding-Pipeline statt Payload AI vorsieht.

## 9.8 ADR-008: TipTap/ProseMirror für Rich Text Editing

### Status

**ACCEPTED** - Implementiert

### Kontext

Rich Text ist ein zentraler Bestandteil von UJL-Dokumenten für das Text-Modul. Traditionelle Ansätze mit HTML-Strings sind schwer zu validieren, bergen XSS-Risiken, bieten keine strukturelle Garantie und haben WYSIWYG-Probleme, da Editor und Renderer nicht übereinstimmen. Die Anforderungen umfassten strukturierte validierbare Daten, WYSIWYG-Garantie bei der Editor und Renderer gleich sind, SSR-Tauglichkeit für Server-Side Rendering und Sicherheit ohne XSS. TipTap war von Anfang an gesetzt, ohne dass Alternativen evaluiert wurden.

### Entscheidung

UJL nutzt TipTap als ProseMirror-Wrapper für Rich Text und speichert Inhalte als ProseMirror JSON. Die Struktur eines ProseMirror-Dokuments ist JSON-basiert:

```typescript
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [
        {
          "type": "text",
          "text": "Welcome to UJL",
          "marks": [{ "type": "bold" }]
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is " },
        { "type": "text", "text": "rich text", "marks": [{ "type": "italic" }] },
        { "type": "text", "text": " content." }
      ]
    }
  ]
}
```

Ein shared Schema zwischen Editor und Renderer wird verwendet:

```typescript
export const ujlRichTextExtensions = [
	StarterKit.configure({
		undoRedo: false,
		dropcursor: false,
		gapcursor: false,
	}),
];

import { useEditor } from "@tiptap/svelte";
const editor = useEditor({
	extensions: ujlRichTextExtensions,
	content: proseMirrorDoc,
});

import { prosemirrorToHtml } from "@ujl-framework/adapter-svelte";
const html = prosemirrorToHtml(proseMirrorDoc);
```

Der SSR-Safe Serializer benötigt keine Browser-APIs:

```typescript
export function prosemirrorToHtml(doc: ProseMirrorDocument): string {
	return serializeNodes(doc.content);
}

function serializeNode(node: ProseMirrorNode): string {
	switch (node.type) {
		case "paragraph":
			return "<p>" + serializeNodes(node.content) + "</p>";
		case "heading":
			const level = node.attrs?.level ?? 1;
			return `<h${level}>` + serializeNodes(node.content) + `</h${level}>`;
		case "text":
			return applyMarks(escapeHtml(node.text), node.marks);
	}
}

function applyMarks(text: string, marks?: ProseMirrorMark[]): string {
	if (!marks) return text;
	return marks.reduce((result, mark) => {
		switch (mark.type) {
			case "bold":
				return `<strong>${result}</strong>`;
			case "italic":
				return `<em>${result}</em>`;
			case "code":
				return `<code>${result}</code>`;
			default:
				return result;
		}
	}, text);
}
```

### Konsequenzen

#### Vorteile

Strukturierte Daten in JSON statt HTML-Strings ermöglichen bessere Validierung. Die WYSIWYG-Garantie wird durch gleiches Schema in Editor und Renderer erreicht. SSR-Tauglichkeit bedeutet, dass kein Browser für Serialisierung nötig ist. Sicherheit wird durch strukturierte Daten plus Escaping ohne XSS gewährleistet. Validierung erfolgt durch ProseMirror-Schema, das gültige Struktur erzwingt. Erweiterbarkeit ist durch Custom Nodes und Marks möglich.

#### Nachteile

Die Bundle-Größe erhöht sich um etwa 25 KB (gzip) für TipTap plus ProseMirror. Die Komplexität steigt durch ProseMirror-Konzepte wie Schema, Transaction und State. Die Lernkurve erfordert, dass das Team ProseMirror-Basics kennt. Serializer-Wartung ist nötig, da Custom Node-Typen Serializer-Updates benötigen.

### Betrachtete Alternativen

Es wurden keine Alternativen betrachtet, da TipTap von Anfang an gesetzt war. Theoretische Alternativen wären Slate.js gewesen (React-basiert mit strukturierten Daten), Lexical von Meta (moderner Editor, aber zu neu), oder Quill (einfacher, aber weniger Kontrolle).

### Metriken

Die TipTap Bundle Size beträgt etwa 25 KB (gzip). Der Serializer Bundle hat etwa 2 KB (gzip). Der Total Rich Text Overhead liegt bei etwa 27 KB.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-005, da ProseMirror-Docs via Zod validiert werden, sowie zu ADR-019, das das Prinzip strukturierter Daten über Markup festlegt.

## 9.9 ADR-009: OKLCH Farbraum für Design Tokens

### Status

**ACCEPTED** - Implementiert

### Kontext

Farben sind zentral für Accessibility und Brand-Compliance. Traditionelle Farbräume haben Einschränkungen. `RGB` und Hexadezimal-Notation sind nicht perzeptuell uniform, es ist schwer konsistente Paletten zu generieren und Kontrast-Berechnungen sind ungenau. `HSL` hat bessere Intuition als `RGB`, aber Lightness ist nicht perzeptuell uniform und Helligkeit variiert bei gleichem L-Wert je nach Farbton. Das Problem besteht darin, dass `UJL` konsistente Paletten generieren muss (50-950 Shades), `WCAG`-Kontraste präzise berechnen muss (4.5:1 für AA) und Interpolation zwischen Farben harmonisch halten muss.

### Entscheidung

UJL nutzt OKLCH (Oklab Lightness, Chroma, Hue) als primären Farbraum:

```typescript
type UJLTOklch = {
	l: number; // Lightness (0-1), perzeptuell uniform
	c: number; // Chroma (0+), Sättigung
	h: number; // Hue (0-360), Farbton
};
```

Die Palette-Struktur umfasst 11 Shades pro Flavor von 50 (hellste Abstufung) über 500 (Basis) bis 950 (dunkelste Abstufung). Foreground-Mapping für Accessibility definiert für jeden Flavor Shades mit lightForeground und darkForeground Records, die jeweils auf UJLTShadeRef verweisen.

Das CSS Custom Properties Output sieht folgendermaßen aus:

```css
[data-ujl-theme="..."] {
	--primary-50: 97.2% 0.012 264.052;
	--primary-500: 54.6% 0.245 262.881;
	--primary-950: 12.9% 0.042 264.695;

	--primary-light-foreground-primary: var(--primary-950);
	--primary-dark-foreground-primary: var(--primary-50);
}

.button-primary {
	background-color: oklch(var(--primary-500));
	color: oklch(var(--primary-light-foreground-primary));
}
```

Dark Mode wird via dark Class umgesetzt:

```css
[data-ujl-theme="..."].dark {
	--primary-light-foreground-primary: var(--primary-dark-foreground-primary);
}
```

### Konsequenzen

#### Vorteile

Perzeptuelle Uniformität bedeutet gleichmäßige Paletten, da L-Schritte visuell gleichmäßig sind. Präzise Kontraste werden durch WCAG-Berechnungen genauer als HSL erreicht. Harmonische Interpolation ermöglicht smooth Farbübergänge. Accessibility by Design wird durch Foreground-Mappings erzwungen, die WCAG einhalten. Moderner Browser-Support existiert für CSS oklch() nativ in Chrome 111+, Firefox 113+ und Safari 15.4+.

#### Nachteile

Die Komplexität ist höher, da OKLCH weniger intuitiv ist als RGB oder HSL. Browser-Fallback für ältere Browser benötigt RGB-Fallback. Das Tooling ist weniger verbreitet als RGB/Hexadezimal, beispielsweise nutzt Figma RGB. Der Berechnungs-Overhead erfordert Konvertierung zwischen OKLCH und RGB bei Bedarf.

### Warum OKLCH statt sRGB/Display-P3?

RGB ist nicht perzeptuell uniform, hat sRGB Gamut und 100 Prozent Browser-Support. HSL ist nicht perzeptuell uniform, hat sRGB Gamut und 100 Prozent Browser-Support. OKLCH ist perzeptuell uniform, hat Display-P3 Gamut und über 90 Prozent Browser-Support (2024), daher der Gewinner. LCH ist besser als HSL aber nicht so gut wie OKLCH, hat sRGB Gamut und über 90 Prozent Browser-Support. Das Fazit ist, dass OKLCH die beste Balance aus Perzeptualität, Gamut und Browser-Support bietet.

### Fallback-Strategie

RGB-Fallback für ältere Browser kann entweder inline erfolgen:

```css
.button-primary {
	background-color: #6366f1;
	background-color: oklch(54.6% 0.245 262.881);
}
```

oder über @supports:

```css
@supports (color: oklch(0% 0 0)) {
	.button-primary {
		background-color: oklch(var(--primary-500));
	}
}
```

### Betrachtete Alternativen

RGB/Hexadezimal wurde verworfen, da es nicht perzeptuell ist und schlechte Palette-Generierung bietet. HSL wurde ausgeschlossen, da Lightness nicht uniform ist und Kontraste ungenau sind. LCH ist perzeptueller als HSL, hat aber kleineren Gamut als OKLCH. Display-P3 direkt wurde verworfen, da es kein Farbmodell ist, nur Gamut, und keine Perzeptualität bietet.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-001, da OKLCH-Tokens in UJLT verwendet werden, sowie zu ADR-020, das automatische Textfarb-Zuordnung definiert.

## 9.10 ADR-010: pnpm Workspaces + Changesets für Monorepo

### Status

**ACCEPTED** - Implementiert

### Kontext

UJL ist als Monorepo organisiert mit mehreren Packages: @ujl-framework/types (Foundation), @ujl-framework/core (Composer, Registry), @ujl-framework/ui (Shared UI-Komponenten), @ujl-framework/adapter-svelte (Svelte-Adapter), @ujl-framework/adapter-web (Web Components) und @ujl-framework/crafter (Editor). Die Anforderungen umfassten Workspace-Support, damit Packages sich Dependencies teilen, effiziente Installation mit Schnelligkeit und wenig Disk-Space, Versionierung mit koordinierten Releases über mehrere Packages sowie Changelogs mit automatischer Generierung bei Releases. Ursprünglich war Bun geplant wegen der Performance, aber Installationsprobleme führten zum Wechsel auf pnpm.

### Entscheidung

UJL nutzt pnpm Workspaces für Dependency-Management und Changesets für Versionierung. Die Monorepo-Struktur umfasst ein Root-Package mit package.json, pnpm-workspace.yaml für Workspace-Definition, .changeset/ für Changeset-Konfiguration, packages/ mit types, core, ui, adapter-svelte, adapter-web und crafter, apps/ mit dev-demo und docs sowie services/ mit library für Payload CMS.

Die pnpm Workspace-Konfiguration definiert packages für 'packages/_', 'apps/_' und 'services/\*'. Workspace-Dependencies nutzen das Workspace-Protokoll:

```json
{
	"name": "@ujl-framework/core",
	"dependencies": {
		"@ujl-framework/types": "workspace:*"
	}
}
```

Der Changesets-Workflow umfasst drei Schritte. Erstens wird auf dem Feature Branch ein Changeset erstellt mit pnpm changeset, wobei interaktiv gewählt wird, welche Packages betroffen sind und ob Major, Minor oder Patch. Zweitens werden auf dem Main Branch Versionen angewandt mit pnpm version-packages, das Changesets liest, Versionen bumped und CHANGELOGs generiert. Drittens erfolgt das Release mit pnpm publish -r --access public, das alle geänderten Packages zu npm publiziert.

Die Build-Reihenfolge ist dependency-aware. Das Root-Skript orchestriert den Build mit pnpm run build. Die interne Reihenfolge folgt: types, core, ui, adapter-svelte, adapter-web, crafter.

### Konsequenzen

#### Vorteile

Effiziente Installation durch pnpm nutzt einen Content-Addressable Store mit Symlinks statt Duplikaten. Das Workspace-Protokoll workspace:\* funktioniert für lokale Packages. Strenge Dependency-Grenzen bedeuten, dass Packages nur explizit deklarierte Deps nutzen können. Koordinierte Releases werden durch Changesets verwaltet, das Versionen über Packages hinweg managed. Automatische Changelogs werden durch Changesets generiert als CHANGELOG.md pro Package. Reproduzierbare Builds sind durch pnpm-lock.yaml gewährleistet, das committed wird.

#### Nachteile

Die Lernkurve erfordert, dass das Team pnpm und Changesets kennt. Die Build-Reihenfolge muss manuell orchestriert werden, da kein Auto-Topological-Sort existiert. Changeset-Disziplin ist nötig, da Entwickler Changesets erstellen müssen, was vergessen werden kann. pnpm-Spezifität bedeutet, dass ein Wechsel zu npm oder yarn Anpassungen erfordert.

### Warum pnpm statt Bun?

Bei der Performance ist Bun sehr schnell, während pnpm schnell ist. Bei der Stabilität ist pnpm mature, während Bun Installationsprobleme hatte, daher gewann pnpm. Workspace-Support ist bei beiden robust vorhanden. Beim Ökosystem ist pnpm etabliert, während Bun neu ist (2023), daher gewann pnpm. Bei npm-Kompatibilität hat pnpm 100 Prozent, während Bun etwa 95 Prozent hat, daher gewann pnpm. Das Fazit ist, dass pnpm Industrie-Standard mit bewährter Stabilität ist und Bun-Installationsfehler ein Show-Stopper waren.

### Warum Changesets statt Lerna?

Semantic Versioning ist bei beiden automatisch. Changelog-Generierung ist bei Changesets built-in, während Lerna ein Plugin benötigt, daher gewann Changesets. Developer Experience ist bei Changesets intuitiv, während Lerna komplexer ist, daher gewann Changesets. Maintenance ist bei Changesets aktiv, während Lerna weniger aktiv ist, daher gewann Changesets.

### Metriken

Der Disk-Space-Vergleich für node_modules zeigt npm install mit etwa 450 MB, yarn install mit etwa 420 MB und pnpm install mit etwa 280 MB, was minus 38 Prozent gegenüber npm bedeutet.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-012, da CI/CD pnpm nutzt, sowie zu ADR-021, das die Dependency-Hierarchie definiert.

## 9.11 ADR-011: Playwright für E2E Testing des Crafters

### Status

**ACCEPTED** - Implementiert

### Kontext

Der Crafter umfasst komplexe UI-Interaktionen, die Unit-Tests nicht realistisch abbilden können. Dazu gehören Drag & Drop zum Verschieben von Modulen im Tree, Tree-Navigation mit Expandieren, Kollabieren und Scrollen, Preview-Sync bei dem Klicks im Preview zu Selektion im Tree führen, Clipboard mit Copy, Cut und Paste unter Nutzung des System-Clipboards sowie Keyboard Shortcuts wie Ctrl+C, Ctrl+V und Delete. Das Problem besteht darin, dass Unit-Tests mit Vitest DOM-Interaktionen simulieren können, aber nicht Browser-Events wie Drag & Drop und Clipboard, asynchrone UI-Updates wie Rendering und Scroll sowie Cross-Component-Interaktionen zwischen Tree und Preview. Die Anforderungen umfassten Tests in echten Browsern (Chrome, Firefox, Safari), stabile Selektoren die nicht CSS-Klassen sind sowie Debugging-Support mit Screenshots, Videos und Traces.

### Entscheidung

UJL nutzt Playwright für E2E-Tests des Crafters. Ein Test für Tree- und Preview-Selektion sieht folgendermaßen aus:

```typescript
import { test, expect } from "@playwright/test";

test("should select node in tree and preview", async ({ page }) => {
	await page.goto("/"); // nutzt baseURL aus Playwright-Config

	await page.click('[data-testid="tree-node-m1"]');

	const previewNode = page.locator('[data-ujl-module-id="m1"]');
	await expect(previewNode).toHaveClass(/highlighted/);

	const treeNode = page.locator('[data-testid="tree-node-m1"]');
	await expect(treeNode).toHaveClass(/selected/);
});
```

Ein Test für Clipboard-Operationen demonstriert Copy und Paste via Keyboard:

```typescript
test("should copy/paste node via keyboard", async ({ page }) => {
	await page.goto("/"); // nutzt baseURL aus Playwright-Config

	await page.click('[data-testid="tree-node-m1"]');
	await page.keyboard.press("Control+C");

	await page.click('[data-testid="tree-node-m2"]');
	await page.keyboard.press("Control+V");

	const newNode = page.locator('[data-testid^="tree-node-"][data-testid$="-copy"]');
	await expect(newNode).toBeVisible();
});
```

Test-spezifische Attribute werden in Svelte-Komponenten gesetzt:

```svelte
<div
  data-testid="tree-node-{node.meta.id}"
  data-ujl-module-id={node.meta.id}
  class:selected={isSelected}
>
  {node.type}
</div>
```

Die Playwright-Konfiguration definiert testDir als './tests/e2e', fullyParallel als true, retries abhängig von CI-Umgebung (2 in CI, 0 lokal), workers abhängig von CI (1 in CI, undefined lokal), Reporter als html und json mit outputFile 'test-results/results.json', use mit baseURL auf den lokalen Dev-Server (Port 5173), trace 'on-first-retry', screenshot 'only-on-failure' und video 'retain-on-failure', sowie projects für chromium, firefox und webkit mit Desktop Chrome, Desktop Firefox und Desktop Safari.

### Konsequenzen

#### Vorteile

Realistische Tests nutzen echte Browser-Events für Drag & Drop und Clipboard. Cross-Browser-Tests laufen in Chrome, Firefox und Safari. Stabile Selektoren verwenden data-testid statt CSS-Klassen. Debugging wird durch Screenshots, Videos und Traces unterstützt. Auto-Wait bedeutet, dass Playwright automatisch auf DOM-Updates wartet. CI-Ready bedeutet Headless-Modus für GitLab CI.

#### Nachteile

Längere Laufzeit ist gegeben, da E2E-Tests langsamer sind als Unit-Tests (etwa 10s vs. etwa 100ms). Flakiness kann auftreten, da asynchrone UI-Updates Tests instabil machen können. Setup-Overhead erfordert Browser-Installation und Dev-Server-Start. Maintenance ist nötig, da Tests bei UI-Änderungen aktualisiert werden müssen.

### Betrachtete Alternativen

Cypress bietet gute DX und Time-Travel-Debugging, ist aber nur Chromium-basiert ohne Safari-Support und wurde verworfen. Selenium ist Multi-Browser und etabliert, hat aber komplexere API und ist langsamer mit schlechterer DX und wurde verworfen. Testing Library ist Unit-Test-nah, bietet aber keine echten Browser-Events und ist zu limitiert für E2E, wurde verworfen. Puppeteer ist schnell und Chromium-fokussiert, unterstützt aber nur Chrome ohne Firefox und Safari und wurde verworfen.

### Test-Strategie

Unit-Tests mit Vitest fokussieren auf Fields, Modules und Utils mit 70 Prozent Anteil. Integration-Tests mit Vitest fokussieren auf Composer und Registry mit 20 Prozent Anteil. E2E-Tests mit Playwright fokussieren auf Crafter Workflows mit 10 Prozent Anteil.

### Metriken

Die Test-Laufzeiten betragen circa 2s für Vitest Unit Tests (500 Tests), circa 5s für Vitest Integration (50 Tests) und circa 30s für Playwright E2E (15 Tests, 3 Browser).

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-014, da Vitest für Unit und Integration-Tests verwendet wird, sowie zu ADR-022, das die data-testid-Strategie definiert.

## 9.12 ADR-012: GitLab CI/CD

### Status

**ACCEPTED** - Implementiert

### Kontext

UJL benötigt automatisierte CI/CD für Build mit TypeScript-Compilation und Svelte-Builds, Tests mit Unit-Tests (Vitest) und E2E-Tests (Playwright), Quality mit Linting (ESLint) und Type-Checking (tsc) sowie Deployment mit GitLab Pages für Dokumentation. Die Anforderungen umfassten Integration in Repository-Workflow mit Merge Requests und Issues, Caching für schnelle Builds, Multi-Stage-Pipeline sowie Deployment zu GitLab Pages.

### Entscheidung

UJL nutzt GitLab CI/CD. Die Pipeline definiert stages für install, build, test, quality und deploy. Variables setzen PNPM_CACHE_DIR auf .pnpm-store. Der install stage führt pnpm install --frozen-lockfile aus und cached .pnpm-store. Der build stage führt pnpm run build aus und erzeugt artifacts in packages/\*/dist und apps/docs/.vitepress/dist mit expire_in 1 day. Der test stage führt pnpm run test aus mit coverage regex für Prozent-Extraktion. Der quality stage führt pnpm run lint und pnpm run check aus. Der pages stage läuft nur auf main und develop, führt cp -r apps/docs/.vitepress/dist public aus und erzeugt artifacts in public.

### Konsequenzen

#### Vorteile

Die Integration bedeutet, dass Merge Requests, Issues und Registry in einem Tool sind. Caching des pnpm-Store ermöglicht schnelle Builds. GitLab Pages bietet kostenloses Docs-Hosting. Multi-Stage bedeutet klare Pipeline-Struktur.

#### Nachteile

Vendor-Lock-in durch GitLab-spezifische Syntax ist gegeben. Debugging bedeutet, dass CI-Logs weniger interaktiv sind als lokal.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-010, da CI pnpm nutzt, sowie zu ADR-013, da Docs zu GitLab Pages deployen.

## 9.13 ADR-013: VitePress für Dokumentation

### Status

**ACCEPTED** - Implementiert

### Kontext

Arc42-Dokumentation benötigt Markdown-basiertes Schreiben für einfache Erstellung, Versionierung über Git, statisches HTML-Output für GitLab Pages sowie Features wie Search, Sidebar und Navigation.

### Entscheidung

UJL nutzt VitePress für Dokumentation. Die Struktur umfasst apps/docs/ mit .vitepress/ für die Konfiguration in config.ts sowie src/ mit index.md und arc42/ mit den einzelnen Kapiteln von 01-introduction-and-goals.md bis 12-glossary.md. Die VitePress-Konfiguration definiert title als 'UJL Framework', description als 'Arc42 Architecture Documentation', themeConfig mit sidebar Items für Architecture (Arc42) mit Links zu den einzelnen Kapiteln sowie search mit provider 'local'.

### Konsequenzen

#### Vorteile

Markdown-first bedeutet einfaches Schreiben. Vite-Performance bietet schnelles HMR. Built-in Search ermöglicht lokale Suche ohne Backend. GitLab Pages liefert statisches HTML für Deployment.

#### Nachteile

Vite-Abhängigkeit bedeutet Coupling an das Vite-Ökosystem.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-012, da Docs via GitLab CI deployen.

## 9.14 ADR-014: Vitest für Unit-Tests

### Status

**ACCEPTED** - Implementiert

### Kontext

Unit-Tests für Core-Logik bei Fields, Modules und Utils benötigen Vite-native Konfiguration, die mit Build-Tooling geteilt wird, TypeScript und ESM ohne Transformer für Geschwindigkeit sowie Jest-Kompatibilität, da das Team die Jest-API kennt.

### Entscheidung

UJL nutzt Vitest. Die Konfiguration definiert test mit globals true, environment 'node', include für 'src/**\*.test.{js,ts}', exclude für 'node_modules/**' und 'dist/\*\*' sowie coverage mit provider 'v8' und reporter als 'text', 'json' und 'html'.

Ein Beispieltest für NumberField zeigt Validierung und Constraint-Anwendung:

```typescript
import { describe, it, expect } from "vitest";
import { NumberField } from "./number-field";

describe("NumberField", () => {
	it("should validate number", () => {
		const field = new NumberField({ label: "Count", default: 0 });
		expect(field.validate(42)).toBe(true);
		expect(field.validate("42")).toBe(false);
	});

	it("should apply min/max constraints", () => {
		const field = new NumberField({ label: "Count", default: 0, min: 0, max: 100 });
		expect(field.fit(50)).toBe(50);
		expect(field.fit(-10)).toBe(0);
		expect(field.fit(200)).toBe(100);
	});
});
```

### Konsequenzen

#### Vorteile

Vite-native bedeutet Shared Config mit Build. Schnelligkeit durch ESM ohne Transpilation ist gegeben. Jest-Kompatibilität ermöglicht einfachen Einstieg.

#### Nachteile

Das junge Ökosystem ist weniger mature als Jest.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-011, da Playwright für E2E verwendet wird.

## 9.15 ADR-015: TypeScript Strict Mode

### Status

**ACCEPTED** - Implementiert

### Kontext

TypeScript kann mit verschiedenen Strictness-Levels konfiguriert werden. Strict Mode aktiviert noImplicitAny für keine impliziten any-Typen, strictNullChecks damit null und undefined explizit gehandhabt werden müssen, strictFunctionTypes für strengere Function-Typen sowie strictPropertyInitialization damit Properties initialisiert werden müssen. Die Anforderungen umfassten maximale Type-Safety, frühe Fehler-Erkennung sowie dass Consumer-Code von strikten Typen profitiert.

### Entscheidung

Alle UJL-Packages nutzen TypeScript Strict Mode. Die tsconfig.json aller Packages definiert compilerOptions mit strict true, das alle Strict-Checks aktiviert, noUncheckedIndexedAccess true, sodass obj[key] potentially undefined ist, noImplicitReturns true, sodass alle Code-Pfade return haben müssen, sowie noFallthroughCasesInSwitch true, sodass Switch-Cases break oder return haben müssen.

### Konsequenzen

#### Vorteile

Type-Safety bedeutet Fehler zur Compile-Time statt Runtime. Null-Safety erfordert explizites Handling von null und undefined. Consumer-Hilfe bedeutet, dass Consumer-Code von strikten Types profitiert. Refactoring-Sicherheit bedeutet, dass Breaking Changes erkannt werden.

#### Nachteile

Verbosity erfordert mehr Type-Annotations. Die Lernkurve bedeutet, dass das Team mit Strict-Checks umgehen können muss.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-005, da Zod Compile-Time mit Runtime ergänzt.

## 9.16 ADR-016: Image Library Abstraction

### Status

**ACCEPTED** - Implementiert

### Kontext

Dual Image Storage (ADR-004) erfordert eine Abstraction, die beide Modi unterstützt, ohne dass Composer oder Adapter sich um Details kümmern müssen. Die Anforderungen umfassten eine einheitliche API für Inline und Backend Storage, ein Provider-Pattern für Backend-Integration sowie Lazy Loading von Bildern, sodass nicht alle sofort geladen werden.

### Entscheidung

Die Image Library nutzt ein Provider-Interface. Die Implementierung umfasst eine ImageLibrary-Klasse mit Constructor, der initialImages als `Record<string, ImageEntry>` und optional einen ImageProvider nimmt. Die resolve-Methode prüft zuerst den lokalen Cache und gibt bei Treffer das Bild zurück. Falls nicht vorhanden und ein Provider gesetzt ist, nutzt sie den Provider für Backend Storage. Falls auch das fehlschlägt, gibt sie null zurück.

Das ImageProvider-Interface definiert eine resolve-Methode, die eine ID nimmt und ein `Promise<ImageSource | null>` zurückgibt. Der Crafter Image Service implementiert dieses Interface als PayloadImageProvider mit Constructor, der apiUrl und apiKey nimmt, sowie resolve-Methode, die einen fetch zum Library Service macht mit Authorization-Header 'users API-Key' plus apiKey.

Die Usage im Composer unterscheidet zwischen Inline Storage ohne Provider und Backend Storage mit PayloadImageProvider. Das Resolve funktioniert in beiden Fällen einheitlich.

### Konsequenzen

#### Vorteile

Die einheitliche API bedeutet, dass Composer und Adapter agnostisch zum Storage-Modus sind. Das Provider-Pattern ermöglicht einfache Backend-Integration. Erweiterbarkeit erlaubt Custom Providers für S3, Cloudinary oder andere. Lazy Loading bedeutet, dass Bilder nur bei Bedarf geladen werden.

#### Nachteile

Der Async-Overhead bedeutet, dass resolve() async ist, auch für Inline.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-004 für Dual Storage Strategy sowie zu ADR-007, da Payload als Provider verwendet wird.

## 9.17 ADR-017: Embedding-Strategie für AI-ready Content

### Status

**PROPOSED** - Geplant, nicht implementiert

### Kontext

UJL soll AI-ready sein für zukünftige Use Cases. Semantische Suche soll ermöglichen, alle Module über Produkte zu finden. Content-Empfehlungen sollen Module identifizieren, die zu einem Thema passen. KI-gestütztes Editing soll nur Module ändern, die ein bestimmtes Thema betreffen. Das Problem besteht darin, dass klassische Keyword-Suche nicht für semantische Ähnlichkeit reicht. Die Anforderungen umfassen Embeddings für UJLC-Module und Medien in einem gemeinsamen Vektorraum, Storage in PostgreSQL mit pgvector sowie eine austauschbare Embedding-Pipeline ohne Vendor-Lock-in.

### Entscheidung

Embedding-Felder werden in UJLC definiert. Das UJLCMetaSchema erhält optional \_embedding_model_hash als string, das das Embedding-Modell identifiziert. Das UJLCModuleMetaSchema erhält optional \_embedding als array von numbers für das Vektor-Embedding mit beispielsweise 1536 Dimensionen.

Die Embedding-Erzeugung ist geplant am Beispiel von OpenAI Embeddings. Eine Funktion generateModuleEmbedding nimmt ein Modul, extrahiert Text aus Fields, macht einen fetch zu OpenAI embeddings endpoint mit Authorization Bearer und API-Key, sendet input als text und model als 'text-embedding-3-small' mit 1536 Dimensionen, und gibt das embedding zurück.

Das Zielbild ist ein multimodales Embedding mit gemeinsamer Funktion generateMultimodalEmbedding, die entweder Module mit Text-Embedding oder Bilder mit Image-Embedding (beispielsweise CLIP) verarbeitet.

Semantic Search mit pgvector ist geplant. Die pgvector Extension wird erstellt. Eine Embeddings-Tabelle wird angelegt mit Feldern id (TEXT PRIMARY KEY), type (TEXT NOT NULL für 'module' oder 'media'), embedding (vector mit 1536 Dimensionen), document_id (TEXT) und created_at (TIMESTAMP DEFAULT NOW). Semantic Search erfolgt via Kosinus-Ähnlichkeit mit `SELECT id, type, 1 - (embedding <=> query_embedding) AS similarity FROM embeddings WHERE type = 'module' ORDER BY embedding <=> query_embedding LIMIT 10`.

Payload Enterprise AI Features werden nicht verwendet, da UJL UJLC-Module embeddet und nicht Payload-Collections, die Embedding-Pipeline austauschbar bleiben soll ohne Vendor-Lock-in, und ein gemeinsamer Vektorraum für Module und Medien vorgesehen ist, nicht Payload-intern.

### Konsequenzen

#### Vorteile

Semantische Suche ermöglicht Content-Finder über Bedeutung. Multimodalität bedeutet Text und Bilder im gleichen Vektorraum. Austauschbarkeit verhindert Vendor-Lock-in durch Unterstützung von OpenAI, Ollama oder anderen. Self-Hosting bedeutet pgvector in eigener PostgreSQL-DB.

#### Nachteile

Die Komplexität umfasst Embedding-Pipeline und pgvector-Setup. Kosten entstehen durch API-Calls zu OpenAI oder Self-Hosted LLM. Storage-Overhead entsteht, da Embeddings Dokumente vergrößern um etwa 6KB pro Modul bei 1536D. Nicht implementiert bedeutet, dass nur Vorbereitung existiert ohne Pipeline.

### Offene Fragen

Die Embedding-Modell-Wahl zwischen OpenAI, Cohere oder Ollama (lokal) ist offen. API-Key-Management für Speicherung in Umgebungsvariablen ist ungeklärt. Batch-Processing für alle Module bei Dokument-Load ist nicht entschieden. Die Update-Strategie für Embeddings bei Modul-Änderung ist offen.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-007, da Payload ohne AI-Features verwendet wird, sowie zur offenen Entscheidung 9.23.2 bezüglich pgvector für Embeddings.

## 9.18 ADR-018: Svelte Runes für State Management

### Status

**ACCEPTED** - Implementiert

### Kontext

Svelte führt Runes ein als Ersatz für Stores (writable, readable, derived). Runes bieten Fine-grained Reactivity, sodass nur geänderte Werte Updates triggern, sind Compiler-gestützt für bessere Performance als Stores und haben eine einfachere API mit $state und $derived statt Store-Boilerplate. Die Anforderungen umfassten reaktiven State für Crafter mit Dokument, Selektion und AST, Derived Values wie rootSlot aus Dokument sowie Context-API für Component-Zugriff.

### Entscheidung

Der Crafter nutzt Svelte Runes statt Stores. Der crafter-store.svelte.ts definiert \_ujlcDocument als `$state<UJLCDocument>`, \_ujltTokenSet als `$state<UJLTTokenSet>` und \_selectedNodeId als `$state<string | null>`. Derived Values werden definiert als rootSlot aus `$derived(\_ujlcDocument.ujlc.root)`, meta aus `$derived(\_ujlcDocument.ujlc.meta)` und images aus `$derived(\_ujlcDocument.ujlc.images)`. Der imageService wird mit `$derived.by()` erstellt aus meta.\_library, images und updateImages. Functional Updates nutzen eine updateRootSlot-Funktion, die ein fn nimmt und \_ujlcDocument.ujlc.root mit `fn(\_ujlcDocument.ujlc.root)` setzt.

Die Context-API nutzt crafter-context.svelte.ts mit einem CRAFTER_KEY Symbol('crafter'), setCrafterContext-Funktion für setContext(CRAFTER_KEY, store) und getCrafterContext-Funktion für `getContext<CrafterStore>(CRAFTER_KEY)`.

### Konsequenzen

#### Vorteile

Fine-grained Reactivity bedeutet, dass nur geänderte Werte Re-Render triggern. Performance ist Compiler-optimiert. Die einfachere API bedeutet weniger Boilerplate als Stores. Type-Safety kommt TypeScript-Support out of the box.

#### Nachteile

Die neue API erfordert, dass das Team Runes lernt.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-006 für die Svelte Framework-Wahl.

## 9.19 ADR-019: Structured Content statt HTML

### Status

**ACCEPTED** - Implementiert

### Kontext

Traditionelle CMS speichern Rich Text als HTML-Strings wie `<p>Welcome to <strong>UJL</strong></p>`. Probleme entstehen, da HTML schwer zu validieren ist und einen HTML-Parser benötigt, XSS-Risiken durch unescapte User-Input bestehen, WYSIWYG-Inkonsistenzen auftreten, da Editor und Renderer nicht gleich sind, und keine strukturierte Abfragbarkeit gegeben ist.

### Entscheidung

UJL speichert alles als strukturierte Daten. Rich Text wird als ProseMirror JSON gespeichert (siehe ADR-008). Module werden als UJLC JSON mit Fields und Slots gespeichert. Images werden mit Metadaten plus Base64 oder URL gespeichert. Ein Beispiel-Dokument zeigt type 'doc' mit content Array, das paragraph mit content Array enthält, wobei text 'Welcome to ' und text 'UJL' mit marks bold gespeichert werden.

### Konsequenzen

#### Vorteile

Validierbarkeit durch Zod-Schemas für alle Daten ist gegeben. Sicherheit durch strukturierte Daten plus Escaping verhindert XSS. WYSIWYG bedeutet, dass Editor und Renderer Schema teilen. Abfragbarkeit ermöglicht JSON-Queries.

#### Nachteile

Komplexität entsteht, da ein Serializer nötig ist. Bundle-Size erhöht sich durch ProseMirror und Serializer.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-001 für das Prinzip strukturierter Daten sowie zu ADR-008 für ProseMirror für Rich Text.

## 9.20 ADR-020: Foreground-Mapping für Accessibility

### Status

**ACCEPTED** - Implementiert

### Kontext

Accessibility erfordert WCAG-konforme Kontraste (4.5:1 für AA). Manuelle Kontrast-Checks sind fehleranfällig. Das Problem besteht darin, dass Designer für jede Hintergrund-Vordergrund-Kombination manuell prüfen müssen. Die Anforderung ist automatische Textfarb-Zuordnung basierend auf Hintergrundfarbe.

### Entscheidung

Foreground-Mapping wird in UJLT definiert. Ein UJLTColorFlavor enthält shades als UJLTColorSet, lightForeground als `Record<UJLTFlavor, UJLTShadeRef>` für Hintergrund Hell sowie darkForeground als `Record<UJLTFlavor, UJLTShadeRef>` für Hintergrund Dunkel. Ein Beispiel für Primary-Hintergrund zeigt shades mit '50', '500' und '950', lightForeground mit primary '950' für Text auf Primary-Light, sowie darkForeground mit primary '50' für Text auf Primary-Dark.

Das CSS-Output setzt --primary-light-foreground-primary: var(--primary-950) und --primary-dark-foreground-primary: var(--primary-50). Die Verwendung in .button-primary setzt background-color: oklch(var(--primary-500)) und color: oklch(var(--primary-light-foreground-primary)) automatisch.

### Konsequenzen

#### Vorteile

Automatische WCAG-Konformität eliminiert manuelles Kontrast-Checking. Der Designer-Workflow pflegt Foreground-Maps im Theme. Konsistenz bedeutet, dass alle Komponenten gleiche Mappings nutzen.

#### Nachteile

Setup-Overhead erfordert, dass Foreground-Maps gepflegt werden. Weniger Flexibilität bedeutet keine per-Komponenten-Overrides.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-009 für OKLCH für präzise Kontraste.

## 9.21 ADR-021: Monorepo Package Layering

### Status

**ACCEPTED** - Implementiert

### Kontext

Monorepo-Packages müssen Dependency-Hierarchie respektieren, um zirkuläre Abhängigkeiten zu vermeiden. Die Anforderung ist eine klare Layer-Struktur mit Bottom-Up Dependencies.

### Entscheidung

UJL Package Layers sind definiert als Layer 1 (Foundation) mit @ujl-framework/types ohne Dependencies, Layer 2 (Core) mit @ujl-framework/core abhängig von types, Layer 3 (UI) mit @ujl-framework/ui abhängig von types und core, Layer 4 (Adapters) mit @ujl-framework/adapter-svelte abhängig von types, core und ui sowie @ujl-framework/adapter-web abhängig von types und core, und Layer 5 (Application) mit @ujl-framework/crafter abhängig von types, core, ui und adapter-svelte.

Die Build-Reihenfolge mit pnpm run build folgt types, core, ui, adapter-\*, crafter.

### Konsequenzen

#### Vorteile

Keine zirkulären Dependencies sind gegeben. Die klare Build-Reihenfolge ist definiert. Wartbarkeit bedeutet, dass Dependencies nachvollziehbar sind.

#### Nachteile

Manuelle Orchestrierung bedeutet kein Auto-Topological-Sort.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-010 für Monorepo-Setup.

## 9.22 ADR-022: Test-Attributes ohne Production-Overhead

### Status

**ACCEPTED** - Implementiert

### Kontext

E2E-Tests benötigen stabile Selektoren (data-testid), aber diese sollten nicht in Production-Bundles landen. Die Anforderung ist data-testid nur in Test-Builds, nicht in Production.

### Entscheidung

Conditional Attributes werden in Svelte-Komponenten genutzt. TreeNode.svelte importiert dev aus '$app/environment' und exportiert node als UJLCModuleObject. Das div-Element setzt data-testid={dev ? `tree-node-${node.meta.id}`: undefined} und data-ujl-module-id={node.meta.id}. Der Production Build entfernt data-testid, sodass nur `<div data-ujl-module-id="m1">text</div>` bleibt.

### Konsequenzen

#### Vorteile

Kein Production-Overhead bedeutet data-testid nur in Dev und Test. Stabile Tests nutzen Selektoren unabhängig von CSS.

#### Nachteile

Conditional Logic bedeutet Code-Branching für Attributes.

### Verwandte Entscheidungen

Diese Entscheidung steht in Beziehung zu ADR-011, da Playwright data-testid nutzt.

## 9.23 Offene Architekturentscheidungen

### 9.23.1 Lizenzmodell

Der Status ist nicht entschieden. Die Optionen umfassen MIT als maximal permissiv ohne Copyleft-Pflichten, Apache 2.0 als MIT plus Patent-Schutz sowie AGPL-3.0 als Copyleft auch für SaaS mit Source-Offenlegung bei Netzwerk-Nutzung. Die Präferenz ist aktuell MIT.

### 9.23.2 Semantic Search mit pgvector

Der Status ist geplant, aber nicht priorisiert. Details finden sich in ADR-017. Offene Fragen umfassen die Embedding-Modell-Wahl zwischen OpenAI, Ollama oder Cohere, API-Key-Management sowie Batch-Processing-Strategie.

### 9.23.3 Weitere Adapter

Der Status ist Community-driven. Mögliche Targets umfassen React Adapter (adapter-react), Vue Adapter (adapter-vue), HTML Adapter (adapter-html für SSG) sowie PDF Adapter (adapter-pdf für Reports). Die offene Frage ist, ob diese offiziell maintained oder Community-Beiträge sind.

### 9.23.4 Migration zwischen Storage-Modi

Der Status ist geplant (siehe ADR-004). TODOs umfassen inline zu backend durch Auto-Upload zu Library Service, backend zu inline durch Auto-Download und Embedding sowie backend zu backend durch Re-Upload zu neuer Instanz.
