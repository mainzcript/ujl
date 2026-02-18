---
title: "Randbedingungen"
description: "Technische, organisatorische und konventionelle Constraints des UJL Frameworks"
---

# Randbedingungen

UJL ist ein Open-Source-Projekt (MIT) und wird von festen Randbedingungen geprägt: Barrierefreiheit nach WCAG 2.2, Datenschutz (DSGVO) und ein TypeScript/Svelte/Zod/Vite-Stack im pnpm-Monorepo. Für Bild-Workflows kann zusätzlich ein Library Service auf Basis von Payload CMS und PostgreSQL betrieben werden.

**Qualität und Compliance:** Das Framework richtet sich nach **WCAG 2.2** für Barrierefreiheit und berücksichtigt rechtliche Anforderungen wie den European Accessibility Act und die **DSGVO** für Datenschutz. Performance ist für die Editor-Usability wichtig.

**Technologie und Architektur:** UJL basiert auf einem Svelte-basierten TypeScript-Stack und trennt strikt zwischen Inhalt und Design. Die Architektur ermöglicht flexibles Rendering über verschiedene Adapter.

**Entwicklungsprozess:** Automatisierte Qualitätssicherung (CI/CD), koordinierte Releases und strukturierte Workflows mit Code-Reviews sichern die Qualität des Open-Source-Projekts.

## 2.1 Technische Constraints

### 2.1.1 Technologie-Stack

| Constraint             | Beschreibung                                                                                              | Auswirkung                                                                                                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sprache & Typisierung  | [TypeScript](https://www.typescriptlang.org/) (strict) + ES Modules                                       | Durchgängige Typisierung und konsistente Schnittstellen über Packages hinweg                                                                                                                                                                                                 |
| UI-Framework           | [Svelte](https://svelte.dev/)                                                                             | Eleganteste Entwicklungslösung für das Team; ermöglicht framework-agnostische Integration über Web Components. Wichtig für breite Nutzbarkeit, unabhängig vom Framework der Anwender.                                                                                        |
| UI-Bausteine & Styling | [shadcn-svelte](https://www.shadcn-svelte.com/) + [Tailwind CSS](https://tailwindcss.com/)                | Konsistentes UI-Grundgerüst, schnelle UI-Iteration, Utility-first Styling                                                                                                                                                                                                    |
| Schema-Validierung     | [Zod](https://zod.dev/)                                                                                   | Runtime-Validierung + Type Inference (Schema-first Datenmodell)                                                                                                                                                                                                              |
| Build & Bundling       | [Vite](https://vitejs.dev/)                                                                               | Bewährtes Tooling für moderne Web-Pakete und Libraries                                                                                                                                                                                                                       |
| Repository-Setup       | Monorepo mit [pnpm](https://pnpm.io/) Workspaces + [Changesets](https://github.com/changesets/changesets) | Industriestandard für koordinierte Package-Entwicklung und Releases                                                                                                                                                                                                          |
| Library Service        | [Payload CMS](https://payloadcms.com/) + [PostgreSQL](https://www.postgresql.org/)                        | Payload CMS ist einfach zu bedienen und ermöglicht schnelle Backend-Konfiguration mit moderner API-Architektur, was für ein Frontend-lastiges Team wichtig ist. PostgreSQL ist eine performante Datenbank mit Vektordatenbank-Funktionalität für geplante semantische Suche. |

### 2.1.2 Browser- & Plattform-Support

| Constraint           | Beschreibung                                                    | Auswirkung                                               |
| -------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| Web Components       | Web-Ausgabe kann als Custom Element eingebettet werden          | Framework-agnostische Integration in Host-Seiten         |
| Shadow DOM           | Web-Component-Ausgabe nutzt Shadow DOM zur Style-Isolation      | Verhindert CSS-Konflikte mit Host-Anwendungen            |
| Lokales Self-Hosting | Library Service kann per Docker/Docker Compose betrieben werden | Niedrige Einstiegshürde für Entwicklung und Self-Hosting |

::: warning Evergreen Browser Support

Wir unterstützen vorerst nur moderne Browser mit ES2022-Features ohne Legacy-Support. So können wir eine moderne Gesamtarchitektur bauen und die Entwicklung beschleunigen.

:::

### 2.1.3 Architektur-Constraints

::: tip Datenfluss - Aus der Redaktion zum Endkunden

Redakteur:innen erstellen Inhalte im **Crafter** und Designer:innen konfigurieren ein globales Theme. Diese Dokumente (`.ujlc.json` und `.ujlt.json`) werden vom **Composer** gegen Schemas validiert und in einen Abstract Syntax Tree transformiert. Dieser AST wird dann von **Adaptern** in konkrete Ausgabeformate gerendert, zum Beispiel als `HTML/CSS/JS` für universelle Einbettung. So wird sichergestellt, dass nur validierte, strukturierte Inhalte gerendert werden.

:::

| Constraint             | Beschreibung                                                                          | Auswirkung                                                      |
| ---------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Trennung Content/Theme | Inhalt (`.ujlc.json`) und Design (`.ujlt.json`) sind getrennte Artefakte              | Architektur erzwingt „Brand-Compliance by Design“               |
| AST als Zwischenformat | Komposition erzeugt ein AST als Transferformat zwischen Dokumenten und Rendering      | Rendering-Ziele bleiben austauschbar (Adapter-Pattern)          |
| Asynchrone Komposition | Komposition/„compose“ ist asynchron (z. B. wegen Auflösung externer Daten wie Bilder) | Schnittstellen und Aufrufer müssen Async unterstützen           |
| Adapter-Pattern        | Rendering in unterschiedliche Targets über Adapter                                    | Erleichtert Integration in verschiedene Stacks                  |
| Library Service        | Separates Backend für Assets                                                          | Austauschbar über definierte Schnittstellen; Betrieb bei Bedarf |

::: info Abstract Syntax Tree (AST)

Ein Abstract Syntax Tree ist eine baumartige Datenstruktur, die die hierarchische Struktur eines Dokuments repräsentiert. In UJL wird das JSON-Dokument (`.ujlc.json`) zusammen mit dem Theme (`.ujlt.json`) vom Composer in einen AST transformiert. Dieser AST dient als Zwischenformat zwischen den Quelldokumenten und dem finalen Rendering.

Verschiedene Adapter können das gleiche AST in unterschiedliche Ausgabeformate transformieren (z. B. Svelte-Komponenten, Web Components, HTML, PDF), und neue Render-Targets können möglichst effizient implementiert werden.

-> Siehe auch [Abstract Syntax Tree (Wikipedia)](https://de.wikipedia.org/wiki/Abstrakter_Syntaxbaum)

:::

### 2.1.4 Sicherheits-Constraints

| Constraint                      | Beschreibung                                                                                                         | Auswirkung                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Secrets im Client               | Keine privilegierten Secrets im Frontend; serverseitige Vermittlung (BFF / Backend-for-Frontend) und Least-Privilege | Erhöhte Sicherheit durch Authentifizierung, reduziertes Risiko bei Client-Kompromittierung |
| Schreibzugriffe Library Service | Schreiboperationen sind zu schützen (Authentifizierung/Autorisierung)                                                | Getrennte Rechte (read vs. write), rotierbare Tokens, auditable Zugriffe                   |
| Eingabedaten                    | Externe Daten (Import/CMS/Uploads) müssen validiert werden                                                           | Konsequente Schema-Validierung und defensives Rendering (XSS-/Injection-Vermeidung)        |

## 2.2 Organisatorische Constraints

### 2.2.1 Team & Entwicklungsprozess

| Constraint            | Beschreibung                                                                    | Auswirkung                                                |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Open Source           | UJL wird als Open Source entwickelt ([MIT](https://opensource.org/license/mit)) | Transparenz, Nachvollziehbarkeit, Contributions möglich   |
| CI/CD                 | Automatisierte Checks (Build, Lint, Tests)                                      | Gleichbleibende Qualitätsbasis und reproduzierbare Builds |
| Koordinierte Releases | Versionierung/Release der Packages wird koordiniert                             | Konsistente Paketstände, nachvollziehbare Änderungen      |

### 2.2.2 Branching-Strategie & Git-Workflow

| Constraint               | Beschreibung                  | Branches                                                 |
| ------------------------ | ----------------------------- | -------------------------------------------------------- |
| **Trunk-based**          | Feature-Branches → main       | `main` (trunk), `feat/*`, `fix/*`, `chore/*`             |
| **Protected Branches**   | main (keine direkten Commits) | Merge nur via Pull Requests mit Reviews                  |
| **Conventional Commits** | Commit Messages mit Präfix    | `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` |
| **Branch Naming**        | Lowercase mit Bindestrichen   | `feat/module-registry`, `fix/image-validation`           |

### 2.2.3 Release-Management

| Constraint                   | Beschreibung                              | Prozess                                                   |
| ---------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Semantic Versioning**      | MAJOR.MINOR.PATCH nach SemVer 2.0.0       | Breaking Changes = MAJOR, Features = MINOR, Fixes = PATCH |
| **Changesets Workflow**      | Changesets auf Feature-Branches erstellen | `pnpm changeset` → Review → Merge → Release-PR            |
| **Koordinierte Releases**    | Alle Packages zusammen releasen           | Versionsnummern synchron halten                           |
| **Noch kein NPM-Publishing** | Aktuell nur interne Versionierung         | Vorbereitet für zukünftiges Public Publishing             |

### 2.2.4 CI Pipeline (Build/Checks)

| Stage       | Tools/Commands                    | Zweck                                   |
| ----------- | --------------------------------- | --------------------------------------- |
| **install** | `pnpm install --frozen-lockfile`  | Dependencies installieren, Cache nutzen |
| **build**   | `pnpm run build`                  | Alle Packages + Docs builden            |
| **test**    | `pnpm run test`                   | Vitest Unit Tests ausfuehren            |
| **quality** | `pnpm run lint`, `pnpm run check` | ESLint, TypeScript Type Checking        |

### 2.2.5 Auslieferung der Dokumentation

Die Dokumentation ist eine statische Website. In CI wird sie gebaut (`apps/docs/dist/`) und anschliessend manuell auf den Webserver hochgeladen.

## 2.3 Konventionen

### 2.3.1 Code-Konventionen

| Konvention             | Beschreibung                                                          | Tool               |
| ---------------------- | --------------------------------------------------------------------- | ------------------ |
| **Prettier**           | Tabs, Single Quotes, 100 Chars, keine Trailing Commas                 | `.prettierrc`      |
| **ESLint**             | Recommended + Unused Variables (underscores allowed)                  | `eslint.config.js` |
| **TypeScript Strict**  | `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`       | `tsconfig.json`    |
| **Naming Conventions** | PascalCase für Klassen/Components, camelCase für Funktionen/Variablen | -                  |
| **File Extensions**    | `.ts` für Logic, `.svelte` für Components, `.test.ts` für Tests       | -                  |

### 2.3.2 Testing-Konventionen

| Konvention           | Beschreibung                                  | Framework             |
| -------------------- | --------------------------------------------- | --------------------- |
| **Unit Tests**       | `*.test.ts` neben Source-Files                | Vitest (Jest-API)     |
| **E2E Tests**        | `e2e/**/*.test.ts` für User Flows             | Playwright (Chromium) |
| **Test Attributes**  | `data-testid` nur bei `PUBLIC_TEST_MODE=true` | Custom Test-Utils     |
| **Coverage Reports** | HTML Reports mit v8 Provider                  | Vitest Coverage       |
| **CI Behavior**      | 2 Retries, 1 Worker (sequential)              | Playwright Config     |

**Test-Pattern:**

```typescript
import { test, expect } from "@playwright/test";

test("should render navigation tree", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByTestId("nav-tree")).toBeVisible();
});
```

### 2.3.3 Dokumentations-Konventionen

| Konvention          | Beschreibung                                     | Location                   |
| ------------------- | ------------------------------------------------ | -------------------------- |
| **arc42 Docs**      | Architektur-Dokumentation in VitePress           | `apps/docs/src/arc42/`     |
| **Package READMEs** | Markdown-READMEs pro Package                     | `packages/*/README.md`     |
| **Code Comments**   | JSDoc für Public APIs, inline für komplexe Logik | Inline in Source           |
| **Changelogs**      | Automatisch via Changesets generiert             | `CHANGELOG.md` pro Package |
| **Type Docs**       | TypeScript Types dienen als Dokumentation        | `.d.ts` Files              |

**README-Struktur:**

1. Installation
2. Usage (Quick Start)
3. API Reference
4. Examples
5. Development Commands

### 2.3.4 Naming-Konventionen

| Bereich        | Konvention                              | Beispiele                                              |
| -------------- | --------------------------------------- | ------------------------------------------------------ |
| **Packages**   | `@ujl-framework/<name>`                 | `@ujl-framework/core`, `@ujl-framework/adapter-svelte` |
| **Components** | PascalCase, beschreibend                | `AdapterRoot.svelte`, `MediaPicker.svelte`             |
| **Files**      | kebab-case für Svelte, camelCase für TS | `nav-tree.svelte`, `moduleRegistry.ts`                 |
| **Types**      | PascalCase mit Prefix                   | `UJLCDocument`, `UJLTTokenSet`, `UJLAbstractNode`      |
| **Functions**  | camelCase, Verb-first                   | `composeModule()`, `validateUJLCDocument()`            |
| **Constants**  | UPPER_SNAKE_CASE                        | `DEFAULT_THEME`, `MAX_NESTING_DEPTH`                   |

**Prefixes:**

- `UJLC` = Content-bezogen
- `UJLT` = Theme-bezogen
- `UJL` = Framework-übergreifend

## 2.4 Qualitäts-Constraints

### 2.4.1 Accessibility-Anforderungen

| Anforderung               | Standard                            | Umsetzung                                              |
| ------------------------- | ----------------------------------- | ------------------------------------------------------ |
| **WCAG 2.2 AA**           | Mindest-Kontrast 4.5:1 für Text     | OKLCH-Farbraum, automatische Kontrast-Berechnung       |
| **Keyboard-Navigation**   | Vollständige Tastatur-Bedienbarkeit | `Ctrl+C/X/V/I`, `Delete`, Pfeiltasten im Crafter       |
| **Semantisches HTML**     | Korrekte HTML5-Strukturen           | `<nav>`, `<main>`, `<article>`, `<section>` in Modulen |
| **Screen-Reader-Support** | ARIA-Labels, alt-Texte              | `alt`-Attribute pflichtgemäß, ARIA-Labels wo nötig     |
| **Fokus-Indikatoren**     | Sichtbare Fokuszustände             | Custom Focus Styles in Tailwind                        |

::: warning Work in Progress

Die vollständige Barrierefreiheit ist noch **Work in Progress**. Die Content-Frames sind bereits vollständig barrierefrei. Die vollständige Accessibility-Implementierung im Crafter selbst ist ein komplexes Unterfangen und wird noch etwas Zeit in Anspruch nehmen.

:::

### 2.4.2 Performance-Anforderungen

| Metrik                     | Zielwert                | Messung                               |
| -------------------------- | ----------------------- | ------------------------------------- |
| **Crafter Responsiveness** | <200 ms bei 200 Modulen | Manual Testing, Performance API       |
| **Bundle-Größe**           | <100 KB (gzip)          | `vite build --mode production` + gzip |
| **Initial Page Load**      | <2s (3G Network)        | Lighthouse CI                         |
| **Tree-to-Preview Sync**   | <50 ms                  | Performance API                       |

::: warning Hinweis

Die angegebenen Performance-Zielwerte sind **grobe Richtlinien**. Die endgültigen Performance-Anforderungen müssen noch genau geprüft und festgelegt werden.

:::

### 2.4.3 Maintainability-Anforderungen

| Anforderung                | Beschreibung                              | Umsetzung                                             |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| **Type Coverage**          | 100% TypeScript (keine `.js` Files)       | Strict Mode, keine `any` ohne Begründung              |
| **Test Coverage**          | Wichtige Pfade getestet                   | Vitest Unit Tests, Playwright E2E Tests               |
| **Code Duplication**       | DRY-Prinzip befolgen                      | Shared Utilities, abstrakte Base-Klassen              |
| **Documentation Coverage** | READMEs für alle Public Packages          | Markdown-READMEs + arc42 Docs                         |
| **Agentic Coding**         | Repository ist für AI-Agenten optimiert   | `AGENTS.md`, `.cursor/rules/`, strukturierte Kontexte |
| **Dependency Updates**     | Regelmäßige Updates (Renovate/Dependabot) | Automatisierte PRs (geplant)                          |

## 2.5 Externe Abhängigkeiten

### 2.5.1 Wichtige Dependencies

- Svelte (UI/Editor), Zod (Schema), Tailwind + shadcn-svelte (UI), Vite (Build), pnpm/Changesets (Monorepo/Release).
- Betrieb bei Bedarf: Payload CMS + PostgreSQL für den Library Service.

### 2.5.2 Build-Tool-Dependencies

- Tooling wird „State of the Art“ gehalten; konkrete Versionen sind in den Projektdateien gepflegt, nicht in dieser Doku.

## 2.6 Gesetze und Regularien

### 2.6.1 Barrierefreiheit

| Kontext                      | Standard                                              | Link                                                                                  |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **EU-Kontext**               | European Accessibility Act (Richtlinie (EU) 2019/882) | [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng)                          |
| **Web-Standard**             | WCAG 2.2                                              | [W3C](https://www.w3.org/TR/WCAG22/)                                                  |
| **Deutschland (öffentlich)** | BITV 2.0                                              | [Gesetze im Internet](https://www.gesetze-im-internet.de/bitv_2_0/BJNR184300011.html) |

### 2.6.2 Datenschutz

| Anforderung          | Umsetzung in UJL                                             |
| -------------------- | ------------------------------------------------------------ |
| **Datenminimierung** | Keine Analytics/Tracking im Crafter                          |
| **Transparenz**      | Open Source (vollständige Einsicht in Code)                  |
| **Portabilität**     | Export/Import von UJL-Dokumenten (JSON)                      |
| **Selbst-Hosting**   | Docker Compose für Library Service, keine Cloud-Abhängigkeit |

::: info DSGVO

Bei Betrieb/Hosting und bei Telemetrie/Logs gilt die **DSGVO** (Datenschutz-Grundverordnung) als rechtlicher Rahmen für personenbezogene Datenverarbeitung. [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)

:::

### 2.6.3 Open Source Lizenzierung

UJL wird unter der **MIT License** veröffentlicht ([Open Source Initiative](https://opensource.org/license/mit)). Contributions müssen mit der Lizenz kompatibel sein; Third-Party-Abhängigkeiten sind entsprechend zu prüfen.
