---
title: "Vision & Wertversprechen"
description: "Was UJL ist, welches Problem es löst und warum es gebraucht wird"
---

# Vision & Wertversprechen

## Was ist UJL?

**Unified JSON Layout (UJL)** ist ein Open-Source-Framework für visuelles Content-Authoring im Web.

UJL stellt einen Drag-&-Drop-Editor bereit, mit dem Inhalte visuell erstellt und gepflegt werden können, ohne dass Redakteur:innen Farben, Abstände, Typografie oder semantische Strukturen frei verändern können. Inhalte lassen sich flexibel aufbauen und anpassen, während Design-Entscheidungen systematisch geschützt bleiben. Typische Fehler bei Kontrast, Struktur oder Semantik sind dabei technisch ausgeschlossen.

> **UJL trennt Inhalt und Design konsequent auf technischer Ebene.**  
> Redakteur:innen bearbeiten Inhalte – Designregeln sind für sie nicht veränderbar.

Im Unterschied zu klassischen Page Buildern basiert UJL nicht auf frei editierbarem HTML oder CSS, sondern auf **strukturierten Daten**, die vor dem Rendern gegen definierte Regeln validiert werden. Alles, was im Editor gebaut werden kann, ist damit per Definition markenkonform und barrierearm – innerhalb der zuvor konfigurierten Leitplanken.

UJL ist bewusst **kein CMS** und **keine Plattform**.  
Es ist ein **visueller Layout-Layer**, der bestehende CMS- und Frontend-Systeme ergänzt, ohne sie zu ersetzen.

::: tip Frühe Vorschau

Du möchtest sehen, wie UJL in der Praxis aussieht? Wir haben eine frühe Vorschau des UJL Crafter veröffentlicht. Bitte beachte, dass es sich um eine sehr frühe Version handelt – viele Features sind noch in Entwicklung.

→ [Vorschau ausprobieren](https://demo.ujl-framework.org)

:::

## Das zugrunde liegende Problem

### 1. Das Brand-Compliance-Dilemma

In nahezu jedem Webprojekt entsteht derselbe strukturelle Konflikt. Redakteur:innen sollen Inhalte schnell und eigenständig pflegen können, Designer:innen müssen sicherstellen, dass das Corporate Design eingehalten wird, und Entwickler:innen geraten zwischen beide Seiten, weil jede Änderung technische Eingriffe erfordert.

Klassische Lösungsansätze verschieben dieses Problem, lösen es aber nicht. Strenge Freigabeprozesse verhindern Designfehler, führen jedoch zu langen Durchlaufzeiten und blockierten Teams. Visuelle Page Builder beschleunigen zwar die Content-Erstellung, lassen jedoch Gestaltungsfreiheiten zu, die langfristig zu Design-Drift und inkonsistenten Markenauftritten führen. Manuelle Kontrollen sind teuer, fehleranfällig und nicht skalierbar.

Das Ergebnis ist ein systemischer Zielkonflikt: Organisationen müssen sich zwischen Geschwindigkeit und Markenkonsistenz entscheiden.

### 2. KI verschärft das Problem

KI-gestützte Werkzeuge versprechen eine noch schnellere Content-Erstellung, verschärfen jedoch bestehende Risiken. Design- und Markenregeln müssen bei jeder Anfrage neu erklärt werden, Ergebnisse sind nicht deterministisch und schwer reproduzierbar, und Markenkonformität wird zur Frage des Zufalls statt zu einer verlässlichen Eigenschaft.

In der Praxis entstehen Inhalte, die optisch oft „ausreichend“ wirken, aber nicht belastbar markenkonform sind. Gerade in größeren Organisationen ist diese Unzuverlässigkeit nicht akzeptabel.

### 3. Barrierefreiheit als Nacharbeit

Barrierefreiheit wird in vielen Projekten erst am Ende berücksichtigt – häufig ausgelöst durch externe Audits oder regulatorische Anforderungen wie den EU Accessibility Act. Die Ursache liegt jedoch tiefer: Redaktionelle Werkzeuge erlauben Gestaltungsfreiheiten, die Barrierefreiheit unabsichtlich unterlaufen können.

Die Folge sind teure Nachbesserungen, rechtliche Risiken und eine schlechtere Nutzererfahrung.

## Die Lösung: Brand-Compliance by Design

UJL löst diese Probleme nicht durch zusätzliche Kontrollen oder komplexere Prozesse, sondern durch Architektur.

Redakteur:innen arbeiten visuell und flexibel, während Designer:innen Regeln einmal zentral definieren. Das System stellt sicher, dass ungültige Kombinationen gar nicht erst entstehen können. Gestaltung ist frei, aber nicht beliebig.

Konkret bedeutet das: Inhalte werden aus klar definierten Modulen aufgebaut, Design-Systeme werden zentral festgelegt, und visuelles Arbeiten findet ausschließlich innerhalb sicherer Grenzen statt. Statt freiem HTML erzeugt UJL strukturierte Daten, die vor dem Rendern automatisch validiert werden.

Das Ergebnis ist ein Arbeitsprozess, in dem Redakteur:innen selbstständig arbeiten können, Markenauftritte konsistent bleiben und Barrierefreiheit systematisch eingehalten wird. Review- und Korrekturschleifen werden dadurch weitgehend überflüssig.

## Warum UJL anders ist als bestehende Tools

Viele bestehende Werkzeuge behandeln Design- und Accessibility-Regeln als Empfehlungen. UJL behandelt sie als technische Rahmenbedingungen.

Kurz gesagt:  
Was in UJL gebaut werden kann, ist per Definition innerhalb der Leitplanken.

Governance verlagert sich damit weg von manuellen Kontrollen hin zu architektonischer Absicherung.

## KI – sinnvoll integriert, nicht unkontrolliert

UJL ist so aufgebaut, dass KI unterstützt, ohne Kontrolle zu übernehmen. KI-Systeme erzeugen strukturierte Inhalte statt freies Markup. Diese Ergebnisse werden automatisch validiert, bevor sie Bestandteil einer Seite werden.

Das ermöglicht effizientere Content-Erstellung, reduziert den Prompt-Aufwand und erlaubt den Einsatz kleinerer oder lokaler Modelle. Markenkonformität und Barrierefreiheit bleiben dabei jederzeit gewährleistet.

## Rollenbasiertes Arbeiten ohne Reibung

UJL trennt Verantwortlichkeiten klar. Designer:innen definieren Design-Systeme, Redakteur:innen erstellen Inhalte, Entwickler:innen erweitern Module und integrieren UJL in bestehende Systeme. Jede Rolle arbeitet innerhalb ihres Fachbereichs, ohne unbeabsichtigt die Arbeit der anderen zu gefährden.

## Integration statt Systemwechsel

UJL ersetzt keine bestehenden Systeme. CMS bleiben CMS, Frontends bleiben Frontends. UJL ergänzt die visuelle Ebene dazwischen.

Das reduziert den Einführungsaufwand, vermeidet Lock-in und ermöglicht eine schrittweise Adoption.

## Gesellschaftliche Relevanz

UJL adressiert zentrale Herausforderungen moderner digitaler Arbeit.

Barrierefreiheit wird nicht nachträglich geprüft, sondern bereits beim Erstellen abgesichert. Das senkt Kosten, reduziert Risiken und verbessert digitale Teilhabe – insbesondere unter steigenden regulatorischen Anforderungen.

Strukturierte Daten ermöglichen zudem eine ressourcenschonendere KI-Nutzung. Durch Open Source, Self-Hosting und transparente Architektur stärkt UJL digitale Souveränität und Vertrauen. Gleichzeitig senkt es die Hürden für professionelle Webgestaltung, da auch Nicht-Techniker:innen hochwertige, konsistente Inhalte erstellen können.

## Unsere Vision

Wir glauben, dass visuelles Arbeiten im Web frei, schnell und verantwortungsvoll sein sollte.

UJL steht für eine neue Generation von Werkzeugen, bei denen Qualität, Barrierefreiheit und Markenkonsistenz keine Zusatzarbeit darstellen, sondern systemische Eigenschaften sind. Langfristig soll UJL dazu beitragen, dass visuelles Authoring kein Trade-off zwischen Tempo und Qualität mehr ist, sondern beides gleichzeitig ermöglicht.
