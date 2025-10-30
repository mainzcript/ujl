---
title: "Bausteinsicht"
description: "Bausteinsicht und Moduldiagramm des UJL-Systems"
---

# Bausteinsicht

## 5.1 Level 1 - Whitebox View

Die Architektur von Unified JSON Layout (UJL) basiert auf einer klaren Trennung von Inhalt, Struktur und Design, um eine flexible und modular aufgebaute Webgestaltung zu ermöglichen. Inhalte werden in einer UJL-Datei definiert, in der bestimmte **Module** referenziert werden. Diese Module verkörpern die Struktur und bestimmen, welche **Fields** (Daten) und **Slots** (Inhaltsbereiche) unterstützt werden. Module können verschachtelt organisiert und kombiniert werden.

Die gestalterische Ebene wird über eine Design-Konfigurationsdatei, die **UJL-Theme-Datei**, definiert, welche Designvorgaben für Farben, Schriftarten und Layout-Stile enthält. Zusammengenommen – UJL-Datei, Module und UJL-Theme-Datei – werden diese Strukturen im **Renderer** verarbeitet, der das Ergebnis als **ContentFrame** ausgibt. Der ContentFrame stellt eine eigenständige Ansicht dar, in der alle Elemente konsistent und strukturiert dargestellt werden.

Das Moduldiagramm zeigt die Architektur des **UJL Renderer**- und **UJL Crafter**-Systems. Der **UJL Renderer** bildet die Grundlage für die Verarbeitung und Darstellung von Layouts und Inhalten, während der **UJL Crafter** als umfassendes Gestaltungstool auf den Renderer aufsetzt. Der Crafter kann jedoch auch alternative Renderer nutzen, sofern diese eine kompatible API bieten.

```plantuml
@startuml

rectangle "UJL System" {
    package "UJL Renderer"as Renderer {
            component [Validator] {
                component [Syntaxprüfung]
                component [Kompatibilitätsprüfung]
            }
            component "Module" as Components {
                component [Container-Module]
                component [Content-Module]
            }
            interface API as RendererAPI
        }

    package "UJL Crafter" as Crafter {

        component [Editor]

        interface API as CrafterAPI
    }

    database " " as "Speicher" {
            file ".ujl.json" as UJLFile
            file ".ujlt.json" as DesignConfig
        }

    file [ContentFrame] <<HTML5>>{
        [HTML]
        [CSS]
        [JavaScript]
    }


    [Crafter] --> [Renderer]
    [Validator] -down-> [Components]
    [Crafter] -right-> [Speicher]
    [Renderer] --> [Speicher]
    [Renderer] ...down.> [ContentFrame]
}

@enduml
```

### 5.1.1 Beschreibung des Moduldiagramms

1. **UJL Renderer**:
   - Der **UJL Renderer** ist die zentrale Einheit für das Rendering von UJL-Dateien und erzeugt die endgültige Darstellung eines Layouts.
   - Er besteht aus folgenden Hauptkomponenten:
     - **Validator**: Verifiziert die Struktur und Kompatibilität von UJL-Dateien. Der Validator enthält zwei Subkomponenten:
       - **Syntaxprüfung**: Prüft die syntaktische Korrektheit der UJL-Dateien.
       - **Kompatibilitätsprüfung**: Überprüft, ob die Version der UJL-Datei mit der aktuellen Systemversion kompatibel ist.
     - **Module**: Enthält die Bausteine, die zur Darstellung des Layouts verwendet werden. Die Module gliedern sich in:
       - **Container-Module**: Diese Module repräsentieren strukturelle Bausteine, wie z.B. Container oder Spalten-Layouts, die die Grundstruktur eines Layouts bestimmen.
       - **Content-Module**: Dies sind die inhaltstragenden Module, wie Textfelder, Bilder oder Buttons, die innerhalb der Container-Module organisiert werden.
   - Der **UJL Renderer** erzeugt aus den UJL-Dateien den **ContentFrame**, der als das gerenderte Endprodukt aus **HTML**, **CSS** und **JavaScript** besteht und auf verschiedenen Plattformen und Endgeräten verwendet werden kann.

2. **ContentFrame**:
   - Der **ContentFrame** ist das Ausgabeformat des **UJL Renderers** und enthält die vollständig gerenderte Ansicht, bestehend aus **HTML**, **CSS** und **JavaScript**.
   - Sollte ein Entwickler eine alternative Rendering-Einheit verwenden, muss diese ebenfalls in der Lage sein, einen ContentFrame zu erzeugen, der die in den UJL-Dateien definierte Struktur und das Design widerspiegelt.

3. **Speicher**:
   - Die Daten für die UJL-Layouts und die Design-Konfiguration werden in **.ujl.json**- und **.ujlt.json**-Dateien im **Speicher** verwaltet.
     - **UJL-Datei (.ujl.json)**: Enthält die Struktur und die Inhalte eines Layouts.
     - **Design-Konfigurationsdatei (.ujlt.json)**: Speichert Designvorgaben, wie z.B. Farben, Schriften und Abstände.
   - Der **UJL Crafter** und der **Renderer** greifen auf diese Dateien zu, um Daten zu laden, zu speichern und zu validieren.

4. **UJL Crafter**:
   - Der **UJL Crafter** dient als umfassendes Gestaltungstool für Redakteure, Designer und Entwickler und bietet eine zentrale Schnittstelle zur Erstellung und Bearbeitung von Layouts und Inhalten.
   - Der **Editor** im Crafter ist die Hauptschnittstelle für Anwender, die Layouts gestalten und Inhalte hinzufügen möchten.
   - Der **Crafter** nutzt die **API** des **UJL Renderers** und kann diese bei Bedarf erweitern, um Entwicklern zusätzliche Funktionen bereitzustellen. Die API des Crafters fungiert als erweiterte Schnittstelle, die Entwicklern auch die Möglichkeit bietet, neue Module und Funktionen zu integrieren.

5. **Editor**:
   - Der Editor ist die interaktive Einheit des **UJL Crafter**, die Anwendern eine visuelle Schnittstelle bietet, um Layouts zu gestalten und Inhalte einzufügen.
   - Durch die Verbindung zur API des Renderers kann der Editor Änderungen in Echtzeit anzeigen, sodass Redakteure und Designer sofortiges Feedback zu ihren Anpassungen erhalten.

## 5.2 Level 2 - Whitebox View

### 5.2.1 Beispielcodes

In diesem Abschnitt werden einige grundlegende Beispielcodes vorgestellt, um die Funktionalitäten des UJL-Systems zu veranschaulichen. Die Beispiele decken verschiedene Bereiche ab, wie das Definieren von Layouts und Inhalten, die Nutzung der Design-Konfigurationsdatei sowie die Integration des Editors und Renderers in eine Webanwendung. Auch die API für erweiterbare Module wird kurz dargestellt.

#### .ujl.json-Datei: Struktur und Inhalt

Die .ujl.json-Datei ist die zentrale Datei im UJL-System und beschreibt das Layout und den Inhalt der Seite in einem strukturierten JSON-Format. Die Datei referenziert Module mit ihren Fields (Daten) und Slots (Inhaltsbereiche) und definiert die Inhalte innerhalb der vordefinierten Struktur.

```json
{
	"ujl": {
		"meta": {
			"title": "Produktkatalog",
			"description": "Unser Staubsauger-Sortiment",
			"updated_at": "2024-01-15T10:30:00Z",
			"_version": "0.0.1"
		},
		"root": [
			{
				"type": "container",
				"meta": {
					"id": "main-container",
					"updated_at": "2024-01-15T10:30:00Z"
				},
				"fields": {},
				"slots": {
					"body": [
						{
							"type": "text",
							"meta": {
								"id": "header-text",
								"updated_at": "2024-01-15T10:30:00Z"
							},
							"fields": {
								"content": "Willkommen zu unserem Produktkatalog"
							},
							"slots": {}
						},
						{
							"type": "grid",
							"meta": {
								"id": "product-grid",
								"updated_at": "2024-01-15T10:30:00Z"
							},
							"fields": {},
							"slots": {
								"items": [
									{
										"type": "card",
										"meta": {
											"id": "product-card-1",
											"updated_at": "2024-01-15T10:30:00Z"
										},
										"fields": {
											"title": "Staubsauger Model X200",
											"description": "Der leistungsstarke und effiziente Haushaltshelfer.",
											"image": "img/vacuum1.jpg"
										},
										"slots": {}
									},
									{
										"type": "card",
										"meta": {
											"id": "product-card-2",
											"updated_at": "2024-01-15T10:30:00Z"
										},
										"fields": {
											"title": "Staubsauger Model X300",
											"description": "Unser leises Topmodell mit innovativer Filtertechnologie.",
											"image": "img/vacuum2.jpg"
										},
										"slots": {}
									}
								]
							}
						}
					]
				}
			}
		]
	}
}
```

In diesem Beispiel wird ein einfacher Produktkatalog definiert, der aus einem Haupt-Container-Modul mit einem Text-Modul und einem Grid-Modul mit zwei Card-Modulen besteht. Jedes Modul hat Fields für Daten und Slots für verschachtelte Inhalte.

#### .ujlt.json: Design-Konfigurationsdatei

Die .ujlt.json-Datei enthält Designvorgaben, die das Corporate Design einheitlich und konsistent in allen Layouts umsetzen. Die Datei beschreibt Vorgaben für Farben, Schriftarten, Abstände und weitere visuelle Details, die die Designer festlegen.

```json
{
	"design": {
		"colors": {
			"primary": "#0044cc",
			"secondary": "#00cc88",
			"background": "#ffffff",
			"text": "#333333"
		},
		"fonts": {
			"main": "Arial, sans-serif",
			"header": "Georgia, serif"
		},
		"spacing": {
			"padding": "10px",
			"margin": "15px"
		}
	}
}
```

In diesem Beispiel definiert die .ujlt.json Datei Primär- und Sekundärfarben, die Schriftarten für Haupt- und Headertexte sowie die Standardwerte für Padding und Margin, die in allen Modulen verwendet werden.

#### Integration des Editors (UJL Crafter) in eine Web-Anwendung

Der UJL Crafter (Editor) kann über npm in eine Web-Anwendung integriert werden, sodass Redakteure Inhalte direkt auf der Seite bearbeiten können. Hier ist ein Beispielcode zur Integration:

```javascript
// Installation via npm:
// npm install ujlcrafter

import UJLCrafter from "ujlcrafter";

// Initialisieren des Editors
const crafter = new UJLCrafter({
	target: document.getElementById("editor-container"),
	data: {
		layoutFile: "path/to/layout.ujl.json",
		config: "path/to/design.ujlt.json",
	},
});

// Funktion zur Speicherung
crafter.on("save", updatedData => {
	fetch("/api/save", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updatedData),
	}).then(response => console.log("Änderungen gespeichert."));
});
```

Dieser Code integriert den UJL Crafter in eine Web-Anwendung. Der Editor wird im editor-container-Element der HTML-Seite angezeigt und bietet eine Speichermethode, um die aktualisierten .ujl.json-Daten über eine API zu speichern.

#### Verwendung des Renderers zur Ausgabe als HTML/CSS/JS

Der Renderer wird benötigt, um die .ujl.json- und .ujlt.json-Dateien in HTML/CSS/JS zu konvertieren und die Webansicht anzuzeigen. Hier ist ein Beispiel für die Verwendung des Renderers:

```javascript
// Installation via npm:
// npm install ujlcrafter-renderer

import UJLRenderer from "ujlcrafter-renderer";

const renderer = new UJLRenderer({
	layoutFile: "path/to/layout.ujl.json",
	config: "path/to/design.ujlt.json",
	target: document.getElementById("view-container"),
});

// Rendern der Ansicht
renderer.render().then(() => console.log("ContentFrame erfolgreich gerendert."));
```

Dieser Code zeigt, wie der UJL Renderer in einer Web-Anwendung verwendet wird, um die Layout- und Design-Dateien in ein fertiges HTML/CSS/JS-Bundle zu konvertieren und in der view-container-Ansicht zu rendern.

#### Erweiterung über die API

Die API des UJL Crafter ermöglicht Entwicklern, eigene Module hinzuzufügen und den Funktionsumfang von UJL zu erweitern. Hier ist ein Beispiel, wie ein neues carousel-Modul registriert wird:

```javascript
// Registrierung eines benutzerdefinierten Moduls über die API des Editors
crafter.registerComponent("carousel", {
	render: ({ images }) => {
		const container = document.createElement("div");
		container.classList.add("carousel");
		images.forEach(imgSrc => {
			const img = document.createElement("img");
			img.src = imgSrc;
			container.appendChild(img);
		});
		return container;
	},
	schema: {
		images: { type: "array", items: { type: "string" } },
	},
});
```

Mit diesem Code wird ein neues carousel-Modul registriert, das Bilder in einem Karussell anzeigt. Entwickler können die Struktur und das Verhalten des Moduls selbst definieren und das Modul in der .ujl.json-Datei referenzieren.
