import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import type { Composer } from "../composer.js";
import { TextField } from "../fields/concretes/text-field.js";
import { ModuleBase } from "./base.js";

// ============================================
// TEST HELPERS
// ============================================

/**
 * Minimal concrete ModuleBase implementation for testing parseField and
 * escapeHtml behaviour. Exposes both protected methods publicly.
 */
class TestModule extends ModuleBase {
	public readonly name = "test";
	public readonly label = "Test";
	public readonly description = "Test module";
	public readonly category = "content" as const;
	public readonly tags = [] as const;
	public readonly icon = "";
	public readonly fields = [
		{
			key: "title",
			field: new TextField({ label: "Title", description: "A title", default: "Default" }),
		},
	];
	public readonly slots = [];

	public compose(_moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		return { type: "text", id: "test-id", props: {} };
	}

	// Expose protected methods for testing
	public testParseField<T>(moduleData: UJLCModuleObject, key: string, fallback: T): T {
		return this.parseField(moduleData, key, fallback);
	}

	public testEscapeHtml(value: string): string {
		return this.escapeHtml(value);
	}
}

function makeModuleData(fields: Record<string, unknown> = {}): UJLCModuleObject {
	return {
		type: "test",
		meta: { id: "test-id", updated_at: new Date().toISOString(), _embedding: [] },
		fields,
		slots: {},
	};
}

// ============================================
// TESTS
// ============================================

describe("ModuleBase.parseField", () => {
	describe("fallback behaviour", () => {
		it("returns the fallback when the key does not exist in fields definition", () => {
			const mod = new TestModule();
			const data = makeModuleData({ title: "Hello" });

			expect(mod.testParseField(data, "nonexistent", "fallback")).toBe("fallback");
		});

		it("returns the field default (not the parseField fallback) when value is missing from moduleData", () => {
			// TextField.parse() returns the field's own default when validation fails,
			// so the parseField fallback is only reached if parse() itself returns null/undefined.
			const mod = new TestModule();
			const data = makeModuleData({}); // no title supplied

			// TextField default is "Default" (configured in TestModule)
			expect(mod.testParseField(data, "title", "fallback")).toBe("Default");
		});

		it("returns the field default (not the parseField fallback) when parsed value is null", () => {
			// null fails TextField.validate(), so parse() returns the field default "Default"
			const mod = new TestModule();
			const data = makeModuleData({ title: null });

			expect(mod.testParseField(data, "title", "fallback")).toBe("Default");
		});
	});

	describe("value passthrough", () => {
		it("returns the parsed string value unchanged", () => {
			const mod = new TestModule();
			const data = makeModuleData({ title: "Hello & World" });

			// No escaping — value is returned as-is
			expect(mod.testParseField(data, "title", "")).toBe("Hello & World");
		});

		it("returns special characters unmodified", () => {
			const mod = new TestModule();
			const data = makeModuleData({ title: "<script>alert(1)</script>" });

			expect(mod.testParseField(data, "title", "")).toBe("<script>alert(1)</script>");
		});
	});
});

describe("ModuleBase.escapeHtml", () => {
	it("escapes &", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml("bread & butter")).toBe("bread &amp; butter");
	});

	it("escapes < and >", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml("<script>alert(1)</script>")).toBe(
			"&lt;script&gt;alert(1)&lt;/script&gt;",
		);
	});

	it('escapes double quotes "', () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
	});

	it("escapes single quotes '", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml("it's fine")).toBe("it&#39;s fine");
	});

	it("escapes all special characters together", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml(`<b class="x">it's a & test</b>`)).toBe(
			"&lt;b class=&quot;x&quot;&gt;it&#39;s a &amp; test&lt;/b&gt;",
		);
	});

	it("returns clean strings unchanged", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml("Hello World")).toBe("Hello World");
	});

	it("returns an empty string unchanged", () => {
		const mod = new TestModule();
		expect(mod.testEscapeHtml("")).toBe("");
	});
});
