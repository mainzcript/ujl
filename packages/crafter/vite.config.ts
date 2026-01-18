import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ command }) => {
	const isDev = command === 'serve';

	return {
		// Dev server uses src/dev/index.html as entry
		root: isDev ? 'src/dev' : undefined,
		publicDir: isDev ? '../../static' : 'static',

		resolve: {
			alias: {
				$lib: path.resolve(__dirname, 'src/lib')
			}
		},

		plugins: [
			tailwindcss(),
			svelte({
				onwarn(warning, defaultHandler) {
					// Suppress a11y warnings in library build (handled by consumer)
					if (warning.code?.startsWith('a11y-')) {
						return;
					}
					defaultHandler(warning);
				}
			}),
			// Only generate types during build
			...(isDev
				? []
				: [
						dts({
							insertTypesEntry: true,
							include: ['src/lib/**/*'],
							exclude: ['src/**/*.test.*', 'src/dev/**/*']
						})
					])
		],

		// Library build configuration (only for production build)
		build: {
			lib: {
				entry: path.resolve(__dirname, 'src/lib/index.ts'),
				name: 'UJLCrafter',
				formats: ['es'],
				fileName: () => 'index.js'
			},
			rollupOptions: {
				// Bundle everything, including Svelte runtime (framework-agnostic bundle)
				external: []
			},
			// CSS is injected into Shadow DOM via ?inline import, no separate CSS file needed
			cssCodeSplit: false
		},
		css: {
			// Prevent CSS extraction - styles are bundled inline for Shadow DOM
			extract: false
		}
	};
});
