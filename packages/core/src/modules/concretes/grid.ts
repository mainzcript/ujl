import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { ModuleBase } from "../base.js";
import { Slot } from "../slot.js";

/**
 * Content grid module with medium-sized items for UJL
 *
 * Displays child modules in a responsive grid layout with medium-sized items.
 * Design parameters are embedded in the module name (md = medium).
 */
export class GridModule extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "grid";
	public readonly label = "Grid";
	public readonly description = "A responsive grid layout for arranging items";
	public readonly category = "layout" as const;
	public readonly tags = ["layout", "columns", "responsive", "flex"] as const;
	public readonly icon =
		'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>';

	/** Field definitions available in this module */
	public readonly fields = [];

	/** Slot definitions for child modules */
	public readonly slots = [
		{
			key: "items",
			slot: new Slot({
				label: "Grid Items",
				description: "Add content items to display in the grid",
			}),
		},
	];

	/**
	 * Compose a content grid module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		const children: UJLAbstractNode[] = [];

		// Compose child modules in the items slot
		const itemsSlot = moduleData.slots.items;
		for (const childModule of itemsSlot) {
			children.push(await composer.composeModule(childModule));
		}

		return {
			type: "grid",
			props: {
				children: children.map((child, index) => ({
					type: "grid-item",
					props: {
						children: [child],
					},
					id: `${moduleData.meta.id}-item-${index}`,
				})),
			},
			id: moduleData.meta.id,
		};
	}
}
