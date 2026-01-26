import { Dialog as DialogPrimitive } from 'bits-ui';

import Root from './drawer.svelte';
import Content from './drawer-content.svelte';
import Description from './drawer-description.svelte';
import Overlay from './drawer-overlay.svelte';
import Footer from './drawer-footer.svelte';
import Header from './drawer-header.svelte';
import Title from './drawer-title.svelte';
import NestedRoot from './drawer-nested.svelte';
import Close from './drawer-close.svelte';
import Trigger from './drawer-trigger.svelte';
import TriggerButton from './drawer-trigger-button.svelte';
import CloseButton from './drawer-close-button.svelte';

// Re-export context utilities for advanced use cases
export {
	getDrawerContext,
	hasDrawerContext,
	type DrawerContext,
	type DrawerDirection
} from './context.js';

// Use bits-ui Portal for Shadow DOM compatibility
const Portal: typeof DialogPrimitive.Portal = DialogPrimitive.Portal;

export {
	Root as Drawer,
	NestedRoot as DrawerNestedRoot,
	Content as DrawerContent,
	Description as DrawerDescription,
	Overlay as DrawerOverlay,
	Footer as DrawerFooter,
	Header as DrawerHeader,
	Title as DrawerTitle,
	Trigger as DrawerTrigger,
	Portal as DrawerPortal,
	Close as DrawerClose,
	TriggerButton as DrawerTriggerButton,
	CloseButton as DrawerCloseButton
};
