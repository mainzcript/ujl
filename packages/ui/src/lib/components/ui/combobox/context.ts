import { getContext, hasContext, setContext } from "svelte";

export const COMBOBOX_CONTEXT = Symbol("combobox");

export type ComboboxContext = {
	get value(): string;
	set value(newValue: string);
	get open(): boolean;
	set open(newOpen: boolean);
};

/**
 * Sets the combobox context for the current component tree.
 * @param config - Combobox context configuration
 * @returns The provided config
 */
export function setComboboxContext(config: ComboboxContext): ComboboxContext {
	setContext(COMBOBOX_CONTEXT, config);
	return config;
}

/**
 * Retrieves the combobox context from the current component tree.
 * @returns Combobox context if available, undefined otherwise
 */
export function getComboboxContext(): ComboboxContext | undefined {
	if (!hasContext(COMBOBOX_CONTEXT)) {
		return undefined;
	}
	return getContext<ComboboxContext>(COMBOBOX_CONTEXT);
}
