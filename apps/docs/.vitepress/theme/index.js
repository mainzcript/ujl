import DefaultTheme from "vitepress/theme";
import { onMounted, onUnmounted } from "vue";
import CrafterDemo from "./components/CrafterDemo.vue";
import CustomHero from "./components/CustomHero.vue";
import FeatureCard from "./components/FeatureCard.vue";
import FeatureGrid from "./components/FeatureGrid.vue";
import InstallCommand from "./components/InstallCommand.vue";
import "./custom.css";

export default {
	...DefaultTheme,

	enhanceApp({ app }) {
		app.component("CrafterDemo", CrafterDemo);
		app.component("CustomHero", CustomHero);
		app.component("FeatureCard", FeatureCard);
		app.component("FeatureGrid", FeatureGrid);
		app.component("InstallCommand", InstallCommand);
	},

	setup() {
		const openLightbox = (mermaidEl) => {
			const svg = mermaidEl.querySelector("svg");
			if (!svg) return;

			// Close existing lightbox to prevent multiple overlays
			document.querySelector(".mermaid-lightbox")?.remove();

			const lightbox = document.createElement("div");
			lightbox.className = "mermaid-lightbox";
			lightbox.setAttribute("role", "dialog");
			lightbox.setAttribute("aria-modal", "true");
			lightbox.setAttribute("aria-label", "Mermaid diagram zoom view");
			lightbox.innerHTML = `
				<div class="mermaid-lightbox-content">${svg.outerHTML}</div>
				<div class="mermaid-lightbox-hint">Click or press Esc to close</div>
			`;

			const handleKeydown = (e) => {
				if (e.key === "Escape") close();
			};

			const close = () => {
				lightbox.remove();
				document.removeEventListener("keydown", handleKeydown);
			};

			lightbox.addEventListener("click", close);
			document.addEventListener("keydown", handleKeydown);

			document.body.appendChild(lightbox);
		};

		// Event delegation avoids per-diagram listeners and works with async rendering
		const handleDocumentClick = (event) => {
			const target = event.target;

			// Preserve native link behavior in mermaid diagrams
			if (target?.closest?.("a")) return;

			const mermaidEl = target?.closest?.(".mermaid");
			if (!mermaidEl) return;

			openLightbox(mermaidEl);
		};

		onMounted(() => {
			document.addEventListener("click", handleDocumentClick);
		});

		onUnmounted(() => {
			document.removeEventListener("click", handleDocumentClick);
		});
	},
};
