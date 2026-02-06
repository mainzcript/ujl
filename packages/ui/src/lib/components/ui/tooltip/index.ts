import { Tooltip as TooltipPrimitive } from "bits-ui";
import Content from "./tooltip-content.svelte";
import Trigger from "./tooltip-trigger.svelte";

const Root = TooltipPrimitive.Root;
const Provider = TooltipPrimitive.Provider;
const Portal = TooltipPrimitive.Portal;

export {
	Root as Tooltip,
	Content as TooltipContent,
	Portal as TooltipPortal,
	Provider as TooltipProvider,
	Trigger as TooltipTrigger,
};
