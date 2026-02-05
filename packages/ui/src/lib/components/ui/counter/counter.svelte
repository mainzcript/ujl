<script lang="ts">
	import { onMount, onDestroy, tick } from "svelte";

	// Declare props
	export let className = "";
	export let prefix = "";
	export let suffix = "";
	export let end = 999;
	export let start = 0;
	export let duration = 0.5;
	export let delay = 0;
	export let decimals = 0;
	export let triggerOnce = false;

	let count = start;
	let observer: IntersectionObserver | null = null;
	let counterRef: HTMLElement | null = null;
	let inView = false;
	let hasAnimated = false;

	// IntersectionObserver for scroll-triggering
	onMount(() => {
		if (counterRef) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						inView = true;
						animateCount();
						if (triggerOnce) {
							observer?.disconnect();
						}
					}
				},
				{ threshold: 0.75 },
			);
			observer.observe(counterRef);
		}
	});

	// Counter animation
	async function animateCount() {
		if (!inView || (triggerOnce && hasAnimated)) return;

		if (delay > 0) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		const steps = Math.ceil(duration * 100);
		const increment = (end - start) / steps;
		let current = start;

		for (let i = 0; i < steps; i++) {
			current += increment;
			count = parseFloat(current.toFixed(decimals));
			await tick(); // Forces a re-render in Svelte
			await new Promise((resolve) => setTimeout(resolve, 10));
		}

		count = parseFloat(end.toFixed(decimals));
		if (triggerOnce) {
			hasAnimated = true;
		}
	}

	onDestroy(() => {
		observer?.disconnect();
	});
</script>

<span bind:this={counterRef} class={className}>
	{prefix}{count}{suffix}
</span>
