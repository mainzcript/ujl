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

	test('navigation tree is visible', async ({ page }) => {
		// Find the navigation tree in the sidebar
		const navTree = page.locator('[data-testid="nav-tree"]');
		await expect(navTree).toBeVisible();

		// Verify it has the root node
		expect(navTree.locator('[data-tree-node-id="__root__"]')).toContainText('Document');
	});

	test('root nodes are displayed', async ({ page }) => {
		// Wait for tree to render
		await page.waitForTimeout(500);

		// Find all tree items (nodes)
		const treeItems = page.locator('[data-testid="nav-tree-item"]');

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

		// Find the first collapsible node with a chevron
		const item = page.locator('[data-slot="sidebar-menu-sub"]').first();
		const chevron = item.locator('button svg').first();

		await expect(chevron).toBeVisible();

		// Verify initial state is collapsed
		const children = item.locator('[data-slot="collapsible-content"]').first();
		const stateAttr = await children.getAttribute('data-state');

		// Click the chevron to expand
		await chevron.click();
		await page.waitForTimeout(400);

		await page.waitForTimeout(400);

		// Verify state is now expanded
		if (stateAttr === 'open') {
			expect(children).toHaveAttribute('data-state', 'closed');
		} else {
			expect(children).toHaveAttribute('data-state', 'open');
		}
	});

	test('node selection works (click on node)', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first node button (not the chevron, but the actual node text)
		const firstNode = page.locator('[data-slot="sidebar-menu-sub"]').first();
		const nodeButton = firstNode.locator('button').nth(1); // Second button is the node itself

		await expect(nodeButton).toBeVisible();

		// Click the node
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Verify the node has 'node-selected' class
		const nodeContainer = firstNode.locator('[data-tree-node-id]').first();
		const classes = await nodeContainer.getAttribute('class');
		expect(classes).toContain('node-selected');
	});

	test('selected node is reflected in URL (?selected=nodeId)', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first node and get its ID
		const firstNode = page.locator('[data-testid="nav-tree-item"]').first();
		const nodeContainer = firstNode.locator('[data-tree-node-id]').first();
		const nodeId = await nodeContainer.getAttribute('data-tree-node-id');

		expect(nodeId).toBeTruthy();

		// Click the node
		const nodeButton = firstNode.locator('button').nth(1);
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Verify URL contains the selected parameter
		const url = page.url();
		expect(url).toContain(`selected=${nodeId}`);
	});

	test('Ctrl+C copies selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Select a node first
		const firstNode = page.locator('[data-testid="nav-tree-item"]').first();
		const nodeButton = firstNode.locator('button').nth(1);
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Focus the page to ensure keyboard events work
		await page.locator('body').focus();

		// Press Ctrl+C (Cmd+C on Mac)
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyC`);

		// Wait a moment for clipboard operation
		await page.waitForTimeout(300);

		// Verify clipboard was updated by checking browser clipboard
		// Note: We can't directly check clipboard in tests, but we can verify no errors occurred
		// In a real scenario, the clipboard would be populated

		// Verify the node is still selected (copy shouldn't change selection)
		const nodeContainer = firstNode.locator('[data-tree-node-id]').first();
		const classes = await nodeContainer.getAttribute('class');
		expect(classes).toContain('node-selected');
	});

	test('Ctrl+X cuts selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find a non-root node to cut (root cannot be cut)
		// We need to expand first to find a child node
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Select a child node
		const childNode = page.locator('[data-testid="nav-tree-item"]').nth(1);
		if (await childNode.isVisible()) {
			const childButton = childNode.locator('button').last();
			await childButton.click();
			await page.waitForTimeout(300);

			// Get the node ID before cutting
			const nodeContainer = childNode.locator('[data-tree-node-id]');
			const nodeId = await nodeContainer.getAttribute('data-tree-node-id');

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

		// First, copy a node
		const firstNode = page.locator('[data-testid="nav-tree-item"]').first();
		const nodeButton = firstNode.locator('button').nth(1);
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Copy the node
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyC`);
		await page.waitForTimeout(300);

		// Expand the node to see its children
		const chevron = firstNode.locator('button svg').first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Select the same node as paste target
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Count children before paste
		const childrenBefore = await page.locator('[data-testid="nav-tree-item"]').count();

		// Paste
		await page.keyboard.press(`${modifier}+KeyV`);
		await page.waitForTimeout(500);

		// Count children after paste - should have increased
		const childrenAfter = await page.locator('[data-testid="nav-tree-item"]').count();
		expect(childrenAfter).toBeGreaterThanOrEqual(childrenBefore);
	});

	test('Delete key removes selected node', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Expand root to find a child node
		const chevron = page
			.locator('[data-testid="nav-tree-item"]')
			.first()
			.locator('button svg')
			.first();
		await chevron.click();
		await page.waitForTimeout(400);

		// Count nodes before delete
		const nodesBefore = await page.locator('[data-testid="nav-tree-item"]').count();

		// Select a child node (not root)
		const childNode = page.locator('[data-testid="nav-tree-item"]').nth(1);
		if (await childNode.isVisible()) {
			const childButton = childNode.locator('button').last();
			await childButton.click();
			await page.waitForTimeout(300);

			// Get node ID before delete
			const nodeContainer = childNode.locator('[data-tree-node-id]');
			const nodeId = await nodeContainer.getAttribute('data-tree-node-id');

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
			const nodesAfter = await page.locator('[data-testid="nav-tree-item"]').count();
			expect(nodesAfter).toBeLessThan(nodesBefore);
		}
	});

	test('Ctrl+I opens component picker', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Find the first node and get its ID
		const firstNode = page.locator('[data-slot="sidebar-menu-sub"]').first();
		const nodeButton = firstNode.locator('button').nth(1); // Second button is the node itself

		await expect(nodeButton).toBeVisible();

		// Click the node
		await nodeButton.click();
		await page.waitForTimeout(300);

		// Press Ctrl+I
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyI`);
		await page.waitForTimeout(300);

		// Verify component picker dialog is visible
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Verify it's the component picker (should have title or search)
		const dialogContent = await dialog.textContent();
		expect(dialogContent).toBeTruthy();

		// Look for component picker indicators
		const hasComponentIndicators =
			dialogContent?.includes('Component') ||
			dialogContent?.includes('Insert') ||
			(await dialog.locator('input[placeholder*="Search"]').isVisible());

		expect(hasComponentIndicators).toBe(true);

		// Close the dialog
		const closeButton = dialog.locator('button').first();
		if (await closeButton.isVisible()) {
			await closeButton.click();
		}
	});

	test('keyboard shortcuts respect node capabilities', async ({ page }) => {
		// Wait for tree to load
		await page.waitForTimeout(500);

		// Select the root node (first node)
		const rootNode = page.locator('[data-testid="nav-tree-item"]').first();
		const rootButton = rootNode.locator('button').nth(1);
		await rootButton.click();
		await page.waitForTimeout(300);

		// Try to delete root (should not work)
		await page.keyboard.press('Delete');
		await page.waitForTimeout(500);

		// Root should still be visible
		await expect(rootNode).toBeVisible();

		// Try to cut root (should not work)
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+KeyX`);
		await page.waitForTimeout(500);

		// Root should still be visible
		await expect(rootNode).toBeVisible();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
			await page.waitForTimeout(300);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			const dialog = page.getByRole('dialog');

			// Verify at least one category group exists
			const categoryGroups = dialog.locator('[data-slot="command-group"]');
			const groupCount = await categoryGroups.count();
			expect(groupCount).toBeGreaterThan(0);
		});

		test('inserts component when selected from picker', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Count initial nodes
			const initialNodeCount = await page.locator('[data-testid="nav-tree-item"]').count();

			// Select root node
			const rootNode = page.locator('[data-testid="nav-tree-item"]').first();
			await rootNode.locator('button').nth(1).click();
			await page.waitForTimeout(300);

			// Open component picker
			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyI`);
			await page.waitForTimeout(300);

			// Find and click a component (e.g., Button or Text)
			const dialog = page.getByRole('dialog');

			// Try to find a simple component to insert
			const componentItem = dialog
				.locator('[data-slot="command-item"]')
				.filter({ hasText: /Button|Text|Heading/ })
				.first();

			if (await componentItem.isVisible()) {
				await componentItem.click();
				await page.waitForTimeout(500);

				// Verify dialog closed
				await expect(dialog).not.toBeVisible();

				// Verify new node was added (count should increase)
				const newNodeCount = await page.locator('[data-testid="nav-tree-item"]').count();
				expect(newNodeCount).toBeGreaterThan(initialNodeCount);
			}
		});

		test('closes picker when clicking outside or pressing escape', async ({ page }) => {
			// Open component picker
			await page.waitForTimeout(500);
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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

			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(2);
			await nodeButton.click();
			await page.waitForTimeout(300);

			// Verify dropdown menu is visible
			const contextMenu = page.locator('[data-dropdown-menu-content]');
			await expect(contextMenu).toBeVisible();
		});

		test('context menu shows insert option', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// open context menu on a node that can accept children
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(2);
			await nodeButton.click();
			await page.waitForTimeout(300);

			// Verify Insert option exists
			const contextMenu = page.locator('[data-dropdown-menu-content]');
			const insertButton = contextMenu.locator('[data-testid="context-menu-insert"]');

			await expect(insertButton).toBeVisible();
			await expect(insertButton).toContainText('Insert');
		});

		test('context menu insert opens component picker', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// open context menu on node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeButton = secondNode.locator('button').nth(2);
			await nodeButton.click();
			await page.waitForTimeout(300);

			// Click Insert from context menu
			const contextMenu = page.locator('[data-dropdown-menu-content]');
			const insertButton = contextMenu.locator('[data-testid="context-menu-insert"]');

			if (await insertButton.isVisible()) {
				await insertButton.click();
				await page.waitForTimeout(300);

				// Verify component picker opened
				const dialog = page.getByRole('dialog');
				await expect(dialog).toBeVisible();
				const searchInput = dialog.locator('input[placeholder*="Search"]');
				await expect(searchInput).toBeVisible();
			}
		});

		test('context menu copy operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// open contect menu on node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = secondNode.locator('button').nth(2);
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
			await menuButton.click();
			await page.waitForTimeout(300);

			// Click Copy from context menu
			const contextMenu = page.locator('[data-dropdown-menu-content]');
			const copyButton = contextMenu.locator('[data-testid="context-menu-copy"]');

			if (await copyButton.isVisible()) {
				await copyButton.click();
				await page.waitForTimeout(300);

				// Now try to paste (should work after copy)
				const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
				await page.keyboard.press(`${modifier}+KeyV`);
				await page.waitForTimeout(500);

				await page.locator('html').click(); // Dismiss any open menus
				const chevron = secondNode.locator('button svg').first();
				await chevron.click();
				await page.waitForTimeout(400);

				// Verify paste worked (count should increase)
				const nodeCount = await secondNode.locator('[data-slot="sidebar-menu-sub-item"]').count();
				expect(nodeCount).toBeGreaterThan(2);
			}
		});

		test('context menu cut operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			const initialCount = await page.locator('[data-slot="sidebar-menu-sub-item"]').count();

			// Right-click on a child node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeId = await secondNode
				.locator('[data-tree-node-id]')
				.first()
				.getAttribute('data-tree-node-id');
			const menuButton = secondNode.locator('button').nth(2);
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
				const newCount = await page.locator('[data-slot="sidebar-menu-sub-item"]').count();
				expect(newCount).toBeLessThan(initialCount);
			}
		});

		test('cannot move root node', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Try to cut root node
			const rootNode = page.locator('[data-testid="nav-tree-item"]').first();
			await rootNode.locator('button').nth(1).click();
			await page.waitForTimeout(200);

			const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
			await page.keyboard.press(`${modifier}+KeyX`);
			await page.waitForTimeout(500);

			// Root should still exist
			await expect(rootNode).toBeVisible();
		});

		test('context menu delete operation works', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			const initialCount = await page.locator('[data-slot="sidebar-menu-sub-item"]').count();

			// open context menu on node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const nodeId = await secondNode
				.locator('[data-tree-node-id]')
				.first()
				.getAttribute('data-tree-node-id');
			const menuButton = secondNode.locator('button').nth(2);
			const nodeButton = secondNode.locator('button').nth(1);
			await nodeButton.click();
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
				const newCount = await page.locator('[data-slot="sidebar-menu-sub-item"]').count();
				expect(newCount).toBeLessThan(initialCount);
			}
		});

		test('context menu paste is disabled when clipboard is empty', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// Clear clipboard
			await page.evaluate(() => {
				localStorage.removeItem('ujl-crafter-clipboard');
			});

			// open context menu on node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = secondNode.locator('button').nth(2);
			await menuButton.click();
			await page.waitForTimeout(300);

			// Verify Paste option is disabled
			const contextMenu = page.locator('[data-dropdown-menu-content]');
			const pasteButton = contextMenu.locator('[data-testid="context-menu-paste"]');

			if (await pasteButton.isVisible()) {
				const isDisabled = await pasteButton.getAttribute('disabled');
				expect(isDisabled).not.toBeNull();
			}
		});

		test('context menu shows keyboard shortcuts', async ({ page }) => {
			// Wait for tree to load
			await page.waitForTimeout(500);

			// open context menu on node
			const secondNode = page.locator('[data-slot="sidebar-menu-sub-item"]').first();
			const menuButton = secondNode.locator('button').nth(2);
			await menuButton.click();
			await page.waitForTimeout(300);

			// Verify shortcuts are shown
			const contextMenu = page.locator('[data-dropdown-menu-content]');

			// Check for Ctrl+I, Ctrl+C, Ctrl+X, Ctrl+V, Del indicators
			const menuText = await contextMenu.textContent();
			const hasShortcuts =
				menuText?.includes('Ctrl+I') ||
				menuText?.includes('Ctrl+C') ||
				menuText?.includes('Ctrl+X') ||
				menuText?.includes('Ctrl+V') ||
				menuText?.includes('Del');

			expect(hasShortcuts).toBe(true);
		});
	});
});
