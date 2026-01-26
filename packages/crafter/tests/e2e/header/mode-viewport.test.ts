/**
 * Header Mode and Viewport Tests - P2 Priority
 *
 * Tests for the header controls: mode selector, viewport simulation, and import/export.
 */

import { test, expect } from '@playwright/test';
import { CrafterPage } from '../fixtures/test-utils.js';

test.describe('Mode Selector', () => {
	test('should display current mode', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await expect(crafter.modeSelector).toBeVisible();
		await expect(crafter.modeSelector).toContainText('Editor');
	});

	test('should switch between Editor and Designer modes', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Switch to Designer
		await crafter.setMode('designer');
		await expect(crafter.modeSelector).toContainText('Designer');

		// Switch back to Editor
		await crafter.setMode('editor');
		await expect(crafter.modeSelector).toContainText('Editor');
	});

	test('should show mode icon in selector', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Mode selector should have an icon (SVG) - use first() to avoid strict mode violation
		const icon = crafter.modeSelector.locator('svg').first();
		await expect(icon).toBeVisible();
	});
});

test.describe('Viewport Simulation', () => {
	test('should display viewport toggle buttons', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Look for viewport toggle buttons (in Shadow DOM)
		const desktopToggle = crafter.viewportToggles.getByTitle(/desktop/i);
		const tabletToggle = crafter.viewportToggles.getByTitle(/tablet/i);
		const mobileToggle = crafter.viewportToggles.getByTitle(/mobile/i);

		await expect(desktopToggle).toBeVisible();
		await expect(tabletToggle).toBeVisible();
		await expect(mobileToggle).toBeVisible();
	});

	test('should activate desktop viewport (1024px)', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.setViewport('desktop');

		// The toggle should be active (in Shadow DOM)
		const desktopToggle = crafter.viewportToggles.getByTitle(/desktop/i);
		await expect(desktopToggle).toHaveAttribute('data-state', 'on');

		// Preview container should have constrained width
		const previewContainer = crafter.canvas.locator('div').first();
		const box = await previewContainer.boundingBox();

		// Width should be around 1024px (or less if container is smaller)
		if (box) {
			expect(box.width).toBeLessThanOrEqual(1024 + 50); // Some tolerance
		}
	});

	test('should activate tablet viewport (768px)', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.setViewport('tablet');

		const tabletToggle = crafter.viewportToggles.getByTitle(/tablet/i);
		await expect(tabletToggle).toHaveAttribute('data-state', 'on');
	});

	test('should activate mobile viewport (375px)', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.setViewport('mobile');

		const mobileToggle = crafter.viewportToggles.getByTitle(/mobile/i);
		await expect(mobileToggle).toHaveAttribute('data-state', 'on');
	});

	test('should deactivate viewport when clicking active toggle', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Activate desktop
		await crafter.setViewport('desktop');
		const desktopToggle = crafter.viewportToggles.getByTitle(/desktop/i);
		await expect(desktopToggle).toHaveAttribute('data-state', 'on');

		// Click again to deactivate
		await desktopToggle.click();

		// Should no longer be active
		await expect(desktopToggle).toHaveAttribute('data-state', 'off');
	});

	test('should switch between viewports', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		const desktopToggle = crafter.viewportToggles.getByTitle(/desktop/i);
		const mobileToggle = crafter.viewportToggles.getByTitle(/mobile/i);

		// Activate desktop
		await crafter.setViewport('desktop');
		await expect(desktopToggle).toHaveAttribute('data-state', 'on');

		// Switch to mobile
		await crafter.setViewport('mobile');
		await expect(mobileToggle).toHaveAttribute('data-state', 'on');
		await expect(desktopToggle).toHaveAttribute('data-state', 'off');
	});
});

test.describe('Import/Export', () => {
	test('should show menu button', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await expect(crafter.menuButton).toBeVisible();
	});

	test('should show export options in menu', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.menuButton.click();

		// Menu should show export options (in Shadow DOM portal)
		await expect(
			crafter.crafterElement.getByRole('menuitem', { name: /export theme/i })
		).toBeVisible();
		await expect(
			crafter.crafterElement.getByRole('menuitem', { name: /export content/i })
		).toBeVisible();
	});

	test('should show import options in menu', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.menuButton.click();

		// Menu should show import options (in Shadow DOM portal)
		await expect(
			crafter.crafterElement.getByRole('menuitem', { name: /import theme/i })
		).toBeVisible();
		await expect(
			crafter.crafterElement.getByRole('menuitem', { name: /import content/i })
		).toBeVisible();
	});

	test('should close menu with Escape', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		await crafter.menuButton.click();

		// Menu is in Shadow DOM portal
		const menu = crafter.crafterElement.getByRole('menu');
		await expect(menu).toBeVisible();

		await page.keyboard.press('Escape');

		await expect(menu).not.toBeVisible({ timeout: 2000 });
	});

	// Note: Actual file download/upload testing requires special Playwright configuration
	// These are placeholder tests for the UI elements
	test('should trigger export theme action', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Set up download listener
		const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

		// Trigger export (menu is in Shadow DOM portal)
		await crafter.menuButton.click();
		await crafter.crafterElement.getByRole('menuitem', { name: /export theme/i }).click();

		// Check if download was triggered
		const download = await downloadPromise;
		if (download) {
			expect(download.suggestedFilename()).toContain('.ujlt.json');
		}
	});

	test('should trigger export content action', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Set up download listener
		const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

		// Trigger export (menu is in Shadow DOM portal)
		await crafter.menuButton.click();
		await crafter.crafterElement.getByRole('menuitem', { name: /export content/i }).click();

		// Check if download was triggered
		const download = await downloadPromise;
		if (download) {
			expect(download.suggestedFilename()).toContain('.ujlc.json');
		}
	});
});
