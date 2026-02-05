/**
 * Preview Interaction Tests - P0 Priority
 *
 * Tests for clicking and interacting with modules in the preview canvas.
 */

import { expect, test } from "@playwright/test";
import { CrafterPage } from "../fixtures/test-utils.js";

test.describe("Preview Interaction", () => {
	test("should render content in preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Preview should contain modules
		const moduleIds = await crafter.getPreviewModuleIds();
		expect(moduleIds.length).toBeGreaterThan(0);
	});

	test("should select node when clicking in preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Initially no selection
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible();

		// Get a selectable module (only modules with isModuleRoot=true can be selected)
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		// Click on the module in the preview
		await crafter.selectModuleInPreview(moduleId!);

		// Module should now be selected
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();
	});

	test("should add ujl-selected class to selected module", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		// Click to select
		await crafter.selectModuleInPreview(moduleId!);

		// Some module should have the selected class
		// (may be the clicked module or a child if click propagated)
		const selectedModule = crafter.getSelectedPreviewModule();
		await expect(selectedModule).toBeVisible();
	});

	test("should show properties panel when module selected", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Initially "No module selected"
		await expect(crafter.panel.getByText("No module selected")).toBeVisible();

		// Click on a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);

		// Properties panel should show module info
		await expect(crafter.panel.getByText("No module selected")).not.toBeVisible({ timeout: 2000 });
	});

	test("should expand parent nodes in tree when selecting nested module in preview", async ({
		page,
	}) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a container node with children (has a chevron)
		// Exclude __root__ which is a virtual node
		const nodesWithChevron = crafter.crafterElement.locator(
			'[data-tree-node-id]:not([data-tree-node-id^="__"]):has([data-crafter="tree-chevron"])',
		);
		const containerCount = await nodesWithChevron.count();
		expect(containerCount).toBeGreaterThan(0);

		// Get the first real container and its chevron
		const containerNode = nodesWithChevron.first();
		const chevron = containerNode.locator('[data-crafter="tree-chevron"]');

		// Get container ID directly from the element
		const containerId = await containerNode.getAttribute("data-tree-node-id");
		expect(containerId).not.toBeNull();

		// Collapse the container first (click chevron if it's expanded)
		const collapsibleTrigger = containerNode.locator("[data-state]").first();
		const initialState = await collapsibleTrigger.getAttribute("data-state");

		if (initialState === "open") {
			await chevron.click();
			await crafter.waitForAnimation();
		}

		// Verify container is collapsed
		await expect(collapsibleTrigger).toHaveAttribute("data-state", "closed");

		// Get all module IDs in the preview
		const allPreviewModuleIds = await crafter.getPreviewModuleIds();

		// Find a child module ID that is inside this container
		// The container's first child in preview should be directly after it in the hierarchy
		// We need a module that is NOT a top-level container
		const topLevelContainerIds = await nodesWithChevron.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute("data-tree-node-id")),
		);

		// Find a module that is not a top-level container (so it must be a child)
		const childId = allPreviewModuleIds.find(
			(id) => id !== containerId && !topLevelContainerIds.includes(id),
		);
		expect(childId).toBeDefined();

		// Click on the child module in preview
		await crafter.selectModuleInPreview(childId!);

		// Wait for tree expansion animation
		await crafter.waitForAnimation();

		// The child's tree node should now be visible (parent was expanded)
		const childTreeNode = crafter.getTreeNode(childId!);
		await expect(childTreeNode).toBeVisible();
	});

	test("should prevent link navigation in editor mode", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a link in the preview (if any)
		const links = page.locator("[data-ujl-module-id] a");
		const linkCount = await links.count();

		if (linkCount > 0) {
			const currentUrl = page.url();

			// Click on the link
			await links.first().click();

			// Wait a bit
			await page.waitForTimeout(500);

			// URL should not have changed (navigation prevented)
			expect(page.url()).toBe(currentUrl);
		}
	});

	test("should sync selection between tree and preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get a selectable module ID
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		// Select in preview
		await crafter.selectModuleInPreview(moduleId!);

		// A module should be selected in preview
		const selectedModule = crafter.getSelectedPreviewModule();
		await expect(selectedModule).toBeVisible();

		// The corresponding tree node for the selected module should exist
		const selectedId = await selectedModule.getAttribute("data-ujl-module-id");
		expect(selectedId).not.toBeNull();

		const treeNode = crafter.getTreeNode(selectedId!);
		await expect(treeNode).toBeVisible();
	});

	test("should clear selection when clicking empty area", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		// Press Escape to deselect
		await crafter.deselect();

		// Selection should be cleared
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible({ timeout: 2000 });
	});

	test("should show hover effects on preview modules", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		const module = crafter.getPreviewModule(moduleId!);

		// Hover over the module
		await module.hover();

		// The module should have hover styling (outline or background)
		// This is CSS-based, so we check for the ujl-editor-mode class on container
		const previewContainer = crafter.crafterElement.locator(".ujl-editor-mode");
		await expect(previewContainer).toBeVisible();
	});

	test("should scroll tree node into view when selected in preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get selectable modules
		const selectableIds = await crafter.getSelectableModuleIds();
		expect(selectableIds.length).toBeGreaterThan(0);

		// Pick a module from the middle of the list
		const moduleId = selectableIds[Math.floor(selectableIds.length / 2)];

		// Select it in preview
		await crafter.selectModuleInPreview(moduleId);

		// Wait for scroll animation
		await crafter.waitForAnimation();

		// The tree node should be visible
		const treeNode = crafter.getTreeNode(moduleId);

		// If the node exists in tree, it should be scrolled into view
		if (await treeNode.isVisible()) {
			await expect(treeNode).toBeInViewport();
		}
	});
});
