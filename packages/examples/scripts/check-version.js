#!/usr/bin/env node
/**
 * Check that all example UJLC/UJLT files have _version matching package.json
 * Exits with code 1 if any mismatch found (for CI/validation)
 */

import { readFileSync, readdirSync } from "fs";
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

console.log(`Checking version: ${expectedVersion}\n`);

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

let mismatchCount = 0;
let errorCount = 0;
let okCount = 0;

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
				console.warn(`WARN ${filePath}: missing ujlc.meta or ujlt.meta structure`);
				errorCount++;
				continue;
			}

			// Check if _version field exists
			if (!("_version" in metaObj)) {
				console.warn(`WARN ${filePath}: missing _version field at ${versionPath}`);
				errorCount++;
				continue;
			}

			if (metaObj._version !== expectedVersion) {
				console.error(`ERROR ${filePath}: version mismatch`);
				console.error(`  Expected: ${expectedVersion}`);
				console.error(`  Got:      ${metaObj._version}`);
				mismatchCount++;
			} else {
				console.log(`OK ${filePath}: OK`);
				okCount++;
			}
		} catch (err) {
			console.error(`ERROR reading ${filePath}: ${err.message}`);
			errorCount++;
		}
	}

	console.log("\n----------------------------------------");
	if (mismatchCount === 0 && errorCount === 0) {
		console.log(`All ${okCount} file(s) are synchronized.`);
		process.exit(0);
	} else {
		console.log(`Results: ${okCount} OK, ${mismatchCount} mismatched, ${errorCount} errors`);
		if (mismatchCount > 0) {
			console.log("\nRun 'pnpm run version:sync' to fix version mismatches.");
		}
		process.exit(1);
	}
} catch (err) {
	console.error(`Error: ${err.message}`);
	process.exit(1);
}
