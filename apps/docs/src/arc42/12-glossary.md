---
title: "Glossar"
description: "Zentrale Begriffe und Konzepte rund um UJL - von Modulen und Fields bis UJL-Theme-Datei"
---

# Glossar

## UJL-spezifische Begriffe

- **Unified JSON Layout (UJL)**  
  Ein JSON-basiertes, modulares Open-Source-Framework zur strukturierten Gestaltung und Bearbeitung von Weblayouts – mit klarer Trennung von Inhalt und Design.

- **UJL Crafter**  
  Der visuelle Editor von UJL zur Bearbeitung von `.ujlc.json`- und `.ujlt.json`-Dateien. Bietet eine zentrale Oberfläche für Entwickler:innen, Designer:innen und Redakteur:innen. Nutzt Adapter zur Rendering-Integration.

- **Adapter**  
  Komponenten, die den Abstract Syntax Tree (AST) in konkrete Ausgabeformate transformieren. UJL bietet Adapter für Svelte (adapter-svelte) und Web Components (adapter-web). Weitere Adapter können implementiert werden.

- **ContentFrame**  
  Das gerenderte Endprodukt eines UJL-Layouts – bereit zur Anzeige im Browser oder zur Weiterverwendung im Zielsystem.

- **UJL-Datei (`.ujlc.json`)**  
  JSON-Datei zur Definition von Inhalten und deren Anordnung in einem Layout. Grundlage für das modulare Rendering mit UJL.

- **Design-Konfigurationsdatei (`.ujlt.json`)**  
  JSON-Datei zur zentralen Steuerung von Farben, Schriften, Abständen und weiteren Designparametern. Bindet sich an das Corporate Design.

## Architektur und Module

- **Module**  
  Wiederverwendbare Bausteine mit Fields (Daten) und Slots (Inhaltsbereiche). Module können verschachtelt organisiert und kombiniert werden.

- **Fields**  
  Typsichere Datencontainer mit Validierung, Parsing und Fitting-Logik. Beispiele: TextField, NumberField, ImageField.

- **Slots**  
  Verschachtelte Inhaltsbereiche, die andere Module enthalten können. Ermöglichen die modulare Komposition von Layouts.

- **Composer**  
  Orchestriert den Kompositionsprozess mithilfe der ModuleRegistry und wandelt UJL-Dokumente in AST-Knoten um.

- **ModuleRegistry**  
  Verwaltet verfügbare Module und ermöglicht die Registrierung neuer Module zur Erweiterung des Systems.

- **FieldSet**  
  Eine Sammlung typisierter Fields, die ein Modul zur Dateneingabe verwendet. Jedes Field hat einen Namen, Typ und Validierungsregeln.

- **SlotSet**  
  Eine Sammlung benannter Slots, die verschachtelte Module aufnehmen können. Ermöglicht hierarchische Layouts.

- **TokenSet**  
  Eine Sammlung von Design-Tokens (Farben, Typografie, Spacing, Radius), die das visuelle Erscheinungsbild steuern. Wird aus `.ujlt.json` geladen.

- **Validator**  
  Sammlung von Validator-Funktionen im Paket `@ujl-framework/types` – überprüft die technische Korrektheit und Kompatibilität von UJL-Dokumenten:
  - **Syntaxprüfung**: Formale Validierung der JSON-Struktur via Zod-Schemas.
  - **Kompatibilitätsprüfung**: Sicherstellung, dass Dokumente mit der eingesetzten UJL-Version harmonieren.
  - **Hauptfunktionen**: `validateUJLCDocumentSafe()`, `validateUJLTDocumentSafe()`, `validateModule()`, `validateSlot()`

## Rollen und Nutzung

- **Entwickler:innen**  
  Integrieren UJL in bestehende Systeme, erstellen eigene Module und konfigurieren die Ausgabe-Logik.

- **Designer:innen**  
  Pflegen zentrale Designregeln in der `.ujlt.json`-Datei und sorgen für ein konsistentes Erscheinungsbild.

- **Redakteur:innen**  
  Bearbeiten Inhalte visuell im Crafter. Nutzen vordefinierte Module und Layouts, ohne in Code eingreifen zu müssen.

- **Konsument:innen**  
  Sehen das Endergebnis: eine klar strukturierte, responsive und designkonforme Darstellung – unabhängig vom Gerät.

## Erweiterung & Zukunft

- **LLM-Readiness** / **KI-bereit**
  UJL wird so strukturiert, dass Sprachmodelle (z. B. GPT, Mistral) Inhalte und Layouts verstehen, erzeugen oder verändern können.

- **Mehrsprachigkeit**  
  Unterstützung sprachspezifischer Inhalte direkt im `.ujlc.json`. Anbindung an Übersetzungs-APIs ist vorgesehen.

## Technische Begriffe

- **AST (Abstract Syntax Tree)**  
  Eine baumartige Darstellung der Struktur von UJL-Dokumenten, die für die Verarbeitung und Transformation verwendet wird.

- **API (Application Programming Interface)**  
  Definiert die Schnittstellen zwischen verschiedenen Komponenten des UJL-Systems und ermöglicht die Integration in externe Anwendungen.

- **JSON (JavaScript Object Notation)**  
  Das Datenformat, in dem UJL-Layouts und -Konfigurationen gespeichert werden. Ermöglicht plattformunabhängigen Datenaustausch.

- **TypeScript**  
  Eine erweiterte Version von JavaScript mit statischer Typisierung, die für die Entwicklung von UJL verwendet wird.

- **Build-Zeit-Kompilierung**  
  Der Prozess, bei dem Code bereits während der Entwicklung kompiliert wird, um die Laufzeit-Performance zu verbessern.

- **Svelte Runes**  
  Svelte 5 APIs für Reaktivität (`$state`, `$derived`, `$effect`). Ermöglichen fine-grained reactivity im Crafter und in Adaptern.

- **Shadow DOM**  
  Browser-Technologie zur Style-Isolation. UJL nutzt Shadow DOM im Web Adapter, um CSS-Konflikte mit Host-Anwendungen zu verhindern.

- **Tree-Shaking**  
  Build-Optimierung, die ungenutzten Code automatisch entfernt. Reduziert Bundle-Größe durch Eliminierung nicht verwendeter Module und Funktionen.

- **Workspace Protocol**  
  pnpm-Feature zur Referenzierung von Packages innerhalb eines Monorepos (`workspace:*`, `workspace:^`). Ermöglicht koordinierte Versionierung.

- **Changeset**  
  Ein Versionierungs-Tool für Monorepos. Koordiniert Package-Versionen, generiert Changelogs automatisch und folgt Semantic Versioning.

## Design und Styling

- **Theme**
  Eine Sammlung von Designregeln, die das visuelle Erscheinungsbild von UJL-Layouts definieren.

- **CSS-in-JS**
  Ein Ansatz, bei dem CSS-Stile direkt in JavaScript/TypeScript definiert werden, um die Komponentenmodularität zu verbessern.

- **Responsive Design**
  Ein Designansatz, bei dem sich Layouts automatisch an verschiedene Bildschirmgrößen und Geräte anpassen.

- **Utility-First CSS**
  Ein CSS-Framework-Ansatz, bei dem vordefinierte Utility-Klassen für schnelle Styling-Anpassungen verwendet werden.
