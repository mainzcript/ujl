import { Button } from "./concretes/button.js";
import { CallToActionModule } from "./concretes/call-to-action.js";
import { CardModule } from "./concretes/card.js";
import { ContainerModule } from "./concretes/container.js";
import { GridModule } from "./concretes/grid.js";
import { TextModule } from "./concretes/text.js";
import { ModuleRegistry } from "./registry.js";

/**
 * Creates a new module registry with all built-in modules pre-registered
 *
 * This provides a zero-configuration setup for most use cases while still
 * allowing developers to add custom modules or create their own registry.
 *
 * @returns A new ModuleRegistry with all built-in modules registered
 */
export function createDefaultRegistry(): ModuleRegistry {
	const registry = new ModuleRegistry();

	// Register all built-in modules
	registry.registerModule(new Button());
	registry.registerModule(new ContainerModule());
	registry.registerModule(new GridModule());
	registry.registerModule(new CardModule());
	registry.registerModule(new TextModule());
	registry.registerModule(new CallToActionModule());

	return registry;
}
