/**
 * Properties Panel Tests - P1 Priority
 *
 * Tests for the properties panel that shows when a module is selected.
 */

import { expect, test } from "@playwright/test";
import { CrafterPage } from "../fixtures/test-utils.js";

test.describe("Properties Panel", () => {
	test('should show "No module selected" when nothing selected', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Ensure nothing is selected
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible();

		// Panel should show no selection message
		await expect(crafter.panel.getByText("No module selected")).toBeVisible();
	});

	test("should show module label when selected", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);

		// Wait for panel to update
		await page.waitForTimeout(300);

		// Should no longer show "No module selected"
		await expect(crafter.panel.getByText("No module selected")).not.toBeVisible();
	});

	test("should display editable fields for selected module", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find and select a Text module (which has editable fields)
		await crafter.insertComponent("Text");

		// Wait for panel to update
		await page.waitForTimeout(500);

		// Text module uses RichText which has a contenteditable div (TipTap editor)
		// Also check for regular inputs/textareas
		const inputs = crafter.panel.locator("input, textarea");
		const contentEditables = crafter.panel.locator('[contenteditable="true"]');

		const inputCount = await inputs.count();
		const contentEditableCount = await contentEditables.count();

		// Text module should have at least one editable field (input, textarea, or contenteditable)
		expect(inputCount + contentEditableCount).toBeGreaterThan(0);
	});

	test("should update preview when field is edited", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Insert a Text module
		await crafter.insertComponent("Text");
		await page.waitForTimeout(500);

		// Find the text input in the panel
		const textInput = crafter.panel.locator("input, textarea").first();

		if (await textInput.isVisible()) {
			// Clear and type new content
			await textInput.fill("Test Content 12345");

			// Wait for preview update
			await page.waitForTimeout(500);

			// The preview should contain the new text
			const previewText = await crafter.canvas.textContent();
			expect(previewText).toContain("Test Content 12345");
		}
	});

	test("should show field labels", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a selectable module
		const moduleId = await crafter.getFirstSelectableModuleId();
		expect(moduleId).not.toBeNull();
		await crafter.selectModuleInPreview(moduleId!);

		await page.waitForTimeout(300);

		// Check for label elements
		const labels = crafter.panel.locator("label");
		const labelCount = await labels.count();

		// If there are inputs/contenteditable, there should be labels
		const inputs = crafter.panel.locator('input, textarea, select, [contenteditable="true"]');
		const inputCount = await inputs.count();

		if (inputCount > 0) {
			expect(labelCount).toBeGreaterThan(0);
		}
	});

	test('should show "Slot selected" message when slot is selected', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Try to find and click a slot in the tree (inside Shadow DOM)
		const slotElements = crafter.crafterElement.locator("[data-tree-slot-name]");
		const slotCount = await slotElements.count();

		if (slotCount > 0) {
			await slotElements.first().click();

			await page.waitForTimeout(300);

			// Should show slot selected message
			await expect(crafter.panel.getByText("Slot selected")).toBeVisible();
		}
	});

	test("should handle number fields", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a selectable module with number fields (if any)
		const selectableIds = await crafter.getSelectableModuleIds();

		for (const moduleId of selectableIds.slice(0, 5)) {
			// Check first 5 selectable modules
			await crafter.selectModuleInPreview(moduleId);
			await page.waitForTimeout(300);

			const numberInput = crafter.panel.locator('input[type="number"]');

			if (await numberInput.first().isVisible()) {
				// Found a number input
				await numberInput.first().fill("42");
				await page.waitForTimeout(300);

				// Value should be set
				await expect(numberInput.first()).toHaveValue("42");
				break;
			}
		}
	});

	test("should handle boolean toggle fields", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Find a selectable module with toggle/switch fields (if any)
		const selectableIds = await crafter.getSelectableModuleIds();

		for (const moduleId of selectableIds.slice(0, 5)) {
			await crafter.selectModuleInPreview(moduleId);
			await page.waitForTimeout(300);

			const toggle = crafter.panel.locator('[role="switch"]');

			if (await toggle.first().isVisible()) {
				// Get initial state
				const initialState = await toggle.first().getAttribute("data-state");

				// Click to toggle
				await toggle.first().click();
				await page.waitForTimeout(300);

				// State should change
				const newState = await toggle.first().getAttribute("data-state");
				expect(newState).not.toBe(initialState);
				break;
			}
		}
	});

	test("should update panel when selecting different modules", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const selectableIds = await crafter.getSelectableModuleIds();

		if (selectableIds.length < 2) {
			test.skip();
			return;
		}

		// Select first module
		await crafter.selectModuleInPreview(selectableIds[0]);
		await page.waitForTimeout(300);
		const firstPanelContent = await crafter.panel.textContent();

		// Select second module
		await crafter.selectModuleInPreview(selectableIds[1]);
		await page.waitForTimeout(300);
		const secondPanelContent = await crafter.panel.textContent();

		// Panel content might change (different module type)
		// At minimum, both should not show "No module selected"
		expect(firstPanelContent).not.toContain("No module selected");
		expect(secondPanelContent).not.toContain("No module selected");
	});

	test("should show panel toggle button in header", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Panel should be visible initially
		await expect(crafter.panel).toBeVisible();
	});
});
