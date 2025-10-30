---
title: "Kontext und Abgrenzung"
description: "Systematische Einordnung von UJL im Vergleich zu anderen Webentwicklungs-Tools"
---

# Kontext und Abgrenzung

## 3.1 Business Context

> **Verwandte Kapitel**: Die technische Positionierung und Tool-Vergleiche finden Sie in [Kapitel 8 - Querschnittliche Konzepte](./08-crosscutting-concepts.md).

Die Webentwicklung bietet eine breite Landschaft an Tools und Architekturen. Um Unified JSON Layout (UJL) richtig zu positionieren, vergleichen wir es nicht einfach nur mit einzelnen Tools, sondern ordnen es systematisch entlang der gängigen **Typen von Lösungen** ein.

Dabei betrachten wir:

- **Statische Site-Generatoren**
- **Dynamische Frameworks**
- **Content-Management-Systeme (CMS)**
- **All-in-One-Website-Builder**
- **Modulare Inhaltseditoren**

Für jede Klasse klären wir: Was sie leisten, Typische Beispiele, Wie sich UJL dazu verhält; Ergänzend, ersetzend oder eigenständig.

## 3.2 System Context

### 3.2.1 Systematische Einordnung

#### Statische Site-Generatoren

**Beispiele:**  
Gatsby, Hugo, Eleventy, Plenti, Elder.js

**Was leisten sie:**  
Statische Site-Generatoren erstellen Webseiten aus Templates und Inhalten. Nach der Generierung sind die Seiten "statisch" und können nicht dynamisch bearbeitet werden.

**Beziehung zu UJL:**  
UJL ist **kein** statischer Site-Generator. Es produziert strukturierte Layouts und Inhalte in JSON und kann in statische Seiten integriert werden, wenn dynamische Inhaltsbearbeitung gewünscht ist.

#### Dynamische Frameworks

**Beispiele:**  
Next.js, Nuxt.js, SvelteKit, Remix, Laravel

**Was leisten sie:**  
Dynamische Frameworks sind die Basis für komplexe Webanwendungen mit Server-Rendering, Routing und API-Handling.

**Beziehung zu UJL:**  
UJL ergänzt Frameworks, indem es eine visuelle Bearbeitungsschicht für Layouts und Inhalte bietet.

#### Content-Management-Systeme (CMS)

**Beispiele:**  
WordPress, Strapi, Sanity, PayloadCMS, Contentful, Drupal

**Was leisten sie:**  
CMS verwalten Inhalte, Benutzerrollen und teilweise Layouts. Headless-CMS fokussieren sich rein auf die Inhaltsverwaltung.

**Beziehung zu UJL:**  
UJL ersetzt kein CMS, sondern ergänzt sie um eine visuelle Layoutbearbeitung. Inhalte werden weiterhin über das CMS verwaltet, das Layout über UJL gestaltet.

#### All-in-One-Website-Builder

**Beispiele:**  
Wix, Webflow, Shopify, Squarespace, Jimdo

**Was leisten sie:**  
Komplettlösungen für Webseiten inklusive Hosting, Design-Editor, Seitenverwaltung.

**Beziehung zu UJL:**  
UJL ist **kein** All-in-One-Builder. Es liefert Bausteine für Inhalts- und Layoutbearbeitung innerhalb bestehender Systeme. Hosting und Seitenstruktur sind nicht Teil von UJL.

Langfristig könnte auf UJL-Basis jedoch ein eigener Builder entstehen.

#### Modulare Inhaltseditoren

**Beispiele:**  
GrapesJS, Editor.js, Tiptap, WordPress Gutenberg

**Was leisten sie:**  
Ermöglichen die Erstellung modularer Inhalte durch Blöcke, Drag-and-Drop oder strukturierte Textbearbeitung.

**Beziehung zu UJL:**  
Hier liegt die größte Nähe – aber auch die größten Unterschiede:

- **GrapesJS:** Visuell stark, aber schwächer bei der sauberen Trennung von Inhalt und Design.
- **Editor.js / Tiptap:** Gut für strukturierte Inhalte, aber keine umfassende Layoutbearbeitung.
- **Gutenberg:** Stark an WordPress gebunden, weniger flexibel für andere Plattformen.

UJL kombiniert visuelles Arbeiten mit strikter Trennung und offener Integration.

## 3.3 Scope

### 3.3.1 Vertiefender Tool-Vergleich

Im Folgenden werden ausgewählte Tools hinsichtlich ihrer Funktionalität, Unterschiede zu UJL und ihrer potenziellen Integration betrachtet:

#### GrapesJS

- **Funktionalität:** GrapesJS ist ein Open-Source-Framework für die visuelle Erstellung von HTML-Templates mittels Drag-and-Drop. Es speichert Projektzustände intern als JSON, generiert jedoch primär HTML und CSS für die Darstellung.
- **Unterschiede zu UJL:** Während GrapesJS Inhalte, Layout und Stile eng miteinander verknüpft, verfolgt UJL eine strikte Trennung von Inhalt (.ujl.json) und Design (.ujlt.json), was eine höhere Flexibilität und Wiederverwendbarkeit ermöglicht.
- **Integration mit UJL:** GrapesJS eignet sich für die visuelle Erstellung von Templates, jedoch nicht für die strukturierte Inhalts- und Layoutbearbeitung, wie sie UJL bietet.

#### Editor.js

- **Funktionalität:** Editor.js ist ein blockbasierter Editor für strukturierte Inhalte, der sauberes JSON statt HTML-Markup ausgibt.
- **Unterschiede zu UJL:** Editor.js fokussiert sich auf die Inhaltsbearbeitung ohne Layoutsteuerung. UJL hingegen integriert sowohl Inhalts- als auch Layoutmanagement mit klarer Trennung von Inhalt und Design.
- **Integration mit UJL:** Editor.js kann als Rich-Text-Eingabemodul innerhalb von UJL verwendet werden, um strukturierte Inhalte zu erfassen.

#### Tiptap

- **Funktionalität:** Tiptap ist ein erweiterbarer, headless Rich-Text-Editor, der Inhalte als JSON-Dokumente speichert und sowohl HTML- als auch Markdown-Exporte unterstützt.
- **Unterschiede zu UJL:** Tiptap konzentriert sich auf die Textbearbeitung, ohne native Unterstützung für Layout- oder Designtrennung. UJL hingegen bietet ein umfassendes Framework für Inhalt und Design.
- **Integration mit UJL:** Tiptap kann in UJL für die Bearbeitung von Textelementen integriert werden, wobei UJL die übergeordnete Struktur und das Designmanagement übernimmt.

#### Payload CMS

- **Funktionalität:** Payload ist ein Headless-CMS mit API-First-Ansatz, das eine anpassbare Admin-Oberfläche und flexible Inhaltsmodelle bietet.
- **Unterschiede zu UJL:** Payload verwaltet Inhalte und stellt APIs bereit, während UJL sich auf die visuelle Darstellung und Layoutbearbeitung dieser Inhalte konzentriert.
- **Integration mit UJL:** Payload kann als Backend für die Inhaltsverwaltung dienen, während UJL die visuelle Gestaltung und Bearbeitung im Frontend übernimmt.

#### Strapi

- **Funktionalität:** Strapi ist ein Open-Source-Headless-CMS, das Entwicklern ermöglicht, flexible Inhaltsmodelle zu erstellen und Inhalte über REST- oder GraphQL-APIs bereitzustellen.
- **Unterschiede zu UJL:** Strapi bietet keine native visuelle Layoutbearbeitung. UJL ergänzt diese Lücke durch ein strukturiertes Layout- und Designmanagement.
- **Integration mit UJL:** Strapi kann die Inhaltsverwaltung übernehmen, während UJL die visuelle Gestaltung und Bearbeitung der Inhalte ermöglicht.

#### Sanity

- **Funktionalität:** Sanity ist ein Headless-CMS mit Echtzeit-Collaboration und strukturierter Inhaltsmodellierung, das Inhalte als JSON-Dokumente speichert.
- **Unterschiede zu UJL:** Sanity konzentriert sich auf die Inhaltsverwaltung und bietet keine spezialisierte visuelle Layoutbearbeitung. UJL hingegen bietet ein umfassendes Framework für die visuelle Gestaltung von Inhalten.
- **Integration mit UJL:** Sanity kann als Content-Hub fungieren, während UJL die visuelle Darstellung und Bearbeitung der Inhalte übernimmt.

## 3.4 Positionierung von UJL

Unified JSON Layout (UJL) positioniert sich als neuartiges Bindeglied im Webtool-Markt – kein vollständiges CMS und kein bloßer Page-Builder, sondern ein Framework für modulare Webseiten, das zwischen Content Management und Frontend-Design vermittelt. UJL's Stärken liegen in der strikten Trennung von Inhalt und Design, der hohen Integrationsfähigkeit in bestehende Systeme und der Ausrichtung auf zukünftige Anforderungen wie KI-gestützte Automatisierung. In einer Zeit, in der viele Unternehmen auf Headless setzen, aber zugleich benutzerfreundliche Layout-Pflege wünschen, besetzt UJL genau diese Nische: Es ermöglicht visuelles, modulbasiertes Seitenbauen innerhalb einer vorhandenen Infrastruktur, ohne die inhaltliche Struktur aufzubrechen. Damit schließt UJL eine Lücke zwischen den etablierten Komplettlösungen (die zwar „alles können", aber unflexibel und schlecht integrierbar sind) und den reinen Backend-Systemen (die flexibel sind, aber von Haus aus keine visuellen Editoren bieten). UJL verspricht eine professionell wartbare, CI-konforme Inhaltsverwaltung mit der Kreativfreiheit eines Baukastens.

Realistisch betrachtet wird UJL überall dort seine Stärken ausspielen, wo Teams ihre bestehende Landschaft erweitern möchten: Ein Marketing-Team kann selbst Seiten komponieren, ohne dass das Development-Team die Kontrolle über Module und Designprinzipien verliert. Die Lernkurve für UJL dürfte dank bekannter JSON-Strukturen und Integration bewährter Editor-Module moderat bleiben, was die Adoption fördert. Die tatsächliche Marktlücke, die UJL füllt, ist die der Integration-freundlichen Webseitenerstellung: Bislang müssen sich Anwender zwischen starrem Baukasten oder aufwändiger Eigenentwicklung entscheiden. UJL bietet einen weiteren Weg, indem es ein offenes Framework bereitstellt, das kein Lock-in erzeugt, sondern Inhalte in portabler Form hält und sich zukünftigen Technologien öffnet.

**Zusammengefasst**: UJL positioniert sich klar als ergänzende Komponente im heutigen Webtool-Ökosystem – es konkurriert dort, wo andere Werkzeuge Schwächen haben (fehlende Trennung, mangelnde Erweiterbarkeit), und kollaboriert dort, wo sie Stärken haben (Content Storage, spezialisierte Editoren). Die Marktlücke, die UJL schließt, ist die eines flexiblen, offenen und KI-zukunftssicheren Baukastens, der bestehende Systeme nicht ersetzt, sondern sie sinnvoll erweitert.
