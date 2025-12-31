/**
 * ProseMirror Document Node
 * Represents a single node in the ProseMirror document tree
 */
export type ProseMirrorNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: ProseMirrorMark[];
	text?: string;
};

/**
 * ProseMirror Mark
 * Represents formatting marks (bold, italic, etc.)
 */
export type ProseMirrorMark = {
	type: string;
	attrs?: Record<string, unknown>;
};

/**
 * ProseMirror Document
 * Root document structure used by TipTap/ProseMirror
 */
export type ProseMirrorDocument = {
	type: "doc";
	content: ProseMirrorNode[];
};
