import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
import {
	validateModule,
	validateSlot,
	validateUJLCDocumentSafe,
	type UJLCDocument,
	type UJLCModuleObject,
} from "@ujl-framework/types";
import { describe, expect, it } from "vitest";

describe("UJLC Schema Validation", () => {
	describe("showcase.ujlc.json", () => {
		const docData = showcaseDocument;

		it("should validate successfully", () => {
			const result = validateUJLCDocumentSafe(docData);
			expect(result.success).toBe(true);
		});

		it("should have correct document structure", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const doc: UJLCDocument = result.data;

			expect(doc.ujlc.meta.title).toBe("UJL Framework Example Document");
			expect(doc.ujlc.meta.description).toBeDefined();
			expect(doc.ujlc.meta.tags).toBeInstanceOf(Array);
			expect(doc.ujlc.meta._version).toBe("0.0.1");
			expect(doc.ujlc.meta._instance).toBe("example-001");
		});

		it("should have valid metadata", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const meta = result.data.ujlc.meta;

			expect(meta.title).toBeTypeOf("string");
			expect(meta.description).toBeTypeOf("string");
			expect(meta.tags.length).toBeGreaterThan(0);
			expect(meta.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
			expect(meta._embedding_model_hash).toContain("sha256:");
		});

		it("should have root slot with modules", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const root = result.data.ujlc.root;

			expect(root).toBeInstanceOf(Array);
			expect(root.length).toBeGreaterThan(0);
			expect(root[0].type).toBe("container");
		});

		it("should have valid module structure", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const firstModule = result.data.ujlc.root[0];

			expect(firstModule.type).toBeTypeOf("string");
			expect(firstModule.meta.id).toBeTypeOf("string");
			expect(firstModule.meta.updated_at).toBeTypeOf("string");
			expect(firstModule.meta._embedding).toBeInstanceOf(Array);
			expect(firstModule.fields).toBeTypeOf("object");
			expect(firstModule.slots).toBeTypeOf("object");
		});

		it("should have valid embeddings", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const firstModule = result.data.ujlc.root[0];
			const embedding = firstModule.meta._embedding;

			expect(embedding).toBeInstanceOf(Array);
			expect(embedding.length).toBeGreaterThan(0);
			embedding.forEach(value => {
				expect(typeof value).toBe("number");
			});
		});

		it("should have nested slots and modules", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const container = result.data.ujlc.root[0];

			expect(container.slots.body).toBeInstanceOf(Array);
			expect(container.slots.body.length).toBeGreaterThan(0);

			// Check first child module
			const textModule = container.slots.body[0];
			expect(textModule.type).toBe("text");
			expect(textModule.fields.content).toBeTypeOf("string");
		});

		it("should have grid with card items", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const container = result.data.ujlc.root[0];
			const gridModule = container.slots.body.find(m => m.type === "grid");

			expect(gridModule).toBeDefined();
			expect(gridModule?.slots.items).toBeInstanceOf(Array);
			expect(gridModule?.slots.items.length).toBe(3);

			// Check all items are cards
			gridModule?.slots.items.forEach((item: UJLCModuleObject) => {
				expect(item.type).toBe("card");
				expect(item.fields.title).toBeTypeOf("string");
				expect(item.fields.description).toBeTypeOf("string");
			});
		});

		it("should have button with valid fields", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const container = result.data.ujlc.root[0];
			const buttonModule = container.slots.body.find(m => m.type === "button");

			expect(buttonModule).toBeDefined();
			expect(buttonModule?.fields.label).toBe("Try UJL Framework");
			expect(buttonModule?.fields.href).toBe("https://ujl-framework.org");
		});

		it("should have call-to-action in nested container", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const container = result.data.ujlc.root[0];
			const nestedContainer = container.slots.body.find(m => m.type === "container");

			expect(nestedContainer).toBeDefined();

			const ctaModule = nestedContainer?.slots.body[0];
			expect(ctaModule?.type).toBe("call-to-action");
			expect(ctaModule?.fields.headline).toBe("Ready to get started?");
			expect(ctaModule?.fields.actionButtonPrimaryLabel).toBe("Start Building");
		});

		it("should have all module IDs unique", () => {
			const result = validateUJLCDocumentSafe(docData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const ids = new Set<string>();

			function collectIds(modules: UJLCModuleObject[]) {
				modules.forEach(module => {
					ids.add(module.meta.id);
					Object.values(module.slots).forEach(slot => {
						collectIds(slot);
					});
				});
			}

			collectIds(result.data.ujlc.root);

			// count all modules
			let moduleCount = 0;
			function countModules(modules: UJLCModuleObject[]) {
				moduleCount += modules.length;
				modules.forEach(module => {
					Object.values(module.slots).forEach(slot => {
						countModules(slot);
					});
				});
			}
			countModules(result.data.ujlc.root);

			// IDs should be unique
			expect(ids.size).toBe(moduleCount);
		});
	});

	describe("Invalid UJLC documents", () => {
		it("should reject missing meta", () => {
			const invalid = {
				ujlc: {
					// meta missing
					root: [],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid meta structure", () => {
			const invalid = {
				ujlc: {
					meta: {
						title: "Test",
						// description missing
						tags: [],
						updated_at: "2024-01-01",
						_version: "0.0.1",
						_instance: "test",
						_embedding_model_hash: "hash",
					},
					root: [],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing module type", () => {
			const invalid = {
				ujlc: {
					meta: {
						title: "Test",
						description: "Test",
						tags: [],
						updated_at: "2024-01-01",
						_version: "0.0.1",
						_instance: "test",
						_embedding_model_hash: "hash",
					},
					root: [
						{
							// type missing
							meta: {
								id: "1",
								updated_at: "2024-01-01",
								_embedding: [0.1],
							},
							fields: {},
							slots: {},
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid embedding (not array)", () => {
			const invalid = {
				ujlc: {
					meta: {
						title: "Test",
						description: "Test",
						tags: [],
						updated_at: "2024-01-01",
						_version: "0.0.1",
						_instance: "test",
						_embedding_model_hash: "hash",
					},
					root: [
						{
							type: "container",
							meta: {
								id: "1",
								updated_at: "2024-01-01",
								_embedding: "invalid", // has to be array
							},
							fields: {},
							slots: {},
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing slots", () => {
			const invalid = {
				ujlc: {
					meta: {
						title: "Test",
						description: "Test",
						tags: [],
						updated_at: "2024-01-01",
						_version: "0.0.1",
						_instance: "test",
						_embedding_model_hash: "hash",
					},
					root: [
						{
							type: "container",
							meta: {
								id: "1",
								updated_at: "2024-01-01",
								_embedding: [0.1],
							},
							fields: {},
							// slots missing
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject slots that are not records", () => {
			const invalid = {
				ujlc: {
					meta: {
						title: "Test",
						description: "Test",
						tags: [],
						updated_at: "2024-01-01",
						_version: "0.0.1",
						_instance: "test",
						_embedding_model_hash: "hash",
					},
					root: [
						{
							type: "container",
							meta: {
								id: "1",
								updated_at: "2024-01-01",
								_embedding: [0.1],
							},
							fields: {},
							slots: "invalid", // has to be an object
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("Partial validation", () => {
		it("should validate a single module", () => {
			const module = {
				type: "text",
				meta: {
					id: "test-001",
					updated_at: "2024-01-01T00:00:00Z",
					_embedding: [0.1, 0.2, 0.3],
				},
				fields: {
					content: "Hello World",
				},
				slots: {},
			};

			expect(() => validateModule(module)).not.toThrow();
		});

		it("should validate a slot", () => {
			const slot = [
				{
					type: "text",
					meta: {
						id: "test-001",
						updated_at: "2024-01-01T00:00:00Z",
						_embedding: [0.1],
					},
					fields: { content: "Test" },
					slots: {},
				},
			];

			expect(() => validateSlot(slot)).not.toThrow();
		});

		it("should validate nested modules", () => {
			const module = {
				type: "container",
				meta: {
					id: "container-001",
					updated_at: "2024-01-01T00:00:00Z",
					_embedding: [0.1],
				},
				fields: {},
				slots: {
					body: [
						{
							type: "text",
							meta: {
								id: "text-001",
								updated_at: "2024-01-01T00:00:00Z",
								_embedding: [0.2],
							},
							fields: { content: "Nested" },
							slots: {},
						},
					],
				},
			};

			expect(() => validateModule(module)).not.toThrow();
		});
	});

	describe("Field flexibility", () => {
		it("should accept any field value type", () => {
			const docData = showcaseDocument;

			// add different fiels types to first module
			docData.ujlc.root[0].fields = {
				stringField: "text",
				numberField: 42,
				booleanField: true,
				arrayField: [1, 2, 3],
				objectField: { nested: "value" },
				nullField: null,
			};

			const result = validateUJLCDocumentSafe(docData);
			expect(result.success).toBe(true);
		});
	});

	describe("Deep nesting", () => {
		it("should handle deeply nested structures", () => {
			const deepDoc = {
				ujlc: {
					meta: {
						title: "Deep",
						description: "Deep nesting test",
						tags: ["test"],
						updated_at: "2024-01-01T00:00:00Z",
						_version: "0.0.1",
						_instance: "deep-001",
						_embedding_model_hash: "sha256:test",
					},
					root: [
						{
							type: "container",
							meta: { id: "c1", updated_at: "2024-01-01", _embedding: [0.1] },
							fields: {},
							slots: {
								body: [
									{
										type: "container",
										meta: { id: "c2", updated_at: "2024-01-01", _embedding: [0.2] },
										fields: {},
										slots: {
											body: [
												{
													type: "container",
													meta: { id: "c3", updated_at: "2024-01-01", _embedding: [0.3] },
													fields: {},
													slots: {
														body: [
															{
																type: "text",
																meta: { id: "t1", updated_at: "2024-01-01", _embedding: [0.4] },
																fields: { content: "Deep!" },
																slots: {},
															},
														],
													},
												},
											],
										},
									},
								],
							},
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(deepDoc);
			expect(result.success).toBe(true);
		});
	});
});
