---
title: "Lösungsstrategie"
description: "Lösungsstrategie und Architektur-Konzept von UJL"
---

# Lösungsstrategie

## 4.1 Technology Decisions

> **Verwandte Kapitel**: Detaillierte Architektur-Diagramme finden Sie in [Kapitel 5 - Bausteinsicht](./05-building-block-view.md), Laufzeitszenarien in [Kapitel 6 - Laufzeitsicht](./06-runtime-view.md).

Die Architektur von Unified JSON Layout (UJL) basiert auf der klaren Trennung von Inhalt, Struktur und Design und ist auf maximale Flexibilität und Modularität ausgelegt. Durch diese Struktur soll UJL an individuelle Anforderungen und unterschiedliche Anwendungsszenarien anpassbar sein und Entwicklern eine anpassungsfähige Grundlage für die Entwicklung und Integration von Weblayouts bieten.

### 4.1.1 Lösungsstrategie

UJL verfolgt eine mehrschichtige Lösungsstrategie, die folgende zentrale Prinzipien integriert:

- **Trennung von Struktur, Design und Inhalt**: Die klare Trennung dieser drei Bereiche ermöglicht eine effiziente Zusammenarbeit und Zuordnung von Verantwortlichkeiten:
  - **Struktur**: Die Struktur definiert die grundlegenden Layouts und Module, die das UJL-Format zur Verfügung stellt. Diese Bausteine, wie z.B. Carousel-Module oder Spalten-Layouts, werden als festgelegte Module in der UJL-Datei referenziert. Die Verantwortung für die Struktur liegt bei den Entwicklern und den ursprünglichen Contributorn des Systems, die diese Basis-Module schaffen. Entwickler haben die Möglichkeit, zusätzliche Module zu implementieren und das System so zu erweitern.
  - **Design**: Das Design wird zentral vom Designer in der **UJL-Theme-Datei** festgelegt, die Vorgaben für Farben, Schriften und Layout-Stile enthält. So wird das Corporate Design des Projekts konsequent umgesetzt. Designer greifen üblicherweise über den **UJL-Crafter** auf die Design-Konfiguration zu, das Laden über eine API wäre aber ebenfalls möglich. Eine entsprechende Umsetzung kann der Entwickler übernehmen.
  - **Inhalt**: Die Inhalte werden vom Redakteur im **UJL-Crafter** erstellt und gepflegt. Durch die Verwendung vordefinierter und automatisch responsiver Module kann der Redakteur Inhalte modular strukturieren, ohne sich um technische Details oder Design-Aspekte kümmern zu müssen.

- **Open-Source-Philosophie**: UJL soll als Open-Source-Projekt frei zugänglich sein, um eine Entwickler-Community für die kontinuierliche Weiterentwicklung und den Austausch von Ideen aufzubauen.

- **Plattformunabhängigkeit**: Durch das offene JSON-Format wird UJL so gestaltet, dass es in verschiedenen Systemen integriert und Inhalte plattformübergreifend genutzt und ausgetauscht werden können.

## 4.2 Technology Decisions

### 4.2.1 JSON-basierte Architektur

UJL basiert auf einer **JSON-basierten Architektur**, die drei zentrale Prinzipien verfolgt:

- **Trennung von Inhalt und Design**: Inhalte werden in `.ujlc.json`-Dateien, Design in `.ujlt.json`-Dateien gespeichert
- **Modulare Struktur**: Wiederverwendbare Module mit Fields (Daten) und Slots (Inhaltsbereiche)
- **Plattformunabhängigkeit**: Offenes JSON-Format für maximale Flexibilität

### 4.2.2 Open-Source-Strategie

UJL verfolgt eine **vollständig quelloffene Strategie**:

- **Community-getrieben**: Entwickler können Module und Erweiterungen beitragen
- **Kein Vendor Lock-in**: Unabhängig von Cloud-Plattformen oder Drittanbietern
- **Transparente Entwicklung**: Alle Entscheidungen und Entwicklungen sind öffentlich einsehbar

### 4.2.3 LLM-Readiness

UJL wird von Grund auf **KI-optimiert** entwickelt:

- **Strukturierte JSON-Sprache**: Optimal für Sprachmodelle verständlich
- **Promptbare APIs**: Direkte Integration mit LLMs möglich
- **Schema-basierte Validierung**: Automatische Generierung und Validierung von Layouts

## 4.3 Integration Strategy

### 4.3.1 Framework-agnostischer Ansatz

UJL integriert sich **nahtlos in bestehende Systeme**:

- **Headless-Architektur**: Keine Abhängigkeiten zu spezifischen Frontend-Frameworks
- **API-First**: Einfache Integration über REST-APIs
- **Modulare Komponenten**: Nur benötigte Teile des Systems verwenden

### 4.3.2 CMS-Integration

UJL **ergänzt bestehende CMS** um visuelle Layoutbearbeitung:

- **Content bleibt im CMS**: Inhaltsverwaltung über bestehende Systeme
- **Layout über UJL**: Visuelle Gestaltung und Bearbeitung
- **Synchronisation**: Automatische Datenübertragung zwischen Systemen

## 4.4 Zukunftsvisionen

Die Architektur des UJL-Systems ist für Erweiterungen konzipiert und bietet spannende Perspektiven für die Zukunft, insbesondere durch die **LLM-Readiness** und die **Unterstützung von Mehrsprachigkeit**.

### 4.4.1 LLM-Integration

UJL ist **LLM-Ready** – das JSON-basierte Format macht es optimal für den Einsatz von Large Language Models im Editor, um Inhalte direkt und kontextbezogen zu generieren. Die klare Struktur des JSON-Formats ermöglicht es den LLMs, gezielt Textvorschläge und Inhaltsideen für spezifische Bereiche des Layouts anzubieten, ohne sich mit den technischen Details der Darstellung (wie HTML oder CSS) beschäftigen zu müssen.

Mögliche Einsatzbereiche für LLMs im Editor sind:

- **Automatische Inhaltsgenerierung**: LLMs könnten direkt im Editor eingebunden werden, um den Redakteur bei der Erstellung von Texten, Beschreibungen und Überschriften zu unterstützen.
- **Modulvorschläge**: Basierend auf den bestehenden Layouts und Inhalten könnte das System passende Module empfehlen, die für eine intuitive Seitenerweiterung hilfreich sind.

### 4.4.2 Mehrsprachigkeit und Internationalisierung

Eine mehrsprachige Unterstützung würde das System für globale Anwender öffnen:

- **Mehrsprachige Inhalte**: Das UJL-Format könnte sprachspezifische Inhalte speichern, um nahtlose Übersetzungen zu ermöglichen.
- **Automatische Übersetzung**: Über API-Anbindungen könnten Inhalte automatisch übersetzt werden, was besonders bei mehrsprachigen Projekten wertvoll ist.

Diese Erweiterungen bieten spannende Möglichkeiten, UJL zu einem global einsetzbaren, innovativen Webgestaltungs-Tool weiterzuentwickeln.
