import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
	addons: [
		"@storybook/addon-svelte-csf",
		"@chromatic-com/storybook",
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		// '@storybook/addon-vitest' // requires vitest.setup.ts - configure later
	],
	framework: {
		name: "@storybook/sveltekit",
		options: {},
	},
};
export default config;
