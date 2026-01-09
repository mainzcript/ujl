import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UJLTTokenSet, UJLTTypographyBase, UJLTTypographyHeading } from '@ujl-framework/types';
import { createMockTokenSet } from '../../../../../tests/mockData.js';
import type { CrafterContext } from '../../context.js';

/**
 * Test helper: Creates update functions that match the pattern in designer.svelte
 * These functions test the update logic without requiring Svelte component rendering
 */
function createUpdateFunctions(mockContext: CrafterContext) {
	return {
		updateBaseTypography: (updates: Partial<UJLTTypographyBase>) => {
			mockContext.updateTokenSet((oldTokens) => ({
				...oldTokens,
				typography: {
					...oldTokens.typography,
					base: {
						...oldTokens.typography.base,
						...updates
					}
				}
			}));
		},

		updateHeadingTypography: (updates: Partial<UJLTTypographyHeading>) => {
			mockContext.updateTokenSet((oldTokens) => ({
				...oldTokens,
				typography: {
					...oldTokens.typography,
					heading: {
						...oldTokens.typography.heading,
						...updates
					}
				}
			}));
		},

		updateSpacingToken: (value: number) => {
			mockContext.updateTokenSet((oldTokens) => ({
				...oldTokens,
				spacing: value
			}));
		},

		updateRadiusToken: (value: number) => {
			mockContext.updateTokenSet((oldTokens) => ({
				...oldTokens,
				radius: value
			}));
		}
	};
}

describe('designer update functions', () => {
	let mockUpdateTokenSet: ReturnType<typeof vi.fn>;
	let mockContext: CrafterContext;
	let updateFunctions: ReturnType<typeof createUpdateFunctions>;
	let initialTokens: UJLTTokenSet;

	beforeEach(() => {
		initialTokens = createMockTokenSet();
		mockUpdateTokenSet = vi.fn((fn) => {
			initialTokens = fn(initialTokens);
		});

		mockContext = {
			isMediaLibraryViewActive: vi.fn(() => false),
			setMediaLibraryViewActive: vi.fn(),
			getMediaLibraryContext: vi.fn(() => null),
			getMediaService: vi.fn(() => ({
				checkConnection: vi.fn(),
				upload: vi.fn(),
				get: vi.fn(),
				list: vi.fn(),
				delete: vi.fn()
			})),
			getMeta: vi.fn(() => ({
				title: 'Test Document',
				description: 'Test Description',
				tags: [],
				updated_at: new Date().toISOString(),
				_version: '1.0.0',
				_instance: 'test-instance',
				_embedding_model_hash: 'test-hash',
				media_library: {
					storage: 'inline' as const
				}
			})),
			updateTokenSet: mockUpdateTokenSet,
			updateRootSlot: vi.fn(),
			updateMedia: vi.fn(),
			getMedia: vi.fn(() => ({})),
			getRootSlot: vi.fn(() => []),
			setSelectedNodeId: vi.fn(),
			getExpandedNodeIds: vi.fn(() => new Set()),
			setNodeExpanded: vi.fn(),
			expandToNode: vi.fn(),
			operations: {
				copyNode: vi.fn(),
				moveNode: vi.fn(),
				reorderNode: vi.fn(),
				deleteNode: vi.fn(),
				cutNode: vi.fn(),
				pasteNode: vi.fn(),
				insertNode: vi.fn(),
				copySlot: vi.fn(),
				cutSlot: vi.fn(),
				pasteSlot: vi.fn(),
				moveSlot: vi.fn(),
				updateNodeField: vi.fn(),
				updateNodeFields: vi.fn()
			}
		} as CrafterContext;

		updateFunctions = createUpdateFunctions(mockContext);
	});

	describe('updateBaseTypography', () => {
		it('should merge partial updates into base typography', () => {
			updateFunctions.updateBaseTypography({ font: 'Roboto Variable' });

			expect(mockUpdateTokenSet).toHaveBeenCalledTimes(1);
			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.base.font).toBe('Roboto Variable');
		});

		it('should preserve existing base typography fields', () => {
			const originalSize = initialTokens.typography.base.size;
			const originalWeight = initialTokens.typography.base.weight;

			updateFunctions.updateBaseTypography({ font: 'Open Sans Variable' });

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.base.font).toBe('Open Sans Variable');
			expect(updatedTokens.typography.base.size).toBe(originalSize);
			expect(updatedTokens.typography.base.weight).toBe(originalWeight);
		});

		it('should update font correctly', () => {
			updateFunctions.updateBaseTypography({ font: 'Montserrat Variable' });

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.base.font).toBe('Montserrat Variable');
		});

		it('should update size correctly', () => {
			updateFunctions.updateBaseTypography({ size: 1.2 });

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.base.size).toBe(1.2);
		});

		it('should update multiple fields at once', () => {
			updateFunctions.updateBaseTypography({
				font: 'Raleway Variable',
				size: 1.1,
				weight: 500
			});

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.base.font).toBe('Raleway Variable');
			expect(updatedTokens.typography.base.size).toBe(1.1);
			expect(updatedTokens.typography.base.weight).toBe(500);
		});
	});

	describe('updateHeadingTypography', () => {
		it('should merge partial updates into heading typography', () => {
			updateFunctions.updateHeadingTypography({ font: 'Oswald Variable' });

			expect(mockUpdateTokenSet).toHaveBeenCalledTimes(1);
			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.heading.font).toBe('Oswald Variable');
		});

		it('should preserve existing heading typography fields', () => {
			const originalSize = initialTokens.typography.heading.size;
			const originalWeight = initialTokens.typography.heading.weight;
			const originalFlavor = initialTokens.typography.heading.flavor;

			updateFunctions.updateHeadingTypography({ font: 'Merriweather Variable' });

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.heading.font).toBe('Merriweather Variable');
			expect(updatedTokens.typography.heading.size).toBe(originalSize);
			expect(updatedTokens.typography.heading.weight).toBe(originalWeight);
			expect(updatedTokens.typography.heading.flavor).toBe(originalFlavor);
		});

		it('should update flavor correctly', () => {
			updateFunctions.updateHeadingTypography({ flavor: 'primary' });

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.typography.heading.flavor).toBe('primary');
		});
	});

	describe('updateSpacingToken', () => {
		it('should update spacing value', () => {
			updateFunctions.updateSpacingToken(0.3);

			expect(mockUpdateTokenSet).toHaveBeenCalledTimes(1);
			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.spacing).toBe(0.3);
		});

		it('should preserve other tokens', () => {
			const originalRadius = initialTokens.radius;
			const originalBaseFont = initialTokens.typography.base.font;

			updateFunctions.updateSpacingToken(0.5);

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.spacing).toBe(0.5);
			expect(updatedTokens.radius).toBe(originalRadius);
			expect(updatedTokens.typography.base.font).toBe(originalBaseFont);
		});

		it('should handle zero spacing', () => {
			updateFunctions.updateSpacingToken(0);

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.spacing).toBe(0);
		});
	});

	describe('updateRadiusToken', () => {
		it('should update radius value', () => {
			updateFunctions.updateRadiusToken(1.0);

			expect(mockUpdateTokenSet).toHaveBeenCalledTimes(1);
			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.radius).toBe(1.0);
		});

		it('should preserve other tokens', () => {
			const originalSpacing = initialTokens.spacing;
			const originalBaseFont = initialTokens.typography.base.font;

			updateFunctions.updateRadiusToken(0.5);

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.radius).toBe(0.5);
			expect(updatedTokens.spacing).toBe(originalSpacing);
			expect(updatedTokens.typography.base.font).toBe(originalBaseFont);
		});

		it('should handle zero radius', () => {
			updateFunctions.updateRadiusToken(0);

			const updateFn = mockUpdateTokenSet.mock.calls[0][0];
			const updatedTokens = updateFn(initialTokens);

			expect(updatedTokens.radius).toBe(0);
		});
	});
});
