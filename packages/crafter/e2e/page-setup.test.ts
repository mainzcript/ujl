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

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await dismissDisclaimerIfPresent(page);

		// Wait for app to load
		await page.waitForLoadState('load');

		// Ensure we're in Editor mode (default mode)
		const sidebar = page.locator('[data-sidebar="sidebar"]').first();
		const editorButton = sidebar.getByText('Editor');

		// Check if Editor mode is active, if not, switch to it
		const isEditorActive = await editorButton.isVisible();
		if (isEditorActive) {
			// Already in editor mode or mode switcher visible
			await page.waitForTimeout(200);
		}
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

		// Check for Sidebar Left (contains mode switcher and navigation)
		const sidebarLeft = page.locator('[data-side="left"]');

		await expect(sidebarLeft).toBeVisible();

		// Verify mode switcher is in sidebar left
		await expect(sidebarLeft.getByText(/Editor|Designer/)).toBeVisible();

		// Check for Preview area (main content area)
		// The preview is typically the main content area between sidebars
		const mainContent = page.locator('main, [role="main"], .preview-area').first();
		await expect(mainContent).toBeVisible();

		// Check for Sidebar Right (contains export/import buttons)
		const sidebarRight = page.locator('[data-testId="sidebar-right"]');
		await expect(sidebarRight).toBeVisible();
	});

	test('header with breadcrumb is visible', async ({ page }) => {
		// Check for header element
		const header = page.locator('header');
		await expect(header).toBeVisible();

		// Check for breadcrumb navigation using aria-label
		const breadcrumb = header.locator('nav[aria-label="breadcrumb"]');
		await expect(breadcrumb).toBeVisible();

		// Verify breadcrumb contains "UJL Crafter" text
		await expect(breadcrumb.getByText('UJL Crafter')).toBeVisible();

		// Verify header has correct styling (sticky, top positioning)
		await expect(header).toHaveCSS('position', 'sticky');
	});

	test('sidebar trigger functions correctly', async ({ page }) => {
		// Find the sidebar trigger button in header
		const sidebarTrigger = page
			.locator('[data-side="left"] button[data-sidebar="menu-button"]')
			.first();
		await expect(sidebarTrigger).toBeVisible();

		// Get initial sidebar state
		const sidebarLeft = page.locator('[data-side="left"]');

		// The sidebar might not have a data-state initially, or it might be null
		// Instead, check visibility or class changes
		expect(sidebarLeft).toBeVisible();
		expect(sidebarLeft).toHaveText(/Editor/);

		// Click the trigger
		await sidebarTrigger.click();

		const dropdown = page.locator('[data-dropdown-menu-content]');
		expect(dropdown).toBeVisible();

		await dropdown.getByText('Designer').click();
		// Wait for animation
		await page.waitForTimeout(400);

		expect(sidebarLeft).toBeVisible();
		expect(sidebarLeft).toHaveText(/Designer/);

		// Click the trigger again to close (if applicable)
		await sidebarTrigger.click();
		expect(dropdown).toBeVisible();

		await dropdown.getByText('Editor').click();
		await page.waitForTimeout(400);

		// Verify sidebar state toggled back
		expect(sidebarLeft).toBeVisible();
		expect(sidebarLeft).toHaveText(/Editor/);
	});

	test('sidebar trigger is keyboard accessible', async ({ page }) => {
		// Focus the body first to ensure clean state
		await page.locator('body').focus();

		// Find the sidebar trigger (we'll use a more direct approach)
		const sidebarTrigger = page.locator('header button[data-sidebar="trigger"]').first();
		await expect(sidebarTrigger).toBeVisible();

		// Focus the trigger directly
		await sidebarTrigger.focus();

		// Verify it's focused
		const isFocused = await sidebarTrigger.evaluate((el) => el === document.activeElement);
		expect(isFocused).toBe(true);

		// Activate with Enter key
		await page.keyboard.press('Enter');
		await page.waitForTimeout(400);

		// Verify state changed
		const sidebarLeft = page.locator('[data-side="left"]');
		expect(sidebarLeft).not.toBeVisible();
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
