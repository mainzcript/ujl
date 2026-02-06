---
title: "Installation & Integration"
description: "UJL produktiv nutzen - Vollständige Integration"
---

# Installation & Integration

UJL (Unified JSON Layout) ist ein Framework für **garantiert markenkonforme und barrierefreie Websites**. Es trennt Content, Design und Struktur konsequent und verhindert architektonisch, dass Redakteure Brand-Guidelines brechen können.

## Voraussetzungen

Bevor du beginnst, stelle sicher, dass folgende Software installiert ist:

- **Node.js**: Version 22.0.0 oder höher
  - Prüfe mit: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
- **pnpm** oder **npm**: Package Manager
  - pnpm (empfohlen): `corepack enable` oder `npm install -g pnpm`
  - npm: Bereits mit Node.js enthalten

## Installation

UJL besteht aus zwei Hauptkomponenten. Der **UJL Crafter** (`@ujl-framework/crafter`) ist der vollständige visuelle Editor zum Erstellen und Bearbeiten von UJL-Dokumenten – ideal für Content-Management-Lösungen, bei denen Nutzer im Browser arbeiten. Die **Rendering-Engine** (`@ujl-framework/adapter-web`) ist deutlich schlanker und dient nur zum Darstellen fertiger UJL-Dokumente als HTML – ideal für öffentliche Websites ohne Bearbeitungsfunktion.

```bash
# Für Content-Editing und visuelle Bearbeitung
pnpm add @ujl-framework/crafter

# Nur zum Anzeigen fertiger UJL-Dokumente (ohne Editor)
pnpm add @ujl-framework/adapter-web
```

## Crafter einbinden

Ein Minimalbeispiel für die Integration des UJL Crafters sieht so aus:

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

// Hier definierst du, wo der Crafter im DOM gerendert werden soll
new UJLCrafter({ target: "#app" });
```

Um den Crafter als Tool in deiner Anwendung zu nutzen, möchtest du wahrscheinlich Dokumente speichern, ein eigenes Theme laden und die Änderungen der Nutzer persistieren.

Der Crafter arbeitet zustandslos: Du gibst ihm ein initiales Dokument und Theme, er benachrichtigt dich über Änderungen. Wie und wo du Dokumente speicherst – Datenbank, LocalStorage, REST-API – bleibt dir überlassen.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

// Wie du Dokument und Theme lädst, bleibt dir überlassen
// Beispiel: Aus einer REST-API
const document = await fetch("/api/documents/page-1.ujlc").then((r) => r.json());
const theme = await fetch("/api/themes/corporate.ujlt").then((r) => r.json());

const crafter = new UJLCrafter({
	target: "#app",
	document,
	theme,
	library: { storage: "inline" },
});

// Optional: Save-Button aktivieren und Speichern implementieren
crafter.onSave(async (document, theme) => {
	// Beispiel: An Backend senden
	await fetch("/api/documents/save", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ document, theme }),
	});
	console.log("Dokument gespeichert!");
});
```

::: warning Experimentell: Backend-Library
Der Crafter nutzt standardmäßig **Inline-Storage** (`storage: "inline"`): Assets werden als Base64 direkt im Dokument gespeichert. Ein Backend-Storage-Modus für professionelles Asset-Management ist in Entwicklung, aber noch nicht produktionsreif. Insbesondere die sichere Verwaltung von API-Keys (ohne Auslieferung an den Client) erfordert noch ein Backend-for-Frontend-Pattern.
:::

## Nur Rendering ohne Editor

Für öffentliche Websites ohne Bearbeitungsfunktion reicht die schlanke Rendering-Engine `@ujl-framework/adapter-web` (unter 20 KB gzipped statt über 500 KB beim Crafter). Sie ist framework-agnostisch über Web Components implementiert und funktioniert mit jedem Frontend-Framework oder in reinem HTML und JavaScript.

```javascript
import { render } from "@ujl-framework/adapter-web";

const document = await fetch("/api/documents/page-1.ujlc").then((r) => r.json());
const theme = await fetch("/api/themes/corporate.ujlt").then((r) => r.json());

render(document, theme, document.getElementById("root"));
```

Die Rendering-Engine ist rein lesend – perfekt für Websites, auf denen Nutzer nur Inhalte konsumieren.

## Entwicklung am UJL-Framework

Falls du am UJL-Framework selbst mitentwickeln möchtest, findest du Details zur Monorepo-Struktur, Build-Prozess und Architektur in der [arc42-Dokumentation](/arc42/01-introduction-and-goals).
