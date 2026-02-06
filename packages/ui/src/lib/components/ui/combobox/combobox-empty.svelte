<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { CommandEmpty } from "../command/index.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.EmptyProps = $props();
</script>

<CommandEmpty bind:ref data-slot="combobox-empty" class={className} {...restProps} />
