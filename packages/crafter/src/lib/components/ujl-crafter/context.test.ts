import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOperations, generateNodeId, findPathToNode } from './context.js';
import { createMockTree, createMockMultiSlotTree } from '../../../tests/mockData.js';
import type { UJLCSlotObject } from '@ujl-framework/types';
import { Composer } from '@ujl-framework/core';

describe('ujl-crafter context', () => {
	describe('generateNodeId', () => {
		it('should generate 10-character ID', () => {
			const id = generateNodeId();
			expect(id).toHaveLength(10);
		});

		it('should generate unique IDs', () => {
			const ids = new Set();
			for (let i = 0; i < 100; i++) {
				ids.add(generateNodeId());
			}
			expect(ids.size).toBe(100);
		});

		it('should only contain valid characters', () => {
			const id = generateNodeId();
			expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
		});
	});

	describe('findPathToNode', () => {
		it('should find path to root node', () => {
			const tree = createMockTree();
			const path = findPathToNode(tree, 'root-1');

			expect(path).toEqual([]);
		});

		it('should find path to nested node', () => {
			const tree = createMockTree();
			const path = findPathToNode(tree, 'nested-1');

			expect(path).toEqual(['root-1']);
		});

		it('should find path to deeply nested node', () => {
			const tree = createMockTree();
			const path = findPathToNode(tree, 'leaf-1');

			expect(path).toEqual(['root-1', 'nested-1']);
		});

		it('should return null for non-existent node', () => {
			const tree = createMockTree();
			const path = findPathToNode(tree, 'non-existent');

			expect(path).toBeNull();
		});

		it('should handle multi-slot tree', () => {
			const tree = createMockMultiSlotTree();
			const path = findPathToNode(tree, 'body-item-1');

			expect(path).toEqual(['multi-slot-root']);
		});

		it('should handle empty tree', () => {
			const path = findPathToNode([], 'any-id');

			expect(path).toBeNull();
		});
	});

	describe('createOperations', () => {
		let slot: UJLCSlotObject;
		let getSlot: () => UJLCSlotObject;
		let updateRootSlot: ReturnType<
			typeof vi.fn<(fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void>
		>;
		let composer: Composer;
		let operations: ReturnType<typeof createOperations>;

		beforeEach(() => {
			slot = createMockTree();
			getSlot = () => slot;
			updateRootSlot = vi.fn((fn) => {
				slot = fn(slot);
			});
			composer = new Composer();
			operations = createOperations(getSlot, updateRootSlot, composer);
		});

		describe('copyNode', () => {
			it('should preserve ID when copying', () => {
				const result = operations.copyNode('nested-1');

				expect(result).toBeDefined();
				expect(result?.meta.id).toBe('nested-1');
				expect(result?.type).toBe('card');
			});

			it('should allow copy of root-level nodes', () => {
				const result = operations.copyNode('root-1');
				expect(result?.meta.id).toBe('root-1');
			});

			it('should return null for non-existent node', () => {
				const result = operations.copyNode('non-existent');
				expect(result).toBeNull();
			});

			it('should preserve all node properties', () => {
				const result = operations.copyNode('leaf-1');

				expect(result?.type).toBe('text');
				expect(typeof result?.fields.content).toBe('object');
				expect(result?.fields.content).toHaveProperty('type', 'doc');
				expect(result?.fields.content).toHaveProperty('content');
				expect(result?.meta.updated_at).toBeDefined();
			});

			it('should preserve nested structure', () => {
				const result = operations.copyNode('nested-1');

				expect(result?.slots.content).toBeDefined();
				expect(result?.slots.content).toHaveLength(1);
			});
		});

		describe('moveNode', () => {
			it('should move node to target slot', () => {
				const success = operations.moveNode('leaf-1', 'nested-2', undefined, 'into');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const nested1 = slot[0].slots.body[0];
				expect(nested1.slots.content).toHaveLength(0);

				const nested2 = slot[0].slots.body[1];
				expect(nested2.slots.content.length).toBeGreaterThan(2);
			});

			it('should move node to specific slot', () => {
				slot = createMockMultiSlotTree();
				const success = operations.moveNode('header-item', 'multi-slot-root', 'footer', 'into');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.header).toHaveLength(0);
				expect(root.slots.footer).toHaveLength(2);
			});

			it('should reject move of root node', () => {
				const success = operations.moveNode('root-1', 'nested-1', undefined, 'into');
				expect(success).toBe(false);
			});

			it('should reject move into descendant', () => {
				const success = operations.moveNode('nested-1', 'leaf-1', undefined, 'into');
				expect(success).toBe(false);
			});

			it('should reject move to node without slots', () => {
				const success = operations.moveNode('nested-1', 'leaf-1', undefined, 'into');
				expect(success).toBe(false);
			});

			it('should reject move to non-existent target', () => {
				const success = operations.moveNode('leaf-1', 'non-existent', undefined, 'into');
				expect(success).toBe(false);
			});

			it('should handle before position', () => {
				const success = operations.moveNode('nested-2', 'nested-1', undefined, 'before');
				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body[0].meta.id).toBe('nested-2');
				expect(root.slots.body[1].meta.id).toBe('nested-1');
			});

			it('should handle after position', () => {
				const success = operations.moveNode('nested-1', 'nested-2', undefined, 'after');
				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body[0].meta.id).toBe('nested-2');
				expect(root.slots.body[1].meta.id).toBe('nested-1');
			});
		});

		describe('deleteNode', () => {
			it('should delete nested node', () => {
				const success = operations.deleteNode('nested-1');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.body).toHaveLength(1);
				expect(root.slots.body[0].meta.id).toBe('nested-2');
			});

			it('should delete deeply nested node', () => {
				const success = operations.deleteNode('leaf-1');

				expect(success).toBe(true);

				const nested1 = slot[0].slots.body[0];
				expect(nested1.slots.content).toHaveLength(0);
			});

			it('should reject delete of root node', () => {
				const success = operations.deleteNode('__root__');
				expect(success).toBe(false);
			});

			it('should return false for non-existent node', () => {
				const success = operations.deleteNode('non-existent');
				expect(success).toBe(false);
			});
		});

		describe('cutNode', () => {
			it('should cut and remove node', () => {
				const result = operations.cutNode('nested-1');

				expect(result).toBeDefined();
				expect(result?.meta.id).toBe('nested-1');
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.body).toHaveLength(1);
			});

			it('should preserve cut node structure', () => {
				const result = operations.cutNode('nested-1');

				expect(result?.slots.content).toBeDefined();
				expect(result?.slots.content).toHaveLength(1);
			});

			it('should return null for non-existent node', () => {
				const result = operations.cutNode('non-existent');
				expect(result).toBeNull();
			});
		});

		describe('pasteNode', () => {
			it('should paste node after target by default', () => {
				const copied = operations.copyNode('nested-1')!;
				const originalLength = slot[0].slots.body.length;
				const newNodeId = operations.pasteNode(copied, 'nested-2');

				expect(newNodeId).toBeTruthy();
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.body.length).toBe(originalLength + 1);
			});

			it('should paste into specific slot when position is into', () => {
				slot = createMockMultiSlotTree();
				const copied = operations.copyNode('header-item')!;
				const newNodeId = operations.pasteNode(copied, 'multi-slot-root', 'footer', 'into');

				expect(newNodeId).toBeTruthy();

				const root = slot[0];
				expect(root.slots.footer).toHaveLength(2);
			});

			it('should generate new IDs when pasting', () => {
				const existingNode = slot[0].slots.body[0];
				const newNodeId = operations.pasteNode(existingNode, 'nested-2');
				expect(newNodeId).toBeTruthy();
				expect(newNodeId).not.toBe(existingNode.meta.id);
			});

			it('should reject paste into non-existent target', () => {
				const copied = operations.copyNode('leaf-1')!;
				const newNodeId = operations.pasteNode(copied, 'non-existent');

				expect(newNodeId).toBeNull();
			});
		});

		describe('insertNode', () => {
			it('should insert node after target by default', () => {
				const originalLength = slot[0].slots.body.length;
				const newNodeId = operations.insertNode('text', 'nested-2', undefined, 'after');

				expect(newNodeId).toBeTruthy();
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.body.length).toBe(originalLength + 1);
			});

			it('should insert into specific slot when position is into', () => {
				slot = createMockMultiSlotTree();
				const originalLength = slot[0].slots.footer.length;
				const newNodeId = operations.insertNode('text', 'multi-slot-root', 'footer', 'into');

				expect(newNodeId).toBeTruthy();

				const root = slot[0];
				expect(root.slots.footer.length).toBe(originalLength + 1);
			});

			it('should reject insert into non-existent target', () => {
				const newNodeId = operations.insertNode('text', 'non-existent', undefined, 'after');
				expect(newNodeId).toBeNull();
			});

			it('should reject insert of unknown component type', () => {
				const newNodeId = operations.insertNode('unknown-type', 'nested-1', undefined, 'after');
				expect(newNodeId).toBeNull();
			});
		});

		describe('updateNodeField', () => {
			it('should update single field', () => {
				const success = operations.updateNodeField('nested-1', 'title', 'New Title');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const nested1 = slot[0].slots.body[0];
				expect(nested1.fields.title).toBe('New Title');
				expect(nested1.meta.updated_at).toBeDefined();
			});

			it('should update timestamp on field change', () => {
				const originalTimestamp = slot[0].slots.body[0].meta.updated_at;
				operations.updateNodeField('nested-1', 'title', 'New Title');

				const nested1 = slot[0].slots.body[0];
				expect(nested1.meta.updated_at).not.toBe(originalTimestamp);
			});

			it('should return false for non-existent node', () => {
				const success = operations.updateNodeField('non-existent', 'title', 'New Title');
				expect(success).toBe(false);
			});
		});

		describe('updateNodeFields', () => {
			it('should update multiple fields at once', () => {
				const success = operations.updateNodeFields('nested-1', {
					title: 'New Title',
					description: 'New Description'
				});

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const nested1 = slot[0].slots.body[0];
				expect(nested1.fields.title).toBe('New Title');
				expect(nested1.fields.description).toBe('New Description');
			});

			it('should update timestamp on bulk field change', () => {
				const originalTimestamp = slot[0].slots.body[0].meta.updated_at;
				operations.updateNodeFields('nested-1', { title: 'New Title' });

				const nested1 = slot[0].slots.body[0];
				expect(nested1.meta.updated_at).not.toBe(originalTimestamp);
			});

			it('should return false for non-existent node', () => {
				const success = operations.updateNodeFields('non-existent', { title: 'New Title' });
				expect(success).toBe(false);
			});
		});
	});
});
