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

### 1. Making Changes

1. Create a feature branch from `develop`
2. Make your changes
3. Test your changes thoroughly
4. Run linting and type checking:
   ```bash
   pnpm lint
   pnpm type-check
   ```

### 2. Adding Changesets

For any changes that should be released, add a changeset:

```bash
pnpm changeset
```

This will guide you through creating a changeset file that describes your changes.

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

# Update versions and changelogs
pnpm version-packages

# Publish packages
pnpm release
```

### Package Linking

The following packages are linked and versioned together:

- `@ujl/core`
- `@ujl/crafter`
- `@ujl/ui`
- `@ujl/examples`
