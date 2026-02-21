# Contributing to UJL Framework

We welcome contributions of all kinds, bug fixes, new modules, adapter implementations, documentation improvements, and feedback. Thank you for taking the time.

## Two Types of Contributors

There are two workflows depending on your relationship to the project:

- **External contributors** (no write access to the repo) → fork the repository, work on your fork, open a Pull Request
- **Core team** (write access) → create a branch directly on the repo, open a Pull Request

If you're contributing for the first time, use the external contributor flow below.

## External Contributor Flow (Fork & Pull Request)

### 1. Fork the repository

Click **Fork** in the top-right corner of [github.com/mainzcript/ujl](https://github.com/mainzcript/ujl). This creates your own copy of the repository under your GitHub account (e.g., `your-username/ujl`).

### 2. Clone your fork

```bash
git clone git@github.com:your-username/ujl.git
cd ujl
```

### 3. Add the original repository as `upstream`

This lets you pull in future changes from the main project:

```bash
git remote add upstream git@github.com:mainzcript/ujl.git
```

Verify your remotes:

```bash
git remote -v
# origin    git@github.com:your-username/ujl.git (your fork)
# upstream  git@github.com:mainzcript/ujl.git    (original)
```

### 4. Keep your fork up to date

Before starting work, make sure your `main` is in sync with the original:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 5. Create a feature branch

Never work directly on `main`. Create a branch from `main`:

```bash
git checkout -b feat/my-feature
```

### 6. Make your changes and commit

Follow the commit conventions below (conventional commits). Run checks before pushing:

```bash
pnpm lint
pnpm check
```

### 7. Push to your fork and open a Pull Request

```bash
git push origin feat/my-feature
```

Then go to your fork on GitHub, you'll see a prompt to open a Pull Request against `mainzcript/ujl`. Click it, fill in the description, and submit.

We'll review it, leave feedback if needed, and merge when ready.

---

## Getting Started

This repository is a **pnpm monorepo**. For the full setup guide, see the [Installation Guide](./apps/docs/src/guide/installation.md).

### Development Setup (Quick)

```bash
# Clone the repository
git clone git@github.com:mainzcript/ujl.git
cd ujl

# Install dependencies
pnpm install

# Build all packages (recommended before running apps)
pnpm run build
```

### Run Common Targets

```bash
# Crafter (visual editor)
pnpm --filter @ujl-framework/crafter dev

# Dev demo (integration example)
pnpm --filter @ujl-framework/dev-demo dev
```

### Tooling Notes

- ESLint and Prettier are configured centrally at the repo root.
- Run linting/formatting from the repository root for consistent results.

## Development Workflow

### Branch Strategy

We use a **trunk-based** branching strategy:

- **`main`**: Primary development and release branch
- **`feat/*`**: Feature branches from `main`
- **`fix/*`**: Bug fix branches from `main`
- **`chore/*`**: Maintenance branches from `main`
- **`release/*`**: Release branches from `main` (named after Mainz landmarks, e.g. `release/gutenberg`, `release/rhein`, `release/dom`)

Branch name rules: lowercase letters and hyphens, concise but descriptive, no special characters except hyphens.

> `main` is protected. All changes go through pull requests.

### 1. Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Run linting and type checking:
   ```bash
   pnpm lint
   pnpm check
   ```

### 2. Adding Changesets

For any changes that should be released:

```bash
pnpm run vc:changeset
```

This guides you through creating a changeset describing your changes. Changesets are created on feature branches and processed during the release.

### 3. Committing Changes

We follow conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

### 4. Pull Request

1. Push your branch
2. Create a pull request targeting `main`
3. Ensure all checks pass
4. Request review from maintainers
5. Merge using **squash**

## Release Process

**Release workflow:**

1. Create a release branch from `main` using a Mainz landmark as the name:

   ```bash
   git checkout -b release/gutenberg
   ```

2. Create a changeset describing the release:

   ```bash
   pnpm run vc:changeset
   ```

3. Bump versions and generate changelogs:

   ```bash
   pnpm run vc:bump
   ```

   Commit the result: `git commit -m "chore: release vX.X.X"`

4. Open a pull request from the release branch into `main` and merge it.

5. Make sure you are logged in to npm before publishing:

   ```bash
   npm whoami   # should print your npm username
   # if not: npm login
   ```

6. From `main`, publish the packages:

   ```bash
   pnpm run vc:release
   ```

   This script will:
   - Verify your npm login (`npm:check-auth`)
   - Run the full quality gate: install, format, build, lint, check, test (`rtc`)
   - Publish all packages to npm (`changeset publish`)
   - Replace the per-package git tags with a single unified `vX.X.X` tag (`vc:retag`)

   Push the tag afterwards:

   ```bash
   git push && git push --tags
   ```

7. Create a GitHub Release from the tag.

### Package Versioning

The following packages are versioned together:

- `@ujl-framework/core`
- `@ujl-framework/crafter`
- `@ujl-framework/ui`
- `@ujl-framework/adapter-svelte`
- `@ujl-framework/adapter-web`
- `@ujl-framework/examples`
- `@ujl-framework/types`

## Development Guidelines

- [Testing Guidelines](./docs/testing.md), test infrastructure and best practices
- [Code Review Process](./docs/code-review.md), code review standards and workflow
- [Bundle Strategy](./docs/bundle-strategy.md), bundle architecture and performance decisions

## How We Work, Tooling Decisions

These are the internal technical choices that define how the project is built and tested. They're recorded here rather than in the public documentation because they're relevant to contributors, not to users of the framework.

**Language and type safety:** TypeScript with strict mode enabled across all packages (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`). Zod schemas are the source of truth for runtime validation and TypeScript types.

**UI framework:** Svelte 5 with Runes (`$state`, `$derived`) for the Crafter editor and the primary adapter. Chosen for its first-class Web Components support, compiler-optimized bundle size, and fine-grained reactivity.

**Package management:** pnpm workspaces. pnpm was chosen over Bun (better stability, full npm compatibility) and npm (disk space, workspace protocol). Package dependency layers are strict: types → core → ui → adapters → crafter.

**Version management:** Changesets. Chosen over Lerna for better DX, built-in changelog generation, and active maintenance.

**Unit and integration testing:** Vitest. Chosen for native Vite/ESM support and Jest-compatible API.

**E2E testing:** Playwright across Chrome, Firefox, and Safari. Required for testing real browser interactions (drag-and-drop, clipboard, keyboard shortcuts) that unit tests cannot cover reliably. Tests use `data-testid` attributes; these are stripped from production builds via Svelte's `dev` conditional.

**Documentation:** VitePress (this site). Chosen for Markdown-first authoring, fast HMR, and static output suitable for self-hosting.

**Rich text:** TipTap (ProseMirror wrapper). Content is stored as ProseMirror JSON, not HTML strings. A shared SSR-safe serializer ensures WYSIWYG fidelity between editor and renderer.

## Credits

UJL is built and maintained by [**mainzcript GbR**](https://mainzcript.eu), a software studio founded by **Marius Klein** and **Lukas Antoine**.

**Core team:**

- [Marius Klein](https://github.com/KLEINformat) — Co-Founder, Product & Architecture
- [Lukas Antoine](https://github.com/lantoine16) — Co-Founder, Infrastructure & Enablement
- [Nadine Denkhaus](https://github.com/ndnk27) — Founding Contributor. Co-developed the initial version of UJL, contributing significantly to the Crafter editor, module system, and adapter architecture.

**Community contributors:** Leon Scherer, Philipp Oehl, Ulla Suhare, Jannik Seus.
