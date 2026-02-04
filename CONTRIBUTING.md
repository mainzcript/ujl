# Contributing to UJL Framework

## Getting Started

This repository is a **pnpm monorepo**. For the full setup guide (including the Crafter + dev-demo
and Library service), see:

- [Getting Started](./apps/docs/src/docs/01-getting-started.md)

### Development Setup (Quick)

```bash
# Clone the repository
git clone git@gitlab.mainzcript.eu:ujl-framework/ujl.git
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

## Development Workflow

### Branch Strategy

We follow a **GitFlow-lean** branching strategy:

- **`main`**: Production-ready releases only
- **`develop`**: Active development branch (default)
- **`feat/*`**: Feature branches from `develop`
- **`fix/*`**: Bug fix branches from `develop`
- **`release/*`**: Release preparation from `develop`
- **`hotfix/*`**: Urgent fixes from `main`

Further **rules** for branch names:

- Use lowercase letters and hyphens
- Keep descriptions concise but descriptive
- No special characters except hyphens

> Note: You will not be able to push branches which are not following the naming convention. `main` and `develop` branches are protected and cannot be pushed to directly.

### 1. Making Changes

1. Create a feature branch from `develop` following our naming convention
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
pnpm changeset
```

This will guide you through creating a changeset file that describes your changes.

> **Note:** Changesets are created on feature branches and merged to `develop`. They will be processed during the release process.

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
2. Create a pull request
3. Ensure all checks pass
4. Request review from maintainers

## Release Process

### Version Management

We use Changesets for version management:

```bash
# Add a changeset
pnpm changeset

# Update versions and changelogs (version bump)
pnpm version-packages

# Publish packages (manual, from main)
pnpm release
```

**Current Process:**

1. Changesets are created on `feature/*`/`fix/*` branches and merged to `develop`
2. Create a release branch from `develop` (e.g., `release/0.0.1`)
3. Run `pnpm version-packages` on the release branch (generates version bumps + `CHANGELOG.md`)
4. Merge `release/*` → `main`
5. Tag `main` (e.g., `v0.0.1`)
6. Publish from `main` using `pnpm release`
7. Merge `main` back into `develop`

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
