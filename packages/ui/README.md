# @ujl-framework/ui - shadcn-svelte Component Library

This package provides the base UI components (Text, Button, Input, Card, Dialog, etc.) for the UJL project based on [shadcn-svelte](https://shadcn-svelte.com). These elements are used both for the **Crafter** UI and for rendering **ContentFrames**.

---

## Installation and Usage

### Prerequisites

This library requires the following peer dependencies to be installed in your project:

```bash
pnpm add svelte @sveltejs/kit tailwindcss
```

### Installation

```bash
pnpm add @ujl-framework/ui
```

### Svelte Component Usage

```svelte
<script>
	import {
		Button,
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Text,
		Heading,
		Dialog,
		DialogContent,
		DialogTriggerButton
	} from '@ujl-framework/ui';
	import { flavors } from '@ujl-framework/ui/tokens';
</script>

<!-- Styles are automatically imported when you import components -->

<Card>
	<CardHeader>
		<CardTitle>My Card</CardTitle>
	</CardHeader>
	<CardContent>
		<Text>This is a card with a button.</Text>
		<Button>Click me</Button>
	</CardContent>
</Card>
```

### Design Tokens

```javascript
import { flavors } from '@ujl-framework/ui/tokens';

// Access available flavor tokens
console.log(flavors); // ['primary', 'secondary', 'accent', ...]
```

### Tools

```javascript
import { PositionSpy, scrollToHash } from '@ujl-framework/ui/tools';

// Use utility functions
PositionSpy.subscribe(/* ... */);
scrollToHash(/* ... */);
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

- Build the SvelteKit application
- Copy all content from `src/lib` to `dist`
- Copy the compiled CSS assets to `dist/styles/index.css` for distribution
- Package the library components using `svelte-package`
- Validate the package structure with `publint`

## Available Components

The library includes the following component categories:

- **Layout**: Container, Grid, GridItem
- **Typography**: Text, Heading, Highlight
- **Interactive**: Button, Link
- **Overlay**: Dialog, Drawer, Popover, Sheet, Tooltip, HoverCard
- **Navigation**: Breadcrumb, Tabs, Accordion
- **Data Display**: Table, Card, Alert, Badge, Counter
- **Forms**: (Coming soon)
- **Feedback**: (Coming soon)

## Available Tools

- **PositionSpy**: Track element positions
- **scrollToHash**: Smooth scrolling to hash targets

## Design System

The library includes a comprehensive design system with:

- **Flavors**: Primary, Secondary, Accent, Success, Warning, Destructive, Info
- **Color System**: OKLCH-based color space for better color consistency
- **Typography**: Responsive text sizing and weight system
- **Spacing**: Consistent spacing scale
- **Animations**: Built-in animation utilities
