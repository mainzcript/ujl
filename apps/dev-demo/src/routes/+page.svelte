<script lang="ts">
	import { onMount } from "svelte";
	import type { UJLCrafter, LibraryOptions } from "@ujl-framework/crafter";
	import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";

	export let data: {
		libraryStorage: "inline" | "backend";
		libraryUrl: string | null;
		libraryError: string | null;
	};

	function getLibraryOptions(): LibraryOptions {
		if (data.libraryStorage === "backend" && data.libraryUrl) {
			return {
				provider: "backend",
				url: data.libraryUrl,
				requestAccessToken: async () => {
					const res = await fetch("/api/library-token");
					if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
					const { token } = (await res.json()) as { token: string };
					return token;
				},
			};
		}
		return { provider: "inline" };
	}

	onMount(() => {
		let crafter: UJLCrafter | null = null;
		let aborted = false;

		(async () => {
			const [
				{ UJLCrafter },
				{ backendLibraryDocument, defaultTheme, showcaseDocument },
				{ TestimonialModule },
			] = await Promise.all([
				import("@ujl-framework/crafter"),
				import("@ujl-framework/examples"),
				import("$lib/modules/testimonial.js"),
			]);

			if (aborted) return;

			// Select document based on library mode
			const isBackend = data.libraryStorage === "backend" && data.libraryUrl;
			const selectedDoc = isBackend ? backendLibraryDocument : showcaseDocument;
			const document = selectedDoc as UJLCDocument;
			const theme = defaultTheme as UJLTDocument;

			crafter = new UJLCrafter({
				target: "#app",
				document,
				theme,
				library: getLibraryOptions(),
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

{#if data.libraryError}
	<p class="library-error">{data.libraryError}</p>
{/if}
<div id="app"></div>

<style>
	.library-error {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: 0.5rem 1rem;
		background: #fef2f2;
		color: #b91c1c;
		font-size: 0.875rem;
		z-index: 100;
	}

	#app {
		height: 100vh;
		width: 100vw;
	}
</style>
