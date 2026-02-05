import type { ProseMirrorDocument, ProseMirrorMark, ProseMirrorNode } from "@ujl-framework/types";

/**
 * Converts a ProseMirror Document to HTML synchronously
 *
 * Implements a minimal serializer for UJL rich text extensions:
 * - Block nodes: doc, paragraph, heading (h1-h6), codeBlock, blockquote, horizontalRule
 * - List nodes: bulletList, orderedList, listItem
 * - Inline nodes: text, hardBreak
 * - Marks: bold, italic, code
 *
 * This is SSR-safe and requires no browser APIs.
 * The schema matches ujlRichTextExtensions to ensure consistency.
 *
 * @param doc - ProseMirror Document to serialize
 * @returns HTML string representation
 */
export function prosemirrorToHtml(doc: ProseMirrorDocument): string {
	if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
		return "";
	}

	return serializeNodes(doc.content);
}

function serializeNodes(nodes: ProseMirrorNode[]): string {
	return nodes.map((node) => serializeNode(node)).join("");
}

function serializeNode(node: ProseMirrorNode): string {
	const { type, content, text, marks = [] } = node;

	// Text node
	if (type === "text" && text !== undefined) {
		const escapedText = escapeHtml(text);
		return applyMarks(escapedText, marks);
	}

	// Hard break
	if (type === "hardBreak") {
		return "<br>";
	}

	// Block nodes
	let html = "";
	if (content) {
		html = serializeNodes(content);
	}

	// Apply marks to block content if needed
	const wrapped = applyMarks(html, marks);

	switch (type) {
		case "paragraph":
			return `<p>${wrapped}</p>`;
		case "heading": {
			const level = node.attrs?.level || 1;
			return `<h${level}>${wrapped}</h${level}>`;
		}
		case "codeBlock": {
			// For code blocks, extract raw text content (don't serialize as HTML)
			const codeText = extractTextContent(node);
			return `<pre><code>${escapeHtml(codeText)}</code></pre>`;
		}
		case "blockquote":
			return `<blockquote>${wrapped}</blockquote>`;
		case "horizontalRule":
			return "<hr>";
		case "bulletList":
			return `<ul>${wrapped}</ul>`;
		case "orderedList":
			return `<ol>${wrapped}</ol>`;
		case "listItem":
			return `<li>${wrapped}</li>`;
		default:
			// Unknown node type - return content without wrapper
			return wrapped;
	}
}

function applyMarks(content: string, marks: ProseMirrorMark[]): string {
	if (!marks || marks.length === 0) return content;

	let result = content;
	// Apply marks in reverse order (outermost first)
	for (let i = marks.length - 1; i >= 0; i--) {
		const mark = marks[i];
		switch (mark.type) {
			case "bold":
				result = `<strong>${result}</strong>`;
				break;
			case "italic":
				result = `<em>${result}</em>`;
				break;
			case "code":
				// Content is already escaped from text node, no need to escape again
				result = `<code>${result}</code>`;
				break;
			case "link": {
				const href = mark.attrs?.href || "#";
				const target = mark.attrs?.target
					? ` target="${escapeHtml(mark.attrs.target as string)}"`
					: "";
				result = `<a href="${escapeHtml(href as string)}"${target}>${result}</a>`;
				break;
			}
		}
	}
	return result;
}

function extractTextContent(node: ProseMirrorNode): string {
	if (node.text !== undefined) {
		return node.text;
	}
	if (node.content) {
		return node.content.map(extractTextContent).join("");
	}
	return "";
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
