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
	public compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		const children: UJLAbstractNode[] = [];

		// Compose child modules in the items slot
		const itemsSlot = moduleData.slots.items;
		for (const childModule of itemsSlot) {
			children.push(composer.composeModule(childModule));
		}

		return {
			type: "grid",
			props: {
				children: children.map(child => ({
					type: "grid-item",
					props: {
						children: [child],
					},
				})),
			},
		};
	}
}
