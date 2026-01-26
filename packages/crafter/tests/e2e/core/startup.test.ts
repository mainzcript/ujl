/**
 * Startup Tests - P0 Priority
 *
 * Tests that verify the Crafter loads successfully and all main areas are visible.
 */

import { test, expect } from '@playwright/test';
import { CrafterPage } from '../fixtures/test-utils.js';

test.describe('Crafter Startup', () => {
	test('should load successfully and display main layout areas', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Verify the custom element is present
		await expect(crafter.crafterElement).toBeVisible();

		// Verify the three main layout areas
		await expect(crafter.sidebar).toBeVisible();
		await expect(crafter.canvas).toBeVisible();
		await expect(crafter.panel).toBeVisible();
	});

	test('should display navigation tree with Document header', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Nav tree should be visible
		await expect(crafter.navTree).toBeVisible();

		// Document header should be visible
		await expect(crafter.navTreeHeader).toBeVisible();
	});

	test('should load with showcase document by default', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// The showcase document contains multiple modules
		// Wait for tree nodes to appear
		const treeNodeIds = await crafter.getVisibleTreeNodeIds();

		// Should have at least the root node visible
		expect(treeNodeIds.length).toBeGreaterThan(0);
	});

	test('should display header with mode selector', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Header should be visible
		await expect(crafter.header).toBeVisible();

		// Mode selector should show "Editor" by default
		await expect(crafter.modeSelector).toBeVisible();
		await expect(crafter.modeSelector).toContainText('Editor');
	});

	test('should start in editor mode with no selection', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Should be in editor mode
		const mode = await crafter.getMode();
		expect(mode).toBe('editor');

		// Properties panel should show "No module selected"
		const noSelectionVisible = await crafter.isNoModuleSelectedVisible();
		expect(noSelectionVisible).toBe(true);
	});

	test('should render preview with content', async ({ page }) => {
		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Preview should contain modules with data-ujl-module-id
		const moduleIds = await crafter.getPreviewModuleIds();

		// The showcase document has multiple modules
		expect(moduleIds.length).toBeGreaterThan(0);
	});

	test('should not have console errors on startup', async ({ page }) => {
		const errors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		const crafter = new CrafterPage(page);
		await crafter.goto();

		// Allow some time for async operations
		await page.waitForTimeout(1000);

		// Filter out known acceptable errors (e.g., favicon, external resources)
		const relevantErrors = errors.filter(
			(error) => !error.includes('favicon') && !error.includes('Failed to load resource')
		);

		expect(relevantErrors).toHaveLength(0);
	});
});
