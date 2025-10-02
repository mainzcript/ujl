# @ujl/ui - shadcn-svelte Component Library

This package provides the base UI components (Text, Button, Input, Card, Dialog, etc.) for the UJL project based on shadcn-svelte. These elements are used both for the **Crafter** UI and for the implementation of **LayoutModules** and **AtomicModules**.

---

## Developing

Once you've installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

Everything inside `src/lib` is part of the UI library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build the UI library:

```sh
pnpm pack
```

To create a production version of the UI library:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy the UI library, we may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for our target environment.

## Publishing

We will have to go into the `package.json` and give our package the desired name through the `"name"` option. We also have to consider adding a `"license"` field and point it to a `LICENSE` file which we can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish the UI library to [npm](https://www.npmjs.com):

```sh
pnpm publish
```
