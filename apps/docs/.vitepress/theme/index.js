import DefaultTheme from "vitepress/theme";
import "./custom.css";
import CrafterDemo from "./components/CrafterDemo.vue";

export default {
	...DefaultTheme,
	enhanceApp({ app }) {
		// Register global components
		app.component("CrafterDemo", CrafterDemo);
	},
};
