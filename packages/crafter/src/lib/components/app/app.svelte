<script lang="ts">
	import { SidebarProvider, SidebarInset } from '@ujl-framework/ui';
	import { setContext } from 'svelte';
	import type {
		UJLCDocument,
		UJLTDocument,
		UJLTTokenSet,
		UJLCSlotObject
	} from '@ujl-framework/types';
	import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };
	import {
		CRAFTER_CONTEXT,
		createOperations,
		findPathToNode,
		type CrafterContext
	} from './context.js';
	import { downloadJsonFile, readJsonFile } from '$lib/tools/files.ts';
	import { logger } from '$lib/utils/logger.js';

	import SidebarLeft from './sidebar-left/sidebar-left.svelte';
	import SidebarRight from './sidebar-right/sidebar-right.svelte';
	import Header from './header/header.svelte';
	import Body from './body/preview.svelte';
	import { type CrafterMode } from './types.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	/**
	 * Single Source of Truth: Load and validate documents
	 *
	 * Both validation functions throw ZodError if validation fails.
	 * This ensures only valid documents are used in the application.
	 */
	let ujlcDocument = $state<UJLCDocument>(
		validateUJLCDocument(showcaseDocument as unknown as UJLCDocument)
	);
	let ujltDocument = $state<UJLTDocument>(
		validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
	);

	/**
	 * Global mode state for the Crafter.
	 * Controls whether the sidebar displays the Editor (UJLC) or Designer (UJLT) view.
	 * This state is owned by app.svelte and passed down to SidebarLeft as a controlled prop.
	 */
	let mode = $state<CrafterMode>('editor');

	/**
	 * Handler for mode changes from the sidebar.
	 * Updates the global mode state when the user switches between Editor and Designer.
	 *
	 * @param newMode - The new mode to switch to
	 */
	function handleModeChange(newMode: CrafterMode) {
		mode = newMode;
	}

	/**
	 * Expanded node IDs in the navigation tree
	 * This controls which nodes show their children in the tree view
	 */
	let expandedNodeIds = $state<Set<string>>(new Set());

	/**
	 * Toggle a node's expanded state
	 */
	function setNodeExpanded(nodeId: string, expanded: boolean) {
		if (expanded) {
			expandedNodeIds = new Set([...expandedNodeIds, nodeId]);
		} else {
			/* eslint-disable svelte/prefer-svelte-reactivity */
			const newSet = new Set(expandedNodeIds);
			newSet.delete(nodeId);
			expandedNodeIds = newSet;
		}
	}

	/**
	 * Expand all parent nodes to make a target node visible
	 * This is called when clicking a component in the preview
	 */
	function expandToNode(nodeId: string) {
		// Find the path from root to the target node
		const path = findPathToNode(ujlcDocument.ujlc.root, nodeId);

		if (!path) {
			logger.warn('Could not find path to node:', nodeId);
			return;
		}

		// Create new Set with all existing + new parent IDs
		expandedNodeIds = new Set([...expandedNodeIds, ...path]);
	}

	/**
	 * Updates the theme document (ujlt) by applying a functional updater to the token set.
	 * This is the only mutation entrypoint for theme tokens and ensures immutable updates.
	 *
	 * @param fn - Function that receives the current token set and returns a new one
	 *              Must return a new object, not mutate the input
	 *
	 * This method is designed to be wrapped for future features like undo/redo history.
	 */
	function updateTokenSet(fn: (t: UJLTTokenSet) => UJLTTokenSet) {
		const newTokenSet = fn(ujltDocument.ujlt.tokens);
		ujltDocument = {
			...ujltDocument,
			ujlt: {
				...ujltDocument.ujlt,
				tokens: newTokenSet
			}
		};
	}

	/**
	 * Updates the content document (ujlc) by applying a functional updater to the root slot.
	 * This is the only mutation entrypoint for content structure and ensures immutable updates.
	 *
	 * @param fn - Function that receives the current root slot and returns a new one
	 *              Must return a new object, not mutate the input
	 *
	 * This method is designed to be wrapped for future features like undo/redo history.
	 */
	function updateRootSlot(fn: (s: UJLCSlotObject) => UJLCSlotObject) {
		const currentSlot = ujlcDocument.ujlc.root;
		const newSlot = fn(currentSlot);
		ujlcDocument = {
			...ujlcDocument,
			ujlc: {
				...ujlcDocument.ujlc,
				root: newSlot
			}
		};
	}

	/**
	 * Set the currently selected node ID
	 * Updates the URL with ?selected=nodeId query parameter
	 */
	function setSelectedNodeId(nodeId: string | null): void {
		const url = new URL($page.url);

		if (nodeId) {
			url.searchParams.set('selected', nodeId);
		} else {
			url.searchParams.delete('selected');
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, {
			replaceState: true, // Don't add to browser history
			noScroll: true, // Don't scroll to top
			keepFocus: true // Keep focus on current element
		});
	}

	/**
	 * Exports the current theme document (ujlt) as a .ujlt.json file.
	 * Uses the current state of ujltDocument from the single source of truth.
	 */
	function handleExportTheme() {
		downloadJsonFile(ujltDocument, 'theme.ujlt.json');
	}

	/**
	 * Exports the current content document (ujlc) as a .ujlc.json file.
	 * Uses the current state of ujlcDocument from the single source of truth.
	 */
	function handleExportContent() {
		downloadJsonFile(ujlcDocument, 'content.ujlc.json');
	}

	/**
	 * Imports a theme document (ujlt) from a .ujlt.json file.
	 * Validates the imported document and updates the state if valid.
	 *
	 * @param file - The File object containing the .ujlt.json content
	 */
	async function handleImportTheme(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			alert('Failed to read or parse the theme file.');
			return;
		}

		try {
			const validatedDocument = validateUJLTDocument(data as unknown as UJLTDocument);
			ujltDocument = validatedDocument;
		} catch (error) {
			logger.error('Theme validation failed:', error);
			alert('The imported theme file is invalid. Please check the file format.');
		}
	}

	/**
	 * Imports a content document (ujlc) from a .ujlc.json file.
	 * Validates the imported document and updates the state if valid.
	 *
	 * @param file - The File object containing the .ujlc.json content
	 */
	async function handleImportContent(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			alert('Failed to read or parse the content file.');
			return;
		}

		try {
			const validatedDocument = validateUJLCDocument(data as unknown as UJLCDocument);
			ujlcDocument = validatedDocument;
		} catch (error) {
			logger.error('Content validation failed:', error);
			alert('The imported content file is invalid. Please check the file format.');
		}
	}

	// Create operations using the factory function
	const operations = createOperations(() => ujlcDocument.ujlc.root, updateRootSlot);

	// Provide context API to child components
	const crafterContext: CrafterContext = {
		updateTokenSet,
		updateRootSlot,
		getRootSlot: () => ujlcDocument.ujlc.root,
		setSelectedNodeId,
		getExpandedNodeIds: () => expandedNodeIds,
		setNodeExpanded,
		expandToNode,
		operations
	};

	setContext(CRAFTER_CONTEXT, crafterContext);
</script>

<SidebarProvider>
	<SidebarLeft
		{mode}
		onModeChange={handleModeChange}
		tokenSet={ujltDocument.ujlt.tokens}
		contentSlot={ujlcDocument.ujlc.root}
	/>
	<SidebarInset>
		<Header />
		<Body {ujlcDocument} {ujltDocument} />
	</SidebarInset>
	<SidebarRight
		onExportTheme={handleExportTheme}
		onExportContent={handleExportContent}
		onImportTheme={handleImportTheme}
		onImportContent={handleImportContent}
	/>
</SidebarProvider>
