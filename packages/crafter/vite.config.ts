import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ command, mode }) => {
	const isDev = command === "serve";
	const isAnalyze = mode === "analyze";

	return {
		// Dev server uses src/dev/index.html as entry
		root: isDev ? "src/dev" : undefined,
		publicDir: isDev ? "../../static" : "static",

		resolve: {
			alias: {
				$lib: path.resolve(__dirname, "src/lib"),
			},
		},

		plugins: [
			tailwindcss(),
			svelte({
				onwarn(warning, defaultHandler) {
					// Suppress a11y warnings in library build (handled by consumer)
					if (warning.code?.startsWith("a11y-")) {
						return;
					}
					// Suppress customElement warning - we intentionally use per-component method
					// Only ujl-crafter-element.svelte is a Custom Element, others are normal components
					if (warning.code === "options_missing_custom_element") {
						return;
					}
					defaultHandler(warning);
				},
			}),
			// Only generate types during build
			...(isDev
				? []
				: [
						dts({
							insertTypesEntry: true,
							include: ["src/lib/**/*"],
							exclude: ["src/**/*.test.*", "src/dev/**/*"],
						}),
					]),
			// Bundle analyzer (only in analyze mode)
			...(isAnalyze
				? [
						visualizer({
							filename: "stats.html",
							open: true,
							gzipSize: true,
							brotliSize: true,
						}),
					]
				: []),
		],

		// Library build configuration (only for production build)
		build: {
			lib: {
				entry: path.resolve(__dirname, "src/lib/index.ts"),
				name: "UJLCrafter",
				formats: ["es"],
				fileName: () => "index.js",
			},
			rollupOptions: {
				// Bundle everything, including Svelte runtime (framework-agnostic bundle)
				// Note: manualChunks is not used for library builds as the entire bundle
				// must be loaded anyway. Code-splitting only makes sense for applications.
				external: [],
			},
			// CSS is injected into Shadow DOM via ?inline import, no separate CSS file needed
			cssCodeSplit: false,
		},
		css: {
			// Prevent CSS extraction - styles are bundled inline for Shadow DOM
			extract: false,
		},
	};
});
