import { getContext, setContext } from 'svelte';

type Getter<T> = () => T;

export type AppStateProps = {
	sidebarOpen: Getter<boolean>;
	setSidebarOpen: (open: boolean) => void;
	panelOpen: Getter<boolean>;
	setPanelOpen: (open: boolean) => void;
};

class AppState {
	readonly props: AppStateProps;

	sidebarOpen = $derived.by(() => this.props.sidebarOpen());
	sidebarSheetOpen = $state(false);
	panelOpen = $derived.by(() => this.props.panelOpen());
	panelDrawerOpen = $state(false);

	#sidebarEl: HTMLElement | null = null;
	#panelEl: HTMLElement | null = null;

	constructor(props: AppStateProps) {
		this.props = props;
	}

	preferSidebar = () => {
		this.props.setSidebarOpen(true);
	};

	requireSidebar = () => {
		if (this.#canShowSidebar()) {
			this.props.setSidebarOpen(true);
			this.sidebarSheetOpen = false;
		} else {
			this.sidebarSheetOpen = true;
		}
	};

	hideSidebar = () => {
		this.props.setSidebarOpen(false);
		this.sidebarSheetOpen = false;
	};

	toggleSidebar = () => {
		const isOpen = this.sidebarSheetOpen || this.sidebarOpen;
		if (isOpen) {
			this.hideSidebar();
		} else {
			this.requireSidebar();
		}
	};

	preferPanel = () => {
		if (this.#canShowPanel()) {
			this.props.setPanelOpen(true);
			this.panelDrawerOpen = false;
		}
	};

	requirePanel = () => {
		if (this.#canShowPanel()) {
			this.props.setPanelOpen(true);
			this.panelDrawerOpen = false;
		} else {
			this.panelDrawerOpen = true;
		}
	};

	hidePanel = () => {
		this.props.setPanelOpen(false);
		this.panelDrawerOpen = false;
	};

	togglePanel = () => {
		const isOpen = this.panelDrawerOpen || this.panelOpen;
		if (isOpen) {
			this.hidePanel();
		} else {
			this.requirePanel();
		}
	};

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

export function setApp(props: AppStateProps): AppState {
	return setContext(Symbol.for(SYMBOL_KEY), new AppState(props));
}

export function useApp(): AppState {
	return getContext(Symbol.for(SYMBOL_KEY));
}
