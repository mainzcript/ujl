<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { CommandSeparator } from "../command/index.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.SeparatorProps = $props();
</script>

<CommandSeparator bind:ref data-slot="combobox-separator" class={className} {...restProps} />
