import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Custom matcher type declarations
declare module 'vitest' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface Assertion<T> {
		toBeValidNodeId(): this;
	}
	interface AsymmetricMatchersContaining {
		toBeValidNodeId(): this;
	}
}

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Custom matchers
expect.extend({
	toBeValidNodeId(received: string) {
		const pass = typeof received === 'string' && received.length === 10;
		return {
			pass,
			message: () => `expected ${received} to be a valid 10-character node ID`
		};
	}
});
