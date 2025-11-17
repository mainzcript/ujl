/**
 * Navigation tree node structure used for temporary visualization of document structure.
 * This type is shared between Editor and NavTreeMock components.
 */
export type NavNode = {
	name: string;
	key: string;
	pages: NavNode[];
};
