import { generateUid } from "@ujl-framework/core";

export type CarouselOptions = {
	targetItemWidth: number;
	enableDrag?: boolean;
};

export type CarouselRecord = {
	wrapper: HTMLElement;
	item: HTMLElement;
	id: string;
};

export const DEFAULT_OPTIONS: CarouselOptions = {
	targetItemWidth: 350,
	enableDrag: true,
};

export type CarouselState = {
	itemCount: number;
	perView: number;
	scroll: number;
	maxScroll: number;
	progress: number;
	canScrollNext: boolean;
	canScrollPrev: boolean;
	firstActiveIndex: number;
	lastActiveIndex: number;
	currentIndex: number;
};

export type CarouselUpdateHandler = {
	id: string;
	handler: (state: CarouselState) => void;
};

export class Carousel {
	private wrapper: HTMLElement;
	public options: CarouselOptions = DEFAULT_OPTIONS;
	private records: CarouselRecord[] = [];
	private updateHandlers: CarouselUpdateHandler[] = [];
	private perView: number = 1; // the number of items visible at once (based on the target item width)
	private itemWidth: number = 0; // the actual width of the items
	private spacing: number = 0; // the spacing between the items
	private resizePending: boolean = false;
	private scrollPending: boolean = false;
	private resizeObserver: ResizeObserver | null;
	private state: CarouselState = {
		itemCount: 0,
		perView: 1,
		scroll: 0,
		maxScroll: 0,
		progress: 0,
		canScrollPrev: false,
		canScrollNext: false,
		firstActiveIndex: 0,
		lastActiveIndex: 0,
		currentIndex: 0,
	};

	private rafId: number | null = null; // requested animation frame id

	private isDragging = false;
	private dragStartX = 0;
	private dragStartScroll = 0;

	constructor(wrapper: HTMLElement, options?: Partial<CarouselOptions>) {
		this.wrapper = wrapper;
		this.options = { ...DEFAULT_OPTIONS, ...options };

		this.resizeObserver = new ResizeObserver(this.onResize);
		this.resizeObserver.observe(this.wrapper);
		this.wrapper.addEventListener("scroll", this.onScroll);

		this.wrapper.addEventListener("mousedown", this.onMouseDown);
		window.addEventListener("mousemove", this.onMouseMove);
		window.addEventListener("mouseup", this.dragEnd);
		window.addEventListener("mouseleave", this.dragEnd);
	}

	public scrollTo(index: number): boolean {
		const record = this.records[index];
		if (record) {
			let leftIndex = index;
			if (this.perView > 1) {
				leftIndex = index - Math.floor(this.perView / 2);
				if (this.perView % 2 === 0) {
					leftIndex++;
				}
			}

			this.wrapper.scrollTo({
				left: leftIndex * this.itemWidth,
				behavior: "smooth",
			});
			return true;
		}
		return false;
	}

	public scrollNext(): boolean {
		return this.scrollTo(Math.min(this.state.currentIndex + this.perView, this.records.length - 1));
	}

	public scrollPrev(): boolean {
		return this.scrollTo(Math.max(this.state.currentIndex - this.perView, 0));
	}

	private snapToNearestItem(): void {
		const nearestIndex = this.state.currentIndex;
		this.scrollTo(nearestIndex);
	}

	private toggleSnap(enabled: boolean): void {
		this.wrapper.style.scrollSnapType = enabled ? "x mandatory" : "none";
	}

	public registerItem(wrapper: HTMLElement, item: HTMLElement): string {
		const id = generateUid();
		this.records.push({ wrapper, item, id });
		this.onResize();
		return id;
	}

	public unregisterItem(id: string) {
		this.records = this.records.filter((record) => record.id !== id);
		this.onResize();
	}

	public registerUpdateHandler(handler: (state: CarouselState) => void): string {
		const id = generateUid();
		this.updateHandlers.push({ id, handler });
		return id;
	}

	public unregisterUpdateHandler(id: string) {
		this.updateHandlers = this.updateHandlers.filter((h) => h.id !== id);
	}

	private schedule() {
		if (!this.rafId) this.rafId = requestAnimationFrame(this.update.bind(this));
	}

	private onResize = (): void => {
		if (!this.resizePending) {
			this.resizePending = true;
			this.schedule();
		}
	};

	private onScroll = (): void => {
		if (!this.scrollPending) {
			this.scrollPending = true;
			this.schedule();
		}
	};

	private onMouseDown = (event: MouseEvent): void => {
		if (!this.options.enableDrag || event.button !== 0) return;
		const target = event.target as Element;
		const isInteractiveElement =
			target.closest(
				"a, button, input, textarea, select, [contenteditable], p, span, h1, h2, h3, h4, h5, h6",
			) !== null;

		if (isInteractiveElement) {
			return;
		}

		this.dragStartX = event.clientX;
		this.dragStartScroll = this.wrapper.scrollLeft;
		this.isDragging = true;
		this.toggleSnap(false);
		event.preventDefault();
	};

	private onMouseMove = (event: MouseEvent): void => {
		if (!this.isDragging) return;
		const deltaX = event.clientX - this.dragStartX;
		const newScroll = this.dragStartScroll - deltaX;
		this.wrapper.scrollLeft = Math.max(
			0,
			Math.min(newScroll, this.wrapper.scrollWidth - this.wrapper.clientWidth),
		);
	};

	private dragEnd = (): void => {
		if (this.isDragging) {
			this.snapToNearestItem();
		}
		this.isDragging = false;
		this.toggleSnap(true);
	};

	private update(): void {
		this.rafId = null;

		if (this.resizePending) {
			this.calculateItemSizes();

			this.records.forEach((record) => {
				record.wrapper.style.width = `${this.itemWidth}px`;
			});

			requestAnimationFrame(() => {
				this.onScroll();
				this.snapToNearestItem();
			});

			this.resizePending = false;
		}

		if (this.scrollPending) {
			this.updateScrollState();
			this.applyTransforms();
			this.scrollPending = false;
		}

		this.updateHandlers.forEach((handler) => {
			handler.handler(this.state);
		});
	}

	private calculateItemSizes(): void {
		const placeholderStart = this.wrapper.querySelector(
			'[data-slot="carousel-placeholder-start"]',
		) as HTMLElement;
		const placeholder = placeholderStart ? placeholderStart.offsetWidth : 0;

		const w = this.wrapper.clientWidth - 2 * placeholder;
		let perView = Math.floor(w / this.options.targetItemWidth);
		perView = Math.min(perView, this.records.length);
		perView = Math.max(perView, 1);
		this.perView = perView;
		this.itemWidth = w / perView;
	}

	updateScrollState(): void {
		const maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
		const scroll = this.wrapper.scrollLeft;
		const progress = scroll / maxScroll;

		const firstActiveIndex = Math.round((scroll + 1) / this.itemWidth);
		const lastActiveIndex = firstActiveIndex + this.perView - 1;
		const canScrollPrev = firstActiveIndex > 0;
		const canScrollNext = lastActiveIndex < this.records.length - 1;

		let currentIndex = 0;
		if (this.records.length % 2 === 0) {
			currentIndex = Math.floor((firstActiveIndex + lastActiveIndex) / 2);
		} else {
			currentIndex = Math.round((firstActiveIndex + lastActiveIndex) / 2);
		}

		this.state = {
			...this.state,
			itemCount: this.records.length,
			perView: this.perView,
			scroll,
			maxScroll,
			progress,
			canScrollPrev,
			canScrollNext,
			firstActiveIndex,
			lastActiveIndex,
			currentIndex,
		};
	}

	private applyTransforms() {
		const minScale = 0.7;
		const minOpacity = 0;

		this.records.forEach((record, index) => {
			const pxBehind = Math.max(0, this.state.scroll - index * this.itemWidth);
			const pxAhead = Math.max(0, (index - this.perView + 1) * this.itemWidth - this.state.scroll);
			const distance = Math.max(pxBehind, pxAhead);

			const scale = Math.max(minScale, 1 - (distance / this.itemWidth) * (1 - minScale));
			const opacity = Math.max(minOpacity, 1 - (distance / this.itemWidth) * (1 - minOpacity));

			record.item.style.transform = `scale(${scale})`;
			record.item.style.opacity = opacity.toString();
		});
	}

	destroy() {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		window.removeEventListener("resize", this.onResize);
		this.wrapper.removeEventListener("scroll", this.onScroll);

		this.wrapper.removeEventListener("mousedown", this.onMouseDown);
		window.removeEventListener("mousemove", this.onMouseMove);
		window.removeEventListener("mouseup", this.dragEnd);
		window.removeEventListener("mouseleave", this.dragEnd);

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		this.records = [];
		this.resizePending = false;
		this.scrollPending = false;
	}
}
