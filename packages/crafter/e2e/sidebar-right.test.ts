import { expect, Page, test } from '@playwright/test';

test.describe('Properties Panel Tests', () => {
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

	// Note: Right sidebar only appears at container width >= 1280px
	// At smaller sizes, a Sheet component is used instead
	// These tests use the wide viewport or Sheet fallback

	test.describe('Wide Viewport (Right Sidebar visible)', () => {
		test.use({ viewport: { width: 1400, height: 900 } });

		test('right sidebar is visible at wide viewport', async ({ page }) => {
			await page.waitForTimeout(500);

			// Find the right sidebar
			const sidebarRight = page.locator('[data-side="right"]');
			await expect(sidebarRight).toBeVisible();

			// Verify it has the "Properties" header - use first() to avoid strict mode violation
			await expect(sidebarRight.getByText('Properties').first()).toBeVisible();
		});

		test('shows "no component selected" state initially', async ({ page }) => {
			await page.waitForTimeout(500);

			const sidebarRight = page.locator('[data-side="right"]');
			await expect(sidebarRight).toBeVisible();

			// Should show the "no selection" message
			await expect(sidebarRight.getByText('No component selected')).toBeVisible();
			await expect(
				sidebarRight.getByText('Select a component in the tree or preview to edit its properties')
			).toBeVisible();
		});

		test('selecting a component shows properties panel', async ({ page }) => {
			await page.waitForTimeout(500);

			// Expand root to find a child node with properties
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Find and click on a child node in the left sidebar tree
			const childNodeContainer = page
				.locator('[data-tree-node-id]:not([data-tree-node-id="__root__"])')
				.first();
			if (await childNodeContainer.isVisible()) {
				await childNodeContainer.click();
				await page.waitForTimeout(300);

				// Verify that the right sidebar now shows component info
				const sidebarRight = page.locator('[data-side="right"]');

				// Should no longer show "no component selected"
				await expect(sidebarRight.getByText('No component selected')).not.toBeVisible();

				// Should show either properties or "no editable properties" message
				const hasProperties = await sidebarRight
					.locator('input, textarea, button[role="switch"], button[role="combobox"]')
					.count();
				const noPropertiesMsg = await sidebarRight
					.getByText('This component type has no editable properties.')
					.isVisible()
					.catch(() => false);

				// Either has input fields OR shows no properties message
				expect(hasProperties > 0 || noPropertiesMsg).toBeTruthy();
			}
		});

		test('selecting a component with text field allows editing', async ({ page }) => {
			await page.waitForTimeout(500);

			// Expand the tree to find a component with text properties
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Try to find a node that might have text fields
			const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
			const nodeCount = await childNodes.count();

			if (nodeCount > 0) {
				const node = childNodes.first();
				await node.click();
				await page.waitForTimeout(300);

				// Check if there are any text inputs in the right sidebar
				const sidebarRight = page.locator('[data-side="right"]');
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
			await page.waitForTimeout(500);

			// Expand the tree
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Try different nodes to find one with a textarea
			const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
			const nodeCount = await childNodes.count();

			for (let i = 0; i < Math.min(nodeCount, 5); i++) {
				const node = childNodes.nth(i);
				// Only click if node is visible
				if (await node.isVisible().catch(() => false)) {
					await node.scrollIntoViewIfNeeded();
					await node.click();
					await page.waitForTimeout(200);
				} else {
					continue;
				}

				const sidebarRight = page.locator('[data-side="right"]');
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
			await page.waitForTimeout(500);

			// Expand the tree
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Try different nodes to find one with a number input
			const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
			const nodeCount = await childNodes.count();

			for (let i = 0; i < Math.min(nodeCount, 5); i++) {
				const node = childNodes.nth(i);
				// Only click if node is visible
				if (await node.isVisible().catch(() => false)) {
					await node.scrollIntoViewIfNeeded();
					await node.click();
					await page.waitForTimeout(200);
				} else {
					continue;
				}

				const sidebarRight = page.locator('[data-side="right"]');
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
			await page.waitForTimeout(500);

			// Expand the tree
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Try different nodes to find one with a switch
			const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
			const nodeCount = await childNodes.count();

			for (let i = 0; i < Math.min(nodeCount, 5); i++) {
				const node = childNodes.nth(i);
				// Only click if node is visible
				if (await node.isVisible().catch(() => false)) {
					await node.scrollIntoViewIfNeeded();
					await node.click();
					await page.waitForTimeout(200);
				} else {
					continue;
				}

				const sidebarRight = page.locator('[data-side="right"]');
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
			await page.waitForTimeout(500);

			// Expand the tree
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Try different nodes to find one with a select
			const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
			const nodeCount = await childNodes.count();

			for (let i = 0; i < Math.min(nodeCount, 5); i++) {
				const node = childNodes.nth(i);
				// Only click if node is visible
				if (await node.isVisible().catch(() => false)) {
					await node.scrollIntoViewIfNeeded();
					await node.click();
					await page.waitForTimeout(200);
				} else {
					continue;
				}

				const sidebarRight = page.locator('[data-side="right"]');
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

		test('field labels are displayed correctly', async ({ page }) => {
			await page.waitForTimeout(500);

			// Expand the tree
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Select a child node
			const childNode = page
				.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
				.first();
			await childNode.click();
			await page.waitForTimeout(300);

			// Check if field labels are displayed
			const sidebarRight = page.locator('[data-side="right"]');
			const fieldLabels = sidebarRight.locator('label');

			const labelCount = await fieldLabels.count();
			if (labelCount > 0) {
				// Verify at least one label is visible and has text
				const firstLabel = fieldLabels.first();
				await expect(firstLabel).toBeVisible();
				const labelText = await firstLabel.textContent();
				expect(labelText).toBeTruthy();
				expect(labelText?.trim().length).toBeGreaterThan(0);
			}
		});
	});

	test.describe('Header Actions (Import/Export/Save)', () => {
		test('save button is visible in header and clickable', async ({ page }) => {
			// Find the save button in header
			const header = page.locator('header');
			const saveButton = header.getByRole('button', { name: 'Save' });

			await expect(saveButton).toBeVisible();
			await expect(saveButton).toBeEnabled();

			// Set up dialog handler before clicking
			page.on('dialog', async (dialog) => {
				expect(dialog.message()).toContain('Save functionality coming soon');
				await dialog.accept();
			});

			// Click save button
			await saveButton.click();
		});

		test('more actions menu opens and shows import/export options', async ({ page }) => {
			// Find the More Actions button in header
			const header = page.locator('header');
			const moreActionsButton = header.locator('button[title="More Actions"]');

			await expect(moreActionsButton).toBeVisible();
			await moreActionsButton.click();
			await page.waitForTimeout(200);

			// Verify dropdown is visible
			const dropdown = page.locator('[data-dropdown-menu-content]');
			await expect(dropdown).toBeVisible();

			// Verify import/export options are present
			await expect(dropdown.getByText('Import Theme')).toBeVisible();
			await expect(dropdown.getByText('Import Content')).toBeVisible();
			await expect(dropdown.getByText('Export Theme')).toBeVisible();
			await expect(dropdown.getByText('Export Content')).toBeVisible();
		});

		test('export theme option is clickable', async ({ page }) => {
			// Open more actions menu
			const header = page.locator('header');
			const moreActionsButton = header.locator('button[title="More Actions"]');
			await moreActionsButton.click();
			await page.waitForTimeout(200);

			// Click export theme
			const dropdown = page.locator('[data-dropdown-menu-content]');
			const exportThemeButton = dropdown.getByText('Export Theme');

			// Set up download handler
			const [download] = await Promise.all([
				page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
				exportThemeButton.click()
			]);

			// If download was triggered, verify it's a JSON file
			if (download) {
				expect(download.suggestedFilename()).toContain('.ujlt.json');
			}
		});

		test('export content option is clickable', async ({ page }) => {
			// Open more actions menu
			const header = page.locator('header');
			const moreActionsButton = header.locator('button[title="More Actions"]');
			await moreActionsButton.click();
			await page.waitForTimeout(200);

			// Click export content
			const dropdown = page.locator('[data-dropdown-menu-content]');
			const exportContentButton = dropdown.getByText('Export Content');

			// Set up download handler
			const [download] = await Promise.all([
				page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
				exportContentButton.click()
			]);

			// If download was triggered, verify it's a JSON file
			if (download) {
				expect(download.suggestedFilename()).toContain('.ujlc.json');
			}
		});
	});

	test.describe('Narrow Viewport (Sheet Panel)', () => {
		test.use({ viewport: { width: 1024, height: 768 } });

		test('properties panel trigger button appears at narrow viewport', async ({ page }) => {
			await page.waitForTimeout(500);

			// Right sidebar should NOT be visible
			const sidebarRight = page.locator('[data-side="right"]');
			await expect(sidebarRight).not.toBeVisible();

			// Properties panel trigger button should be visible in header
			const header = page.locator('header');
			const propertiesButton = header.locator('button[title="Open Properties Panel"]');
			await expect(propertiesButton).toBeVisible();
		});

		test('clicking properties button opens sheet panel', async ({ page }) => {
			await page.waitForTimeout(500);

			// Click the properties button
			const header = page.locator('header');
			const propertiesButton = header.locator('button[title="Open Properties Panel"]');
			await propertiesButton.click();
			await page.waitForTimeout(300);

			// Verify sheet is visible
			const sheet = page.locator('[data-slot="sheet-content"]');
			await expect(sheet).toBeVisible();

			// Verify it has the "Properties" title - use first() to avoid strict mode violation
			await expect(sheet.getByText('Properties').first()).toBeVisible();
		});

		test('sheet panel shows no component selected message', async ({ page }) => {
			await page.waitForTimeout(500);

			// Open the properties sheet
			const header = page.locator('header');
			const propertiesButton = header.locator('button[title="Open Properties Panel"]');
			await propertiesButton.click();
			await page.waitForTimeout(300);

			// Verify sheet content
			const sheet = page.locator('[data-slot="sheet-content"]');
			await expect(sheet.getByText('No component selected')).toBeVisible();
		});

		test('sheet panel shows properties when component is selected', async ({ page }) => {
			await page.waitForTimeout(500);

			// Select a component first
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			// Open the properties sheet
			const header = page.locator('header');
			const propertiesButton = header.locator('button[title="Open Properties Panel"]');
			await propertiesButton.click();
			await page.waitForTimeout(300);

			// Verify sheet shows component info (not "no component selected")
			const sheet = page.locator('[data-slot="sheet-content"]');
			await expect(sheet.getByText('No component selected')).not.toBeVisible();
		});
	});
});
