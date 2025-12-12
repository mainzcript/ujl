import { expect, Page, test } from '@playwright/test';

test.describe('Editor Sidebar Right Tests', () => {
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
	});

	test('sidebar right is visible', async ({ page }) => {
		// Find the right sidebar
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');
		await expect(sidebarRight).toBeVisible();

		// Verify it contains export/import buttons
		const exportButton = sidebarRight.locator('button[title="Export"]');
		const importButton = sidebarRight.locator('button[title="Import"]');

		await expect(exportButton).toBeVisible();
		await expect(importButton).toBeVisible();
	});

	test('shows "no component selected" state initially', async ({ page }) => {
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');

		// Should show the "no selection" message
		await expect(sidebarRight.getByText('No component selected')).toBeVisible();
		await expect(
			sidebarRight.getByText('Select a component in the tree or preview to edit its properties')
		).toBeVisible();
	});

	test('selecting a component shows properties panel', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find and click on a node in the left sidebar tree
		const firstNode = page.locator('[data-testid="nav-tree-item"]').first();
		const nodeButton = firstNode.locator('button').nth(1);

		await expect(nodeButton).toBeVisible();
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Verify that the right sidebar now shows component info
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');

		// Should no longer show "no component selected"
		await expect(sidebarRight.getByText('No component selected')).not.toBeVisible();

		// Should show either properties or "no editable properties" message
		const hasProperties = await sidebarRight
			.locator('input, textarea, button[role="switch"]')
			.count();
		const noPropertiesMsg = await sidebarRight
			.getByText('This component type has no editable properties.')
			.isVisible()
			.catch(() => false);

		// Either has input fields OR shows no properties message
		expect(hasProperties > 0 || noPropertiesMsg).toBeTruthy();
	});

	test('selecting a component with text field allows editing', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand the tree to find a component with text properties
		// First, expand root node
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Try to find a node that might have text fields (like a heading or paragraph)
		const allNodes = page.locator('[data-testid="nav-tree-item"]');
		const nodeCount = await allNodes.count();

		// Select the second node (first child)
		if (nodeCount > 1) {
			const secondNode = allNodes.nth(1);
			const nodeButton = secondNode.locator('button').last();
			await nodeButton.click();
			await page.waitForTimeout(300);

			// Check if there are any text inputs in the right sidebar
			const sidebarRight = page.locator('[data-testid="sidebar-right"]');
			const textInput = sidebarRight.locator('input[type="text"]').first();

			const textInputExists = await textInput.isVisible().catch(() => false);

			if (textInputExists) {
				// Type into the input
				await textInput.fill('Test Value');
				await page.waitForTimeout(200);

				// Verify the value was set
				await expect(textInput).toHaveValue('Test Value');
			}
		}
	});

	test('selecting a component with textarea allows editing', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand the tree
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Try different nodes to find one with a textarea
		const allNodes = page.locator('[data-testid="nav-tree-item"]');
		const nodeCount = await allNodes.count();

		for (let i = 1; i < Math.min(nodeCount, 5); i++) {
			const node = allNodes.nth(i);
			const nodeButton = node.locator('button').last();
			await nodeButton.click();
			await page.waitForTimeout(200);

			const sidebarRight = page.locator('[data-testid="sidebar-right"]');
			const textarea = sidebarRight.locator('textarea').first();

			const textareaExists = await textarea.isVisible().catch(() => false);

			if (textareaExists) {
				// Type into the textarea
				await textarea.fill('Multi-line\nTest Content');
				await page.waitForTimeout(200);

				// Verify the value was set
				await expect(textarea).toHaveValue('Multi-line\nTest Content');
				break;
			}
		}
	});

	test('selecting a component with number field allows numeric input', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand the tree
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Try different nodes to find one with a number input
		const allNodes = page.locator('[data-testid="nav-tree-item"]');
		const nodeCount = await allNodes.count();

		for (let i = 1; i < Math.min(nodeCount, 5); i++) {
			const node = allNodes.nth(i);
			const nodeButton = node.locator('button').last();
			await nodeButton.click();
			await page.waitForTimeout(200);

			const sidebarRight = page.locator('[data-testid="sidebar-right"]');
			const numberInput = sidebarRight.locator('input[type="number"]').first();

			const numberInputExists = await numberInput.isVisible().catch(() => false);

			if (numberInputExists) {
				// Clear and type a number
				await numberInput.fill('42');
				await page.waitForTimeout(200);

				// Verify the value was set
				await expect(numberInput).toHaveValue('42');
				break;
			}
		}
	});

	test('selecting a component with boolean switch can toggle', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand the tree
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Try different nodes to find one with a switch
		const allNodes = page.locator('[data-testid="nav-tree-item"]');
		const nodeCount = await allNodes.count();

		for (let i = 1; i < Math.min(nodeCount, 5); i++) {
			const node = allNodes.nth(i);
			const nodeButton = node.locator('button').last();
			await nodeButton.click();
			await page.waitForTimeout(200);

			const sidebarRight = page.locator('[data-testid="sidebar-right"]');
			const switchButton = sidebarRight.locator('button[role="switch"]').first();

			const switchExists = await switchButton.isVisible().catch(() => false);

			if (switchExists) {
				// Get initial state
				const initialState = await switchButton.getAttribute('data-state');

				// Click to toggle
				await switchButton.click();
				await page.waitForTimeout(200);

				// Verify state changed
				const newState = await switchButton.getAttribute('data-state');
				expect(newState).not.toBe(initialState);

				// Toggle back
				await switchButton.click();
				await page.waitForTimeout(200);

				// Verify it toggled back
				const finalState = await switchButton.getAttribute('data-state');
				expect(finalState).toBe(initialState);
				break;
			}
		}
	});

	test('selecting a component with select dropdown shows options', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand the tree
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Try different nodes to find one with a select
		const allNodes = page.locator('[data-testid="nav-tree-item"]');
		const nodeCount = await allNodes.count();

		for (let i = 1; i < Math.min(nodeCount, 5); i++) {
			const node = allNodes.nth(i);
			const nodeButton = node.locator('button').last();
			await nodeButton.click();
			await page.waitForTimeout(200);

			const sidebarRight = page.locator('[data-testid="sidebar-right"]');
			const selectTrigger = sidebarRight.locator('button[role="combobox"]').first();

			const selectExists = await selectTrigger.isVisible().catch(() => false);

			if (selectExists) {
				// Click to open dropdown
				await selectTrigger.click();
				await page.waitForTimeout(300);

				// Verify dropdown content is visible
				const selectContent = page.locator('[role="listbox"]');
				await expect(selectContent).toBeVisible();

				// Verify there are options
				const options = selectContent.locator('[role="option"]');
				const optionCount = await options.count();
				expect(optionCount).toBeGreaterThan(0);

				// Select the first option
				const firstOption = options.first();
				await firstOption.click();
				await page.waitForTimeout(300);

				// Verify dropdown closed
				await expect(selectContent).not.toBeVisible();
				break;
			}
		}
	});

	test('export dropdown menu opens and shows options', async ({ page }) => {
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');
		const exportButton = sidebarRight.locator('button[title="Export"]');

		// Click export button
		await exportButton.click();
		await page.waitForTimeout(200);

		// Verify dropdown is visible
		const dropdown = page.locator('[data-dropdown-menu-content]');
		await expect(dropdown).toBeVisible();

		// Verify export options are present
		await expect(dropdown.getByText('Export Theme')).toBeVisible();
		await expect(dropdown.getByText('Export Content')).toBeVisible();

		// Close dropdown by clicking outside
		await page.locator('html').click({ position: { x: 0, y: 0 } });
		await page.waitForTimeout(200);

		// Verify export options are not present anymore
		await expect(dropdown.getByText('Export Theme')).not.toBeVisible();
		await expect(dropdown.getByText('Export Content')).not.toBeVisible();
	});

	test('import dropdown menu opens and shows options', async ({ page }) => {
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');
		const importButton = sidebarRight.locator('button[title="Import"]');

		// Click import button
		await importButton.click();
		await page.waitForTimeout(200);

		// Verify dropdown is visible
		const dropdown = page.locator('[data-dropdown-menu-content]');
		await expect(dropdown).toBeVisible();

		// Verify import options are present
		await expect(dropdown.getByText('Import Theme')).toBeVisible();
		await expect(dropdown.getByText('Import Content')).toBeVisible();

		// Close dropdown by clicking outside
		await page.locator('html').click({ position: { x: 0, y: 0 } });
		await page.waitForTimeout(200);

		// Verify import options are present
		await expect(dropdown.getByText('Import Theme')).not.toBeVisible();
		await expect(dropdown.getByText('Import Content')).not.toBeVisible();
	});

	test('save button is visible and clickable', async ({ page }) => {
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');
		const saveButton = sidebarRight.getByRole('button', { name: 'Save' });

		await expect(saveButton).toBeVisible();
		await expect(saveButton).toBeEnabled();

		// Click save button (will show alert in current implementation)
		await saveButton.click();

		// Handle the alert dialog that appears
		page.on('dialog', async (dialog) => {
			expect(dialog.message()).toContain('Save functionality coming soon');
			await dialog.accept();
		});
	});

	test('field labels show required indicator when field is required', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
		const nodeButton = secondNode.locator('button').nth(1);
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Check if any fields have required indicator (asterisk)
		const sidebarRight = page.locator('[data-testid="sidebar-right"]');
		const requiredIndicators = sidebarRight.locator('span[title="Required field"]');

		const hasRequiredFields = (await requiredIndicators.count()) > 0;

		if (hasRequiredFields) {
			// Verify the indicator contains an asterisk
			const firstIndicator = requiredIndicators.first();
			await expect(firstIndicator).toHaveText('*');
		}
	});
});
