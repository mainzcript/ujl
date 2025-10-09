# @ujl-framework/ui - shadcn-svelte Component Library

This package provides the base UI components (Text, Button, Input, Card, Dialog, etc.) for the UJL project based on [shadcn-svelte](https://shadcn-svelte.com). These elements are used both for the **Crafter** UI and for the implementation of **LayoutModules** and **AtomicModules**.

**Features:**

- **shadcn-svelte** based components
- **Namespace exports** for clean imports
- **CSS Styles distribution** for custom styling
- **Tailwind CSS configuration export** for custom component development
- **Design tokens** and **utility tools**

---

## Installation and Usage

### Installation

```bash
pnpm add @ujl-framework/ui
```

The library provides pre-built CSS styles that you can import in your project.

### Basic Usage (Pre-built Styles)

```css
@import '@ujl-framework/ui/styles';

/* your own styles */
```

### Advanced Usage (Custom Tailwind Setup)

If you want to build custom components with Tailwind CSS, you can import the Tailwind configuration:

```css
@import '@ujl-framework/ui/styles-raw';

/* your custom components with UJL design tokens */
```

> **Note:** When using the raw styles, you need to configure Tailwind to scan the component files from this package to ensure all CSS classes are included in your build.

### JavaScript/TypeScript Usage

```javascript
import { Components, Tokens, Tools } from '@ujl-framework/ui';

// Use components
const { Button, Card, Text } = Components;

// Use design tokens
const { flavors } = Tokens;

// Use tools
const { PositionSpy } = Tools;
```

## Developing

Once you've installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

Everything inside `src/lib` is part of the UI library all resources should be exported in the `index.ts` file, everything inside `src/routes` can be used as a showcase or preview app.

## Building

### To create a production version of the UI library:

```sh
pnpm run build
```

This will:

- Copy all content from `src/lib` to `dist`
- Copy the compiled CSS assets to `dist/index.css` for distribution
- Package the library components using `svelte-package`
- Validate the package structure with `publint`
