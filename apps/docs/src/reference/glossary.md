---
title: "Glossary"
description: "Key terms and concepts used throughout the UJL documentation."
---

# Glossary

Terms used consistently throughout UJL documentation and code.

## UJL-Specific Terms

**Unified JSON Layout (UJL)**, A JSON-based, modular open-source framework for structured visual authoring on the web, with strict separation of content and design.

**UJLC (UJL Content Document)**, The content document format (`.ujlc.json`). Contains metadata (`meta`), an image library (`images`), and the module structure (`root`). No design values.

**UJLT (UJL Theme Document)**, The theme document format (`.ujlt.json`). Contains metadata and design tokens (`tokens`), colors, typography, spacing, radius. No content.

**UJL Crafter**, The visual editor for creating and editing `.ujlc.json` and `.ujlt.json` files. Provides a WYSIWYG interface for developers, designers, and editors.

**ContentFrame**, The rendered output of a UJL layout, HTML/CSS/JS ready for display.

**Library Service** (`services/library`), Optional backend for image asset management (upload, responsive variants, metadata, i18n alt text) built on Payload CMS and PostgreSQL.

## Architecture

**Adapter**, A component that transforms the Abstract Syntax Tree into a concrete output format. UJL ships `adapter-svelte` (Svelte 5) and `adapter-web` (Web Components). Further adapters can be implemented.

**AST (Abstract Syntax Tree)**, A framework-agnostic tree of `UJLAbstractNode` objects produced by the Composer. The intermediate representation between content/theme and rendered output.

**Composer**, Orchestrates the composition process using the ModuleRegistry. Transforms a UJLC document + UJLT theme into an AST.

**ModuleRegistry**, Manages available modules. Custom modules are registered here, making them available for composition and the editor.

**Image Library**, Core abstraction that resolves image IDs to concrete image data. Supports Inline Storage (Base64 in UJLC) and Backend Storage (via a Provider).

**ImageProvider**, Interface through which the Image Library resolves images from external sources (e.g., the Library Service).

## Modules and Fields

**Module**, A reusable building block with Fields (data) and Slots (content areas). The atomic unit of UJL content.

**ModuleBase**, The base class for all modules. Defines metadata (`name`, `label`, `category`), fields, slots, and the `compose()` method.

**Fields**, Type-safe data containers with validation, parsing, and fitting logic. Examples: `TextField`, `NumberField`, `ImageField`.

**FieldBase**, The base class for all fields. Implements `validate()` (type checking) and `fit()` (normalization and fallbacks).

**Slots**, Named content areas within a module that can contain other modules. Enable hierarchical, composable layouts.

**TokenSet**, A collection of design tokens (colors, typography, spacing, radius) loaded from a `.ujlt.json` file.

## Design

**Design Tokens**, Named design values (colors, typography, spacing) maintained in the theme and translated by adapters into concrete CSS output.

**OKLCH**, A perceptually uniform color space (Lightness/Chroma/Hue) used for UJL design tokens. Enables consistent palette generation and reliable WCAG contrast calculations.

**Foreground Mapping**, A theme-level configuration that assigns accessible text colors to each background color variant, enforcing WCAG contrast ratios automatically.

**Shadow DOM**, Browser technology for style isolation. Used by `adapter-web` to prevent CSS conflicts with host applications.

## Development

**Agentic Coding**, A development style where AI tools execute code changes and humans primarily direct goals, constraints, and reviews.

**`AGENTS.md`**, A file in the repository root with working instructions for AI tools. Describes conventions and context for the codebase.

**ADR (Architecture Decision Record)**, A documented architectural decision including context, the decision made, rationale, and consequences.

**Changeset**, A versioning tool for monorepos (used in UJL). Coordinates package versions, generates changelogs, and follows Semantic Versioning.

## Standards

**WCAG (Web Content Accessibility Guidelines)**, Standardized accessibility guidelines for the web. UJL targets WCAG 2.2.

**WYSIWYG**, "What You See Is What You Get", editing with direct visual preview, as in the Crafter.

**SSR (Server-Side Rendering)**, Rendering on the server rather than the browser. UJL's serializers are SSR-safe (no browser APIs required).

**XSS (Cross-Site Scripting)**, A security vulnerability where unescaped user input can inject scripts. UJL uses structured data models and defensive rendering to eliminate this class of risk.
