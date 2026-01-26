/**
 * Utility functions for working with AST nodes
 */

import type { UJLAbstractNode } from '@ujl-framework/types';

/**
 * Get the module ID from an AST node
 * @param node - The AST node to check
 * @returns The module ID if the node belongs to a module, null otherwise
 */
export function getModuleId(node: UJLAbstractNode): string | null {
	return node.meta?.moduleId ?? null;
}
