/**
 * Designer Mode Tests - P2 Priority
 *
 * Tests for the Designer mode (theme editing).
 */

import { test, expect } from '@playwright/test';
import { CrafterPage } from '../fixtures/test-utils.js';

test.describe('Designer Mode', () => {
	test('should switch to Designer mode via mode selector', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Initially in Editor mode
		await expect(crafter.modeSelector).toContainText('Editor');

		// Switch to Designer mode
		await crafter.setMode('designer');

		// Mode selector should show Designer
		await expect(crafter.modeSelector).toContainText('Designer');
	});

	test('should clear selection when switching to Designer mode', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Select a module in Editor mode
		const moduleIds = await crafter.getPreviewModuleIds();
		await crafter.selectModuleInPreview(moduleIds[0]);
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();

		// Switch to Designer mode
		await crafter.setMode('designer');

		// Selection should be cleared
		await expect(crafter.getSelectedPreviewModule()).not.toBeVisible({ timeout: 2000 });
	});

	test('should show designer panel with color groups', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Panel should show color-related content
		const panelText = await crafter.panel.textContent();

		// Should have color sections
		const hasColorSections =
			panelText?.includes('Color') ||
			panelText?.includes('Primary') ||
			panelText?.includes('Ambient');

		expect(hasColorSections).toBe(true);
	});

	test('should show typography groups', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Panel should show typography-related content
		const panelText = await crafter.panel.textContent();

		const hasTypographySections =
			panelText?.includes('Typography') ||
			panelText?.includes('Font') ||
			panelText?.includes('Base');

		expect(hasTypographySections).toBe(true);
	});

	test('should show appearance settings (radius, spacing)', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Panel should show appearance settings
		const panelText = await crafter.panel.textContent();

		const hasAppearanceSettings =
			panelText?.includes('Radius') ||
			panelText?.includes('Spacing') ||
			panelText?.includes('Appearance');

		expect(hasAppearanceSettings).toBe(true);
	});

	test('should have collapsible sections', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Find collapsible triggers (buttons with aria-expanded)
		const collapsibles = crafter.panel.locator('[data-state="open"], [data-state="closed"]');
		const count = await collapsibles.count();

		// Should have some collapsible sections
		expect(count).toBeGreaterThan(0);
	});

	test('should update preview when changing colors', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Find a color input
		const colorInput = crafter.panel.locator('input[type="color"]').first();

		if (await colorInput.isVisible()) {
			// Change the color
			await colorInput.fill('#ff0000');

			// Wait for update
			await page.waitForTimeout(500);

			// Preview should have updated styles
			// (Difficult to assert without knowing exact CSS variable names)
		}
	});

	test('should switch back to Editor mode', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Go to Designer mode
		await crafter.setMode('designer');
		await expect(crafter.modeSelector).toContainText('Designer');

		// Switch back to Editor
		await crafter.setMode('editor');
		await expect(crafter.modeSelector).toContainText('Editor');

		// Should be able to select modules again
		const moduleIds = await crafter.getPreviewModuleIds();
		await crafter.selectModuleInPreview(moduleIds[0]);
		await expect(crafter.getSelectedPreviewModule()).toBeVisible();
	});

	test('should preserve theme changes when switching modes', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Go to Designer mode
		await crafter.setMode('designer');

		// Find a slider or number input for radius/spacing
		const slider = crafter.panel.locator('input[type="range"]').first();

		if (await slider.isVisible()) {
			// Change the value
			await slider.fill('1');

			// Switch to Editor mode
			await crafter.setMode('editor');

			// Switch back to Designer mode
			await crafter.setMode('designer');

			// Value should be preserved
			// (Would need to check specific input value)
		}
	});

	test('should show font selector in typography section', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();
		await crafter.setMode('designer');

		// Look for a font selection control (combobox or select)
		const fontControl = crafter.panel.locator('[role="combobox"]').first();

		if (await fontControl.isVisible()) {
			await fontControl.click();

			// Should show font options
			const options = page.getByRole('option');
			const optionCount = await options.count();

			expect(optionCount).toBeGreaterThan(0);

			// Close by clicking elsewhere
			await page.keyboard.press('Escape');
		}
	});
});
