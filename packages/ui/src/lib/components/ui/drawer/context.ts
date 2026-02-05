import { getContext, hasContext, setContext } from "svelte";

const DRAWER_CONTEXT = Symbol.for("ujl:drawer-context");

/**
 * Direction of the drawer slide animation.
 */
export type DrawerDirection = "top" | "bottom" | "left" | "right";

/**
 * Context type for Drawer component.
 * Uses getter functions for reactive values (Svelte 5 best practice).
 */
export type DrawerContext = {
	/** Current open state of the drawer */
	get open(): boolean;
	/** Set the open state */
	setOpen: (open: boolean) => void;
	/** Toggle the open state */
	toggle: () => void;
	/** Direction of the drawer */
	direction: DrawerDirection;
	/** Whether to scale the background when drawer opens */
	shouldScaleBackground: boolean;
	/** Threshold (0-1) for closing the drawer via drag */
	closeThreshold: number;
	/** Timeout in ms after scrolling before drag gestures are re-enabled */
	scrollLockTimeout: number;
	/** Optional snap points for the drawer */
	snapPoints?: (number | string)[];
	/** Current active snap point */
	get activeSnapPoint(): number | string | null;
	/** Set the active snap point */
	setActiveSnapPoint: (point: number | string | null) => void;
	/** Whether this is a nested drawer */
	isNested: boolean;
};

/**
 * Sets the Drawer context for the current component tree.
 * @param context - Drawer context configuration
 * @returns The provided context
 */
export function setDrawerContext(context: DrawerContext): DrawerContext {
	setContext(DRAWER_CONTEXT, context);
	return context;
}

/**
 * Retrieves the Drawer context from the current component tree.
 * @returns Drawer context if available, undefined otherwise
 */
export function getDrawerContext(): DrawerContext | undefined {
	if (!hasContext(DRAWER_CONTEXT)) {
		return undefined;
	}
	return getContext<DrawerContext>(DRAWER_CONTEXT);
}

/**
 * Checks if the current component is within a Drawer context.
 * @returns true if within a Drawer, false otherwise
 */
export function hasDrawerContext(): boolean {
	return hasContext(DRAWER_CONTEXT);
}
