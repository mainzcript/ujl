import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env.VITEST,
			compilerOptions: {
				dev: true
			}
		})
	],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.test.{js,ts}'],
		// Exclude E2E tests (handled by Playwright)
		exclude: ['tests/e2e/**', 'node_modules/**'],
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
	},
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/lib')
		},
		// Use browser condition for tests to enable client-side Svelte
		conditions: ['browser', 'import', 'module', 'default']
	}
});
