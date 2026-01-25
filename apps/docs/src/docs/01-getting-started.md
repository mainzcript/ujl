---
title: "Dokumentation"
description: "Anwender-Dokumentation für UJL"
---

# Dokumentation

::: warning Entwicklungsstand

Das UJL-Framework befindet sich im aktiven Aufbau. Die Rendering-Pipeline ist weitgehend stabil, der Crafter ist jedoch noch nicht produktionsreif. Diese Anleitung richtet sich an Entwickler:innen, die das Framework bereits jetzt erkunden möchten.

:::

## Projekt-Übersicht

Das UJL-Framework ist ein **pnpm Monorepo** mit folgender Struktur:

```
ujl/
├── packages/           # Kern-Packages des Frameworks
│   ├── types/         # TypeScript Typdefinitionen
│   ├── core/          # Core-Funktionalität (Validator, etc.)
│   ├── ui/            # UI-Komponenten (shadcn-svelte)
│   ├── adapter-svelte/  # Svelte-Adapter für UJL-Rendering
│   ├── adapter-web/   # Web Components Adapter
│   ├── crafter/       # Visual Editor
│   └── examples/      # Beispiel-UJL-Dateien
│
├── apps/              # Anwendungen
│   ├── dev-demo/      # Dev Demo: Crafter Integration Demo
│   └── docs/          # Dokumentations-Website
│
└── services/          # Backend-Services
```

## Wichtige Konzepte

### Trennung von Struktur, Design und Inhalt

- **Struktur**: Definiert durch Module und Layout-Komponenten
- **Design**: Wird in `.ujlt.json` Theme-Dateien festgelegt
- **Inhalt**: Liegt in `.ujlc.json` Content-Dateien

### Zwei Hauptwerkzeuge

1. **Rendering Pipeline**
   - Rendert UJL-Dateien zu HTML/CSS/JS
   - Validiert Syntax und Kompatibilität
   - Verwendbar über `adapter-svelte` oder `adapter-web`

2. **Crafter**
   - Visueller Editor für Content und Design
   - Zwei Modi: Editor (Content) & Designer (Theme)

## Schnellstart

### Repository Setup

```bash
# Repository klonen
git clone git@gitlab.mainzcript.eu:ujl-framework/ujl.git
cd ujl

# Dependencies installieren
pnpm install

# Packages bauen
pnpm run build
```

### Den Crafter im Dev-Mode starten

Der **Crafter** ist das visuelle Editor-Tool zum Erstellen und Bearbeiten von UJL-Dateien.

```bash
# Aus dem Projekt-Root:
pnpm --filter @ujl-framework/crafter dev
```

Der Crafter startet dann auf `http://localhost:5173` (oder einem anderen Port, falls 5173 belegt ist).

**Was du siehst:**

- Eine SvelteKit-Anwendung mit zwei Modi: Editor & Designer
- Interaktive UI zum Bearbeiten von UJL-Content und -Themes
- Live-Preview der Änderungen

### Die Dev-Demo starten

Die **Dev-Demo** (`apps/dev-demo`) ist eine minimale Integration-Demo für den UJL Crafter. Sie zeigt, wie der Crafter in eine Vanilla TypeScript-Anwendung eingebunden wird und unterstützt zwei Library-Speichermodi:

- **Inline** (Standard): Bilder werden als Base64 direkt im Dokument gespeichert
- **Backend**: Bilder werden auf einem Payload CMS Server (`services/library`) gespeichert

#### Schnellstart (Inline-Modus)

Der einfachste Weg, die Demo zu starten, ohne zusätzliche Konfiguration:

```bash
# Aus dem Projekt-Root:
pnpm --filter @ujl-framework/dev-demo dev
```

Die Demo startet auf `http://localhost:5174` (oder einem anderen Port) mit Inline-Library-Speicher.

#### Backend-Modus Setup

Um persistente Library-Speicherung über den Library-Service zu nutzen:

1. **Library-Service starten:**

   ```bash
   # In einem separaten Terminal
   cd services/library
   pnpm run dev
   ```

   Startet PostgreSQL (via Docker) und Payload CMS auf `http://localhost:3000`

2. **Admin-User erstellen:**
   - Öffne `http://localhost:3000/admin`
   - Fülle das Registrierungsformular aus (erster User wird Admin)
   - Klicke auf "Create Account"

3. **API-Key aktivieren:**
   - In der Admin-UI: **Users** → dein User
   - Scrolle zu **Enable API Key** und aktiviere es
   - **Kopiere den generierten API-Key**

4. **Umgebung konfigurieren:**

   ```bash
   # In apps/dev-demo
   cp .env.example .env
   ```

   Bearbeite `.env`:

   ```bash
   VITE_LIBRARY_STORAGE=backend
   VITE_BACKEND_URL=http://localhost:3000
   VITE_BACKEND_API_KEY=dein-api-key-hier
   ```

5. **Demo starten:**
   ```bash
   pnpm --filter @ujl-framework/dev-demo dev
   ```

Jetzt werden hochgeladene Bilder im Library-Service gespeichert.

**Was du siehst:**

- Eine minimale Vanilla TypeScript-Anwendung
- UJL Crafter eingebettet und funktionsfähig
- Möglichkeit, zwischen Inline- und Backend-Speicherung zu wechseln
- Perfekt für Evaluierung und Integrationstests

## Build-Prozess

Das Monorepo hat Build-Abhängigkeiten, die beachtet werden müssen:

```bash
# Gesamtes Projekt bauen (empfohlen)
# Baut Crafter und Dokumentation in der richtigen Reihenfolge
pnpm run build

# Oder einzelne Packages mit --filter (Reihenfolge beachten!):
pnpm --filter @ujl-framework/types build         # 1. Types
pnpm --filter @ujl-framework/core build          # 2. Core (braucht Types)
pnpm --filter @ujl-framework/ui build            # 3. UI (braucht Core)
pnpm --filter @ujl-framework/adapter-svelte build # 4. Svelte Adapter
pnpm --filter @ujl-framework/adapter-web build   # 5. Web Adapter
pnpm --filter @ujl-framework/crafter build       # 6. Crafter
pnpm --filter @ujl-framework/docs build          # 7. Dokumentation
```
