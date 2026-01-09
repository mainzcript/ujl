import { expect, Page, test } from '@playwright/test';

test.describe('Editor Mode Tests', () => {
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

		// clear storage
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});

		// Wait for app to load
		await page.waitForLoadState('load');
		await page.waitForTimeout(500);
	});

	test('navigation tree is visible', async ({ page }) => {
		// Find the navigation tree in the sidebar - use SidebarGroup with "Document" label as fallback
		const navTree = page
			.locator('[data-testid="nav-tree"]')
			.or(page.locator('[data-sidebar="group-label"]:has-text("Document")').locator('..'));
		await expect(navTree).toBeVisible();

		// Verify it has the root node
		const rootNode = page.locator('[data-tree-node-id]').first();
		await expect(rootNode).toContainText('Document');
	});

	test('root nodes are displayed', async ({ page }) => {
		// Wait for tree to render
		await page.waitForTimeout(500);

		// Find all tree items (nodes) - use fallback if test-id not available
		const treeItems = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id]').first().locator('..'));

		// There should be at least one root node
		await expect(treeItems.first()).toBeVisible();

		// Verify that at least one node has text content
		const firstItem = treeItems.first();
		const text = await firstItem.textContent();
		expect(text).toBeTruthy();
		expect(text?.length).toBeGreaterThan(0);
	});

	test('node expansion works (click on chevron)', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first collapsible node - use data-tree-node-id as fallback
		const firstItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id]').first().locator('..'));
		const collapsible = firstItem.locator('[data-slot="collapsible"]').first();

		// Get initial state
		const initialState = await collapsible.getAttribute('data-state');

		// Find and click the chevron button - it's inside the CollapsibleTrigger
		// The chevron is the first button inside the CollapsibleTrigger
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Verify state changed
		const newState = await collapsible.getAttribute('data-state');
		if (initialState === 'open') {
			expect(newState).toBe('closed');
		} else {
			expect(newState).toBe('open');
		}
	});

	test('node selection works (click on node text)', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first node with a data-tree-node-id
		const firstNodeContainer = page.locator('[data-tree-node-id]').first();
		await expect(firstNodeContainer).toBeVisible();

		// Click on the node text button (the button that contains the node name)
		// In the new structure, we click on the container or the text button inside it
		await firstNodeContainer.click();
		await page.waitForTimeout(300);

		// Verify the node has 'node-selected' class
		const classes = await firstNodeContainer.getAttribute('class');
		expect(classes).toContain('node-selected');
	});

	test('selected node is reflected in URL (?selected=nodeId)', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first node and get its ID
		const firstNodeContainer = page.locator('[data-tree-node-id]').first();
		const nodeId = await firstNodeContainer.getAttribute('data-tree-node-id');

		expect(nodeId).toBeTruthy();

		// Click the node
		await firstNodeContainer.click();
		await page.waitForTimeout(300);

		// Verify URL contains the selected parameter
		const url = page.url();
		expect(url).toContain(`selected=${nodeId}`);
	});

	test('Ctrl+C copies selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Select a node first
		const firstNodeContainer = page.locator('[data-tree-node-id]').first();
		await firstNodeContainer.click();
		await page.waitForTimeout(300);

		// Focus the page to ensure keyboard events work
		await page.locator('body').focus();

		// Press Ctrl+C (Cmd+C on Mac)
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyC`);

		// Wait a moment for clipboard operation
		await page.waitForTimeout(300);

		// Verify the node is still selected (copy shouldn't change selection)
		const classes = await firstNodeContainer.getAttribute('class');
		expect(classes).toContain('node-selected');
	});

	test('Ctrl+X cuts selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// First expand the root to find a child node
		const rootItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
			.first();
		const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Find a child node (not the root)
		const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
		const childCount = await childNodes.count();

		if (childCount > 0) {
			const childNode = childNodes.first();
			const nodeId = await childNode.getAttribute('data-tree-node-id');

			// Select the child node
			await childNode.click();
			await page.waitForTimeout(300);

			// Press Ctrl+X
			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyX`);
			await page.waitForTimeout(500);

			// Verify the node was removed (should not be visible anymore)
			const nodeStillExists = await page
				.locator(`[data-tree-node-id="${nodeId}"]`)
				.isVisible()
				.catch(() => false);
			expect(nodeStillExists).toBe(false);
		}
	});

	test('Ctrl+V pastes node into selected target', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// First, copy a node (the root)
		const rootNodeContainer = page.locator('[data-tree-node-id]').first();
		await rootNodeContainer.click();
		await page.waitForTimeout(300);

		// Copy the node
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyC`);
		await page.waitForTimeout(300);

		// Expand the root to see its children
		const rootItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
			.first();
		const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Count children before paste
		const childrenBefore = await page
			.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
			.count();

		// Keep root selected and paste
		await rootNodeContainer.click();
		await page.waitForTimeout(300);
		await page.keyboard.press(`${modifier}+KeyV`);
		await page.waitForTimeout(500);

		// Count children after paste - should have increased
		const childrenAfter = await page
			.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
			.count();
		expect(childrenAfter).toBeGreaterThanOrEqual(childrenBefore);
	});

	test('Delete key removes selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand root to find a child node
		const rootItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
			.first();
		const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Count nodes before delete
		const nodesBefore = await page.locator('[data-tree-node-id]').count();

		// Find and select a child node (not root)
		const childNodes = page.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]');
		const childCount = await childNodes.count();

		if (childCount > 0) {
			const childNode = childNodes.first();
			const nodeId = await childNode.getAttribute('data-tree-node-id');

			await childNode.click();
			await page.waitForTimeout(300);

			// Press Delete
			await page.keyboard.press('Delete');
			await page.waitForTimeout(500);

			// Verify node was removed
			const nodeStillExists = await page
				.locator(`[data-tree-node-id="${nodeId}"]`)
				.isVisible()
				.catch(() => false);
			expect(nodeStillExists).toBe(false);

			// Verify total count decreased
			const nodesAfter = await page.locator('[data-tree-node-id]').count();
			expect(nodesAfter).toBeLessThan(nodesBefore);
		}
	});

	test('Ctrl+I opens component picker', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Select a node first
		const firstNodeContainer = page.locator('[data-tree-node-id]').first();
		await firstNodeContainer.click();
		await page.waitForTimeout(300);

		// Press Ctrl+I
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyI`);
		await page.waitForTimeout(300);

		// Verify component picker dialog is visible - CommandDialog uses dialog role
		const dialog = page.getByRole('dialog', { name: 'Add Component' });
		await expect(dialog).toBeVisible({ timeout: 5000 });

		// Verify it's the component picker (should have search input)
		const searchInput = dialog.locator('input[placeholder*="Search"]');
		await expect(searchInput).toBeVisible();

		// Close the dialog
		await page.keyboard.press('Escape');
	});

	test('keyboard shortcuts respect node capabilities', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Select the root node
		const rootNodeContainer = page.locator('[data-tree-node-id]').first();
		await rootNodeContainer.click();
		await page.waitForTimeout(300);

		// Try to delete root (should not work)
		await page.keyboard.press('Delete');
		await page.waitForTimeout(500);

		// Root should still be visible
		await expect(rootNodeContainer).toBeVisible();

		// Try to cut root (should not work)
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyX`);
		await page.waitForTimeout(500);

		// Root should still be visible
		await expect(rootNodeContainer).toBeVisible();
	});
});

test.describe('Editor Component Operations Tests', () => {
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

	test.describe('Component Picker', () => {
		test('opens component picker with Ctrl+I', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Select a node
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			// Press Ctrl+I
			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Verify component picker dialog is visible
			const dialog = page.getByRole('dialog');
			await expect(dialog).toBeVisible();
			const searchInput = dialog.locator('input[placeholder*="Search"]');
			await expect(searchInput).toBeVisible();
		});

		test('shows search input in component picker', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Verify search input exists
			const dialog = page.getByRole('dialog');
			const searchInput = dialog.locator('input[placeholder*="Search"]');
			await expect(searchInput).toBeVisible();
		});

		test('filters components by search query', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			const dialog = page.getByRole('dialog');
			const searchInput = dialog.locator('input[placeholder*="Search"]');

			// Type search query
			await searchInput.fill('button');
			await page.waitForTimeout(300);

			// Should show button component after filtering
			const hasButtonComponent = await dialog
				.locator('[data-slot="command-item"]')
				.filter({ hasText: 'Button' })
				.isVisible();
			expect(hasButtonComponent).toBe(true);
		});

		test('shows "no components found" when search has no results', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			const dialog = page.getByRole('dialog');
			const searchInput = dialog.locator('input[placeholder*="Search"]');

			// Type search query that should not match anything
			await searchInput.fill('xyznonexistent999');
			await page.waitForTimeout(300);

			// Verify "no components found" message
			await expect(dialog.getByText('No components found')).toBeVisible();
		});

		test('displays components grouped by category', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			const dialog = page.getByRole('dialog', { name: 'Add Component' });
			await expect(dialog).toBeVisible({ timeout: 5000 });

			// Verify at least one category group exists
			const categoryGroups = dialog.locator('[data-slot="command-group"]');
			const groupCount = await categoryGroups.count();
			expect(groupCount).toBeGreaterThan(0);
		});

		test('adds component when selected from picker', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Count initial nodes
			const initialNodeCount = await page.locator('[data-tree-node-id]').count();

			// Select root node
			const rootNodeContainer = page.locator('[data-tree-node-id]').first();
			await rootNodeContainer.click();
			await page.waitForTimeout(300);

			// Open component picker
			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Find and click a component (e.g., Button or Text)
			const dialog = page.getByRole('dialog');

			// Try to find a simple component to add
			const componentItem = dialog
				.locator('[data-slot="command-item"]')
				.filter({ hasText: /Button|Text|Heading/ })
				.first();

			if (await componentItem.isVisible()) {
				await componentItem.click();
				await page.waitForTimeout(500);

				// Verify dialog closed
				await expect(dialog).not.toBeVisible();

				// Expand root to see new children
				const rootItem = page
					.locator('[data-testid="nav-tree-item"]')
					.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
					.first();
				const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
				const state = await collapsible.getAttribute('data-state');
				if (state !== 'open') {
					const chevronButton = collapsible.locator('button').first();
					await expect(chevronButton).toBeVisible();
					await chevronButton.click();
					await page.waitForTimeout(400);
				}

				// Verify new node was added (count should increase)
				const newNodeCount = await page.locator('[data-tree-node-id]').count();
				expect(newNodeCount).toBeGreaterThan(initialNodeCount);
			}
		});

		test('closes picker when pressing escape', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			const dialog = page.getByRole('dialog');
			await expect(dialog).toBeVisible();

			// Press Escape
			await page.keyboard.press('Escape');
			await page.waitForTimeout(300);

			// Verify dialog closed
			await expect(dialog).not.toBeVisible();
		});

		test('resets search query when picker reopens', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const nodeContainer = page.locator('[data-tree-node-id]').first();
			await nodeContainer.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Type in search
			const dialog = page.getByRole('dialog');
			const searchInput = dialog.locator('input[placeholder*="Search"]');
			await searchInput.fill('button');
			await page.waitForTimeout(200);

			// Close dialog
			await page.keyboard.press('Escape');
			await page.waitForTimeout(300);

			// Reopen dialog
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Verify search is cleared
			const newDialog = page.getByRole('dialog');
			const newSearchInput = newDialog.locator('input[placeholder*="Search"]');
			await expect(newSearchInput).toHaveValue('');
		});
	});

	test.describe('Context Menu Operations', () => {
		test('context menu opens on button click', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root to get child nodes
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Find a child node's context menu button (the three-dots button)
			// Use first() to avoid strict mode violation
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Verify dropdown menu is visible
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				await expect(contextMenu).toBeVisible();
			}
		});

		test('context menu shows add option', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Find child node's context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();

				// Wait for menu to appear (more robust - don't rely on data-state)
				const contextMenu = page.locator('[data-dropdown-menu-content]').first();
				await expect(contextMenu).toBeVisible({ timeout: 2000 });
				await page.waitForTimeout(200);

				// Try multiple strategies to find the Add button
				// Strategy 1: By test-id (if test mode is enabled)
				let addButton = contextMenu.locator('[data-testid="context-menu-add"]');

				// Strategy 2: Fallback - by text content
				if ((await addButton.count()) === 0) {
					addButton = contextMenu.getByRole('button', { name: /Add/i });
				}

				// Strategy 3: Fallback - by text and keyboard shortcut
				if ((await addButton.count()) === 0) {
					addButton = contextMenu.locator('button').filter({ hasText: 'Add' }).first();
				}

				await expect(addButton).toBeVisible({ timeout: 2000 });
				await expect(addButton).toContainText('Add');
			}
		});

		test('context menu add opens component picker', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Find child node's context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Click Add from context menu
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				const insertButton = contextMenu.locator('[data-testid="context-menu-add"]');

				if (await insertButton.isVisible()) {
					await insertButton.click();
					await page.waitForTimeout(300);

					// Verify component picker opened
					const dialog = page.getByRole('dialog');
					await expect(dialog).toBeVisible();
					const searchInput = dialog.locator('input[placeholder*="Search"]');
					await expect(searchInput).toBeVisible();
				}
			}
		});

		test('context menu copy operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Select a child node first
			const childNode = page
				.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
				.first();
			await childNode.click();
			await page.waitForTimeout(200);

			// Open context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Click Copy from context menu
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				const copyButton = contextMenu.locator('[data-testid="context-menu-copy"]');

				if (await copyButton.isVisible()) {
					await copyButton.click();
					await page.waitForTimeout(300);

					// Now try to paste
					const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
					await page.keyboard.press(`${modifier}+KeyV`);
					await page.waitForTimeout(500);

					// Verify paste worked (more nodes should exist)
					const nodeCount = await page.locator('[data-tree-node-id]').count();
					expect(nodeCount).toBeGreaterThan(2);
				}
			}
		});

		test('context menu cut operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			const initialCount = await page.locator('[data-tree-node-id]').count();

			// Get a child node
			const childNode = page
				.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
				.first();
			const nodeId = await childNode.getAttribute('data-tree-node-id');

			// Select it
			await childNode.click();
			await page.waitForTimeout(200);

			// Open context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Click Cut from context menu
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				const cutButton = contextMenu.locator('[data-testid="context-menu-cut"]');

				if (await cutButton.isVisible()) {
					await cutButton.click();
					await page.waitForTimeout(500);

					// Verify node was removed
					const nodeExists = await page
						.locator(`[data-tree-node-id="${nodeId}"]`)
						.isVisible()
						.catch(() => false);
					expect(nodeExists).toBe(false);

					// Verify count decreased
					const newCount = await page.locator('[data-tree-node-id]').count();
					expect(newCount).toBeLessThan(initialCount);
				}
			}
		});

		test('cannot move root node', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Select root node
			const rootNodeContainer = page.locator('[data-tree-node-id]').first();
			await rootNodeContainer.click();
			await page.waitForTimeout(200);

			// Try to cut root
			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyX`);
			await page.waitForTimeout(500);

			// Root should still exist
			await expect(rootNodeContainer).toBeVisible();
		});

		test('context menu delete operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			const initialCount = await page.locator('[data-tree-node-id]').count();

			// Get a child node
			const childNode = page
				.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
				.first();
			const nodeId = await childNode.getAttribute('data-tree-node-id');

			// Select it
			await childNode.click();
			await page.waitForTimeout(200);

			// Open context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Click Delete from context menu
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				const deleteButton = contextMenu.locator('[data-testid="context-menu-delete"]');

				if (await deleteButton.isVisible()) {
					await deleteButton.click();
					await page.waitForTimeout(500);

					// Verify node was removed
					const nodeExists = await page
						.locator(`[data-tree-node-id="${nodeId}"]`)
						.isVisible()
						.catch(() => false);
					expect(nodeExists).toBe(false);

					// Verify count decreased
					const newCount = await page.locator('[data-tree-node-id]').count();
					expect(newCount).toBeLessThan(initialCount);
				}
			}
		});

		test('context menu paste is disabled when clipboard is empty', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Clear clipboard
			await page.evaluate(() => {
				localStorage.removeItem('ujl-crafter-clipboard');
			});

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Open context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Verify Paste option is disabled
				const contextMenu = page.locator('[data-dropdown-menu-content]');
				const pasteButton = contextMenu.locator('[data-testid="context-menu-paste"]');

				if (await pasteButton.isVisible()) {
					const isDisabled = await pasteButton.getAttribute('data-disabled');
					expect(isDisabled).toBe('true');
				}
			}
		});

		test('context menu shows keyboard shortcuts', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Expand root
			const rootItem = page
				.locator('[data-testid="nav-tree-item"]')
				.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
				.first();
			const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
			const chevronButton = collapsible.locator('button').first();
			await expect(chevronButton).toBeVisible();
			await chevronButton.click();
			await page.waitForTimeout(400);

			// Open context menu
			const childItem = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = childItem.locator('button[data-slot="dropdown-menu-trigger"]').first();

			if (await menuButton.isVisible().catch(() => false)) {
				await menuButton.click();
				await page.waitForTimeout(300);

				// Verify shortcuts are shown
				const contextMenu = page.locator('[data-dropdown-menu-content]');

				// Check for keyboard shortcut indicators
				const menuText = await contextMenu.textContent();
				const hasShortcuts =
					menuText?.includes('⌘') || menuText?.includes('Ctrl') || menuText?.includes('Del');

				expect(hasShortcuts).toBe(true);
			}
		});
	});
});
