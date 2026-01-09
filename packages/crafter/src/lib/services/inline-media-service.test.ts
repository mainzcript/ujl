import { describe, expect, it, beforeEach, vi } from 'vitest';
import { InlineMediaService } from './inline-media-service.js';
import type { MediaMetadata, UJLCMediaLibrary } from '@ujl-framework/types';

// Mock the image compression utility
vi.mock('$lib/utils/image-compression.js', () => ({
	compressImage: vi.fn((file: File) => Promise.resolve(file))
}));

// Mock nanoid for predictable ID generation
vi.mock('@ujl-framework/core', () => ({
	generateUid: vi.fn(() => 'mock-id-123')
}));

describe('InlineMediaService', () => {
	let mockMedia: UJLCMediaLibrary;
	let getMedia: () => UJLCMediaLibrary;
	let updateMedia: (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void;
	let service: InlineMediaService;

	beforeEach(() => {
		// Reset mock media
		mockMedia = {};

		// Create getter function
		getMedia = vi.fn(() => mockMedia);

		// Create updater function that modifies mockMedia
		updateMedia = vi.fn((fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => {
			mockMedia = fn(mockMedia);
		});

		// Create service instance
		service = new InlineMediaService(getMedia, updateMedia);
	});

	describe('Constructor', () => {
		it('should create an instance with provided functions', () => {
			expect(service).toBeInstanceOf(InlineMediaService);
		});
	});

	describe('checkConnection', () => {
		it('should always return connected: true for inline storage', async () => {
			const result = await service.checkConnection();

			expect(result).toEqual({ connected: true });
		});

		it('should not have an error property when connected', async () => {
			const result = await service.checkConnection();

			expect(result.error).toBeUndefined();
		});
	});

	describe('upload', () => {
		let mockFile: File;
		let mockMetadata: MediaMetadata;

		beforeEach(() => {
			// Create a mock file
			mockFile = new File(['test content'], 'test.png', { type: 'image/png' });

			mockMetadata = {
				filename: 'test.png',
				filesize: 12,
				mimeType: 'image/png',
				width: 100,
				height: 100
			};

			// Mock FileReader class
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = 'data:image/png;base64,mock-base64-data';

				readAsDataURL() {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;
		});

		it('should upload and compress an image', async () => {
			const result = await service.upload(mockFile, mockMetadata);

			expect(result).toHaveProperty('mediaId');
			expect(result).toHaveProperty('entry');
			expect(result.mediaId).toBe('mock-id-123');
		});

		it('should convert file to Base64 data URL', async () => {
			const result = await service.upload(mockFile, mockMetadata);

			expect(result.entry.dataUrl).toBe('data:image/png;base64,mock-base64-data');
		});

		it('should store entry in media library via updateMedia', async () => {
			await service.upload(mockFile, mockMetadata);

			expect(updateMedia).toHaveBeenCalled();
			expect(mockMedia['mock-id-123']).toBeDefined();
			expect(mockMedia['mock-id-123'].dataUrl).toBe('data:image/png;base64,mock-base64-data');
		});

		it('should include metadata with compressed file size', async () => {
			const result = await service.upload(mockFile, mockMetadata);

			expect(result.entry.metadata).toMatchObject({
				filename: 'test.png',
				filesize: mockFile.size,
				mimeType: 'image/png'
			});
		});

		it('should handle file reading errors', async () => {
			// Mock FileReader with error
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = null;

				readAsDataURL() {
					setTimeout(() => {
						if (this.onerror) {
							this.onerror({} as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;

			await expect(service.upload(mockFile, mockMetadata)).rejects.toThrow('Failed to read file');
		});

		it('should handle non-string FileReader result', async () => {
			// Mock FileReader with ArrayBuffer result
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = new ArrayBuffer(8); // Non-string result

				readAsDataURL() {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;

			await expect(service.upload(mockFile, mockMetadata)).rejects.toThrow(
				'Failed to convert image to Base64'
			);
		});
	});

	describe('get', () => {
		beforeEach(() => {
			// Populate mock media
			mockMedia = {
				'test-id-1': {
					dataUrl: 'data:image/png;base64,abc123',
					metadata: {
						filename: 'test1.png',
						filesize: 1000,
						mimeType: 'image/png',
						width: 100,
						height: 100
					}
				},
				'test-id-2': {
					dataUrl: 'data:image/jpeg;base64,def456',
					metadata: {
						filename: 'test2.jpg',
						filesize: 2000,
						mimeType: 'image/jpeg',
						width: 200,
						height: 200
					}
				}
			};
		});

		it('should retrieve an existing media entry', async () => {
			const entry = await service.get('test-id-1');

			expect(entry).not.toBeNull();
			expect(entry?.dataUrl).toBe('data:image/png;base64,abc123');
			expect(entry?.metadata.filename).toBe('test1.png');
		});

		it('should return null for non-existent media ID', async () => {
			const entry = await service.get('non-existent-id');

			expect(entry).toBeNull();
		});

		it('should call getMedia to access current state', async () => {
			await service.get('test-id-1');

			expect(getMedia).toHaveBeenCalled();
		});
	});

	describe('list', () => {
		it('should return an empty array for empty media library', async () => {
			mockMedia = {};
			const entries = await service.list();

			expect(entries).toEqual([]);
		});

		it('should return all media entries with their IDs', async () => {
			mockMedia = {
				'id-1': {
					dataUrl: 'data:image/png;base64,abc123',
					metadata: {
						filename: 'test1.png',
						filesize: 1000,
						mimeType: 'image/png',
						width: 100,
						height: 100
					}
				},
				'id-2': {
					dataUrl: 'data:image/jpeg;base64,def456',
					metadata: {
						filename: 'test2.jpg',
						filesize: 2000,
						mimeType: 'image/jpeg',
						width: 200,
						height: 200
					}
				}
			};

			const entries = await service.list();

			expect(entries).toHaveLength(2);
			expect(entries[0]).toHaveProperty('id');
			expect(entries[0]).toHaveProperty('entry');
			expect(entries[0].entry).toHaveProperty('dataUrl');
			expect(entries[0].entry).toHaveProperty('metadata');
		});

		it('should call getMedia to access current state', async () => {
			await service.list();

			expect(getMedia).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		beforeEach(() => {
			mockMedia = {
				'test-id-1': {
					dataUrl: 'data:image/png;base64,abc123',
					metadata: {
						filename: 'test1.png',
						filesize: 1000,
						mimeType: 'image/png',
						width: 100,
						height: 100
					}
				},
				'test-id-2': {
					dataUrl: 'data:image/jpeg;base64,def456',
					metadata: {
						filename: 'test2.jpg',
						filesize: 2000,
						mimeType: 'image/jpeg',
						width: 200,
						height: 200
					}
				}
			};
		});

		it('should delete an existing media entry and return true', async () => {
			const result = await service.delete('test-id-1');

			expect(result).toBe(true);
			expect(mockMedia['test-id-1']).toBeUndefined();
		});

		it('should return false for non-existent media ID', async () => {
			const result = await service.delete('non-existent-id');

			expect(result).toBe(false);
		});

		it('should not affect other entries when deleting one', async () => {
			await service.delete('test-id-1');

			expect(mockMedia['test-id-2']).toBeDefined();
			expect(mockMedia['test-id-2'].dataUrl).toBe('data:image/jpeg;base64,def456');
		});

		it('should call updateMedia to modify state', async () => {
			await service.delete('test-id-1');

			expect(updateMedia).toHaveBeenCalled();
		});

		it('should call getMedia to check existence before deletion', async () => {
			await service.delete('test-id-1');

			expect(getMedia).toHaveBeenCalled();
		});
	});

	describe('Integration scenarios', () => {
		it('should handle multiple uploads sequentially', async () => {
			const mockFile1 = new File(['content1'], 'test1.png', { type: 'image/png' });
			const mockFile2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });

			const metadata1: MediaMetadata = {
				filename: 'test1.png',
				filesize: 8,
				mimeType: 'image/png',
				width: 100,
				height: 100
			};

			const metadata2: MediaMetadata = {
				filename: 'test2.jpg',
				filesize: 8,
				mimeType: 'image/jpeg',
				width: 200,
				height: 200
			};

			// Mock FileReader for sequential calls
			let callCount = 0;
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = '';

				readAsDataURL() {
					callCount++;
					this.result = `data:image/png;base64,mock-data-${callCount}`;
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;

			// Mock generateUid for predictable IDs
			const { generateUid } = await import('@ujl-framework/core');
			let idCount = 0;
			vi.mocked(generateUid).mockImplementation(() => `mock-id-${++idCount}`);

			const result1 = await service.upload(mockFile1, metadata1);
			const result2 = await service.upload(mockFile2, metadata2);

			expect(result1.mediaId).toBe('mock-id-1');
			expect(result2.mediaId).toBe('mock-id-2');
			expect(Object.keys(mockMedia)).toHaveLength(2);
		});

		it('should handle upload followed by retrieval', async () => {
			const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
			const metadata: MediaMetadata = {
				filename: 'test.png',
				filesize: 4,
				mimeType: 'image/png',
				width: 100,
				height: 100
			};

			// Mock FileReader
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = 'data:image/png;base64,test-data';

				readAsDataURL() {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;

			const uploadResult = await service.upload(mockFile, metadata);
			const retrievedEntry = await service.get(uploadResult.mediaId);

			expect(retrievedEntry).not.toBeNull();
			expect(retrievedEntry?.dataUrl).toBe('data:image/png;base64,test-data');
		});

		it('should handle upload, list, and delete operations', async () => {
			const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
			const metadata: MediaMetadata = {
				filename: 'test.png',
				filesize: 4,
				mimeType: 'image/png',
				width: 100,
				height: 100
			};

			// Mock FileReader
			const MockFileReader = class {
				onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
				result: string | ArrayBuffer | null = 'data:image/png;base64,test-data';

				readAsDataURL() {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: this } as unknown as ProgressEvent<FileReader>);
						}
					}, 0);
				}
			};

			global.FileReader = MockFileReader as unknown as typeof FileReader;

			// Upload
			const uploadResult = await service.upload(mockFile, metadata);

			// List
			let entries = await service.list();
			expect(entries).toHaveLength(1);

			// Delete
			const deleteResult = await service.delete(uploadResult.mediaId);
			expect(deleteResult).toBe(true);

			// List again
			entries = await service.list();
			expect(entries).toHaveLength(0);
		});
	});
});
