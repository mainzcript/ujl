import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.test.{js,ts}"],
		exclude: ["node_modules/**", "dist/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/*.test.ts",
				"**/mockData.ts",
				"src/tests/",
				"src/__tests__/",
				"dist/",
			],
		},
	},
	resolve: {
		alias: {
			$lib: resolve(__dirname, "./src/lib"),
		},
	},
});
