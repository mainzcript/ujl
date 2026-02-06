import type { UJLCSlotObject } from "@ujl-framework/types";

/**
 * Configuration options for a slot
 *
 * Defines constraints on slot items (containers for modules).
 * Each slot item can hold unlimited modules, but the slot
 * can limit the number of slot items allowed.
 */
export type SlotConfig = {
	/** Maximum number of slot items allowed (0 = unlimited) */
	max: number;
	/** Human-readable display name for the slot */
	label: string;
	/** Help text or description for content creators */
	description: string;
};

/**
 * Slot class for handling slot data processing
 *
 * Manages constraints on slot items (not individual modules).
 * Each slot item can contain unlimited modules, but the slot
 * can limit how many slot items are allowed.
 */
export class Slot {
	/** User-provided configuration options */
	private _options: Partial<SlotConfig>;

	/** Default configuration that can be overridden */
	protected static readonly defaultConfig: SlotConfig = {
		max: 1,
		label: "Body",
		description: "Main content area for child modules",
	};

	/**
	 * Create a new slot instance with optional configuration
	 * @param options - Partial configuration to override defaults
	 */
	constructor(options: Partial<SlotConfig> = {}) {
		this._options = options;
	}

	/**
	 * Parse a raw UJL slot value into the expected format
	 * A simple wrapper around the fit method until now to stay in sync with the rest of the library.
	 * @param raw - Raw slot value from UJL document
	 * @returns Parsed slot data (validated and fitted)
	 */
	public parse(raw: UJLCSlotObject): UJLCSlotObject {
		return this.fit(raw);
	}

	/**
	 * Fit a slot to constraints (trimming, etc.)
	 * @param slotData - Validated slot data to fit to constraints
	 * @returns Fitted slot data
	 */
	public fit(slotData: UJLCSlotObject): UJLCSlotObject {
		// Apply max constraint if set
		if (this.config.max > 0 && slotData.length > this.config.max) {
			return slotData.slice(0, this.config.max);
		}

		return slotData;
	}

	/**
	 * Check if this slot can accept additional slot items
	 * @param slotItemCount - Current number of slot items (not modules)
	 * @returns True if slot can accept more slot items
	 */
	public canAccept(slotItemCount: number): boolean {
		if (this.config.max === 0) {
			return true; // Unlimited
		}
		return slotItemCount < this.config.max;
	}

	/**
	 * Get remaining capacity for slot items
	 * @param slotItemCount - Current number of slot items (not modules)
	 * @returns Number of additional slot items that can be added
	 */
	public getRemainingCapacity(slotItemCount: number): number {
		if (this.config.max === 0) {
			return Infinity; // Unlimited
		}
		return Math.max(0, this.config.max - slotItemCount);
	}

	/**
	 * Get the merged configuration (defaults + user options)
	 * @returns Read-only configuration object
	 */
	public get config(): Readonly<SlotConfig> {
		return {
			...Slot.defaultConfig,
			...this._options,
		};
	}
}
