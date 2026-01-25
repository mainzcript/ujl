---
title: "Verteilungssicht"
description: "Verteilung der Systemkomponenten auf Infrastruktur und Deployment"
---

# Verteilungssicht

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
        LibraryServer[Library Service Host<br/>Docker Host]
    end

    subgraph "External Services"
        NPM[NPM Registry<br/>geplant]
    end

    Dev -->|git push| GitLab
    GitLab -->|deploy docs| Pages
    GitLab -->|publish packages| NPM
    Dev -->|docker-compose up| LibraryServer

    style Dev fill:#3b82f6
    style GitLab fill:#f59e0b
    style Pages fill:#10b981
    style LibraryServer fill:#6366f1
    style NPM fill:#8b5cf6
```

### 7.1.2 Begründung der Verteilungsstrategie

Die Deployment-Architektur folgt dem Prinzip **"Static-First, Services-When-Needed"**:

| Aspekt              | Entscheidung               | Begründung                                    |
| ------------------- | -------------------------- | --------------------------------------------- |
| **Core-Packages**   | NPM Distribution           | Wiederverwendbarkeit, einfache Integration    |
| **Crafter**         | NPM Package (SvelteKit)    | Einbettbar in bestehende Projekte             |
| **Documentation**   | Static Site (GitLab Pages) | Kosteneffizient, schnell, einfach zu deployen |
| **Library Service** | Docker Container           | Isoliert, portabel, skalierbar                |
| **dev-demo**        | Static Build               | Showcase ohne Serverkosten                    |

### 7.1.3 Qualitäts- und Leistungsmerkmale

| Infrastruktur-Element    | Verfügbarkeit      | Skalierbarkeit         | Sicherheit                        |
| ------------------------ | ------------------ | ---------------------- | --------------------------------- |
| GitLab Pages             | 99.9% (GitLab SLA) | Automatisch (CDN)      | HTTPS, DDoS-Schutz                |
| Library Service (Docker) | Abhängig vom Host  | Horizontal (Container) | API-Key Auth, Network Isolation   |
| NPM Registry             | 99.99% (npm SLA)   | Automatisch            | npm audit, Vulnerability Scanning |

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
                DevDemo[dev-demo<br/>Port: 4173]
                Docs[docs<br/>Port: 5176]
            end
        end

        subgraph "Docker Environment"
            subgraph "Library Stack"
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
    PNPM --> DevDemo
    PNPM --> Docs

    Payload --> Postgres

    Browser --> UI
    Browser --> Crafter
    Browser --> DevDemo
    Browser --> Docs
    Crafter -.->|Image API| Payload

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

# 5. Library Service starten (bei Bedarf)
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
| dev-demo           | 4173 | Demo Application (Preview)      |
| Payload CMS        | 3000 | Image API Backend               |
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
        DocsOutput[.vitepress/dist/]
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

### 7.2.3 Library Service (Docker)

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
            Uploads[(uploads/<br/>Uploaded Files)]
        end
    end

    subgraph "External"
        Client[Crafter / API Client]
    end

    PayloadContainer -->|5432| PostgresContainer
    PostgresContainer --> PGData
    PayloadContainer --> NodeModules
    PayloadContainer --> AppVolume
    PayloadContainer --> Uploads

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
    POSTGRES_DB: ${POSTGRES_DB:-library}
  volumes:
    - pgdata:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

#### Environment-Variablen

| Variable            | Beschreibung                 | Beispiel                                             |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| `DATABASE_URI`      | PostgreSQL Connection String | `postgres://postgres:password@postgres:5432/library` |
| `PAYLOAD_SECRET`    | JWT Secret (min. 32 Zeichen) | `your-super-secret-key-min-32-chars`                 |
| `POSTGRES_USER`     | DB Benutzer                  | `postgres`                                           |
| `POSTGRES_PASSWORD` | DB Passwort                  | `secure-password`                                    |
| `POSTGRES_DB`       | Datenbankname                | `library`                                            |

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
- Library Service (bei Bedarf, Docker)
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

| Umgebung                  | CPU               | RAM  | Speicher | Netzwerk      |
| ------------------------- | ----------------- | ---- | -------- | ------------- |
| **Entwicklung**           | 2 Cores           | 8 GB | 10 GB    | Lokal         |
| **CI Runner**             | 2 Cores           | 4 GB | 5 GB     | GitLab SaaS   |
| **Library Service**       | 1 Core            | 2 GB | 10 GB+   | Port 3000     |
| **Produktion (Frontend)** | Abhängig von Host | -    | -        | CDN empfohlen |

### 7.4.2 Empfohlene Konfiguration

| Umgebung            | CPU      | RAM   | Speicher   | Zusätzlich        |
| ------------------- | -------- | ----- | ---------- | ----------------- |
| **Entwicklung**     | 4+ Cores | 16 GB | SSD 20 GB+ | Docker Desktop    |
| **CI Runner**       | 4 Cores  | 8 GB  | 10 GB      | Caching aktiviert |
| **Library Service** | 2 Cores  | 4 GB  | 50 GB+ SSD | Backup-Strategie  |

### 7.4.3 Sicherheitsanforderungen

| Komponente     | Anforderung         | Implementierung                                   |
| -------------- | ------------------- | ------------------------------------------------- |
| **Image API**  | Authentication      | API-Key via `Authorization: users API-Key <key>`  |
| **PostgreSQL** | Netzwerk-Isolation  | Docker Network (nicht extern exponiert empfohlen) |
| **Secrets**    | Sichere Speicherung | Environment Variables, nie in Git                 |
| **HTTPS**      | Verschlüsselung     | Reverse Proxy (nginx/Traefik) in Produktion       |

## 7.5 Mapping: Software zu Infrastruktur

### 7.7.1 Zuordnungstabelle

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
| `dev-demo`                      | Static HTML/CSS/JS                | (Private)             |
| `library`                       | Docker Image                      | Docker Host           |

### 7.7.2 Build-Artefakte

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

## 7.7 Skalierungsstrategie

### 7.7.1 Horizontale Skalierung

**Application Layer (Crafter):**

UJL Crafter ist als stateless SvelteKit-Anwendung konzipiert und kann horizontal skaliert werden.

```mermaid
graph LR
    LB[Load Balancer]

    subgraph "Application Instances"
        App1[Crafter Instance 1]
        App2[Crafter Instance 2]
        AppN[Crafter Instance N]
    end

    subgraph "Shared Services"
        Payload[Payload CMS]
        PG[(PostgreSQL)]
    end

    LB --> App1
    LB --> App2
    LB --> AppN

    App1 --> Payload
    App2 --> Payload
    AppN --> Payload

    Payload --> PG
```

**Skalierungs-Trigger:**

| Metrik            | Schwellwert  | Aktion      |
| ----------------- | ------------ | ----------- |
| CPU-Auslastung    | >70% (5 Min) | +1 Instance |
| Memory-Auslastung | >80% (5 Min) | +1 Instance |
| Request Rate      | >1000 req/s  | +1 Instance |
| Response Time     | >500ms (p95) | +1 Instance |

**Kubernetes Auto-Scaling (Beispiel):**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ujl-crafter
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ujl-crafter
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Docker Swarm Auto-Scaling (Beispiel):**

```yaml
services:
  crafter:
    image: ghcr.io/ujl-framework/crafter:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

### 7.7.2 Vertikale Skalierung

**PostgreSQL:**

| Last-Profil                 | CPU      | Memory | Storage | IOPS  |
| --------------------------- | -------- | ------ | ------- | ----- |
| Niedrig (<1000 Bilder)      | 2 Cores  | 4GB    | 50GB    | 1000  |
| Mittel (<10.000 Bilder)     | 4 Cores  | 8GB    | 100GB   | 3000  |
| Hoch (<100.000 Bilder)      | 8 Cores  | 16GB   | 500GB   | 5000  |
| Sehr Hoch (>100.000 Bilder) | 16 Cores | 32GB   | 1TB     | 10000 |

**Payload CMS:**

| Concurrent Users | CPU     | Memory | Instances |
| ---------------- | ------- | ------ | --------- |
| <10              | 1 Core  | 2GB    | 1         |
| 10-50            | 2 Cores | 4GB    | 2         |
| 50-200           | 4 Cores | 8GB    | 3-5       |
| >200             | 8 Cores | 16GB   | 5+        |

### 7.7.3 Datenbank-Skalierung

**Read Replicas:**

Für lesintensive Workloads können PostgreSQL Read Replicas eingesetzt werden:

```mermaid
graph TB
    subgraph "Write Operations"
        Writer[Primary PostgreSQL]
    end

    subgraph "Read Operations"
        Reader1[Read Replica 1]
        Reader2[Read Replica 2]
    end

    Writer -.->|Replication| Reader1
    Writer -.->|Replication| Reader2

    Payload[Payload CMS] -->|Writes| Writer
    Payload -.->|Reads| Reader1
    Payload -.->|Reads| Reader2
```

**Connection Pooling:**

Für hohe Concurrent Connections PgBouncer einsetzen:

```ini
# pgbouncer.ini
[databases]
payload = host=postgres port=5432 dbname=payload

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### 7.7.4 Library Storage-Skalierung

**Object Storage (S3-kompatibel):**

Für große Asset-Bibliotheken Wechsel zu Object Storage:

```typescript
// Payload Config mit S3
import { s3Adapter } from "@payloadcms/plugin-cloud-storage/s3";

export default buildConfig({
	collections: [
		{
			slug: "images",
			upload: {
				adapter: s3Adapter({
					config: {
						endpoint: process.env.S3_ENDPOINT,
						credentials: {
							accessKeyId: process.env.S3_ACCESS_KEY,
							secretAccessKey: process.env.S3_SECRET_KEY,
						},
						region: process.env.S3_REGION,
					},
					bucket: process.env.S3_BUCKET,
				}),
			},
		},
	],
});
```

**CDN-Integration:**

```nginx
# Nginx CDN Cache
location /uploads/ {
    proxy_pass http://payload:3000;
    proxy_cache uploads_cache;
    proxy_cache_valid 200 7d;
    proxy_cache_valid 404 1h;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 7.7.5 Performance-Optimierungen

**Lazy Loading:**

UJL-Adapter unterstützen Lazy Loading von Modulen:

```typescript
// Code Splitting in Adapter
const modules = {
	container: () => import("./nodes/Container.svelte"),
	text: () => import("./nodes/Text.svelte"),
	image: () => import("./nodes/Image.svelte"),
};
```

**Bundle Optimization:**

```javascript
// vite.config.ts
export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["svelte", "@ujl-framework/core"],
					adapter: ["@ujl-framework/adapter-svelte"],
					ui: ["@ujl-framework/ui"],
				},
			},
		},
	},
});
```

**Caching-Strategie:**

| Ressource              | Cache-Dauer | Strategie              |
| ---------------------- | ----------- | ---------------------- |
| Static Assets (CSS/JS) | 1 Jahr      | Immutable + Hash       |
| Uploads (Images)       | 7 Tage      | CDN + ETag             |
| API Responses          | 5 Minuten   | Stale-While-Revalidate |
| HTML Pages (SSR)       | 1 Minute    | Edge Cache             |

### 7.7.6 Monitoring für Skalierung

**Key Performance Indicators (KPIs):**

| KPI                   | Zielwert   | Skalierungs-Signal            |
| --------------------- | ---------- | ----------------------------- |
| Request Latency (p95) | <200ms     | >300ms → Scale Up             |
| Throughput            | 1000 req/s | >80% Kapazität → Scale Up     |
| Error Rate            | <1%        | >2% → Investigate, dann Scale |
| Database Connections  | <80% Pool  | >90% → Increase Pool/Scale    |
| Memory Usage          | <75%       | >85% → Scale Up               |

**Grafana Dashboard (Beispiel-Queries):**

```promql
# Request Rate
rate(http_requests_total[5m])

# Response Time p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Container Memory Usage
container_memory_usage_bytes / container_spec_memory_limit_bytes

# Database Connections
pg_stat_activity_count / max_connections
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

### 7.6.3 Backup-Strategie (Library Service)

| Komponente | Backup-Methode          | Frequenz     |
| ---------- | ----------------------- | ------------ |
| PostgreSQL | `pg_dump`               | Täglich      |
| Uploads    | Volume Backup           | Täglich      |
| .env       | Secure Storage (extern) | Bei Änderung |

**Backup-Script (Beispiel):**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Database Backup
docker-compose exec -T postgres pg_dump -U postgres library > backup_db_$DATE.sql

# Uploads Backup
tar -czf backup_uploads_$DATE.tar.gz uploads/
```

### 7.6.4 Metriken und KPIs

**System-Metriken:**

| Metrik              | Zielwert         | Messmethode               | Frequenz       |
| ------------------- | ---------------- | ------------------------- | -------------- |
| API Response Time   | <200ms (p95)     | Payload CMS Logs          | Kontinuierlich |
| Database Query Time | <50ms (p95)      | PostgreSQL Slow Query Log | Kontinuierlich |
| Container Memory    | <512MB (Payload) | Docker Stats              | Alle 60s       |
| Container CPU       | <50% (Payload)   | Docker Stats              | Alle 60s       |
| Disk Usage          | <80%             | df -h                     | Täglich        |

**Anwendungs-Metriken:**

| Metrik                         | Zielwert | Messmethode        | Frequenz  |
| ------------------------------ | -------- | ------------------ | --------- |
| Image Upload Success Rate      | >99%     | Payload API Logs   | Stündlich |
| Image Resolution Success Rate  | >99.9%   | Crafter Error Logs | Stündlich |
| Schema Validation Success Rate | >95%     | CLI/Core Logs      | Täglich   |

**Empfohlene Monitoring-Tools:**

- **Prometheus + Grafana**: Für Langzeit-Metriken und Dashboards
- **Loki**: Für Log-Aggregation
- **cAdvisor**: Für Container-Metriken

### 7.6.5 Alerting-Strategie

**Alerts mit hoher Priorität (sofortige Reaktion):**

| Alert                    | Bedingung                        | Aktion                            |
| ------------------------ | -------------------------------- | --------------------------------- |
| Service Down             | Health Check fehlgeschlagen (3x) | Neustart, Eskalation              |
| Database Connection Lost | PostgreSQL nicht erreichbar      | Verbindung prüfen, Neustart       |
| Disk Full                | >90% Disk-Auslastung             | Logs rotieren, Backup archivieren |
| High Error Rate          | >5% Fehlerrate in 5 Minuten      | Logs prüfen, Rollback erwägen     |

**Warnungen (Überwachung erforderlich):**

| Warning              | Bedingung              | Aktion                |
| -------------------- | ---------------------- | --------------------- |
| High Memory Usage    | >80% Memory-Auslastung | Ressourcen überwachen |
| Slow Queries         | >500ms Query Time      | Query optimieren      |
| High Upload Failures | >1% Upload-Fehlerrate  | Storage prüfen        |

**Alert-Kanäle (Empfehlung):**

- **Hohe Priorität**: E-Mail, Slack, PagerDuty
- **Warnung**: E-Mail, Slack

### 7.6.6 Disaster Recovery

**Recovery Time Objective (RTO):** <4 Stunden  
**Recovery Point Objective (RPO):** <24 Stunden (Daily Backups)

**Disaster Recovery Plan:**

1. **Datenbank-Wiederherstellung:**

```bash
# Backup einspielen
docker-compose exec -T postgres psql -U postgres library < backup_db_YYYYMMDD.sql

# Verbindung testen
docker-compose exec postgres psql -U postgres -c "\l"
```

2. **Uploads-Wiederherstellung:**

```bash
# Backup entpacken
tar -xzf backup_uploads_YYYYMMDD.tar.gz -C services/library/uploads/

# Permissions setzen
chown -R 1000:1000 services/library/uploads/
```

3. **Service-Neustart:**

```bash
# Container neu starten
docker-compose down
docker-compose up -d

# Logs prüfen
docker-compose logs -f payload
```

4. **Validierung:**

- Health Checks durchführen
- Test-Upload durchführen
- Image Resolution testen
- Admin-Zugriff prüfen

**Backup-Retention:**

| Backup-Typ      | Aufbewahrung |
| --------------- | ------------ |
| Daily Backups   | 7 Tage       |
| Weekly Backups  | 4 Wochen     |
| Monthly Backups | 12 Monate    |

### 7.6.7 Rollback-Strategie

**Deployment-Rollback:**

1. **GitLab CI/CD:**

```bash
# Letzten erfolgreichen Build re-deployen
# Über GitLab UI: CI/CD → Pipelines → [Letzter erfolgreicher Build] → Retry
```

2. **Docker-Rollback:**

```bash
# Zu vorherigem Image wechseln
docker pull ghcr.io/ujl-framework/payload-cms:previous-tag
docker-compose down
docker-compose up -d
```

3. **Changesets-Rollback:**

```bash
# Package-Version zurücksetzen
git revert <commit-hash>
pnpm install
pnpm build
```

**Rollback-Entscheidungskriterien:**

| Kriterium               | Schwellwert                           | Aktion                      |
| ----------------------- | ------------------------------------- | --------------------------- |
| Error Rate              | >10% in 5 Minuten                     | Sofortiger Rollback         |
| Critical Bug            | P1 Sicherheitslücke                   | Sofortiger Rollback         |
| Performance Degradation | >2x Baseline Response Time            | Rollback nach 15 Minuten    |
| User Reports            | >10 Reports mit hoher Priorität in 1h | Rollback nach Investigation |

### Deployment-Übersicht

| Aspekt              | Aktueller Stand             | Ziel                |
| ------------------- | --------------------------- | ------------------- |
| **Dokumentation**   | GitLab Pages (main/develop) | Stabil              |
| **Packages**        | Lokal / Monorepo            | NPM Registry        |
| **Library Service** | Docker Compose (Lokal)      | Produktions-Hosting |
| **dev-demo**        | Static Build (Lokal)        | Demo-Server         |

### Empfehlungen für Produktions-Deployment

1. **Frontend-Packages**: Über NPM in Host-Applikation integrieren
2. **Library Service**: Dedizierter Docker Host mit:
   - Reverse Proxy (nginx/Traefik) für HTTPS
   - Persistent Volumes für PostgreSQL und Uploads
   - Automatisierte Backups
   - Monitoring (Prometheus/Grafana, falls eingesetzt)
3. **CDN**: Für statische Assets (CSS, Bilder)
4. **Skalierung**: Horizontal via Container-Orchestrierung (Docker Swarm/Kubernetes) bei Bedarf

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
            App1[UJL Crafter<br/>SvelteKit SSR]
        end
        subgraph "App Container 2"
            App2[UJL Crafter<br/>SvelteKit SSR]
        end
    end

    subgraph "Library Service"
        subgraph "Payload Container"
            Payload[Payload CMS<br/>Port: 3000]
        end
        subgraph "Database"
            PG[(PostgreSQL<br/>Port: 5432)]
        end
        subgraph "Storage"
            Uploads[(Uploads<br/>Volume)]
        end
    end

    subgraph "CDN / Static Assets"
        CDN[CloudFlare / AWS<br/>Static Assets]
    end

    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    subgraph "Backup"
        BackupService[Automated Backup<br/>Daily Cron]
        BackupStorage[(Backup Storage<br/>S3 / NFS)]
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

    Prometheus -.->|Scrape| App1
    Prometheus -.->|Scrape| App2
    Prometheus -.->|Scrape| Payload
    Grafana --> Prometheus

    BackupService -.->|Backup| PG
    BackupService -.->|Backup| Uploads
    BackupService --> BackupStorage

    style LB fill:#3b82f6
    style App1 fill:#f59e0b
    style App2 fill:#f59e0b
    style Payload fill:#6366f1
    style PG fill:#10b981
    style CDN fill:#8b5cf6
```

**Deployment-Konfiguration:**

| Komponente    | Instanzen | CPU     | Memory | Storage   | Redundanz     |
| ------------- | --------- | ------- | ------ | --------- | ------------- |
| Nginx/Traefik | 1-2       | 1 Core  | 512MB  | -         | Bei Bedarf    |
| UJL Crafter   | 2+        | 2 Cores | 2GB    | -         | Load Balanced |
| Payload CMS   | 1-2       | 2 Cores | 4GB    | -         | Aktiv-Passiv  |
| PostgreSQL    | 1         | 4 Cores | 8GB    | 100GB SSD | Replication   |
| Uploads       | 1         | -       | -      | 500GB+    | RAID/S3       |

**Container-Orchestrierung (Docker Compose Production):**

```yaml
version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: always
    depends_on:
      - crafter-1
      - crafter-2

  crafter-1:
    image: ghcr.io/ujl-framework/crafter:latest
    environment:
      - NODE_ENV=production
      - PAYLOAD_URL=http://payload:3000
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G

  crafter-2:
    image: ghcr.io/ujl-framework/crafter:latest
    environment:
      - NODE_ENV=production
      - PAYLOAD_URL=http://payload:3000
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G

  payload:
    image: ghcr.io/ujl-framework/payload-cms:latest
    environment:
      - POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/payload
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
    volumes:
      - uploads-data:/app/uploads
    restart: always
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/admin"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=payload
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: always
    deploy:
      resources:
        limits:
          cpus: "4"
          memory: 8G

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: always

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
    restart: always
    ports:
      - "3001:3000"

volumes:
  postgres-data:
  uploads-data:
  prometheus-data:
  grafana-data:
```

**SSL/TLS-Konfiguration (Nginx):**

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Crafter Routing
    location / {
        proxy_pass http://crafter-1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Library Service Routing
    location /api/ {
        proxy_pass http://payload:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Deployment-Schritte:**

1. **Vorbereitung:**

   ```bash
   # Secrets generieren
   openssl rand -base64 32 > .env.secret

   # .env Datei erstellen
   cat > .env <<EOF
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   PAYLOAD_SECRET=$(cat .env.secret)
   GRAFANA_PASSWORD=$(openssl rand -base64 32)
   EOF
   ```

2. **Initial Deployment:**

   ```bash
   # Container starten
   docker-compose -f docker-compose.production.yml up -d

   # Logs prüfen
   docker-compose logs -f
   ```

3. **SSL-Zertifikate einrichten:**

   ```bash
   # Let's Encrypt mit Certbot
   certbot certonly --webroot -w /var/www/html -d your-domain.com
   ```

4. **Health Check:**
   ```bash
   # Services prüfen
   curl https://your-domain.com/admin
   curl https://your-domain.com/api/images?limit=1
   ```
