import type { UJLCModuleObject } from "@ujl-framework/types";
import { describe, expect, it, vi } from "vitest";
import {
	createClipboardFeature,
	type ClipboardFeatureState,
	type UJLClipboardData,
} from "./clipboard.js";

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
		setSelectedNodeId: vi.fn(),
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
