---
title: "Verteilungssicht"
description: "Verteilung der Systemkomponenten auf Infrastruktur und Deployment"
---

# Verteilungssicht

UJL wird als Libraries und Apps in einem Monorepo entwickelt und typischerweise als Packages in eine Host-Anwendung eingebunden. Die Dokumentation ist als statische Seite ausgelegt; der Library Service ist ein separater Backend-Baustein, der nur für Backend-Storage von Bildern benötigt wird und unabhängig betrieben werden kann. Für Entwicklung und CI ist vor allem wichtig, welche Teile lokal laufen, wie Builds orchestriert werden und wo Schnittstellen zwischen Frontend und Service entstehen.

## 7.1 Infrastruktur Ebene 1

### 7.1.1 Übersichtsdiagramm

```mermaid
graph TB
    subgraph "Development Environment"
        Dev[Developer Workstation]
    end

    subgraph "CI/CD Pipeline"
        GitLab[GitLab CI/CD]
    end

    subgraph "Hosting Layer"
        Pages[GitLab Pages<br/>Static Hosting]
        LibraryServer[Library Service Host<br/>Self-hosted]
    end

    subgraph "External Services"
        NPM[NPM Registry<br/>geplant]
    end

    Dev -->|git push| GitLab
    GitLab -->|deploy docs| Pages
    GitLab -->|publish packages| NPM
    Dev -->|Library Service starten| LibraryServer

    style Dev fill:#3b82f6
    style GitLab fill:#f59e0b
    style Pages fill:#10b981
    style LibraryServer fill:#6366f1
    style NPM fill:#8b5cf6
```

### 7.1.2 Begründung der Verteilungsstrategie

Die Deployment-Architektur folgt dem Prinzip **"Static-First, Services-When-Needed"**:

| Aspekt              | Entscheidung               | Begründung                                     |
| ------------------- | -------------------------- | ---------------------------------------------- |
| **Core-Packages**   | NPM Distribution           | Wiederverwendbarkeit, einfache Integration     |
| **Crafter**         | NPM Package (Vite Library) | Einbettbar in bestehende Projekte              |
| **Documentation**   | Static Site (GitLab Pages) | Kosteneffizient, schnell, einfach zu deployen  |
| **Library Service** | Self-hosted Service        | Eigenständig betreibbar, getrennt vom Frontend |
| **dev-demo**        | Static Build               | Showcase ohne Serverkosten                     |

### 7.1.3 Qualitäts- und Leistungsmerkmale

| Infrastruktur-Element         | Verfügbarkeit      | Skalierbarkeit     | Sicherheit                        |
| ----------------------------- | ------------------ | ------------------ | --------------------------------- |
| GitLab Pages                  | 99.9% (GitLab SLA) | Automatisch (CDN)  | HTTPS, DDoS-Schutz                |
| Library Service (self-hosted) | Abhängig vom Host  | Abhängig vom Setup | API-Key Auth, Network Isolation   |
| NPM Registry                  | 99.99% (npm SLA)   | Automatisch        | npm audit, Vulnerability Scanning |

## 7.2 Infrastruktur Ebene 2

### 7.2.1 Entwicklungsumgebung (Local Development)

```mermaid
graph TB
    subgraph "Developer Workstation"
        subgraph "Node.js Runtime"
            PNPM[pnpm<br/>Package Manager]

            subgraph "Monorepo Workspace"
                Types[types<br/>Port: -]
                Core[core<br/>Port: -]
                UI[ui<br/>Vite Dev Server<br/>Port: 5173+ (auto)]
                AdapterSvelte[adapter-svelte<br/>Vite Dev Server<br/>Port: 5173+ (auto)]
                AdapterWeb[adapter-web<br/>Port: -]
                Crafter[crafter<br/>Vite Dev Server<br/>Port: 5173+ (auto)]
                DevDemo[dev-demo<br/>Vite Dev Server<br/>Port: 5173+ (auto)]
                Docs[docs<br/>VitePress Dev Server<br/>Port: 5173+ (auto)]
            end

            Library[Library Service (Payload)<br/>Next Dev Server<br/>Port: 3000]
        end

        subgraph "Docker Environment"
            Postgres[(PostgreSQL<br/>Port: 5432)]
        end

        Browser[Browser<br/>Chrome/Firefox/Safari]
    end

    PNPM --> Types
    PNPM --> Core
    PNPM --> UI
    PNPM --> AdapterSvelte
    PNPM --> AdapterWeb
    PNPM --> Crafter
    PNPM --> DevDemo
    PNPM --> Docs

    Library --> Postgres

    Browser --> UI
    Browser --> Crafter
    Browser --> DevDemo
    Browser --> Docs
    Crafter -.->|Image API| Library

    style PNPM fill:#f59e0b
    style Browser fill:#3b82f6
    style Library fill:#6366f1
    style Postgres fill:#10b981
```

#### Voraussetzungen

| Komponente         | Version | Zweck                         |
| ------------------ | ------- | ----------------------------- |
| **Node.js**        | 22+     | JavaScript Runtime            |
| **pnpm**           | 10+     | Package Manager (Monorepo)    |
| **Docker**         | 24+     | Container Runtime             |
| **Docker Compose** | 2.x     | Multi-Container Orchestration |
| **Git**            | 2.40+   | Version Control               |

#### Setup-Anleitung

```bash
# 1. Repository klonen
git clone <repository-url>
cd ujl

# 2. Dependencies installieren
pnpm install

# 3. Alle Packages bauen
pnpm run build

# 4. Development Server starten (je nach Package)
# Hinweis: Vite/VitePress startet typischerweise auf 5173 und wählt bei Bedarf den nächsten freien Port.
pnpm --filter @ujl-framework/crafter dev
pnpm --filter @ujl-framework/ui dev
pnpm --filter @ujl-framework/docs dev
```

Wenn du Bild- oder Asset-Workflows testen möchtest, starte zusätzlich den Library Service (siehe Abschnitt 7.2.3).

#### Port-Mapping

| Service                         | Port  | Beschreibung                                                                |
| ------------------------------- | ----- | --------------------------------------------------------------------------- |
| Vite / VitePress Dev Server     | 5173+ | Default 5173; wenn belegt, wählt Vite automatisch den nächsten freien Port. |
| Vite Preview (z.B. dev-demo)    | 4173  | Default für `vite preview` (falls nicht überschrieben).                     |
| Library Service (Payload, Dev)  | 3000  | Admin UI und REST API (`/admin`, `/api/*`).                                 |
| PostgreSQL (Library DB, Docker) | 5432  | Datenbank für den Library Service (lokal via Docker Compose).               |

### 7.2.2 CI/CD Pipeline (GitLab CI)

```mermaid
graph LR
    subgraph "GitLab CI Pipeline"
        Install[install_deps<br/>pnpm install]
        Build[build_all<br/>pnpm run build]
        TestUnit[test_unit<br/>pnpm test:unit]
        TestE2E[test_e2e<br/>pnpm test:e2e]
        Quality[quality_check<br/>lint + check]
        Deploy[pages<br/>GitLab Pages]
    end

    subgraph "Artifacts"
        DocsOutput[apps/docs/dist/]
        DistPackages[packages/*/dist/]
        DistApps[apps/*/dist/]
        Public[public/]
    end

    Install --> Build
    Build --> TestUnit
    Build --> TestE2E
    Build --> Quality
    Build --> Deploy

    Build -.-> DocsOutput
    Build -.-> DistPackages
    Build -.-> DistApps
    Deploy -.-> Public

    style Install fill:#8b5cf6
    style Build fill:#3b82f6
    style TestUnit fill:#10b981
    style TestE2E fill:#10b981
    style Quality fill:#f59e0b
    style Deploy fill:#ef4444
```

#### Pipeline-Konfiguration

Die CI/CD-Pipeline ist in `.gitlab-ci.yml` definiert:

```yaml
stages:
  - install
  - build
  - test
  - quality
  - deploy

variables:
  NODE_VERSION: "22-slim"
  PNPM_VERSION: "10.28.2"
  PLAYWRIGHT_VERSION: "1.57.0"
  PNPM_STORE_PATH: ".pnpm-store"
```

#### Stage-Details

| Stage       | Job             | Beschreibung                                                            |
| ----------- | --------------- | ----------------------------------------------------------------------- |
| **install** | `install_deps`  | Dependencies installieren (wärmt pnpm Store für nachfolgende Jobs)      |
| **build**   | `build_all`     | Build für Packages und Apps (inkl. `apps/docs/dist`)                    |
| **test**    | `test_unit`     | Unit-Tests (Vitest)                                                     |
| **test**    | `test_e2e`      | E2E-Tests (Playwright, läuft nur in MR sowie auf main/develop)          |
| **quality** | `quality_check` | Linting + TypeScript Check                                              |
| **deploy**  | `pages`         | Docs-Artifact nach GitLab Pages kopieren (`apps/docs/dist` → `public/`) |

#### Caching-Strategie

```yaml
cache:
  key:
    files:
      - pnpm-lock.yaml
    prefix: dependencies
  paths:
    - .pnpm-store/
```

Der Cache-Key basiert auf `pnpm-lock.yaml` und sorgt damit für reproduzierbare Installationen. Zusätzlich wird der pnpm Store als `.pnpm-store/` gecacht, damit Folge-Jobs weniger neu installieren müssen.

#### Deployment-Regeln

```yaml
pages:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
```

Die Dokumentation wird nur aus `main` (Produktions-Doku) und `develop` (Preview-Doku) nach GitLab Pages deployed.

### 7.2.3 Library Service (Docker)

```mermaid
graph TB
    subgraph "Developer Workstation"
        subgraph "Node.js Process"
            Payload[Library Service (Payload)<br/>Next Dev Server<br/>Port: 3000]
        end

        subgraph "Docker (docker-compose)"
            Postgres[(postgres<br/>postgres:16-alpine<br/>Port: 5432)]
            PGData[(pgdata<br/>PostgreSQL Data)]
        end
    end

    Client[Crafter / API Client]

    Payload -->|DATABASE_URL| Postgres
    Postgres --> PGData
    Client -->|HTTP 3000| Payload

    style Payload fill:#6366f1
    style Postgres fill:#10b981
```

#### Container-Konfiguration

Für lokale Entwicklung wird PostgreSQL über Docker Compose gestartet; der Payload-Server läuft als Node.js-Prozess über `pnpm` (kein Payload-Container im Compose-File).

**docker-compose.yml:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required in .env}
      POSTGRES_DB: ${POSTGRES_DB:-library}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

#### Environment-Variablen

| Variable            | Beschreibung                               | Beispiel                                                     |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `PAYLOAD_SECRET`    | Secret (min. 32 Zeichen)                   | `your-super-secret-key-min-32-chars`                         |
| `POSTGRES_PASSWORD` | DB Passwort (für lokalen Docker-Container) | `secure-password`                                            |
| `DATABASE_URL`      | PostgreSQL Connection String (für Payload) | `postgres://postgres:secure-password@localhost:5432/library` |
| `POSTGRES_USER`     | DB Benutzer (Default: `postgres`)          | `postgres`                                                   |
| `POSTGRES_DB`       | Datenbankname (Default: `library`)         | `library`                                                    |

#### Startup-Befehle

```bash
# DB + Payload (empfohlen)
cd services/library
pnpm run dev

# Nur DB
pnpm run dev:db

# Nur Payload (setzt laufende DB voraus)
pnpm run dev:payload

# Services stoppen
docker-compose down

# Mit Volume-Cleanup
docker-compose down -v
```

## 7.3 Deployment-Szenarien

### 7.3.1 Szenario: Lokale Entwicklung

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Terminal as Terminal
    participant PNPM as pnpm
    participant ViteDev as Vite Dev Server
    participant Browser as Browser
    participant Library as Library Service (Payload)

    Note over Dev,Terminal: Voraussetzung: Repository liegt lokal vor und `pnpm install` wurde bereits ausgeführt.

    Dev->>Terminal: pnpm --filter @ujl-framework/crafter dev
    Terminal->>ViteDev: Start dev server
    ViteDev-->>Terminal: http://localhost:5173+ (auto)

    Dev->>Browser: Open dev server URL
    Browser-->>ViteDev: Request
    ViteDev-->>Browser: Hot Module Replacement

    opt Library Service needed
        Dev->>Terminal: cd services/library && pnpm run dev
        Terminal->>Library: Start DB + Payload (local dev)
        Library-->>Terminal: http://localhost:3000/admin
    end

    Dev->>Browser: Edit UJLC Document
    Browser-->>ViteDev: Save changes
    ViteDev-->>Browser: Live Reload
```

**Charakteristiken:**

In der lokalen Entwicklung stehen Hot Module Replacement (HMR) und schnelle Feedback-Schleifen im Vordergrund. Die Packages werden im Watch-Mode genutzt; der Library Service wird nur dann gestartet, wenn Bild- oder Asset-Workflows benötigt werden (Payload via `pnpm`, PostgreSQL lokal via Docker Compose). Ein separater Produktions-Build ist dafür nicht erforderlich.

### 7.3.2 Szenario: Continuous Integration

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitLab as GitLab
    participant Runner as GitLab Runner
    participant Cache as Cache Storage
    participant Pages as GitLab Pages

    Dev->>GitLab: git push origin feature/xyz
    GitLab->>Runner: Trigger Pipeline

    Runner->>Cache: Check cache (.pnpm-store)
    Cache-->>Runner: Cache hit/miss

    Runner->>Runner: install_deps (pnpm install)
    Runner->>Cache: Store cache

    Runner->>Runner: build_all (pnpm run build)
    Note over Runner: Jobs laufen parallel; pages hängt am Build-Artifact.

    par Tests & Checks
        Runner->>Runner: test_unit (pnpm test:unit)
        Runner->>Runner: test_e2e (pnpm test:e2e, MR/main/develop)
        Runner->>Runner: quality_check (lint + check)
    and Pages Deploy (main/develop)
        alt Branch is main/develop
            Runner->>Pages: Deploy docs
            Pages-->>GitLab: Deployment successful
        end
    end

    Runner-->>GitLab: Pipeline success/failure
    GitLab-->>Dev: Pipeline Notification
```

**Charakteristiken:**

Der Build erzeugt die Artefakte (u.a. `apps/docs/dist/`). Tests (Vitest/Playwright) und Lint/Type-Checks laufen in eigenen Jobs. Das Pages-Deployment nutzt das Build-Artifact und wird nur auf `main` und `develop` ausgeführt; in der aktuellen DAG-Konfiguration hängt es direkt am Build-Job und kann parallel zu Tests/Checks laufen. Retries sind für temporäre Runner-/Infrastruktur-Fehler aktiviert.

### 7.3.4 Szenario: Produktion (Integration in Host-Applikation)

```mermaid
graph TB
    subgraph "Host Application"
        subgraph "Frontend (SSR/SPA)"
            App[Next.js / SvelteKit / Vue]
            UJLPackages[UJL Packages<br/>via npm]
        end

        subgraph "Backend"
            API[Application API]
            DB[(Application DB)]
        end
    end

    subgraph "UJL Library Service (bei Bedarf)"
        LibraryAPI[Payload CMS<br/>Port: 3000]
        LibraryDB[(PostgreSQL)]
        Uploads[(Uploads)]
    end

    subgraph "CDN"
        StaticAssets[Static Assets<br/>CSS, Images]
    end

    App --> UJLPackages
    App --> API
    API --> DB
    App -.->|Image API| LibraryAPI
    LibraryAPI --> LibraryDB
    LibraryAPI --> Uploads
    App --> StaticAssets

    style App fill:#3b82f6
    style UJLPackages fill:#f59e0b
    style LibraryAPI fill:#6366f1
```

**Integrations-Beispiel (SvelteKit):**

```typescript
// +page.svelte
<script lang="ts">
  import { Composer } from '@ujl-framework/core';
  import { AdapterRoot } from '@ujl-framework/adapter-svelte';
  import '@ujl-framework/adapter-svelte/styles';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const composer = new Composer();
  const ast = $derived.by(async () => await composer.compose(data.ujlcDocument));
  const tokenSet = $derived(data.ujltDocument.ujlt.tokens);
</script>

<AdapterRoot node={ast} {tokenSet} mode="system" />
```

**Integrations-Beispiel (Vanilla JS / React / Vue):**

```typescript
import { webAdapter } from "@ujl-framework/adapter-web";
import { Composer } from "@ujl-framework/core";

const composer = new Composer();
const ast = await composer.compose(ujlcDocument);
const tokenSet = ujltDocument.ujlt.tokens;

const mounted = webAdapter(ast, tokenSet, {
	target: "#ujl-container",
	showMetadata: false,
});

// Cleanup on unmount
mounted.unmount();
```

::: info Weitere Deployment-Szenarien
Für zusätzliche Deployment-Szenarien (NPM Package Publishing, Self-Hosted Full Stack) siehe [Appendix 7.8](#_7-8-appendix-weitere-deployment-szenarien).
:::

## 7.4 Infrastruktur-Anforderungen

### 7.4.1 Mindestanforderungen

UJL wird aktuell nur als Entwicklungsumgebung betrieben; belastbare Infrastruktur-Anforderungen für einen produktiven Betrieb sind damit noch nicht abgeleitet. Was heute sicher ist: Für lokale Entwicklung und CI braucht es eine Node.js- und pnpm-Umgebung, und für den Library Service wird zusätzlich eine PostgreSQL-Datenbank benötigt (lokal über Docker Compose).

Für Produktion hängen Hardware- und Netzwerk-Anforderungen von der Host-Anwendung und vom konkreten Deployment des Library Service ab und werden erst mit ersten Produktions-Deployments festgelegt.

### 7.4.2 Empfohlene Konfiguration

Für den Alltag hilft vor allem, wenn Builds und E2E-Tests nicht durch knappe Ressourcen ausgebremst werden. Konkrete Empfehlungen (CPU/RAM/Storage) leiten wir erst aus Messungen und realen Nutzungsprofilen ab, sobald ein produktiver Betrieb ansteht.

### 7.4.3 Sicherheitsanforderungen

Unabhängig vom späteren Hosting gelten ein paar Leitplanken: Die Image API ist per API-Key geschützt, Secrets werden über Environment-Variablen verwaltet und nicht im Repository abgelegt. Die PostgreSQL-Datenbank sollte nicht öffentlich exponiert werden, und für einen produktiven Betrieb wird HTTPS über einen Reverse Proxy terminiert.

## 7.5 Mapping: Software zu Infrastruktur

Dieser Abschnitt beantwortet für Entwickler:innen zwei praktische Fragen:

1. **Welche Artefakte entstehen beim Build und wo liegen sie im Repository?**
2. **Wie werden diese Artefakte ausgeliefert oder betrieben?** (Package-Distribution vs. Service-Betrieb)

### 7.5.1 Artefakte und Nutzung

| Baustein (Workspace)                      | Typ               | Build-Output im Repo      | Nutzung / Betrieb                                                        |
| ----------------------------------------- | ----------------- | ------------------------- | ------------------------------------------------------------------------ |
| `packages/*` (z.B. `@ujl-framework/core`) | Package (Library) | `packages/<name>/dist/`   | als Dependency in Host-Apps (geplant: Veröffentlichung via NPM Registry) |
| `apps/docs`                               | App (Doku)        | `apps/docs/dist/`         | Deployment via GitLab Pages                                              |
| `apps/dev-demo`                           | App (Demo)        | `apps/dev-demo/dist/`     | lokal/Preview via `vite preview` bzw. separat deploybar                  |
| `services/library`                        | Service (Backend) | `services/library/.next/` | self-hosted Service (Node.js) mit PostgreSQL (Docker für lokale DB)      |

### 7.5.2 Relevante Commands

Die Builds sind workspace-spezifisch, weil nicht jedes Teilprojekt in jeder Pipeline benötigt wird.

Für den Monorepo-Build (Packages + Docs) wird `pnpm run build` verwendet. Die Demo wird getrennt gebaut (`pnpm --filter @ujl-framework/dev-demo build`). Der Library Service hat einen separaten Build (`cd services/library && pnpm run build`).

## 7.6 Skalierungsstrategie

### 7.6.1 Horizontale Skalierung

**Application Layer (Host-Anwendung):**

UJL Crafter und die Adapter werden als Packages in eine Host-Anwendung eingebettet. Skalierung und Verfügbarkeit werden deshalb primär über das Deployment der Host-Anwendung erreicht (z.B. mehrere Frontend-Instanzen hinter einem Load Balancer). UJL selbst bringt dafür keine separaten Crafter-Serverprozesse mit.

Das entspricht dem Produktions-Szenario in Abschnitt 7.3.4: Mehrere Instanzen der Host-Anwendung laufen hinter einem Load Balancer; falls Backend Storage genutzt wird, wird der Library Service als eigener Service betrieben und skaliert gemeinsam mit seiner Datenbank.

### 7.6.2 Vertikale Skalierung

Konkrete Sizing-Werte für CPU/RAM/Storage sind noch nicht definiert. Wenn ein produktiver Betrieb ansteht, werden PostgreSQL und der Library Service erfahrungsgemäß die ersten Komponenten sein, die Ressourcenbedarf treiben (Storage für Uploads, DB-Last, CPU/RAM für API/Processing). Bis dahin ist vertikale Skalierung der naheliegende erste Schritt, weil sie ohne Architekturänderung auskommt.

### 7.6.3 Datenbank-Skalierung

**Read Replicas:**

Für leselastige Workloads sind Read Replicas eine mögliche Option. Ob das für UJL relevant ist, hängt von realer Nutzung ab (z.B. viele gleichzeitige Abfragen, Reporting, Integrationen).

**Connection Pooling:**

Bei vielen gleichzeitigen Verbindungen kann Connection Pooling (z.B. PgBouncer oder ein Managed Pooling-Angebot) helfen, die Datenbank stabil zu halten.

### 7.6.4 Library Storage-Skalierung

**Object Storage (S3-kompatibel):**

Für große Asset-Bibliotheken lohnt sich der Wechsel von lokalem Storage zu einem S3-kompatiblen Object Storage. Payload unterstützt Upload-Backends über Plugins/Adapter; die konkreten Provider-Details (Endpoint, Credentials, Bucket) hängen vom jeweiligen Hosting ab.

**CDN-Integration:**

Für öffentlich ausgelieferte Uploads ist ein CDN bzw. ein Reverse Proxy Cache sinnvoll (Cache-Control/ETag), um Bandbreite und Latenzen zu reduzieren.

### 7.6.5 Performance-Optimierungen

**Lazy Loading:**

UJL-Adapter unterstützen Lazy Loading von Modulen. Im Frontend bedeutet das: Module werden erst dann geladen, wenn sie benötigt werden (Code Splitting).

**Bundle Optimization:**

Die Host-Anwendung kann Vendor- und Feature-Chunks trennen (z.B. via Vite/Rollup), um initiale Ladezeiten zu senken und Caching effizienter zu machen.

**Caching-Strategie:**

Konkrete Cache-Dauern und Header-Strategien sind Teil des späteren Host-Deployments. Typischerweise werden statische Assets über Fingerprints gut cachebar gemacht, während API-Responses und HTML/SSR je nach Anwendung anders behandelt werden.

### 7.6.6 Monitoring für Skalierung

Welche Signale wir für Skalierung heranziehen, wird erst mit erstem Produktionsbetrieb festgelegt. Übliche Kandidaten sind Fehlerraten, Latenzen, DB-Verbindungszahlen sowie Storage- und Memory-Auslastung.

## 7.7 Operations und Monitoring

### 7.7.1 Logging

Aktuell reicht für Entwicklung die Standard-Ausgabe der jeweiligen Prozesse: Vite/VitePress und der Library Service loggen in die Konsole, die lokale PostgreSQL-DB in die Docker-Logs, und CI-Logs sind in GitLab sichtbar.

### 7.7.2 Health Checks

Für den Library Service bieten sich einfache Checks an, die ohne interne Detailkenntnis auskommen (z.B. `GET /admin` sowie ein kleiner Request gegen die Image-Collection über die REST API). Wie Health Checks im Detail umgesetzt werden, hängt vom späteren Deployment ab (Container/Managed Plattform, Reverse Proxy, Auth).

### 7.7.3 Backup-Strategie (Library Service)

Sobald der Library Service produktiv betrieben wird, müssen Datenbank und Uploads gesichert werden. Die konkrete Backup/Restore-Umsetzung ist aktuell noch offen, weil sie stark vom Deployment abhängt (managed PostgreSQL, Volume-Backups, Object Storage, Infrastruktur-Standards des Hostings).

### 7.7.4 Offene Punkte für den produktiven Betrieb

Das Projekt ist aktuell nicht produktionsreif deployed; deshalb sind viele Betriebsentscheidungen noch nicht getroffen. Sobald ein produktiver Betrieb ansteht, klären wir u.a. Monitoring/Alerting-Setup, Rollback-Strategie für den Library Service, Backup/Restore-Prozesse sowie konkrete Ziele für Verfügbarkeit und Wiederherstellungszeiten.

## 7.8 Appendix: Weitere Deployment-Szenarien

Die folgenden Deployment-Szenarien sind für spezifische Use Cases relevant, werden aber nur bei Bedarf eingesetzt.

### 7.8.1 Szenario: NPM Package Publishing (geplant)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Changesets as Changesets CLI
    participant Git as Git
    participant CI as GitLab CI
    participant NPM as NPM Registry

    Dev->>Changesets: pnpm changeset
    Changesets->>Dev: Select packages, enter changelog
    Dev->>Git: Commit .changeset/xyz.md

    Dev->>Git: git push origin develop

    Note over CI: On develop branch merge

    CI->>Changesets: pnpm version-packages
    Changesets->>CI: Update package.json versions
    Changesets->>CI: Generate CHANGELOG.md

    CI->>Git: Commit version bump

    Note over CI: Manual trigger for publish

    CI->>NPM: pnpm publish -r --access public
    NPM-->>CI: Packages published
```

**Geplante Package-Struktur:**

| Package        | NPM Name                        | Beschreibung                      |
| -------------- | ------------------------------- | --------------------------------- |
| types          | `@ujl-framework/types`          | TypeScript Types & Zod Schemas    |
| core           | `@ujl-framework/core`           | Composer, Module Registry, Fields |
| ui             | `@ujl-framework/ui`             | shadcn-svelte Components          |
| adapter-svelte | `@ujl-framework/adapter-svelte` | Svelte 5 Adapter                  |
| adapter-web    | `@ujl-framework/adapter-web`    | Web Components Adapter            |
| crafter        | `@ujl-framework/crafter`        | Visual Editor                     |
| examples       | `@ujl-framework/examples`       | Example Documents & Themes        |

### 7.8.2 Szenario: Produktion (Self-Hosted Full Stack)

Dieses Szenario beschreibt eine vollständige Produktions-Deployment-Umgebung mit allen UJL-Komponenten.

```mermaid
graph TB
    subgraph "Internet"
        Users[Users / Browsers]
    end

    subgraph "Load Balancer / Reverse Proxy"
        LB[Nginx / Traefik]
    end

    subgraph "Application Server(s)"
        subgraph "App Container 1"
            App1[Host Application<br/>(inkl. Crafter)]
        end
        subgraph "App Container 2"
            App2[Host Application<br/>(inkl. Crafter)]
        end
    end

    subgraph "Library Service"
        Payload[Library Service (Payload/Next)<br/>Port: 3000]
        subgraph "Database"
            PG[(PostgreSQL<br/>Port: 5432)]
        end
        subgraph "Storage"
            Uploads[(Uploads<br/>Volume)]
        end
    end

    subgraph "CDN / Static Assets"
        CDN[CDN<br/>Static Assets]
    end

    Users --> LB
    LB --> App1
    LB --> App2
    App1 --> Payload
    App2 --> Payload
    App1 --> CDN
    App2 --> CDN
    Payload --> PG
    Payload --> Uploads

    style LB fill:#3b82f6
    style App1 fill:#f59e0b
    style App2 fill:#f59e0b
    style Payload fill:#6366f1
    style PG fill:#10b981
    style CDN fill:#8b5cf6
```

Dieses Szenario ist ein mögliches Zielbild für self-hosted Betrieb. Das Repository liefert aktuell keine produktionsfertigen Container-Images oder eine `docker-compose.production.yml`. Die konkrete Umsetzung (Hosting, Reverse Proxy, Persistence, Backups, Monitoring) liegt beim jeweiligen Deployment der Host-Anwendung und des Library Service.

Für den produktiven Betrieb sollten Reverse Proxy und HTTPS-Termination (z.B. Nginx/Traefik), persistente Volumes für PostgreSQL und Uploads, eine Backup/Restore-Strategie sowie Monitoring und Alerting passend zu den Betriebsanforderungen eingeplant werden.
