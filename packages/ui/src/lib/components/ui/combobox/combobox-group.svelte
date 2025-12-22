<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { CommandGroup } from '../command/index.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		heading,
		value,
		...restProps
	}: CommandPrimitive.GroupProps & {
		heading?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<CommandGroup
	bind:ref
	data-slot="combobox-group"
	class={className}
	{heading}
	{value}
	{...restProps}
>
	{@render children?.()}
</CommandGroup>
