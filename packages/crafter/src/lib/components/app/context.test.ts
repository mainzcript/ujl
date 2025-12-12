import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOperations, generateNodeId, findPathToNode } from './context.js';
import { createMockTree, createMockNode, createMockMultiSlotTree } from '$lib/../tests/mockData.js';
import type { UJLCSlotObject } from '@ujl-framework/types';

describe('context', () => {
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
		let updateRootSlot: ReturnType<typeof vi.fn>;
		let operations: ReturnType<typeof createOperations>;

		beforeEach(() => {
			slot = createMockTree();
			getSlot = () => slot;
			updateRootSlot = vi.fn((fn) => {
				slot = fn(slot);
			});
			operations = createOperations(getSlot, updateRootSlot);
		});

		describe('copyNode', () => {
			it('should preserve ID when copying', () => {
				const result = operations.copyNode('nested-1');

				expect(result).toBeDefined();
				expect(result?.meta.id).toBe('nested-1');
				expect(result?.type).toBe('card');
			});

			it('should not copy root-level nodes', () => {
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
				expect(result?.fields.content).toBe('Leaf 1');
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

				// Verify leaf-1 was removed from nested-1
				const nested1 = slot[0].slots.body[0];
				expect(nested1.slots.content).toHaveLength(0);

				// Verify leaf-1 was added to nested-2
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

				// nested-2 should now be before nested-1
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

			it('should adjust position when moving down in same slot', () => {
				const root = slot[0];
				const originalFirst = root.slots.body[0].meta.id;
				const originalSecond = root.slots.body[1].meta.id;

				const success = operations.moveNode(originalFirst, originalSecond, undefined, 'after');
				expect(success).toBe(true);

				const updatedRoot = slot[0];
				expect(updatedRoot.slots.body[0].meta.id).toBe(originalSecond);
				expect(updatedRoot.slots.body[1].meta.id).toBe(originalFirst);
			});

			it('should allow move before root-level node', () => {
				const success = operations.moveNode('nested-1', 'root-1', undefined, 'before');
				expect(success).toBe(true);
			});
		});

		describe('reorderNode', () => {
			it('should reorder siblings', () => {
				const success = operations.reorderNode('nested-2', 'nested-1', 'before');
				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body[0].meta.id).toBe('nested-2');
				expect(root.slots.body[1].meta.id).toBe('nested-1');
			});

			it('should reject reorder of root node', () => {
				const success = operations.reorderNode('root-1', 'nested-1', 'before');
				expect(success).toBe(false);
			});

			it('should reject reorder relative to root', () => {
				const success = operations.reorderNode('nested-1', 'root-1', 'after');
				expect(success).toBe(false);
			});

			it('should reject reorder of non-siblings', () => {
				const success = operations.reorderNode('leaf-1', 'nested-2', 'before');
				expect(success).toBe(false);
			});

			it('should handle after position', () => {
				const success = operations.reorderNode('nested-1', 'nested-2', 'after');
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

			it('should allow delete of root-level node', () => {
				const success = operations.deleteNode('root-1');
				expect(success).toBe(true);
				expect(slot).toHaveLength(0);
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

			it('should allow cut of root-level node', () => {
				const result = operations.cutNode('root-1');
				expect(result).toBeDefined();
				expect(result?.meta.id).toBe('root-1');
				expect(slot).toHaveLength(0);
			});

			it('should return null for non-existent node', () => {
				const result = operations.cutNode('non-existent');
				expect(result).toBeNull();
			});
		});

		describe('pasteNode', () => {
			it('should paste node into target slot', () => {
				const copied = operations.copyNode('leaf-1')!;
				const success = operations.pasteNode(copied, 'nested-2');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const nested2 = slot[0].slots.body[1];
				expect(nested2.slots.content.length).toBeGreaterThan(2);
			});

			it('should paste into specific slot', () => {
				slot = createMockMultiSlotTree();
				const copied = operations.copyNode('header-item')!;
				const success = operations.pasteNode(copied, 'multi-slot-root', 'footer');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.footer).toHaveLength(2);
			});

			it('should allow paste of node with same ID (new IDs generated)', () => {
				const existingNode = slot[0].slots.body[0];
				const success = operations.pasteNode(existingNode, 'nested-2');
				expect(success).toBe(true);
			});

			it('should reject paste into node without slots', () => {
				const copied = operations.copyNode('nested-1')!;
				const success = operations.pasteNode(copied, 'leaf-1');

				expect(success).toBe(false);
			});

			it('should reject paste into non-existent target', () => {
				const copied = operations.copyNode('leaf-1')!;
				const success = operations.pasteNode(copied, 'non-existent');

				expect(success).toBe(false);
			});

			it('should use first slot if no slot specified', () => {
				const copied = operations.copyNode('leaf-1')!;
				const success = operations.pasteNode(copied, 'nested-1');

				expect(success).toBe(true);

				const nested1 = slot[0].slots.body[0];
				expect(nested1.slots.content.length).toBeGreaterThan(1);
			});
		});

		describe('insertNode', () => {
			it('should insert component from library', () => {
				const success = operations.insertNode('button', 'nested-1', undefined, 'into');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const nested1 = slot[0].slots.body[0];
				const inserted = nested1.slots.content[nested1.slots.content.length - 1];
				expect(inserted.type).toBe('button');
				expect(inserted.fields.label).toBe('Click me');
			});

			it('should insert text component', () => {
				const success = operations.insertNode('text', 'nested-1', undefined, 'into');

				expect(success).toBe(true);

				const nested1 = slot[0].slots.body[0];
				const inserted = nested1.slots.content[nested1.slots.content.length - 1];
				expect(inserted.type).toBe('text');
				expect(inserted.fields.content).toBe('Enter your text here...');
			});

			it('should insert card component with slots', () => {
				const success = operations.insertNode('card', 'nested-1', undefined, 'into');

				expect(success).toBe(true);

				const nested1 = slot[0].slots.body[0];
				const inserted = nested1.slots.content[nested1.slots.content.length - 1];
				expect(inserted.type).toBe('card');
				expect(inserted.slots.content).toBeDefined();
			});

			it('should insert before position', () => {
				const success = operations.insertNode('text', 'nested-1', undefined, 'before');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body[0].type).toBe('text');
				expect(root.slots.body[1].meta.id).toBe('nested-1');
			});

			it('should insert after position', () => {
				const success = operations.insertNode('text', 'nested-1', undefined, 'after');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body[0].meta.id).toBe('nested-1');
				expect(root.slots.body[1].type).toBe('text');
			});

			it('should insert into specific slot', () => {
				slot = createMockMultiSlotTree();
				const success = operations.insertNode('text', 'multi-slot-root', 'footer', 'into');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.footer).toHaveLength(2);
			});

			it('should reject insert of unknown component', () => {
				const success = operations.insertNode('unknown-type', 'nested-1');
				expect(success).toBe(false);
			});

			it('should reject insert into node without slots when using into', () => {
				const success = operations.insertNode('text', 'leaf-1', undefined, 'into');
				expect(success).toBe(false);
			});

			it('should generate unique ID for inserted node', () => {
				operations.insertNode('text', 'nested-1');
				operations.insertNode('text', 'nested-1');

				const nested1 = slot[0].slots.body[0];
				const ids = nested1.slots.content.map((n) => n.meta.id);
				const uniqueIds = new Set(ids);

				expect(uniqueIds.size).toBe(ids.length);
			});
		});

		describe('copySlot', () => {
			beforeEach(() => {
				slot = createMockMultiSlotTree();
			});

			it('should copy slot content', () => {
				const result = operations.copySlot('multi-slot-root', 'body');

				expect(result).toBeDefined();
				expect(result?.type).toBe('slot');
				expect(result?.slotName).toBe('body');
				expect(result?.content).toHaveLength(2);
			});

			it('should copy empty slot', () => {
				// First empty the slot
				operations.cutSlot('multi-slot-root', 'header');

				const result = operations.copySlot('multi-slot-root', 'header');

				expect(result).toBeDefined();
				expect(result?.content).toHaveLength(0);
			});

			it('should return null for non-existent slot', () => {
				const result = operations.copySlot('multi-slot-root', 'non-existent');
				expect(result).toBeNull();
			});

			it('should return null for non-existent parent', () => {
				const result = operations.copySlot('non-existent', 'body');
				expect(result).toBeNull();
			});
		});

		describe('cutSlot', () => {
			beforeEach(() => {
				slot = createMockMultiSlotTree();
			});

			it('should cut and empty slot', () => {
				const result = operations.cutSlot('multi-slot-root', 'body');

				expect(result).toBeDefined();
				expect(result?.content).toHaveLength(2);
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.body).toHaveLength(0);
			});

			it('should preserve cut content', () => {
				const result = operations.cutSlot('multi-slot-root', 'body');

				expect(result?.content[0].meta.id).toBe('body-item-1');
				expect(result?.content[1].meta.id).toBe('body-item-2');
			});

			it('should return null for non-existent slot', () => {
				const result = operations.cutSlot('multi-slot-root', 'non-existent');
				expect(result).toBeNull();
			});
		});

		describe('pasteSlot', () => {
			beforeEach(() => {
				slot = createMockMultiSlotTree();
				operations = createOperations(getSlot, updateRootSlot);
			});

			it('should paste slot content with new IDs', () => {
				const slotData = {
					type: 'slot' as const,
					slotName: 'header',
					content: [createMockNode('new-1', 'text', { content: 'Test' })]
				};
				const success = operations.pasteSlot(slotData, 'multi-slot-root');

				expect(success).toBe(true);
				const root = slot[0];
				expect(root.slots.header).toHaveLength(1);
				expect(root.slots.header[0].meta.id).not.toBe('new-1');
				expect(root.slots.header[0].meta.id).toHaveLength(10);
			});

			it('should replace existing slot content with new IDs', () => {
				const slotData = {
					type: 'slot' as const,
					slotName: 'body',
					content: [createMockNode('replacement', 'text', { content: 'Replaced' })]
				};
				const success = operations.pasteSlot(slotData, 'multi-slot-root');

				expect(success).toBe(true);
				const root = slot[0];
				expect(root.slots.body).toHaveLength(1);
				expect(root.slots.body[0].meta.id).not.toBe('replacement');
				expect(root.slots.body[0].meta.id).toHaveLength(10);
			});

			it('should reject paste to non-matching slot', () => {
				const slotData = {
					type: 'slot' as const,
					slotName: 'non-existent',
					content: []
				};

				const success = operations.pasteSlot(slotData, 'multi-slot-root');
				expect(success).toBe(false);
			});

			it('should reject paste to node without slots', () => {
				const slotData = {
					type: 'slot' as const,
					slotName: 'body',
					content: []
				};

				const success = operations.pasteSlot(slotData, 'header-item');
				expect(success).toBe(false);
			});
		});

		describe('moveSlot', () => {
			beforeEach(() => {
				slot = createMockMultiSlotTree();
				// Reset the mock function call count
				updateRootSlot.mockClear();
			});

			it('should move slot content', () => {
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'footer'
				);

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const root = slot[0];
				expect(root.slots.header).toHaveLength(0);
				// Footer should now only contain header-item (it replaces footer-item)
				expect(root.slots.footer).toHaveLength(1);
				expect(root.slots.footer[0].meta.id).toBe('header-item');
			});

			it('should reject move to same slot', () => {
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'header'
				);
				expect(success).toBe(false);
			});

			it('should reject move to non-existent slot', () => {
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'non-existent'
				);
				expect(success).toBe(false);
			});

			it('should reject move from non-existent slot', () => {
				const success = operations.moveSlot(
					'multi-slot-root',
					'non-existent',
					'multi-slot-root',
					'footer'
				);
				expect(success).toBe(false);
			});

			it('should handle empty source slot', () => {
				// First, cut the header to make it empty
				const cutResult = operations.cutSlot('multi-slot-root', 'header');
				expect(cutResult).toBeDefined();
				expect(cutResult?.content).toHaveLength(1); // header-item was cut

				// Verify header is now empty
				let root = slot[0];
				expect(root.slots.header).toHaveLength(0);

				// Remember original footer content
				const originalFooterItem = root.slots.footer[0].meta.id;
				expect(originalFooterItem).toBe('footer-item');

				// Now try to move the empty header slot to footer
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'footer'
				);

				expect(success).toBe(true);

				root = slot[0];
				// Header should still be empty
				expect(root.slots.header).toHaveLength(0);
				// Footer should now be empty too (empty array moved = empty target)
				expect(root.slots.footer).toHaveLength(0);
			});

			it('should move multiple items in slot', () => {
				// Body has 2 items
				const bodyLength = slot[0].slots.body.length;
				expect(bodyLength).toBe(2);

				const success = operations.moveSlot('multi-slot-root', 'body', 'multi-slot-root', 'footer');

				expect(success).toBe(true);

				const root = slot[0];
				expect(root.slots.body).toHaveLength(0);
				expect(root.slots.footer).toHaveLength(2);
				expect(root.slots.footer[0].meta.id).toBe('body-item-1');
				expect(root.slots.footer[1].meta.id).toBe('body-item-2');
			});

			it('should replace target slot content', () => {
				// Verify initial state
				const root = slot[0];
				expect(root.slots.footer).toHaveLength(1);
				expect(root.slots.footer[0].meta.id).toBe('footer-item');
				expect(root.slots.header).toHaveLength(1);
				expect(root.slots.header[0].meta.id).toBe('header-item');

				// Move header (with header-item) to footer
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'footer'
				);

				expect(success).toBe(true);

				const updatedRoot = slot[0];
				// Header should be empty
				expect(updatedRoot.slots.header).toHaveLength(0);
				// Footer should now only contain header-item (replaced footer-item)
				expect(updatedRoot.slots.footer).toHaveLength(1);
				expect(updatedRoot.slots.footer[0].meta.id).toBe('header-item');
			});

			it('should handle moving to empty target slot', () => {
				// First empty the footer
				operations.cutSlot('multi-slot-root', 'footer');

				let root = slot[0];
				expect(root.slots.footer).toHaveLength(0);

				// Move header to empty footer
				const success = operations.moveSlot(
					'multi-slot-root',
					'header',
					'multi-slot-root',
					'footer'
				);

				expect(success).toBe(true);

				root = slot[0];
				expect(root.slots.header).toHaveLength(0);
				expect(root.slots.footer).toHaveLength(1);
				expect(root.slots.footer[0].meta.id).toBe('header-item');
			});
		});

		describe('updateNodeField', () => {
			it('should update single field', () => {
				const success = operations.updateNodeField('leaf-1', 'content', 'Updated Content');

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.fields.content).toBe('Updated Content');
			});

			it('should update timestamp', () => {
				const originalTimestamp = slot[0].slots.body[0].slots.content[0].meta.updated_at;

				operations.updateNodeField('leaf-1', 'content', 'New Content');

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.meta.updated_at).not.toBe(originalTimestamp);
			});

			it('should return false for non-existent node', () => {
				const success = operations.updateNodeField('non-existent', 'content', 'Test');
				expect(success).toBe(false);
			});

			it('should handle adding new field', () => {
				const success = operations.updateNodeField('leaf-1', 'newField', 'New Value');

				expect(success).toBe(true);

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.fields.newField).toBe('New Value');
			});

			it('should handle various value types', () => {
				operations.updateNodeField('leaf-1', 'string', 'text');
				operations.updateNodeField('leaf-1', 'number', 42);
				operations.updateNodeField('leaf-1', 'boolean', true);
				operations.updateNodeField('leaf-1', 'array', [1, 2, 3]);
				operations.updateNodeField('leaf-1', 'object', { key: 'value' });

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.fields.string).toBe('text');
				expect(updated.fields.number).toBe(42);
				expect(updated.fields.boolean).toBe(true);
				expect(updated.fields.array).toEqual([1, 2, 3]);
				expect(updated.fields.object).toEqual({ key: 'value' });
			});
		});

		describe('updateNodeFields', () => {
			it('should update multiple fields', () => {
				const success = operations.updateNodeFields('leaf-1', {
					content: 'New Content',
					author: 'Test Author',
					published: true
				});

				expect(success).toBe(true);
				expect(updateRootSlot).toHaveBeenCalled();

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.fields.content).toBe('New Content');
				expect(updated.fields.author).toBe('Test Author');
				expect(updated.fields.published).toBe(true);
			});

			it('should update timestamp', () => {
				const originalTimestamp = slot[0].slots.body[0].slots.content[0].meta.updated_at;

				operations.updateNodeFields('leaf-1', { content: 'New' });

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.meta.updated_at).not.toBe(originalTimestamp);
			});

			it('should return false for non-existent node', () => {
				const success = operations.updateNodeFields('non-existent', { field: 'value' });
				expect(success).toBe(false);
			});

			it('should handle empty updates object', () => {
				const success = operations.updateNodeFields('leaf-1', {});

				expect(success).toBe(true);
				// Timestamp should still update even with no field changes
				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.meta.updated_at).not.toBe('2024-01-01T00:00:00Z');
			});

			it('should preserve existing fields', () => {
				const original = slot[0].slots.body[0].slots.content[0];
				const originalContent = original.fields.content;

				operations.updateNodeFields('leaf-1', { newField: 'new value' });

				const updated = slot[0].slots.body[0].slots.content[0];
				expect(updated.fields.content).toBe(originalContent);
				expect(updated.fields.newField).toBe('new value');
			});
		});
	});
});
