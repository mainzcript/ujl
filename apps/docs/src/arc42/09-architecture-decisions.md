---
title: "Architekturentscheidungen"
description: "Wichtige Architekturentscheidungen und deren Begründung"
---

# Architekturentscheidungen

## 9.1 ADR-001: Strikte Trennung von Content (UJLC) und Design (UJLT)

Um Brand-Compliance und Accessibility nicht nur als Guidelines, sondern architektonisch zu erzwingen, trennt UJL Content und Design strikt in zwei Dokumenttypen. UJLC (`.ujlc.json`) enthält ausschließlich strukturierte Inhalte (Module, Felder, Slots) und UJLT (`.ujlt.json`) Design-Tokens (z. B. Farben, Typografie, Spacing), die im Theme gepflegt werden und die ein Composer zur Laufzeit in einen AST zusammenführt. Das sorgt für konsistente CI und schnelle Theme-Updates, reduziert aber Flexibilität für per-Dokument-Design und erhöht den initialen Setup- und Lernaufwand.

## 9.2 ADR-002: Modulares Plugin-System mit Registry Pattern

Damit das Framework erweiterbar bleibt, ohne den Core zu destabilisieren, setzt UJL auf ein Registry-basiertes Plugin-Modell, in dem Module als definierte Einheiten registriert und beim Composing über ihren Typ aufgelöst werden. Fields kapseln Validierung und Normalisierung (z. B. via Zod und TypeScript-Typing), sodass Drittanbieter-Module konsistent integrierbar bleiben und Daten zur Laufzeit abgesichert sind. Der Preis dafür sind mehr Boilerplate, Template-Bedarf und eine spürbare Lernkurve für das Modulsystem.

## 9.3 ADR-003: Adapter Pattern für Framework-Agnostisches Rendering

Um die Core-Logik unabhängig vom jeweiligen UI-Framework zu halten, rendert UJL nicht direkt, sondern erzeugt zunächst einen AST, der anschließend über Adapter in unterschiedliche Targets übersetzt wird (z. B. Svelte-Komponenten oder Web Components). Dadurch bleibt die fachliche Composition stabil, während neue Adapter ohne Core-Änderungen hinzukommen können. Gleichzeitig entstehen Implementierungsaufwand pro Target, unterschiedliche Bundle-Größen und die Notwendigkeit, Adapter-Versionen synchron zu halten.

## 9.4 ADR-004: Dual Image Storage Strategy (Inline vs. Backend)

Für Bilder unterstützt UJL zwei Storage-Modi, die sich an unterschiedlichen Use Cases orientieren: Inline Storage (portabel, da Bilder im Dokument eingebettet sind) und Backend Storage (skalierbar, da Bilder über einen Provider/Resolver aus dem Library Service bezogen werden). So funktionieren Standalone-Dokumente ebenso wie Workflows mit Metadaten und Versionierung. Je nach Modus fällt entweder Dateigröße (Inline) oder Infrastruktur- und Betriebs-Komplexität (Backend) stärker ins Gewicht.

## 9.5 ADR-005: Zod-basierte Runtime Validation mit TypeScript Type Inference

Da UJL-Dokumente häufig aus externen Quellen stammen (Datei, CMS, AI), reicht Compile-Time-Typing nicht aus; deshalb definiert UJL seine Dokument- und Modulstrukturen als Zod-Schemas und leitet daraus TypeScript-Typen ab. Das liefert Runtime-Validierung mit verständlichen Fehlermeldungen (auch für rekursive Strukturen) und hält Types und Schemas synchron. Nachteile sind zusätzlicher Validierungs-Overhead sowie eine größere Bundle-Size gegenüber rein statischen Typen.

## 9.6 ADR-006: Svelte 5 als primäres UI-Framework

Für Crafter (Editor) und den primären Rendering-Adapter setzt UJL auf Svelte 5, weil es mit kompiliertem Output, feingranularer Reaktivität (Runes) und einer einfachen Lifecycle-API gute Performance und geringe Bundle-Größe bei hoher Entwicklerproduktivität verbindet. Die Wahl erleichtert außerdem Web-Component-Exports über Custom Elements. Gleichzeitig sind Ökosystem und Community kleiner als bei React/Vue, und Svelte 5 ist als Technologie vergleichsweise jung.

## 9.7 ADR-007: Payload CMS für den Library Service

Für die Image Library nutzt UJL Payload CMS im Library Service als Headless-Backend, um Upload, Metadatenpflege (z. B. Alt-Text, Credits, i18n) und eine API out of the box zu erhalten und gleichzeitig TypeScript-first zu bleiben. In Kombination mit PostgreSQL und integrierter Bildverarbeitung (z. B. responsive Größen und moderne Formate) entsteht ein professioneller Asset-Workflow. Der Trade-off sind zusätzliche Infrastruktur, Setup-Aufwand und laufende Betriebs- bzw. Hosting-Kosten.

## 9.8 ADR-008: TipTap/ProseMirror für Rich Text Editing

Für Rich-Text-Editing verwendet UJL TipTap/ProseMirror, um Inhalte als strukturierte, serialisierbare JSON-Dokumente (statt HTML-Strings) zu erfassen und zu validieren. Das ermöglicht ein gemeinsames Schema zwischen Editor und Renderer, ist SSR-tauglich und reduziert Sicherheitsrisiken (z. B. XSS). Die Kehrseite sind zusätzliche Komplexität, größere Bundle-Size und eine Lernkurve rund um ProseMirror-Konzepte.

## 9.9 ADR-009: OKLCH Farbraum für Design Tokens

Für Farb-Tokens nutzt UJL OKLCH, weil der Farbraum perzeptuell gleichmäßiger ist als RGB/HSL und damit Palette-Shades, Interpolation und Kontrastberechnungen konsistenter und besser steuerbar werden. Das unterstützt verlässlichere WCAG-Kontraste und harmonischere Farbsysteme. Gleichzeitig sind die Berechnungen komplexer, der Farbraum weniger verbreitet und Fallbacks für ältere Umgebungen können nötig sein.

## 9.10 ADR-010: pnpm Workspaces + Changesets für Monorepo

Für das Monorepo verwendet UJL pnpm Workspaces (effizientes Dependency-Management mit Workspace-Protokoll) und Changesets für koordinierte Versionierung und Changelogs über mehrere Packages. Das unterstützt reproduzierbare Builds, konsistente Releases und saubere lokale Dependencies. Es verlangt aber ein gutes Verständnis der Build-Abhängigkeiten und bringt eine Lernkurve für das Release-Tooling mit sich.

## 9.11 ADR-011: Playwright für E2E Testing des Crafters

Da der Crafter viele Interaktionen umfasst, die Unit-Tests nicht realistisch abbilden (z. B. Drag & Drop, Tree-Navigation, Preview-Sync), nutzt UJL Playwright für E2E-Tests in echten Browsern. Stabilität wird über test-spezifische Attribute (z. B. `data-testid`) erreicht und Debugging über Artefakte wie Screenshots/Videos unterstützt. Der Preis sind längere Laufzeiten, potenzielle Flakiness bei komplexen UI-Flows und zusätzlicher Setup-Aufwand.

## 9.12 Tool-Entscheidungen (kompakt)

Die folgenden Tool-Entscheidungen sind für die Entwicklungs-Infrastruktur relevant, haben aber geringeren architektonischen Einfluss als die Kern-ADRs.

**ADR-012: GitLab CI/CD**: UJL nutzt GitLab CI/CD für automatisierte Builds, Tests und Deployments (z. B. GitLab Pages), weil die Integration in Repository-Workflows (Merge Requests, Issues, Registry) den Prozess konsistent hält; Alternativen wie GitHub Actions oder Jenkins wurden zugunsten einer einheitlichen Toolchain verworfen.

**ADR-013: VitePress für Dokumentation**: Die Arc42-Dokumentation wird mit VitePress erstellt, da die Vite-basierte Performance, Markdown-first Ansatz und Standardfeatures wie Search/Sidebar den Dokumentations-Workflow vereinfachen und ein statisches Build-Output sauber auslieferbar ist.

**ADR-014: Vitest für Unit-Tests**: Für Unit-Tests setzt UJL auf Vitest, weil es Vite-nativ ist, Konfigurationen mit dem Build-Tooling teilen kann und durch die Jest-kompatible API einen schnellen Einstieg ermöglicht; zudem funktioniert TypeScript/ESM ohne zusätzliche Transformer in der Regel performanter.

**ADR-015: TypeScript Strict Mode**: In allen Packages ist TypeScript Strict Mode aktiviert (`"strict": true`), um Fehler früh zu erkennen (u. a. durch Null-Checks und strengere Typregeln) und die Stabilität eines Frameworks auch für Consumer-Code zu erhöhen.

## 9.13 Offene Architekturentscheidungen

Folgende Entscheidungen sind noch nicht final getroffen:

### 9.13.1 Lizenzmodell

Es ist noch offen, welches Lizenzmodell langfristig genutzt wird; aktuell wird zwischen MIT (maximal permissiv), Apache 2.0 (inkl. Patent-Aspekten) und AGPL-3.0 (Copyleft, insbesondere für SaaS) abgewogen, wobei derzeit MIT präferiert wird.

### 9.13.2 Semantic Search mit pgvector

Für die Image Library ist eine semantische Suche geplant, bei der Embeddings gespeichert und abgefragt werden; als technische Option steht pgvector als PostgreSQL-Extension im Raum, ist aber noch nicht entschieden und priorisiert.

### 9.13.3 Weitere Adapter

Über Svelte- und Web-Adapter hinaus sind weitere Rendering-Targets denkbar, allerdings ist noch nicht geklärt, ob diese primär über Community-Beiträge oder offiziell maintained entstehen sollen und ob die Adapter-API dafür bereits ausreichend dokumentiert und stabil ist.
