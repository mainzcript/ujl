import { beforeEach, describe, expect, it, vi } from "vitest";

const compressionCalls: Array<{ maxWidth: number; maxHeight: number; quality: number }> = [];
type MockCompressorOptions = {
	maxWidth: number;
	maxHeight: number;
	quality: number;
	success: (result: Blob) => void;
	error?: (error: Error) => void;
};

vi.mock("compressorjs", () => {
	return {
		default: class MockCompressor {
			constructor(_file: File, options: MockCompressorOptions) {
				compressionCalls.push({
					maxWidth: options.maxWidth,
					maxHeight: options.maxHeight,
					quality: options.quality,
				});

				const result = new Blob([new Uint8Array(500 * 1024)], { type: "image/jpeg" });
				options.success(result);
			}
		},
	};
});

import { compressImage } from "./image-compression.js";

class MockImage {
	width = 300;
	height = 200;
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;

	set src(_value: string) {
		queueMicrotask(() => this.onload?.());
	}
}

describe("compressImage", () => {
	beforeEach(() => {
		compressionCalls.length = 0;
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
		vi.stubGlobal("Image", MockImage);
	});

	it("does not upscale small images during compression", async () => {
		const input = new File([new Uint8Array(500 * 1024)], "small.jpg", { type: "image/jpeg" });

		await compressImage(input);

		expect(compressionCalls.length).toBeGreaterThan(0);
		expect(Math.max(...compressionCalls.map((call) => call.maxWidth))).toBeLessThanOrEqual(300);
		expect(Math.max(...compressionCalls.map((call) => call.maxHeight))).toBeLessThanOrEqual(200);
	});
});
