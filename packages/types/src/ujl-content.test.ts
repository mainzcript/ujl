import { describe, expect, it } from "vitest";
import { validateModule, validateSlot, validateUJLCDocumentSafe } from "./ujl-content.js";

describe("UJLC Schema Validation", () => {
	describe("Valid documents", () => {
		it("should validate a valid document", () => {
			const validDocument = {
				ujlc: {
					meta: {
						title: "Test Document",
						description: "A minimal test document",
						tags: ["test"],
						updated_at: "2024-01-01T00:00:00Z",
						_version: "0.0.1",
						_instance: "test-001",
						_embedding_model_hash: "sha256:test",
					},
					root: [
						{
							type: "container",
							meta: {
								id: "module-001",
								updated_at: "2024-01-01T00:00:00Z",
								_embedding: [0.1, 0.2, 0.3],
							},
							fields: {},
							slots: {},
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(validDocument);
			expect(result.success).toBe(true);
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
			const testDoc = {
				ujlc: {
					meta: {
						title: "Test Document",
						description: "A test document with various field types",
						tags: ["test"],
						updated_at: "2024-01-01T00:00:00Z",
						_version: "0.0.1",
						_instance: "test-001",
						_embedding_model_hash: "sha256:test",
					},
					root: [
						{
							type: "container",
							meta: {
								id: "module-001",
								updated_at: "2024-01-01T00:00:00Z",
								_embedding: [0.1],
							},
							fields: {
								stringField: "text",
								numberField: 42,
								booleanField: true,
								arrayField: [1, 2, 3],
								objectField: { nested: "value" },
								nullField: null,
							},
							slots: {},
						},
					],
				},
			};

			const result = validateUJLCDocumentSafe(testDoc);
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
