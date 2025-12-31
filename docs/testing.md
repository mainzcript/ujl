# Testing Guidelines - UJL Framework

These guidelines describe the unified patterns and best practices for tests in the UJL Framework monorepo.

## Overview

All packages use **Vitest** as the test framework. The configuration is package-specific but follows a unified standard.

## Test Structure

### Unit Tests

- **Location**: Directly next to the code being tested
- **Pattern**: `*.test.ts` next to the corresponding `*.ts` file
- **Example**: `src/utils/helper.ts` → `src/utils/helper.test.ts`

### Integration Tests

- **Location**: Centralized in `src/__tests__/integration/`
- **Usage**: For tests that combine multiple modules or external dependencies

### E2E Tests

- **Location**: Separated in `e2e/` (e.g., `packages/crafter/e2e/`)
- **Framework**: Playwright (when available)
- **Usage**: For end-to-end tests that test the entire application

## Test Scripts

All packages have unified NPM scripts:

```json
{
	"scripts": {
		"test": "vitest run", // Single execution (for CI)
		"test:watch": "vitest", // Watch mode (for development)
		"test:ui": "vitest --ui", // Interactive UI (optional)
		"test:coverage": "vitest run --coverage" // Coverage report (optional)
	}
}
```

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
		exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/*.test.ts',
				'**/mockData.ts',
				'src/tests/',
				'src/__tests__/',
				'e2e/',
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
- `src/tests/`, `src/__tests__/` (Test utilities)
- `e2e/` (E2E tests)
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
- E2E tests in `e2e/` (Playwright)
- Setup file: `vitest.setup.ts` (includes Testing Library for Svelte components)
- Test utilities: `src/tests/mockData.ts`

### `packages/examples`

- Tests next to code (`*.test.ts`)
- Integration tests for example documents

## Shared Test Utilities

### Current Situation

- **`packages/crafter`**: Has `src/tests/mockData.ts` with mock factories (`createMockNode`, `createMockTree`, etc.)
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

## Further Information

- [Vitest Documentation](https://vitest.dev/) - Used for unit and integration tests
- [Testing Library Documentation](https://testing-library.com/) - Used for UI component testing
- [Playwright Documentation](https://playwright.dev/) - Used for E2E tests
