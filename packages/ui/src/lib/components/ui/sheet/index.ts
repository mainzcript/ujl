import { Dialog as SheetPrimitive } from "bits-ui";
import Body from "./sheet-body.svelte";
import CloseButton from "./sheet-close-button.svelte";
import Close from "./sheet-close.svelte";
import Content from "./sheet-content.svelte";
import Description from "./sheet-description.svelte";
import Footer from "./sheet-footer.svelte";
import Header from "./sheet-header.svelte";
import Overlay from "./sheet-overlay.svelte";
import Title from "./sheet-title.svelte";
import TriggerButton from "./sheet-trigger-button.svelte";
import Trigger from "./sheet-trigger.svelte";

const Root = SheetPrimitive.Root;
const Portal = SheetPrimitive.Portal;

export {
	Root as Sheet,
	Body as SheetBody,
	Close as SheetClose,
	CloseButton as SheetCloseButton,
	Content as SheetContent,
	Description as SheetDescription,
	Footer as SheetFooter,
	Header as SheetHeader,
	Overlay as SheetOverlay,
	Portal as SheetPortal,
	Title as SheetTitle,
	Trigger as SheetTrigger,
	TriggerButton as SheetTriggerButton,
};
