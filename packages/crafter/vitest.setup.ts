import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

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
