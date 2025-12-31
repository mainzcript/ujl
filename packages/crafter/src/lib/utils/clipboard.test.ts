import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	serializeClipboard,
	deserializeClipboard,
	isClipboardAvailable,
	writeToBrowserClipboard,
	readFromBrowserClipboard,
	writeToClipboardEvent,
	readFromClipboardEvent,
	type UJLClipboardData
} from './clipboard.js';
import { createMockNode } from '../../tests/mockData.js';

describe('clipboard', () => {
	// Mock data
	const mockNode = createMockNode('test-node', 'text', { content: 'Test Content' });
	const mockSlot: UJLClipboardData = {
		type: 'slot',
		slotName: 'body',
		content: [mockNode]
	};

	describe('serializeClipboard', () => {
		it('should serialize node with prefix', () => {
			const serialized = serializeClipboard(mockNode);
			expect(serialized).toContain('__UJL_CLIPBOARD__:');
			expect(serialized).toContain('"type":"text"');
			expect(serialized).toContain('"text":"Test Content"');
		});

		it('should serialize slot with prefix', () => {
			const serialized = serializeClipboard(mockSlot);
			expect(serialized).toContain('__UJL_CLIPBOARD__:');
			expect(serialized).toContain('"type":"slot"');
			expect(serialized).toContain('"slotName":"body"');
		});
	});

	describe('deserializeClipboard', () => {
		it('should deserialize valid node data', () => {
			const serialized = serializeClipboard(mockNode);
			const deserialized = deserializeClipboard(serialized);

			expect(deserialized).toBeDefined();
			expect(deserialized).toHaveProperty('meta');
			expect(deserialized).toHaveProperty('type', 'text');
		});

		it('should deserialize valid slot data', () => {
			const serialized = serializeClipboard(mockSlot);
			const deserialized = deserializeClipboard(serialized);

			expect(deserialized).toBeDefined();
			expect(deserialized).toHaveProperty('type', 'slot');
			if (deserialized && !('meta' in deserialized)) {
				expect(deserialized.slotName).toBe('body');
			}
		});

		it('should return null for text without prefix', () => {
			const result = deserializeClipboard('regular text');
			expect(result).toBeNull();
		});

		it('should return null for invalid JSON', () => {
			const result = deserializeClipboard('__UJL_CLIPBOARD__:{invalid json}');
			expect(result).toBeNull();
		});

		it('should return null for data without meta or type=slot', () => {
			const result = deserializeClipboard('__UJL_CLIPBOARD__:{"foo":"bar"}');
			expect(result).toBeNull();
		});

		it('should handle empty string', () => {
			const result = deserializeClipboard('');
			expect(result).toBeNull();
		});
	});

	describe('isClipboardAvailable', () => {
		it('should return true when clipboard API is available', () => {
			// Mock navigator.clipboard
			Object.defineProperty(global, 'navigator', {
				value: {
					clipboard: {
						writeText: vi.fn()
					}
				},
				configurable: true,
				writable: true
			});

			expect(isClipboardAvailable()).toBe(true);
		});

		it('should return false when clipboard API is not available', () => {
			Object.defineProperty(global, 'navigator', {
				value: {},
				configurable: true,
				writable: true
			});
			expect(isClipboardAvailable()).toBe(false);
		});

		it('should return false when navigator is undefined', () => {
			const originalNavigator = global.navigator;
			Object.defineProperty(global, 'navigator', {
				value: undefined,
				configurable: true,
				writable: true
			});
			expect(isClipboardAvailable()).toBe(false);
			Object.defineProperty(global, 'navigator', {
				value: originalNavigator,
				configurable: true,
				writable: true
			});
		});
	});

	describe('writeToBrowserClipboard', () => {
		let mockWriteText: ReturnType<typeof vi.fn>;
		let mockLocalStorage: Record<string, string>;

		beforeEach(() => {
			mockWriteText = vi.fn().mockResolvedValue(undefined);
			mockLocalStorage = {};

			Object.defineProperty(global, 'navigator', {
				value: {
					clipboard: {
						writeText: mockWriteText
					}
				},
				configurable: true,
				writable: true
			});

			Object.defineProperty(global, 'localStorage', {
				value: {
					setItem: vi.fn((key: string, value: string) => {
						mockLocalStorage[key] = value;
					}),
					getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
					removeItem: vi.fn((key: string) => {
						delete mockLocalStorage[key];
					}),
					clear: vi.fn(),
					length: 0,
					key: vi.fn()
				},
				configurable: true,
				writable: true
			});
		});

		it('should write to both clipboard and localStorage', async () => {
			await writeToBrowserClipboard(mockNode);

			expect(mockWriteText).toHaveBeenCalledTimes(1);
			expect(mockLocalStorage['__UJL_CLIPBOARD_STORAGE__']).toBeDefined();
			expect(mockLocalStorage['__UJL_CLIPBOARD_STORAGE__']).toContain('__UJL_CLIPBOARD__:');
		});

		it('should persist to localStorage even if clipboard fails', async () => {
			mockWriteText.mockRejectedValue(new Error('Permission denied'));

			await writeToBrowserClipboard(mockNode);

			expect(mockLocalStorage['__UJL_CLIPBOARD_STORAGE__']).toBeDefined();
		});

		it('should handle missing localStorage gracefully', async () => {
			Object.defineProperty(global, 'localStorage', {
				value: undefined,
				configurable: true,
				writable: true
			});

			await expect(writeToBrowserClipboard(mockNode)).resolves.not.toThrow();
		});

		it('should handle missing clipboard API gracefully', async () => {
			Object.defineProperty(global, 'navigator', {
				value: {},
				configurable: true,
				writable: true
			});

			await expect(writeToBrowserClipboard(mockNode)).resolves.not.toThrow();
			expect(mockLocalStorage['__UJL_CLIPBOARD_STORAGE__']).toBeDefined();
		});
	});

	describe('readFromBrowserClipboard', () => {
		let mockReadText: ReturnType<typeof vi.fn>;
		let mockLocalStorage: Record<string, string>;

		beforeEach(() => {
			mockReadText = vi.fn();
			mockLocalStorage = {};

			Object.defineProperty(global, 'navigator', {
				value: {
					clipboard: {
						readText: mockReadText,
						writeText: vi.fn()
					}
				},
				configurable: true,
				writable: true
			});

			Object.defineProperty(global, 'localStorage', {
				value: {
					setItem: vi.fn((key: string, value: string) => {
						mockLocalStorage[key] = value;
					}),
					getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
					removeItem: vi.fn(),
					clear: vi.fn(),
					length: 0,
					key: vi.fn()
				},
				configurable: true,
				writable: true
			});
		});

		it('should read from clipboard API when available', async () => {
			const serialized = serializeClipboard(mockNode);
			mockReadText.mockResolvedValue(serialized);

			const result = await readFromBrowserClipboard();

			expect(result).toBeDefined();
			expect(result).toHaveProperty('meta');
			expect(mockReadText).toHaveBeenCalled();
		});

		it('should update localStorage after successful clipboard read', async () => {
			const serialized = serializeClipboard(mockNode);
			mockReadText.mockResolvedValue(serialized);

			await readFromBrowserClipboard();

			expect(mockLocalStorage['__UJL_CLIPBOARD_STORAGE__']).toBe(serialized);
		});

		it('should fallback to localStorage if clipboard read fails', async () => {
			mockReadText.mockRejectedValue(new Error('Permission denied'));
			mockLocalStorage['__UJL_CLIPBOARD_STORAGE__'] = serializeClipboard(mockNode);

			const result = await readFromBrowserClipboard();

			expect(result).toBeDefined();
			expect(result).toHaveProperty('meta');
		});

		it('should return null if both clipboard and localStorage fail', async () => {
			mockReadText.mockRejectedValue(new Error('Permission denied'));

			const result = await readFromBrowserClipboard();

			expect(result).toBeNull();
		});

		it('should return null for non-UJL data in clipboard', async () => {
			mockReadText.mockResolvedValue('regular text');

			const result = await readFromBrowserClipboard();

			expect(result).toBeNull();
		});

		it('should handle missing clipboard API gracefully', async () => {
			Object.defineProperty(global, 'navigator', {
				value: {},
				configurable: true,
				writable: true
			});
			mockLocalStorage['__UJL_CLIPBOARD_STORAGE__'] = serializeClipboard(mockNode);

			const result = await readFromBrowserClipboard();

			expect(result).toBeDefined();
			expect(result).toHaveProperty('meta');
		});

		it('should handle missing localStorage gracefully', async () => {
			Object.defineProperty(global, 'localStorage', {
				value: undefined,
				configurable: true,
				writable: true
			});
			mockReadText.mockResolvedValue(serializeClipboard(mockNode));

			const result = await readFromBrowserClipboard();

			expect(result).toBeDefined();
		});
	});

	describe('writeToClipboardEvent', () => {
		it('should write data to clipboardData', () => {
			const mockSetData = vi.fn();
			const mockEvent = {
				clipboardData: {
					setData: mockSetData
				},
				preventDefault: vi.fn()
			} as unknown as ClipboardEvent;

			writeToClipboardEvent(mockEvent, mockNode);

			expect(mockEvent.preventDefault).toHaveBeenCalled();
			expect(mockSetData).toHaveBeenCalledWith(
				'text/plain',
				expect.stringContaining('__UJL_CLIPBOARD__:')
			);
		});

		it('should handle missing clipboardData', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const mockEvent = {
				preventDefault: vi.fn()
			} as unknown as ClipboardEvent;

			expect(() => writeToClipboardEvent(mockEvent, mockNode)).not.toThrow();
			expect(consoleSpy).toHaveBeenCalledWith('[Crafter] ClipboardEvent has no clipboardData');

			consoleSpy.mockRestore();
		});

		it('should serialize slot data correctly', () => {
			const mockSetData = vi.fn();
			const mockEvent = {
				clipboardData: {
					setData: mockSetData
				},
				preventDefault: vi.fn()
			} as unknown as ClipboardEvent;

			writeToClipboardEvent(mockEvent, mockSlot);

			expect(mockSetData).toHaveBeenCalledWith(
				'text/plain',
				expect.stringContaining('"type":"slot"')
			);
		});
	});

	describe('readFromClipboardEvent', () => {
		it('should read and deserialize valid UJL data', () => {
			const serialized = serializeClipboard(mockNode);
			const mockGetData = vi.fn().mockReturnValue(serialized);
			const mockEvent = {
				clipboardData: {
					getData: mockGetData
				}
			} as unknown as ClipboardEvent;

			const result = readFromClipboardEvent(mockEvent);

			expect(result).toBeDefined();
			expect(result).toHaveProperty('meta');
			expect(mockGetData).toHaveBeenCalledWith('text/plain');
		});

		it('should return null for non-UJL data', () => {
			const mockGetData = vi.fn().mockReturnValue('regular text');
			const mockEvent = {
				clipboardData: {
					getData: mockGetData
				}
			} as unknown as ClipboardEvent;

			const result = readFromClipboardEvent(mockEvent);

			expect(result).toBeNull();
		});

		it('should return null when clipboardData is missing', () => {
			const mockEvent = {} as ClipboardEvent;

			const result = readFromClipboardEvent(mockEvent);

			expect(result).toBeNull();
		});

		it('should return null for empty clipboard data', () => {
			const mockGetData = vi.fn().mockReturnValue('');
			const mockEvent = {
				clipboardData: {
					getData: mockGetData
				}
			} as unknown as ClipboardEvent;

			const result = readFromClipboardEvent(mockEvent);

			expect(result).toBeNull();
		});

		it('should deserialize slot data correctly', () => {
			const serialized = serializeClipboard(mockSlot);
			const mockGetData = vi.fn().mockReturnValue(serialized);
			const mockEvent = {
				clipboardData: {
					getData: mockGetData
				}
			} as unknown as ClipboardEvent;

			const result = readFromClipboardEvent(mockEvent);

			expect(result).toBeDefined();
			expect(result).toHaveProperty('type', 'slot');
			if (result && !('meta' in result)) {
				expect(result.slotName).toBe('body');
			}
		});
	});

	describe('Integration: serialize/deserialize roundtrip', () => {
		it('should preserve node data through roundtrip', () => {
			const serialized = serializeClipboard(mockNode);
			const deserialized = deserializeClipboard(serialized);

			expect(deserialized).toEqual(mockNode);
		});

		it('should preserve slot data through roundtrip', () => {
			const serialized = serializeClipboard(mockSlot);
			const deserialized = deserializeClipboard(serialized);

			expect(deserialized).toEqual(mockSlot);
		});

		it('should preserve complex nested structures', () => {
			const complexNode = createMockNode(
				'complex',
				'container',
				{ title: 'Complex' },
				{
					body: [createMockNode('child1', 'text', { content: 'Child 1' })],
					footer: [createMockNode('child2', 'button', { label: 'Click' })]
				}
			);

			const serialized = serializeClipboard(complexNode);
			const deserialized = deserializeClipboard(serialized);

			expect(deserialized).toEqual(complexNode);
		});
	});
});
