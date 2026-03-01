#!/usr/bin/env node
/**
 * Sync version from package.json to all example UJLC/UJLT files
 * Sets ujlc.meta._version or ujlt.meta._version to match package.json version
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const packageJsonPath = join(__dirname, "..", "package.json");
const srcDir = join(__dirname, "..", "src");

// Read expected version from package.json
let expectedVersion;
try {
	const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	expectedVersion = pkg.version;
	if (!expectedVersion) {
		console.error("Error: package.json does not contain a version field");
		process.exit(1);
	}
} catch (err) {
	console.error(`Error reading package.json: ${err.message}`);
	process.exit(1);
}

console.log(`Syncing version: ${expectedVersion}`);

// Recursively find all .ujlc.json and .ujlt.json files
function findJsonFiles(dir, files = []) {
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			findJsonFiles(fullPath, files);
		} else if (entry.isFile()) {
			if (entry.name.endsWith(".ujlc.json") || entry.name.endsWith(".ujlt.json")) {
				files.push(fullPath);
			}
		}
	}
	return files;
}

let changedCount = 0;
let errorCount = 0;

try {
	const jsonFiles = findJsonFiles(srcDir);

	if (jsonFiles.length === 0) {
		console.log("No .ujlc.json or .ujlt.json files found in src/");
		process.exit(0);
	}

	for (const filePath of jsonFiles) {
		try {
			const content = readFileSync(filePath, "utf-8");
			const data = JSON.parse(content);

			// Determine root key and path to _version
			let versionPath;
			let metaObj;
			if (data.ujlc && data.ujlc.meta) {
				metaObj = data.ujlc.meta;
				versionPath = "ujlc.meta._version";
			} else if (data.ujlt && data.ujlt.meta) {
				metaObj = data.ujlt.meta;
				versionPath = "ujlt.meta._version";
			} else {
				console.warn(`Warning: ${filePath} has no ujlc.meta or ujlt.meta structure, skipping`);
				continue;
			}

			// Check if _version field exists (we require it)
			if (!("_version" in metaObj)) {
				console.warn(`Warning: ${filePath} is missing _version field at ${versionPath}, skipping`);
				continue;
			}

			// Only write if version actually changed
			if (metaObj._version !== expectedVersion) {
				metaObj._version = expectedVersion;
				// Write back with tabs for indentation (matches existing files)
				const json = JSON.stringify(data, null, "\t");
				writeFileSync(filePath, `${json}\n`);
				console.log(`  Updated: ${filePath} (${versionPath})`);
				changedCount++;
			} else {
				console.log(`  OK: ${filePath}`);
			}
		} catch (err) {
			console.error(`Error processing ${filePath}: ${err.message}`);
			errorCount++;
		}
	}

	if (errorCount > 0) {
		console.error(`\nCompleted with ${errorCount} error(s)`);
		process.exit(1);
	}

	console.log(`\nSynced ${changedCount} file(s) to version ${expectedVersion}`);
} catch (err) {
	console.error(`Error: ${err.message}`);
	process.exit(1);
}
