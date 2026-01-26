---
title: "Roadmap"
description: "Geplante Entwicklungsschritte und Meilensteine von UJL"
---

# Roadmap

## Ausgangspunkt

UJL befindet sich bereits in aktiver Entwicklung. Ein stabiler technischer Kern, ein funktionsfähiger Editor-Prototyp sowie eine modulare Projektstruktur sind vorhanden und werden produktiv weiterentwickelt.

Diese Roadmap beschreibt die nächsten Entwicklungsschritte auf dem Weg von einem technisch belastbaren Kern hin zu einem marktreifen, offen nutzbaren System.

Zeitliche Angaben werden **nicht als fixe Fristen**, sondern als **Abfolge von Entwicklungszuständen** formuliert. Der tatsächliche Fortschritt hängt maßgeblich von verfügbaren Ressourcen und Finanzierung ab.

## Phase 1: Stabilisierung & Vervollständigung des MVP

### Ziel

Ein technisch stabiles, konsistent nutzbares Produkt, das sich für reale Pilotprojekte eignet.

In dieser Phase liegt der Fokus auf der **Absicherung und Vervollständigung** der bereits existierenden Kernkomponenten. Ziel ist es, aus dem bestehenden Entwicklungsstand ein echtes Minimum Viable Product zu formen, das nicht nur demonstriert, sondern produktiv eingesetzt werden kann.

### Konkrete nächste Schritte

1. **Usability / Editor-UX verbessern**
   - Mobile Workflows vereinfachen: Nach Auswahl eines Moduls in der Vorschau soll die Konfiguration ohne zusätzlichen Klick auf ein separates Settings-Icon erreichbar sein.
   - Kontext-Interaktionen in die Vorschau verlagern: Eine kleines Kontextmenü wird direkt über dem aktüll selektierten Modul eingeblendet und bietet Aktionen wie _Einfügen_, _Kopieren/Duplizieren_, _Verschieben_ und _Löschen_.
   - Modul-Insert vereinfachen: Neue Module sollen nicht primär über das Drei-Punkte-Menü im Navigationsbaum eingefügt werden müssen, sondern über die Vorschau (Island + Dropzones).
   - Drag-and-Drop ausbaün: Mehr Interaktionen sollen direkt in der Vorschau möglich sein (Reorder, Insert via Dropzones) statt nur im Tree.

2. **Deployment optimieren**: Module Registry über eine Crafter-API verfügbar machen, um Module dynamisch abzufragen (z. B. für Editor, Integrationen und spätere Automatisierung).

3. **Technische Schulden minimieren**: Gezielte Abarbeitung der priorisierten technischen Schulden und Risiken aus der arc42-Dokumentation (siehe [Risiken und technische Schulden](/arc42/11-risks-and-technical-debt)).

4. **AI-Features implementieren**: Embedding-Model + Generative KI in den Crafter integrieren (z. B. für Suche/Assistenz und zum Generieren von Modul-Vorschlägen aus Kontext).

### Ergebnis dieser Phase

UJL kann in abgeschlossenen Projekten eingesetzt werden, Inhalte lassen sich stabil erstellen, speichern und rendern. Der Editor ist für Redakteur:innen nutzbar, ohne dass grundlegende Funktionen fehlen.

## Phase 2: Pilotierung in realen Projekten

### Ziel

Validierung von UJL unter realen Produktionsbedingungen.

Nach der technischen Stabilisierung folgt eine Phase, in der UJL **gezielt in echten Projekten eingesetzt** wird. Diese Pilotierungen dienen nicht primär der Skalierung, sondern der Validierung von Architektur, Bedienbarkeit und Erweiterbarkeit.

Der Fokus liegt dabei auf Partnern mit realen Anforderungen, insbesondere aus dem Agentur- und Projektumfeld.

### Ergebnis dieser Phase

UJL ist nicht nur technisch funktionsfähig, sondern **praxisvalidiert**. Typische Fehlerqüllen, UX-Probleme und Integrationsfragen sind identifiziert und adressiert.

## Phase 3: Öffnung & Community-Readiness

### Ziel

Vorbereitung auf öffentliche Nutzung und externe Beiträge.

Auf Basis der Pilotierung wird UJL für eine breitere Nutzung geöffnet. Diese Phase ist eine **kontrollierten Öffnung** für Entwickler:innen, Agenturen und frühe Anwender:innen.

### Ergebnis dieser Phase

UJL ist offen nutzbar, nachvollziehbar dokumentiert und strukturell so aufgestellt, dass externe Beiträge möglich und sinnvoll sind.

## Phase 4: Erweiterbarkeit & Integrationen

### Ziel

UJL als erweiterbares System etablieren.

In dieser Phase wird der Fokus auf **Erweiterbarkeit und Integration** gelegt. UJL soll sich sauber in bestehende Systemlandschaften einfügen lassen und gezielt an unterschiedliche Anwendungsfälle anpassbar sein.

### Ergebnis dieser Phase

UJL lässt sich konsistent erweitern und in bestehende Stacks integrieren, ohne den Core zu verändern. Das System ist anschlussfähig für unterschiedliche Nutzungsszenarien.

## Phase 5: Weiterführende Funktionen & Perspektive

### Ziel

Schrittweise Weiterentwicklung auf Basis realer Nutzung.

Alle weiterführenden Funktionen werden **nicht vorab fest versprochen**, sondern ergeben sich aus Nutzung, Feedback und Nachfrage. Dazu zählen unter anderem:

- weitergehende KI-Unterstützung im Authoring-Prozess
- Versionierung und Änderungsverfolgung
- kollaborative Funktionen
- Hosting- oder Service-Angebote

Diese Aspekte werden **später betrachtet**, um die Stabilität und Offenheit des Kerns nicht zu gefährden.
