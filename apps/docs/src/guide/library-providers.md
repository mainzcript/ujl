---
title: "How to Use Library Providers"
description: "How the Crafter handles image assets: inline storage by default, optional backend via a custom provider."
---

# How to Use Library Providers

When editors add or change images in the Crafter, those assets need to be stored somewhere. **Library providers** define where and how. They are a Crafter concern only: at render time, the Composer and adapters read image data from the document's `doc.ujlc.library`; they do not talk to a provider.

## Default: inline storage

If you do not pass a `libraryProvider`, the Crafter uses the built-in **inline** provider. Assets are stored directly in the UJLC document (e.g. as Base64 or embedded URLs). No backend or configuration required.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";

const crafter = new UJLCrafter({
	target: "#app",
	document: ujlcDocument,
	theme: ujltDocument,
	// libraryProvider omitted → inline (default)
});
```

To be explicit, you can pass the inline provider from core:

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";
import { InlineLibraryProvider } from "@ujl-framework/core";

const crafter = new UJLCrafter({
	target: "#app",
	document: ujlcDocument,
	theme: ujltDocument,
	libraryProvider: new InlineLibraryProvider(),
});
```

Inline is ideal for demos, small documents, and offline-capable workflows. Documents grow with every image; for large asset sets, a custom provider that stores assets elsewhere can be better.

## Using a custom provider

UJL ships only **InlineLibraryProvider**. To store assets outside the document (e.g. in your own API or a dedicated asset service), implement the UJL `LibraryProvider` interface (from `@ujl-framework/types`) and pass your instance as **libraryProvider**. The Crafter will use it for upload, list, delete, and metadata during editing. The resulting document still has a `library` object; your provider is responsible for writing entries that match the `LibraryAssetImage` shape.

```javascript
import { UJLCrafter } from "@ujl-framework/crafter";
// Your own or third-party provider that implements LibraryProvider

const crafter = new UJLCrafter({
	target: "#app",
	document: ujlcDocument,
	theme: ujltDocument,
	libraryProvider: myCustomLibraryProvider,
});
```

## Related

- [Install & Integrate](/guide/installation) – Crafter setup
- [ADR-004: Library Provider Pattern](/reference/decisions/0004-library-provider-pattern) – design rationale
- [Crafter README](https://github.com/mainzcript/ujl/tree/main/packages/crafter) – API reference
