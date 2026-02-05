<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { getUjlThemeContext } from "../ujl-theme/context.js";

	let { ...restProps }: SonnerProps = $props();

	const themeContext = getUjlThemeContext();
	const isDark = $derived(themeContext ? themeContext.isDark : false);
	const theme = $derived(isDark ? "dark" : "light");
</script>

<Sonner class="toaster group" {theme} {...restProps} />
