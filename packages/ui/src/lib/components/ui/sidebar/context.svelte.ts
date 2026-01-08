import { IsNarrow } from '$lib/hooks/is-narrow.svelte.js';
import { getContext, setContext } from 'svelte';
import { SIDEBAR_KEYBOARD_SHORTCUT } from './constants.js';

type Getter<T> = () => T;

export type SidebarStateProps = {
	/**
	 * A getter function that returns the current open state of the sidebar.
	 * We use a getter function here to support `bind:open` on the `Sidebar.Provider`
	 * component.
	 */
	open: Getter<boolean>;

	/**
	 * A function that sets the open state of the sidebar. To support `bind:open`, we need
	 * a source of truth for changing the open state to ensure it will be synced throughout
	 * the sub-components and any `bind:` references.
	 */
	setOpen: (open: boolean) => void;
};

class SidebarState {
	readonly props: SidebarStateProps;
	open = $derived.by(() => this.props.open());
	openNarrow = $state(false);
	setOpen: SidebarStateProps['setOpen'];
	#isNarrow: IsNarrow;
	#providerRef: HTMLElement | null = null;
	#breakpoint: number;
	state = $derived.by(() => (this.open ? 'expanded' : 'collapsed'));

	constructor(props: SidebarStateProps, breakpoint: number = 768) {
		this.setOpen = props.setOpen;
		this.#breakpoint = breakpoint;
		this.#isNarrow = new IsNarrow(breakpoint);
		this.props = props;
	}

	/**
	 * Update the breakpoint for narrow layout detection.
	 * This will disconnect and reconnect the observer if a provider ref is set.
	 */
	setBreakpoint(breakpoint: number) {
		if (this.#breakpoint === breakpoint) return;
		this.#breakpoint = breakpoint;
		const wasObserving = this.#providerRef !== null;
		if (wasObserving) {
			this.#isNarrow.disconnect();
		}
		this.#isNarrow = new IsNarrow(breakpoint);
		if (wasObserving && this.#providerRef) {
			this.#isNarrow.observe(this.#providerRef);
		}
	}

	/**
	 * Set the provider element reference to observe its width.
	 * This enables container-based breakpoint detection instead of viewport-based.
	 */
	setProviderRef(element: HTMLElement | null) {
		if (this.#providerRef) {
			this.#isNarrow.disconnect();
		}
		this.#providerRef = element;
		if (element) {
			this.#isNarrow.observe(element);
		}
	}

	/**
	 * Returns true if the container width is below the breakpoint (narrow layout).
	 * This is container-based, not viewport-based, making it suitable for nested layouts.
	 */
	get isNarrow() {
		return this.#isNarrow.current;
	}

	// Event handler to apply to the `<svelte:window>`
	handleShortcutKeydown = (e: KeyboardEvent) => {
		if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			this.toggle();
		}
	};

	setOpenNarrow = (value: boolean) => {
		this.openNarrow = value;
	};

	toggle = () => {
		return this.#isNarrow.current ? (this.openNarrow = !this.openNarrow) : this.setOpen(!this.open);
	};
}

const SYMBOL_KEY = 'scn-sidebar';

/**
 * Instantiates a new `SidebarState` instance and sets it in the context.
 *
 * @param props The constructor props for the `SidebarState` class.
 * @param breakpoint The breakpoint in pixels for narrow layout detection. Default: 768px
 * @returns  The `SidebarState` instance.
 */
export function setSidebar(props: SidebarStateProps, breakpoint: number = 768): SidebarState {
	const state = setContext(Symbol.for(SYMBOL_KEY), new SidebarState(props, breakpoint));
	return state;
}

/**
 * Retrieves the `SidebarState` instance from the context. This is a class instance,
 * so you cannot destructure it.
 * @returns The `SidebarState` instance.
 */
export function useSidebar(): SidebarState {
	return getContext(Symbol.for(SYMBOL_KEY));
}
