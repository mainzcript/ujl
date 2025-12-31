import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
	plugins: [
		svelte({
			onwarn(warning, defaultHandler) {
				// Suppress customElement warning (we intentionally use per-component method)
				if (warning.code === 'options_missing_custom_element') {
					return;
				}
				defaultHandler(warning);
			}
		}),
		dts({
			insertTypesEntry: true,
			include: ['src/**/*'],
			exclude: ['src/**/*.test.*']
		})
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'UJLAdapterWeb',
			formats: ['es'],
			fileName: () => 'index.js'
		},
		rollupOptions: {
			// Bundle everything, including Svelte runtime (framework-agnostic bundle)
			external: []
		}
	}
});
