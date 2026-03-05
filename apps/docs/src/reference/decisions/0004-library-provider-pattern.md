---
title: "ADR-004: Library Provider Pattern"
description: "Why UJL uses a provider pattern for asset storage in the Crafter, with one built-in implementation and an open interface for custom providers."
---

# ADR-004: Library Provider Pattern

**Status:** Accepted (supersedes earlier "Dual Image Storage" framing)

## Context

Assets (images today, other media later) are central to UJL documents. Use cases differ widely: demos and standalone tools need zero infrastructure; production apps may want assets in a DAM, CDN, or custom API; others need offline-capable documents with embedded data. Fixing exactly two modes (e.g. "inline" and "backend") would either limit flexibility or force the framework to maintain and document many backends. The goal is a single, clear abstraction that leaves the choice of storage to the developer.

## Decision

UJL uses a **Provider pattern** for asset handling in the **Crafter** (the visual editor):

- The Crafter accepts an optional **libraryProvider** that implements the **LibraryProvider** interface (defined in `@ujl-framework/types`). The provider is responsible for upload, list, get, delete, and optional metadata updates during editing.
- **Rendering is provider-agnostic.** The Composer and adapters do not use a provider. They read asset data only from the document's **library** (`doc.ujlc.library`). Every asset is represented as a **LibraryAssetImage** (or future asset types) in that object. How an entry got there—inline paste, custom provider, future official provider—is irrelevant at render time.
- UJL ships **one** built-in implementation: **InlineLibraryProvider**. Assets are stored directly in the UJLC document (e.g. Base64 or embedded URLs). It is the default when no `libraryProvider` is passed. Any other storage (own API, third-party service, or future packages) is realized by implementing the interface and passing an instance. The framework does not prescribe or ship a second "backend" provider; the ecosystem and future additions can fill that space.

**Document contract:** Regardless of provider, the document's `library` is a record of asset IDs to `LibraryAssetImage` entries. Example:

```json
{
	"ujlc": {
		"library": {
			"asset-001": {
				"kind": "image",
				"img": {
					"src": "data:image/jpeg;base64,/9j/...",
					"width": 1920,
					"height": 1080
				},
				"meta": { "filename": "hero.jpg", "alt": "" }
			}
		}
	}
}
```

Same shape for URLs (e.g. from a custom backend provider): `img.src` can be a data URL or an external URL; the contract is the structure, not the origin.

## Rationale

- **Single abstraction:** One interface (`LibraryProvider`) and one document contract (`library` + `LibraryAssetImage`) keep the system understandable and testable. The Crafter talks to "a provider"; rendering reads "the document."
- **Maximum flexibility:** Developers can implement any storage they need (file system, S3, existing DAM, in-memory for tests) without waiting for framework support. UJL may ship additional providers later; they are just more implementations of the same interface.
- **No hidden duality:** Avoiding a fixed "inline vs. backend" split prevents the docs and codebase from drifting into two special cases. There is "the default provider" and "any other provider you plug in."

**Alternatives considered:** Inline-only (no flexibility), exactly two built-in modes (rigid, maintenance burden), backend-only (breaks demos and offline use), no abstraction (Crafter coupled to one storage).

## Consequences

- Demos and simple integrations work with zero configuration: omit `libraryProvider` and use the default inline behavior.
- Production and custom setups pass a `libraryProvider` that matches their infrastructure. No need for a framework-owned "backend" implementation.
- Rendering stays simple and stateless: it only depends on `doc.ujlc.library`. Migration or swapping providers does not affect the Composer or adapters.
- Trade-off: documents with many inline assets can become large; that is a property of the chosen provider, not the pattern. Custom providers may require additional docs or examples from the community or from UJL later.

**Related:** [ADR-005](/reference/decisions/0005-zod-schema-validation) (Zod validation for asset shapes), [Library Providers guide](/guide/library-providers) (how to use and implement providers).
