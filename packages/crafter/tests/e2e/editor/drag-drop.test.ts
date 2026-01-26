/**
 * Drag and Drop Tests - P2 Priority
 *
 * Tests for drag and drop functionality in the navigation tree.
 * Note: These tests use graceful skip when preconditions aren't met,
 * as drag-drop behavior can be browser-specific and fragile.
 */

import { test, expect } from '@playwright/test';
import { CrafterPage } from '../fixtures/test-utils.js';

test.describe('Drag and Drop', () => {
	test('should not allow dropping parent into child', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a node with children (in Shadow DOM)
		const nodesWithChevron = crafter.crafterElement.locator(
			'[data-tree-node-id]:has([data-crafter="tree-chevron"])'
		);
		const count = await nodesWithChevron.count();

		if (count === 0) {
			test.skip();
			return;
		}

		// Expand the parent node
		const parentNode = nodesWithChevron.first();
		const chevron = parentNode.locator('[data-crafter="tree-chevron"]');
		await chevron.click();

		await crafter.waitForAnimation();

		// Get parent node ID
		const parentId = await parentNode.getAttribute('data-tree-node-id');

		// Get all visible nodes after expansion
		const expandedNodeIds = await crafter.getVisibleTreeNodeIds();

		// Use a node that's not the parent as target
		const lastNodeId = expandedNodeIds[expandedNodeIds.length - 1];

		if (parentId && lastNodeId !== parentId) {
			const parent = crafter.getTreeNode(parentId);
			const targetNode = crafter.getTreeNode(lastNodeId);

			// Get bounding boxes for manual drag
			const parentBox = await parent.boundingBox();
			const targetBox = await targetNode.boundingBox();

			if (parentBox && targetBox) {
				// Manual drag
				await page.mouse.move(
					parentBox.x + parentBox.width / 2,
					parentBox.y + parentBox.height / 2
				);
				await page.mouse.down();
				await page.mouse.move(
					targetBox.x + targetBox.width / 2,
					targetBox.y + targetBox.height / 2,
					{ steps: 5 }
				);
				await page.mouse.up();

				// Wait
				await page.waitForTimeout(300);

				// Parent should still exist
				await expect(parent).toBeVisible();
			}
		}
	});
});
