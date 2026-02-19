---
title: "Roadmap"
description: "Where UJL is going, development milestones from MVP to production-ready system."
---

# Roadmap

UJL is in active development. In February 2026, we released the first Early Access version (v0.0.1) as an experimental technical preview. This roadmap describes the path from this foundation to a production-ready, openly usable system.

Timelines are **not fixed deadlines** but a sequence of development states. Actual progress depends on available resources and funding.

---

## Milestone 1: Technical Foundation & MVP

**Goal:** Stabilize the UJL Core and prepare a stable developer version (v0.1) as foundation for pilot integrations.

This milestone focuses on hardening existing core components and establishing a true Minimum Viable Product that can be used in production, not just demonstrated.

**Key work:**

- **Core stabilization**: schemas, modules, renderer interfaces, validation and error handling
- **Essential modules**: text, layout, images, call-to-action
- **AI features**: embedding model + generative AI integration for content assistance and module suggestions
- **Developer experience**: API consolidation, clear packaging, release discipline
- **Reference architecture**: documented integration patterns

**Result:** v0.1 as stable developer version. UJL can be integrated into real projects with confidence. Documentation and reference architecture are in place.

---

## Milestone 2: Backend Service

**Goal:** Enable production deployment and persistence.

UJL needs infrastructure to persist documents, handle media, and integrate with existing systems.

**Key work:**

- **Document persistence**: save, load, and version UJL documents
- **Media library**: upload, storage, delivery, responsive variants
- **Integration interfaces**: REST/GraphQL APIs for CMS and frontend integration
- **Demo and test environments**: publicly accessible demos, testing infrastructure

**Result:** UJL can be deployed in real project environments. Manual workarounds are eliminated. Backend service is stable and documented.

---

## Milestone 3: Pilot Projects & Validation

**Goal:** Validate UJL under real production conditions.

After technical stabilization, UJL is deployed in 2-3 pilot projects, primarily with agency partners. The goal is validation, not scaling: does the architecture hold? Is it usable? Where do integrations break down?

**Key work:**

- **Real-world deployments**: at least 2 agency projects
- **Systematic feedback**: usability, integration effort, governance effectiveness, actual value delivered
- **Iterative refinement**: based on pilot learnings
- **Case studies**: document learnings and reference implementations

**Result:** UJL is production-validated. Failure modes, UX issues, and integration patterns are identified and addressed. First customer references exist.

---

## Milestone 4: Documentation & Enablement

**Goal:** Lower barriers to entry for external use and contribution.

Based on pilot learnings, UJL is prepared for broader adoption. Good documentation and clear onboarding paths are essential.

**Key work:**

- **Developer documentation**: API reference, integration guides, architecture docs
- **Getting started materials**: quickstart, tutorials, best practices
- **Community infrastructure**: Discord/discussions, GitHub issues, contribution guidelines
- **Regular updates**: roadmap transparency, development progress

**Result:** UJL is understandable, learnable, and extendable. External developers can integrate UJL without direct support. Community can form organically. Knowledge dependency on core team is reduced.

---

## Milestone 5: Sustainable Business Model

**Goal:** Establish recurring revenue streams and prepare for scale.

With a validated product and proven demand, focus shifts to sustainable business operations.

**Key work:**

- **Hosted offering (SaaS)**: managed UJL deployment with integrated AI features, token-based billing
- **Support & maintenance**: SLA-based support packages, managed operations for self-hosting customers
- **White-label preparation**: standardized integration packages for SaaS providers embedding UJL
- **Clear separation**: open-source core vs. commercial services

**Result:** UJL has a sustainable business model. Recurring revenue from hosting, support, and integration services. Foundation for long-term growth is established.

---

## Beyond: Extensibility & Ecosystem

**Goal:** Establish UJL as a genuinely extensible platform.

Once the foundation is solid and business model proven, focus shifts to ecosystem growth and advanced features.

**Potential directions** (driven by demand, not promised upfront):

- **Additional adapters**: React, Vue, static HTML, PDF
- **CMS integrations**: official plugins for Strapi, Sanity, Contentful, etc.
- **Advanced AI features**: extended authoring assistance, smart suggestions, content generation
- **Collaboration features**: version control, change tracking, multi-user editing
- **Module marketplace**: community-contributed modules, premium extensions

These are explored later, to protect the stability and openness of the core.
