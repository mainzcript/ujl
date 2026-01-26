---
title: "Team"
description: "Wer steht hinter UJL und wie kannst du mitwirken?"
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const linkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></svg>`;

const coreMembers = [
  {
    avatar: '/assets/avatar-marius.svg',
    name: 'Marius Klein',
    title: 'Initiator, Co-Founder von mainzcript',
    desc: 'Mehrjährige Erfahrung in Full-Stack-Webentwicklung, spezialisiert auf UI/UX-Projekte mit Tailwind CSS, Svelte und Laravel.',
    links: [
      { icon: {
        svg: linkSVG
      }, link: 'https://kleinform.at/' },
      { icon: 'github', link: 'https://github.com/KLEINformat' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/kleinformat/' }
    ]
  },
  {
    avatar: '/assets/avatar-nadine.svg',
    name: 'Nadine Denkhaus',
    title: 'Frontend-Entwicklerin',
    desc: 'Passionierte Frontend-Entwicklerin mit Erfahrung in Shopify und Svelte. Verbindet technisches Know-how mit fundiertem Verständnis für digitale Medien und BWL.',
    links: [
      { icon: 'github', link: 'https://github.com/ndnk27' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/nadinednk/' }
    ]
  }
]

const mainzcript = [
  {
    avatar: '/assets/avatar-mainzcript.svg',
    name: 'mainzcript GbR',
    title: 'Software-Studio',
    desc: 'Marius und Lukas fokussieren sich mit ihrem frisch gegründeten Software-Studio auf digitale Souveränität und möchten ein Ökosystem um den UJL Core entwickeln.',
    links: [
      { icon: {
        svg: linkSVG
      }, link: 'https://mainzcript.eu/' },
      { icon: 'github', link: 'https://github.com/mainzcript' }
    ]
  }
]
</script>

# Team

## Wer macht UJL?

UJL wird von Marius Klein initiiert. Ein Prototyp entsteht aktuell im Rahmen einer Projektarbeit an der [Hochschule Mainz](https://www.hs-mainz.de/), die Weiterentwicklung erfolgt voraussichtlich im Software-Studio [mainzcript GbR](https://mainzcript.eu/) - Gesellschafter: Marius Klein und Lukas Antoine.

## Pionier-Core-Team

Das Core-Team besteht aktuell aus Nadine und Marius. Wir studieren gemeinsam an der Hochschule Mainz und arbeiten im Rahmen einer Projektarbeit an der ersten Beta-Version von UJL.

<VPTeamMembers size="medium" :members="coreMembers" />

## Träger

Die Infrastruktur, die wir aktuell benötigen, um UJL zu entwickeln (beispielsweise das Hosting dieser Dokumentation), wird von mainzcript bereitgestellt.

<VPTeamMembers size="medium" :members="mainzcript" />

## Community

Darüber hinaus wird UJL durch ein wachsendes Netzwerk an Entwickler:innen unterstützt, die das Projekt mit Ideen und Feedback bereichern:

- **Lukas Antoine**: Co-Founder von mainzcript, Full-Stack-Entwickler und Lehrer für Informatik und Mathematik.
- **Leon Scherer**: Freier Web-Entwickler und Svelte-Experte
- **Philipp Oehl**: .NET-Entwickler mit Backend-Expertise
- **Ulla Suhare**: Frontend-Entwicklerin mit Schwerpunkt auf Angular und TypeScript
- **Jannik Seus**: Master-Student mit Fokus auf skalierbare, AI-unterstützte Lösungen

## Mitwirken

UJL ist ein Open-Source-Projekt und lebt von der Community. Wir freuen uns über:

- **Code-Beiträge:** Module, Adapter, Bugfixes, Features
- **Feedback & Ideen:** Use Cases, Feature-Requests, Verbesserungsvorschläge
- **Dokumentation:** Tutorials, Beispiele, Übersetzungen
- **Community:** Diskussionen, Support, Showcase-Projekte

Da unser Repository derzeit noch privat ist, freuen wir uns über Kontaktaufnahme per E-Mail an [info@mainzcript.eu](mailto:info@mainzcript.eu). Sobald wir öffentlich sind, werden wir GitHub Issues, Discussions und einen Discord-Server für die Community bereitstellen.
