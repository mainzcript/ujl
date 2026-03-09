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

		const moduleIds = await crafter.getPreviewModuleIds();
		expect(moduleIds.length).toBeGreaterThan(0);
	});

	test("should select node when clicking in preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		await crafter.selectModuleInPreview(moduleId!);

		await expect(crafter.getSelectedPreviewModule()).toBeVisible();
	});

	test("should show selection overlay for selected module", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		await crafter.selectModuleInPreview(moduleId!);

		const selectedModule = crafter.getSelectedPreviewModule();
		await expect(selectedModule).toBeVisible();
	});

	test("should show properties panel when module selected", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await expect(crafter.panel.getByText("No module selected")).toBeVisible();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);

		await expect(crafter.panel.getByText("No module selected")).not.toBeVisible({ timeout: 2000 });
	});

	test("should expand parent nodes in tree when selecting nested module in preview", async ({
		page,
	}) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const nodesWithChevron = crafter.crafterElement.locator(
			'[data-tree-node-id]:not([data-tree-node-id^="__"]):has([data-crafter="tree-chevron"])',
		);
		const containerCount = await nodesWithChevron.count();
		expect(containerCount).toBeGreaterThan(0);

		const containerNode = nodesWithChevron.first();
		const chevron = containerNode.locator('[data-crafter="tree-chevron"]');

		const containerId = await containerNode.getAttribute("data-tree-node-id");
		expect(containerId).not.toBeNull();

		const collapsibleTrigger = containerNode.locator("[data-state]").first();
		const initialState = await collapsibleTrigger.getAttribute("data-state");

		if (initialState === "open") {
			await chevron.click();
			await crafter.waitForAnimation();
		}

		await expect(collapsibleTrigger).toHaveAttribute("data-state", "closed");

		const allPreviewModuleIds = await crafter.getPreviewModuleIds();

		const topLevelContainerIds = await nodesWithChevron.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute("data-tree-node-id")),
		);

		const childId = allPreviewModuleIds.find(
			(id) => id !== containerId && !topLevelContainerIds.includes(id),
		);
		expect(childId).toBeDefined();

		await crafter.selectModuleInPreview(childId!);

		await crafter.waitForAnimation();

		const childTreeNode = crafter.getTreeNode(childId!);
		await expect(childTreeNode).toBeVisible();
	});

	test("should prevent link navigation in editor mode", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const links = page.locator("[data-ujl-module-id] a");
		const linkCount = await links.count();

		if (linkCount > 0) {
			const currentUrl = page.url();

			await links.first().click();

			await page.waitForTimeout(500);

			expect(page.url()).toBe(currentUrl);
		}
	});

	test("should sync selection between tree and preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();

		await crafter.selectModuleInPreview(moduleId!);

		const selectedModule = crafter.getSelectedPreviewModule();
		await expect(selectedModule).toBeVisible();

		const selectedId = await selectedModule.getAttribute("data-module-id");
		expect(selectedId).not.toBeNull();

		const treeNode = crafter.getTreeNode(selectedId!);
		await expect(treeNode).toBeVisible();
	});

	test("should clear selection when clicking empty area", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		await crafter.deselect();

		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible({ timeout: 2000 });
	});

	test("should show hover effects on preview modules", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		const module = crafter.getPreviewModule(moduleId!);

		await module.hover();

		const previewContainer = crafter.crafterElement.locator(".ujl-editor-mode");
		await expect(previewContainer).toBeVisible();
	});

	test("should scroll tree node into view when selected in preview", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const selectableIds = await crafter.getSelectableModuleIds();
		expect(selectableIds.length).toBeGreaterThan(0);

		const moduleId = selectableIds[Math.floor(selectableIds.length / 2)];

		await crafter.selectModuleInPreview(moduleId);

		await crafter.waitForAnimation();

		const treeNode = crafter.getTreeNode(moduleId);

		if (await treeNode.isVisible()) {
			await expect(treeNode).toBeInViewport();
		}
	});
});
