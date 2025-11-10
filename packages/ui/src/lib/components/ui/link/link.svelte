<script lang="ts">
	import { getContext } from 'svelte';
	import PositionSpy from '$lib/tools/positionSpy.js';
	import { cn } from '$lib/utils.js';

	let {
		class: className = '', // Additional CSS classes
		activeClass = '', // Class when link is active
		inactiveClass = '', // Class when link is inactive
		children, // Slot content (render function)
		href = '#', // Link target
		external = false, // Open in new tab if true
		underline = false, // Underline style if true
		currentUrl, // Optional: URL object for current page
		active, // Optional: explicit active state
		...restProps // All other props
	} = $props();

	// Optional: Context support for ujl:url
	const contextUrl = getContext<{ url: URL }>('ujl:url');
	const effectiveUrl = currentUrl ?? contextUrl?.url;

	// Browser detection (SSR-safe)
	const browser = typeof window !== 'undefined';

	// Base styles for all links (hover and transition)
	const baseStyle = 'hover:opacity-80 duration-200';
	// Underline style if enabled
	const underlineStyle = underline ? 'underline underline-offset-4' : '';

	// URL resolution: currentUrl from Props/Context, otherwise window.location as fallback
	let url = $derived(browser ? new URL(href, effectiveUrl ?? window.location.href) : null);

	// State: is the hash target (fragment) currently visible?
	let hashActive: boolean = $state(false);

	// Effect: If the link has a hash, track the visibility of the target element
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

	// Active state: explicitly passed or automatically calculated
	let computedActive = $derived(
		active !== undefined
			? active
			: browser && url && effectiveUrl
				? url.host === effectiveUrl.host &&
					url.pathname === effectiveUrl.pathname &&
					(!url.hash || hashActive)
				: false
	);

	// Choose the class based on whether the link is active
	const dynamicClass = $derived(computedActive ? activeClass : inactiveClass);
</script>

<a
	{href}
	class={cn(baseStyle, underlineStyle, className, dynamicClass)}
	{...external ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
	{...restProps}
>
	{@render children?.()}
</a>
