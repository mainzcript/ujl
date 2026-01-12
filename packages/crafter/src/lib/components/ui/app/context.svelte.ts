import { getContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';

export type AppInitOptions = {
	initialSidebarOpen?: boolean;
	initialPanelOpen?: boolean;
};

class AppState {
	// Desktop States (internal reactive state)
	#sidebarOpen = $state<boolean>(true);
	#panelOpen = $state<boolean>(false);

	// Mobile States
	sidebarSheetOpen = $state(false);
	panelDrawerOpen = $state(false);

	// Callbacks
	#onPanelClose: (() => void) | null = null;
	#onSidebarClose: (() => void) | null = null;

	// Refs for visibility detection
	#sidebarEl: HTMLElement | null = null;
	#panelEl: HTMLElement | null = null;

	constructor(options?: AppInitOptions) {
		this.#sidebarOpen = options?.initialSidebarOpen ?? true;
		this.#panelOpen = options?.initialPanelOpen ?? false;
	}

	// Desktop States (getters)
	get sidebarOpen(): boolean {
		return this.#sidebarOpen;
	}

	get panelOpen(): boolean {
		return this.#panelOpen;
	}

	// Combined visibility (Desktop + Mobile)
	get isSidebarVisible(): boolean {
		return (this.#canShowSidebar() && this.#sidebarOpen) || this.sidebarSheetOpen;
	}

	get isPanelVisible(): boolean {
		return (this.#canShowPanel() && this.#panelOpen) || this.panelDrawerOpen;
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
		this.#sidebarOpen = true;
	};

	requireSidebar = () => {
		if (this.#canShowSidebar()) {
			this.#sidebarOpen = true;
			this.sidebarSheetOpen = false;
		} else {
			this.sidebarSheetOpen = true;
		}
	};

	hideSidebar = () => {
		this.#sidebarOpen = false;
		this.sidebarSheetOpen = false;
		this.#onSidebarClose?.();
	};

	toggleSidebar = () => {
		const isOpen = this.sidebarSheetOpen || this.#sidebarOpen;
		if (isOpen) {
			this.hideSidebar();
		} else {
			this.requireSidebar();
		}
	};

	// Panel methods
	preferPanel = () => {
		if (this.#canShowPanel()) {
			this.#panelOpen = true;
			this.panelDrawerOpen = false;
		}
	};

	requirePanel = () => {
		if (this.#canShowPanel()) {
			this.#panelOpen = true;
			this.panelDrawerOpen = false;
		} else {
			this.panelDrawerOpen = true;
		}
	};

	hidePanel = () => {
		this.#panelOpen = false;
		this.panelDrawerOpen = false;
		this.#onPanelClose?.();
	};

	togglePanel = () => {
		const isOpen = this.panelDrawerOpen || this.#panelOpen;
		if (isOpen) {
			this.hidePanel();
		} else {
			this.requirePanel();
		}
	};

	// Visibility detection
	#canShowSidebar(): boolean {
		return this.#sidebarEl !== null && getComputedStyle(this.#sidebarEl).display !== 'none';
	}

	#canShowPanel(): boolean {
		return this.#panelEl !== null && getComputedStyle(this.#panelEl).display !== 'none';
	}

	setSidebarRef(el: HTMLElement | null) {
		this.#sidebarEl = el;
	}

	setPanelRef(el: HTMLElement | null) {
		this.#panelEl = el;
	}
}

const SYMBOL_KEY = 'crafter-app';
const REGISTRY_KEY = 'crafter-app-registry';

export type AppSlot = 'logo' | 'header' | 'sidebar' | 'canvas' | 'panel';

/**
 * Registry for App component slots.
 * Allows child components to register their content, which is then rendered by App.
 */
class AppRegistry {
	#slots = $state<Record<AppSlot, Snippet | null>>({
		logo: null,
		header: null,
		sidebar: null,
		canvas: null,
		panel: null
	});

	/**
	 * Register content for a slot.
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
