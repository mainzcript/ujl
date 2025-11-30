---
title: "Dokumentation"
description: "Anwender-Dokumentation für UJL"
---

# Dokumentation

## UJL Entwickler-Anleitung

> ⚠️ Diese Anleitung beschreibt den aktuellen Entwicklungsstand des Projekts. Das Projekt befindet sich noch im Aufbau und ist nicht bereit für die Integration in Produktionsumgebungen. Diese Anleitung ist für alle gedacht, die den Crafter bereits im "Baustellen-Zustand" erkunden möchten.

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
│   ├── crafter/       # 🚧 Visual Editor (Work in Progress)
│   └── examples/      # Beispiel-UJL-Dateien
│
├── apps/              # Anwendungen
│   ├── demo/          # Demo-App (nutzt adapter-web)
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

1. **Rendering Pipeline** (fast produktionsreif)
   - Rendert UJL-Dateien zu HTML/CSS/JS
   - Validiert Syntax und Kompatibilität
   - Verwendbar über `adapter-svelte` oder `adapter-web`

2. **Crafter** (in Entwicklung) 🚧
   - Visueller Editor für Content und Design
   - Zwei Modi: Editor (Content) & Designer (Theme)
   - Noch nicht für produktiven Einsatz bereit

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

**Wichtig zu wissen:**

- Der Crafter ist noch nicht fertig entwickelt
- Viele Features sind noch im Aufbau
- Er ist noch NICHT in die Demo-App integrierbar
- Nutze ihn nur zum Experimentieren und Verstehen der Architektur

### Die Demo-App starten

Die **Demo-App** demonstriert das fertige Rendering von UJL-Dokumenten.

```bash
# Aus dem Projekt-Root:
pnpm --filter @ujl-framework/demo dev
```

Die Demo läuft auf `http://localhost:5173` (oder einem anderen Port).

**Was du siehst:**

- Eine minimale Website
- Verwendet `@ujl-framework/adapter-web` für Web Components
- Rendert vordefinierte UJL-Showcase-Dokumente aus dem Examples Paket
- Zeigt das fertige Output-Format (ContentFrame)

**Hinweis:** Die Demo nutzt NICHT den Crafter, sondern nur den Renderer. Sie zeigt das Endergebnis eines bereits erstellten UJL-Dokuments.

## Build-Prozess

Das Monorepo hat Build-Abhängigkeiten, die beachtet werden müssen:

```bash
# Gesamtes Projekt bauen (empfohlen)
# Baut Demo, Crafter und Dokumentation in der richtigen Reihenfolge
pnpm run build

# Oder einzelne Packages mit --filter (Reihenfolge beachten!):
pnpm --filter @ujl-framework/types build         # 1. Types
pnpm --filter @ujl-framework/core build          # 2. Core (braucht Types)
pnpm --filter @ujl-framework/ui build            # 3. UI (braucht Core)
pnpm --filter @ujl-framework/adapter-svelte build # 4. Svelte Adapter
pnpm --filter @ujl-framework/adapter-web build   # 5. Web Adapter
pnpm --filter @ujl-framework/demo build          # 6. Demo App
pnpm --filter @ujl-framework/crafter build       # Crafter
pnpm --filter @ujl-framework/docs build           # 7. Dokumentation
```

## Experimentieren mit UJL

### Neue UJL-Beispieldatei erstellen

Um eigene UJL-Dateien zu testen:

1. Erstelle eine `.ujlc.json` in `packages/examples/src/documents/`
2. Definiere Struktur mit `type`, `fields`, und `slots`
3. Exportiere sie in `packages/examples/src/index.ts`
4. Nutze sie in Demo oder Crafter zum Testen

## Wichtige Hinweise

### 🚧 Aktueller Stand des Crafters

- Der Crafter ist **noch lange nicht produktionsreif**
- Viele Features sind in Arbeit oder noch Platzhalter
