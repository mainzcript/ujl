<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { getUjlThemeContext } from '../ujl-theme/context.js';
	import { getDrawerContext } from './context.js';
	import DrawerOverlay from './drawer-overlay.svelte';

	interface DrawerContentProps extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		class?: string;
		children?: Snippet;
		/** Props for the portal wrapper */
		portalProps?: { to?: HTMLElement | string };
	}

	let {
		ref = $bindable(null),
		class: className,
		children,
		portalProps,
		...restProps
	}: DrawerContentProps = $props();

	const themeContext = getUjlThemeContext();
	const drawerContext = getDrawerContext();

	const themeId = $derived(themeContext?.themeId ?? null);
	const isDark = $derived(themeContext ? themeContext.isDark : false);
	const portalTarget = $derived(themeContext?.portalContainer ?? undefined);

	// Drag state
	let isDragging = $state(false);
	let dragStart = $state(0);
	let currentDelta = $state(0);
	let contentRef: HTMLDivElement | null = $state(null);
	let lastScrollTime = $state(0);

	// Derived values
	const direction = $derived(drawerContext?.direction ?? 'bottom');
	const isVertical = $derived(direction === 'top' || direction === 'bottom');
	const closeThreshold = $derived(drawerContext?.closeThreshold ?? 0.5);
	const scrollLockTimeout = $derived(drawerContext?.scrollLockTimeout ?? 500);
	const isOpen = $derived(drawerContext?.open ?? false);

	// Only allow positive drag in the "close" direction
	const effectiveDelta = $derived.by(() => {
		if (direction === 'bottom') return Math.max(0, currentDelta);
		if (direction === 'top') return Math.min(0, currentDelta);
		if (direction === 'right') return Math.max(0, currentDelta);
		if (direction === 'left') return Math.min(0, currentDelta);
		return currentDelta;
	});

	// Compute transform style (single-source-of-truth)
	// We animate via CSS transition on the SAME transform property:
	// - base translate: open -> 0%, closed -> +/-100% (depending on direction)
	// - drag translate: px offset while dragging (effectiveDelta)
	const baseTranslate = $derived.by(() => {
		if (isOpen) return '0%';
		switch (direction) {
			case 'bottom':
			case 'right':
				return '100%';
			case 'top':
			case 'left':
				return '-100%';
			default:
				return '100%';
		}
	});

	const dragTranslatePx = $derived.by(() => (isDragging ? effectiveDelta : 0));

	const transformStyle = $derived.by(() => {
		if (isVertical) {
			return `transform: translateY(calc(${baseTranslate} + ${dragTranslatePx}px));`;
		}
		return `transform: translateX(calc(${baseTranslate} + ${dragTranslatePx}px));`;
	});

	// Transition style (disable during drag to avoid “rubber band”)
	const transitionClasses = $derived(
		isDragging ? 'transition-none' : 'transition-transform duration-[240ms] ease-out'
	);

	/**
	 * Check if the pointer event started on an interactive element.
	 * In that case, we don't want to start dragging.
	 */
	function isInteractiveElement(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'];
		if (interactiveTags.includes(target.tagName)) return true;
		if (target.closest('button, input, textarea, select, a, [role="button"]')) return true;
		return false;
	}

	/**
	 * Check if scroll lock is active (user recently scrolled).
	 */
	function isScrollLocked(): boolean {
		return Date.now() - lastScrollTime < scrollLockTimeout;
	}

	/**
	 * Handle pointer down - start of potential drag gesture.
	 */
	function handlePointerDown(event: PointerEvent) {
		if (!isOpen) return;
		if (isInteractiveElement(event.target)) return;
		if (isScrollLocked()) return;

		isDragging = true;
		dragStart = isVertical ? event.clientY : event.clientX;
		currentDelta = 0;

		// Capture pointer for reliable tracking even outside the element
		(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
	}

	/**
	 * Handle pointer move - update drag position.
	 */
	function handlePointerMove(event: PointerEvent) {
		if (!isDragging) return;

		const current = isVertical ? event.clientY : event.clientX;
		currentDelta = current - dragStart;
	}

	/**
	 * Handle pointer up - end of drag gesture.
	 */
	function handlePointerUp(event: PointerEvent) {
		if (!isDragging) return;

		// Release pointer capture
		(event.currentTarget as HTMLElement)?.releasePointerCapture(event.pointerId);

		// Check if we should close the drawer
		const drawerSize = isVertical
			? (contentRef?.offsetHeight ?? 300)
			: (contentRef?.offsetWidth ?? 300);
		const percentage = Math.abs(effectiveDelta) / drawerSize;

		if (percentage > closeThreshold) {
			// Close the drawer
			drawerContext?.setOpen(false);
		}

		// Reset drag state
		isDragging = false;
		currentDelta = 0;
	}

	/**
	 * Handle pointer cancel - abort drag gesture.
	 */
	function handlePointerCancel(event: PointerEvent) {
		(event.currentTarget as HTMLElement)?.releasePointerCapture(event.pointerId);
		isDragging = false;
		currentDelta = 0;
	}

	/**
	 * Handle scroll on content - activate scroll lock to prevent drag interference.
	 */
	function handleScroll() {
		lastScrollTime = Date.now();
	}

	// Sync ref bindings
	$effect(() => {
		ref = contentRef;
	});

	// Direction-specific CSS classes
	const directionClasses = $derived.by(() => {
		switch (direction) {
			case 'top':
				return 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg';
			case 'bottom':
				return 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg';
			case 'left':
				return 'inset-y-0 left-0 w-3/4 sm:max-w-sm';
			case 'right':
				return 'inset-y-0 right-0 w-3/4 sm:max-w-sm';
			default:
				return '';
		}
	});
</script>

<DialogPrimitive.Portal to={portalTarget} {...portalProps}>
	<DrawerOverlay />
	<div
		bind:this={contentRef}
		role="dialog"
		aria-modal={isOpen}
		aria-hidden={!isOpen}
		inert={!isOpen}
		data-slot="drawer-content"
		data-ujl-theme={themeId}
		data-ujl-drawer-direction={direction}
		data-ujl-drawer-dragging={isDragging ? 'true' : undefined}
		data-state={isOpen ? 'open' : 'closed'}
		class={cn(
			isDark && 'dark',
			'bg-ambient/95 text-ambient-foreground outline outline-foreground/10 backdrop-blur-sm',
			'group/drawer-content fixed z-50 flex h-auto flex-col will-change-transform',
			'data-[state=closed]:pointer-events-none',
			transitionClasses,
			directionClasses,
			className
		)}
		style={transformStyle}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
		onscroll={handleScroll}
		{...restProps}
	>
		<!-- Drag handle indicator for bottom drawer -->
		{#if direction === 'bottom'}
			<div class="mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full bg-foreground/10"></div>
		{/if}
		{@render children?.()}
	</div>
</DialogPrimitive.Portal>
