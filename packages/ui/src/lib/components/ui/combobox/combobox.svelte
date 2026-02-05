<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { setComboboxContext } from "./context.js";

	let {
		open = $bindable(false),
		value = $bindable(""),
		children,
		...restProps
	}: PopoverPrimitive.RootProps & {
		open?: boolean;
		value?: string;
		children?: import("svelte").Snippet;
	} = $props();

	setComboboxContext({
		get value() {
			return value;
		},
		set value(newValue: string) {
			value = newValue;
		},
		get open() {
			return open;
		},
		set open(newOpen: boolean) {
			open = newOpen;
		},
	});
</script>

<PopoverPrimitive.Root bind:open {...restProps}>
	{@render children?.()}
</PopoverPrimitive.Root>
