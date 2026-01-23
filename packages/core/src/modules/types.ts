/**
 * Component Categories
 * Used by ModuleBase.category to categorize modules in the UI
 */
export const COMPONENT_CATEGORIES = [
	"layout",
	"content",
	"image",
	"interactive",
	"data",
	"navigation",
] as const;

/**
 * Component Category Type
 */
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];
