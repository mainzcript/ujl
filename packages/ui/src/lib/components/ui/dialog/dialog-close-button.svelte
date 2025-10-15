<script lang="ts">
	import { Button } from '../button/index.js';
	import { DialogClose } from './index.js';
	import { cn } from '$lib/utils.js';
	import type { ButtonProps } from '../button/button.svelte';

	let { children, class: className, ...buttonProps }: ButtonProps = $props();
</script>

<DialogClose>
	<Button as="div" {...buttonProps} class={cn('w-full', className)}>
		{@render children?.()}
	</Button>
</DialogClose>
