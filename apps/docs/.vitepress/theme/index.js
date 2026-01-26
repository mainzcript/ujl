import DefaultTheme from "vitepress/theme";
import "./custom.css";
import CrafterDemo from "./components/CrafterDemo.vue";
import { onMounted, onUnmounted } from "vue";

export default {
	...DefaultTheme,
	enhanceApp({ app }) {
		// Register global components
		app.component("CrafterDemo", CrafterDemo);
	},
	setup() {
		const openLightbox = mermaidEl => {
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
				<div class="mermaid-lightbox-hint">Klicken oder ESC zum Schließen</div>
			`;

			const handleKeydown = e => {
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
		const handleDocumentClick = event => {
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
