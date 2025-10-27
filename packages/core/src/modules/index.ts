import { ModuleBase } from "./base";
import { Button } from "./concretes/button";
import { CallToActionModule } from "./concretes/call-to-action";
import { CardModule } from "./concretes/card";
import { ContainerModule } from "./concretes/container";
import { GridModule } from "./concretes/grid";
import { TextModule } from "./concretes/text";

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
