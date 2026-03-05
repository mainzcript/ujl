<script lang="ts">
	import { onMount } from "svelte";
	import type { UJLCrafter } from "@ujl-framework/crafter";
	import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";

	onMount(() => {
		let crafter: UJLCrafter | null = null;
		let aborted = false;

		(async () => {
			const [{ UJLCrafter }, { showcaseDocument, defaultTheme }, { TestimonialModule }] =
				await Promise.all([
					import("@ujl-framework/crafter"),
					import("@ujl-framework/examples"),
					import("$lib/modules/testimonial.js"),
				]);

			if (aborted) return;

			const document = showcaseDocument as UJLCDocument;
			const theme = defaultTheme as UJLTDocument;

			crafter = new UJLCrafter({
				target: "#app",
				document,
				theme,
				modules: [new TestimonialModule()],
			});

			if (aborted) {
				crafter.destroy();
				return;
			}

			crafter.onDocumentChange((doc) => {
				console.log("[dev-demo] Document changed:", doc.ujlc.meta.title);
			});
			crafter.onThemeChange((theme) => {
				console.log("[dev-demo] Theme changed:", theme.ujlt.meta._version);
			});
			crafter.onNotification((type, message, description) => {
				console.log(`[dev-demo] Notification (${type}): ${message}`, description ?? "");
			});

			(globalThis as { crafter?: UJLCrafter }).crafter = crafter;
			console.log("[dev-demo] UJL Crafter initialized. Access via window.crafter in console.");
		})();

		return () => {
			aborted = true;
			crafter?.destroy();
		};
	});
</script>

<div id="app"></div>

<style>
	#app {
		height: 100vh;
		width: 100vw;
	}
</style>
