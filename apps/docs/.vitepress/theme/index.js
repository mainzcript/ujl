import DefaultTheme from "vitepress/theme";
import "./custom.css";
import { onMounted } from "vue";

export default {
	...DefaultTheme,
	setup() {
		onMounted(async () => {
			const mermaid = (await import("mermaid")).default;
			mermaid.initialize({ startOnLoad: false });
			await mermaid.run();
		});
	},
};
