#!/usr/bin/env node
import { execSync } from "node:child_process";
import { getReleaseVersion, releasePackages, repoRoot } from "./release-config.mjs";

function classifyNpmError(stderr) {
	const authPatterns = ["ENEEDAUTH", "E401", "E403", "authentication", "login"];
	const networkPatterns = [
		"ENOTFOUND",
		"EAI_AGAIN",
		"ECONNREFUSED",
		"ECONNRESET",
		"ETIMEDOUT",
		"network request",
	];

	if (authPatterns.some((pattern) => stderr.includes(pattern))) {
		return "auth";
	}

	if (networkPatterns.some((pattern) => stderr.includes(pattern))) {
		return "network";
	}

	return "missing";
}

function npmViewVersion(pkg, version) {
	const cmd = `npm view ${pkg}@${version} version`;

	try {
		return {
			status: "ok",
			version: execSync(cmd, {
				cwd: repoRoot,
				stdio: ["ignore", "pipe", "pipe"],
			})
				.toString()
				.trim(),
		};
	} catch (error) {
		const stderr = error?.stderr?.toString() ?? "";
		return {
			status: classifyNpmError(stderr),
			stderr,
		};
	}
}

function main() {
	const version = getReleaseVersion();
	const missing = [];

	for (const releasePackage of releasePackages) {
		const result = npmViewVersion(releasePackage.name, version);

		if (result.status === "auth") {
			throw new Error("npm auth failed during publish verification. Please run npm login.");
		}

		if (result.status === "network") {
			throw new Error("npm registry could not be reached during publish verification.");
		}

		if (result.status !== "ok" || result.version !== version) {
			missing.push(releasePackage.name);
		}
	}

	if (missing.length > 0) {
		console.error(`Missing or mismatched packages for ${version}: ${missing.join(", ")}`);
		process.exit(1);
	}

	console.log(
		`All expected packages are published at ${version}: ${releasePackages.map((pkg) => pkg.name).join(", ")}`,
	);
}

try {
	main();
} catch (error) {
	console.error(error.message ?? error);
	process.exit(1);
}
