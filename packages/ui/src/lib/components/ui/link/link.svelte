<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
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
		...restProps // All other props
	} = $props();

	// Base styles for all links (hover and transition)
	const baseStyle = 'hover:opacity-80 duration-200';
	// Underline style if enabled
	const underlineStyle = underline ? 'underline underline-offset-4' : '';

	// Create a URL object from href, relative to the current page (browser only)
	let url = $derived(browser ? new URL(href, page.url) : null);

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

	// Active logic: link is active if host and path match, and (if present) the fragment is visible
	let active = $derived(
		browser && url
			? url.host === page.url.host &&
					url.pathname === page.url.pathname &&
					(!url.hash || hashActive)
			: false
	);

	// Choose the class based on whether the link is active
	const dynamicClass = $derived(active ? activeClass : inactiveClass);
</script>

<a
	{href}
	class={cn(baseStyle, underlineStyle, className, dynamicClass)}
	{...external ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
	{...restProps}
>
	{@render children?.()}
</a>
