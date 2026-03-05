import type { UJLCLibrary } from "@ujl-framework/types";

export type AutofillImageFieldParams = {
	moduleType: string;
	fieldName: string;
	newValue: unknown;
	currentFields: Record<string, unknown>;
	library: UJLCLibrary;
};

function isBlankString(value: unknown): boolean {
	return typeof value === "string" && value.trim().length === 0;
}

function isEmptyAltValue(value: unknown): boolean {
	return value === null || value === undefined || isBlankString(value);
}

function normalizeImageId(value: unknown): string | null {
	if (typeof value === "string") {
		return value.length > 0 ? value : null;
	}
	if (typeof value === "number") {
		return String(value);
	}
	return null;
}

/**
 * Builds field updates for image-module image selection with optional alt autofill.
 * Autofill is applied only when the module alt value is empty and the selected
 * asset provides non-empty alt metadata.
 */
export function buildImageFieldUpdatesWithAutofill({
	moduleType,
	fieldName,
	newValue,
	currentFields,
	library,
}: AutofillImageFieldParams): Record<string, unknown> {
	const updates: Record<string, unknown> = { [fieldName]: newValue };

	if (moduleType !== "image" || fieldName !== "image") {
		return updates;
	}

	if (!isEmptyAltValue(currentFields.alt)) {
		return updates;
	}

	const imageId = normalizeImageId(newValue);
	if (!imageId) {
		return updates;
	}

	const assetAlt = library[imageId]?.meta?.alt;
	if (!assetAlt || isBlankString(assetAlt)) {
		return updates;
	}

	updates.alt = assetAlt;
	return updates;
}
