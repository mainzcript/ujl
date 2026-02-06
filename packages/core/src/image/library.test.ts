import type { ImageEntry, ImageMetadata, ImageProvider, ImageSource } from "@ujl-framework/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageLibrary } from "./library.js";

describe("ImageLibrary", () => {
	describe("Constructor and Initialization", () => {
		it("should create an empty image library", () => {
			const library = new ImageLibrary();
			expect(library.list()).toEqual([]);
		});

		it("should initialize with existing image entries", () => {
			const initialImages: Record<string, ImageEntry> = {
				"test-id-1": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"test-id-2": {
					src: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new ImageLibrary(initialImages);
			const entries = library.list();

			expect(entries).toHaveLength(2);
			expect(entries[0].id).toBe("test-id-1");
			expect(entries[1].id).toBe("test-id-2");
		});

		it("should initialize with a provider", () => {
			const mockProvider: ImageProvider = {
				resolve: vi.fn().mockResolvedValue({ src: "data:image/png;base64,resolved" }),
			};

			const library = new ImageLibrary({}, mockProvider);
			expect(library).toBeDefined();
		});
	});

	describe("add", () => {
		let library: ImageLibrary;

		beforeEach(() => {
			library = new ImageLibrary();
		});

		it("should add a new image entry and return a generated ID", () => {
			const imageSource: ImageSource = {
				src: "data:image/png;base64,abc123",
			};
			const metadata: ImageMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id = library.add(imageSource, metadata);

			expect(id).toBeDefined();
			expect(typeof id).toBe("string");
			expect(id.length).toBeGreaterThan(0);
		});

		it("should store the image entry correctly", () => {
			const imageSource: ImageSource = {
				src: "data:image/png;base64,abc123",
			};
			const metadata: ImageMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id = library.add(imageSource, metadata);
			const entry = library.get(id);

			expect(entry).not.toBeNull();
			expect(entry?.src).toBe(imageSource.src);
			expect(entry?.metadata).toEqual(metadata);
		});

		it("should generate unique IDs for multiple entries", () => {
			const imageSource: ImageSource = {
				src: "data:image/png;base64,abc123",
			};
			const metadata: ImageMetadata = {
				filename: "test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			const id1 = library.add(imageSource, metadata);
			const id2 = library.add(imageSource, metadata);
			const id3 = library.add(imageSource, metadata);

			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
		});
	});

	describe("get", () => {
		let library: ImageLibrary;

		beforeEach(() => {
			const initialImages: Record<string, ImageEntry> = {
				"test-id": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new ImageLibrary(initialImages);
		});

		it("should retrieve an existing image entry", () => {
			const entry = library.get("test-id");

			expect(entry).not.toBeNull();
			expect(entry?.src).toBe("data:image/png;base64,abc123");
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
			const library = new ImageLibrary();
			expect(library.list()).toEqual([]);
		});

		it("should return all image entries with their IDs", () => {
			const initialImages: Record<string, ImageEntry> = {
				"id-1": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"id-2": {
					src: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new ImageLibrary(initialImages);
			const entries = library.list();

			expect(entries).toHaveLength(2);
			expect(entries[0]).toHaveProperty("id");
			expect(entries[0]).toHaveProperty("entry");
			expect(entries[0].entry).toHaveProperty("src");
			expect(entries[0].entry).toHaveProperty("metadata");
		});
	});

	describe("remove", () => {
		let library: ImageLibrary;

		beforeEach(() => {
			const initialImages: Record<string, ImageEntry> = {
				"test-id": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new ImageLibrary(initialImages);
		});

		it("should remove an existing image entry and return true", () => {
			const result = library.remove("test-id");

			expect(result).toBe(true);
			expect(library.get("test-id")).toBeNull();
		});

		it("should return false for non-existent ID", () => {
			const result = library.remove("non-existent-id");
			expect(result).toBe(false);
		});

		it("should not affect other entries when removing one", () => {
			const imageSource: ImageSource = {
				src: "data:image/png;base64,xyz789",
			};
			const metadata: ImageMetadata = {
				filename: "test2.png",
				filesize: 2000,
				mimeType: "image/png",
				width: 200,
				height: 200,
			};

			const id2 = library.add(imageSource, metadata);
			library.remove("test-id");

			expect(library.get(id2)).not.toBeNull();
		});
	});

	describe("resolve - Inline Storage", () => {
		let library: ImageLibrary;

		beforeEach(() => {
			const initialImages: Record<string, ImageEntry> = {
				"test-id": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};
			library = new ImageLibrary(initialImages);
		});

		it("should resolve inline image with string ID", async () => {
			const result = await library.resolve("test-id");

			expect(result).not.toBeNull();
			expect(result?.src).toBe("data:image/png;base64,abc123");
		});

		it("should resolve inline image with number ID", async () => {
			const imageSource: ImageSource = {
				src: "data:image/png;base64,number123",
			};
			const metadata: ImageMetadata = {
				filename: "number-test.png",
				filesize: 1000,
				mimeType: "image/png",
				width: 100,
				height: 100,
			};

			// Add with numeric-looking string ID
			const initialImages: Record<string, ImageEntry> = {
				"123": {
					src: imageSource.src,
					metadata,
				},
			};
			const lib = new ImageLibrary(initialImages);

			const result = await lib.resolve(123);

			expect(result).not.toBeNull();
			expect(result?.src).toBe("data:image/png;base64,number123");
		});

		it("should return null for missing image ID", async () => {
			const result = await library.resolve("non-existent-id");
			expect(result).toBeNull();
		});

		it("should return ImageSource with only src property", async () => {
			const result = await library.resolve("test-id");

			expect(result).not.toBeNull();
			expect(result).toHaveProperty("src");
			expect(Object.keys(result || {})).toEqual(["src"]);
		});
	});

	describe("resolve - Backend Storage with Provider", () => {
		it("should fall back to provider when image not found in inline storage", async () => {
			const mockProvider: ImageProvider = {
				resolve: vi.fn().mockResolvedValue({ src: "data:image/png;base64,backend-resolved" }),
			};

			const library = new ImageLibrary({}, mockProvider);
			const result = await library.resolve("backend-id");

			expect(result).not.toBeNull();
			expect(result?.src).toBe("data:image/png;base64,backend-resolved");
			expect(mockProvider.resolve).toHaveBeenCalledWith("backend-id");
		});

		it("should prioritize inline storage over provider", async () => {
			const mockProvider: ImageProvider = {
				resolve: vi.fn().mockResolvedValue({ src: "data:image/png;base64,backend-resolved" }),
			};

			const initialImages: Record<string, ImageEntry> = {
				"shared-id": {
					src: "data:image/png;base64,inline-data",
					metadata: {
						filename: "inline.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};

			const library = new ImageLibrary(initialImages, mockProvider);
			const result = await library.resolve("shared-id");

			expect(result?.src).toBe("data:image/png;base64,inline-data");
			expect(mockProvider.resolve).not.toHaveBeenCalled();
		});

		it("should return null when provider returns null", async () => {
			const mockProvider: ImageProvider = {
				resolve: vi.fn().mockResolvedValue(null),
			};

			const library = new ImageLibrary({}, mockProvider);
			const result = await library.resolve("missing-id");

			expect(result).toBeNull();
			expect(mockProvider.resolve).toHaveBeenCalledWith("missing-id");
		});

		it("should work without a provider", async () => {
			const library = new ImageLibrary();
			const result = await library.resolve("any-id");

			expect(result).toBeNull();
		});
	});

	describe("toObject", () => {
		it("should return an empty object for empty library", () => {
			const library = new ImageLibrary();
			const obj = library.toObject();

			expect(obj).toEqual({});
		});

		it("should return a copy of the images object", () => {
			const initialImages: Record<string, ImageEntry> = {
				"id-1": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
			};

			const library = new ImageLibrary(initialImages);
			const obj = library.toObject();

			expect(obj).toEqual(initialImages);
			expect(obj).not.toBe(initialImages); // Should be a copy
		});

		it("should include all added entries", () => {
			const library = new ImageLibrary();

			const id1 = library.add(
				{ src: "data:image/png;base64,abc123" },
				{ filename: "test1.png", filesize: 1000, mimeType: "image/png", width: 100, height: 100 },
			);

			const id2 = library.add(
				{ src: "data:image/jpeg;base64,def456" },
				{ filename: "test2.jpg", filesize: 2000, mimeType: "image/jpeg", width: 200, height: 200 },
			);

			const obj = library.toObject();

			expect(Object.keys(obj)).toHaveLength(2);
			expect(obj[id1]).toBeDefined();
			expect(obj[id2]).toBeDefined();
		});

		it("should reflect removed entries", () => {
			const initialImages: Record<string, ImageEntry> = {
				"id-1": {
					src: "data:image/png;base64,abc123",
					metadata: {
						filename: "test1.png",
						filesize: 1000,
						mimeType: "image/png",
						width: 100,
						height: 100,
					},
				},
				"id-2": {
					src: "data:image/jpeg;base64,def456",
					metadata: {
						filename: "test2.jpg",
						filesize: 2000,
						mimeType: "image/jpeg",
						width: 200,
						height: 200,
					},
				},
			};

			const library = new ImageLibrary(initialImages);
			library.remove("id-1");

			const obj = library.toObject();

			expect(Object.keys(obj)).toHaveLength(1);
			expect(obj["id-1"]).toBeUndefined();
			expect(obj["id-2"]).toBeDefined();
		});
	});
});
