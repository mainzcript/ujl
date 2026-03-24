import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import { findParentOfNode, ROOT_NODE_ID, ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import { getInsertRequestKey } from "./placement-target-hit-testing.js";
import type { ActiveSlotTarget } from "./pointer-targets.js";

export const SLOT_PLACEHOLDER_HOST_DATA_CRAFTER = "slot-placeholder-host";
export const SLOT_PLACEHOLDER_HOST_SELECTOR = `[data-crafter="${SLOT_PLACEHOLDER_HOST_DATA_CRAFTER}"]`;

export function getSlotPlaceholderKey(ownerModuleId: string | null, slotName: string): string {
	return `${ownerModuleId ?? ROOT_NODE_ID}:${slotName}`;
}

export function getSlotEndSemanticKey(ownerModuleId: string | null, slotName: string): string {
	return `slot-end:${ownerModuleId ?? ROOT_NODE_ID}:${slotName}`;
}

export function getSlotPlaceholderInsertRequest(
	ownerModuleId: string | null,
	slotName: string,
): InsertRequest {
	return {
		targetId: ownerModuleId ?? ROOT_NODE_ID,
		slotName,
		position: "into",
	};
}

export function getSemanticInsertTargetKey(
	rootNodes: UJLCModuleObject[],
	insertRequest: InsertRequest,
): string {
	if (insertRequest.position === "into" && insertRequest.slotName) {
		return getSlotEndSemanticKey(
			insertRequest.targetId === ROOT_NODE_ID ? null : insertRequest.targetId,
			insertRequest.slotName,
		);
	}

	if (insertRequest.position === "after") {
		const parentInfo = findParentOfNode(rootNodes, insertRequest.targetId);
		if (!parentInfo?.parent) {
			return getInsertRequestKey(insertRequest);
		}

		const ownerModuleId =
			parentInfo.parent.meta.id === ROOT_NODE_ID ? null : parentInfo.parent.meta.id;
		const siblings =
			ownerModuleId === null ? rootNodes : (parentInfo.parent.slots?.[parentInfo.slotName] ?? []);
		const lastSibling = siblings[siblings.length - 1];

		if (lastSibling?.meta.id === insertRequest.targetId) {
			return getSlotEndSemanticKey(ownerModuleId, parentInfo.slotName);
		}
	}

	return getInsertRequestKey(insertRequest);
}

export function mergeSemanticallyEquivalentInsertTargets<
	T extends {
		insertRequest: InsertRequest;
		kind: "placement" | "placeholder";
	},
>(rootNodes: UJLCModuleObject[], definitions: T[]): T[] {
	const orderedKeys: string[] = [];
	const deduped = new Map<string, T>();

	for (const definition of definitions) {
		const semanticKey = getSemanticInsertTargetKey(rootNodes, definition.insertRequest);
		const existing = deduped.get(semanticKey);

		if (!existing) {
			orderedKeys.push(semanticKey);
			deduped.set(semanticKey, definition);
			continue;
		}

		if (existing.kind !== "placeholder" && definition.kind === "placeholder") {
			deduped.set(semanticKey, definition);
		}
	}

	return orderedKeys
		.map((semanticKey) => deduped.get(semanticKey))
		.filter((definition): definition is T => definition !== undefined);
}

export function findSemanticallyEquivalentInsertTarget<
	T extends {
		insertRequest: InsertRequest;
	},
>(rootNodes: UJLCModuleObject[], definitions: T[], insertRequest: InsertRequest): T | null {
	const semanticKey = getSemanticInsertTargetKey(rootNodes, insertRequest);

	return (
		definitions.find(
			(definition) =>
				getSemanticInsertTargetKey(rootNodes, definition.insertRequest) === semanticKey,
		) ?? null
	);
}

export function readSlotPlaceholderTargetFromElement(
	element: HTMLElement | null,
): ActiveSlotTarget | null {
	const host = element?.closest(SLOT_PLACEHOLDER_HOST_SELECTOR) as HTMLElement | null;
	if (!host) {
		return null;
	}

	const slotName = host.getAttribute("data-slot-name");
	if (!slotName) {
		return null;
	}

	const ownerModuleId = host.getAttribute("data-slot-owner-module-id") || null;

	if (slotName === ROOT_SLOT_NAME) {
		return {
			ownerModuleId: null,
			slotName,
		};
	}

	if (!ownerModuleId) {
		return null;
	}

	return {
		ownerModuleId,
		slotName,
	};
}
