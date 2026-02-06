import { Dialog as DialogPrimitive } from "bits-ui";

import CloseButton from "./drawer-close-button.svelte";
import Close from "./drawer-close.svelte";
import Content from "./drawer-content.svelte";
import Description from "./drawer-description.svelte";
import Footer from "./drawer-footer.svelte";
import Header from "./drawer-header.svelte";
import NestedRoot from "./drawer-nested.svelte";
import Overlay from "./drawer-overlay.svelte";
import Title from "./drawer-title.svelte";
import TriggerButton from "./drawer-trigger-button.svelte";
import Trigger from "./drawer-trigger.svelte";
import Root from "./drawer.svelte";

// Re-export context utilities for advanced use cases
export {
	getDrawerContext,
	hasDrawerContext,
	type DrawerContext,
	type DrawerDirection,
} from "./context.js";

// Use bits-ui Portal for Shadow DOM compatibility
const Portal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal;

export {
	Root as Drawer,
	Close as DrawerClose,
	CloseButton as DrawerCloseButton,
	Content as DrawerContent,
	Description as DrawerDescription,
	Footer as DrawerFooter,
	Header as DrawerHeader,
	NestedRoot as DrawerNestedRoot,
	Overlay as DrawerOverlay,
	Portal as DrawerPortal,
	Title as DrawerTitle,
	Trigger as DrawerTrigger,
	TriggerButton as DrawerTriggerButton,
};
