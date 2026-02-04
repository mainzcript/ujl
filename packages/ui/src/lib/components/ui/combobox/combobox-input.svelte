<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { CommandInput } from "../command/index.js";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<CommandInput bind:ref bind:value data-slot="combobox-input" class={className} {...restProps} />
