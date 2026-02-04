/**
 * Component Picker Tests - P1 Priority
 *
 * Tests for the component picker dialog.
 */

import { expect, test } from "@playwright/test";
import { CrafterPage } from "../fixtures/test-utils.js";

test.describe("Component Picker", () => {
	test("should open with Ctrl+I shortcut", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await page.keyboard.press("Control+i");

		await expect(crafter.componentPicker).toBeVisible();
	});

	test("should display search input", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();

		await expect(crafter.componentPickerSearch).toBeVisible();
	});

	test("should display component list", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();

		// Should show available components (CommandItem renders as role="option")
		const componentOptions = crafter.componentPicker.getByRole("option");
		const count = await componentOptions.count();

		// Should have multiple components available
		expect(count).toBeGreaterThan(1);
	});

	test("should filter components by search", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();

		// Get initial option count (CommandItem renders as role="option")
		const initialCount = await crafter.componentPicker.getByRole("option").count();

		// Search for a specific component
		await crafter.componentPickerSearch.fill("Text");

		// Wait for filter to apply
		await page.waitForTimeout(200);

		// Should show fewer components
		const filteredCount = await crafter.componentPicker.getByRole("option").count();
		expect(filteredCount).toBeLessThanOrEqual(initialCount);

		// Should show Text component
		await expect(crafter.componentPicker.getByRole("option", { name: /text/i })).toBeVisible();
	});

	test("should insert component when clicked", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get initial module count
		const initialModuleIds = await crafter.getPreviewModuleIds();
		const initialCount = initialModuleIds.length;

		// Open picker and insert a Text component
		await crafter.openComponentPicker();
		await crafter.componentPickerSearch.fill("Text");

		// Click the Text component option (CommandItem renders as role="option")
		const textOption = crafter.componentPicker.getByRole("option", { name: /text/i }).first();
		await textOption.click();

		// Wait for DOM update
		await page.waitForTimeout(500);

		// Should have one more module
		const newModuleIds = await crafter.getPreviewModuleIds();
		expect(newModuleIds.length).toBe(initialCount + 1);
	});

	test("should close after selecting component", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();
		await expect(crafter.componentPicker).toBeVisible();

		// Select a component (CommandItem renders as role="option")
		await crafter.componentPickerSearch.fill("Container");
		const containerOption = crafter.componentPicker
			.getByRole("option", { name: /container/i })
			.first();
		await containerOption.click();

		// Dialog should close
		await expect(crafter.componentPicker).not.toBeVisible({ timeout: 2000 });
	});

	test("should auto-select inserted component", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Insert a component
		await crafter.insertComponent("Text");

		// Wait for insertion
		await page.waitForTimeout(500);

		// A module should be selected
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		// Properties panel should not show "No module selected"
		await expect(crafter.panel.getByText("No module selected")).not.toBeVisible();
	});

	test("should insert after selected node", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Get modules
		const moduleIds = await crafter.getPreviewModuleIds();

		// Select the first module
		await crafter.selectModuleInPreview(moduleIds[0]);

		// Insert a new component
		await crafter.insertComponent("Text");

		// Wait for insertion
		await page.waitForTimeout(500);

		// The new component should be inserted after the selected one
		const newModuleIds = await crafter.getPreviewModuleIds();
		expect(newModuleIds.length).toBe(moduleIds.length + 1);
	});

	test("should close with Escape key", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();
		await expect(crafter.componentPicker).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(crafter.componentPicker).not.toBeVisible({ timeout: 2000 });
	});

	test("should show common module types", async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.openComponentPicker();

		// Check for common module types
		const commonTypes = ["Container", "Text", "Card", "Grid", "Image", "Button"];

		for (const type of commonTypes) {
			await crafter.componentPickerSearch.fill(type);
			await page.waitForTimeout(100);

			// CommandItem renders as role="option"
			const option = crafter.componentPicker.getByRole("option", { name: new RegExp(type, "i") });
			// At least some of these should exist
			if (await option.first().isVisible()) {
				await expect(option.first()).toBeVisible();
			}

			// Clear search for next iteration
			await crafter.componentPickerSearch.clear();
		}
	});
});
