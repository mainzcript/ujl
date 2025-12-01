import type { UJLTTokenSet } from "./ujl-theme.js";

type UJLAbstractWrapperNode = {
	type: "wrapper";
	props: {
		children?: UJLAbstractNode[];
	};
	id?: string;
};

type UJLAbstractRawHtmlNode = {
	type: "raw-html";
	props: {
		content: string;
	};
	id?: string;
};

type UJLAbstractErrorNode = {
	type: "error";
	props: {
		message: string;
	};
	id?: string;
};

type UJLAbstractContainerNode = {
	type: "container";
	props: {
		children?: UJLAbstractNode[];
	};
	id?: string;
};

type UJLAbstractCardNode = {
	type: "card";
	props: {
		title: string;
		description: string;
		children?: UJLAbstractNode[];
	};
	id?: string;
};

type UJLAbstractTextNode = {
	type: "text";
	props: {
		content: string;
	};
	id?: string;
};

type UJLAbstractButtonNode = {
	type: "button";
	props: {
		label: string;
		href: string;
	};
	id?: string;
};

type UJLAbstractGridNode = {
	type: "grid";
	props: {
		children?: UJLAbstractGridItemNode[];
	};
	id?: string;
};

type UJLAbstractGridItemNode = {
	type: "grid-item";
	props: {
		children?: UJLAbstractNode[];
	};
	id?: string;
};

type UJLAbstractCallToActionModuleNode = {
	type: "call-to-action";
	props: {
		headline: string;
		description: string;
		actionButtons: {
			primary: UJLAbstractButtonNode;
			secondary?: UJLAbstractButtonNode;
		};
	};
	id?: string;
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
	| UJLAbstractCallToActionModuleNode;

// Export individual node types for more specific typing
export type {
	UJLAbstractButtonNode,
	UJLAbstractCallToActionModuleNode,
	UJLAbstractCardNode,
	UJLAbstractContainerNode,
	UJLAbstractErrorNode,
	UJLAbstractGridItemNode,
	UJLAbstractGridNode,
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
	options: OptionsType
) => OutputType;
