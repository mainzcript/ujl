---
title: "Verteilungssicht"
description: "Verteilung der Systemkomponenten auf Infrastruktur und Deployment"
---

# Verteilungssicht

Dieses Kapitel beschreibt die technische Infrastruktur, auf der das UJL-System ausgeführt wird, sowie die Zuordnung der Software-Bausteine zu den Infrastrukturkomponenten. Es werden verschiedene Deployment-Szenarien dargestellt: von der lokalen Entwicklungsumgebung bis hin zu Produktionsumgebungen.

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
        MediaServer[Media Server<br/>Docker Host]
    end

    subgraph "External Services"
        NPM[NPM Registry<br/>geplant]
    end

    Dev -->|git push| GitLab
    GitLab -->|deploy docs| Pages
    GitLab -->|publish packages| NPM
    Dev -->|docker-compose up| MediaServer

    style Dev fill:#3b82f6
    style GitLab fill:#f59e0b
    style Pages fill:#10b981
    style MediaServer fill:#6366f1
    style NPM fill:#8b5cf6
```

### 7.1.2 Begründung der Verteilungsstrategie

Die Deployment-Architektur folgt dem Prinzip **"Static-First, Services-When-Needed"**:

| Aspekt            | Entscheidung               | Begründung                                    |
| ----------------- | -------------------------- | --------------------------------------------- |
| **Core-Packages** | NPM Distribution           | Wiederverwendbarkeit, einfache Integration    |
| **Crafter**       | NPM Package (SvelteKit)    | Einbettbar in bestehende Projekte             |
| **Documentation** | Static Site (GitLab Pages) | Kosteneffizient, schnell, einfach zu deployen |
| **Media Service** | Docker Container           | Isoliert, portabel, skalierbar                |
| **Demo App**      | Static Build               | Showcase ohne Serverkosten                    |

### 7.1.3 Qualitäts- und Leistungsmerkmale

| Infrastruktur-Element  | Verfügbarkeit      | Skalierbarkeit         | Sicherheit                        |
| ---------------------- | ------------------ | ---------------------- | --------------------------------- |
| GitLab Pages           | 99.9% (GitLab SLA) | Automatisch (CDN)      | HTTPS, DDoS-Schutz                |
| Media Service (Docker) | Abhängig vom Host  | Horizontal (Container) | API-Key Auth, Network Isolation   |
| NPM Registry           | 99.99% (npm SLA)   | Automatisch            | npm audit, Vulnerability Scanning |

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
                UI[ui<br/>Port: 5173]
                AdapterSvelte[adapter-svelte<br/>Port: 5174]
                AdapterWeb[adapter-web<br/>Port: -]
                Crafter[crafter<br/>Port: 5175]
                Demo[demo<br/>Port: 4173]
                Docs[docs<br/>Port: 5176]
            end
        end

        subgraph "Docker Environment"
            subgraph "Media Stack"
                Payload[Payload CMS<br/>Port: 3000]
                Postgres[(PostgreSQL<br/>Port: 5432)]
            end
        end

        Browser[Browser<br/>Chrome/Firefox/Safari]
    end

    PNPM --> Types
    PNPM --> Core
    PNPM --> UI
    PNPM --> AdapterSvelte
    PNPM --> AdapterWeb
    PNPM --> Crafter
    PNPM --> Demo
    PNPM --> Docs

    Payload --> Postgres

    Browser --> UI
    Browser --> Crafter
    Browser --> Demo
    Browser --> Docs
    Crafter -.->|API Calls| Payload

    style PNPM fill:#f59e0b
    style Browser fill:#3b82f6
    style Payload fill:#6366f1
    style Postgres fill:#10b981
```

#### Voraussetzungen

| Komponente         | Version | Zweck                         |
| ------------------ | ------- | ----------------------------- |
| **Node.js**        | 18+     | JavaScript Runtime            |
| **pnpm**           | 10.26+  | Package Manager (Monorepo)    |
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
pnpm --filter @ujl-framework/crafter dev     # Crafter: http://localhost:5175
pnpm --filter @ujl-framework/ui dev          # UI Library: http://localhost:5173
pnpm --filter @ujl-framework/docs dev        # Docs: http://localhost:5176

# 5. Library Service starten (optional)
cd services/library
docker-compose up -d
# Library API: http://localhost:3000
```

#### Port-Mapping

| Service            | Port | Beschreibung                    |
| ------------------ | ---- | ------------------------------- |
| UI Dev Server      | 5173 | shadcn-svelte Component Library |
| adapter-svelte Dev | 5174 | Svelte Adapter Playground       |
| Crafter Dev        | 5175 | Visual Editor                   |
| Docs Dev           | 5176 | VitePress Documentation         |
| Demo               | 4173 | Demo Application (Preview)      |
| Payload CMS        | 3000 | Media API Backend               |
| PostgreSQL         | 5432 | Database (internal)             |

### 7.2.2 CI/CD Pipeline (GitLab CI)

```mermaid
graph LR
    subgraph "GitLab CI Pipeline"
        Install[install_deps<br/>pnpm install]
        Build[build_all<br/>pnpm build]
        Test[test_all<br/>pnpm test]
        Quality[quality_check<br/>lint + check]
        Deploy[pages<br/>GitLab Pages]
    end

    subgraph "Artifacts"
        Deps[node_modules/]
        Dist[packages/*/dist/]
        DocsOutput[apps/docs/dist/]
        Public[public/]
    end

    Install --> Build
    Build --> Test
    Build --> Quality
    Test --> Deploy
    Quality --> Deploy

    Install -.-> Deps
    Build -.-> Dist
    Build -.-> DocsOutput
    Deploy -.-> Public

    style Install fill:#8b5cf6
    style Build fill:#3b82f6
    style Test fill:#10b981
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
  NODE_VERSION: "18-slim"
  PNPM_VERSION: "10.26.2"
```

#### Stage-Details

| Stage       | Job             | Beschreibung                               | Dauer  |
| ----------- | --------------- | ------------------------------------------ | ------ |
| **install** | `install_deps`  | `pnpm install --frozen-lockfile` mit Cache | ~2 min |
| **build**   | `build_all`     | Alle Packages + Docs bauen                 | ~5 min |
| **test**    | `test_all`      | Vitest Unit Tests ausführen                | ~3 min |
| **quality** | `quality_check` | ESLint + TypeScript Check                  | ~2 min |
| **deploy**  | `pages`         | Docs nach GitLab Pages deployen            | ~1 min |

#### Caching-Strategie

```yaml
cache:
  key: dependencies-${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .pnpm-store/
    - "**/node_modules/"
    - "**/.svelte-kit/"
```

**Vorteile:**

- Branch-spezifisches Caching
- Schnellere Builds durch Wiederverwendung von node_modules
- `.pnpm-store` für effizientes Paket-Caching

#### Deployment-Regeln

```yaml
pages:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_COMMIT_BRANCH == "develop"
```

- **main**: Produktions-Dokumentation
- **develop**: Preview-Dokumentation

### 7.2.3 Media Service (Docker)

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "docker-compose Stack"
            PayloadContainer[payload<br/>node:18-alpine]
            PostgresContainer[postgres<br/>postgres:latest]
        end

        subgraph "Volumes"
            PGData[(pgdata<br/>PostgreSQL Data)]
            NodeModules[(node_modules<br/>Dependencies)]
            AppVolume[(. mounted<br/>Application Code)]
            MediaFiles[(media/<br/>Uploaded Files)]
        end
    end

    subgraph "External"
        Client[Crafter / API Client]
    end

    PayloadContainer -->|5432| PostgresContainer
    PostgresContainer --> PGData
    PayloadContainer --> NodeModules
    PayloadContainer --> AppVolume
    PayloadContainer --> MediaFiles

    Client -->|3000| PayloadContainer

    style PayloadContainer fill:#6366f1
    style PostgresContainer fill:#10b981
```

#### Container-Konfiguration

**Payload CMS Container:**

```yaml
payload:
  image: node:18-alpine
  ports:
    - "3000:3000"
  volumes:
    - .:/home/node/app
    - node_modules:/home/node/app/node_modules
  working_dir: /home/node/app/
  command: sh -c "corepack enable && corepack prepare pnpm@latest --activate && pnpm install && pnpm dev"
  depends_on:
    - postgres
  env_file:
    - .env
```

**PostgreSQL Container:**

```yaml
postgres:
  restart: always
  image: postgres:latest
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-postgres}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    POSTGRES_DB: ${POSTGRES_DB:-payload}
  volumes:
    - pgdata:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

#### Environment-Variablen

| Variable            | Beschreibung                 | Beispiel                                               |
| ------------------- | ---------------------------- | ------------------------------------------------------ |
| `DATABASE_URI`      | PostgreSQL Connection String | `postgres://postgres:password@postgres:5432/ujl-media` |
| `PAYLOAD_SECRET`    | JWT Secret (min. 32 Zeichen) | `your-super-secret-key-min-32-chars`                   |
| `POSTGRES_USER`     | DB Benutzer                  | `postgres`                                             |
| `POSTGRES_PASSWORD` | DB Passwort                  | `secure-password`                                      |
| `POSTGRES_DB`       | Datenbankname                | `payload`                                              |

#### Startup-Befehle

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f payload

# Nur PostgreSQL starten
docker-compose up postgres -d

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
    participant Docker as Docker Compose

    Dev->>Terminal: cd ujl && pnpm install
    Terminal->>PNPM: Install dependencies
    PNPM-->>Terminal: Done

    Dev->>Terminal: pnpm --filter @ujl-framework/crafter dev
    Terminal->>ViteDev: Start dev server
    ViteDev-->>Terminal: http://localhost:5175

    Dev->>Browser: Open http://localhost:5175
    Browser-->>ViteDev: Request
    ViteDev-->>Browser: Hot Module Replacement

    opt Library Service needed
        Dev->>Terminal: cd services/library && docker-compose up -d
        Terminal->>Docker: Start containers
        Docker-->>Terminal: payload + postgres running
    end

    Dev->>Browser: Edit UJLC Document
    Browser-->>ViteDev: Save changes
    ViteDev-->>Browser: Live Reload
```

**Charakteristiken:**

- Hot Module Replacement (HMR) für schnelle Entwicklung
- Alle Packages im Watch-Mode verfügbar
- Media Service optional (Docker)
- Kein Build-Schritt erforderlich für Entwicklung

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

    Runner->>Cache: Check cache (dependencies)
    Cache-->>Runner: Cache hit/miss

    Runner->>Runner: install_deps (pnpm install)
    Runner->>Cache: Store cache

    Runner->>Runner: build_all (pnpm build)
    Runner->>Runner: test_all (pnpm test)
    Runner->>Runner: quality_check (lint + check)

    alt Branch is main/develop
        Runner->>Pages: Deploy docs
        Pages-->>GitLab: Deployment successful
    end

    Runner-->>GitLab: Pipeline success/failure
    GitLab-->>Dev: Pipeline Notification
```

**Charakteristiken:**

- Automatisierte Quality Gates
- Branch-spezifisches Caching
- Automatisches Deployment auf main/develop
- Retry-Mechanismus für Infrastruktur-Fehler

### 7.3.3 Szenario: NPM Package Publishing (geplant)

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

    subgraph "UJL Media Service (optional)"
        MediaAPI[Payload CMS<br/>Port: 3000]
        MediaDB[(PostgreSQL)]
        MediaFiles[(Media Files)]
    end

    subgraph "CDN"
        StaticAssets[Static Assets<br/>CSS, Images]
    end

    App --> UJLPackages
    App --> API
    API --> DB
    App -.->|Media API| MediaAPI
    MediaAPI --> MediaDB
    MediaAPI --> MediaFiles
    App --> StaticAssets

    style App fill:#3b82f6
    style UJLPackages fill:#f59e0b
    style MediaAPI fill:#6366f1
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

## 7.4 Infrastruktur-Anforderungen

### 7.4.1 Mindestanforderungen

| Umgebung                  | CPU               | RAM  | Speicher | Netzwerk      |
| ------------------------- | ----------------- | ---- | -------- | ------------- |
| **Entwicklung**           | 2 Cores           | 8 GB | 10 GB    | Lokal         |
| **CI Runner**             | 2 Cores           | 4 GB | 5 GB     | GitLab SaaS   |
| **Media Service**         | 1 Core            | 2 GB | 10 GB+   | Port 3000     |
| **Produktion (Frontend)** | Abhängig von Host | -    | -        | CDN empfohlen |

### 7.4.2 Empfohlene Konfiguration

| Umgebung          | CPU      | RAM   | Speicher   | Zusätzlich        |
| ----------------- | -------- | ----- | ---------- | ----------------- |
| **Entwicklung**   | 4+ Cores | 16 GB | SSD 20 GB+ | Docker Desktop    |
| **CI Runner**     | 4 Cores  | 8 GB  | 10 GB      | Caching aktiviert |
| **Media Service** | 2 Cores  | 4 GB  | 50 GB+ SSD | Backup-Strategie  |

### 7.4.3 Sicherheitsanforderungen

| Komponente     | Anforderung         | Implementierung                                   |
| -------------- | ------------------- | ------------------------------------------------- |
| **Media API**  | Authentication      | API-Key via `Authorization: users API-Key <key>`  |
| **PostgreSQL** | Netzwerk-Isolation  | Docker Network (nicht extern exponiert empfohlen) |
| **Secrets**    | Sichere Speicherung | Environment Variables, nie in Git                 |
| **HTTPS**      | Verschlüsselung     | Reverse Proxy (nginx/Traefik) in Produktion       |

## 7.5 Mapping: Software zu Infrastruktur

### 7.5.1 Zuordnungstabelle

| Software-Baustein               | Deployment-Artefakt               | Infrastruktur-Element |
| ------------------------------- | --------------------------------- | --------------------- |
| `@ujl-framework/types`          | `dist/*.js`, `dist/*.d.ts`        | NPM Registry          |
| `@ujl-framework/core`           | `dist/*.js`, `dist/*.d.ts`        | NPM Registry          |
| `@ujl-framework/ui`             | `dist/*.js`, `dist/*.svelte`, CSS | NPM Registry          |
| `@ujl-framework/adapter-svelte` | `dist/*.js`, `dist/*.svelte`, CSS | NPM Registry          |
| `@ujl-framework/adapter-web`    | `dist/index.js` (bundled)         | NPM Registry          |
| `@ujl-framework/crafter`        | SvelteKit Package                 | NPM Registry          |
| `@ujl-framework/examples`       | JSON Files                        | NPM Registry          |
| `docs`                          | Static HTML/CSS/JS                | GitLab Pages          |
| `demo`                          | Static HTML/CSS/JS                | (Private)             |
| `media`                         | Docker Image                      | Docker Host           |

### 7.5.2 Build-Artefakte

```mermaid
graph LR
    subgraph "Source"
        TS[TypeScript]
        Svelte[Svelte 5]
        CSS[CSS/Tailwind]
        MD[Markdown]
    end

    subgraph "Build Tools"
        TSC[tsc]
        SvelteKit[SvelteKit]
        Vite[Vite]
        VitePress[VitePress]
    end

    subgraph "Output"
        JS[JavaScript ESM]
        DTS[Type Declarations]
        SvelteComp[Svelte Components]
        CSSBundle[CSS Bundle]
        HTML[Static HTML]
    end

    TS --> TSC
    TSC --> JS
    TSC --> DTS

    Svelte --> SvelteKit
    SvelteKit --> SvelteComp
    SvelteKit --> JS

    CSS --> Vite
    Vite --> CSSBundle

    MD --> VitePress
    VitePress --> HTML
```

## 7.6 Operations und Monitoring

### 7.6.1 Logging

| Komponente      | Log-Ziel              | Log-Level       |
| --------------- | --------------------- | --------------- |
| Vite Dev Server | Console               | info/warn/error |
| SvelteKit       | Console               | info/warn/error |
| Payload CMS     | Console + Docker Logs | info/warn/error |
| PostgreSQL      | Docker Logs           | warn/error      |
| GitLab CI       | Job Logs              | Alle            |

**Log-Zugriff:**

```bash
# Docker Logs
docker-compose logs -f payload
docker-compose logs -f postgres

# GitLab CI Logs
# Über GitLab UI: CI/CD → Pipelines → Jobs
```

### 7.6.2 Health Checks

| Service     | Endpoint                  | Erwartung         |
| ----------- | ------------------------- | ----------------- |
| Payload CMS | `GET /admin`              | HTTP 200/302      |
| Payload API | `GET /api/images?limit=1` | HTTP 200 + JSON   |
| PostgreSQL  | TCP Port 5432             | Connection Accept |

**Docker Health Check (empfohlen):**

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/admin"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### 7.6.3 Backup-Strategie (Media Service)

| Komponente  | Backup-Methode          | Frequenz     |
| ----------- | ----------------------- | ------------ |
| PostgreSQL  | `pg_dump`               | Täglich      |
| Media Files | Volume Backup           | Täglich      |
| .env        | Secure Storage (extern) | Bei Änderung |

**Backup-Script (Beispiel):**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Database Backup
docker-compose exec -T postgres pg_dump -U postgres payload > backup_db_$DATE.sql

# Media Files Backup
tar -czf backup_media_$DATE.tar.gz media/
```

## 7.7 Zusammenfassung

### Deployment-Übersicht

| Aspekt            | Aktueller Stand             | Ziel                |
| ----------------- | --------------------------- | ------------------- |
| **Dokumentation** | GitLab Pages (main/develop) | Stabil              |
| **Packages**      | Lokal / Monorepo            | NPM Registry        |
| **Media Service** | Docker Compose (Lokal)      | Produktions-Hosting |
| **Demo**          | Static Build (Lokal)        | Demo-Server         |

### Empfehlungen für Produktions-Deployment

1. **Frontend-Packages**: Über NPM in Host-Applikation integrieren
2. **Media Service**: Dedizierter Docker Host mit:
   - Reverse Proxy (nginx/Traefik) für HTTPS
   - Persistent Volumes für PostgreSQL und Media
   - Automatisierte Backups
   - Monitoring (Prometheus/Grafana optional)
3. **CDN**: Für statische Assets (CSS, Bilder)
4. **Skalierung**: Horizontal via Container-Orchestrierung (Docker Swarm/Kubernetes) bei Bedarf
