import { describe, it, expect } from 'vitest';
import { prosemirrorToHtml } from './prosemirror.js';
import type { ProseMirrorDocument } from '@ujl-framework/types';

describe('prosemirrorToHtml', () => {
	describe('Invalid document handling', () => {
		it('should return empty string for null document', () => {
			const result = prosemirrorToHtml(null as unknown as ProseMirrorDocument);
			expect(result).toBe('');
		});

		it('should return empty string for undefined document', () => {
			const result = prosemirrorToHtml(undefined as unknown as ProseMirrorDocument);
			expect(result).toBe('');
		});

		it('should return empty string for document without type', () => {
			const invalidDoc = {
				content: [{ type: 'paragraph', content: [] }]
			} as unknown as ProseMirrorDocument;

			const result = prosemirrorToHtml(invalidDoc);
			expect(result).toBe('');
		});

		it('should return empty string for document with wrong type', () => {
			const invalidDoc = {
				type: 'not-doc',
				content: [{ type: 'paragraph', content: [] }]
			} as unknown as ProseMirrorDocument;

			const result = prosemirrorToHtml(invalidDoc);
			expect(result).toBe('');
		});

		it('should return empty string for document without content array', () => {
			const invalidDoc = {
				type: 'doc',
				content: 'not-an-array'
			} as unknown as ProseMirrorDocument;

			const result = prosemirrorToHtml(invalidDoc);
			expect(result).toBe('');
		});
	});

	describe('Valid document conversion', () => {
		it('should serialize paragraph with text', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Hello World' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p>Hello World</p>');
		});

		it('should serialize heading', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'heading',
						attrs: { level: 1 },
						content: [{ type: 'text', text: 'Title' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<h1>Title</h1>');
		});

		it('should serialize heading with different levels', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'heading',
						attrs: { level: 2 },
						content: [{ type: 'text', text: 'Subtitle' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<h2>Subtitle</h2>');
		});

		it('should serialize bold text', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Bold',
								marks: [{ type: 'bold' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><strong>Bold</strong></p>');
		});

		it('should serialize italic text', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Italic',
								marks: [{ type: 'italic' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><em>Italic</em></p>');
		});

		it('should serialize code text', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'const x = 1;',
								marks: [{ type: 'code' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><code>const x = 1;</code></p>');
		});

		it('should serialize multiple marks', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Bold and Italic',
								marks: [{ type: 'bold' }, { type: 'italic' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><strong><em>Bold and Italic</em></strong></p>');
		});

		it('should serialize code block', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'codeBlock',
						content: [{ type: 'text', text: 'const x = 1;\nconst y = 2;' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<pre><code>const x = 1;\nconst y = 2;</code></pre>');
		});

		it('should serialize blockquote', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'blockquote',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Quote text' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<blockquote><p>Quote text</p></blockquote>');
		});

		it('should serialize horizontal rule', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [{ type: 'horizontalRule' }]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<hr>');
		});

		it('should serialize hard break', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{ type: 'text', text: 'Line 1' },
							{ type: 'hardBreak' },
							{ type: 'text', text: 'Line 2' }
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p>Line 1<br>Line 2</p>');
		});

		it('should serialize bullet list', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'bulletList',
						content: [
							{
								type: 'listItem',
								content: [
									{
										type: 'paragraph',
										content: [{ type: 'text', text: 'Item 1' }]
									}
								]
							},
							{
								type: 'listItem',
								content: [
									{
										type: 'paragraph',
										content: [{ type: 'text', text: 'Item 2' }]
									}
								]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>');
		});

		it('should serialize ordered list', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'orderedList',
						content: [
							{
								type: 'listItem',
								content: [
									{
										type: 'paragraph',
										content: [{ type: 'text', text: 'First' }]
									}
								]
							},
							{
								type: 'listItem',
								content: [
									{
										type: 'paragraph',
										content: [{ type: 'text', text: 'Second' }]
									}
								]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<ol><li><p>First</p></li><li><p>Second</p></li></ol>');
		});

		it('should serialize nested lists', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'bulletList',
						content: [
							{
								type: 'listItem',
								content: [
									{
										type: 'paragraph',
										content: [{ type: 'text', text: 'Parent' }]
									},
									{
										type: 'bulletList',
										content: [
											{
												type: 'listItem',
												content: [
													{
														type: 'paragraph',
														content: [{ type: 'text', text: 'Child' }]
													}
												]
											}
										]
									}
								]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<ul><li><p>Parent</p><ul><li><p>Child</p></li></ul></li></ul>');
		});

		it('should serialize document with multiple paragraphs', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'First paragraph' }]
					},
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Second paragraph' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p>First paragraph</p><p>Second paragraph</p>');
		});

		it('should handle empty document', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: []
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('');
		});

		it('should handle empty paragraph', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [{ type: 'paragraph', content: [] }]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p></p>');
		});
	});

	describe('HTML escaping', () => {
		it('should escape HTML in text nodes', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: '<script>alert("xss")</script>' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>');
		});

		it('should escape HTML in code blocks', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'codeBlock',
						content: [{ type: 'text', text: '<div>test</div>' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<pre><code>&lt;div&gt;test&lt;/div&gt;</code></pre>');
		});

		it('should escape HTML in code marks', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: '<script>',
								marks: [{ type: 'code' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><code>&lt;script&gt;</code></p>');
		});
	});

	describe('Edge cases', () => {
		it('should handle unknown node types gracefully', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'unknownNode',
						content: [{ type: 'text', text: 'Test' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('Test');
		});

		it('should handle heading without level attribute', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'heading',
						content: [{ type: 'text', text: 'Title' }]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<h1>Title</h1>');
		});

		it('should handle link mark', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Link',
								marks: [
									{
										type: 'link',
										attrs: { href: 'https://example.com' }
									}
								]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><a href="https://example.com">Link</a></p>');
		});

		it('should handle link mark with target', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'Link',
								marks: [
									{
										type: 'link',
										attrs: { href: 'https://example.com', target: '_blank' }
									}
								]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe('<p><a href="https://example.com" target="_blank">Link</a></p>');
		});

		it('should handle complex nested structure', () => {
			const doc: ProseMirrorDocument = {
				type: 'doc',
				content: [
					{
						type: 'heading',
						attrs: { level: 1 },
						content: [{ type: 'text', text: 'Title' }]
					},
					{
						type: 'paragraph',
						content: [
							{ type: 'text', text: 'Normal text ' },
							{
								type: 'text',
								text: 'bold',
								marks: [{ type: 'bold' }]
							},
							{ type: 'text', text: ' and ' },
							{
								type: 'text',
								text: 'italic',
								marks: [{ type: 'italic' }]
							}
						]
					},
					{
						type: 'blockquote',
						content: [
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Quote' }]
							}
						]
					}
				]
			};
			const result = prosemirrorToHtml(doc);
			expect(result).toBe(
				'<h1>Title</h1><p>Normal text <strong>bold</strong> and <em>italic</em></p><blockquote><p>Quote</p></blockquote>'
			);
		});
	});
});
