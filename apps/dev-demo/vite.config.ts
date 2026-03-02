import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174, // Avoid conflict with Crafter dev server (5173)
		open: true,
	},
});
