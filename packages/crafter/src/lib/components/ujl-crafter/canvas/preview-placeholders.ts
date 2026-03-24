import { ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";
import { Composer, ModuleBase, ModuleRegistry } from "@ujl-framework/core";
import type { UJLAbstractNode, UJLCDocument, UJLCModuleObject } from "@ujl-framework/types";
import { SLOT_PLACEHOLDER_HOST_DATA_CRAFTER } from "./targeting/slot-placeholder-targets.js";

export const CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE = "crafter-empty-slot-placeholder";
const CRAFTER_EMPTY_SLOT_PLACEHOLDER_ID_PREFIX = "__crafter-preview-slot-placeholder__";

function buildPlaceholderHtml(
	placeholderId: string,
	ownerModuleId: string | null,
	slotName: string,
): string {
	return `
		<div
			aria-hidden="true"
			data-crafter="${SLOT_PLACEHOLDER_HOST_DATA_CRAFTER}"
			data-placeholder-id="${placeholderId}"
			data-slot-owner-module-id="${ownerModuleId ?? ""}"
			data-slot-name="${slotName}"
			style="
				pointer-events: auto;
				user-select: none;
				display: block;
				width: 100%;
				min-height: 2.75rem;
				height: 100%;
				position: relative;
			"
		></div>
	`.trim();
}

export class CrafterEmptySlotPlaceholderModule extends ModuleBase {
	public readonly name = CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE;
	public readonly label = "Crafter Empty Slot Placeholder";
	public readonly description = "Preview-only placeholder for empty slot space in Crafter";
	public readonly category = "layout" as const;
	public readonly tags = ["crafter", "preview", "placeholder"] as const;
	public readonly icon =
		'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>';
	public readonly fields = [];
	public readonly slots = [];

	public getInstanceLabel(_moduleData: UJLCModuleObject): string | null {
		return null;
	}

	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const ownerModuleId =
			typeof moduleData.fields.ownerModuleId === "string" ? moduleData.fields.ownerModuleId : null;
		const slotName =
			typeof moduleData.fields.slotName === "string" ? moduleData.fields.slotName : ROOT_SLOT_NAME;

		return {
			type: "raw-html",
			id: moduleData.meta.id,
			props: {
				content: buildPlaceholderHtml(moduleData.meta.id, ownerModuleId, slotName),
			},
		};
	}
}

function createPlaceholderModule(
	documentUpdatedAt: string,
	ownerModuleId: string | null,
	slotName: string,
): UJLCModuleObject {
	const ownerKey = ownerModuleId ?? "__root__";

	return {
		type: CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE,
		fields: {
			ownerModuleId,
			slotName,
		},
		slots: {},
		meta: {
			id: `${CRAFTER_EMPTY_SLOT_PLACEHOLDER_ID_PREFIX}:${ownerKey}:${slotName}`,
			updated_at: documentUpdatedAt,
			_embedding: [],
		},
	};
}

function cloneModuleTree(module: UJLCModuleObject): UJLCModuleObject {
	return {
		type: module.type,
		meta: {
			id: module.meta.id,
			updated_at: module.meta.updated_at,
			_embedding: [...module.meta._embedding],
		},
		fields: { ...module.fields },
		slots: Object.fromEntries(
			Object.entries(module.slots ?? {}).map(([slotName, children]) => [
				slotName,
				children.map((child) => cloneModuleTree(child)),
			]),
		),
	};
}

function cloneDocumentRoot(ujlcDocument: UJLCDocument): UJLCDocument {
	return {
		...ujlcDocument,
		ujlc: {
			...ujlcDocument.ujlc,
			root: ujlcDocument.ujlc.root.map((node) => cloneModuleTree(node)),
		},
	};
}

function appendPlaceholdersToNestedSlots(
	nodes: UJLCModuleObject[],
	documentUpdatedAt: string,
): void {
	for (const node of nodes) {
		for (const [slotName, children] of Object.entries(node.slots ?? {})) {
			appendPlaceholdersToNestedSlots(children, documentUpdatedAt);
			children.push(createPlaceholderModule(documentUpdatedAt, node.meta.id, slotName));
		}
	}
}

export function augmentPreviewDocumentWithPlaceholders(ujlcDocument: UJLCDocument): UJLCDocument {
	const previewDocument = cloneDocumentRoot(ujlcDocument);
	appendPlaceholdersToNestedSlots(previewDocument.ujlc.root, previewDocument.ujlc.meta.updated_at);
	previewDocument.ujlc.root.push(
		createPlaceholderModule(previewDocument.ujlc.meta.updated_at, null, "root"),
	);
	return previewDocument;
}

export function createPreviewComposer(baseComposer: Composer): Composer {
	const previewRegistry = new ModuleRegistry();

	for (const module of baseComposer.getRegistry().getAllModules()) {
		previewRegistry.registerModule(module);
	}

	previewRegistry.registerModule(new CrafterEmptySlotPlaceholderModule());

	return new Composer(previewRegistry);
}
