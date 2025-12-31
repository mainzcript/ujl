#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * CLI validation tool for UJL documents
 *
 * Note: Emojis are used in console output for improved CLI UX and visual feedback.
 * This is an exception to the general "no emojis" rule, as CLI tools benefit from
 * visual indicators (✅, ❌, 🔍, etc.) for better user experience.
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
	validateUJLCDocumentSafe,
	type UJLCDocument,
	type UJLCModuleObject,
} from "./ujl-content.js";
import {
	resolveColorFromShades,
	resolveForegroundColor,
	validateUJLTDocumentSafe,
	type UJLTDocument,
} from "./ujl-theme.js";

// Parse CLI arguments
const filePath = process.argv[2];

if (!filePath) {
	console.error("❌ Error: No file path provided!\n");
	console.log("Usage: pnpm run validate <file.json>");
	console.log("       pnpm run validate ./themes/default.ujlt.json");
	console.log("       pnpm run validate ./content/showcase.ujlc.json");
	process.exit(1);
}

// Resolve path
const absolutePath = resolve(filePath);

if (!existsSync(absolutePath)) {
	console.error(`❌ Error: File not found: ${absolutePath}`);
	process.exit(1);
}

// Load file
let data: unknown;
try {
	const fileContent = readFileSync(absolutePath, "utf-8");
	data = JSON.parse(fileContent);
} catch (error) {
	console.error(`❌ Error loading/parsing file:`);
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}

console.log(`🔍 Validating: ${filePath}\n`);

// Auto-detect type
function detectType(data: unknown, filePath: string): "ujlt" | "ujlc" | "unknown" {
	// get type from file extension
	let typeFromExtension: "ujlt" | "ujlc" | null = null;

	if (filePath.endsWith(".ujlt.json")) {
		typeFromExtension = "ujlt";
	} else if (filePath.endsWith(".ujlc.json")) {
		typeFromExtension = "ujlc";
	}

	// get type from content
	let typeFromContent: "ujlt" | "ujlc" | "unknown" = "unknown";

	if (typeof data === "object" && data !== null) {
		if ("ujlt" in data) {
			typeFromContent = "ujlt";
		} else if ("ujlc" in data) {
			typeFromContent = "ujlc";
		}
	}

	// Check for mismatch
	if (typeFromExtension && typeFromContent !== "unknown") {
		if (typeFromExtension !== typeFromContent) {
			console.error("❌ File extension and content mismatch!");
			console.error(`   Extension suggests: ${typeFromExtension}`);
			console.error(`   Content contains: ${typeFromContent}`);
			process.exit(1);
		}
	}

	// Return type from extension if available
	if (typeFromExtension) {
		return typeFromExtension;
	}

	// fallback to content type
	return typeFromContent;
}

const fileType = detectType(data, filePath);

if (fileType === "unknown") {
	console.error("❌ Unknown file format!");
	console.error('   Expected an object with "ujlt" or "ujlc" property.');
	process.exit(1);
}

// Validate based on type
if (fileType === "ujlt") {
	validateTheme(data);
} else if (fileType === "ujlc") {
	validateContent(data);
}

// ============================================
// THEME VALIDATION
// ============================================

function validateTheme(data: unknown) {
	console.log("📦 Type: UJLT Theme\n");

	const result = validateUJLTDocumentSafe(data);

	if (result.success) {
		console.log("✅ Theme is VALID!\n");

		const theme: UJLTDocument = result.data;

		console.log("📊 Theme Details:");
		console.log(`   Version: ${theme.ujlt.meta._version}`);
		console.log(`   Radius: ${theme.ujlt.tokens.radius}`);
		const primaryLight = resolveColorFromShades(
			theme.ujlt.tokens.color.primary.shades,
			theme.ujlt.tokens.color.primary.light
		);
		console.log(
			`   Primary Light: l=${primaryLight.l.toFixed(3)}, c=${primaryLight.c.toFixed(3)}, h=${primaryLight.h.toFixed(3)}`
		);

		console.log("\n🎨 Available Colors:");
		Object.keys(theme.ujlt.tokens.color).forEach(flavor => {
			console.log(`   - ${flavor}`);
		});

		// Check for special cases
		console.log("\n🔍 Validation Checks:");
		let warnings = 0;

		Object.entries(theme.ujlt.tokens.color).forEach(([flavorKey, colorSet]) => {
			// Check if light/dark contrast is sufficient for the default
			// foreground on the same background flavor (ambient on ambient,
			// primary on primary, etc.) in light mode.
			const flavor = flavorKey as keyof typeof theme.ujlt.tokens.color;
			const bgLight = resolveColorFromShades(colorSet.shades, colorSet.light);
			const fgLight = resolveForegroundColor(theme.ujlt.tokens.color, flavor, flavor, "light");
			const contrast = Math.abs(bgLight.l - fgLight.l);

			if (contrast < 0.3) {
				console.log(
					`   ⚠️  ${flavorKey}: Low contrast (${contrast.toFixed(2)}) between light and lightForeground`
				);
				warnings++;
			}
		});

		if (warnings === 0) {
			console.log("   ✓ All color contrasts OK");
		}

		process.exit(0);
	} else {
		console.log("❌ Theme is INVALID!\n");
		console.log("🐛 Error Details:\n");

		result.error.issues.forEach((issue, index) => {
			console.log(`Error ${index + 1}:`);
			console.log(`   Path: ${issue.path.join(" → ")}`);
			console.log(`   Issue: ${issue.message}`);
			console.log(`   Code: ${issue.code}`);
			console.log("");
		});

		process.exit(1);
	}
}

// ============================================
// CONTENT VALIDATION
// ============================================

function validateContent(data: unknown) {
	console.log("📄 Type: UJLC Content Document\n");

	const result = validateUJLCDocumentSafe(data);

	if (result.success) {
		console.log("✅ Content Document is VALID!\n");

		const doc: UJLCDocument = result.data;

		console.log("📄 Document Details:");
		console.log(`   Title: ${doc.ujlc.meta.title}`);
		console.log(
			`   Description: ${doc.ujlc.meta.description.substring(0, 60)}${doc.ujlc.meta.description.length > 60 ? "..." : ""}`
		);
		console.log(`   Version: ${doc.ujlc.meta._version}`);
		console.log(`   Tags: ${doc.ujlc.meta.tags.join(", ")}`);
		console.log(`   Last Updated: ${doc.ujlc.meta.updated_at}`);

		// Count modules
		let moduleCount = 0;
		const moduleTypes = new Map<string, number>();
		const uniqueIds = new Set<string>();
		let maxDepth = 0;

		function analyzeModules(modules: UJLCModuleObject[], depth: number = 1) {
			maxDepth = Math.max(maxDepth, depth);

			modules.forEach(module => {
				moduleCount++;
				uniqueIds.add(module.meta.id);

				const count = moduleTypes.get(module.type) || 0;
				moduleTypes.set(module.type, count + 1);

				// Recursively traverse slots
				Object.values(module.slots).forEach(slot => {
					analyzeModules(slot, depth + 1);
				});
			});
		}

		analyzeModules(doc.ujlc.root);

		console.log("\n📊 Content Statistics:");
		console.log(`   Total Modules: ${moduleCount}`);
		console.log(`   Root Modules: ${doc.ujlc.root.length}`);
		console.log(`   Max Nesting Depth: ${maxDepth}`);
		console.log(`   Unique Module IDs: ${uniqueIds.size}`);

		console.log("\n🧩 Module Types:");
		Array.from(moduleTypes.entries())
			.sort((a, b) => b[1] - a[1])
			.forEach(([type, count]) => {
				const percentage = ((count / moduleCount) * 100).toFixed(1);
				console.log(`   - ${type}: ${count}x (${percentage}%)`);
			});

		// Show first modules in root
		console.log("\n🌳 Root Modules:");
		doc.ujlc.root.slice(0, 5).forEach((module, index) => {
			const slotCount = Object.keys(module.slots).length;
			const slotInfo = slotCount > 0 ? ` (${slotCount} slot${slotCount > 1 ? "s" : ""})` : "";
			console.log(`   ${index + 1}. ${module.type} [${module.meta.id}]${slotInfo}`);
		});

		if (doc.ujlc.root.length > 5) {
			console.log(`   ... and ${doc.ujlc.root.length - 5} more`);
		}

		// Warnings
		console.log("\n🔍 Validation Checks:");

		if (uniqueIds.size !== moduleCount) {
			console.log(`   ⚠️  ${moduleCount - uniqueIds.size} duplicate module IDs found!`);
		} else {
			console.log("   ✓ All module IDs are unique");
		}

		if (maxDepth > 10) {
			console.log(`   ⚠️  Very deep nesting (${maxDepth} levels) - performance may suffer`);
		} else {
			console.log(`   ✓ Nesting depth OK (${maxDepth} levels)`);
		}

		process.exit(0);
	} else {
		console.log("❌ Content Document is INVALID!\n");
		console.log("🐛 Error Details:\n");

		result.error.issues.forEach((issue, index) => {
			console.log(`Error ${index + 1}:`);
			console.log(`   Path: ${issue.path.join(" → ")}`);
			console.log(`   Issue: ${issue.message}`);
			console.log(`   Code: ${issue.code}`);
			if (issue.path.length > 0) {
				console.log(`   Location: ${issue.path.slice(0, 3).join(".")}`);
			}
			console.log("");
		});

		process.exit(1);
	}
}
