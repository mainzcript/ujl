import type { Composer } from "../../composer.js";
import type { UJLAbstractNode, UJLModuleObject } from "../../types/index.js";
import { ModuleBase } from "../base.js";
import { Slot } from "../slot.js";

export class ContainerModule extends ModuleBase {
	public readonly name = "container";
	public readonly fields = [];
	public readonly slots = [
		{
			key: "body",
			slot: new Slot(),
		},
	];

	/**
	 * Compose a container module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLModuleObject, composer: Composer): UJLAbstractNode {
		const children: UJLAbstractNode[] = [];

		const bodySlot = moduleData.slots.body;
		for (const childModule of bodySlot) {
			children.push(composer.composeModule(childModule));
		}

		return {
			type: "container",
			props: {
				children,
			},
		};
	}
}
