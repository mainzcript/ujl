<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { CommandList } from '../command/index.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandList bind:ref data-slot="combobox-list" class={className} {...restProps} />
