<script lang="ts">
	import type { Snippet } from "svelte";
	import { setDrawerContext, type DrawerDirection } from "./context.js";

	interface DrawerProps {
		/** Whether the drawer is open (bindable) */
		open?: boolean;
		/** Active snap point (bindable) */
		activeSnapPoint?: number | string | null;
		/** Direction of the drawer */
		direction?: DrawerDirection;
		/** Whether to scale the background when drawer opens */
		shouldScaleBackground?: boolean;
		/** Threshold (0-1) for closing the drawer via drag */
		closeThreshold?: number;
		/** Timeout in ms after scrolling before drag gestures are re-enabled */
		scrollLockTimeout?: number;
		/** Optional snap points for the drawer */
		snapPoints?: (number | string)[];
		/** Callback when open state changes */
		onOpenChange?: (open: boolean) => void;
		/** Children snippet */
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		activeSnapPoint = $bindable(null),
		direction = "bottom",
		shouldScaleBackground = true,
		closeThreshold = 0.5,
		scrollLockTimeout = 500,
		snapPoints,
		onOpenChange,
		children,
	}: DrawerProps = $props();

	// Capture initial values for context (these are not expected to change at runtime)
	// svelte-ignore state_referenced_locally
	const initialDirection = direction;
	// svelte-ignore state_referenced_locally
	const initialShouldScaleBackground = shouldScaleBackground;
	// svelte-ignore state_referenced_locally
	const initialCloseThreshold = closeThreshold;
	// svelte-ignore state_referenced_locally
	const initialScrollLockTimeout = scrollLockTimeout;
	// svelte-ignore state_referenced_locally
	const initialSnapPoints = snapPoints;

	// Handle scroll lock on body when drawer opens
	$effect(() => {
		if (typeof document === "undefined") return;

		if (open) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	// Handle background scaling
	$effect(() => {
		if (typeof document === "undefined" || !initialShouldScaleBackground) return;

		const wrapper = document.querySelector("[data-ujl-drawer-wrapper]") as HTMLElement | null;
		if (!wrapper) return;

		if (open) {
			wrapper.style.transform = "scale(0.95)";
			wrapper.style.transformOrigin = "center";
			wrapper.style.transition = "transform 0.3s ease";
			return () => {
				wrapper.style.transform = "";
				wrapper.style.transformOrigin = "";
				wrapper.style.transition = "";
			};
		}
	});

	// Handle ESC key to close
	$effect(() => {
		if (typeof window === "undefined") return;

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === "Escape" && open) {
				open = false;
				onOpenChange?.(false);
			}
		}

		window.addEventListener("keydown", handleKeydown);
		return () => window.removeEventListener("keydown", handleKeydown);
	});

	// Notify parent of open state changes
	$effect(() => {
		onOpenChange?.(open);
	});

	// Set up context for child components
	setDrawerContext({
		get open() {
			return open;
		},
		setOpen: (value: boolean) => {
			open = value;
		},
		toggle: () => {
			open = !open;
		},
		direction: initialDirection,
		shouldScaleBackground: initialShouldScaleBackground,
		closeThreshold: initialCloseThreshold,
		scrollLockTimeout: initialScrollLockTimeout,
		snapPoints: initialSnapPoints,
		get activeSnapPoint() {
			return activeSnapPoint;
		},
		setActiveSnapPoint: (point: number | string | null) => {
			activeSnapPoint = point;
		},
		isNested: false,
	});
</script>

{@render children?.()}
