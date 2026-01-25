---
title: "Glossar"
description: "Wichtige Begriffe und Konzepte rund um UJL - von Modulen und Fields bis zur UJL-Theme-Datei"
---

# Glossar

## UJL-spezifische Begriffe

- **Unified JSON Layout (UJL)**  
  Ein JSON-basiertes, modulares Open-Source-Framework zur strukturierten Gestaltung und Bearbeitung von Weblayouts, mit Trennung von Inhalt und Design.

- **UJLC (UJL Content Document)**  
  Das Content-Dokumentformat von UJL (`.ujlc.json`). Enthält Metadaten (`meta`), eine Image-Bibliothek (`images`) sowie die Modulstruktur (`root`).

- **UJLT (UJL Theme Document)**  
  Das Theme-Dokumentformat von UJL (`.ujlt.json`). Enthält Metadaten (`meta`) und Design-Tokens (`tokens`) für Farben, Typografie, Spacing und Radius.

- **UJL Crafter**  
  Der visuelle Editor von UJL zur Bearbeitung von `.ujlc.json`- und `.ujlt.json`-Dateien. Bietet eine Oberfläche für Entwickler:innen, Designer:innen und Redakteur:innen. Nutzt Adapter zur Rendering-Integration.

- **dev-demo**  
  Kleine Demo-Anwendung (`apps/dev-demo`) zur Evaluierung und zum Debugging der Crafter-Integration, inklusive Umschalten zwischen Inline- und Backend-Storage.

- **Adapter**  
  Komponenten, die den Abstract Syntax Tree (AST) in konkrete Ausgabeformate transformieren. UJL bietet Adapter für Svelte (adapter-svelte) und Web Components (adapter-web). Weitere Adapter können implementiert werden.

- **UJLAdapter**  
  Abstraktes Adapter-Interface (in `@ujl-framework/types`), das die Transformation eines AST in ein konkretes Render-Target beschreibt.

- **AdapterRoot**  
  Root-Komponente aus `@ujl-framework/adapter-svelte`, die AST und TokenSet zusammenführt und das Rendering der Svelte-Komponenten initialisiert.

- **ContentFrame**  
  Das gerenderte Endprodukt eines UJL-Layouts, bereit zur Anzeige im Browser oder zur Weiterverwendung im Zielsystem.

- **UJLC-Dokument (`.ujlc.json`)**  
  Konkrete Instanz eines UJLC-Content-Dokuments: beschreibt Inhalt und Struktur über Module/Fields/Slots, enthält aber keine Design-Informationen.

- **UJLT-Dokument (`.ujlt.json`)**  
  Konkrete Instanz eines UJLT-Theme-Dokuments: beschreibt Designparameter als Tokens und enthält keine Content-Daten.

- **Library Service (`services/library`)**  
  Backend-Service für Asset-Management (Uploads, Metadaten, responsive Images) auf Basis von Payload CMS und PostgreSQL. Stellt eine REST-API bereit, die Crafter und ContentFrames im Backend-Storage-Modus nutzen können.

## Architektur und Module

- **Module**  
  Wiederverwendbare Bausteine mit Fields (Daten) und Slots (Inhaltsbereiche). Module können verschachtelt organisiert und kombiniert werden.

- **ModuleBase**  
  Basisklasse bzw. Vertrag für Module, inklusive Metadaten (`name`, `label`, `category`), Definition von Fields/Slots und der `compose()`-Transformation.

- **Fields**  
  Typsichere Datencontainer mit Validierung, Parsing und Fitting-Logik. Beispiele: TextField, NumberField, ImageField.

- **FieldBase**  
  Basisklasse bzw. Vertrag für Fields, inklusive `validate()` (Prüfung/Fehlermeldungen) und `fit()` (Normalisierung und Fallbacks).

- **Slots**  
  Verschachtelte Inhaltsbereiche, die andere Module enthalten können. Ermöglichen die modulare Komposition von Layouts.

- **Composer**  
  Orchestriert den Kompositionsprozess mithilfe der ModuleRegistry und wandelt UJL-Dokumente in AST-Knoten um.

- **ModuleRegistry**  
  Verwaltet verfügbare Module und ermöglicht die Registrierung neuer Module zur Erweiterung des Systems.

- **Image Library**  
  Abstraktion im Core, die Image-IDs zu konkreten Bilddaten auflöst. Unterstützt Inline Storage (Data-URLs/Base64 im UJLC) und Backend Storage über einen Provider.

- **Image Service**  
  Crafter-Komponente, die Bildoperationen (Upload, List, Metadaten) kapselt. Je nach Storage-Modus nutzt sie Inline Storage oder den Library Service und migriert Dokumente beim Laden auf den konfigurierten Modus.

- **Storage-Modus (Images)**  
  Konfiguration für die Speicherung von Bildern: `inline` (eingebettet im UJLC) oder `backend` (Referenzen über den Library Service).

- **Migration (Storage-Modus)**  
  Automatisches Umschreiben eines UJLC-Dokuments zwischen `inline` und `backend`, wenn Dokument-Modus und Crafter-Konfiguration nicht zusammenpassen.

- **ImageProvider**  
  Schnittstelle, über die die Image Library Bilder aus externen Quellen (z. B. Library Service) auflösen kann.

- **FieldSet**  
  Eine Sammlung typisierter Fields, die ein Modul zur Dateneingabe verwendet. Jedes Field hat einen Namen, Typ und Validierungsregeln.

- **SlotSet**  
  Eine Sammlung benannter Slots, die verschachtelte Module aufnehmen können. Ermöglicht hierarchische Layouts.

- **TokenSet**  
  Eine Sammlung von Design-Tokens (Farben, Typografie, Spacing, Radius), die das visuelle Erscheinungsbild steuern. Wird aus `.ujlt.json` geladen.

- **Validator**  
  Sammlung von Validator-Funktionen im Paket `@ujl-framework/types`, prüft die technische Korrektheit und Kompatibilität von UJL-Dokumenten:
  - **Syntaxprüfung**: Formale Validierung der JSON-Struktur via Zod-Schemas.
  - **Kompatibilitätsprüfung**: Sicherstellung, dass Dokumente mit der eingesetzten UJL-Version harmonieren.
  - **Hauptfunktionen**: `validateUJLCDocumentSafe()`, `validateUJLTDocumentSafe()`, `validateModule()`, `validateSlot()`
  - **CLI**: Das Binary `ujl-validate` validiert UJLC- und UJLT-Dokumente über die Kommandozeile.

- **Mount-API**  
  Programmierschnittstelle, um den Crafter in eine Host-Anwendung in ein DOM-Element einzubetten und per Config (z. B. Module, Theme, Library-Optionen) zu initialisieren.

- **CrafterContext / Operations API**  
  Interne (editor-zentrierte) Context-API im Crafter für Mutationen am Dokument, z. B. `operations.updateNodeField()`, `operations.moveNode()`, `operations.copyNode()` und `operations.pasteNode()`.

## Rollen und Nutzung

- **Entwickler:innen**  
  Integrieren UJL in bestehende Systeme, erstellen eigene Module und konfigurieren die Ausgabe-Logik.

- **Designer:innen**  
  Pflegen Designregeln in der `.ujlt.json`-Datei und sorgen für ein konsistentes Erscheinungsbild.

- **Redakteur:innen**  
  Bearbeiten Inhalte visuell im Crafter. Nutzen vordefinierte Module und Layouts, ohne in Code eingreifen zu müssen.

- **Konsument:innen**  
  Sehen das Endergebnis: eine strukturierte, responsive und designkonforme Darstellung, unabhängig vom Gerät.

## Erweiterung & Zukunft

- **LLM-Readiness** / **KI-bereit**
  UJL wird so strukturiert, dass Sprachmodelle (z. B. GPT, Mistral) Inhalte und Layouts verstehen, erzeugen oder verändern können.

- **Mehrsprachigkeit**  
  Unterstützung sprachspezifischer Inhalte direkt im `.ujlc.json`. Anbindung an Übersetzungs-APIs ist vorgesehen.

## Technische Begriffe

- **AST (Abstract Syntax Tree)**  
  Eine baumartige Darstellung der Struktur von UJL-Dokumenten, die für die Verarbeitung und Transformation verwendet wird.

- **ADR (Architecture Decision Record)**  
  Dokumentierte Architekturentscheidung inklusive Begründung und Konsequenzen (siehe Kapitel 9).

- **API (Application Programming Interface)**  
  Definiert die Schnittstellen zwischen verschiedenen Komponenten des UJL-Systems und ermöglicht die Integration in externe Anwendungen.

- **CMS (Content Management System) / Headless CMS**  
  Systeme zur Verwaltung von Inhalten. UJL ist kein CMS, kann aber mit (Headless) CMS kombiniert werden; der Library Service nutzt Payload CMS für Asset-Management.

- **JSON (JavaScript Object Notation)**  
  Das Datenformat, in dem UJL-Layouts und -Konfigurationen gespeichert werden. Ermöglicht plattformunabhängigen Datenaustausch.

- **TypeScript**  
  Eine erweiterte Version von JavaScript mit statischer Typisierung, die für die Entwicklung von UJL verwendet wird.

- **Zod**  
  TypeScript-first Schema- und Validierungsbibliothek. In UJL dienen Zod-Schemas als Grundlage für Runtime-Validierung und Type Inference.

- **CLI (Command Line Interface)**  
  Kommandozeilen-Schnittstelle; in UJL z. B. für Validierung (CLI-Validator im `types`-Package).

- **Build-Zeit-Kompilierung**  
  Der Prozess, bei dem Code bereits während der Entwicklung kompiliert wird, um die Laufzeit-Performance zu verbessern.

- **Svelte Runes**  
  Svelte 5 APIs für Reaktivität (`$state`, `$derived`, `$effect`). Ermöglichen fine-grained reactivity im Crafter und in Adaptern.

- **SSR (Server-Side Rendering)**  
  Rendering auf dem Server statt im Browser. UJL strebt SSR-sichere Verarbeitung an (z. B. synchrone Serialisierung für Rich Text).

- **Shadow DOM**  
  Browser-Technologie zur Style-Isolation. UJL nutzt Shadow DOM im Web Adapter, um CSS-Konflikte mit Host-Anwendungen zu verhindern.

- **REST**  
  Architekturstil für Web-APIs, häufig über HTTP/JSON. Der Library Service stellt eine REST-API bereit.

- **XSS (Cross-Site Scripting)**  
  Sicherheitsklasse, bei der ungefilterte Inhalte Skripte einschleusen können; UJL setzt auf strukturierte Datenmodelle und defensives Rendering, um Risiken zu reduzieren.

- **WYSIWYG**  
  „What You See Is What You Get“: Bearbeitung mit direkter visueller Vorschau (z. B. im Crafter).

- **E2E (End-to-End)**  
  Tests, die vollständige User-Flows in einem echten Browser prüfen (z. B. mit Playwright).

- **WCAG (Web Content Accessibility Guidelines)**  
  Standardisierte Richtlinien für Barrierefreiheit im Web; UJL orientiert sich an WCAG 2.2.

- **ARIA (Accessible Rich Internet Applications)**  
  Spezifikation für zusätzliche Accessibility-Semantik (z. B. Rollen/Attribute) in Web-UIs.

- **Tree-Shaking**  
  Build-Optimierung, die ungenutzten Code automatisch entfernt. Reduziert Bundle-Größe durch Eliminierung nicht verwendeter Module und Funktionen.

- **NPM Registry / NPM**  
  Verteilungskanal für JavaScript-Packages; UJL-Packages sind zur Veröffentlichung als NPM-Packages vorgesehen.

- **pnpm**  
  Package Manager, der in UJL für das Monorepo (Workspaces) und reproduzierbare Installationen eingesetzt wird.

- **Workspace Protocol**  
  pnpm-Feature zur Referenzierung von Packages innerhalb eines Monorepos (`workspace:*`, `workspace:^`). Ermöglicht koordinierte Versionierung.

- **Changeset**  
  Ein Versionierungs-Tool für Monorepos. Koordiniert Package-Versionen, generiert Changelogs automatisch und folgt Semantic Versioning.

- **VitePress**  
  Static-Site-Generator (Vite-basiert), mit dem die Dokumentations-Website (`apps/docs`) erstellt wird.

## Design und Styling

- **Theme**
  Eine Sammlung von Designregeln, die das visuelle Erscheinungsbild von UJL-Layouts definieren.

- **Design Tokens**  
  Benannte Designwerte (z. B. Farben, Typografie, Abstände), die im Theme gepflegt und von Adaptern ins konkrete Styling übersetzt werden.

- **OKLCH**  
  Perzeptueller Farbraum (Lightness/Chroma/Hue), der für konsistentere Paletten und verlässlichere Kontraststeuerung genutzt werden kann.

- **Tailwind CSS**  
  Utility-first CSS-Framework, das in UJL für schnelles, konsistentes Styling (u. a. basierend auf Tokens/CSS-Variablen) eingesetzt wird.

- **CSS-in-JS**
  Ein Ansatz, bei dem CSS-Stile direkt in JavaScript/TypeScript definiert werden, um die Komponentenmodularität zu verbessern.

- **Responsive Design**
  Ein Designansatz, bei dem sich Layouts automatisch an verschiedene Bildschirmgrößen und Geräte anpassen.

- **Utility-First CSS**
  Ein CSS-Framework-Ansatz, bei dem vordefinierte Utility-Klassen für schnelle Styling-Anpassungen verwendet werden.
