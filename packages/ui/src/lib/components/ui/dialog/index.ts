import { Dialog as DialogPrimitive } from "bits-ui";

import Body from "./dialog-body.svelte";
import CloseButton from "./dialog-close-button.svelte";
import Close from "./dialog-close.svelte";
import Content from "./dialog-content.svelte";
import Description from "./dialog-description.svelte";
import Footer from "./dialog-footer.svelte";
import Header from "./dialog-header.svelte";
import Overlay from "./dialog-overlay.svelte";
import Title from "./dialog-title.svelte";
import TriggerButton from "./dialog-trigger-button.svelte";
import Trigger from "./dialog-trigger.svelte";

const Root = DialogPrimitive.Root;
const Portal = DialogPrimitive.Portal;

export {
	Root as Dialog,
	Body as DialogBody,
	Close as DialogClose,
	CloseButton as DialogCloseButton,
	Content as DialogContent,
	Description as DialogDescription,
	Footer as DialogFooter,
	Header as DialogHeader,
	Overlay as DialogOverlay,
	Portal as DialogPortal,
	Title as DialogTitle,
	Trigger as DialogTrigger,
	TriggerButton as DialogTriggerButton,
};
