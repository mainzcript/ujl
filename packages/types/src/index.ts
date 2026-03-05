// Re-export from library.js (mix of types and values)
export { LibraryError } from "./library.js";
export type {
	AssetCredits,
	ImageMetadata,
	ImageMime,
	ImageSrcSet,
	ImageSrcSetObject,
	LibraryAsset,
	LibraryAssetImage,
	LibraryListResult,
	LibraryProvider,
	LibraryUploadOptions,
	PictureSource,
} from "./library.js";

// Re-export from prosemirror.js
export type { ProseMirrorDocument, ProseMirrorMark, ProseMirrorNode } from "./prosemirror.js";

// Re-export document types from ujl-content.ts
export type {
	ImageSource,
	ImageSrcSetType,
	LibraryAssetMeta,
	LibraryProviderConfig,
	UJLCDocument,
	UJLCDocumentMeta,
	UJLCFieldObject,
	UJLCLibrary,
	UJLCModuleMeta,
	UJLCModuleObject,
	UJLCObject,
	UJLCSlotObject,
} from "./ujl-content.js";

// Re-export validation functions
export {
	validateModule,
	validateSlot,
	validateUJLCDocument,
	validateUJLCDocumentSafe,
} from "./ujl-content.js";

// Re-export theme types and functions from ujl-theme.ts
export {
	colorShades,
	flavors,
	notificationFlavors,
	resolveColorFromShades,
	resolveForegroundColor,
	themeFlavors,
	typographyFlavors,
	validateTokenSet,
	validateUJLTDocument,
	validateUJLTDocumentSafe,
} from "./ujl-theme.js";
export type {
	ResolvedUJLTColorSet,
	UJLTAmbientColorSet,
	UJLTColorPalette,
	UJLTColorSet,
	UJLTColorShades,
	UJLTDocument,
	UJLTFlavor,
	UJLTFontWeight,
	UJLTMeta,
	UJLTNotificationFlavor,
	UJLTOklch,
	UJLTOriginalColor,
	UJLTShadeKey,
	UJLTShadeRef,
	UJLTStandardColorSet,
	UJLTThemeFlavor,
	UJLTTokenSet,
	UJLTTypography,
	UJLTTypographyBase,
	UJLTTypographyCode,
	UJLTTypographyFlavor,
	UJLTTypographyHeading,
	UJLTTypographyHighlight,
	UJLTTypographyLink,
	UJLTTypographyStyle,
} from "./ujl-theme.js";

// Re-export AST types
export type {
	UJLAbstractButtonNode,
	UJLAbstractCallToActionModuleNode,
	UJLAbstractCardNode,
	UJLAbstractContainerNode,
	UJLAbstractErrorNode,
	UJLAbstractGridItemNode,
	UJLAbstractGridNode,
	UJLAbstractImageNode,
	UJLAbstractNode,
	UJLAbstractNodeMeta,
	UJLAbstractRawHtmlNode,
	UJLAbstractTextNode,
	UJLAbstractWrapperNode,
	UJLAdapter,
} from "./ast.js";
