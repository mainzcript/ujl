/**
 * UJL AST node type constants
 *
 * Central definition of all valid node type strings.
 * Use these constants instead of magic strings to ensure type safety
 * and enable refactoring.
 */
export const NODE_TYPES = {
	CONTAINER: 'container',
	WRAPPER: 'wrapper',
	RAW_HTML: 'raw-html',
	ERROR: 'error',
	TEXT: 'text',
	BUTTON: 'button',
	CARD: 'card',
	GRID: 'grid',
	GRID_ITEM: 'grid-item',
	CALL_TO_ACTION: 'call-to-action',
	IMAGE: 'image'
} as const;

/**
 * Type helper for node type values
 */
export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];
