import type { UJLCModuleObject, UJLCSlotObject, UJLTTokenSet } from '@ujl-framework/types';
/**
 * Mock node factory
 */
export declare function createMockNode(id: string, type?: string, fields?: Record<string, unknown>, slots?: Record<string, UJLCModuleObject[]>): UJLCModuleObject;
/**
 * Mock tree with nested structure
 */
export declare function createMockTree(): UJLCSlotObject;
/**
 * Mock tree with multiple slots
 */
export declare function createMockMultiSlotTree(): UJLCSlotObject;
/**
 * Mock token set
 */
export declare function createMockTokenSet(): UJLTTokenSet;
