<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: ComponentProps<typeof Textarea> = $props();
</script>

<Textarea
	bind:ref
	data-slot="input-group-control"
	class={cn(
		'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
		'[&.elevation]:!border-0 [&.elevation]:!bg-transparent [&.elevation]:before:!hidden [&.elevation]:after:!hidden',
		'[&.elevation]:!inset-shadow-none [&.elevation]:!shadow-none [&.elevation]:!backdrop-brightness-100 [&.elevation]:!backdrop-saturate-100',
		className
	)}
	bind:value
	{...props}
/>
