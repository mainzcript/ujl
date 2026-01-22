<template>
	<div>
		<a href="#" class="fullscreen-link" @click.prevent="toggleFullscreen">
			{{ isFullscreen ? "← Vollbild beenden" : "Vollbild öffnen →" }}
		</a>
		<div
			id="ujl-crafter-container"
			class="ujl-crafter-wrapper"
			:class="{ fullscreen: isFullscreen }"
		>
			<button
				v-if="isFullscreen"
				class="close-button"
				@click="toggleFullscreen"
				aria-label="Vollbild schließen"
				title="Vollbild schließen (ESC)"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";
import { showcaseDocument, defaultTheme } from "@ujl-framework/examples";

// Font imports (required for Crafter UI)
import "@fontsource-variable/inter";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/roboto";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/oswald";
import "@fontsource-variable/raleway";
import "@fontsource-variable/merriweather";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/nunito-sans";
import "@fontsource-variable/jetbrains-mono";

const isFullscreen = ref(false);
let crafter = null;

const toggleFullscreen = () => {
	if (typeof window === "undefined") return;
	isFullscreen.value = !isFullscreen.value;
	if (isFullscreen.value) {
		document.body.style.overflow = "hidden";
	} else {
		document.body.style.overflow = "";
	}
};

const handleEscape = (event: KeyboardEvent) => {
	if (typeof window === "undefined") return;
	if (event.key === "Escape" && isFullscreen.value) {
		toggleFullscreen();
	}
};

onMounted(async () => {
	// Only initialize in browser (not during SSR)
	if (typeof window === "undefined") return;

	try {
		// Dynamically import Crafter to avoid SSR issues
		const { UJLCrafter } = await import("@ujl-framework/crafter");
		const document = showcaseDocument as unknown as UJLCDocument;
		const theme = defaultTheme as unknown as UJLTDocument;

		crafter = new UJLCrafter({
			target: "#ujl-crafter-container",
			document,
			theme,
			library: { storage: "inline" },
		});

		// Listen for ESC key
		window.addEventListener("keydown", handleEscape);
	} catch (error) {
		console.error("Failed to initialize UJL Crafter:", error);
	}
});

onBeforeUnmount(() => {
	// Only cleanup in browser
	if (typeof window === "undefined") return;

	// Remove ESC listener
	window.removeEventListener("keydown", handleEscape);

	// Reset body overflow
	if (document.body) {
		document.body.style.overflow = "";
	}

	if (crafter) {
		crafter.destroy();
		crafter = null;
	}
});
</script>

<style scoped>
.fullscreen-link {
	display: inline-block;
	margin-bottom: 1rem;
	color: var(--vp-c-brand);
	text-decoration: none;
	font-weight: 500;
	transition: opacity 0.2s;
}

.fullscreen-link:hover {
	opacity: 0.8;
	text-decoration: underline;
}

.ujl-crafter-wrapper {
	width: 100%;
	height: 800px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	overflow: hidden;
	background: var(--vp-c-bg);
	transition: all 0.3s ease;
}

.ujl-crafter-wrapper.fullscreen {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	border: none;
	border-radius: 0;
	z-index: 9999;
}

.close-button {
	position: absolute;
	top: 16px;
	right: 16px;
	z-index: 10000;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	padding: 0;
	border: 2px solid var(--vp-c-divider);
	border-radius: 8px;
	background: var(--vp-c-bg);
	color: var(--vp-c-text-1);
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.close-button:hover {
	background: var(--vp-c-bg-alt);
	border-color: var(--vp-c-brand);
	color: var(--vp-c-brand);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	transform: scale(1.05);
}

.close-button:active {
	transform: scale(0.95);
}

.close-button svg {
	width: 20px;
	height: 20px;
}

/* Ensure full height on mobile */
@media (max-width: 768px) {
	.ujl-crafter-wrapper {
		height: 600px;
	}
}
</style>
