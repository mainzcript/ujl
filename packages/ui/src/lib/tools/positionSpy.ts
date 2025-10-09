import { generateUUID } from '$lib/utils.js';

const THROTTLE_INTERVAL = 100;
const SMOOTHING_FACTOR = 2 * THROTTLE_INTERVAL;

/**
 * ROI (Region of Interest)
 * Describes an element's position, size, and visibility within the viewport.
 */
export interface ROI {
	x: number; // X-coordinate of the element's center (px relative to viewport)
	y: number; // Y-coordinate of the element's center (px relative to viewport)
	width: number; // Width of the element's bounding box (px)
	height: number; // Height of the element's bounding box (px)
	visibleRatio: number; // Proportion of the element's area visible in the viewport (0–1)
	screenRatio: number; // Proportion of the visible element area relative to the viewport area (0–1)
}

/**
 * Linearly interpolates between two values.
 * @param a  The starting value.
 * @param b  The ending value.
 * @param t  The interpolation factor (0 to 1).
 * @returns The interpolated value.
 */
function lerp(a: number, b: number, t: number): number {
	return a * (1 - t) + b * t;
}

/**
 * Default ROI values
 * Used for initialization and when no ROI is available.
 */
const defaultRoi: ROI = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	visibleRatio: 0,
	screenRatio: 0
};

/**
 * PositionSpy
 * Monitors individual elements and provides pull-based access to the latest ROI.
 */
export default class PositionSpy {
	// === Instance properties ===
	private readonly id: string;
	private readonly element: HTMLElement;
	private targetRoi: ROI = defaultRoi;
	private currentRoi: ROI = defaultRoi;
	private lastFrameTime: number = 0;
	private isConnectedValue: boolean = true;

	// === Static manager properties ===
	private static instances = new Map<string, PositionSpy>();
	private static running = false;
	private static updateScheduled = false;
	private static intervalId?: number;
	private static lastRequestTime = 0;
	private static throttleTimeoutId?: number;

	private static readonly onScroll = () => PositionSpy.requestUpdate();
	private static readonly onResize = () => PositionSpy.requestUpdate();

	/**
	 * Constructor: registers the instance and ensures global tracking starts with the first instance.
	 * @param element The HTML element to observe
	 */
	constructor(element: HTMLElement) {
		this.id = generateUUID();
		this.element = element;
		// Register this instance
		PositionSpy.instances.set(this.id, this);
		// Trigger an immediate update
		PositionSpy.requestUpdate();
		// Start global tracking if not already running
		PositionSpy.start();
	}

	/**
	 * getRoi: returns the latest calculated ROI for this element.
	 * @returns The current ROI, smoothed over time.
	 */
	public getRoi(): ROI {
		const now = performance.now();
		const dt = now - this.lastFrameTime;
		this.lastFrameTime = now;
		// exponential smoothing
		const alpha = 1 - Math.exp(-dt / SMOOTHING_FACTOR);

		this.currentRoi = {
			x: lerp(this.currentRoi.x, this.targetRoi.x, alpha),
			y: lerp(this.currentRoi.y, this.targetRoi.y, alpha),
			width: lerp(this.currentRoi.width, this.targetRoi.width, alpha),
			height: lerp(this.currentRoi.height, this.targetRoi.height, alpha),
			visibleRatio: lerp(this.currentRoi.visibleRatio, this.targetRoi.visibleRatio, alpha),
			screenRatio: lerp(this.currentRoi.screenRatio, this.targetRoi.screenRatio, alpha)
		};

		return this.currentRoi;
	}

	/**
	 * isConnected: returns whether the element is visible and connected.
	 * @returns Boolean indicating if the element is visible (not animated).
	 */
	public isConnected(): boolean {
		return this.isConnectedValue;
	}

	/**
	 * Dispose: removes this instance from tracking and stops global tracking if no instances remain.
	 */
	public dispose(): void {
		PositionSpy.instances.delete(this.id);
		if (PositionSpy.instances.size === 0) {
			PositionSpy.stop();
		}
	}

	/**
	 * Private update: calculates ROI and stores it in instance state.
	 */
	private update(): void {
		const rect = this.element.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const screenArea = viewportWidth * viewportHeight;
		const elemArea = rect.width * rect.height;

		// Check if element is actually visible (not hidden by CSS)
		const computedStyle = window.getComputedStyle(this.element);
		const isVisible =
			computedStyle.display !== 'none' &&
			computedStyle.visibility !== 'hidden' &&
			computedStyle.opacity !== '0' &&
			this.element.isConnected;

		// Update the non-animated isConnected value
		this.isConnectedValue = isVisible;

		// Calculate visible dimensions by clamping to viewport
		const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
		const visibleHeight = Math.max(
			0,
			Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
		);
		const visibleArea = visibleWidth * visibleHeight;

		this.targetRoi = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			width: rect.width,
			height: rect.height,
			visibleRatio: isVisible && elemArea > 0 ? visibleArea / elemArea : 0,
			screenRatio: isVisible && screenArea > 0 ? visibleArea / screenArea : 0
		};
	}

	// === Static methods for global control ===

	/**
	 * Start: initializes global tracking (scroll, resize, interval).
	 */
	public static start(): void {
		if (PositionSpy.running) return;
		PositionSpy.running = true;
		window.addEventListener('scroll', PositionSpy.onScroll, { passive: true });
		window.addEventListener('resize', PositionSpy.onResize);
		PositionSpy.intervalId = window.setInterval(() => PositionSpy.requestUpdate(), 1000);
	}

	/**
	 * Stop: halts global tracking when no instances remain.
	 */
	private static stop(): void {
		if (!PositionSpy.running) return;
		PositionSpy.running = false;
		window.removeEventListener('scroll', PositionSpy.onScroll);
		window.removeEventListener('resize', PositionSpy.onResize);
		if (PositionSpy.intervalId !== undefined) {
			clearInterval(PositionSpy.intervalId);
			PositionSpy.intervalId = undefined;
		}
		PositionSpy.updateScheduled = false;
	}

	/**
	 * requestUpdate: schedules a central update via requestAnimationFrame,
	 * throttled to max once every THROTTLE_INTERVAL milliseconds.
	 */
	private static requestUpdate(): void {
		if (!PositionSpy.running) return;
		const now = performance.now();
		const timeSinceLast = now - PositionSpy.lastRequestTime;
		const schedule = () => {
			PositionSpy.updateScheduled = true;
			PositionSpy.lastRequestTime = performance.now();
			requestAnimationFrame(() => {
				PositionSpy.updateScheduled = false;
				if (PositionSpy.running) {
					PositionSpy.updateAll();
				}
			});
		};

		if (timeSinceLast >= THROTTLE_INTERVAL) {
			schedule();
		} else if (!PositionSpy.updateScheduled) {
			if (PositionSpy.throttleTimeoutId !== undefined) {
				clearTimeout(PositionSpy.throttleTimeoutId);
			}
			PositionSpy.throttleTimeoutId = window.setTimeout(() => {
				schedule();
				PositionSpy.throttleTimeoutId = undefined;
			}, THROTTLE_INTERVAL - timeSinceLast);
		}
	}

	/**
	 * updateAll: invokes update() on all registered instances.
	 */
	private static updateAll(): void {
		PositionSpy.instances.forEach((spy) => spy.update());
	}
}
