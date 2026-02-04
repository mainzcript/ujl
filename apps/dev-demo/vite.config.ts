import { defineConfig } from "vite";

export default defineConfig({
	// Dev server configuration
	server: {
		port: 5174, // Avoid conflict with Crafter dev server (5173)
		open: true,
	},

	// Build configuration
	build: {
		outDir: "dist",
		sourcemap: true,
	},
});
