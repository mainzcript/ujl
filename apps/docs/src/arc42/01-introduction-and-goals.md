---
title: "Einführung und Ziele"
description: "Projektvision, Ziele, Stakeholder und Qualitätsanforderungen von UJL"
---

# Einführung und Ziele

## Überblick

**Unified JSON Layout (UJL)** ist ein Open-Source-Framework für visuelles Content-Authoring mit einem zentralen Versprechen:

> **Create and maintain brand-compliant and accessible websites with AI.**

UJL trennt Inhalt und Design konsequent auf technischer Ebene: Content wird in `.ujlc.json`-Dokumenten strukturiert, Design-Systeme werden zentral in `.ujlt.json`-Theme-Dateien definiert. Diese strikte Trennung ermöglicht **Brand-Compliance by Design** – Designregeln sind technisch verankert und können nicht versehentlich gebrochen werden. Der **UJL Renderer** führt beide Elemente zusammen und erzeugt daraus einen ContentFrame (HTML/CSS/JS), der konsistent dem Corporate Design entspricht.

Im Unterschied zu klassischen Page Buildern, die auf frei editierbarem HTML/CSS basieren, arbeitet UJL mit strukturierten, validierten JSON-Daten. Dies macht das Framework besonders geeignet für KI-gestützte Content-Erstellung, da Sprachmodelle strukturierte Daten generieren, die automatisch gegen Schemas validiert werden.

**Kernprinzipien:**

- **Brand-Compliance by Design**: Designregeln sind architektonisch verankert, nicht optional
- **Accessibility Guaranteed**: WCAG-Konformität ist in der Modularchitektur fest verankert
- **AI-native**: JSON-Struktur optimiert für Large Language Models mit Schema-Validierung
- **Modular & Extensible**: Vollständig erweiterbar durch Custom Modules und Fields
- **Framework-Agnostic**: Adapter-Pattern ermöglicht Rendering in beliebigen Frameworks

**Ziel des MVP:** Entwicklung eines lauffähigen Editors (Crafter) sowie eines Renderers zur Erzeugung von ContentFrames.

### Kernziele des MVP

- **K1 Inhaltspflege**: Content-Manager sollen Inhalte (Texte, Bilder) im UJL Crafter durch frei kombinierbare Module zu eigenen Layouts zusammenstellen können. Das Corporate Design bleibt durch `.ujlt`-Definitionen automatisch gewahrt.
- **K2 Designsteuerung**: Designer sollen Farben, Schriften und Abstände zentral in `.ujlt` verwalten können. Änderungen wirken sofort global.
- **K3 Validierung & Rendering**: Entwickler sollen JSON-Strukturen zuverlässig per Schema validieren können.
- **K4 Konsumenten-Nutzen**: Nutzer sollen eine einheitliche, responsive und CI-konforme Darstellung auf allen Geräten sehen.

## 1.1 Requirements Overview

### 1.1.1 Funktionale Anforderungen (MVP)

**F1: Laden & Rendern**

- Renderer kann `.ujlc.json`- und `.ujlt.json`-Dateien einlesen und daraus ContentFrames (HTML/CSS/JS) erzeugen
- Änderungen an `.ujlt` wirken sofort auf alle Layouts
- **Akzeptanzkriterium**: Bei gültigen Dateien wird ein ContentFrame erzeugt. Änderungen wirken global und unmittelbar.

**F2: Module**

- **MVP-Module**: TextBlock, Image, Gallery, Button, Card, Container, Grid, CallToAction
- Module sind frei kombinierbar und können verschachtelt werden
- System kann mit leeren Feldern umgehen
- **Akzeptanzkriterium**: Automatisch responsive (keine Layout-Brüche bei Bildschirmbreite > 375 px)

**F3: Content-Editor / UJL Crafter**

- Inhalte visuell im Crafter pflegen (Drag & Drop Editor)
- Real-time Preview der Content-Änderungen
- Export/Import von UJL-Dokumenten
- **Akzeptanzkriterium**: "Speichern" erzeugt valide `.ujlc.json`-Datei ohne Pfadangaben

**F4: Theme-Editor / `.ujlt`**

- Verwaltung von Farben (OKLCH), Typografie, Spacing, Radius
- Light/Dark Mode Support mit automatischer Kontrast-Berechnung
- Echtzeit-Vorschau
- **Akzeptanzkriterium**: Änderungen wirken sofort global auf alle Dokumente

**F5: Validierung**

- Zod-basierte Runtime Validation mit Type Inference
- CLI Tool für Validierung von `.ujlc.json` und `.ujlt.json`
- Rekursive Schema-Definitionen für verschachtelte Module
- **Akzeptanzkriterium**: Ungültige Strukturen werden zuverlässig erkannt mit Exit-Codes und JSON-Pfad-Fehlern

**F6: Medien-Subsystem**

- Base64 Data-URLs direkt in `.ujlc.json` (Inline Storage)
- Client-seitige Komprimierung im MediaPicker (≤100KB Ziel, ≤200KB Fallback)
- `UJLImageData` mit `dataUrl: string`
- Backend-Service Integration mit Payload CMS

**F7: Rich Text Editing**

- TipTap/ProseMirror-basiertes Rich Text System
- Strukturierte ProseMirror-Dokumente statt HTML-Strings
- WYSIWYG-Konsistenz zwischen Editor und Renderer
- SSR-safe Serialization

**F8: Framework-Agnostisches Rendering**

- AST-basierte Transformation von UJL-Dokumenten
- Adapter Pattern für verschiedene Rendering-Targets
- Implementierte Adapter für MVP: Svelte 5 Components, Web Components
- Type-safe Field-System (TextField, NumberField, RichTextField, ImageField)
- Module Registry Pattern für Erweiterbarkeit

**Explizit NICHT für MVP:**

- **LLM-Integration**: Konzeptionell vorhanden (JSON-Struktur optimiert für LLMs), aber keine aktive Integration im MVP

### 1.1.2 Nicht-funktionale Anforderungen (MVP)

**NF1: Usability**

- **Performance-Anforderung**: Crafter muss bei bis zu 200 Einträgen <200 ms reagieren
- Klare Status-/Fehlermeldungen
- **Keine Pflichtfelder erforderlich**: System kann immer mit leeren Feldern umgehen (essentiell für Baukasten)

**NF2: Maintainability**

- Codegliederung: `core` (Schemas/Validator), `renderer` (Adapters), `crafter`, `media`
- TypeScript für vollständige Type Safety
- Monorepo mit pnpm Workspaces + Changesets
- Koordinierte Versionierung aller Packages
- Medien-Subsystem über Adapter-Schnittstelle erweiterbar

**NF3: Accessibility**

- Vollständig über Tastatur navigierbar (getestet in E2E-Tests)
- Keyboard-Navigation im Crafter (Ctrl+C/X/V, Delete, Pfeiltasten)
- Crafter mit sichtbaren Fokuszuständen
- OKLCH-Farbraum für präzise Kontrast-Berechnungen (min. 4.5:1 für Text)
- Semantische HTML-Strukturen in allen Modulen

**NF4: Testbarkeit**

- Playwright E2E Tests für Crafter User Flows (getestet: Page Setup, Editor, Preview, Designer, Sidebar)
- Vitest Unit Tests für Core-Logik
- Test-Attributes (`data-testid`) ohne Production-Overhead (nur bei `PUBLIC_TEST_MODE=true`)
- CI/CD mit GitLab (Build, Test, Lint, Deploy)

**NF5: Performance**

- Svelte 5 für minimale Bundle-Größe und schnelles Rendering
- Compiled Components ohne Virtual DOM Overhead
- Lazy Resolution von Media Library Entries
- Effiziente Tree-Synchronisation im Crafter
- Fine-grained Reactivity mit Svelte 5 Runes

**NF6: Erweiterbarkeit**

- Abstrakte Base-Klassen für Module und Fields
- Module Registry für Custom Modules
- Adapter Pattern für neue Rendering-Targets
- Template-Dateien für Entwickler:innen (`_template.ts` in `fields/` und `modules/`)

**NF7: Portabilität**

- Inline Storage für standalone Dokumente (Base64)
- Backend Storage für Enterprise-Szenarien (Payload CMS vorhanden, aber Integration optional)
- Export/Import für Migrations

## 1.2 Quality Goals

Die drei wichtigsten Qualitätsziele für UJL, priorisiert nach Bedeutung:

| Priorität | Qualitätsziel                  | Motivation                                                                                                                        | Umsetzung                                                                                        |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **1**     | **Brand-Compliance by Design** | Redakteur:innen können Corporate Design nicht brechen. Designregeln sind architektonisch verankert, nicht nur dokumentiert.       | Strikte Trennung UJLC/UJLT, Schema-Validierung, Module Registry, OKLCH-Farbraum                  |
| **2**     | **Accessibility Guaranteed**   | Barrierefreiheit darf nicht optional sein. WCAG-Konformität muss technisch sichergestellt werden, nicht durch manuelle Reviews.   | Semantische Module, automatische Kontrast-Checks (4.5:1), TipTap-Schema mit korrekten Strukturen |
| **3**     | **AI-native Architecture**     | KI soll UJL-Dokumente zuverlässig generieren können. Strukturierte Daten mit Schema-Validierung machen AI-Output deterministisch. | JSON-basierte Dokumente, Zod-Validierung, strukturierte Fields, ProseMirror-Dokumente            |

**Weitere Qualitätsziele:**

- **Erweiterbarkeit**: Neue Module, Fields und Adapter ohne Core-Änderungen (Module Registry, Adapter Pattern)
- **Performance**: Minimale Bundle-Größe durch Svelte 5 Compilation, keine Runtime-Overhead
- **Developer Experience**: TypeScript Type Safety, Template-Dateien, ausführliche Dokumentation
- **Maintainability**: Monorepo mit koordinierter Versionierung, CI/CD Pipeline, E2E Tests

## 1.3 Stakeholders

### 1.3.1 Primäre Stakeholder

| Rolle                | Erwartungen                                                                                                          | Nutzen aus UJL                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Redakteur:innen**  | Schnelle, visuell Content-Erstellung ohne technisches Wissen. Keine versehentlichen Designfehler.                    | Drag & Drop Editor, Real-time Preview, keine CSS/HTML-Kenntnisse nötig. Design-Guardrails schützen vor Fehlern. |
| **Designer:innen**   | Zentrale Theme-Verwaltung, konsistente CI/CD über alle Dokumente. Keine manuellen Reviews für jede Content-Änderung. | Theme Editor, OKLCH-Farbraum, automatische Kontrast-Checks. Ein Theme für alle Dokumente.                       |
| **Entwickler:innen** | Erweiterbar, gut dokumentiert, type-safe. Integration in bestehende Systeme. Keine proprietären Lock-ins.            | Module Registry, Adapter Pattern, TypeScript, Open Source (MIT). Umfangreiche READMEs und Templates.            |

### 1.3.2 Sekundäre Stakeholder

| Rolle                      | Erwartungen                                                                                                      | Nutzen aus UJL                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Marketing-Teams**        | Schnelle Publikation von Kampagnen-Pages, Landingpages. Hoher Publikationsdruck, kurze Iterationszyklen.         | Visuelles Authoring ohne Design-Reviews. Schnelle Content-Erstellung innerhalb definierter Leitplanken. |
| **Web-Agenturen**          | Kundenprojekte sollen langfristig wartbar bleiben. Redaktionelle Pflege ohne "Design-Drift" oder Supportaufwand. | White-Label Editor mit zentraler Governance. Kund:innen arbeiten selbstständig ohne Brand-Risiko.       |
| **SaaS-Anbieter**          | Eingebetteter Editor für Endkund:innen. Governance ohne komplexe Workflows oder Custom-Code.                     | White-Label Crafter, strukturierte Daten, Validierungsmechanismen. Editor als produktfähige Komponente. |
| **Compliance-Beauftragte** | WCAG-Konformität, EU Accessibility Act. Nachweisbare Barrierefreiheit ohne nachträgliche Audits.                 | Architektonische Accessibility-Garantien. Automatische Kontrast-Checks, semantische Strukturen.         |

### 1.3.3 Technische Stakeholder

| Rolle                           | Erwartungen                                                                               | Nutzen aus UJL                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Core Team**                   | Wartbarkeit, Erweiterbarkeit, Community-Contributions. Open Source ohne Vendor Lock-in.   | Monorepo mit Changesets, TypeScript, arc42-Dokumentation. MIT License, GitHub/GitLab.     |
| **Community Developers**        | Erstellung eigener Module, Adapter, Extensions. Klare Schnittstellen, gute Dokumentation. | Template-Dateien, abstrakte Base-Klassen, READMEs. Module Registry Pattern.               |
| **DevOps / Platform Engineers** | Self-Hosting, kein Vendor Lock-in. Integration in bestehende CI/CD-Pipelines.             | Docker Compose für Payload CMS, GitLab CI/CD Configs. RESTful API, Environment Variables. |

### 1.3.4 Nutzer-Profile (Use Cases)

Detaillierte Anwendungsszenarien und Nutzen-Beschreibungen finden sich in [Use Cases](/about/02-use-cases):

1. **Web-Agenturen** mit redaktionell gepflegten Kundenprojekten
2. **Marketing-Teams** mit hohem Publikationsdruck
3. **Organisationen** mit Compliance- und Barrierefreiheitsanforderungen
4. **SaaS-Unternehmen** mit eingebettetem Editor (White-Label)
5. **KI-gestützte Content-Erstellung** mit Kontrolle

## 1.4 Design Goals

### 1.4.1 Architektonische Design-Ziele

**DZ1: Separation of Concerns**

- Content (UJLC), Design (UJLT) und Rendering (Adapter) sind strikt getrennt
- Composer orchestriert die Transformation von Dokumenten zu AST
- Jede Schicht ist unabhängig austauschbar

**DZ2: Type Safety über alle Schichten**

- Zod Schemas als Single Source of Truth mit Type Inference
- TypeScript für Compile-Time Safety
- Runtime Validation bei externen Daten (Datei-Upload, CMS, AI)

**DZ3: Immutability & Functional Updates**

- Crafter Context API verwendet funktionale Updates (`updateTokenSet(fn)`)
- Svelte 5 Runes für fine-grained Reactivity
- Keine direkten Mutations, nur neue States

**DZ4: Modulare Komposition**

- Module komponieren sich aus Fields (Daten) und Slots (Inhaltsbereiche)
- Verschachtelung ermöglicht komplexe Layouts
- Rekursive Schema-Definitionen mit `z.lazy()`

### 1.4.2 UI/UX Design-Ziele

**DZ5: Progressive Disclosure**

- Redakteur:innen sehen nur relevante Module für ihren Kontext
- Designer:innen arbeiten in separatem Designer-Modus
- Property Panel zeigt nur konfigurierbare Fields des ausgewählten Moduls

**DZ6: Real-time Feedback**

- Live Preview aktualisiert sich bei jeder Content-Änderung
- Bidirektionale Tree ↔ Preview Synchronisation
- Hover-Effects und visuelle Selektion

**DZ7: Keyboard-First Workflows**

- `Ctrl+C/X/V` für Clipboard-Operationen
- `Ctrl+I` für Component Insertion
- `Delete` für Node-Löschung
- Tree-Navigation mit Pfeiltasten

**DZ8: Responsive & Accessible UI**

- Crafter selbst ist WCAG 2.1 AA konform
- Dark/Light Mode Support
- Screen-Reader-Support für alle Interaktionen

### 1.4.3 Data Design-Ziele

**DZ9: Human-Readable & AI-Friendly**

- JSON-Format für UJL-Dokumente
- Strukturierte ProseMirror-Dokumente für Rich Text
- Klare Naming Conventions (`ujlc`, `ujlt`, `type`, `fields`, `slots`)

**DZ10: Versionierung & Migrations**

- `_version` Field in Meta-Daten
- Schema Evolution ohne Breaking Changes (soweit möglich)
- Changesets für koordinierte Package-Releases

**DZ11: Portabilität & Self-Containment**

- Inline Media Storage für standalone Dokumente
- Backend Storage für Enterprise-Szenarien
- Export/Import für Cross-System-Migrations

### 1.4.4 Performance Design-Ziele

**DZ12: Minimale Bundle-Größe**

- Svelte 5 Compilation ohne Runtime-Overhead
- Tree-Shaking für ungenutzte Module
- Web Components für universelle Einsetzbarkeit

**DZ13: Lazy Loading & Code Splitting**

- Media Library Entries werden on-demand resolved
- Dynamic Imports für große Dependencies
- Responsive Images mit mehreren Sizes (WebP)

**DZ14: Effiziente State-Updates**

- Fine-grained Reactivity mit Svelte 5 Runes
- Immutable Updates vermeiden unnötige Re-Renders
- Centralized Expand State für Tree-Performance

## 1.5 MVP Scope & Status

### Abweichungen von ursprünglichen Anforderungen

Detaillierte Dokumentation aller Abweichungen siehe `_support/projektmanagement/mvp-anforderungen-final.md`:

**Hauptabweichungen:**

- **Video-Modul entfernt**: Zu komplex für MVP, wird verschoben
- **LLM-Integration entfernt**: Konzeptionell vorhanden, aber keine aktive Integration
- **Pflichtfelder-Konzept entfernt**: System kann mit leeren Feldern umgehen (essentiell für Baukasten)

_Letzte Aktualisierung: 2026-01-12_
