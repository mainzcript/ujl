import type { ImageSource } from "./image.js";
import type { ProseMirrorDocument } from "./prosemirror.js";
import type { UJLTTokenSet } from "./ujl-theme.js";

/**
 * Metadata for AST nodes
 * Contains optional module ID indicating which module a node belongs to
 */
export type UJLAbstractNodeMeta = {
	/**
	 * Module ID from the UJLC document
	 * Set for all AST nodes (except root wrapper) to indicate which module they belong to.
	 */
	moduleId?: string;
	/**
	 * Indicates if this node is the root node of a module (editable).
	 * Only true for nodes that directly represent a module from the UJLC document.
	 * Child nodes and layout wrappers have this set to false or undefined.
	 */
	isModuleRoot?: boolean;
};

type UJLAbstractWrapperNode = {
	type: "wrapper";
	props: {
		children?: UJLAbstractNode[];
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractRawHtmlNode = {
	type: "raw-html";
	props: {
		content: string;
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractErrorNode = {
	type: "error";
	props: {
		message: string;
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractContainerNode = {
	type: "container";
	props: {
		children?: UJLAbstractNode[];
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractCardNode = {
	type: "card";
	props: {
		title: string;
		description: ProseMirrorDocument;
		children?: UJLAbstractNode[];
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractTextNode = {
	type: "text";
	props: {
		content: ProseMirrorDocument;
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractButtonNode = {
	type: "button";
	props: {
		label: string;
		href: string;
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractGridNode = {
	type: "grid";
	props: {
		children?: UJLAbstractGridItemNode[];
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractGridItemNode = {
	type: "grid-item";
	props: {
		children?: UJLAbstractNode[];
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractCallToActionModuleNode = {
	type: "call-to-action";
	props: {
		headline: string;
		description: ProseMirrorDocument;
		actionButtons: {
			primary: UJLAbstractButtonNode;
			secondary?: UJLAbstractButtonNode;
		};
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

type UJLAbstractImageNode = {
	type: "image";
	props: {
		image: ImageSource | null; // null when no image is selected (shows placeholder)
		alt: string; // From module field
	};
	id: string;
	meta?: UJLAbstractNodeMeta;
};

/**
 * Abstract Syntax Tree node types for UJL
 *
 * These types represent the structure of composed UJL documents.
 * Each node type has specific properties and can contain children.
 */
export type UJLAbstractNode =
	| UJLAbstractRawHtmlNode
	| UJLAbstractWrapperNode
	| UJLAbstractErrorNode
	| UJLAbstractContainerNode
	| UJLAbstractCardNode
	| UJLAbstractTextNode
	| UJLAbstractButtonNode
	| UJLAbstractGridNode
	| UJLAbstractGridItemNode
	| UJLAbstractCallToActionModuleNode
	| UJLAbstractImageNode;

// Export individual node types for more specific typing
export type {
	UJLAbstractButtonNode,
	UJLAbstractCallToActionModuleNode,
	UJLAbstractCardNode,
	UJLAbstractContainerNode,
	UJLAbstractErrorNode,
	UJLAbstractGridItemNode,
	UJLAbstractGridNode,
	UJLAbstractImageNode,
	UJLAbstractRawHtmlNode,
	UJLAbstractTextNode,
	UJLAbstractWrapperNode,
};

/**
 * Adapter function type for converting AST nodes to output formats
 *
 * @template OutputType - The output type (default: string)
 * @template OptionsType - The options type for adapter-specific configuration (default: undefined)
 */
export type UJLAdapter<OutputType = string, OptionsType = undefined> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: OptionsType,
) => OutputType;
