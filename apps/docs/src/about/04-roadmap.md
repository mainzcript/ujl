---
title: "Roadmap"
description: "Unser Weg zum UJL-Ökosystem – Phasen, Meilensteine und Abhängigkeiten"
---

# Roadmap

## Unser Weg zum UJL-Ökosystem

::: warning Abhängigkeit von Förderung

Die Roadmap ist **stark abhängig von Fördermitteln**. Mit Fördermitteln können wir uns voll auf UJL konzentrieren; ohne Förderung müssen wir parallel für unseren Lebensunterhalt sorgen, was die Entwicklung deutlich verzögert. Diese Roadmap dient als Leitfaden, nicht als starre Verpflichtung.

:::

Die folgenden Phasen skizzieren den groben Pfad von der stabilen Basis bis zum umfassenden Ökosystem. Zeitangaben sind nur Richtwerte und variieren je nach Teamgröße und Funding.

## Phase 0 – Foundation

**Status:** In aktiver Entwicklung

**Zeitrahmen:** Förderdauer (6 Monate)

Ziel dieser Phase ist ein funktionsfähiger Prototyp, der in ersten Kundenprojekten getestet werden kann. Diese Phase ist vollständig innerhalb der sechsmonatigen Förderung realistisch umsetzbar.

**Geplante Ergebnisse:**

- Stabiler Core (Composer, Modul-System, JSON-Schemas)
- Crafter MVP (Editor + Designer-Modus)
- 10–15 Basis-Module (Hero, Grid, CTA, etc.)
- Design Tokens / Theme-System
- Demo & Dokumentation mit Getting-Started-Guide
- Agentur-Pilotprojekte (2–3 Partner)

### Aktueller Status (Ende 2025)

#### Fortgeschritten (noch nicht stabil)

| Package                           | Beschreibung                                | Status                       |
| --------------------------------- | ------------------------------------------- | ---------------------------- |
| **@ujl-framework/types**          | TypeScript-Typen, JSON-Schemas, Validierung | Funktioniert, wird erweitert |
| **@ujl-framework/core**           | Composer, Module, Fields, Renderer-API      | Funktioniert, wird erweitert |
| **@ujl-framework/ui**             | UI-Komponenten auf Basis von shadcn-svelte  | Basis vorhanden              |
| **@ujl-framework/adapter-svelte** | Svelte 5 Adapter                            | Funktioniert, wird erweitert |
| **@ujl-framework/adapter-web**    | Web Components Adapter (Wrapper um Svelte)  | Funktioniert, wird erweitert |

#### In aktiver Entwicklung

| Package                    | Beschreibung                  | ETA        |
| -------------------------- | ----------------------------- | ---------- |
| **@ujl-framework/crafter** | Visueller WYSIWYG-Editor      | Q1/Q2 2026 |
| **Media Service**          | Backend für Medien-Management | Q1/Q2 2026 |

## Phase 1 – Launch & Community

**Zeitrahmen:** Im ersten Jahr nach Projektstart

- **MVP veröffentlichen:** Sobald Core und Crafter stabil sind, erfolgt der Open-Source-Launch auf GitHub. Ein klarer Pitch und ein 15-Minuten-Tutorial erleichtern den Einstieg.
- **Community aufbauen:** Discord-Server, GitHub Discussions und erste Blog-Posts/Talks initiieren. Ziel ist ein kleines Ökosystem aus ersten Anwendern und Beitragenden.
- **Pilotprojekte mit Agenturen:** 2–5 Web- und Marketing-Agenturen, die UJL in echten Kundenprojekten testen. Diese Pilotprojekte sind ein wesentlicher Bestandteil von Phase 1, weil sie frühe reale Anwendungsszenarien und schnelles Feedback ermöglichen. Das liefert wertvolle Erkenntnisse für Stabilität, UI/UX und Modulkatalog.
- **Erste CMS-Integration:** Eine Headless-CMS-Integration (z.B. Sanity oder PayloadCMS) als Proof of Concept bereitstellen.

## Phase 2 – Adoption & Integrationen

**Zeitrahmen:** Mittelfristig (1-2 Jahre nach Launch)

Nach dem MVP konzentrieren wir uns auf die Erweiterbarkeit und erste Partnerschaften. Prioritäten können sich je nach Community-Feedback ändern. Konkrete Feature-Details können sich ändern.

- **Plugin-System:** Entwickler:innen ermöglichen, eigene Module und Adapter über eine Plugin-Registry zu erstellen.
- **Gezielte CMS-Integrationen:** Integration für ausgewählte Headless-CMS wie Sanity, Strapi oder PayloadCMS entwickeln. Weitere Integrationen (z.B. WordPress) sind optional und vom Nutzen/Aufwand abhängig.
- **Basis-AI-Features:** KI-Assistenz einführen: Schema-Export, Validierung von KI-Output und Beispiel-Prompts.
- **Community-Programme:** Contributor-Guidelines, Showcase-Projekte und regelmäßige Community-Calls etablieren.

### CMS-Integrationen

::: info Ideenpool – Priorisierung offen

Die folgenden CMS-Integrationen sind **Ideen, die Sinn ergeben würden**, aber noch nicht fest priorisiert sind. Nicht alle werden bis 2027 realisiert, die Priorität hängt von Nutzen, Aufwand und Community-Interesse ab. Manche Integrationen könnten auch von der Community entwickelt werden.

:::

| CMS            | Potenzielle Priorität | Mögliche Features      | Begründung                                                                                                                                                                                         |
| -------------- | --------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sanity**     | Hoch                  | Custom Input Component | Headless-First, passt zu Primary Target (SaaS)                                                                                                                                                     |
| **Strapi**     | Hoch                  | Custom Field Plugin    | Headless-First, passt zu Primary Target (SaaS)                                                                                                                                                     |
| **PayloadCMS** | Hoch                  | Custom Field + Block   | Headless-First, passt zu Primary Target (SaaS)                                                                                                                                                     |
| **WordPress**  | Mittel                | Plugin/Block           | Riesiger Markt (~43% aller Websites), relevant für Agenturen (Secondary Target), aber: PHP-Backend = technologischer Mismatch, höherer Aufwand, WordPress möglicherweise am Peak (Markt schrumpft) |
| **Contentful** | Mittel                | App Framework          | Enterprise-Fokus, kleinerer Markt                                                                                                                                                                  |

### AI-Integration (Basis)

- Schema-Export für AI-Kontext
- Validierung von KI-generiertem Output
- Beispiel-Prompts und Templates

## Phase 3 – Scale & Monetarisierung

**Zeitrahmen:** Langfristig (nach erfolgreichem Community-Aufbau)

In dieser Phase erweitern wir das Angebot und beginnen mit ersten Monetarisierungsansätzen. Die Prioritäten hängen von Community-Feedback und Marktnachfrage ab. Konkrete Feature-Details können sich ändern.

**Beispiele für mögliche Monetarisierung:**

- **Hosted Crafter (SaaS):** Bereitstellung eines gehosteten Editors mit Pro- und Enterprise-Plänen. Pro-Plan mit grundlegenden Team-Funktionen, Enterprise-Plan mit SSO, Audit-Logs und SLA.
- **Multi-Format-Renderer:** Unterstützung weiterer Ausgabeformate (PDF, Email-HTML, AMP, React Native) für vielfältige Use Cases.
- **Advanced AI:** Erweiterte KI-Features wie Content-Generierung, Smart-Suggestions oder Übersetzungen.
- **Academy & Training (optional):** Zertifizierungen und Schulungen für Partner.

### Hosted Crafter (Langfristig)

Langfristig planen wir ein Open-Core-Modell mit einem gehosteten Editor (z.B. Pro-Plan ab ca. €49/Monat). Details hängen von Feedback und Marktresonanz ab. Der Core bleibt dauerhaft Open Source, sodass Teams auch selbst hosten können.

## Phase 4 – Ecosystem & Advanced

**Zeitrahmen:** Langfristig (3+ Jahre nach Launch)

Langfristig planen wir den Aufbau eines vollständigen Ökosystems. Die Realisierung hängt von Marktresonanz und Ressourcen ab.

- **Real-Time Collaboration:** Gleichzeitiges Bearbeiten mit Nutzer-Präsenz, Kommentaren und Feedback.
- **Version Control & Workflows:** Git-ähnliche Historie, Branching/Merging sowie Approval-Workflows und automatisiertes Publishing.
- **White-Label & API-First:** Anpassbares Branding, eigene Deployments und API-First-Ansatz für OEM-Partner.
- **Vertikale Expansion:** Optionale Spezialisierungen wie Bildung (UJL for Education) sowie Community-Programme und vergünstigte Modelle für Gemeinden, Schulen, Hochschulen und gemeinnützige Organisationen.

Diese Phase ist stark von Nutzerfeedback abhängig. Ohne signifikante Nachfrage könnten einzelne Punkte entfallen oder verschoben werden.

## Erfolgskriterien

Wir messen den Fortschritt mit geeigneten Kennzahlen. Die folgenden Ziele sind grobe Schätzungen und hängen stark von Fördermitteln und verfügbarer Entwicklungszeit ab:

### Impact & Adoption

| KPI                                      | Ziel          | Zeitrahmen            |
| ---------------------------------------- | ------------- | --------------------- |
| **OSS-Nutzer/Integrationen**             | 50+ Projekte  | 12 Monate nach Launch |
| **Barrierefreie & CI-konforme Projekte** | 100+ Websites | 18 Monate nach Launch |
| **GitHub Stars**                         | 500+          | 18 Monate nach Launch |
| **npm Downloads/Monat**                  | 2.000+        | 12 Monate nach Launch |
| **Aktive Nutzer (MAU)**                  | 1.000+        | 12 Monate nach Launch |

### Wirtschaftliche Tragfähigkeit (Langfristig)

Die folgenden Zahlen sind **Minimalziele für wirtschaftliche Tragfähigkeit**. Langfristig erwarten wir durch höhere Adoption und mehr Enterprise-Integrationen deutlich wachsende Einnahmen.

| KPI                 | Minimalziel (Survival) | Realistischer Zielkorridor | Zeitrahmen |
| ------------------- | ---------------------- | -------------------------- | ---------- |
| **Zahlende Kunden** | 50+                    | 100-200+                   | 3+ Jahre   |
| **MRR**             | €20-30k                | €40-80k                    | 3+ Jahre   |
| **Break-Even**      | Erreicht               | Erreicht                   | 3+ Jahre   |

**Hinweis zu MRR:** Die Minimalziele (€20-30k) basieren auf einem Mix aus Pro-Kunden (€49/Monat) und Enterprise-Kunden (€1.500-2.000+/Monat). Beispiel: 12 Enterprise-Kunden à €1.800 + 50 Pro-Kunden à €49 = €21.600 + €2.450 = €24.050/Monat. Der realistische Zielkorridor (€40-80k) ergibt sich durch Skalierung, wachsende Community und höhere Enterprise-Anteile.
