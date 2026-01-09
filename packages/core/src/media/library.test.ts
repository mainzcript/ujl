import type { MediaLibraryEntry, MediaMetadata, UJLImageData } from "@ujl-framework/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaLibrary, type MediaResolver } from "./library.js";

describe("MediaLibrary", () => {
	describe("Constructor and Initialization", () => {
		it("should create an empty media library", () => {
			const library = new MediaLibrary();
			expect(library.list()).toEqual([]);
		});

		it("should initialize with existing media entries", () => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"test-id-1": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"test-id-2": {
					dataUrl: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new MediaLibrary(initialMedia);
			const entries = library.list();

			expect(entries).toHaveLength(2);
			expect(entries[0].id).toBe("test-id-1");
			expect(entries[1].id).toBe("test-id-2");
		});

		it("should initialize with a resolver", () => {
			const mockResolver: MediaResolver = {
				resolve: vi.fn().mockResolvedValue("data:image/png;base64,resolved"),
			};

			const library = new MediaLibrary({}, mockResolver);
			expect(library).toBeDefined();
		});
	});

	describe("add", () => {
		let library: MediaLibrary;

		beforeEach(() => {
			library = new MediaLibrary();
		});

		it("should add a new media entry and return a generated ID", () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/png;base64,abc123",
			};
			const metadata: MediaMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id = library.add(imageData, metadata);

			expect(id).toBeDefined();
			expect(typeof id).toBe("string");
			expect(id.length).toBeGreaterThan(0);
		});

		it("should store the media entry correctly", () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/png;base64,abc123",
			};
			const metadata: MediaMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id = library.add(imageData, metadata);
			const entry = library.get(id);

			expect(entry).not.toBeNull();
			expect(entry?.dataUrl).toBe(imageData.dataUrl);
			expect(entry?.metadata).toEqual(metadata);
		});

		it("should generate unique IDs for multiple entries", () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/png;base64,abc123",
			};
			const metadata: MediaMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id1 = library.add(imageData, metadata);
			const id2 = library.add(imageData, metadata);
			const id3 = library.add(imageData, metadata);

			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
		});
	});

	describe("get", () => {
		let library: MediaLibrary;

		beforeEach(() => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"test-id": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new MediaLibrary(initialMedia);
		});

		it("should retrieve an existing media entry", () => {
			const entry = library.get("test-id");

			expect(entry).not.toBeNull();
			expect(entry?.dataUrl).toBe("data:image/png;base64,abc123");
			expect(entry?.metadata.filename).toBe("test.png");
		});

		it("should return null for non-existent ID", () => {
			const entry = library.get("non-existent-id");
			expect(entry).toBeNull();
		});

		it("should handle empty string ID", () => {
			const entry = library.get("");
			expect(entry).toBeNull();
		});
	});

	describe("list", () => {
		it("should return an empty array for empty library", () => {
			const library = new MediaLibrary();
			expect(library.list()).toEqual([]);
		});

		it("should return all media entries with their IDs", () => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"id-1": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"id-2": {
					dataUrl: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new MediaLibrary(initialMedia);
			const entries = library.list();

			expect(entries).toHaveLength(2);
			expect(entries[0]).toHaveProperty("id");
			expect(entries[0]).toHaveProperty("entry");
			expect(entries[0].entry).toHaveProperty("dataUrl");
			expect(entries[0].entry).toHaveProperty("metadata");
		});
	});

	describe("remove", () => {
		let library: MediaLibrary;

		beforeEach(() => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"test-id": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new MediaLibrary(initialMedia);
		});

		it("should remove an existing media entry and return true", () => {
			const result = library.remove("test-id");

			expect(result).toBe(true);
			expect(library.get("test-id")).toBeNull();
		});

		it("should return false for non-existent ID", () => {
			const result = library.remove("non-existent-id");
			expect(result).toBe(false);
		});

		it("should not affect other entries when removing one", () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/png;base64,xyz789",
			};
			const metadata: MediaMetadata = {
				filename: "test2.png",
				filesize: 2000,
				mimeType: "image/png",
				width: 200,
				height: 200,
			};

			const id2 = library.add(imageData, metadata);
			library.remove("test-id");

			expect(library.get(id2)).not.toBeNull();
		});
	});

	describe("resolve - Inline Storage", () => {
		let library: MediaLibrary;

		beforeEach(() => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"test-id": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new MediaLibrary(initialMedia);
		});

		it("should resolve inline media with string ID", async () => {
			const result = await library.resolve("test-id");

			expect(result).not.toBeNull();
			expect(result?.dataUrl).toBe("data:image/png;base64,abc123");
		});

		it("should resolve inline media with number ID", async () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/png;base64,number123",
			};
			const metadata: MediaMetadata = {
				filename: "number-test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			// Add with numeric-looking string ID
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"123": {
					dataUrl: imageData.dataUrl,
					metadata,
				},
			};
			const lib = new MediaLibrary(initialMedia);

			const result = await lib.resolve(123);

			expect(result).not.toBeNull();
			expect(result?.dataUrl).toBe("data:image/png;base64,number123");
		});

		it("should return null for missing media ID", async () => {
			const result = await library.resolve("non-existent-id");
			expect(result).toBeNull();
		});

		it("should return UJLImageData with only dataUrl property", async () => {
			const result = await library.resolve("test-id");

			expect(result).not.toBeNull();
			expect(result).toHaveProperty("dataUrl");
			expect(Object.keys(result || {})).toEqual(["dataUrl"]);
		});
	});

	describe("resolve - Backend Storage with Resolver", () => {
		it("should fall back to resolver when media not found in inline storage", async () => {
			const mockResolver: MediaResolver = {
				resolve: vi.fn().mockResolvedValue("data:image/png;base64,backend-resolved"),
			};

			const library = new MediaLibrary({}, mockResolver);
			const result = await library.resolve("backend-id");

			expect(result).not.toBeNull();
			expect(result?.dataUrl).toBe("data:image/png;base64,backend-resolved");
			expect(mockResolver.resolve).toHaveBeenCalledWith("backend-id");
		});

		it("should prioritize inline storage over resolver", async () => {
			const mockResolver: MediaResolver = {
				resolve: vi.fn().mockResolvedValue("data:image/png;base64,backend-resolved"),
			};

			const initialMedia: Record<string, MediaLibraryEntry> = {
				"shared-id": {
					dataUrl: "data:image/png;base64,inline-data",
					metadata: {
						filename: "inline.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};

			const library = new MediaLibrary(initialMedia, mockResolver);
			const result = await library.resolve("shared-id");

			expect(result?.dataUrl).toBe("data:image/png;base64,inline-data");
			expect(mockResolver.resolve).not.toHaveBeenCalled();
		});

		it("should return null when resolver returns null", async () => {
			const mockResolver: MediaResolver = {
				resolve: vi.fn().mockResolvedValue(null),
			};

			const library = new MediaLibrary({}, mockResolver);
			const result = await library.resolve("missing-id");

			expect(result).toBeNull();
			expect(mockResolver.resolve).toHaveBeenCalledWith("missing-id");
		});

		it("should work without a resolver", async () => {
			const library = new MediaLibrary();
			const result = await library.resolve("any-id");

			expect(result).toBeNull();
		});
	});

	describe("toObject", () => {
		it("should return an empty object for empty library", () => {
			const library = new MediaLibrary();
			const obj = library.toObject();

			expect(obj).toEqual({});
		});

		it("should return a copy of the media object", () => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"id-1": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};

			const library = new MediaLibrary(initialMedia);
			const obj = library.toObject();

			expect(obj).toEqual(initialMedia);
			expect(obj).not.toBe(initialMedia); // Should be a copy
		});

		it("should include all added entries", () => {
			const library = new MediaLibrary();

			const id1 = library.add(
				{ dataUrl: "data:image/png;base64,abc123" },
				{ filename: "test1.png", filesize: 1000, mimeType: "image/png", width: 100, height: 100 }
			);

			const id2 = library.add(
				{ dataUrl: "data:image/jpeg;base64,def456" },
				{ filename: "test2.jpg", filesize: 2000, mimeType: "image/jpeg", width: 200, height: 200 }
			);

			const obj = library.toObject();

			expect(Object.keys(obj)).toHaveLength(2);
			expect(obj[id1]).toBeDefined();
			expect(obj[id2]).toBeDefined();
		});

		it("should reflect removed entries", () => {
			const initialMedia: Record<string, MediaLibraryEntry> = {
				"id-1": {
					dataUrl: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"id-2": {
					dataUrl: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new MediaLibrary(initialMedia);
			library.remove("id-1");

			const obj = library.toObject();

			expect(Object.keys(obj)).toHaveLength(1);
			expect(obj["id-1"]).toBeUndefined();
			expect(obj["id-2"]).toBeDefined();
		});
	});
});
