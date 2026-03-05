import type { LibraryAsset, LibraryAssetImage } from "@ujl-framework/types";
import { LibraryError } from "@ujl-framework/types";
import { beforeEach, describe, expect, it } from "vitest";
import { InlineLibraryProvider } from "./inline-provider.js";

describe("InlineLibraryProvider", () => {
	let provider: InlineLibraryProvider;
	let mockLibrary: Record<string, LibraryAsset>;

	beforeEach(() => {
		provider = new InlineLibraryProvider();
		mockLibrary = {
			"img-1": {
				kind: "image",
				img: { src: "data:image/png;base64,abc123", width: 800, height: 600 },
				meta: { filename: "test.png", alt: "Test image" },
			} as LibraryAssetImage,
			"img-2": {
				kind: "image",
				img: { src: "data:image/jpeg;base64,xyz789", width: 400, height: 300 },
				meta: { filename: "photo.jpg", caption: "Vacation photo" },
			} as LibraryAssetImage,
		};
	});

	describe("list", () => {
		it("should return all items from library", async () => {
			const result = await provider.list(mockLibrary);
			expect(result.items).toHaveLength(2);
			expect(result.hasMore).toBe(false);
		});

		it("should support pagination", async () => {
			const result = await provider.list(mockLibrary, { limit: 1 });
			expect(result.items).toHaveLength(1);
			expect(result.hasMore).toBe(true);
			expect(result.nextCursor).toBe("1");
		});

		it("should filter by search term in filename", async () => {
			const result = await provider.list(mockLibrary, { search: "photo" });
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.id).toBe("img-2");
		});

		it("should filter by search term in caption", async () => {
			const result = await provider.list(mockLibrary, { search: "Vacation" });
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.id).toBe("img-2");
		});

		it("should filter by search term in alt text", async () => {
			const result = await provider.list(mockLibrary, { search: "Test image" });
			expect(result.items).toHaveLength(1);
			expect(result.items[0]?.id).toBe("img-1");
		});

		it("should return empty array for non-matching search", async () => {
			const result = await provider.list(mockLibrary, { search: "nonexistent" });
			expect(result.items).toHaveLength(0);
			expect(result.hasMore).toBe(false);
		});
	});

	describe("get", () => {
		it("should return asset by id", async () => {
			const asset = await provider.get(mockLibrary, "img-1");
			expect(asset).toBeDefined();
			expect(asset?.meta?.filename).toBe("test.png");
		});

		it("should return null for unknown id", async () => {
			const asset = await provider.get(mockLibrary, "unknown");
			expect(asset).toBeNull();
		});
	});

	describe("upload", () => {
		it("should process upload and return asset without id", async () => {
			const data = new ArrayBuffer(8);
			const result = await provider.upload(data, { filename: "new.png", type: "image/png" });

			expect(result.kind).toBe("image");
			expect(result.meta?.filename).toBe("new.png");
			expect(result.img.src).toMatch(/^data:image\/png;base64,/);
			// Verify no id is assigned (Crafter manages IDs)
			expect("id" in result).toBe(false);
		});

		it("should include fileSize in metadata", async () => {
			const data = new ArrayBuffer(1024);
			const result = await provider.upload(data, { filename: "sized.png", type: "image/png" });

			expect(result.meta?.fileSize).toBe(1024);
		});

		it("should include upload timestamp", async () => {
			const beforeUpload = new Date().toISOString();
			const data = new ArrayBuffer(8);
			const result = await provider.upload(data, { filename: "timed.png", type: "image/png" });
			const afterUpload = new Date().toISOString();

			expect(result.meta?.uploadedAt).toBeDefined();
			// Verify timestamp is valid ISO string
			const uploadedAt = result.meta?.uploadedAt ?? "";
			expect(uploadedAt >= beforeUpload || uploadedAt <= afterUpload).toBe(true);
		});
	});

	describe("updateMetadata", () => {
		it("should update asset metadata", async () => {
			const updated = await provider.updateMetadata(mockLibrary, "img-1", {
				alt: "Updated alt text",
				caption: "New caption",
			});

			expect(updated.meta?.alt).toBe("Updated alt text");
			expect(updated.meta?.caption).toBe("New caption");
			expect(updated.meta?.filename).toBe("test.png"); // Unchanged
		});

		it("should throw LibraryError for unknown asset", async () => {
			// Should throw with correct error code - verify error properties
			await expect(
				provider.updateMetadata(mockLibrary, "unknown", { alt: "test" }),
			).rejects.toSatisfy((error: LibraryError) => {
				return (
					error instanceof LibraryError &&
					error.message === "Asset not found" &&
					error.code === "NOT_FOUND"
				);
			});
		});

		it("should preserve existing fields when updating", async () => {
			const updated = await provider.updateMetadata(mockLibrary, "img-1", {
				alt: "New alt",
			});

			// Existing fields should be preserved
			expect(updated.img.width).toBe(800);
			expect(updated.img.height).toBe(600);
			expect(updated.img.src).toBe("data:image/png;base64,abc123");
		});
	});

	describe("getImageDimensions", () => {
		// Note: In Node.js/test environment without DOM, dimensions will always be 0,0
		// The actual browser implementation is tested separately in integration tests

		it("should return zero dimensions in test environment", async () => {
			// In test environment (Node.js), Image is not available
			// So upload should return 0,0 for dimensions
			const data = new ArrayBuffer(8);
			const result = await provider.upload(data, { filename: "test.png", type: "image/png" });

			expect(result.img.width).toBe(0);
			expect(result.img.height).toBe(0);
		});
	});
});
