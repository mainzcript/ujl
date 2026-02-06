# Testing Guidelines - UJL Framework

These guidelines describe the unified patterns and best practices for tests in the UJL Framework monorepo.

## Overview

The UJL Framework uses a two-tier testing strategy:

- **Unit/Integration Tests**: Vitest (fast, no browser required)
- **E2E Tests**: Playwright (browser-based, full application testing)

The configuration is package-specific but follows a unified standard.

## Test Structure

All tests use the unified pattern `*.test.ts`. The test type is determined by location:

```
packages/<package>/               # Core packages
├── src/                          # Source code + Unit tests
│   └── **/*.test.ts              # Unit tests (co-located with code)
└── tests/                        # Dedicated test folder
    ├── e2e/                      # E2E tests (Playwright)
    │   └── **/*.test.ts
    ├── integration/              # Integration tests (if needed)
    │   └── **/*.test.ts
    └── mockData.ts               # Shared test utilities

services/<service>/               # Backend services (e.g., services/library)
├── src/                          # Source code + Unit tests
│   └── **/*.test.ts
└── tests/                        # E2E/Integration tests if present

apps/<app>/                       # Applications (docs, demos)
└── tests/                        # App-specific tests if present
```

### Unit Tests

- **Location**: Directly next to the code being tested in `src/`
- **Pattern**: `*.test.ts` next to the corresponding `*.ts` file
- **Example**: `src/utils/helper.ts` → `src/utils/helper.test.ts`

### Integration Tests

Currently, there are no dedicated integration tests in the repository. Tests that combine multiple modules (e.g., `crafter-store.test.ts`) are co-located with the code and run together with unit tests via Vitest.

If dedicated integration tests become necessary (e.g., for database connections or external services), they should be placed in:

- **Location**: `tests/integration/` within the respective package
- **Pattern**: `*.test.ts`

### E2E Tests

- **Location**: `tests/e2e/` within the respective package (e.g., `packages/crafter/tests/e2e/`)
- **Framework**: Playwright
- **Pattern**: `*.test.ts`
- **Usage**: For end-to-end tests that test the entire application

## Test Scripts

### Script Naming Convention

| Script | Description | Scope |
|--------|-------------|-------|
| `test` | Run all tests (Unit + E2E where available) | All packages |
| `test:unit` | Run only Vitest tests | Packages with tests |
| `test:unit:watch` | Vitest in watch mode | Development |
| `test:unit:coverage` | Vitest with coverage report | Optional |
| `test:e2e` | Run only Playwright tests | Packages with E2E tests |

### Packages with Unit Tests Only

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage",
    "test": "vitest run"
  }
}
```

### Packages with Unit + E2E Tests (crafter)

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test": "vitest run && playwright test"
  }
}
```

### Root-Level Scripts

```json
{
  "scripts": {
    "test:unit": "pnpm -r --if-present run test:unit",
    "test:e2e": "pnpm -r --if-present run test:e2e",
    "test": "pnpm run test:unit && pnpm run test:e2e"
  }
}
```

### Running Tests in a Specific Package or Service

From the repo root, use pnpm filters to target a single workspace:

```bash
# Example: Crafter package
pnpm --filter @ujl-framework/crafter test

# Example: Library service
pnpm --filter @ujl-framework/library test
```

## RTC (Ready to Commit)

Before committing changes, run the full quality check:

```bash
pnpm rtc
```

This executes:

1. `pnpm install` - Update dependencies
2. `pnpm run format` - Format code with Prettier
3. `pnpm run build` - Build all packages
4. `pnpm run lint` - Run linters
5. `pnpm run check` - TypeScript/Svelte type checks
6. `pnpm run test` - Run all tests (Unit + E2E)

For a faster check without tests (useful during development):

```bash
pnpm rtc:lite
```

## CI/CD Integration

The CI pipeline (GitHub Actions) runs tests automatically once configured:

| Job | Stage | Description |
|-----|-------|-------------|
| `test_unit` | test | Vitest tests across all packages |
| `test_e2e` | test | Playwright E2E tests (crafter) |
| `quality_check` | quality | Linting + Type checks |

### E2E Tests in CI

- Run in a dedicated Playwright Docker image with pre-installed browsers
- Test artifacts (screenshots, videos, reports) are stored for 1 week
- Only run on merge requests and main/develop branches

### Test Artifacts

E2E test failures produce:

- `packages/*/test-results/` - Test results and traces
- `packages/*/playwright-report/` - HTML report

## Vitest Configuration

### Standard Template

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node', // or "jsdom" for UI tests
		setupFiles: ['./vitest.setup.ts'], // optional
		include: ['src/**/*.test.{js,ts}'],
		exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/*.test.ts',
				'**/mockData.ts',
				'tests/',
				'dist/'
			]
		}
	}
});
```

### Package-Specific Adjustments

- **Node Packages** (`types`, `core`, `examples`): `environment: "node"`
- **UI Packages** (`adapter-svelte`, `crafter`): `environment: "jsdom"`
- **Path Aliases**: Packages with Svelte can use `$lib` aliases
- **Setup Files**: Optional `vitest.setup.ts` in package root

## Setup Files

### Standard Path

- **Location**: `vitest.setup.ts` in package root
- **Content**: Package-specific
  - **UI Packages** (Svelte): `@testing-library/jest-dom`, `@testing-library/svelte` for component testing
  - **Node Packages**: Custom matchers, cleanup functions (if needed)

### Test Utilities

- **Location**: `src/tests/`
- **Usage**: Mock data factories, shared test helpers

## Test Code Structure

### Recommended Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
// ... further imports

describe('ComponentName', () => {
	describe('methodName', () => {
		describe('valid inputs', () => {
			it('should handle valid input correctly', () => {
				// Arrange
				const input = createValidInput();

				// Act
				const result = component.methodName(input);

				// Assert
				expect(result).toBe(expected);
			});
		});

		describe('invalid inputs', () => {
			it('should reject invalid input', () => {
				// ...
			});
		});

		describe('edge cases', () => {
			it('should handle edge case', () => {
				// ...
			});
		});
	});
});
```

### Best Practices

1. **Isolation**: Each test runs in isolation (cleanup after each test)
2. **Immutability**: Tests verify that original data remains unchanged
3. **Edge Cases**: Test empty inputs, non-existent data, boundary values
4. **Mock Data**: Use consistent mock factories for reproducible tests
5. **AAA Pattern**: Arrange-Act-Assert structure for clarity

## Code Style

### Prettier

- Test files are automatically formatted by Prettier
- Quote style follows package-specific configuration (see `.prettierrc` in each package)
  - Most packages use single quotes (`'`)
  - Some packages (e.g., `packages/types`) use double quotes (`"`)
  - This is intentional and package-specific for consistency within each package
- Import organization is automatically handled by `prettier-plugin-organize-imports`

### ESLint

- Test files follow the same ESLint rules as production code
- `globals: true` in Vitest config enables use of `describe`, `it`, `expect` without imports

## Coverage

### Standard Excludes

- `node_modules/`
- `**/*.d.ts` (Type definitions)
- `**/*.config.*` (Config files)
- `**/*.test.ts` (Test files themselves)
- `**/mockData.ts` (Test data)
- `tests/` (Dedicated test folder including E2E and utilities)
- `dist/` (Build output)

### Reports

- **Text**: Console output
- **JSON**: Machine-readable
- **HTML**: Interactive browser report

## Package-Specific Details

### `packages/types`

- Tests next to code (`*.test.ts`)
- Validator tests for UJLC and UJLT schemas

### `packages/core`

- Tests next to code (`*.test.ts`)
- Field and module tests

### `packages/adapter-svelte`

- Tests next to code (`*.test.ts`)
- UI component tests with jsdom
- Uses Testing Library for Svelte component testing (when needed)

### `packages/crafter`

- Unit tests next to code (`*.test.ts`)
- E2E tests in `tests/e2e/` (Playwright)
- Setup file: `vitest.setup.ts` (includes Testing Library for Svelte components)
- Test utilities: `tests/mockData.ts`

### `packages/examples`

- Tests next to code (`*.test.ts`)
- Integration tests for example documents

## Shared Test Utilities

### Current Situation

- **`packages/crafter`**: Has `tests/mockData.ts` with mock factories (`createMockNode`, `createMockTree`, etc.)
- **Other packages**: Use package-specific test data or minimal, self-defined test objects

### Recommendation

- **Package-Specific Utilities**: Mock data factories remain package-specific, as they are tailored to the respective package types
- **No Shared Package**: A shared test utilities package is currently not needed, as:
  - No cyclic dependencies should arise
  - Packages have different mock requirements
  - Current solutions are sufficient

### Best Practices for Mock Data

- Use factory functions for consistent test data
- Avoid external dependencies to other packages (except `@ujl-framework/types`)
- Define minimal, self-defined test objects directly in test files when possible

## Quick Reference

### Local Development

```bash
# Run all tests
pnpm test

# Run only unit tests (fast)
pnpm test:unit

# Run only E2E tests
pnpm test:e2e

# Watch mode for unit tests (in specific package)
cd packages/crafter && pnpm test:unit:watch

# Full quality check before commit
pnpm rtc
```

### In a Specific Package

```bash
cd packages/crafter

# Unit tests only
pnpm test:unit

# E2E tests only
pnpm test:e2e

# All tests
pnpm test
```

## Further Information

- [Vitest Documentation](https://vitest.dev/) - Used for unit and integration tests
- [Testing Library Documentation](https://testing-library.com/) - Used for UI component testing
- [Playwright Documentation](https://playwright.dev/) - Used for E2E tests
