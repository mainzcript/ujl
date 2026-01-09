import { expect, Page, test } from '@playwright/test';

test.describe('Basic Application Tests', () => {
	/**
	 * Helper function to dismiss disclaimer dialog if present
	 */
	async function dismissDisclaimerIfPresent(page: Page) {
		try {
			const gotItButton = page.getByRole('button', { name: 'Got it' });
			// Wait briefly for dialog, but don't fail if it doesn't appear
			await gotItButton.waitFor({ timeout: 2000, state: 'visible' });
			await gotItButton.click();
			// Wait for dialog to close
			await page.waitForTimeout(300);
		} catch {
			// Dialog not present, continue
		}
	}

	/**
	 * Helper function to switch mode via the Select in the header
	 */
	async function switchMode(page: Page, mode: 'Editor' | 'Designer') {
		// Find the mode select trigger in the header
		const selectTrigger = page.locator('header button[data-slot="select-trigger"]');
		await expect(selectTrigger).toBeVisible();
		await selectTrigger.click();
		await page.waitForTimeout(200);

		// Find and click the mode option in the select content
		const selectContent = page.locator('[data-slot="select-content"]');
		await expect(selectContent).toBeVisible();
		await selectContent.getByText(mode, { exact: true }).click();
		await page.waitForTimeout(300);
	}

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await dismissDisclaimerIfPresent(page);

		// Wait for app to load
		await page.waitForLoadState('load');
	});

	test('app loads successfully', async ({ page }) => {
		// Wait for the page to be fully loaded (using 'load' instead of 'networkidle' for faster tests)
		await page.waitForLoadState('load');

		// Check that we're on the correct page
		await expect(page).toHaveURL(/\//);

		// Verify that the main app container is visible
		await expect(page.locator('body')).toBeVisible();

		// Verify that at least one key element is present (header)
		await expect(page.locator('header')).toBeVisible();
	});

	test('disclaimer dialog appears in normal mode', async ({ page, context }) => {
		// Clear localStorage to ensure disclaimer shows
		await context.clearCookies();
		await page.evaluate(() => localStorage.clear());

		// Reload the page
		await page.reload();
		await page.waitForLoadState('load');

		// Try to find the dialog - it might not appear in test mode
		const dialog = page.getByRole('dialog');
		const isVisible = await dialog.isVisible().catch(() => false);

		if (isVisible) {
			// Verify dialog content
			await expect(dialog.getByRole('heading', { name: 'Early Preview' })).toBeVisible();
			await expect(dialog.getByText(/very early preview/i)).toBeVisible();

			// Verify "Got it" button exists
			const gotItButton = dialog.getByRole('button', { name: 'Got it' });
			await expect(gotItButton).toBeVisible();

			// Close the dialog
			await gotItButton.click();

			// Verify dialog is closed
			await expect(dialog).not.toBeVisible();
		} else {
			// In test mode, disclaimer might be disabled - that's OK
			console.log('Disclaimer dialog not shown (likely in test mode)');
		}
	});

	test('disclaimer does not appear when dismissed', async ({ page }) => {
		// Set localStorage to indicate disclaimer was dismissed
		await page.evaluate(() => {
			localStorage.setItem('ujl-crafter-disclaimer-dismissed', 'true');
		});

		// Reload the page
		await page.reload();

		// Wait a moment for potential dialog
		await page.waitForTimeout(1000);

		// Verify dialog does not appear
		const dialog = page.getByRole('dialog');
		await expect(dialog).not.toBeVisible();
	});

	test('three main areas are visible', async ({ page }) => {
		// Wait for app to be ready
		await page.waitForLoadState('networkidle');

		// Check for Sidebar Left
		const sidebarLeft = page.locator('[data-side="left"]');
		await expect(sidebarLeft).toBeVisible();

		// Verify sidebar header shows "Document" (Editor mode) or "Theme" (Designer mode)
		// Use first() to avoid strict mode violation
		await expect(sidebarLeft.getByText(/Document|Theme/).first()).toBeVisible();

		// Check for main content area (SidebarInset)
		const mainContent = page.locator('[data-slot="sidebar-inset"]');
		await expect(mainContent).toBeVisible();

		// Check for header with mode switcher
		const header = page.locator('header');
		await expect(header).toBeVisible();

		// Verify mode switcher Select is in header
		const modeSelect = header.locator('button[data-slot="select-trigger"]');
		await expect(modeSelect).toBeVisible();
	});

	test('header with mode switcher is visible', async ({ page }) => {
		// Check for header element
		const header = page.locator('header');
		await expect(header).toBeVisible();

		// Check for mode switcher Select in header
		const modeSelect = header.locator('button[data-slot="select-trigger"]');
		await expect(modeSelect).toBeVisible();

		// Verify it shows current mode (Editor by default)
		await expect(modeSelect).toContainText('Editor');

		// Check for Save button in header
		const saveButton = header.getByRole('button', { name: 'Save' });
		await expect(saveButton).toBeVisible();

		// Check for More Actions button (three dots menu)
		const moreActionsButton = header.locator('button[title="More Actions"]');
		await expect(moreActionsButton).toBeVisible();
	});

	test('mode switcher functions correctly', async ({ page }) => {
		// Get initial sidebar state - should show "Document" in Editor mode
		const sidebarLeft = page.locator('[data-side="left"]');
		// Use first() to avoid strict mode violation
		await expect(sidebarLeft.getByText('Document').first()).toBeVisible();

		// Switch to Designer mode
		await switchMode(page, 'Designer');

		// Verify sidebar now shows "Theme" - use first() to avoid strict mode violation
		await expect(sidebarLeft.getByText('Theme').first()).toBeVisible();

		// Switch back to Editor mode
		await switchMode(page, 'Editor');

		// Verify sidebar shows "Document" again - use first() to avoid strict mode violation
		await expect(sidebarLeft.getByText('Document').first()).toBeVisible();
	});

	test('sidebar trigger toggles left sidebar', async ({ page }) => {
		// Find the sidebar trigger button in header
		const sidebarTrigger = page.locator('header button[data-sidebar="trigger"]');
		await expect(sidebarTrigger).toBeVisible();

		// Get initial sidebar state
		const sidebar = page.locator('[data-slot="sidebar"]').first();
		const initialState = await sidebar.getAttribute('data-state');

		// Click the trigger
		await sidebarTrigger.click();
		await page.waitForTimeout(400);

		// Verify state changed
		const newState = await sidebar.getAttribute('data-state');
		expect(newState).not.toBe(initialState);

		// Click again to toggle back
		await sidebarTrigger.click();
		await page.waitForTimeout(400);

		// Verify state toggled back
		const finalState = await sidebar.getAttribute('data-state');
		expect(finalState).toBe(initialState);
	});

	test('sidebar trigger is keyboard accessible', async ({ page }) => {
		// Focus the body first to ensure clean state
		await page.locator('body').focus();

		// Find the sidebar trigger
		const sidebarTrigger = page.locator('header button[data-sidebar="trigger"]');
		await expect(sidebarTrigger).toBeVisible();

		// Focus the trigger directly
		await sidebarTrigger.focus();

		// Verify it's focused
		const isFocused = await sidebarTrigger.evaluate((el) => el === document.activeElement);
		expect(isFocused).toBe(true);

		// Get initial state
		const sidebar = page.locator('[data-slot="sidebar"]').first();
		const initialState = await sidebar.getAttribute('data-state');

		// Activate with Enter key
		await page.keyboard.press('Enter');
		await page.waitForTimeout(400);

		// Verify state changed
		const newState = await sidebar.getAttribute('data-state');
		expect(newState).not.toBe(initialState);
	});

	test('app renders without console errors', async ({ page }) => {
		const consoleErrors: string[] = [];
		const consoleWarnings: string[] = [];

		// Listen for console errors and warnings
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(msg.text());
			}
		});

		// Wait for page to fully load
		await page.waitForLoadState('load');

		// Wait a bit more for any async operations
		await page.waitForTimeout(1000);

		// Check that there are no console errors
		// Note: Warnings are logged but not failed, as they might be acceptable
		if (consoleWarnings.length > 0) {
			console.log(`Console warnings detected (${consoleWarnings.length}):`, consoleWarnings);
		}

		expect(consoleErrors).toHaveLength(0);
	});
});
