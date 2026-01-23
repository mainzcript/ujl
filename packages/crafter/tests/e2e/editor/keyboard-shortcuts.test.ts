/**
 * Keyboard Shortcuts Tests - P1 Priority
 *
 * Tests for keyboard shortcuts in the editor.
 */

import { test, expect } from '@playwright/test';
import { CrafterPage } from '../fixtures/test-utils.js';

test.describe('Keyboard Shortcuts', () => {
	test('should open component picker with Ctrl+I', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Press Ctrl+I
		await page.keyboard.press('Control+i');

		// Component picker should be visible
		await expect(crafter.componentPicker).toBeVisible();
	});

	test('should open component picker with Ctrl+I even without selection', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Make sure nothing is selected
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible();

		// Press Ctrl+I
		await page.keyboard.press('Control+i');

		// Component picker should open (insert at root)
		await expect(crafter.componentPicker).toBeVisible();
	});

	test('should copy selected node with Ctrl+C', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a node
		const moduleIds = await crafter.getPreviewModuleIds();
		await crafter.selectModuleInPreview(moduleIds[0]);

		// Copy the node
		await crafter.copySelectedNode();

		// The node should still be there (copy, not cut)
		await expect(crafter.getPreviewModule(moduleIds[0])).toBeVisible();
	});

	test('should cut selected node with Ctrl+X', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get initial module count
		const initialModuleIds = await crafter.getPreviewModuleIds();
		const moduleToRemove = initialModuleIds[initialModuleIds.length - 1]; // Last module

		// Select the module
		await crafter.selectModuleInPreview(moduleToRemove);

		// Cut the node
		await crafter.cutSelectedNode();

		// Wait for DOM update
		await page.waitForTimeout(500);

		// The module should be removed
		await expect(crafter.getPreviewModule(moduleToRemove)).not.toBeVisible({ timeout: 2000 });
	});

	test('should paste node with Ctrl+V after copy', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get initial tree node IDs
		const initialTreeNodeIds = await crafter.getVisibleTreeNodeIds();
		const idsBefore = new Set(initialTreeNodeIds);

		// Select a node via tree (ensures it's a selectable module)
		await crafter.selectNodeInTree(initialTreeNodeIds[0]);

		// Copy it
		await crafter.copySelectedNode();

		// Paste it
		await crafter.pasteNode();

		// Wait for DOM update
		await page.waitForTimeout(500);

		// After paste: at least one new ID should exist
		const idsAfter = await crafter.getVisibleTreeNodeIds();
		const newIds = idsAfter.filter((id) => !idsBefore.has(id));
		expect(newIds.length).toBeGreaterThan(0);
	});

	test('should delete selected node with Delete key', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get initial count
		const initialModuleIds = await crafter.getPreviewModuleIds();
		const initialCount = initialModuleIds.length;

		// Select the last module (not root)
		const moduleToDelete = initialModuleIds[initialModuleIds.length - 1];
		await crafter.selectModuleInPreview(moduleToDelete);

		// Delete it
		await crafter.deleteSelectedNode();

		// Wait for DOM update
		await page.waitForTimeout(500);

		// Module count should decrease
		const newModuleIds = await crafter.getPreviewModuleIds();
		expect(newModuleIds.length).toBe(initialCount - 1);

		// The specific module should be gone
		await expect(crafter.getPreviewModule(moduleToDelete)).not.toBeVisible();
	});

	test('should delete node with Backspace key', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get a deletable module
		const moduleIds = await crafter.getPreviewModuleIds();
		const moduleToDelete = moduleIds[moduleIds.length - 1];

		// Select and delete with Backspace
		await crafter.selectModuleInPreview(moduleToDelete);
		await page.keyboard.press('Backspace');

		// Wait for DOM update
		await page.waitForTimeout(500);

		// Module should be gone
		await expect(crafter.getPreviewModule(moduleToDelete)).not.toBeVisible();
	});

	test('should deselect with Escape key', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a node
		const moduleIds = await crafter.getPreviewModuleIds();
		await crafter.selectModuleInPreview(moduleIds[0]);
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		// Press Escape
		await crafter.deselect();

		// Selection should be cleared
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible({ timeout: 2000 });
	});

	test('should not trigger shortcuts when input is focused', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a node to show properties panel
		const moduleIds = await crafter.getPreviewModuleIds();
		await crafter.selectModuleInPreview(moduleIds[0]);

		// Wait for panel to update
		await page.waitForTimeout(300);

		// Find an input in the properties panel
		const input = crafter.panel.locator('input').first();

		if (await input.isVisible()) {
			// Focus the input
			await input.focus();

			// Type Ctrl+I (should not open component picker)
			await page.keyboard.press('Control+i');

			// Component picker should NOT be visible (shortcut blocked in input)
			await expect(crafter.componentPicker).not.toBeVisible({ timeout: 1000 });
		}
	});

	test('should not delete root node', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get the root node (first in tree, marked as __root__)
		const rootNode = crafter.getTreeNode('__root__');

		if (await rootNode.isVisible()) {
			// Try to select root (should not be selectable)
			await rootNode.click();

			// Try to delete
			await page.keyboard.press('Delete');

			// Root should still exist
			await expect(rootNode).toBeVisible();
		}
	});

	test('should not allow paste when nothing is copied', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get initial count
		const initialModuleIds = await crafter.getPreviewModuleIds();
		const initialCount = initialModuleIds.length;

		// Select a node
		await crafter.selectModuleInPreview(initialModuleIds[0]);

		// Try to paste without copying first
		await crafter.pasteNode();

		// Wait
		await page.waitForTimeout(300);

		// Count should not change
		const newModuleIds = await crafter.getPreviewModuleIds();
		expect(newModuleIds.length).toBe(initialCount);
	});

	test('should close component picker with Escape', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Open component picker
		await crafter.openComponentPicker();
		await expect(crafter.componentPicker).toBeVisible();

		// Close with Escape
		await page.keyboard.press('Escape');

		// Should be closed
		await expect(crafter.componentPicker).not.toBeVisible({ timeout: 2000 });
	});
});
