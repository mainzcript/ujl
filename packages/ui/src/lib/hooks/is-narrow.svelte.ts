/**
 * Hook to observe container width and determine if it's below a breakpoint.
 * This is container-based, not viewport-based, making it suitable for nested layouts.
 */
export class IsNarrow {
	#breakpoint: number;
	current = $state(false);
	#observer: ResizeObserver | null = null;

	constructor(breakpoint: number = 768) {
		this.#breakpoint = breakpoint;
	}

	/**
	 * Start observing an element's width.
	 * @param element The element to observe
	 */
	observe(element: HTMLElement) {
		// Disconnect previous observer if exists
		this.disconnect();

		this.#observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this.current = entry.contentRect.width < this.#breakpoint;
			}
		});
		this.#observer.observe(element);

		// Initial check
		this.current = element.offsetWidth < this.#breakpoint;
	}

	/**
	 * Stop observing and clean up.
	 */
	disconnect() {
		this.#observer?.disconnect();
		this.#observer = null;
	}
}
