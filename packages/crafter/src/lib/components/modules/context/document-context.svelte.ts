import { getContext, setContext } from 'svelte';
import type { UJLCDocument, UJLCModuleObject } from '@ujl-framework/types';
import { SvelteDate } from 'svelte/reactivity';

const DOCUMENT_CONTEXT_KEY = Symbol('document-context');

/**
 * Document context for managing UJLC document state
 */
export class DocumentContext {
	document = $state<UJLCDocument>() as UJLCDocument;
	clipboard = $state<UJLCModuleObject | null>(null);

	constructor(initialDocument: UJLCDocument) {
		this.document = initialDocument;
	}

	/**
	 * Get the root nodes of the document
	 */
	get root(): UJLCModuleObject[] {
		return this.document.ujlc.root;
	}

	/**
	 * Set the root nodes of the document
	 */
	set root(nodes: UJLCModuleObject[]) {
		this.document = {
			...this.document,
			ujlc: {
				...this.document.ujlc,
				root: nodes
			}
		};
	}

	/**
	 * Update the entire document
	 */
	setDocument(doc: UJLCDocument) {
		this.document = doc;
	}

	/**
	 * Update document metadata
	 */
	updateMeta(updates: Partial<typeof this.document.ujlc.meta>) {
		this.document = {
			...this.document,
			ujlc: {
				...this.document.ujlc,
				meta: {
					...this.document.ujlc.meta,
					...updates,
					updated_at: new SvelteDate().toISOString()
				}
			}
		};
	}

	/**
	 * Cut a node to clipboard
	 */
	cutNode(node: UJLCModuleObject) {
		this.clipboard = node;
	}

	/**
	 * Clear clipboard
	 */
	clearClipboard() {
		this.clipboard = null;
	}

	/**
	 * Check if clipboard has content
	 */
	get hasClipboard(): boolean {
		return this.clipboard !== null;
	}

	/**
	 * Get clipboard content
	 */
	getClipboard(): UJLCModuleObject | null {
		return this.clipboard;
	}

	/**
	 * Export document as JSON string
	 */
	toJSON(): string {
		return JSON.stringify(this.document, null, 2);
	}

	/**
	 * Load document from JSON string
	 */
	fromJSON(json: string): boolean {
		try {
			const parsed = JSON.parse(json);
			this.document = parsed as UJLCDocument;
			return true;
		} catch (error) {
			console.error('Failed to parse document JSON:', error);
			return false;
		}
	}
}

/**
 * Set the document context (call this in parent component)
 */
export function setDocumentContext(initialDocument: UJLCDocument): DocumentContext {
	const context = new DocumentContext(initialDocument);
	setContext(DOCUMENT_CONTEXT_KEY, context);
	return context;
}

/**
 * Get the document context (call this in child components)
 */
export function getDocumentContext(): DocumentContext {
	const context = getContext<DocumentContext>(DOCUMENT_CONTEXT_KEY);

	if (!context) {
		throw new Error(
			'Document context not found. Make sure to call setDocumentContext() in a parent component.'
		);
	}

	return context;
}
