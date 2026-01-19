/**
 * E2E Test Utilities for UJL Crafter
 *
 * Provides reusable Page Objects and helper functions for Playwright tests.
 */

import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Crafter editor.
 * Encapsulates common selectors and operations.
 */
export class CrafterPage {
	readonly page: Page;

	// Main layout areas
	readonly crafterElement: Locator;
	readonly sidebar: Locator;
	readonly canvas: Locator;
	readonly panel: Locator;

	// Navigation tree
	readonly navTree: Locator;
	readonly navTreeHeader: Locator;

	// Header elements
	readonly header: Locator;
	readonly modeSelector: Locator;
	readonly viewportToggles: Locator;
	readonly saveButton: Locator;
	readonly menuButton: Locator;

	// Component Picker
	readonly componentPicker: Locator;
	readonly componentPickerSearch: Locator;

	constructor(page: Page) {
		this.page = page;

		// Shadow DOM root - all elements inside the Crafter are in Shadow DOM
		const shadowHost = page.locator('ujl-crafter-internal');

		// Main layout - routed through Shadow DOM
		this.crafterElement = shadowHost;
		this.sidebar = shadowHost.locator('[data-slot="app-sidebar"]');
		this.canvas = shadowHost.locator('[data-ujl-scroll-container="canvas"]');
		this.panel = shadowHost.locator('[data-slot="app-panel"]');

		// Navigation tree
		this.navTree = shadowHost.locator('[data-crafter="nav-tree"]');
		// Use first() to avoid strict mode violation (Document appears twice)
		this.navTreeHeader = this.navTree.locator('> div').first();

		// Header (in app-provider, uses <header> element)
		this.header = shadowHost.locator('header');
		this.modeSelector = shadowHost.locator('[data-crafter="mode-selector"]');
		this.viewportToggles = shadowHost.locator('[data-crafter="viewport-toggles"]');
		this.saveButton = shadowHost.getByRole('button', { name: 'Save' });
		this.menuButton = shadowHost.getByTitle('More Actions');

		// Component Picker (Dialog - in portal inside Shadow DOM)
		this.componentPicker = shadowHost.locator('[data-crafter="component-picker"]');
		this.componentPickerSearch = this.componentPicker.getByPlaceholder('Search');
	}

	/**
	 * Navigate to the Crafter and wait for it to be ready.
	 */
	async goto() {
		await this.page.goto('/');
		await this.waitForReady();
	}

	/**
	 * Wait for the Crafter to be fully loaded and ready.
	 */
	async waitForReady() {
		await expect(this.crafterElement).toBeVisible();
		// Wait for the nav tree to be visible (indicates content is loaded)
		await expect(this.navTree).toBeVisible({ timeout: 10000 });
	}

	/**
	 * Get a tree node by its node ID.
	 */
	getTreeNode(nodeId: string): Locator {
		return this.crafterElement.locator(`[data-tree-node-id="${nodeId}"]`);
	}

	/**
	 * Get a module element in the preview by its module ID.
	 */
	getPreviewModule(moduleId: string): Locator {
		return this.crafterElement.locator(`[data-ujl-module-id="${moduleId}"]`);
	}

	/**
	 * Get the currently selected module in the preview.
	 */
	getSelectedPreviewModule(): Locator {
		return this.crafterElement.locator('[data-ujl-module-id].ujl-selected');
	}

	/**
	 * Select a node by clicking in the tree.
	 * Clicks directly on the tree node element to trigger selection.
	 */
	async selectNodeInTree(nodeId: string) {
		const node = this.getTreeNode(nodeId);
		// Click directly on the node - the onclick handler on the element will trigger selection
		// This works for both nodes with and without children
		await node.click();
		// Wait for selection state to update (including async ujl-selected class)
		await this.page.waitForTimeout(500);
	}

	/**
	 * Select a module by clicking in the preview.
	 * Note: Only modules with isModuleRoot=true in the AST can be selected.
	 */
	async selectModuleInPreview(moduleId: string) {
		const module = this.getPreviewModule(moduleId);
		await module.click();
		// Wait for selection state to update (async DOM operations)
		await this.page.waitForTimeout(500);
	}

	/**
	 * Expand a tree node by clicking its chevron.
	 */
	async expandTreeNode(nodeId: string) {
		const node = this.getTreeNode(nodeId);
		const chevron = node.locator('[data-crafter="tree-chevron"]');
		await chevron.click();
	}

	/**
	 * Wait for a tree node to be expanded (children visible).
	 */
	async waitForNodeExpanded(nodeId: string) {
		const node = this.getTreeNode(nodeId);
		await expect(node.locator('[data-expanded="true"]')).toBeVisible();
	}

	/**
	 * Switch between Editor and Designer mode.
	 */
	async setMode(mode: 'editor' | 'designer') {
		await this.modeSelector.click();
		await this.page.getByRole('option', { name: mode, exact: false }).click();
	}

	/**
	 * Get the current mode (editor or designer).
	 */
	async getMode(): Promise<string> {
		const modeText = await this.modeSelector.textContent();
		return modeText?.toLowerCase().includes('designer') ? 'designer' : 'editor';
	}

	/**
	 * Open the component picker dialog.
	 */
	async openComponentPicker() {
		await this.page.keyboard.press('Control+i');
		await expect(this.componentPicker).toBeVisible();
	}

	/**
	 * Search and select a component in the component picker.
	 */
	async insertComponent(componentName: string) {
		await this.openComponentPicker();
		await this.componentPickerSearch.fill(componentName);
		// CommandItem renders as role="option", not button
		await this.page.getByRole('option', { name: componentName, exact: false }).first().click();
	}

	/**
	 * Copy the currently selected node.
	 */
	async copySelectedNode() {
		await this.page.keyboard.press('Control+c');
	}

	/**
	 * Cut the currently selected node.
	 */
	async cutSelectedNode() {
		await this.page.keyboard.press('Control+x');
	}

	/**
	 * Paste from clipboard.
	 */
	async pasteNode() {
		await this.page.keyboard.press('Control+v');
	}

	/**
	 * Delete the currently selected node.
	 */
	async deleteSelectedNode() {
		await this.page.keyboard.press('Delete');
	}

	/**
	 * Press Escape to deselect.
	 */
	async deselect() {
		await this.page.keyboard.press('Escape');
	}

	/**
	 * Set viewport simulation (desktop, tablet, mobile, or null for responsive).
	 */
	async setViewport(type: 'desktop' | 'tablet' | 'mobile' | null) {
		if (type === null) {
			// Click active toggle to deselect
			const activeToggle = this.viewportToggles.locator('[data-state="on"]');
			if (await activeToggle.isVisible()) {
				await activeToggle.click();
			}
		} else {
			await this.viewportToggles.getByTitle(new RegExp(type, 'i')).click();
		}
	}

	/**
	 * Export content document.
	 */
	async exportContent() {
		await this.menuButton.click();
		await this.page.getByRole('menuitem', { name: 'Export Content' }).click();
	}

	/**
	 * Export theme document.
	 */
	async exportTheme() {
		await this.menuButton.click();
		await this.page.getByRole('menuitem', { name: 'Export Theme' }).click();
	}

	/**
	 * Get all visible tree node IDs.
	 * Excludes virtual nodes like __root__ which are not user-selectable.
	 */
	async getVisibleTreeNodeIds(): Promise<string[]> {
		const nodes = this.crafterElement.locator('[data-tree-node-id]');
		const ids = await nodes.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute('data-tree-node-id') ?? '')
		);
		// Filter out empty IDs and virtual nodes (starting with __)
		return ids.filter((id) => id !== '' && !id.startsWith('__'));
	}

	/**
	 * Get all module IDs in the preview.
	 */
	async getPreviewModuleIds(): Promise<string[]> {
		const modules = this.crafterElement.locator('[data-ujl-module-id]');
		const ids = await modules.evaluateAll((elements) =>
			elements.map((el) => el.getAttribute('data-ujl-module-id') ?? '')
		);
		return ids.filter((id) => id !== '');
	}

	/**
	 * Get IDs of modules that are selectable/editable in the preview.
	 * Only modules with isModuleRoot=true in the AST are selectable.
	 * These correspond to tree nodes that have the same ID.
	 */
	async getSelectableModuleIds(): Promise<string[]> {
		// Get tree node IDs (which represent selectable modules)
		const treeNodeIds = await this.getVisibleTreeNodeIds();
		// Get all preview module IDs
		const moduleIds = await this.getPreviewModuleIds();
		// Return intersection - modules that are both in tree and preview
		return moduleIds.filter((id) => treeNodeIds.includes(id));
	}

	/**
	 * Get the first selectable module ID.
	 * Useful for tests that need a guaranteed selectable module.
	 * Prefers the second element as the first is often a container that
	 * propagates clicks to children.
	 */
	async getFirstSelectableModuleId(): Promise<string | null> {
		const treeNodeIds = await this.getVisibleTreeNodeIds();
		// Prefer second element (first is often a container)
		if (treeNodeIds.length >= 2) {
			return treeNodeIds[1];
		}
		return treeNodeIds.length > 0 ? treeNodeIds[0] : null;
	}

	/**
	 * Check if the properties panel shows "No module selected".
	 */
	async isNoModuleSelectedVisible(): Promise<boolean> {
		// Panel must be visible first
		if (!(await this.panel.isVisible())) return false;
		return this.panel.getByText('No module selected').isVisible();
	}

	/**
	 * Get a field input in the properties panel by field name.
	 */
	getFieldInput(fieldName: string): Locator {
		return this.panel.locator(`[data-field-name="${fieldName}"]`);
	}

	/**
	 * Update a text field in the properties panel.
	 */
	async updateTextField(fieldName: string, value: string) {
		const input = this.getFieldInput(fieldName).locator('input, textarea').first();
		await input.fill(value);
	}

	/**
	 * Wait for animation to complete (e.g., tree expansion).
	 */
	async waitForAnimation(ms = 350) {
		await this.page.waitForTimeout(ms);
	}
}

/**
 * Test fixture that provides a CrafterPage instance.
 * Use in test files with:
 *
 * ```typescript
 * import { test, expect } from '@playwright/test';
 * import { CrafterPage } from './fixtures/test-utils';
 *
 * test('example', async ({ page }) => {
 *   const crafter = new CrafterPage(page);
 *   await crafter.goto();
 *   // ...
 * });
 * ```
 */
export function createCrafterPage(page: Page): CrafterPage {
	return new CrafterPage(page);
}
