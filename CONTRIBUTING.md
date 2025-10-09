# Contributing to UJL Framework

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 8+

### Development Setup

```bash
# Clone the repository
git clone git@gitlab.rlp.net:ujl-framework/ujl.git
cd ujl

# Install dependencies
pnpm install

# Start development
pnpm ui:dev          # Start UI package development
pnpm ui:storybook    # Start Storybook for UI components
```

## Development Workflow

### Branch Strategy

We follow the **Gitflow** branching strategy:

- **`main`**: Production-ready releases only
- **`develop`**: Active development branch (default)
- **`feat/*`**: Feature branches from `develop`
- **`fix/*`**: Bug fix branches from `develop`

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

# Publish packages (DO NOT PUBLISH YET)
pnpm release
```

**Current Process:**

1. Changesets are created on feature branches and merged to `develop`
2. **Version bump** happens on `develop` branch with `pnpm version-packages`
3. **No publishing yet** - packages could be published manually to npm registry in the future using `pnpm release`
4. After version bump, merge `develop` → `main` (formality)

> **Note:** Currently, we only manage version numbers. No actual publishing to npm registry is configured yet.

### Package Linking

The following packages are linked and versioned together:

- `@ujl-framework/core`
- `@ujl-framework/crafter`
- `@ujl-framework/ui`
- `@ujl-framework/examples`
- `@ujl-framework/demo`
- `@ujl-framework/docs`
