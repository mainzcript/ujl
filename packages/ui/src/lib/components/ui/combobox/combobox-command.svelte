<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { Command } from '../command/index.js';
	import type { CommandRootApi } from '../command/command.svelte';

	export type ComboboxCommandApi = CommandRootApi;

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		children,
		...restProps
	}: Omit<CommandPrimitive.RootProps, 'api'> & {
		children?: import('svelte').Snippet;
	} = $props();
</script>

<Command bind:value bind:ref data-slot="combobox-command" class={className} {...restProps}>
	{@render children?.()}
</Command>
