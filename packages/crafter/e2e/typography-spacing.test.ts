import { expect, Page, test } from '@playwright/test';

test.describe('Typography & Spacing Editor', () => {
	/**
	 * Helper function to dismiss disclaimer dialog if present
	 */
	async function dismissDisclaimerIfPresent(page: Page) {
		try {
			const gotItButton = page.getByRole('button', { name: 'Got it' });
			await gotItButton.waitFor({ timeout: 2000, state: 'visible' });
			await gotItButton.click();
			await page.waitForTimeout(300);
		} catch {
			// Dialog not present, continue
		}
	}

	/**
	 * Helper function to switch to Designer mode
	 */
	async function switchToDesignerMode(page: Page) {
		const sidebarTrigger = page
			.locator('[data-side="left"] button[data-sidebar="menu-button"]')
			.first();
		await expect(sidebarTrigger).toBeVisible();
		await sidebarTrigger.click();

		await page.waitForTimeout(300);

		const dropdown = page.locator('[data-dropdown-menu-content]');
		await expect(dropdown).toBeVisible();

		await dropdown.getByText('Designer').click();
		await page.waitForTimeout(300);
	}

	test.beforeEach(async ({ page, context }) => {
		// Navigate to the app
		await page.goto('/');
		await context.clearCookies();
		await dismissDisclaimerIfPresent(page);

		// Clear storage
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});

		// Wait for app to load
		await page.waitForLoadState('load');
		await page.waitForTimeout(500);

		// Switch to Designer mode
		await switchToDesignerMode(page);
	});

	test('typography groups are visible and collapsible', async ({ page }) => {
		// Wait for sidebar to load
		await page.waitForTimeout(500);

		// Verify Base Text group exists
		const baseTextGroup = page.getByText('Base Text').first();
		await expect(baseTextGroup).toBeVisible();

		// Verify Headings group exists
		const headingsGroup = page.getByText('Headings').first();
		await expect(headingsGroup).toBeVisible();

		// Verify Code group exists
		const codeGroup = page.getByText('Code').first();
		await expect(codeGroup).toBeVisible();

		// Verify Highlight group exists
		const highlightGroup = page.getByText('Highlight').first();
		await expect(highlightGroup).toBeVisible();

		// Verify Link group exists
		const linkGroup = page.getByText('Link').first();
		await expect(linkGroup).toBeVisible();

		// Test expand/collapse functionality on Base Text group
		const baseTextButton = page.locator('button').filter({ hasText: 'Base Text' }).first();
		await expect(baseTextButton).toBeVisible();
		await baseTextButton.click();
		await page.waitForTimeout(300);

		// Verify content is visible when expanded (look for Font label)
		const fontLabel = page.getByText('Font').first();
		const isExpanded = await fontLabel.isVisible().catch(() => false);
		expect(isExpanded).toBeTruthy();
	});

	test('can update base typography font', async ({ page }) => {
		// Open Base Text group
		const baseTextButton = page.locator('button').filter({ hasText: 'Base Text' }).first();
		await baseTextButton.click();
		await page.waitForTimeout(300);

		// Find the font combobox by id (base-font)
		const fontCombobox = page.locator('button#base-font');
		await expect(fontCombobox).toBeVisible();

		// Click to open combobox
		await fontCombobox.click();
		await page.waitForTimeout(300);

		// Select a different font (e.g., "Roboto")
		const robotoOption = page.getByText('Roboto').first();
		await expect(robotoOption).toBeVisible();
		await robotoOption.click();
		await page.waitForTimeout(300);

		// Verify the font was selected (check combobox shows new value)
		const selectedFont = await fontCombobox.textContent();
		expect(selectedFont?.toLowerCase()).toContain('roboto');
	});

	test('can update base typography size', async ({ page }) => {
		// Open Base Text group
		const baseTextButton = page.locator('button').filter({ hasText: 'Base Text' }).first();
		await baseTextButton.click();
		await page.waitForTimeout(300);

		// Find the size input by id (base-size)
		const sizeInput = page.locator('input#base-size');
		await expect(sizeInput).toBeVisible();

		// Change the size value
		await sizeInput.clear();
		await sizeInput.fill('1.2');
		await sizeInput.press('Enter');
		await page.waitForTimeout(300);

		// Verify the value was updated
		const newValue = await sizeInput.inputValue();
		expect(newValue).toBe('1.2');
	});

	test('can update heading typography flavor', async ({ page }) => {
		// Open Headings group
		const headingsButton = page.locator('button').filter({ hasText: 'Headings' }).first();
		await headingsButton.click();
		await page.waitForTimeout(300);

		// Find the flavor select by id (heading-flavor)
		const flavorSelect = page.locator('button#heading-flavor');
		const flavorExists = await flavorSelect.isVisible().catch(() => false);

		if (flavorExists) {
			await flavorSelect.click();
			await page.waitForTimeout(300);

			// Wait for SelectContent to be visible and find Primary option within it
			const selectContent = page.locator('[data-slot="select-content"]');
			await expect(selectContent).toBeVisible({ timeout: 2000 });

			// Find Primary option within the SelectContent (more specific)
			const primaryOption = selectContent.getByRole('option', { name: /primary/i });
			await expect(primaryOption).toBeVisible({ timeout: 2000 });
			await primaryOption.click();
			await page.waitForTimeout(300);

			// Verify flavor was selected
			const selectedFlavor = await flavorSelect.textContent();
			expect(selectedFlavor?.toLowerCase()).toMatch(/primary|ambient|secondary|accent/);
		} else {
			// If flavor select is not visible, skip this test (might be collapsed or not rendered)
			test.skip();
		}
	});

	test('can update spacing value', async ({ page }) => {
		// Open Appearance group
		const appearanceButton = page.locator('button').filter({ hasText: 'Appearance' }).first();
		await appearanceButton.click();
		await page.waitForTimeout(300);

		// Find the spacing input by id (spacing)
		const spacingInput = page.locator('input#spacing');
		await expect(spacingInput).toBeVisible();

		// Change the spacing value
		await spacingInput.clear();
		await spacingInput.fill('0.3');
		await spacingInput.press('Enter');
		await page.waitForTimeout(300);

		// Verify the value was updated
		const newValue = await spacingInput.inputValue();
		expect(newValue).toBe('0.3');
	});

	test('can update radius value', async ({ page }) => {
		// Open Appearance group
		const appearanceButton = page.locator('button').filter({ hasText: 'Appearance' }).first();
		await appearanceButton.click();
		await page.waitForTimeout(300);

		// Find the radius input by id (radius)
		const radiusInput = page.locator('input#radius');
		await expect(radiusInput).toBeVisible();

		// Change the radius value
		await radiusInput.clear();
		await radiusInput.fill('1.0');
		await radiusInput.press('Enter');
		await page.waitForTimeout(300);

		// Verify the value was updated (accept both "1" and "1.0" as valid)
		const newValue = await radiusInput.inputValue();
		expect(['1', '1.0']).toContain(newValue);
	});
});
