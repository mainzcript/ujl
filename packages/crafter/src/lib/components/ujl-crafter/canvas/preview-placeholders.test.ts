import { Composer } from "@ujl-framework/core";
import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
import type { UJLCDocument } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import {
	augmentPreviewDocumentWithPlaceholders,
	CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE,
	createPreviewComposer,
} from "./preview-placeholders.js";
import { SLOT_PLACEHOLDER_HOST_DATA_CRAFTER } from "./targeting/slot-placeholder-targets.js";

type ModuleNode = UJLCDocument["ujlc"]["root"][number];

function findModuleById(nodes: UJLCDocument["ujlc"]["root"], moduleId: string): ModuleNode | null {
	for (const node of nodes) {
		if (node.meta.id === moduleId) {
			return node;
		}

		for (const children of Object.values(node.slots ?? {})) {
			const found = findModuleById(children, moduleId);
			if (found) {
				return found;
			}
		}
	}

	return null;
}

describe("preview placeholders", () => {
	it("augments every slot with one deterministic placeholder module", () => {
		const sourceDocument = structuredClone(showcaseDocument as UJLCDocument);
		const previewDocument = augmentPreviewDocumentWithPlaceholders(sourceDocument);
		const sourceRootLast = sourceDocument.ujlc.root[sourceDocument.ujlc.root.length - 1];
		const previewRootLast = previewDocument.ujlc.root[previewDocument.ujlc.root.length - 1];

		expect(sourceRootLast?.type).not.toBe(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE);
		expect(previewRootLast?.type).toBe(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE);
		expect(previewRootLast?.meta.id).toBe("__crafter-preview-slot-placeholder__:__root__:root");

		const firstRootModule = previewDocument.ujlc.root.find(
			(node) => node.type !== CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE,
		);
		expect(firstRootModule).not.toBeNull();
		const bodySlotLast =
			firstRootModule && firstRootModule.slots.body[firstRootModule.slots.body.length - 1];
		expect(bodySlotLast?.type).toBe(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE);
		expect(bodySlotLast?.meta.id).toBe(
			`__crafter-preview-slot-placeholder__:${firstRootModule?.meta.id}:body`,
		);
	});

	it("adds placeholders for slots that are empty in the source document", () => {
		const sourceDocument = structuredClone(showcaseDocument as UJLCDocument);
		const cardModule = findModuleById(sourceDocument.ujlc.root, "feature-brand-compliance-001");
		expect(cardModule).not.toBeNull();
		expect(cardModule?.slots.content).toHaveLength(0);

		const previewDocument = augmentPreviewDocumentWithPlaceholders(sourceDocument);
		const previewCard = findModuleById(previewDocument.ujlc.root, "feature-brand-compliance-001");
		expect(previewCard?.slots.content).toHaveLength(1);
		expect(previewCard?.slots.content[0]?.type).toBe(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE);
	});

	it("builds a preview composer without mutating the global composer registry", async () => {
		const baseComposer = new Composer();
		const previewComposer = createPreviewComposer(baseComposer);
		const previewDocument = augmentPreviewDocumentWithPlaceholders(
			structuredClone(showcaseDocument as UJLCDocument),
		);

		expect(baseComposer.getRegistry().hasModule(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE)).toBe(false);
		expect(previewComposer.getRegistry().hasModule(CRAFTER_EMPTY_SLOT_PLACEHOLDER_TYPE)).toBe(true);

		const ast = await previewComposer.compose(previewDocument);
		expect(ast.type).toBe("wrapper");
		const placeholderNode =
			ast.type === "wrapper"
				? ast.props.children?.find((child) => child.type === "raw-html")
				: undefined;
		expect(placeholderNode?.meta?.moduleId).toBeUndefined();
		if (placeholderNode?.type === "raw-html") {
			expect(placeholderNode.props.content).toContain(
				`data-crafter="${SLOT_PLACEHOLDER_HOST_DATA_CRAFTER}"`,
			);
		}
	});
});
