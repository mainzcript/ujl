import type { Preview } from "@storybook/sveltekit";
import "../src/lib/styles/index.css";
import ThemeDecorator from "./ThemeDecorator.svelte";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			disable: true,
		},
	},
	// @ts-expect-error Known Storybook bug with Svelte 5 decorators: https://github.com/storybookjs/storybook/issues/29951
	decorators: [() => ThemeDecorator],
};

export default preview;
