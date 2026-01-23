import DefaultTheme from "vitepress/theme";
import "./custom.css";
import CrafterDemo from "./components/CrafterDemo.vue";
import { onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vitepress";

export default {
	...DefaultTheme,
	enhanceApp({ app }) {
		// Register global components
		app.component("CrafterDemo", CrafterDemo);
	},
	setup() {
		const route = useRoute();

		const openLightbox = event => {
			const mermaidEl = event.currentTarget;
			const svg = mermaidEl.querySelector("svg");
			if (!svg) return;

			const lightbox = document.createElement("div");
			lightbox.className = "mermaid-lightbox";
			lightbox.innerHTML = `
				<div class="mermaid-lightbox-content">${svg.outerHTML}</div>
				<div class="mermaid-lightbox-hint">Klicken oder ESC zum Schließen</div>
			`;

			const close = () => lightbox.remove();
			lightbox.addEventListener("click", close);

			const handleKeydown = e => {
				if (e.key === "Escape") {
					close();
					document.removeEventListener("keydown", handleKeydown);
				}
			};
			document.addEventListener("keydown", handleKeydown);

			document.body.appendChild(lightbox);
		};
import CrafterDemo from "./components/CrafterDemo.vue";

		const setupMermaidClickHandlers = () => {
			document.querySelectorAll(".mermaid").forEach(el => {
				el.removeEventListener("click", openLightbox);
				el.addEventListener("click", openLightbox);
			});
		};

		const renderMermaid = async () => {
			await nextTick();
			const mermaid = (await import("mermaid")).default;
			mermaid.initialize({ startOnLoad: false });
			await mermaid.run();
			setupMermaidClickHandlers();
		};

		onMounted(() => {
			renderMermaid();
		});

		onUnmounted(() => {
			document.querySelectorAll(".mermaid").forEach(el => {
				el.removeEventListener("click", openLightbox);
			});
		});

		watch(
			() => route.path,
			() => {
				renderMermaid();
			}
		);
	},
};
