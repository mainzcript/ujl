# Contributing to UJL Framework

## Getting Started

This repository is a **pnpm monorepo**. For the full setup guide (including the Crafter + dev-demo
and Library service), see:

- [Installation & Integration](./apps/docs/src/docs/02-installation.md)

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

Further **rules** for branch names:

- Use lowercase letters and hyphens
- Keep descriptions concise but descriptive
- No special characters except hyphens

> Note: `main` is protected and cannot be pushed to directly. All changes go through pull requests.

### 1. Making Changes

1. Create a feature branch from `main` following our naming convention
2. Make your changes
3. Test your changes thoroughly
4. Run linting and type checking:
   ```bash
   pnpm lint
   pnpm check
   ```

### 2. Adding Changesets

For any changes that should be released, add a changeset:

```bash
pnpm run vc:changeset
```

This will guide you through creating a changeset file that describes your changes.

> **Note:** Changesets are created on feature branches and merged to `main`. They will be processed during the release process.
> You can also run `pnpm changeset` directly - `vc:changeset` is a thin wrapper.

### 3. Committing Changes

We follow conventional commits:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 4. Pull Request

1. Push your branch
2. Create a pull request targeting `main`
3. Ensure all checks pass
4. Request review from maintainers
5. Merge using **squash**

## Release Process

### Version Management

We use Changesets for version management:

```bash
# Add a changeset
pnpm run vc:changeset

# Update versions and changelogs (version bump)
pnpm run vc:bump

# Publish packages (manual, from main)
pnpm run vc:release
```

**Release Workflow:**

1. **During development:** Changesets are created on `feature/*`/`fix/*` branches and merged to `main`
2. **When ready to release:** Run `pnpm run vc:bump` on `main` (generates version bumps + `CHANGELOG.md`)
3. **Commit and tag:** Commit the version changes and create a git tag (e.g., `git tag v0.0.2`)
4. **Publish to npm:** Run `pnpm run vc:release` (runs full quality checks, builds, tests, then publishes to npmjs.org)
5. **Document the release:** Create a GitHub Release from the tag

> **Note:** The first public release `0.0.1` uses a single consolidated Changeset that summarizes the current state of the framework.

### Package Linking

The following packages are versioned together (fixed):

- `@ujl-framework/core`
- `@ujl-framework/crafter`
- `@ujl-framework/ui`
- `@ujl-framework/adapter-svelte`
- `@ujl-framework/adapter-web`
- `@ujl-framework/examples`
- `@ujl-framework/types`

## Development Guidelines

For detailed guidelines, see the [docs/](./docs/) directory:

- [Testing Guidelines](./docs/testing.md) - Test infrastructure and best practices
- [Code Review Process](./docs/code-review.md) - Code review standards and workflow
