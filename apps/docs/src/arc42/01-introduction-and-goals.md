---
title: "Einführung und Ziele"
description: "Vision, Ziele, Stakeholder und wichtigste Qualitätsziele von UJL"
---

# Einführung und Ziele

**Unified JSON Layout (UJL)** ist ein Open-Source-Framework für visuelles Content-Authoring. Es löst das _Brand-Compliance-Dilemma_: Teams möchten Inhalte schnell und eigenständig pflegen, müssen aber gleichzeitig **Corporate Design** und **Barrierefreiheit** zuverlässig einhalten. In vielen Projekten wird das heute über Prozesse abgesichert (Reviews, Freigaben, Schulungen), mit hohem Aufwand und trotzdem wiederkehrenden Fehlern.

UJL verlagert diese Absicherung in die Technik: Inhalte und Designregeln werden so beschrieben, dass das System nur zulässige Ergebnisse erzeugen kann.

UJL ist außerdem **AI-ready**, aber aktuell **ohne integrierte KI-Services**: Es gibt keine eingebauten Modelle, kein Prompting und kein automatisches „AI Editing“ im Produkt. Stattdessen schafft UJL die Voraussetzungen, damit sich KI-Funktionen später sinnvoll ergänzen lassen (strukturierte Formate, Runtime-Validierung, vorgesehene Embedding-Felder). Wichtig ist die Abgrenzung: AI-ready beschreibt die Vorbereitung für zukünftige Produktfunktionen, nicht eine bereits vorhandene KI-Integration.

**Kernidee:**

- **Inhalte** liegen als strukturierte JSON-Dokumente in `.ujlc.json` vor.
- **Designregeln** liegen als Theme in `.ujlt.json` vor (z. B. Farben, Typografie, Abstände).
- **Adapter** führen beides zusammen und erzeugen daraus den Output (ContentFrame, d. h. HTML/CSS/JS).
- Der **UJL Crafter** ist ein visueller Editor zur Erstellung und Pflege von Inhalten und Themes.

UJL ist dabei **kein vollständiges CMS** und kein „Free-Form“-Page-Builder, sondern ein **Layout- und Governance-Layer**, der bestehende CMS- und Frontend-Stacks ergänzt.

## 1.1 Requirements Overview

UJL richtet sich an Teams, die Inhalte visuell erstellen wollen, aber technische Leitplanken benötigen, damit Gestaltung nicht „driften“ kann und Barrierefreiheit nicht erst nachträglich geprüft werden muss.

**Anforderungen auf Systemebene:**

- **Visuelles Authoring:** Redakteur:innen setzen Seiten/Layouts aus vordefinierten Modulen zusammen (WYSIWYG), ohne freie HTML/CSS-Formatierung.
- **Gestaltung im Theme:** Designer:innen pflegen markenrelevante Parameter (z. B. Farben, Typografie, Spacing) im Theme; Änderungen wirken konsistent auf alle Inhalte.
- **Maschinenlesbarkeit & Validierung:** Content und Theme sind strukturiert und validierbar (Schema-first), damit Import/Export und Systemintegration robust funktionieren.
- **Integrationsfähigkeit:** UJL wird als modulare Package-Landschaft bereitgestellt und kann in unterschiedliche Umgebungen eingebettet werden (z. B. als Web-Component-Integration mit Style-Isolation).

## 1.2 Quality Goals

Die wichtigsten Qualitätsziele für UJL, priorisiert nach Architektur-Relevanz:

| Prio | Qualitätsziel                        | Motivation                                                                                     | Umsetzung in der Architektur                                                                                                                                                        |
| ---: | ------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | **Brand-Compliance by Design**       | Corporate Design soll nicht „aus Versehen“ gebrochen werden können.                            | Trennung von Inhalt (UJLC) und Theme (UJLT); erlaubte Module/Varianten statt freier Formatierung; Tokens/Theme als Quelle.                                                          |
|    2 | **Accessibility als Standard**       | Barrierefreiheit darf kein nachgelagerter Prüfschritt sein, sondern Teil des Authorings.       | Semantische Module/Strukturen; editorseitige Leitplanken (z. B. Alternativtexte für Bilder als Teil des Datenmodells); detaillierte Qualitätsszenarien und Nachweise in Kapitel 10. |
|    3 | **Validierbarkeit & Robustheit**     | Inhalte sollen verlässlich zwischen Systemen übertragbar sein und Fehler früh sichtbar machen. | Schema-first Ansatz (Runtime-Validierung); strukturierte Dokumentformate statt „freiem“ Markup.                                                                                     |
|    4 | **Integrationsfähigkeit**            | UJL soll bestehende CMS/Frontends ergänzen, nicht ersetzen.                                    | Adapter-Konzept; Web-Integration u. a. über Web Components mit Shadow DOM zur Style-Kapselung.                                                                                      |
|    5 | **Erweiterbarkeit ohne Core-Brüche** | Teams sollen Module und Render-Ziele erweitern können, ohne das System zu „forken“.            | Registry-/Plugin-Ansatz für Module; Adapter-Schnittstellen für zusätzliche Render-Targets.                                                                                          |

## 1.3 Stakeholders

### Primäre Stakeholder

| Rolle                                   | Erwartungen an UJL                                                                                                                                                                                                  | Nutzen                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Redakteur:innen**                     | Inhalte schnell erstellen und ändern, ohne Design- oder Accessibility-Regeln verletzen zu können.                                                                                                                   | Visueller Editor mit kombinierbaren Modulen, ohne Design-Drift.                                                                          |
| **Designer:innen**                      | Steuerung von Designregeln; Änderungen sollen konsistent und nachvollziehbar wirken.                                                                                                                                | Theme als Quelle; globale Wirkung statt Einzelseiten-Fixing.                                                                             |
| **Entwickler:innen / Integrator:innen** | Definierte Schnittstellen, Validierbarkeit, Erweiterbarkeit; Einbettung in bestehende Systeme. Außerdem: ein Projekt-Setup, das Agentic Coding bei der Entwicklung am Repository praktikabel und überprüfbar macht. | Schema-Validierung, Adapter-Konzept, Open-Source-Core zur Auditierbarkeit sowie dokumentierte Leitplanken für automatisierte Änderungen. |

### Sekundäre Stakeholder

| Rolle                                         | Erwartungen                                                                     | Nutzen                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Marketing-Teams**                           | Schnelle Kampagnen- und Landingpage-Produktion ohne wiederholte Design-Reviews. | Tempo + Stabilität durch Module und Theme-Regeln.                                           |
| **Web-Agenturen**                             | Langfristig wartbare Kundenprojekte; weniger Support durch „Design Drift“.      | Governance ist systemisch abgesichert; Redaktionsarbeit skaliert besser.                    |
| **SaaS-Anbieter**                             | Editor als integrierbare Komponente (White-Label), ohne proprietäre Lock-ins.   | Einbettbarer Authoring-Layer, strukturierte Daten, Validierung.                             |
| **Compliance-/Accessibility-Verantwortliche** | Nachvollziehbare, reproduzierbare Barrierefreiheit statt punktueller Audits.    | Technische Leitplanken + strukturierter Output erleichtern Nachweise und reduzieren Risiko. |

### Technische Stakeholder

| Rolle                           | Erwartungen                                                        | Nutzen                                                                                         |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Core-Team**                   | Wartbarkeit, Modularisierung, stabile Paket-/Release-Strategie.    | Trennscharfe Pakete und Schnittstellen; Doku als Arbeitsgrundlage.                             |
| **Community Developers**        | Eigene Module/Adapter sollen möglich sein, ohne Interna zu hacken. | Erweiterungspunkte über Registry/Adapter; Open Source.                                         |
| **DevOps / Platform Engineers** | Self-Hosting und CI/CD-Integration ohne unnötige Spezialfälle.     | Backend-Services bei Bedarf (z. B. `services/library`), Konfiguration über Umgebungsvariablen. |
