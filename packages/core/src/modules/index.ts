import type { ModuleBase } from "./base.js";
import { Button } from "./concretes/button.js";
import { CallToActionModule } from "./concretes/call-to-action.js";
import { CardModule } from "./concretes/card.js";
import { ContainerModule } from "./concretes/container.js";
import { GridModule } from "./concretes/grid.js";
import { ImageModule } from "./concretes/image.js";
import { TextModule } from "./concretes/text.js";

/**
 * Any module is an instance of the ModuleBase class
 * Using ModuleBase directly ensures all properties (including icon) are accessible
 */
export type AnyModule = ModuleBase;

/**
 * Re-export FieldEntry and SlotEntry types for UI components
 */
export type { FieldEntry, SlotEntry } from "./base.js";

/**
 * Re-export ComponentCategory type
 */
export { COMPONENT_CATEGORIES } from "./types.js";
export type { ComponentCategory } from "./types.js";

/**
 * Export module base classes and implementations
 */
export { ModuleBase } from "./base.js";
export {
	Button,
	CallToActionModule,
	CardModule,
	ContainerModule,
	GridModule,
	ImageModule,
	TextModule,
};
export type Module =
	| Button
	| ContainerModule
	| GridModule
	| CardModule
	| TextModule
	| CallToActionModule
	| ImageModule;

/**
 * Export module registry
 */
export { ModuleRegistry } from "./registry.js";

/**
 * Export default registry factory
 */
export { createDefaultRegistry } from "./default-registry.js";
