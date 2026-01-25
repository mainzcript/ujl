---
title: "Bausteinsicht"
description: "Bausteinsicht und Moduldiagramm des UJL-Systems"
---

# Bausteinsicht

## Übersicht der Struktur

Die Dokumentation folgt einer hierarchischen Gliederung: **Abschnitt 5.1** zeigt das Gesamtsystem mit allen Hauptbausteinen (Packages, Apps, Services) und deren Schnittstellen. Die **Abschnitte 5.2-5.7** vertiefen ausgewählte Bausteine und zeigen deren interne Struktur im Detail. Für wichtige Komponenten wie den Composer, die Module Registry oder den Crafter werden zusätzliche Detailsichten bereitgestellt.

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

Die Architektur folgt dem **Layered Architecture Pattern** mit definierten Verantwortlichkeiten und strikter Dependency-Direction. Am Fundament liegt der **Foundation Layer** (`types`), der als Single Source of Truth alle TypeScript-Typen und Zod-Schemas definiert. Darauf baut der **Core Layer** auf (`core`), der die Kernlogik enthält, insbesondere den Composer und die Module Registry, die UJLC-Dokumente in einen Abstract Syntax Tree transformieren.

Der **UI Layer** (`ui`) stellt wiederverwendbare UI-Komponenten bereit, die sowohl im Editor als auch in den Adaptern genutzt werden. Im **Adapter Layer** (`adapter-svelte`, `adapter-web`) erfolgt die framework-spezifische Transformation des AST in konkrete UI-Technologien wie Svelte Components oder Web Components. Diese Trennung ermöglicht es, neue Rendering-Targets hinzuzufügen, ohne die Core-Logik anzufassen.

Der **Application Layer** (`crafter`, `dev-demo`, `docs`) bündelt die End-User-Anwendungen, die die darunterliegenden Schichten orchestrieren. Als separater **Service Layer** existiert `library` (Payload CMS), der bei Bedarf als Backend für Media-Management dient, aber keine Abhängigkeit für die Core-Funktionalität darstellt.

Diese Schichtung bringt mehrere Vorteile: Dependencies zeigen ausschließlich nach unten (top-down), was zirkuläre Abhängigkeiten verhindert. Jede Schicht ist isoliert testbar, und wichtige Komponenten wie Adapter lassen sich austauschen, ohne höhere Schichten zu beeinflussen. Die Umsetzung als Monorepo mit pnpm Workspaces ermöglicht koordinierte Releases über alle Packages hinweg.

### Enthaltene Bausteine

#### NPM Packages

| Baustein           | Verantwortung                                                 | NPM-Package                     |
| ------------------ | ------------------------------------------------------------- | ------------------------------- |
| **types**          | TypeScript-Typen, Zod-Schemas und Validator für UJL-Dokumente | `@ujl-framework/types`          |
| **core**           | Composer, Module Registry, Field System, Media Library        | `@ujl-framework/core`           |
| **ui**             | shadcn-svelte UI-Komponenten (Button, Card, Dialog, etc.)     | `@ujl-framework/ui`             |
| **adapter-svelte** | Svelte 5 Adapter (AST → Svelte Components)                    | `@ujl-framework/adapter-svelte` |
| **adapter-web**    | Web Components Adapter (AST → Custom Elements)                | `@ujl-framework/adapter-web`    |
| **crafter**        | Visual Editor (WYSIWYG) für Content und Themes                | `@ujl-framework/crafter`        |
| **examples**       | Beispiel-Dokumente und Themes (.ujlc.json, .ujlt.json)        | `@ujl-framework/examples`       |

#### Services

| Baustein    | Verantwortung                        | Pfad               |
| ----------- | ------------------------------------ | ------------------ |
| **library** | Payload CMS Image Management Backend | `services/library` |

#### Apps

| Baustein     | Verantwortung                          | Pfad            |
| ------------ | -------------------------------------- | --------------- |
| **dev-demo** | Demo-Applikation (zeigt UJL in Aktion) | `apps/dev-demo` |
| **docs**     | Dokumentations-Website (VitePress)     | `apps/docs`     |

### Wichtige Schnittstellen

#### Schnittstelle 1: UJL Document Formats

Die primäre Schnittstelle des UJL-Systems sind **JSON-basierte Dokumentformate** (`.ujlc.json` für Content, `.ujlt.json` für Themes). Diese Dokumente werden von verschiedenen Producern erzeugt: Der visuelle **Crafter-Editor** für interaktive Bearbeitung, **KI-Systeme** für automatische Content-Generierung, oder **manuelle Editoren** für direkte JSON-Manipulation. Als Consumer fungieren das `types`-Package (für Validierung) und der **Composer** im `core`-Package, der UJLC-Dokumente in einen Abstract Syntax Tree transformiert.

UJLC-Dokumente enthalten Metadaten (`meta`), eine Image-Bibliothek (`images`) und eine Wurzelstruktur aus Modulen (`root`). UJLT-Dokumente definieren Metadaten und Design-Tokens (`tokens`). Die vollständigen TypeScript-Typen und Zod-Schemas sind im `types`-Package definiert (siehe [Abschnitt 5.2.1](#_5-2-1-baustein-types)).

#### Schnittstelle 2: Abstract Syntax Tree (AST)

Der **Abstract Syntax Tree** ist die Datenstruktur zwischen Core- und Adapter-Layer. Er wird vom **Composer** (im `core`-Package) produziert und von den Adapter-Packages (`adapter-svelte`, `adapter-web`) konsumiert. Der AST abstrahiert die UJLC-Modulstruktur in eine flache, rendering-optimierte Form, die unabhängig vom finalen UI-Framework ist.

Die AST-Node-Struktur garantiert drei wichtige Eigenschaften: Jeder Node besitzt eine **eindeutige ID**, die aus dem UJLC-Dokument übernommen wird, wichtig für Editor-Integration und Modul-Tracking. Das **`type`-Feld** ermöglicht Dispatch-Logik in Adaptern (z.B. `type: "button"` → `<Button>`-Component). Die **`props` sind node-spezifisch** und folgen keinem generischen Schema, was Flexibilität für unterschiedliche Module ermöglicht.

```typescript
type UJLAbstractNode = {
	type: string; // 'text', 'button', 'container', etc.
	id: string; // Unique Module ID (preserved from UJLC)
	props: Record<string, unknown>; // Node-specific properties
};
```

#### Schnittstelle 3: Payload CMS Media API

Die **Media API** des `library`-Service (Payload CMS) ist eine REST-Schnittstelle für Backend-basiertes Media-Management. Sie kommuniziert über JSON und ist über eine **konfigurierbare Base-URL** erreichbar (typischerweise `http://localhost:3000/api` in Development, produktionsspezifisch in Production). Die Authentifizierung erfolgt per API-Key im `Authorization`-Header.

| Methode | Endpoint          | Funktion                                  |
| ------- | ----------------- | ----------------------------------------- |
| GET     | `/api/images`     | Liste alle Bilder (Pagination, Filtering) |
| GET     | `/api/images/:id` | Einzelnes Bild                            |
| POST    | `/api/images`     | Upload (multipart/form-data)              |
| PATCH   | `/api/images/:id` | Metadata-Update                           |
| DELETE  | `/api/images/:id` | Löschung                                  |

Die API wird von zwei primären Consumern genutzt: Der **Crafter-Editor** verwendet sie für Write-Operationen (Upload, Media Library Browser, Metadaten-Updates). **ContentFrames** (gerenderte UJL-Dokumente) nutzen die Read-Endpunkte (`GET /api/images/:id`), um Bilder beim Rendering abzurufen, wenn UJLC-Dokumente Backend-Referenzen statt Inline-Base64 enthalten. Die API wird im Backend-Storage-Modus genutzt; alternativ kann **Inline Storage** konfiguriert werden (Base64-kodierte Bilder direkt in `.ujlc.json`), was Portabilität ohne Backend-Abhängigkeit ermöglicht.

#### Schnittstelle 4: Crafter Integration API

Der **Crafter** ist als NPM-Package (`@ujl-framework/crafter`) in Host-Applikationen integrierbar und bietet eine programmatische API für Konfiguration und Steuerung. Host-Anwendungen (z.B. Custom CMSe, Redaktionstools) können den visuellen Editor einbetten und auf Document-Events reagieren.

Die Integration erfolgt über eine **Mount-API**, die den Crafter in ein DOM-Element rendert. Die Host-Anwendung konfiguriert verfügbare Module, Themes und Media-Provider über ein Config-Objekt. Der Crafter exponiert **Event-Handler** für Document-Änderungen (`onDocumentChange`, `onSave`), was bidirektionale Synchronisation mit externen Systemen ermöglicht. Bei Bedarf kann eine **Custom Module Registry** bereitgestellt werden, um projektspezifische Module zu registrieren.

Die Host-Anwendung steuert das Verhalten über Config-Parameter: `initialDocument` (Start-UJLC), `theme` (aktives UJLT-Theme), `mediaProvider` (Backend vs. Inline), `moduleRegistry` (verfügbare Module) und `readonly` (Editor-Modus). Dies ermöglicht Szenarien wie "Read-Only-Preview", "Custom-Module-Integration" oder "Multi-Tenant-Editing".

**Consumer:** Custom CMSe, Redaktionstools, Headless CMS Plugins (z.B. Strapi, Contentful Extensions)

#### Schnittstelle 5: Adapter Integration APIs

Die **Adapter-Packages** (`adapter-svelte`, `adapter-web`) bieten programmatische APIs für die Integration von UJL-Rendering in Host-Applikationen. Beide Adapter folgen dem gleichen `UJLAdapter`-Interface (definiert in `@ujl-framework/types`) und transformieren AST-Nodes in framework-spezifische UI-Komponenten.

- `@ujl-framework/adapter-svelte` konvertiert AST-Nodes in Svelte 5 Components und nutzt die `mount()`-API für imperatives Rendering. Die Host-Anwendung übergibt AST-Node, Token-Set und Konfigurationsoptionen (`target`, `mode`, `showMetadata`). Der Adapter gibt ein `MountedComponent` zurück mit `instance` (Svelte Component) und `unmount()`-Methode für Cleanup.
- `@ujl-framework/adapter-web` erzeugt Custom Elements (`<ujl-content>`) für framework-agnostisches Rendering. Der Adapter kompiliert Svelte-Komponenten zur Build-Zeit in ein standalone Web Component, sodass keine Svelte-Runtime-Dependency benötigt wird. Shadow DOM sorgt für Style-Isolation. Zusätzlich zu den Svelte-Adapter-Optionen unterstützt der Web Adapter einen `eventCallback` für Click-to-Select-Editor-Integration.

Beide Adapter akzeptieren `target` (DOM-Element oder CSS-Selector), `mode` (Theme-Modus: 'light', 'dark', 'system') und `showMetadata` (für Editor-Integration via `data-ujl-module-id`-Attribute). Die Typen sind in den jeweiligen Adapter-Packages definiert (`SvelteAdapterOptions`, `WebAdapterOptions`) und erweitern das generische `UJLAdapter`-Interface aus `@ujl-framework/types`.

**Consumer:** Svelte/SvelteKit-Anwendungen (adapter-svelte), Framework-agnostische Web-Apps (adapter-web), Static Site Generators, React/Vue-Apps via Web Components

## 5.2 Foundation Layer (Level 2)

### 5.2.1 Baustein: types

Das `types`-Package bildet das Fundament der gesamten UJL-Architektur. Es definiert nicht nur die TypeScript-Typen für UJLC- und UJLT-Dokumente, sondern enthält auch die **Validierungslogik** über Zod-Schemas und einen eigenständigen **CLI-Validator** (`ujl-validate`). Diese Doppelrolle aus Runtime-Validierung und statischer Typsicherheit macht `types` zur wichtigsten Komponente für Datenintegrität im gesamten System.

#### Whitebox: types

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

Das `types`-Package hat wenige externe Abhängigkeiten: Es nutzt ausschließlich **Zod 4.2** für Schema-Validierung und Type Inference. Dieser Fokus sorgt dafür, dass die Foundation Layer leichtgewichtig und stabil bleibt.

Als Single Source of Truth wird `types` von nahezu allen anderen Packages konsumiert: `@ujl-framework/core` importiert sämtliche Typen für Composer und Module Registry. Die Adapter-Packages (`adapter-svelte`, `adapter-web`) benötigen die AST-Node-Definitionen für korrektes Rendering. Der `crafter` importiert alle Typen für Editor-Funktionalität, während Demo-Apps die Document-Types für Beispiel-Content verwenden. Diese Rolle macht Änderungen an `types` besonders folgenreich. Jede Breaking Change betrifft die gesamte Architektur.

#### Besondere Merkmale

Das `types`-Package nutzt **Zod Type Inference**, um TypeScript-Typen automatisch aus Schema-Definitionen abzuleiten. Dies folgt dem DRY-Prinzip (Don't Repeat Yourself): Jedes Schema wie `UJLCModuleObjectSchema` generiert automatisch einen korrespondierenden TypeScript-Typ via `z.infer<typeof Schema>`. Dadurch existiert nur eine einzige Definition, die sowohl Runtime-Validierung als auch statische Typsicherheit bereitstellt.

Eine technische Besonderheit ist die Unterstützung **rekursiver Strukturen** über `z.lazy()`. Da UJL-Module unbegrenzt verschachtelt werden können (ein Grid-Modul kann weitere Grid-Module enthalten), müssen die Zod-Schemas zirkuläre Referenzen auflösen. Die `z.lazy()`-Funktion ermöglicht dies, indem sie die Schema-Evaluierung bis zur tatsächlichen Nutzung verzögert.

Das Package exportiert außerdem ein **CLI-Tool** (`ujl-validate`), das UJLC- und UJLT-Dokumente validiert. Das Tool erkennt automatisch den Dokumenttyp anhand der JSON-Struktur und gibt detailliertes Feedback inklusive Statistiken (Anzahl Module, verwendete Types, Fehlerpositionen) aus. Dies ist besonders nützlich für CI/CD-Pipelines oder manuelle Content-Qualitätsprüfungen.

## 5.3 Core Layer (Level 2)

### 5.3.1 Baustein: core

Das `core`-Package ist das Herzstück des UJL-Systems und enthält die Kernlogik: Den **Composer**, der UJLC-Dokumente in Abstract Syntax Trees transformiert, die **Module Registry** für die Verwaltung verfügbarer Module, das **Field System** für typisierte Datenvalidierung und die **Media Library** für flexible Media-Storage-Strategien.

#### Whitebox: core

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

Der **Composer** orchestriert die Transformation von UJLC-Dokumenten in Abstract Syntax Trees. Er koordiniert die rekursive Composition über die Module Registry, löst Media-Referenzen auf und garantiert, dass jedes Modul korrekt in AST-Nodes transformiert wird.

Der Composer wird standardmäßig mit einer **Default-Registry** initialisiert, die alle Built-in-Module enthält (Button, Container, Grid, Card, Text, Call-to-Action, Image). Alternativ kann eine **Custom Registry** übergeben werden, um Built-in-Module zu ersetzen oder zu erweitern. Die Hauptmethode `compose()` transformiert ein vollständiges UJLC-Dokument in einen AST-Root-Node und ist asynchron, da Media-Referenzen aufgelöst werden müssen. Die Hilfsmethode `composeModule()` transformiert einzelne Module und wird rekursiv für verschachtelte Module (Slots) aufgerufen.

Der Composer ermöglicht **dynamische Registry-Verwaltung** über `registerModule()` und `unregisterModule()`, was zur Laufzeit Custom-Module hinzufügen oder entfernen erlaubt.

Der Crafter erstellt aktuell intern einen neuen Composer mit Default-Registry (`new Composer()`), exponiert diesen aber nicht über seine API. Entwickler, die `@ujl-framework/crafter` installieren, haben aktuell **keine Möglichkeit**, Custom-Module zu registrieren. Die Crafter-API wird in Zukunft erweitert, z.B. durch eine `modules`-Option in `UJLCrafterOptions` oder eine exponierte `registerModule()`-Methode. Dies ermöglicht Custom-Module-Integration ohne Core-Änderungen.

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

Der Composer garantiert **ID-Propagation** über zwei getrennte Identifier: `node.id` wird für jeden AST-Node neu generiert (`generateUid()`), um eindeutige Rendering-Identity zu garantieren. Die ursprüngliche Modul-ID aus `moduleData.meta.id` wird in `meta.moduleId` übernommen, was durchgängiges Tracking von UJLC-Dokument bis zum gerenderten DOM ermöglicht. Die **rekursive Composition** für verschachtelte Module (Slots) erfolgt über `composeModule()`-Aufrufe innerhalb der Module-Logik selbst, wobei der Composer als Koordinator fungiert. Bei Bedarf integriert der Composer einen **Media Resolver** (ImageLibrary), der Backend-Referenzen in tatsächliche Image-URLs auflöst. Das **Error Handling** ist robust: Unbekannte Modultypen führen nicht zum Absturz, sondern erzeugen Error-Nodes, die im UI als Platzhalter mit Fehlermeldung gerendert werden können.

#### 5.3.1.2 Komponent: Module Registry

Die Module Registry verwaltet alle verfügbaren Module und ermöglicht dem Composer, Module anhand ihres `type`-Strings zu finden. Sie unterstützt dynamische Registrierung und Deregistrierung von Modulen zur Laufzeit, was Custom-Module-Integration ermöglicht.

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

Die **Module Base Class** ist eine abstrakte Basisklasse, die den Vertrag für Custom Modules definiert. Sie stellt Identifikations- und UI-Metadaten (`name`, `label`, `category`), Struktur-Definitionen (`fields`, `slots`) und die Transformationsmethode `compose(moduleData, composer)` bereit, die Module-Daten in AST-Nodes umwandelt.

Durch diese Architektur ermöglicht die Module Base Class Custom Module Extensions ohne Core-Änderungen (siehe [Erweiterbarkeit 8.8](./08-crosscutting-concepts#_8-8-erweiterbarkeit)).

#### 5.3.1.4 Konzept: Module-zu-Node-Transformation (1:N)

**Fundamentales Architektur-Prinzip:** Ein Modul in einem UJLC-Dokument entspricht nicht zwingend einem einzelnen AST-Node. Die Beziehung ist **1:N**: Ein Modul kann bei der Composition mehrere AST-Nodes erzeugen.

**Warum ist das wichtig?**

Module sind **logische, editierbare Einheiten** im Content-Dokument. AST-Nodes hingegen sind **Render-Primitive** für Adapter. Um komplexe Layouts zu ermöglichen, generieren manche Module zusätzliche strukturelle Wrapper-Nodes, die nicht eigenständig editierbar sind.

**Beispiel: Grid-Modul**

Ein Grid-Modul mit der ID `"grid-001"` im UJLC-Dokument erstellt bei der Composition:

```typescript
// Input: 1 Grid-Modul im UJLC-Dokument
{
  type: "grid",
  meta: { id: "grid-001" },
  slots: {
    items: [
      { type: "text", meta: { id: "text-001" }, ... },
      { type: "button", meta: { id: "button-001" }, ... }
    ]
  }
}

// Output: 5 AST-Nodes (1 Grid + 2 Grid-Items + 2 Children)
{
  type: "grid",
  id: generateUid(),               // Unique AST Node ID
  meta: {
    moduleId: "grid-001",          // Welchem Modul gehört dieser Node?
    isModuleRoot: true             // Ist dieser Node das Modul selbst? (editierbar)
  },
  props: {
    children: [
      // Grid-Item 1 (struktureller Wrapper, nicht editierbar)
      {
        type: "grid-item",
        id: generateUid(),
        meta: {
          moduleId: "grid-001",    // Gehört zum Grid-Modul
          isModuleRoot: false      // Nicht editierbar (strukturell)
        },
        props: {
          children: [
            // Text-Modul (editierbar)
            {
              type: "text",
              id: generateUid(),
              meta: {
                moduleId: "text-001",
                isModuleRoot: true
              },
              props: { ... }
            }
          ]
        }
      },
      // Grid-Item 2 (struktureller Wrapper, nicht editierbar)
      {
        type: "grid-item",
        id: generateUid(),
        meta: {
          moduleId: "grid-001",
          isModuleRoot: false
        },
        props: {
          children: [
            // Button-Modul (editierbar)
            {
              type: "button",
              id: generateUid(),
              meta: {
                moduleId: "button-001",
                isModuleRoot: true
              },
              props: { ... }
            }
          ]
        }
      }
    ]
  }
}
```

**Semantische Bedeutung der AST-Metadaten:**

Die AST-Metadaten erfüllen drei Funktionen: `node.id` ist der eindeutige Identifier des AST-Nodes selbst (generiert mit `generateUid()`) und garantiert, dass jeder Node im Rendering-Tree unterscheidbar ist. `meta.moduleId` beantwortet die Frage "Zu welchem Modul gehört dieser Node?" und wird für alle Nodes außer dem Root-Wrapper gesetzt. Damit lassen sich strukturelle Wrapper-Nodes ihrem ursprünglichen Modul zuordnen. `meta.isModuleRoot` ist ein Boolean-Flag, das nur für editierbare Module-Nodes `true` ist: Es markiert, welche Nodes die eigentlichen Module repräsentieren und nicht nur Implementierungsdetails (wie `grid-item`-Wrapper).

**Konsequenzen für Adapter und Editor:**

Diese Metadaten-Strategie hat direkte Auswirkungen auf Rendering und Editor-Integration: **Alle Nodes** werden gerendert, einschließlich struktureller Wrapper wie `grid-item`, um korrekte Layouts zu garantieren. In visuellen Editoren sind jedoch **nur Nodes mit `meta.isModuleRoot === true` anklickbar und editierbar**. Wrapper-Nodes werden übersprungen, um die Benutzererfahrung nicht zu verwirren. Adapter setzen bei `showMetadata={true}` DOM-Attribute (`data-ujl-module-id`) auf allen Nodes mit `meta.moduleId`, was Editor-Integration via Click-to-Select ermöglicht. Durch das Modul-Tracking "wissen" selbst strukturelle Nodes wie Grid-Items, dass sie zum Grid-Modul gehören (`moduleId = "grid-001"`).

**Weitere Beispiele:**

Die 1:N-Beziehung zeigt sich in verschiedenen Modultypen unterschiedlich: Ein **Call-to-Action-Modul** erzeugt typischerweise zwei Nodes (1 CTA-Container-Node + 1 Button-Node), die beide zum selben CTA-Modul gehören. Ein **Card-Modul** generiert einen Card-Node plus Header- und Footer-Wrapper-Nodes für strukturelle Trennung, falls benötigt. **Container-Module** hingegen folgen meist einem 1:1-Mapping, da sie keine zusätzlichen strukturellen Wrapper benötigen.

**Fazit:** Die 1:N-Beziehung ermöglicht flexible Layouts ohne die Editierbarkeit zu gefährden. Strukturelle Nodes sind Implementierungsdetails des Adapters, während Module die logische Content-Struktur repräsentieren.

#### 5.3.1.5 Weitere Komponenten (kompakt)

Die folgenden Komponenten sind für die Architektur relevant, werden aber kurz gehalten. Details siehe [Querschnittliche Konzepte (Kapitel 8)](./08-crosscutting-concepts).

**Field Base Class:**

- **Verantwortung:** Abstrakte Basisklasse für Field-Typen mit Validation & Fitting
- **Kernfunktionen:** `validate(raw)` für KI-Feedback (Type Guard), `fit(value)` für Robustheit (Constraints/Fallbacks)
- **Built-in Types:** TextField, RichTextField, NumberField, ImageField
- **Status:** Validator-Registry-Integration fehlt noch ([TD-011](./11-risks-and-technical-debt#_11-2-11-validator-registry-integration-fehlt))

**Media Library:**

- **Verantwortung:** Abstraktion für Media Storage (Inline vs. Backend)
- **Dual Storage:** Inline (Base64 in `.ujlc.json`) oder Backend (Payload CMS via `ImageProvider`)
- **API:** `async resolve(id: string): Promise<UJLImageData | null>`
- **Referenz:** [ADR-004](./09-architecture-decisions#_9-4-adr-004-dual-media-storage-strategy-inline-vs-backend)

**TipTap Schema:**

- **Verantwortung:** Shared Rich Text Schema für Editor & Serializer
- **Export:** `ujlRichTextExtensions` (StarterKit mit serialisierbaren Extensions)
- **Garantie:** Gleiches Schema → WYSIWYG-Konsistenz
- **Referenz:** [ADR-008](./09-architecture-decisions#_9-8-adr-008-tiptap-prosemirror-für-rich-text-editing)

## 5.4 UI Layer (Level 2)

### 5.4.1 Baustein: ui

Das `ui`-Package stellt wiederverwendbare UI-Komponenten auf Basis von **shadcn-svelte** bereit. Diese Komponenten werden sowohl im Adapter-Layer für das Rendering von UJL-Dokumenten als auch im Crafter für die Editor-Oberfläche verwendet.

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

Das `ui`-Package nutzt **tailwind-variants** für type-safe Component-Variants, was konsistentes Styling über alle Komponenten hinweg garantiert. **Dark Mode Support** wird über `mode-watcher` implementiert, das automatisch auf System-Preferences reagiert und manuelle Theme-Umschaltung ermöglicht.

Das Package baut auf bewährten Svelte-Libraries auf: **`bits-ui`** liefert headless UI-Primitives mit eingebauter Accessibility (ARIA-Attributes, Keyboard Navigation). **`svelte-sonner`** steuert Toast-Notifications für User-Feedback. **`paneforge`** ermöglicht Resizable Panels für Layout-Management. Das Styling basiert auf **Tailwind CSS 4.x**, was Utility-First-CSS mit modernem Design-System verbindet.

Das `ui`-Package wird von zwei primären Consumern genutzt: `@ujl-framework/adapter-svelte` verwendet alle UI-Komponenten für das Rendering von UJL-Dokumenten im Frontend. `@ujl-framework/crafter` importiert die UI-Komponenten für die Editor-Oberfläche selbst (Toolbars, Dialoge, Sidebars).

## 5.5 Adapter Layer (Level 2)

### 5.5.1 Baustein: adapter-svelte

Das `adapter-svelte`-Package konvertiert UJL Abstract Syntax Trees in Svelte 5 Components. Es ist der primäre Adapter für Svelte- und SvelteKit-Anwendungen und dient als Basis für den Web Adapter.

#### Whitebox: adapter-svelte

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

Die **AdapterRoot**-Komponente ist der Einstiegspunkt für das Rendering und übernimmt vier Aufgaben: Sie injiziert Design-Tokens als CSS Custom Properties (`--color-primary-500`, `--spacing-md`, etc.), setzt das Theme-Mode-Attribut für Dark/Light-Switching, fügt bei Bedarf `data-ujl-module-id`-Attribute für Editor-Integration hinzu und delegiert Click-Events an einen Callback für Click-to-Select-Funktionalität.

```typescript
interface AdapterRootProps {
	node: UJLAbstractNode; // AST Root Node
	tokenSet?: UJLTTokenSet; // Design Tokens (falls gesetzt)
	mode?: "light" | "dark" | "system"; // Theme Mode
	showMetadata?: boolean; // Add data-ujl-module-id attributes
	eventCallback?: (moduleId: string) => void; // Click-to-select callback
}
```

#### 5.5.1.2 Komponent: ASTNode (Recursive Router)

Die **ASTNode**-Komponente ist ein rekursiver Router, der jeden AST-Node anhand seines `type`-Feldes an die entsprechende Svelte-Komponente dispatcht. Für Container-Nodes mit verschachtelten Children erfolgt ein rekursiver Aufruf via `<svelte:self>`, was beliebig tiefe Verschachtelungen ermöglicht. Unbekannte Node-Typen werden von einer Error-Komponente aufgefangen.

```svelte
{#if node.type === 'button'}
  <Button {node} {showMetadata} {eventCallback} />
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

#### 5.5.1.3 Komponent: prosemirror-serializer

Der **ProseMirror-Serializer** konvertiert Rich-Text-Dokumente (ProseMirror-Format) synchron in HTML-Strings. Er ist **SSR-safe** (verwendet keine Browser-APIs), **synchron** (kein async/await), implementiert **XSS-Prevention** durch HTML-Escaping und garantiert **WYSIWYG-Konsistenz**, da er dieselben Extensions wie der TipTap-Editor verwendet.

```typescript
// Einfache API: ProseMirror-Dokument → HTML-String
export function prosemirrorToHtml(doc: ProseMirrorDocument): string;
```

#### 5.5.1.4 Komponent: Imperative Adapter

Der **Imperative Adapter** ermöglicht programmatisches Component-Mounting für Kontexte außerhalb von Svelte-Templates, z.B. in bestehenden JavaScript-Anwendungen oder für dynamisches Rendering.

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

Das `adapter-web`-Package stellt ein **framework-agnostisches Custom Element** (`<ujl-content>`) bereit, das in React, Vue, Angular oder beliebigen JavaScript-Anwendungen verwendet werden kann. Es kompiliert die Svelte-Komponenten aus `adapter-svelte` zur Build-Zeit in ein standalone Web Component, sodass keine Svelte-Runtime-Dependency benötigt wird.

#### Whitebox: adapter-web

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

Die `webAdapter`-Funktion ist der programmatische Einstiegspunkt für die Web Component-Integration.

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

Die Implementierung zeigt den typischen Ablauf: Target-Element ermitteln, Custom Element erstellen, Properties setzen und ins DOM einfügen.

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

Der **Crafter** ist ein visueller Editor für UJLC- und UJLT-Dokumente. Er ermöglicht WYSIWYG-Bearbeitung von Content (Editor-Modus) und Themes (Designer-Modus) und kann als NPM-Package in Host-Applikationen integriert werden.

#### Whitebox: crafter

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

Die **Root Component** verwaltet den globalen State mit **Svelte 5 Runes**. Der State umfasst das aktuelle UJLC-Dokument, das UJLT-Theme, den Editor-Modus und UI-State wie expandierte Nodes.

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

Die **Crafter Context API** bündelt alle State-Mutationen und erzwingt **Functional Updates** (immutable). Dies garantiert vorhersagbare State-Änderungen und ermöglicht Features wie Undo/Redo.

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

Der **Editor-Modus** ermöglicht Content-Bearbeitung mit Navigation Tree (Hierarchie-Ansicht), Drag & Drop für Node-Reordering, Clipboard-Unterstützung (Ctrl+C/X/V), Keyboard Shortcuts, einem durchsuchbaren Component Picker und Click-to-Select-Synchronisation zwischen Preview und Tree.

Das Clipboard nutzt eine **Dual-Storage-Strategie**: Primär die moderne Clipboard API, mit localStorage als Fallback für ältere Browser.

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

Der **Designer-Modus** ermöglicht Theme-Bearbeitung mit Color Palette Editor (OKLCH-basiert mit automatischer Shade-Generierung von 50-950), Typography Editor (Font Family, Size, Weight), Spacing & Radius Editor und Live Preview für Echtzeit-Updates.

Die **Color Palette Generation** nutzt OKLCH für perzeptuelle Uniformität:

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

Der **Media Service** abstrahiert die Media-Storage-Strategie und ermöglicht sowohl Inline-Speicherung (Base64 in UJLC) als auch Backend-Speicherung (Payload CMS). Die Implementierung wird über eine Factory basierend auf der Konfiguration gewählt.

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

Es existieren zwei Implementierungen: Der **InlineImageService** speichert Bilder als Base64-Strings direkt im UJLC-Dokument (mit Compression via compressorjs), was keine Backend-Infrastruktur erfordert. Der **BackendImageService** nutzt die Payload CMS API mit multipart/form-data Upload und API-Key Authentication für größere Projekte.

Eine Factory wählt die Implementierung basierend auf der Konfiguration:

```typescript
function createImageService(config: ImageLibraryConfig): ImageService {
	if (config.storage === "backend" && config.url) {
		return new BackendImageService(config.url, apiKey);
	}
	return new InlineImageService(ujlcDocument);
}
```

### 5.6.2 Baustein: demo

Die **Demo-App** demonstriert die UJL-Integration mit dem Web Adapter und zeigt, wie UJL-Dokumente in einer standalone HTML-Anwendung gerendert werden.

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

Die **Dokumentations-Website** wird mit **VitePress 2.0** (Vue-basierter Static Site Generator) erstellt und enthält die Arc42-Architekturdokumentation sowie User Documentation.

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

Das **Examples-Package** stellt Beispiel-Dokumente und Themes bereit, die für Demos, Tests und als Referenz für die Dokumentstruktur dienen.

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

### 5.7.1 Baustein: library (Payload CMS)

Das **Library-Service** ist ein Backend für Media Management, basierend auf **Payload CMS**. Es wird bei Bedarf genutzt und bietet Upload, Metadaten-Verwaltung, responsive Image-Generierung und eine REST-API für den Crafter und ContentFrames.

#### Whitebox: library Service

```mermaid
graph TB
    subgraph "library Service (Docker)"
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

Die Images Collection definiert das Schema für Bilder mit automatischer Generierung von 8 responsiven Größen (xs bis max), WebP-Konvertierung und IPTC-konformen Credit-Informationen.

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

| Package        | Build Tool | Output                                              | Distribution            |
| -------------- | ---------- | --------------------------------------------------- | ----------------------- |
| types          | TypeScript | `dist/*.js` + `dist/*.d.ts`                         | NPM (geplant)           |
| core           | TypeScript | `dist/*.js` + `dist/*.d.ts`                         | NPM (geplant)           |
| ui             | SvelteKit  | `dist/*.js` + `dist/*.svelte` + `dist/styles/*.css` | NPM (geplant)           |
| adapter-svelte | SvelteKit  | `dist/*.js` + `dist/*.svelte` + `dist/styles/*.css` | NPM (geplant)           |
| adapter-web    | Vite       | `dist/index.js` (bundled) + `dist/index.d.ts`       | NPM (geplant)           |
| crafter        | SvelteKit  | `dist/**/*` (SvelteKit Package)                     | NPM (geplant)           |
| demo           | Vite       | `dist/**/*` (Static Files)                          | Private                 |
| docs           | VitePress  | `.vitepress/dist/**/*` (Static Site)                | GitLab Pages            |
| media          | Next.js    | Docker Image                                        | Docker Hub (bei Bedarf) |

## 5.9 Querschnittliche Aspekte

### 5.9.1 Versionierung (Changesets)

Die Versionierung nutzt **Changesets** mit **Fixed Versioning**: Alle Packages werden synchron versioniert, um Kompatibilitätsprobleme zwischen Framework-Teilen zu vermeiden. Der Workflow sieht vor, dass auf Feature Branches Changesets erstellt werden (mit Changelog-Einträgen), die dann auf dem develop Branch automatisch in Versions-Updates und CHANGELOG-Einträge umgewandelt werden. Das manuelle Publishing erfolgt über `pnpm publish -r --access public`. Die Konfiguration verknüpft alle `@ujl-framework/*` Packages als Fixed Group, sodass sie stets die gleiche Versionsnummer tragen.

### 5.9.2 Testing-Strategie

**Unit Tests (Vitest):**

- Alle Core-Packages (types, core, ui)
- Coverage-Ziel: 80%+ für wichtige Pfade
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

Die CI/CD Pipeline automatisiert Build, Test, Qualitätsprüfung und Deployment über **GitLab CI**. Sie durchläuft fünf Stages in sequenzieller Reihenfolge:

1. **install** - `pnpm install --frozen-lockfile` (mit Cache)
2. **build** - `pnpm run build` (alle Packages)
3. **test** - `pnpm run test` (Vitest Unit Tests)
4. **quality** - `pnpm run lint` + `pnpm run check` (ESLint + TypeScript)
5. **deploy** - Dokumentations-Website nach GitLab Pages (nur main/develop Branch)
