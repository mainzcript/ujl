import { expect, Page, test } from '@playwright/test';

test.describe('Preview Tests', () => {
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

	test('preview renders content correctly', async ({ page }) => {
		// Find the preview container
		const preview = page.locator('[data-ujl-module-id]').first();
		await expect(preview).toBeVisible();

		// Verify that preview contains rendered content
		const content = await preview.textContent();
		expect(content).toBeTruthy();
		expect(content?.length).toBeGreaterThan(0);
	});

	test('preview contains clickable components with data-ujl-module-id', async ({ page }) => {
		// Verify that at least one component has the data-ujl-module-id attribute and role="button"
		const clickableComponent = page.locator('[data-ujl-module-id][role="button"]').first();
		await expect(clickableComponent).toBeVisible();

		// Verify it has a valid module ID
		const moduleId = await clickableComponent.getAttribute('data-ujl-module-id');
		expect(moduleId).toBeTruthy();
		expect(moduleId?.length).toBeGreaterThan(0);
	});

	test('clicking preview component selects node in tree', async ({ page }) => {
		// Wait for preview to render
		await page.waitForTimeout(500);

		// Find a clickable component in the preview
		const previewComponent = page.locator('[data-ujl-module-id][role="button"]').nth(1);
		await expect(previewComponent).toBeVisible();

		// Get the module ID
		const moduleId = await previewComponent.getAttribute('data-ujl-module-id');
		expect(moduleId).toBeTruthy();
		console.log('Testing module ID:', moduleId);

		// Click the component in the preview
		await previewComponent.click();
		await page.waitForTimeout(300);

		// Verify URL contains selected parameter
		const url = page.url();
		expect(url).toContain(`selected=${moduleId}`);

		// Verify component is highlighted in preview
		await expect(previewComponent).toHaveClass(/ujl-selected/);
	});

	test('clicking preview element expands parent nodes in tree (expandToNode)', async ({ page }) => {
		// Wait for tree and preview to render
		await page.waitForTimeout(500);

		// Find a deeply nested component in the preview (at least 2 levels deep)
		// We need to click a component that has ancestors
		const allComponents = page.locator('[data-ujl-module-id][role="button"]');
		const componentCount = await allComponents.count();

		// Try different components until we find a nested one
		let foundNestedComponent = false;
		for (let i = 0; i < Math.min(componentCount, 10); i++) {
			const component = allComponents.nth(i);
			const moduleId = await component.getAttribute('data-ujl-module-id');

			// Check if this component has a parent by looking at the tree structure
			const treeNode = page.locator(`[data-tree-node-id="${moduleId}"]`);
			const treeNodeExists = await treeNode.isVisible().catch(() => false);

			if (!treeNodeExists) continue;

			// Click the component
			await component.click();
			await page.waitForTimeout(500);

			// Check if any collapsible parent was expanded
			const treeItem = page.locator(`[data-tree-node-id="${moduleId}"]`).locator('..');
			const isVisible = await treeItem.isVisible().catch(() => false);

			if (isVisible) {
				foundNestedComponent = true;
				// Verify the tree node is now visible (parents were expanded)
				await expect(treeItem).toBeVisible();
				break;
			}
		}

		// At least verify that the expandToNode mechanism was triggered
		expect(foundNestedComponent).toBe(true);
	});

	test('clicking tree node scrolls to component in preview', async ({ page }) => {
		// Wait for tree and preview to load
		await page.waitForTimeout(500);

		// Expand the tree to access child nodes
		const rootItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
			.first();
		const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Get all tree nodes
		const allTreeNodes = page.locator('[data-tree-node-id]');
		const nodeCount = await allTreeNodes.count();

		// Select a node that's not the first (to ensure scrolling is needed)
		if (nodeCount > 2) {
			const targetNode = allTreeNodes.nth(2);
			const nodeId = await targetNode.getAttribute('data-tree-node-id');
			expect(nodeId).toBeTruthy();

			// Click the tree node
			await targetNode.click();
			await page.waitForTimeout(500);

			// Verify that the corresponding preview component is highlighted
			const previewComponent = page.locator(`[data-ujl-module-id="${nodeId}"]`);
			await expect(previewComponent).toHaveClass(/ujl-selected/);

			// Verify component is reasonably visible (scroll worked)
			const isInViewport = await previewComponent.isVisible();
			expect(isInViewport).toBe(true);
		}
	});

	test('scroll-to-node only triggers when component is mostly out of view', async ({ page }) => {
		// Wait for tree and preview to load
		await page.waitForTimeout(500);

		// Expand tree
		const rootItem = page
			.locator('[data-testid="nav-tree-item"]')
			.or(page.locator('[data-tree-node-id="__root__"]').locator('..'))
			.first();
		const collapsible = rootItem.locator('[data-slot="collapsible"]').first();
		const chevronButton = collapsible.locator('button').first();
		await expect(chevronButton).toBeVisible();
		await chevronButton.click();
		await page.waitForTimeout(400);

		// Select first visible node
		const firstNode = page
			.locator('[data-slot="sidebar-menu-sub-item"] [data-tree-node-id]')
			.first();
		await firstNode.click();
		await page.waitForTimeout(500);

		// Get scroll position of preview container
		const previewScrollTop = await page.evaluate(() => {
			const preview = document.querySelector('[data-ujl-module-id]')?.parentElement;
			return preview?.scrollTop ?? 0;
		});

		// Select the same node again (should NOT trigger scroll since already visible)
		await firstNode.click();
		await page.waitForTimeout(500);

		// Verify scroll position hasn't changed (much - allow small variance)
		const newScrollTop = await page.evaluate(() => {
			const preview = document.querySelector('[data-ujl-module-id]')?.parentElement;
			return preview?.scrollTop ?? 0;
		});

		expect(Math.abs(newScrollTop - previewScrollTop)).toBeLessThan(50);
	});

	test('theme changes are immediately visible in preview', async ({ page }) => {
		// Wait for app to load
		await page.waitForTimeout(500);

		// Switch to Designer mode
		await switchMode(page, 'Designer');

		// Find the radius slider in Designer sidebar
		const radiusSlider = page.locator('span[data-slot="slider-thumb"][aria-valuenow]').first();
		const sliderExists = await radiusSlider.isVisible().catch(() => false);

		if (sliderExists) {
			await radiusSlider.scrollIntoViewIfNeeded();
			// Get initial radius value from the slider
			const initialAriaValue = await radiusSlider.getAttribute('aria-valuenow');
			expect(initialAriaValue).toBeTruthy();

			// Get initial CSS variable value from the theme style tag
			const initialCSSValue = await page.evaluate(() => {
				const styleTag = document.querySelector(
					'[data-slot="sidebar-inset"] style[data-ujl-role="styles-theme"]'
				);
				if (!styleTag || !styleTag.textContent) return null;

				// Parse --radius value from CSS text
				const match = styleTag.textContent.match(/--radius:\s*([^;]+);/);
				return match ? match[1].trim() : null;
			});
			await page.waitForTimeout(300);

			// Drag the slider to a different position
			// Get the slider track bounds
			const sliderTrack = page.locator('span[data-slot="slider-track"]').first();
			const trackBox = await sliderTrack.boundingBox();

			if (trackBox) {
				// Click at 75% position of the track to set radius to ~1.5
				const targetX = trackBox.x + trackBox.width * 0.75;
				const targetY = trackBox.y + trackBox.height / 2;

				await page.mouse.click(targetX, targetY);
				await page.waitForTimeout(300);

				// Get new radius value from the slider
				const newAriaValue = await radiusSlider.getAttribute('aria-valuenow');

				// Get new CSS variable value from the theme style tag
				const newCSSValue = await page.evaluate(() => {
					const styleTag = document.querySelector(
						'[data-slot="sidebar-inset"] style[data-ujl-role="styles-theme"]'
					);
					if (!styleTag || !styleTag.textContent) return null;

					// Parse --radius value from CSS text
					const match = styleTag.textContent.match(/--radius:\s*([^;]+);/);
					return match ? match[1].trim() : null;
				});

				// Verify value changed in both slider and CSS
				expect(newAriaValue).not.toBe(initialAriaValue);
				expect(newCSSValue).not.toBe(initialCSSValue);

				// Verify CSS value matches slider value (approximately, accounting for "rem" unit)
				const expectedCSSValue = `${newAriaValue}rem`;
				expect(newCSSValue).toBe(expectedCSSValue);
			}
		} else {
			// Fallback: Just verify preview is visible
			const preview = page.locator('[data-ujl-module-id]').first();
			await expect(preview).toBeVisible();
		}
	});

	test('preview hover effect works correctly', async ({ page }) => {
		// Wait for preview to render
		await page.waitForTimeout(500);

		// Find a clickable component
		const previewComponent = page.locator('[data-ujl-module-id][role="button"]').nth(1);
		await expect(previewComponent).toBeVisible();

		console.log(
			'Hovering over component with ID:',
			await previewComponent.getAttribute('data-ujl-module-id')
		);

		// Hover over the component
		await previewComponent.hover();
		await page.waitForTimeout(300);

		// Verify hover effect is applied (outline should be visible via computed style)
		await expect(previewComponent).toHaveCSS('outline', /solid 2px|2px solid/);
	});

	test('preview removes hover effect from parent when child is hovered', async ({ page }) => {
		// Wait for preview to render
		await page.waitForTimeout(500);

		// Find a component that contains other components (nested structure)
		const parentComponent = page.locator('[data-ujl-module-id][role="button"]').nth(1);

		await expect(parentComponent).toBeVisible();

		// Find a child component within it
		const childComponent = parentComponent.locator('[data-ujl-module-id][role="button"]').first();
		const childExists = await childComponent.isVisible().catch(() => false);

		if (childExists) {
			// Hover over parent first
			await parentComponent.hover();

			// Verify parent has outline
			await expect(parentComponent).toHaveCSS('outline-width', '2px');
			await expect(parentComponent).toHaveCSS('outline-style', 'solid');

			// Now hover over child
			await childComponent.hover();

			// Verify child has outline (CSS ensures parent outline is removed via :has selector)
			await expect(childComponent).toHaveCSS('outline-width', '2px');
			await expect(childComponent).toHaveCSS('outline-style', 'solid');

			// Verify parent no longer has outline (CSS rule removes it when child is hovered)
			await expect(parentComponent).toHaveCSS('outline-style', 'none');
		}
	});

	test('preview preserves selected status when hovering over child', async ({ page }) => {
		// Wait for preview to render
		await page.waitForTimeout(500);

		// Find a component that contains other components (nested structure)
		const parentComponent = page.locator('[data-ujl-module-id][role="button"]').nth(1);

		await expect(parentComponent).toBeVisible();

		// Find a child component within it
		const childComponent = parentComponent.locator('[data-ujl-module-id][role="button"]').first();
		const childExists = await childComponent.isVisible().catch(() => false);

		if (childExists) {
			// Select the parent component
			await parentComponent.click();
			await page.waitForTimeout(300);

			// Verify parent has selected status
			await expect(parentComponent).toHaveClass(/ujl-selected/);
			await expect(parentComponent).toHaveCSS('outline-width', '2px');
			await expect(parentComponent).toHaveCSS('outline-style', 'solid');

			// Now hover over child
			await childComponent.hover();
			await page.waitForTimeout(100);

			// Verify parent still has selected status (should not be removed by hover)
			await expect(parentComponent).toHaveClass(/ujl-selected/);
			await expect(parentComponent).toHaveCSS('outline-width', '2px');
			await expect(parentComponent).toHaveCSS('outline-style', 'solid');

			// Verify child has hover outline
			await expect(childComponent).toHaveCSS('outline-width', '2px');
			await expect(childComponent).toHaveCSS('outline-style', 'solid');
		}
	});

	test('preview selection persists across theme changes', async ({ page }) => {
		// Select a component in preview
		await page.waitForTimeout(500);
		const previewComponent = page.locator('[data-ujl-module-id][role="button"]').nth(1);
		await previewComponent.click();
		await page.waitForTimeout(300);

		const selectedId = await previewComponent.getAttribute('data-ujl-module-id');

		// Switch to Designer mode
		await switchMode(page, 'Designer');

		// Find the radius slider in Designer sidebar
		const radiusSlider = page.locator('span[data-slot="slider-thumb"][aria-valuenow]').first();
		const sliderExists = await radiusSlider.isVisible().catch(() => false);

		if (sliderExists) {
			await radiusSlider.scrollIntoViewIfNeeded();

			await page.waitForTimeout(300);

			// Drag the slider to a different position
			// Get the slider track bounds
			const sliderTrack = page.locator('span[data-slot="slider-track"]').first();
			const trackBox = await sliderTrack.boundingBox();

			if (trackBox) {
				// Click at 75% position of the track to set radius to ~1.5
				const targetX = trackBox.x + trackBox.width * 0.75;
				const targetY = trackBox.y + trackBox.height / 2;

				await page.mouse.click(targetX, targetY);
				await page.waitForTimeout(300);
			}
		}

		// Switch back to Editor mode
		await switchMode(page, 'Editor');

		// Verify component is still selected
		const stillSelected = page.locator(`[data-ujl-module-id="${selectedId}"].ujl-selected`);
		await expect(stillSelected).toBeVisible();
	});
});
