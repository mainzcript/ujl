import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { ModuleBase } from "../base.js";
import { Slot } from "../slot.js";

export class ContainerModule extends ModuleBase {
	public readonly name = "container";
	public readonly label = "Container";
	public readonly description = "A container for grouping and organizing content";
	public readonly category = "layout" as const;
	public readonly tags = ["wrapper", "section", "group"] as const;
	public readonly icon =
		'<path d="M15 10V9"/><path d="M15 15v-1"/><path d="M15 21v-2"/><path d="M15 5V3"/><path d="M9 10V9"/><path d="M9 15v-1"/><path d="M9 21v-2"/><path d="M9 5V3"/><rect x="3" y="3" width="18" height="18" rx="2"/>';
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
	public async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		const children: UJLAbstractNode[] = [];

		const bodySlot = moduleData.slots.body;
		for (const childModule of bodySlot) {
			children.push(await composer.composeModule(childModule));
		}

		return {
			type: "container",
			props: {
				children,
			},
			id: moduleData.meta.id,
		};
	}
}
