#!/usr/bin/env node
/* eslint-disable no-console */

// Wrapper script for ujl-validate CLI.
// This file always exists, even when dist/validate.js hasn't been built yet.
// It dynamically imports the actual CLI code, which executes on import.

try {
	await import("../dist/validate.js");
} catch (error) {
	console.error("ujl-validate: Could not load ../dist/validate.js");
	console.error("Please build @ujl-framework/types first:");
	console.error("  pnpm --filter @ujl-framework/types run build");
	console.error(error);
	process.exit(1);
}
