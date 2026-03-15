#!/usr/bin/env node
import { execFileSync } from "node:child_process";

import { getReleaseVersion, releasePackages, repoRoot } from "./release-config.mjs";

function runPnpm(args, label) {
	console.log(`> ${label}`);
	try {
		execFileSync("pnpm", args, { cwd: repoRoot, stdio: "inherit" });
	} catch (error) {
		const command = ["pnpm", ...args].join(" ");
		throw new Error(`${label} failed while running \`${command}\`.`);
	}
}

function main() {
	const version = getReleaseVersion();
	console.log(`Running release preflight for ${version}`);

	runPnpm(["run", "rtc"], "Repository quality gate");

	for (const releasePackage of releasePackages) {
		runPnpm(
			["--filter", releasePackage.name, releasePackage.validation],
			`${releasePackage.name} ${releasePackage.validation}`,
		);
	}

	console.log(`Release preflight passed for ${version}`);
}

try {
	main();
} catch (error) {
	console.error(error.message ?? error);
	process.exit(1);
}
