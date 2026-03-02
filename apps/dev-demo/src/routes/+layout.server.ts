import { env } from "$env/dynamic/private";

type LibraryStorage = "inline" | "backend";

interface LibraryData {
	libraryStorage: LibraryStorage;
	libraryUrl: string | null;
	libraryError: string | null;
}

const LIBRARY_STORAGE = env.LIBRARY_STORAGE ?? "inline";
const LIBRARY_URL = env.LIBRARY_URL;

function createLibraryData(
	storage: LibraryStorage,
	url: string | null,
	error: string | null,
): LibraryData {
	return { libraryStorage: storage, libraryUrl: url, libraryError: error };
}

export function load(): LibraryData {
	if (LIBRARY_STORAGE === "backend") {
		if (!LIBRARY_URL) {
			return createLibraryData(
				"inline",
				null,
				"Backend mode requires LIBRARY_URL. Please configure it in your .env file.",
			);
		}
		return createLibraryData("backend", LIBRARY_URL, null);
	}
	return createLibraryData("inline", null, null);
}
