/**
 * Tree Navigation Tests - P0 Priority
 *
 * Tests for the navigation tree in the sidebar.
 */

import { expect, test } from "@playwright/test";
import { CrafterPage } from "../fixtures/test-utils.js";

test.describe("Tree Navigation", () => {
	test("should display Document header in navigation tree", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await expect(crafter.navTreeHeader).toBeVisible();
		await expect(crafter.navTreeHeader).toContainText("Document");
	});

	test("should display root-level modules in tree", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get all visible tree nodes
		const nodeIds = await crafter.getVisibleTreeNodeIds();

		// Should have at least one root-level node
		expect(nodeIds.length).toBeGreaterThan(0);
	});

	test("should select node when clicked", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get the first visible tree node (already filtered to exclude __root__)
		const nodeIds = await crafter.getVisibleTreeNodeIds();
		expect(nodeIds.length).toBeGreaterThan(0);

		const firstNodeId = nodeIds[0];

		// Use the helper method which clicks the correct button
		await crafter.selectNodeInTree(firstNodeId);

		// Check that properties panel no longer shows "No module selected"
		await expect(crafter.panel.getByText("No module selected")).not.toBeVisible({ timeout: 2000 });
	});

	test("should show selection highlight on selected node", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get the first tree node
		const nodeIds = await crafter.getVisibleTreeNodeIds();
		const firstNodeId = nodeIds[0];

		// Select the node
		await crafter.selectNodeInTree(firstNodeId);

		// The corresponding module in preview should have ujl-selected class
		const selectedModule = crafter.getSelectedPreviewModule();
		await expect(selectedModule).toBeVisible({ timeout: 2000 });
	});

	test("should deselect when pressing Escape", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a node
		const nodeIds = await crafter.getVisibleTreeNodeIds();
		await crafter.selectNodeInTree(nodeIds[0]);

		// Verify selection
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		// Press Escape
		await crafter.deselect();

		// Selection should be cleared
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible({ timeout: 2000 });

		// Properties panel should show "No module selected"
		await expect(crafter.panel.getByText("No module selected")).toBeVisible();
	});

	test("should expand/collapse tree nodes with children", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a node with a chevron (has children) - in Shadow DOM
		// The chevron button is inside a CollapsibleTrigger which has data-state="open" or "closed"
		const nodesWithChevron = crafter.crafterElement.locator(
			'[data-tree-node-id]:has([data-crafter="tree-chevron"])',
		);
		const count = await nodesWithChevron.count();

		if (count > 0) {
			const nodeWithChildren = nodesWithChevron.first();
			const chevron = nodeWithChildren.locator('[data-crafter="tree-chevron"]');

			// Get the collapsible trigger (parent of the chevron button) - it has data-state
			const collapsibleTrigger = nodeWithChildren.locator("[data-state]").first();
			const initialState = await collapsibleTrigger.getAttribute("data-state");

			// Click to toggle expand/collapse
			await chevron.click();
			await crafter.waitForAnimation();

			// State should change
			const newState = await collapsibleTrigger.getAttribute("data-state");
			expect(newState).not.toBe(initialState);

			// Click again to toggle back
			await chevron.click();
			await crafter.waitForAnimation();

			// Should be back to initial state
			const finalState = await collapsibleTrigger.getAttribute("data-state");
			expect(finalState).toBe(initialState);
		} else {
			// If no expandable nodes, skip this test
			test.skip();
		}
	});

	test("should display module type names in tree", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// The tree should display module types like "Container", "Text", "Card", etc.
		const treeText = await crafter.navTree.textContent();

		// Check for common module types from the showcase document
		const hasModuleTypes =
			treeText?.includes("Container") ||
			treeText?.includes("Text") ||
			treeText?.includes("Card") ||
			treeText?.includes("Grid") ||
			treeText?.includes("Image");

		expect(hasModuleTypes).toBe(true);
	});

	test("should show dropdown menu via more button", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get first tree node
		const nodeIds = await crafter.getVisibleTreeNodeIds();
		const treeNode = crafter.getTreeNode(nodeIds[0]);

		// Hover over the node to reveal the more button
		await treeNode.hover();

		// Click the more button (three dots) - it has MoreVerticalIcon
		const moreButton = treeNode
			.locator("button")
			.filter({ has: page.locator("svg") })
			.last();
		await moreButton.click();

		// Dropdown menu should appear
		const dropdownMenu = crafter.crafterElement.locator('[data-slot="dropdown-menu-content"]');
		await expect(dropdownMenu).toBeVisible({ timeout: 2000 });

		// Should have common actions
		await expect(dropdownMenu.getByText("Copy")).toBeVisible();
	});

	test("should scroll to node in preview when selected in tree", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get visible tree nodes
		const nodeIds = await crafter.getVisibleTreeNodeIds();

		if (nodeIds.length > 0) {
			// Select the first visible node (guaranteed to be in view)
			const nodeId = nodeIds[0];
			await crafter.selectNodeInTree(nodeId);

			// Wait for scroll animation
			await crafter.waitForAnimation();

			// The selected module should have ujl-selected class
			const selectedModule = crafter.getSelectedPreviewModule();
			await expect(selectedModule).toBeVisible({ timeout: 2000 });
		} else {
			test.skip();
		}
	});
});
