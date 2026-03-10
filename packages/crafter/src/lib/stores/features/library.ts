import type { LibraryAsset, LibraryProvider, UJLCLibrary } from "@ujl-framework/types";
import { LibraryError } from "@ujl-framework/types";

export interface LibraryFeatureState {
	libraryItems: Array<{ id: string } & LibraryAsset>;
	libraryCursor: string | undefined;
	libraryHasMore: boolean;
	libraryLoading: boolean;
	providerInitialized: boolean;
}

interface LibraryFeatureDeps {
	libraryProvider: LibraryProvider;
	state: LibraryFeatureState;
	getLibraryData: () => UJLCLibrary;
	updateLibrary: (fn: (library: UJLCLibrary) => UJLCLibrary) => void;
	mergeLibraryItemsById: (
		existing: Array<{ id: string } & LibraryAsset>,
		incoming: Array<{ id: string } & LibraryAsset>,
	) => Array<{ id: string } & LibraryAsset>;
}

export function createLibraryFeature(deps: LibraryFeatureDeps) {
	const { libraryProvider, state, getLibraryData, updateLibrary, mergeLibraryItemsById } = deps;

	async function initLibraryProvider(): Promise<void> {
		if (state.providerInitialized || !libraryProvider.init) return;
		await libraryProvider.init();
		state.providerInitialized = true;
	}

	async function loadMoreLibraryItems(limit = 50): Promise<void> {
		if (state.libraryLoading || !state.libraryHasMore) return;

		await initLibraryProvider();
		state.libraryLoading = true;

		try {
			const result = await libraryProvider.list(getLibraryData(), {
				limit,
				cursor: state.libraryCursor,
			});

			state.libraryItems = mergeLibraryItemsById(state.libraryItems, result.items);
			state.libraryCursor = result.nextCursor;
			state.libraryHasMore = result.hasMore;
		} finally {
			state.libraryLoading = false;
		}
	}

	async function searchLibraryItems(query: string, limit = 50): Promise<void> {
		state.libraryItems = [];
		state.libraryCursor = undefined;
		state.libraryHasMore = true;

		await initLibraryProvider();
		state.libraryLoading = true;

		try {
			const result = await libraryProvider.list(getLibraryData(), {
				limit,
				search: query,
			});

			state.libraryItems = mergeLibraryItemsById([], result.items);
			state.libraryCursor = result.nextCursor;
			state.libraryHasMore = result.hasMore;
		} finally {
			state.libraryLoading = false;
		}
	}

	async function getLibraryAsset(id: string): Promise<LibraryAsset | null> {
		await initLibraryProvider();
		return libraryProvider.get(getLibraryData(), id);
	}

	async function uploadLibraryAsset(file: File): Promise<{ id: string } & LibraryAsset> {
		if (!libraryProvider.upload) {
			throw new LibraryError("Upload not supported", "NOT_SUPPORTED");
		}

		await initLibraryProvider();
		const buffer = await file.arrayBuffer();
		const asset = await libraryProvider.upload(buffer, {
			filename: file.name,
			type: file.type,
		});

		const id = crypto.randomUUID();
		updateLibrary((lib) => ({ ...lib, [id]: asset }));

		const assetWithId = { id, ...asset };
		state.libraryItems = mergeLibraryItemsById([assetWithId], state.libraryItems);

		return assetWithId;
	}

	async function deleteLibraryAsset(id: string): Promise<void> {
		await initLibraryProvider();

		if (!libraryProvider.delete) {
			throw new LibraryError("Delete not supported by this provider", "NOT_SUPPORTED");
		}

		await libraryProvider.delete(id);

		updateLibrary((lib) => {
			const { [id]: _, ...rest } = lib;
			return rest;
		});

		state.libraryItems = state.libraryItems.filter((item) => item.id !== id);
	}

	async function updateLibraryMetadata(
		id: string,
		metadata: Record<string, unknown>,
	): Promise<void> {
		await initLibraryProvider();

		if (!libraryProvider.updateMetadata) {
			throw new LibraryError("Metadata update not supported", "NOT_SUPPORTED");
		}

		const updated = await libraryProvider.updateMetadata(getLibraryData(), id, metadata);

		updateLibrary((lib) => ({ ...lib, [id]: updated }));

		const index = state.libraryItems.findIndex((item) => item.id === id);
		if (index !== -1) {
			state.libraryItems[index] = { id, ...updated };
		}
	}

	async function selectLibraryAsset(id: string): Promise<string> {
		const libraryData = getLibraryData();
		if (libraryData[id]) {
			return id;
		}

		const asset = state.libraryItems.find((item) => item.id === id);
		if (!asset) {
			throw new LibraryError(`Asset ${id} not found in library items`, "NOT_FOUND");
		}

		const { id: _, ...assetData } = asset;
		updateLibrary((lib) => ({ ...lib, [id]: assetData }));

		return id;
	}

	function canUploadLibrary(): boolean {
		return !!libraryProvider.upload;
	}

	function canDeleteLibrary(): boolean {
		return !!libraryProvider.delete;
	}

	function canUpdateLibraryMetadata(): boolean {
		return !!libraryProvider.updateMetadata;
	}

	return {
		loadMoreLibraryItems,
		searchLibraryItems,
		getLibraryAsset,
		uploadLibraryAsset,
		deleteLibraryAsset,
		updateLibraryMetadata,
		selectLibraryAsset,
		canUploadLibrary,
		canDeleteLibrary,
		canUpdateLibraryMetadata,
	};
}
