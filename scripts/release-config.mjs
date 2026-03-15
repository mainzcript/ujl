import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(scriptDir, "..");
export const corePackageJsonPath = resolve(repoRoot, "packages/core/package.json");

export const releasePackages = [
	{ name: "@ujl-framework/types", validation: "prepack" },
	{ name: "@ujl-framework/core", validation: "prepack" },
	{ name: "@ujl-framework/ui", validation: "prepack" },
	{ name: "@ujl-framework/adapter-svelte", validation: "prepack" },
	{ name: "@ujl-framework/adapter-web", validation: "prepack" },
	{ name: "@ujl-framework/crafter", validation: "prepack" },
	{ name: "@ujl-framework/examples", validation: "pack" },
];

export function getReleaseVersion() {
	const raw = readFileSync(corePackageJsonPath, "utf8");
	const parsed = JSON.parse(raw);

	if (!parsed.version) {
		throw new Error(`No version field in ${corePackageJsonPath}`);
	}

	return parsed.version;
}
