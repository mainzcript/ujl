import { Dialog as SheetPrimitive } from 'bits-ui';
import Trigger from './sheet-trigger.svelte';
import Close from './sheet-close.svelte';
import Overlay from './sheet-overlay.svelte';
import Content from './sheet-content.svelte';
import Header from './sheet-header.svelte';
import Body from './sheet-body.svelte';
import Footer from './sheet-footer.svelte';
import Title from './sheet-title.svelte';
import Description from './sheet-description.svelte';
import TriggerButton from './sheet-trigger-button.svelte';
import CloseButton from './sheet-close-button.svelte';

const Root = SheetPrimitive.Root;
const Portal = SheetPrimitive.Portal;

export {
	Root as Sheet,
	Close as SheetClose,
	Trigger as SheetTrigger,
	Portal as SheetPortal,
	Overlay as SheetOverlay,
	Content as SheetContent,
	Header as SheetHeader,
	Body as SheetBody,
	Footer as SheetFooter,
	Title as SheetTitle,
	Description as SheetDescription,
	TriggerButton as SheetTriggerButton,
	CloseButton as SheetCloseButton
};
