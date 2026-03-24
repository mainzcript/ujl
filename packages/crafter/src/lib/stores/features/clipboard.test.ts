import type { UJLCModuleObject, UJLCSlotObject } from "@ujl-framework/types";
import { describe, expect, it, vi } from "vitest";
import {
	createClipboardFeature,
	type ClipboardFeatureState,
	type UJLClipboardData,
} from "./clipboard.js";

function createModule(
	id: string,
	slots: Record<string, UJLCModuleObject[]> = {},
): UJLCModuleObject {
	return {
		type: "text",
		meta: {
			id,
			updated_at: "2026-03-24T00:00:00.000Z",
			_embedding: [],
		},
		fields: {},
		slots,
	};
}

function createState(): ClipboardFeatureState {
	return {
		showComponentPicker: false,
		insertTargetNodeId: null,
		clipboard: null,
	};
}

function createDeps(state: ClipboardFeatureState) {
	function isModuleObject(_data: UJLClipboardData): _data is UJLCModuleObject {
		return false;
	}

	return {
		operations: {
			insertNode: vi.fn(),
			copyNode: vi.fn(),
			moveNode: vi.fn(),
			reorderNode: vi.fn(),
			deleteNode: vi.fn(),
			cutNode: vi.fn(),
			pasteNode: vi.fn(),
			copySlot: vi.fn(),
			cutSlot: vi.fn(),
			pasteSlot: vi.fn(),
			moveSlot: vi.fn(),
			updateNodeField: vi.fn(),
			updateNodeFields: vi.fn(),
		},
		state,
		getRootSlot: vi.fn<() => UJLCSlotObject>(() => []),
		setSelectedNodeId: vi.fn(),
		findParentOfNode: vi.fn<
			(
				nodes: UJLCModuleObject[],
				targetId: string,
			) => { parent: UJLCModuleObject | null; slotName: string; index: number } | null
		>(() => null),
		parseSlotSelection: vi.fn((selection: string | null) => {
			if (selection === "parent-id:content") {
				return { parentId: "parent-id", slotName: "content" };
			}

			return null;
		}),
		isModuleObject,
		readFromBrowserClipboard: vi.fn(async () => null),
		writeToBrowserClipboard: vi.fn(async () => undefined),
	};
}

describe("clipboard feature insert requests", () => {
	it("keeps the existing module-after-module behavior for plain target ids", () => {
		const state = createState();
		const deps = createDeps(state);
		deps.operations.insertNode.mockReturnValue("new-node");

		const clipboard = createClipboardFeature(deps);
		clipboard.requestInsert("module-1");
		clipboard.handleComponentSelect("hero");

		expect(deps.operations.insertNode).toHaveBeenCalledWith("hero", "module-1", undefined, "after");
		expect(deps.setSelectedNodeId).toHaveBeenCalledWith("new-node");
	});

	it("still inserts into slots when the target id encodes a slot selection", () => {
		const state = createState();
		const deps = createDeps(state);
		deps.operations.insertNode.mockReturnValue("new-node");

		const clipboard = createClipboardFeature(deps);
		clipboard.requestInsert("parent-id:content");
		clipboard.handleComponentSelect("card");

		expect(deps.operations.insertNode).toHaveBeenCalledWith("card", "parent-id", "content", "into");
	});

	it("supports explicit before/after insert requests for quick actions", () => {
		const state = createState();
		const deps = createDeps(state);
		deps.operations.insertNode.mockReturnValue("new-node");

		const clipboard = createClipboardFeature(deps);
		clipboard.requestInsert({ targetId: "module-2", position: "before" });
		clipboard.handleComponentSelect("text");

		expect(deps.operations.insertNode).toHaveBeenCalledWith(
			"text",
			"module-2",
			undefined,
			"before",
		);
	});
});

describe("clipboard feature delete selection fallback", () => {
	it("selects the next sibling in the same root slot after delete", () => {
		const state = createState();
		const deps = createDeps(state);
		const root = [createModule("module-a"), createModule("module-b"), createModule("module-c")];

		deps.getRootSlot.mockReturnValue(root);
		deps.findParentOfNode.mockReturnValue({
			parent: null,
			slotName: "root",
			index: 0,
		});
		deps.operations.deleteNode.mockReturnValue(true);

		const clipboard = createClipboardFeature(deps);
		clipboard.deleteNode("module-a");

		expect(deps.setSelectedNodeId).toHaveBeenCalledWith("module-b");
	});

	it("selects the previous sibling when deleting the last module in a slot", () => {
		const state = createState();
		const deps = createDeps(state);
		const parent = createModule("parent", {
			content: [createModule("module-a"), createModule("module-b")],
		});

		deps.getRootSlot.mockReturnValue([parent]);
		deps.findParentOfNode.mockReturnValue({
			parent,
			slotName: "content",
			index: 1,
		});
		deps.operations.deleteNode.mockReturnValue(true);

		const clipboard = createClipboardFeature(deps);
		clipboard.deleteNode("module-b");

		expect(deps.setSelectedNodeId).toHaveBeenCalledWith("module-a");
	});

	it("clears selection when deleting the only module in a slot", () => {
		const state = createState();
		const deps = createDeps(state);
		const root = [createModule("module-a")];

		deps.getRootSlot.mockReturnValue(root);
		deps.findParentOfNode.mockReturnValue({
			parent: null,
			slotName: "root",
			index: 0,
		});
		deps.operations.deleteNode.mockReturnValue(true);

		const clipboard = createClipboardFeature(deps);
		clipboard.deleteNode("module-a");

		expect(deps.setSelectedNodeId).toHaveBeenCalledWith(null);
	});

	it("reuses the same fallback behavior for cut", async () => {
		const state = createState();
		const deps = createDeps(state);
		const root = [createModule("module-a"), createModule("module-b")];

		deps.getRootSlot.mockReturnValue(root);
		deps.findParentOfNode.mockReturnValue({
			parent: null,
			slotName: "root",
			index: 0,
		});
		deps.operations.copyNode.mockReturnValue(root[0]);
		deps.operations.deleteNode.mockReturnValue(true);

		const clipboard = createClipboardFeature(deps);
		await clipboard.cutNode("module-a");

		expect(deps.setSelectedNodeId).toHaveBeenCalledWith("module-b");
	});

	it("does not change selection when delete fails", () => {
		const state = createState();
		const deps = createDeps(state);
		const root = [createModule("module-a"), createModule("module-b")];

		deps.getRootSlot.mockReturnValue(root);
		deps.findParentOfNode.mockReturnValue({
			parent: null,
			slotName: "root",
			index: 0,
		});
		deps.operations.deleteNode.mockReturnValue(false);

		const clipboard = createClipboardFeature(deps);
		clipboard.deleteNode("module-a");

		expect(deps.setSelectedNodeId).not.toHaveBeenCalled();
	});
});
