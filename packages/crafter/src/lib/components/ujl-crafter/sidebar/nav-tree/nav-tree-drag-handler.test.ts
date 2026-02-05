import { describe, expect, it, vi } from "vitest";
import { createDragHandler } from "./nav-tree-drag-handler.svelte.js";

describe("nav-tree-drag-handler", () => {
	describe("createDragHandler", () => {
		it("should initialize with null state", () => {
			const handler = createDragHandler();

			expect(handler.draggedNodeId).toBeNull();
			expect(handler.draggedSlotName).toBeNull();
			expect(handler.dragType).toBeNull();
			expect(handler.dropTargetId).toBeNull();
			expect(handler.dropPosition).toBeNull();
		});

		it("should handle node drag start", () => {
			const handler = createDragHandler();
			const mockEvent = {
				dataTransfer: {
					effectAllowed: "",
					setData: vi.fn(),
				},
			} as unknown as DragEvent;

			handler.handleDragStart(mockEvent, "node-1");

			expect(handler.draggedNodeId).toBe("node-1");
			expect(handler.dragType).toBe("node");
			expect(mockEvent.dataTransfer?.effectAllowed).toBe("move");
		});

		it("should handle slot drag start", () => {
			const handler = createDragHandler();
			const mockEvent = {
				dataTransfer: {
					effectAllowed: "",
					setData: vi.fn(),
				},
			} as unknown as DragEvent;

			handler.handleSlotDragStart(mockEvent, "parent-1", "body");

			expect(handler.draggedSlotParentId).toBe("parent-1");
			expect(handler.draggedSlotName).toBe("body");
			expect(handler.dragType).toBe("slot");
		});

		it("should calculate drop position for node drag", () => {
			const handler = createDragHandler();
			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);

			// Mock element with height 100px
			const mockElement = {
				getBoundingClientRect: () => ({ top: 0, height: 100 }),
			};

			// Top 25% - before
			let mockEvent = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
				currentTarget: mockElement,
				clientY: 20,
				dataTransfer: { dropEffect: "" },
			} as unknown as DragEvent;

			handler.handleDragOver(mockEvent, "node-2");
			expect(handler.dropPosition).toBe("before");

			// Bottom 25% - after
			mockEvent = {
				...mockEvent,
				clientY: 90,
			} as unknown as DragEvent;

			handler.handleDragOver(mockEvent, "node-2");
			expect(handler.dropPosition).toBe("after");

			// Middle 50% - into
			mockEvent = {
				...mockEvent,
				clientY: 50,
			} as unknown as DragEvent;

			handler.handleDragOver(mockEvent, "node-2");
			expect(handler.dropPosition).toBe("into");
		});

		it("should only allow into position for slot drag", () => {
			const handler = createDragHandler();
			const mockEvent = {
				dataTransfer: { effectAllowed: "", setData: vi.fn() },
			} as unknown as DragEvent;

			handler.handleSlotDragStart(mockEvent, "parent-1", "body");

			const dragOverEvent = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
				currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 100 }) },
				clientY: 20, // Would be 'before' for node drag
				dataTransfer: { dropEffect: "" },
			} as unknown as DragEvent;

			handler.handleDragOver(dragOverEvent, "node-2");
			expect(handler.dropPosition).toBe("into");
		});

		it("should reset state on drag end", () => {
			const handler = createDragHandler();
			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);
			handler.handleDragEnd();

			expect(handler.draggedNodeId).toBeNull();
			expect(handler.dragType).toBeNull();
		});

		it("should call onNodeMove on drop", () => {
			const onNodeMove = vi.fn(() => true);
			const handler = createDragHandler(onNodeMove);

			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);
			handler.handleDragOver(
				{
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 100 }) },
					clientY: 50,
					dataTransfer: { dropEffect: "" },
				} as unknown as DragEvent,
				"node-2",
			);

			const dropEvent = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as DragEvent;

			handler.handleDrop(dropEvent, "node-2");

			expect(onNodeMove).toHaveBeenCalledWith("node-1", "node-2", undefined, "into");
		});

		it("should call onSlotMove on slot drop", () => {
			const onSlotMove = vi.fn(() => true);
			const handler = createDragHandler(undefined, onSlotMove);

			handler.handleSlotDragStart(
				{
					dataTransfer: { effectAllowed: "", setData: vi.fn() },
				} as unknown as DragEvent,
				"parent-1",
				"body",
			);

			handler.handleSlotDragOver(
				{
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					dataTransfer: { dropEffect: "" },
				} as unknown as DragEvent,
				"parent-2",
				"footer",
			);

			handler.handleDrop(
				{
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as DragEvent,
				"parent-2",
				"footer",
			);

			expect(onSlotMove).toHaveBeenCalledWith("parent-1", "body", "parent-2", "footer");
		});

		it("should prevent drop on self", () => {
			const onNodeMove = vi.fn();
			const handler = createDragHandler(onNodeMove);

			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);

			handler.handleDrop(
				{
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
				} as unknown as DragEvent,
				"node-1",
			);

			expect(onNodeMove).not.toHaveBeenCalled();
		});

		it("should handle drag leave", () => {
			const handler = createDragHandler();

			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);
			handler.handleDragOver(
				{
					preventDefault: vi.fn(),
					stopPropagation: vi.fn(),
					currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 100 }) },
					clientY: 50,
					dataTransfer: { dropEffect: "" },
				} as unknown as DragEvent,
				"node-2",
			);

			expect(handler.dropTargetId).toBe("node-2");

			handler.handleDragLeave();

			expect(handler.dropTargetId).toBeNull();
			expect(handler.dropPosition).toBeNull();
		});

		it("should cleanup on global dragend", () => {
			const handler = createDragHandler();

			handler.handleDragStart(
				{
					dataTransfer: {
						effectAllowed: "",
						setData: vi.fn(),
					},
				} as unknown as DragEvent,
				"node-1",
			);

			expect(handler.draggedNodeId).toBe("node-1");

			// Simulate global dragend event (e.g., ESC key pressed)
			const dragEndEvent = new Event("dragend");
			document.dispatchEvent(dragEndEvent);

			// State should be reset
			expect(handler.draggedNodeId).toBeNull();
			expect(handler.dragType).toBeNull();
		});
	});
});
