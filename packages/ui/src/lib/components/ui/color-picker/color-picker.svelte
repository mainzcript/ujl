<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	interface ColorPickerProps extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		value?: string;
		onChange?: (value: string) => void;
		disabled?: boolean;
		id?: string;
	}

	let {
		ref = $bindable(null),
		value = $bindable('#000000'),
		onChange,
		disabled = false,
		id,
		class: className,
		...restProps
	}: ColorPickerProps = $props();

	let colorInputRef: HTMLInputElement | null = null;

	function handleButtonClick() {
		if (!disabled && colorInputRef) {
			colorInputRef.click();
		}
	}

	function handleColorChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value) {
			value = target.value;
			onChange?.(target.value);
		}
	}
</script>

<div bind:this={ref} class={cn('relative inline-flex', className)} {...restProps}>
	<input
		bind:this={colorInputRef}
		type="color"
		bind:value
		oninput={handleColorChange}
		class="pointer-events-none sr-only absolute inset-0 opacity-0"
		{id}
		{disabled}
	/>
	<button
		type="button"
		onclick={handleButtonClick}
		{disabled}
		class={cn(
			'border-input bg-input/15 text-foreground shadow-xs ring-offset-background selection:bg-primary selection:text-primary-foreground',
			'inline-flex h-9 w-full min-w-0 items-center gap-2 rounded-md border px-3 py-1 text-base outline-none',
			'transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
			'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
			'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
			'cursor-pointer',
			className
		)}
	>
		<div
			class="h-4 w-4 shrink-0 rounded border border-border"
			style="background-color: {value}"
		></div>
		<span class="truncate">{value.toUpperCase()}</span>
	</button>
</div>
