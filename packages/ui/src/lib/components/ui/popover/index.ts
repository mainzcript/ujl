import { Popover as PopoverPrimitive } from 'bits-ui';
import Content from './popover-content.svelte';
import Trigger from './popover-trigger.svelte';
import TriggerButton from './popover-trigger-button.svelte';
const Root = PopoverPrimitive.Root;
const Close = PopoverPrimitive.Close;

export {
	Root as Popover,
	Content as PopoverContent,
	Trigger as PopoverTrigger,
	Close as PopoverClose,
	TriggerButton as PopoverTriggerButton
};
