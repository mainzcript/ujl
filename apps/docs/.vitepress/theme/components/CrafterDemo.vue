<template>
	<div id="ujl-crafter-container" class="ujl-crafter-wrapper"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
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

let crafter: InstanceType<typeof import("@ujl-framework/crafter").UJLCrafter> | null = null;

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
	} catch (error) {
		console.error("Failed to initialize UJL Crafter:", error);
	}
});

onBeforeUnmount(() => {
	// Only cleanup in browser
	if (typeof window === "undefined") return;

	if (crafter) {
		crafter.destroy();
		crafter = null;
	}
});
</script>

<style scoped>
.ujl-crafter-wrapper {
	width: 100%;
	height: 800px;
	max-height: 80vh;
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	overflow: hidden;
	background: var(--vp-c-bg);
}
</style>
