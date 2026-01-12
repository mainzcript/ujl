---
title: "Randbedingungen"
description: "Technische, organisatorische und konventionelle Constraints des UJL Frameworks"
---

# Randbedingungen

Dieses Kapitel beschreibt die technischen, organisatorischen und konventionellen Randbedingungen, unter denen das UJL Framework entwickelt wird. Diese Constraints bilden den unveränderlichen Rahmen für alle architektonischen Entscheidungen.

## 2.1 Technische Constraints

### 2.1.1 Technologie-Stack

| Constraint               | Beschreibung                                                  | Motivation                                                                 |
| ------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **TypeScript ≥5.9.3**    | Strict Mode, ES2022 Target, ESNext Modules                    | Type Safety über alle Schichten, moderne JS-Features                       |
| **Svelte 5**             | Latest Version (≥5.46.1), Runes API, Compile-Time Optimierung | Minimale Bundle-Größe, Fine-grained Reactivity, keine Virtual DOM Overhead |
| **Node.js ≥18.0.0**      | LTS-Version mit async/await, ES Modules                       | Moderne Runtime-Features, langfristige Unterstützung                       |
| **pnpm ≥10.0.0**         | Workspace-Monorepo Manager                                    | Effiziente Disk-Space-Nutzung, strikte Dependency-Isolation                |
| **Zod ^4.2.1**           | Runtime Schema Validation mit Type Inference                  | Single Source of Truth für Types, Runtime Safety                           |
| **Tailwind CSS ^4.1.18** | Utility-First CSS Framework                                   | Konsistentes Styling, Tree-Shaking, Design-Token-Integration               |
| **Vite ^7.3.0**          | Build Tool für alle Packages                                  | Schnelles HMR, optimierte Production Builds                                |

**Begründung:** Die gewählten Technologien bilden ein kohärentes Ökosystem für type-safe, performante Web-Entwicklung. Svelte 5 liefert minimale Bundle-Größen durch Compile-Time-Optimierung, TypeScript sichert Type Safety, Zod schließt die Lücke zur Runtime-Validierung.

### 2.1.2 Browser- & Plattform-Support

| Constraint             | Beschreibung                                                         | Auswirkung                                             |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| **Moderne Browser**    | ES2022-Features (async/await, Optional Chaining, Nullish Coalescing) | Keine Legacy-Browser (IE11, alte Safari-Versionen)     |
| **Web Components API** | Custom Elements für `adapter-web`                                    | Benötigt Browser mit Custom Elements v1 Support        |
| **SvelteKit SSR**      | Server-Side Rendering für Crafter                                    | Deployment auf Vercel, Netlify, Node.js-Servern        |
| **Docker-Deployment**  | Payload CMS Media Service als Container                              | Erfordert Docker/Docker Compose für lokale Entwicklung |

**Begründung:** Moderne Browser-Unterstützung ermöglicht kleinere Bundles und bessere Performance. Web Components garantieren Framework-Agnostizität. Docker-Deployment für Media Service ermöglicht einfaches Self-Hosting.

### 2.1.3 Architektur-Constraints

| Constraint                 | Beschreibung                                               | Auswirkung                                              |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| **Adapter Pattern**        | AST → Framework-spezifische Komponenten                    | Renderer sind austauschbar (Svelte, React, Vue möglich) |
| **Separation of Concerns** | Content (UJLC) ≠ Design (UJLT) ≠ Rendering (Adapter)       | Keine vermischten Concerns, klare Schnittstellen        |
| **Zod Schemas als SSoT**   | Types werden aus Zod inferiert (`z.infer<typeof schema>`)  | Schema-Änderungen propagieren automatisch zu Types      |
| **Immutable Updates**      | Funktionale Updates (`updateTokenSet(fn)`) statt Mutations | Predictable State, bessere Debugging-Erfahrung          |
| **Monorepo-Struktur**      | pnpm Workspaces mit interdependenten Packages              | Koordinierte Versionierung, geteilte Dependencies       |
| **No Shadow DOM**          | Custom Elements ohne Shadow DOM Isolation                  | Theme-Context-Vererbung, einfachere Integration         |

**Begründung:** Diese architektonischen Entscheidungen garantieren Erweiterbarkeit, Wartbarkeit und Framework-Agnostizität. Das Adapter Pattern ist zentral für die Vision von UJL als universelles Layout-System.

### 2.1.4 Performance-Constraints

| Constraint                 | Beschreibung                             | Ziel                                     |
| -------------------------- | ---------------------------------------- | ---------------------------------------- |
| **Crafter-Responsiveness** | Reaktionszeit bei bis zu 200 Modulen     | <200 ms für User-Interaktionen           |
| **Bundle-Größe**           | `adapter-web` inkl. Svelte Runtime       | <100 KB (gzip) für Standard-Module       |
| **Media Compression**      | Client-Side Image Compression im Crafter | Ziel ≤100 KB, Fallback ≤200 KB           |
| **Tree-Shaking**           | Ungenutzte Module aus Bundle entfernen   | ES Modules + `sideEffects: ["**/*.css"]` |

**Begründung:** Performance ist kritisch für User Experience. Svelte 5 Compilation und Tree-Shaking minimieren Bundle-Größe. Client-Side Media Compression reduziert Speicherbedarf bei Inline Storage.

### 2.1.5 Sicherheits-Constraints

| Constraint             | Beschreibung                                | Umsetzung                                            |
| ---------------------- | ------------------------------------------- | ---------------------------------------------------- |
| **API Key Management** | Payload CMS Media Service Authentifizierung | Environment Variables (`.env` nicht in Git)          |
| **Zod Validation**     | Runtime-Validierung aller externen Daten    | `validateUJLCDocument()`, `validateUJLTDocument()`   |
| **Type Safety**        | Compile-Time Type Checking in Strict Mode   | TypeScript mit `strict: true`, `noImplicitAny: true` |
| **XSS Prevention**     | Keine Direct HTML-Injection                 | ProseMirror Serialization, strukturierte Daten       |
| **CORS Configuration** | Payload CMS API mit CORS-Support            | Konfigurierbare Allowed Origins                      |

**Begründung:** Security ist nicht optional. Zod-Validierung schützt vor ungültigen Daten, Type Safety vor Laufzeitfehlern. API Keys werden über Environment Variables verwaltet.

## 2.2 Organisatorische Constraints

### 2.2.1 Team & Entwicklungsprozess

| Constraint                  | Beschreibung                                        | Auswirkung                                         |
| --------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| **Open Source (MIT)**       | Vollständig öffentlicher Quellcode                  | Community-Contributions, transparente Entwicklung  |
| **Monorepo mit Workspaces** | Alle Packages in einem Repository                   | Koordinierte Releases, geteilte CI/CD Pipeline     |
| **GitLab CI/CD**            | Automatisierte Pipeline (Build, Test, Lint, Deploy) | Qualitätssicherung, automatische Deployments       |
| **Changesets**              | Versionierung mit `@changesets/cli`                 | Semantic Versioning, koordinierte Package-Releases |
| **arc42-Dokumentation**     | Architektur-Dokumentation im VitePress              | Strukturierte Architektur-Docs für Onboarding      |

**Begründung:** Open Source fördert Transparenz und Community-Beiträge. Monorepo mit Changesets ermöglicht koordinierte Releases. GitLab CI/CD garantiert Qualität.

### 2.2.2 Branching-Strategie & Git-Workflow

| Constraint               | Beschreibung                           | Branches                                                 |
| ------------------------ | -------------------------------------- | -------------------------------------------------------- |
| **Gitflow**              | Feature-Branches → develop → main      | `main` (releases), `develop` (aktiv), `feat/*`, `fix/*`  |
| **Protected Branches**   | main, develop (keine direkten Commits) | Merge nur via Merge Requests mit Reviews                 |
| **Conventional Commits** | Commit Messages mit Präfix             | `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` |
| **Branch Naming**        | Lowercase mit Bindestrichen            | `feat/module-registry`, `fix/media-validation`           |

**Begründung:** Gitflow strukturiert Entwicklung und Releases. Conventional Commits ermöglichen automatische Changelogs. Protected Branches erzwingen Code Reviews.

### 2.2.3 Release-Management

| Constraint                   | Beschreibung                              | Prozess                                                   |
| ---------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Semantic Versioning**      | MAJOR.MINOR.PATCH nach SemVer 2.0.0       | Breaking Changes = MAJOR, Features = MINOR, Fixes = PATCH |
| **Changesets Workflow**      | Changesets auf Feature-Branches erstellen | `pnpm changeset` → Review → Merge → Release-PR            |
| **Koordinierte Releases**    | Alle Packages zusammen releasen           | Versionsnummern synchron halten                           |
| **Noch kein NPM-Publishing** | Aktuell nur interne Versionierung         | Vorbereitet für zukünftiges Public Publishing             |

**Begründung:** Semantic Versioning ist Standard für Open Source. Changesets automatisieren Changelog-Generierung. Koordinierte Releases vermeiden Versionsinkonsistenzen.

### 2.2.4 CI/CD Pipeline

| Stage       | Tools/Commands                    | Zweck                                   |
| ----------- | --------------------------------- | --------------------------------------- |
| **install** | `pnpm install --frozen-lockfile`  | Dependencies installieren, Cache nutzen |
| **build**   | `pnpm run build`                  | Alle Packages + Docs builden            |
| **test**    | `pnpm run test`                   | Vitest Unit Tests ausführen             |
| **quality** | `pnpm run lint`, `pnpm run check` | ESLint, TypeScript Type Checking        |
| **deploy**  | GitLab Pages (nur main/develop)   | Automatische Dokumentations-Deployments |

**Cache-Strategie:**

- `pnpm-store` global gecacht
- `node_modules` per Package gecacht
- 1-stündige Artifact Retention

**Begründung:** Automatisierte CI/CD Pipeline garantiert Code-Qualität und verhindert Regressionen. Caching beschleunigt Builds.

## 2.3 Konventionen

### 2.3.1 Code-Konventionen

| Konvention             | Beschreibung                                                          | Tool               |
| ---------------------- | --------------------------------------------------------------------- | ------------------ |
| **Prettier**           | Tabs, Single Quotes, 100 Chars, keine Trailing Commas                 | `.prettierrc`      |
| **ESLint**             | Recommended + Unused Variables (underscores allowed)                  | `eslint.config.js` |
| **TypeScript Strict**  | `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`       | `tsconfig.json`    |
| **Naming Conventions** | PascalCase für Klassen/Components, camelCase für Funktionen/Variablen | -                  |
| **File Extensions**    | `.ts` für Logic, `.svelte` für Components, `.test.ts` für Tests       | -                  |

**Prettier Config:**

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte"]
}
```

**Begründung:** Konsistenter Code-Style erleichtert Maintenance und Code Reviews. Automatische Formatierung spart Zeit.

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

**Begründung:** Strukturierte Tests garantieren Code-Qualität. E2E Tests mit Playwright decken reale User Flows ab. Test Attributes ohne Production-Overhead.

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

**Begründung:** Gute Dokumentation ist essentiell für Onboarding und Community-Contributions. arc42 strukturiert Architektur-Dokumentation.

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

**Begründung:** Konsistente Naming Conventions erleichtern Code-Navigation und Verständnis. Prefixes verdeutlichen Zugehörigkeit.

## 2.4 Qualitäts-Constraints

### 2.4.1 Accessibility-Anforderungen

| Anforderung               | Standard                            | Umsetzung                                              |
| ------------------------- | ----------------------------------- | ------------------------------------------------------ |
| **WCAG 2.1 AA**           | Mindest-Kontrast 4.5:1 für Text     | OKLCH-Farbraum, automatische Kontrast-Berechnung       |
| **Keyboard-Navigation**   | Vollständige Tastatur-Bedienbarkeit | `Ctrl+C/X/V/I`, `Delete`, Pfeiltasten im Crafter       |
| **Semantisches HTML**     | Korrekte HTML5-Strukturen           | `<nav>`, `<main>`, `<article>`, `<section>` in Modulen |
| **Screen-Reader-Support** | ARIA-Labels, alt-Texte              | `alt`-Attribute pflichtgemäß, ARIA-Labels wo nötig     |
| **Fokus-Indikatoren**     | Sichtbare Fokuszustände             | Custom Focus Styles in Tailwind                        |

**Begründung:** Accessibility ist architektonisches Qualitätsziel. WCAG-Konformität ist gesetzliche Anforderung (EU Accessibility Act). OKLCH ermöglicht präzise Kontrast-Berechnungen.

### 2.4.2 Performance-Anforderungen

| Metrik                         | Zielwert                | Messung                               |
| ------------------------------ | ----------------------- | ------------------------------------- |
| **Crafter Responsiveness**     | <200 ms bei 200 Modulen | Manual Testing, Performance API       |
| **Bundle-Größe (adapter-web)** | <100 KB (gzip)          | `vite build --mode production` + gzip |
| **Initial Page Load**          | <2s (3G Network)        | Lighthouse CI                         |
| **Tree-to-Preview Sync**       | <50 ms                  | Performance API                       |

**Begründung:** Performance direkt korreliert mit User Experience. Schnelle Reaktionszeiten sind kritisch für visuelle Editoren.

### 2.4.3 Maintainability-Anforderungen

| Anforderung                | Beschreibung                              | Umsetzung                                |
| -------------------------- | ----------------------------------------- | ---------------------------------------- |
| **Type Coverage**          | 100% TypeScript (keine `.js` Files)       | Strict Mode, keine `any` ohne Begründung |
| **Test Coverage**          | Kritische Paths getestet                  | Vitest Unit Tests, Playwright E2E Tests  |
| **Code Duplication**       | DRY-Prinzip befolgen                      | Shared Utilities, abstrakte Base-Klassen |
| **Documentation Coverage** | READMEs für alle Public Packages          | Markdown-READMEs + arc42 Docs            |
| **Dependency Updates**     | Regelmäßige Updates (Renovate/Dependabot) | Automatisierte PRs (geplant)             |

**Begründung:** Maintainability ist langfristiges Qualitätsziel. Type Safety und Tests reduzieren technische Schulden.

## 2.5 Externe Abhängigkeiten

### 2.5.1 Kritische Dependencies

| Dependency       | Version | Risiko                             | Mitigation                                                |
| ---------------- | ------- | ---------------------------------- | --------------------------------------------------------- |
| **Svelte**       | ^5.46.1 | Breaking Changes in Major Releases | Peer Dependency, Adapter Pattern isoliert Framework-Logik |
| **Zod**          | ^4.2.1  | Schema API könnte sich ändern      | Wrapper-Funktionen um Zod-API                             |
| **Tailwind CSS** | ^4.1.18 | Major Version Upgrades             | Scoped Styles, Design Token Mapping                       |
| **Payload CMS**  | ^3.69.0 | API Breaking Changes               | Abstrahierte Media Service Schnittstelle                  |
| **TipTap**       | ^3.14.0 | Extension API könnte sich ändern   | Shared Schema in `@ujl-framework/core`                    |

**Begründung:** Externe Dependencies sind unvermeidbar. Mitigation-Strategien minimieren Risiko bei Breaking Changes.

### 2.5.2 Build-Tool-Dependencies

| Tool           | Version | Zweck                 | Risiko                                       |
| -------------- | ------- | --------------------- | -------------------------------------------- |
| **Vite**       | ^7.3.0  | Build & Dev Server    | Breaking Changes in Major Releases (gering)  |
| **SvelteKit**  | ^2.49.2 | Framework für Crafter | API-Änderungen in Adapters                   |
| **Vitest**     | ^4.0.16 | Unit Testing          | Kompatibel mit Jest-API (stabiles Interface) |
| **Playwright** | ^1.57.0 | E2E Testing           | Stabile Browser-Automation-API               |

**Begründung:** Build-Tools sind Entwicklungs-Dependencies. Risiko für Production-Code ist minimal.

## 2.6 Gesetze und Regularien

### 2.6.1 Barrierefreiheit

| Gesetz/Richtlinie        | Geltungsbereich | Anforderung an UJL                        |
| ------------------------ | --------------- | ----------------------------------------- |
| **EU Accessibility Act** | EU-weit ab 2025 | WCAG 2.1 AA für öffentliche Webseiten     |
| **BITV 2.0 (DE)**        | Deutschland     | WCAG 2.1 AA für Behörden-Websites         |
| **ADA (US)**             | USA             | WCAG 2.0/2.1 AA für kommerzielle Websites |

**Umsetzung in UJL:**

- Automatische Kontrast-Checks (OKLCH-Farbraum)
- Semantische HTML-Strukturen in allen Modulen
- Keyboard-Navigation standardmäßig
- Screen-Reader-Support durch ARIA-Labels

**Begründung:** Barrierefreiheit ist gesetzliche Anforderung und architektonisches Qualitätsziel ("Accessibility Guaranteed").

### 2.6.2 Datenschutz (DSGVO)

| Anforderung          | Umsetzung in UJL                                           |
| -------------------- | ---------------------------------------------------------- |
| **Datenminimierung** | Keine Analytics/Tracking im Crafter                        |
| **Transparenz**      | Open Source (vollständige Einsicht in Code)                |
| **Portabilität**     | Export/Import von UJL-Dokumenten (JSON)                    |
| **Selbst-Hosting**   | Docker Compose für Media Service, keine Cloud-Abhängigkeit |

**Begründung:** DSGVO ist EU-Recht. Self-Hosting und Open Source garantieren Datensouveränität.

### 2.6.3 Open Source Lizenzierung

| Aspekt           | Beschreibung                                       |
| ---------------- | -------------------------------------------------- |
| **Lizenz**       | MIT License                                        |
| **Erlaubnisse**  | Kommerzielle Nutzung, Modifikation, Distribution   |
| **Bedingungen**  | Lizenztext muss enthalten sein, Haftungsausschluss |
| **Dependencies** | Alle Dependencies müssen MIT-kompatibel sein       |

**Begründung:** MIT License ist permissive und ermöglicht breite Nutzung ohne rechtliche Hürden.

## 2.7 Zusammenfassung

### Kritische Constraints (nicht verhandelbar)

1. **TypeScript Strict Mode** - Type Safety ist Kern-Qualitätsziel
2. **Svelte 5** - Compile-Time-Optimierung für minimale Bundle-Größe
3. **Zod Validation** - Runtime Safety für externe Daten
4. **Adapter Pattern** - Framework-Agnostizität ist architektonische Vision
5. **WCAG 2.1 AA** - Accessibility ist gesetzliche Anforderung und Qualitätsziel
6. **MIT License** - Open Source ist Projekt-Grundprinzip

### Flexible Constraints (können angepasst werden)

1. **Payload CMS** - Media Service Backend ist austauschbar (abstrakte Schnittstelle)
2. **TipTap/ProseMirror** - Rich Text Editor ist ersetzbar (strukturierte Dokumente)
3. **GitLab CI/CD** - Pipeline kann auf GitHub Actions portiert werden
4. **VitePress** - Dokumentations-Framework ist austauschbar

### Offene Entscheidungen

1. **NPM Publishing** - Zeitpunkt und Strategie noch offen
2. **Internationalisierung** - i18n für Crafter UI noch nicht spezifiziert
3. **Semantic Search** - pgvector-Integration geplant, aber nicht spezifiziert

---

_Letzte Aktualisierung: 2026-01-12_
