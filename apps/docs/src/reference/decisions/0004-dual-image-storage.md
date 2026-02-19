---
title: "ADR-004: Dual Image Storage (Inline vs. Backend)"
description: "Why UJL supports two image storage modes and how they differ."
---

# ADR-004: Dual Image Storage (Inline vs. Backend)

**Status:** Accepted, evolved iteratively

## Context

Images are central to UJL documents, but use cases differ fundamentally.

**Standalone documents** need to work without a backend, for demos, offline use, or simple deployments. A small number of images embedded directly in the document is acceptable.

**Production workflows** need asset management with metadata (alt text, credits, i18n), responsive variants (WebP, multiple sizes), and the ability to handle large image libraries without inflating document files.

Inline storage was implemented first. Backend storage was added when CMS integration became a requirement.

## Decision

UJL supports two storage modes, selected at the Crafter configuration level:

**Inline storage**, images are embedded as Base64 in the UJLC document:

```json
{
	"ujlc": {
		"meta": { "_library": { "storage": "inline" } },
		"images": {
			"img-001": {
				"src": "data:image/jpeg;base64,/9j/...",
				"metadata": { "filename": "hero.jpg", "width": 1920, "height": 1080 }
			}
		}
	}
}
```

**Backend storage**, images are referenced by URL, resolved via the Library Service:

```json
{
	"ujlc": {
		"meta": { "_library": { "storage": "backend", "url": "https://library.example.com" } },
		"images": {
			"img-001": {
				"src": "https://library.example.com/api/images/abc123",
				"metadata": { "filename": "hero.jpg", "width": 1920, "height": 1080 }
			}
		}
	}
}
```

The Image Library abstraction provides a unified `resolve(id)` API to both Composer and adapters, the storage mode is transparent to them.

## Rationale

A single mode would force a trade-off. Inline-only doesn't scale to large libraries. Backend-only breaks standalone use cases and demo workflows. The Provider pattern keeps the integration boundary clean, adapters don't need to know where images come from.

**Alternatives considered:** inline-only (doesn't scale), backend-only (no offline/standalone use), filesystem-based (not portable across environments), CDN-only (too complex for local dev).

## Consequences

Simple documents (demos, prototypes) work without any infrastructure. Production projects can use the Library Service for full asset management. The Composer and adapters are agnostic to the storage mode.

Trade-off: inline documents grow large quickly with many images. Backend storage requires the Library Service (Docker + PostgreSQL). Storage-mode migration (inline ↔ backend) is planned but not yet implemented.

**Related:** [ADR-005](/reference/decisions/0005-zod-schema-validation) (image schemas validated via Zod)
