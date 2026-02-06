<script lang="ts">
	import { getContext } from "svelte";
	import PositionSpy from "$lib/utils/positionSpy.js";
	import { cn } from "$lib/utils.js";

	let {
		class: className = "",
		activeClass = "",
		inactiveClass = "",
		children,
		href = "#",
		external = false,
		underline = false,
		currentUrl,
		active,
		...restProps
	} = $props();

	const contextUrl = getContext<{ url: URL }>("ujl:url");
	const effectiveUrl = $derived(currentUrl ?? contextUrl?.url);

	const browser = typeof window !== "undefined";

	const baseStyle =
		"hover:opacity-80 duration-200 text-flavor-foreground-accent font-(--typography-link-weight)";
	const underlineStyle = $derived(
		underline !== undefined
			? underline
				? "underline underline-offset-4"
				: ""
			: "[text-decoration:var(--typography-link-decoration)]",
	);

	let url = $derived(browser ? new URL(href, effectiveUrl ?? window.location.href) : null);

	let hashActive: boolean = $state(false);

	$effect(() => {
		if (url?.hash) {
			const element = document.getElementById(url.hash.slice(1));
			if (element) {
				const posSpy = new PositionSpy(element);
				const updateInterval = setInterval(() => {
					const roi = posSpy.getRoi();
					hashActive = roi ? roi.visibleRatio > 0.9 || roi.screenRatio > 0.5 : false;
				}, 200);
				return () => {
					posSpy.dispose();
					clearInterval(updateInterval);
				};
			}
		}
	});

	let computedActive = $derived(
		active !== undefined
			? active
			: browser && url && effectiveUrl
				? url.host === effectiveUrl.host &&
					url.pathname === effectiveUrl.pathname &&
					(!url.hash || hashActive)
				: false,
	);

	const dynamicClass = $derived(computedActive ? activeClass : inactiveClass);
</script>

<a
	{href}
	class={cn(baseStyle, underlineStyle, className, dynamicClass)}
	{...external ? { target: "_blank", rel: "noopener noreferrer" } : {}}
	{...restProps}
>
	{@render children?.()}
</a>
