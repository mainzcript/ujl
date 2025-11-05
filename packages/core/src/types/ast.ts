import type { UJLTTokenSet } from "./ujl-theme.js";

type UJLAbstractWrapperNode = {
	type: "wrapper";
	props: {
		children?: UJLAbstractNode[];
	};
};

type UJLAbstractRawHtmlNode = {
	type: "raw-html";
	props: {
		content: string;
	};
};

type UJLAbstractErrorNode = {
	type: "error";
	props: {
		message: string;
	};
};

type UJLAbstractContainerNode = {
	type: "container";
	props: {
		children?: UJLAbstractNode[];
	};
};

type UJLAbstractCardNode = {
	type: "card";
	props: {
		title: string;
		description: string;
		children?: UJLAbstractNode[];
	};
};

type UJLAbstractTextNode = {
	type: "text";
	props: {
		content: string;
	};
};

type UJLAbstractButtonNode = {
	type: "button";
	props: {
		label: string;
		href: string;
	};
};

type UJLAbstractGridNode = {
	type: "grid";
	props: {
		children?: UJLAbstractGridItemNode[];
	};
};

type UJLAbstractGridItemNode = {
	type: "grid-item";
	props: {
		children?: UJLAbstractNode[];
	};
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
