import { describe, expect, it } from "vitest";
import {
	createMockMultiSlotTree,
	createMockNode,
	createMockTree,
} from "../../../tests/mockData.js";
import {
	canAcceptDrop,
	canNodeAcceptPaste,
	findNodeById,
	findParentOfNode,
	formatTypeName,
	getAllSlotEntries,
	getChildren,
	getDisplayName,
	getFirstSlotName,
	hasChildren,
	hasMultipleSlots,
	hasSlots,
	insertNodeAtPosition,
	insertNodeIntoSlot,
	removeNodeFromTree,
	updateNodeInTree,
} from "./ujlc-tree.js";

describe("ujlc-tree-utils", () => {
	describe("findNodeById", () => {
		it("should find node at root level", () => {
			const tree = createMockTree();
			const result = findNodeById(tree, "root-1");

			expect(result).toBeDefined();
			expect(result?.meta.id).toBe("root-1");
		});

		it("should find deeply nested node", () => {
			const tree = createMockTree();
			const result = findNodeById(tree, "leaf-1");

			expect(result).toBeDefined();
			expect(result?.meta.id).toBe("leaf-1");
		});

		it("should return null for non-existent node", () => {
			const tree = createMockTree();
			const result = findNodeById(tree, "non-existent");

			expect(result).toBeNull();
		});

		it("should handle empty tree", () => {
			const result = findNodeById([], "any-id");
			expect(result).toBeNull();
		});
	});

	describe("findParentOfNode", () => {
		it("should find parent at root level", () => {
			const tree = createMockTree();
			const result = findParentOfNode(tree, "nested-1");

			expect(result).toBeDefined();
			expect(result?.parent?.meta.id).toBe("root-1");
			expect(result?.slotName).toBe("body");
			expect(result?.index).toBe(0);
		});

		it("should find parent of deeply nested node", () => {
			const tree = createMockTree();
			const result = findParentOfNode(tree, "leaf-1");

			expect(result).toBeDefined();
			expect(result?.parent?.meta.id).toBe("nested-1");
			expect(result?.slotName).toBe("content");
			expect(result?.index).toBe(0);
		});

		it("should return virtual root node for root level node", () => {
			const tree = createMockTree();
			const result = findParentOfNode(tree, "root-1");

			expect(result).toBeDefined();
			expect(result?.parent).toBeDefined();
			expect(result?.parent?.meta.id).toBe("__root__");
			expect(result?.slotName).toBe("root");
			expect(result?.index).toBe(0);
		});

		it("should return correct index for second child", () => {
			const tree = createMockTree();
			const result = findParentOfNode(tree, "nested-2");

			expect(result?.index).toBe(1);
		});
	});

	describe("removeNodeFromTree", () => {
		it("should remove node from root level", () => {
			const tree = createMockTree();
			const result = removeNodeFromTree(tree, "root-1");

			expect(result).toHaveLength(0);
		});

		it("should remove nested node", () => {
			const tree = createMockTree();
			const result = removeNodeFromTree(tree, "nested-1");

			const root = findNodeById(result, "root-1");
			expect(root?.slots.body).toHaveLength(1);
			expect(root?.slots.body[0].meta.id).toBe("nested-2");
		});

		it("should be immutable", () => {
			const tree = createMockTree();
			const original = tree[0];
			const result = removeNodeFromTree(tree, "nested-1");

			// Original should be unchanged
			expect(original.slots.body).toHaveLength(2);
			// Result should be different reference
			expect(result[0]).not.toBe(original);
		});

		it("should return unchanged tree if node not found", () => {
			const tree = createMockTree();
			const result = removeNodeFromTree(tree, "non-existent");

			expect(result).toHaveLength(1);
			expect(result[0].meta.id).toBe("root-1");
		});
	});

	describe("insertNodeIntoSlot", () => {
		it("should insert node into existing slot", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "text", { content: "New" });
			const result = insertNodeIntoSlot(tree, "nested-1", "content", newNode);

			const parent = findNodeById(result, "nested-1");
			expect(parent?.slots.content).toHaveLength(2);
			expect(parent?.slots.content[1].meta.id).toBe("new-node");
		});

		it("should create new slot if it does not exist", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "text", { content: "New" });
			const result = insertNodeIntoSlot(tree, "nested-1", "footer", newNode);

			const parent = findNodeById(result, "nested-1");
			expect(parent?.slots.footer).toBeDefined();
			expect(parent?.slots.footer).toHaveLength(1);
			expect(parent?.slots.footer[0].meta.id).toBe("new-node");
		});

		it("should be immutable", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "text", { content: "New" });
			const original = findNodeById(tree, "nested-1");
			const result = insertNodeIntoSlot(tree, "nested-1", "content", newNode);

			// Original should be unchanged
			expect(original?.slots.content).toHaveLength(1);
			// Result should have new node
			const updated = findNodeById(result, "nested-1");
			expect(updated?.slots.content).toHaveLength(2);
			expect(updated).not.toBe(original);
		});
	});

	describe("insertNodeAtPosition", () => {
		it("should insert node at beginning", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "card", { title: "New" });
			const result = insertNodeAtPosition(tree, "root-1", "body", newNode, 0);

			const root = findNodeById(result, "root-1");
			expect(root?.slots.body).toHaveLength(3);
			expect(root?.slots.body[0].meta.id).toBe("new-node");
		});

		it("should insert node at middle position", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "card", { title: "New" });
			const result = insertNodeAtPosition(tree, "root-1", "body", newNode, 1);

			const root = findNodeById(result, "root-1");
			expect(root?.slots.body).toHaveLength(3);
			expect(root?.slots.body[1].meta.id).toBe("new-node");
		});

		it("should insert node at end", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "card", { title: "New" });
			const result = insertNodeAtPosition(tree, "root-1", "body", newNode, 2);

			const root = findNodeById(result, "root-1");
			expect(root?.slots.body).toHaveLength(3);
			expect(root?.slots.body[2].meta.id).toBe("new-node");
		});

		it("should create slot if it does not exist", () => {
			const tree = createMockTree();
			const newNode = createMockNode("new-node", "text", { content: "New" });
			const result = insertNodeAtPosition(tree, "nested-1", "footer", newNode, 0);

			const parent = findNodeById(result, "nested-1");
			expect(parent?.slots.footer).toBeDefined();
			expect(parent?.slots.footer[0].meta.id).toBe("new-node");
		});
	});

	describe("updateNodeInTree", () => {
		it("should update node fields", () => {
			const tree = createMockTree();
			const result = updateNodeInTree(tree, "leaf-1", (node) => ({
				...node,
				fields: { ...node.fields, content: "Updated" },
			}));

			const updated = findNodeById(result, "leaf-1");
			expect(updated?.fields.content).toBe("Updated");
		});

		it("should update node metadata", () => {
			const tree = createMockTree();
			const newTimestamp = "2024-12-04T10:00:00Z";
			const result = updateNodeInTree(tree, "leaf-1", (node) => ({
				...node,
				meta: { ...node.meta, updated_at: newTimestamp },
			}));

			const updated = findNodeById(result, "leaf-1");
			expect(updated?.meta.updated_at).toBe(newTimestamp);
		});

		it("should be immutable", () => {
			const tree = createMockTree();
			const original = findNodeById(tree, "leaf-1");
			// Convert string to ProseMirror Document for RichTextField
			const updatedContent = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "Updated",
							},
						],
					},
				],
			};
			const result = updateNodeInTree(tree, "leaf-1", (node) => ({
				...node,
				fields: { content: updatedContent },
			}));

			// Original unchanged - content is now a ProseMirror Document
			expect(original?.fields.content).toHaveProperty("type", "doc");
			// Result updated
			const updated = findNodeById(result, "leaf-1");
			expect(updated?.fields.content).toEqual(updatedContent);
			expect(updated).not.toBe(original);
		});

		it("should return unchanged tree if node not found", () => {
			const tree = createMockTree();
			const result = updateNodeInTree(tree, "non-existent", (node) => ({
				...node,
				fields: { content: "Updated" },
			}));

			expect(result).toEqual(tree);
		});
	});

	describe("getFirstSlotName", () => {
		it("should return first slot name", () => {
			const node = createMockNode("test", "container", {}, { body: [], footer: [] });
			const result = getFirstSlotName(node);

			expect(result).toBe("body");
		});

		it("should return null for node without slots", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			const result = getFirstSlotName(node);

			expect(result).toBeNull();
		});

		it("should return null for empty slots object", () => {
			const node = createMockNode("test", "container", {}, {});
			const result = getFirstSlotName(node);

			expect(result).toBeNull();
		});
	});

	describe("hasSlots", () => {
		it("should return true for node with slots", () => {
			const node = createMockNode("test", "container", {}, { body: [] });
			expect(hasSlots(node)).toBe(true);
		});

		it("should return false for node without slots", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(hasSlots(node)).toBe(false);
		});

		it("should return false for empty slots object", () => {
			const node = createMockNode("test", "container", {}, {});
			expect(hasSlots(node)).toBe(false);
		});
	});

	describe("getDisplayName", () => {
		it("should use title field if available", () => {
			const node = createMockNode("test", "card", { title: "My Card" });
			expect(getDisplayName(node)).toBe("Card: My Card");
		});

		it("should use label field if available", () => {
			const node = createMockNode("test", "button", { label: "Click Me" });
			expect(getDisplayName(node)).toBe("Button: Click Me");
		});

		it("should use headline field if available", () => {
			const node = createMockNode("test", "call-to-action", { headline: "Join Now" });
			expect(getDisplayName(node)).toBe("Call To Action: Join Now");
		});

		it("should use content field if available", () => {
			const node = createMockNode("test", "text", { content: "This is a long text content..." });
			expect(getDisplayName(node)).toContain("Text: This is a long text content");
		});

		it("should truncate long content", () => {
			const longContent = "a".repeat(50);
			const node = createMockNode("test", "text", { content: longContent });
			const result = getDisplayName(node);

			expect(result.length).toBeLessThan(50);
			expect(result).toContain("...");
		});

		it("should return type only if no display fields", () => {
			const node = createMockNode("test", "container", {});
			expect(getDisplayName(node)).toBe("Container");
		});
	});

	describe("formatTypeName", () => {
		it("should convert kebab-case to Title Case", () => {
			expect(formatTypeName("call-to-action")).toBe("Call To Action");
		});

		it("should handle single word", () => {
			expect(formatTypeName("button")).toBe("Button");
		});

		it("should handle multiple hyphens", () => {
			expect(formatTypeName("my-custom-component")).toBe("My Custom Component");
		});
	});

	describe("getChildren", () => {
		it("should return all children from all slots", () => {
			const tree = createMockMultiSlotTree();
			const root = tree[0];
			const children = getChildren(root);

			expect(children).toHaveLength(4);
			expect(children.map((c) => c.meta.id)).toContain("header-item");
			expect(children.map((c) => c.meta.id)).toContain("body-item-1");
			expect(children.map((c) => c.meta.id)).toContain("body-item-2");
			expect(children.map((c) => c.meta.id)).toContain("footer-item");
		});

		it("should return empty array for node without children", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(getChildren(node)).toEqual([]);
		});
	});

	describe("hasChildren", () => {
		it("should return true for node with children", () => {
			const tree = createMockTree();
			expect(hasChildren(tree[0])).toBe(true);
		});

		it("should return false for node without children", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(hasChildren(node)).toBe(false);
		});

		it("should return false for node with empty slots", () => {
			const node = createMockNode("test", "container", {}, { body: [] });
			expect(hasChildren(node)).toBe(false);
		});
	});

	describe("hasMultipleSlots", () => {
		it("should return true for node with multiple slots", () => {
			const tree = createMockMultiSlotTree();
			expect(hasMultipleSlots(tree[0])).toBe(true);
		});

		it("should return false for node with single slot", () => {
			const tree = createMockTree();
			expect(hasMultipleSlots(tree[0])).toBe(false);
		});

		it("should return false for node with no slots", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(hasMultipleSlots(node)).toBe(false);
		});
	});

	describe("getAllSlotEntries", () => {
		it("should return all slot entries including empty ones", () => {
			const node = createMockNode(
				"test",
				"layout",
				{},
				{
					header: [createMockNode("h1", "text", { content: "Header" })],
					body: [],
					footer: [createMockNode("f1", "text", { content: "Footer" })],
				},
			);
			const entries = getAllSlotEntries(node);

			expect(entries).toHaveLength(3);
			expect(entries.map(([name]) => name)).toEqual(["header", "body", "footer"]);
			expect(entries[0][1]).toHaveLength(1); // header has 1 child
			expect(entries[1][1]).toHaveLength(0); // body is empty
			expect(entries[2][1]).toHaveLength(1); // footer has 1 child
		});

		it("should return empty array for node with no slots", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(getAllSlotEntries(node)).toEqual([]);
		});
	});

	describe("canAcceptDrop", () => {
		it("should return true for node with slots", () => {
			const node = createMockNode("test", "container", {}, { body: [] });
			expect(canAcceptDrop(node)).toBe(true);
		});

		it("should return false for node without slots", () => {
			const node = createMockNode("test", "text", { content: "Test" });
			expect(canAcceptDrop(node)).toBe(false);
		});
	});

	describe("canNodeAcceptPaste", () => {
		it("should return true for node with slots and node clipboard", () => {
			const node = createMockNode("target", "container", {}, { body: [] });
			const clipboard = createMockNode("clip", "text", { content: "Copied" });

			expect(canNodeAcceptPaste(node, clipboard)).toBe(true);
		});

		it("should return false for node without slots", () => {
			const node = createMockNode("target", "text", { content: "Target" });
			const clipboard = createMockNode("clip", "text", { content: "Copied" });

			expect(canNodeAcceptPaste(node, clipboard)).toBe(false);
		});

		it("should return true for matching slot clipboard", () => {
			const node = createMockNode("target", "container", {}, { body: [], footer: [] });
			const clipboard = {
				type: "slot" as const,
				slotName: "body",
				content: [createMockNode("c1", "text", { content: "C1" })],
			};

			expect(canNodeAcceptPaste(node, clipboard)).toBe(true);
		});

		it("should return false for non-matching slot clipboard", () => {
			const node = createMockNode("target", "container", {}, { body: [] });
			const clipboard = {
				type: "slot" as const,
				slotName: "header",
				content: [createMockNode("c1", "text", { content: "C1" })],
			};

			expect(canNodeAcceptPaste(node, clipboard)).toBe(false);
		});

		it("should return false for null clipboard", () => {
			const node = createMockNode("target", "container", {}, { body: [] });
			expect(canNodeAcceptPaste(node, null)).toBe(false);
		});
	});
});
