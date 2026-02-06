import type { Snippet } from "svelte";
import { getContext, setContext } from "svelte";
import { BREAKPOINT_PANEL_DESKTOP, BREAKPOINT_SIDEBAR_DESKTOP } from "./constants.js";

export type AppInitOptions = {
	initialSidebarOpen?: boolean;
	initialPanelOpen?: boolean;
};

class AppState {
	// Desktop States (internal reactive state)
	#sidebarDesktopOpen = $state<boolean>(true);
	#panelDesktopOpen = $state<boolean>(false);

	// Mobile States
	sidebarSheetOpen = $state(false);
	panelDrawerOpen = $state(false);

	// Callbacks
	#onPanelClose: (() => void) | null = null;
	#onSidebarClose: (() => void) | null = null;

	// Container width for responsive breakpoint detection
	#containerWidth = $state(0);

	constructor(options?: AppInitOptions) {
		this.#sidebarDesktopOpen = options?.initialSidebarOpen ?? true;
		this.#panelDesktopOpen = options?.initialPanelOpen ?? false;
	}

	// Desktop States (getters)
	// NOTE: These are internal states. Consumers should use isSidebarVisible/isPanelVisible instead.
	/**
	 * @internal Internal state for desktop sidebar. Use `isSidebarVisible` for consumer code.
	 */
	get sidebarDesktopOpen(): boolean {
		return this.#sidebarDesktopOpen;
	}

	/**
	 * @internal Internal state for desktop panel. Use `isPanelVisible` for consumer code.
	 */
	get panelDesktopOpen(): boolean {
		return this.#panelDesktopOpen;
	}

	// Breakpoint detection (derived from container width)
	get isDesktopSidebar(): boolean {
		return this.#containerWidth >= BREAKPOINT_SIDEBAR_DESKTOP;
	}

	get isDesktopPanel(): boolean {
		return this.#containerWidth >= BREAKPOINT_PANEL_DESKTOP;
	}

	// Combined visibility (Desktop + Mobile)
	/**
	 * Returns true if the sidebar is currently visible (either as desktop sidebar or mobile sheet).
	 * This is the recommended API for consumers - it abstracts away desktop/mobile differences.
	 */
	get isSidebarVisible(): boolean {
		return (this.isDesktopSidebar && this.#sidebarDesktopOpen) || this.sidebarSheetOpen;
	}

	/**
	 * Returns true if the panel is currently visible (either as desktop panel or mobile drawer).
	 * This is the recommended API for consumers - it abstracts away desktop/mobile differences.
	 */
	get isPanelVisible(): boolean {
		return (this.isDesktopPanel && this.#panelDesktopOpen) || this.panelDrawerOpen;
	}

	// Callback registration
	onPanelClose(callback: () => void): () => void {
		this.#onPanelClose = callback;
		return () => {
			this.#onPanelClose = null;
		};
	}

	onSidebarClose(callback: () => void): () => void {
		this.#onSidebarClose = callback;
		return () => {
			this.#onSidebarClose = null;
		};
	}

	// Sidebar methods
	preferSidebar = () => {
		this.#sidebarDesktopOpen = true;
	};

	requireSidebar = () => {
		if (this.isDesktopSidebar) {
			this.#sidebarDesktopOpen = true;
			this.sidebarSheetOpen = false;
		} else {
			this.sidebarSheetOpen = true;
		}
	};

	hideSidebar = () => {
		this.#sidebarDesktopOpen = false;
		this.sidebarSheetOpen = false;
		this.#onSidebarClose?.();
	};

	toggleSidebar = () => {
		if (this.isSidebarVisible) {
			this.hideSidebar();
		} else {
			this.requireSidebar();
		}
	};

	// Panel methods
	preferPanel = () => {
		if (this.isDesktopPanel) {
			this.#panelDesktopOpen = true;
			this.panelDrawerOpen = false;
		}
	};

	requirePanel = () => {
		if (this.isDesktopPanel) {
			this.#panelDesktopOpen = true;
			this.panelDrawerOpen = false;
		} else {
			this.panelDrawerOpen = true;
		}
	};

	hidePanel = () => {
		this.#panelDesktopOpen = false;
		this.panelDrawerOpen = false;
		this.#onPanelClose?.();
	};

	togglePanel = () => {
		if (this.isPanelVisible) {
			this.hidePanel();
		} else {
			this.requirePanel();
		}
	};

	// Container width setter (called by ResizeObserver)
	setContainerWidth(width: number) {
		this.#containerWidth = width;
	}
}

const SYMBOL_KEY = "crafter-app";
const REGISTRY_KEY = "crafter-app-registry";

export type AppSlot = "logo" | "header" | "sidebar" | "canvas" | "panel";

/**
 * Registry for App component slots.
 * Uses a registry pattern to decouple slot registration from rendering,
 * allowing child components to register content without direct parent-child coupling.
 */
class AppRegistry {
	#slots = $state<Record<AppSlot, Snippet | null>>({
		logo: null,
		header: null,
		sidebar: null,
		canvas: null,
		panel: null,
	});

	/**
	 * Register content for a slot.
	 * Returns a cleanup function to unregister, ensuring proper cleanup when components unmount.
	 * @returns Cleanup function to unregister
	 */
	register(slot: AppSlot, content: Snippet): () => void {
		this.#slots[slot] = content;
		return () => {
			// Only unregister if this is still the current content
			if (this.#slots[slot] === content) {
				this.#slots[slot] = null;
			}
		};
	}

	get logo(): Snippet | null {
		return this.#slots.logo;
	}

	get header(): Snippet | null {
		return this.#slots.header;
	}

	get sidebar(): Snippet | null {
		return this.#slots.sidebar;
	}

	get canvas(): Snippet | null {
		return this.#slots.canvas;
	}

	get panel(): Snippet | null {
		return this.#slots.panel;
	}
}

export function setApp(options?: AppInitOptions): AppState {
	return setContext(Symbol.for(SYMBOL_KEY), new AppState(options));
}

export function useApp(): AppState {
	return getContext(Symbol.for(SYMBOL_KEY));
}

export function setAppRegistry(): AppRegistry {
	return setContext(Symbol.for(REGISTRY_KEY), new AppRegistry());
}

export function useAppRegistry(): AppRegistry {
	return getContext(Symbol.for(REGISTRY_KEY));
}
