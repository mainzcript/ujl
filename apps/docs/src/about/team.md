---
title: "Team"
description: "Who is behind UJL, mainzcript, the team, and how to get involved."
---

# Team

## Who Makes UJL?

UJL is built and maintained by [**mainzcript**](https://mainzcript.eu), a software studio founded by **Marius Klein** and **Lukas Antoine**, focused on digital sovereignty and open infrastructure for the web.

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const linkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></svg>`;

const mainzcript = [
  {
    avatar: '/assets/avatar-mainzcript.svg',
    name: 'mainzcript GbR',
    title: 'Software Studio',
    desc: 'Marius and Lukas are building their software studio around digital sovereignty, developing an ecosystem around UJL and open web infrastructure.',
    links: [
      { icon: { svg: linkSVG }, link: 'https://mainzcript.eu/' },
      { icon: 'github', link: 'https://github.com/mainzcript' }
    ]
  }
]

const core = [
  {
    avatar: '/assets/avatar-marius.svg',
    name: 'Marius Klein',
    title: 'Co-Founder · Product & Architecture',
    desc: 'Responsible for overall architecture, core development, editor design, prioritisation, and project steering. Primary contact for pilots, partners, and external contributors.',
    links: [
      { icon: { svg: linkSVG }, link: 'https://kleinform.at/' },
      { icon: 'github', link: 'https://github.com/KLEINformat' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/kleinformat/' }
    ]
  },
  {
    avatar: '/assets/avatar-nadine.svg',
    name: 'Nadine Denkhaus',
    title: 'Founding Contributor',
    desc: 'Co-developed the initial version of UJL. Her work on Crafter and the design specification format laid the technical foundation of the project.',
    links: [
      { icon: 'github', link: 'https://github.com/ndnk27' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/nadinednk/' }
    ]
  },
  {
    avatar: '/assets/avatar-marius.svg',
    name: 'Lukas Antoine',
    title: 'Co-Founder · Infrastructure & Enablement',
    desc: 'Responsible for operations and infrastructure (deployments, hosting, SaaS foundations), architecture sparring, and building enablement structures: onboarding materials, learning paths, and documentation.',
    links: [
      { icon: 'github', link: 'https://github.com/lantoine16' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/lukas-antoine-a80b21246/' }
    ]
  }
]
</script>

<VPTeamMembers size="medium" :members="mainzcript" />

## Core Team

<VPTeamMembers size="medium" :members="core" />

## Community & Contributors

UJL is shaped by an ongoing network of contributors and collaborators:

- **Leon Scherer**, Freelance web developer and Svelte specialist
- **Philipp Oehl**, .NET developer with backend expertise
- **Ulla Suhare**, Frontend developer specializing in Angular and TypeScript
- **Jannik Seus**, Master's student focused on scalable, AI-assisted solutions

## Get Involved

UJL is open source and lives from its community. We welcome:

- **Code contributions**, modules, adapters, bug fixes, features
- **Feedback and ideas**, use cases, feature requests, improvement suggestions
- **Documentation**, tutorials, examples, corrections
- **Community**, discussions, support, showcase projects

The repository is at [github.com/mainzcript/ujl](https://github.com/mainzcript/ujl). For questions or collaboration inquiries, reach us at [info@mainzcript.eu](mailto:info@mainzcript.eu).

See [CONTRIBUTING.md](https://github.com/mainzcript/ujl/blob/main/CONTRIBUTING.md) for contribution guidelines.
