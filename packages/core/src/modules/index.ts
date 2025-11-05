import { ModuleBase } from "./base.js";
import { Button } from "./concretes/button.js";
import { CallToActionModule } from "./concretes/call-to-action.js";
import { CardModule } from "./concretes/card.js";
import { ContainerModule } from "./concretes/container.js";
import { GridModule } from "./concretes/grid.js";
import { TextModule } from "./concretes/text.js";

/**
 * Any module is an instance of the ModuleBase class
 */
export type AnyModule = InstanceType<typeof ModuleBase>;

/**
 * Export module base classes and implementations
 */
export { Button, CallToActionModule, CardModule, ContainerModule, GridModule, TextModule };
export type Module =
	| Button
	| ContainerModule
	| GridModule
	| CardModule
	| TextModule
	| CallToActionModule;

/**
 * Export module registry
 */
export { ModuleRegistry } from "./registry.js";

/**
 * Export default registry factory
 */
export { createDefaultRegistry } from "./default-registry.js";
