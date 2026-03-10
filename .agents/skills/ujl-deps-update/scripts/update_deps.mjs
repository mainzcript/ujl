#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function parseArgs(argv) {
	const options = {
		reportOnly: false,
		dryRun: false,
		scope: "all",
		verify: "full",
		filters: [],
		help: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === "--report-only") options.reportOnly = true;
		if (token === "--dry-run") options.dryRun = true;
		if (token === "--help" || token === "-h") options.help = true;
		if (token === "--scope") options.scope = argv[index + 1] ?? options.scope;
		if (token === "--verify") options.verify = argv[index + 1] ?? options.verify;
		if (token === "--filter") options.filters.push(argv[index + 1] ?? "");
	}

	options.filters = options.filters.filter(Boolean);
	return options;
}

function printHelp() {
	console.log("Usage: node .agents/skills/ujl-deps-update/scripts/update_deps.mjs [options]");
	console.log("");
	console.log("Options:");
	console.log("  --report-only      Run outdated scan and write report, skip updates");
	console.log("  --dry-run          Simulate flow: run outdated scan only, no updates");
	console.log("  --scope <value>    all | prod | dev (default: all)");
	console.log("  --verify <value>   full | quick | none (default: full)");
	console.log("  --filter <value>   Pass --filter selector to recursive pnpm commands");
	console.log("  -h, --help         Show this help");
}

function shell(command) {
	return spawnSync("zsh", ["-lc", command], {
		cwd: root,
		encoding: "utf8",
	});
}

function runStep(label, command, steps, { required = true, outdatedOk = false } = {}) {
	console.log(`\n== ${label} ==`);
	console.log(`$ ${command}`);
	const result = shell(command);
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);

	// pnpm outdated returns exit code 1 when there are outdated packages (this is normal behavior)
	const ok = result.status === 0 || (outdatedOk && result.status === 1);
	steps.push({
		label,
		command,
		ok,
		status: result.status ?? 1,
		stdout: result.stdout ?? "",
		stderr: result.stderr ?? "",
	});

	if (!ok && required) {
		throw new Error(`${label} failed with status ${result.status ?? 1}`);
	}

	return result;
}

function timestamp() {
	const now = new Date();
	return [
		now.getUTCFullYear(),
		String(now.getUTCMonth() + 1).padStart(2, "0"),
		String(now.getUTCDate()).padStart(2, "0"),
		"-",
		String(now.getUTCHours()).padStart(2, "0"),
		String(now.getUTCMinutes()).padStart(2, "0"),
		String(now.getUTCSeconds()).padStart(2, "0"),
	].join("");
}

function truncate(text, maxLines = 80, maxChars = 6000) {
	if (!text) return "";
	const lines = text.split("\n");
	const clippedLines = lines.slice(0, maxLines).join("\n");
	if (clippedLines.length <= maxChars && lines.length <= maxLines) return clippedLines;
	return `${clippedLines.slice(0, maxChars)}\n... (truncated)`;
}

function parseSemver(value) {
	const match = String(value).match(/(\d+)\.(\d+)\.(\d+)/);
	if (!match) return null;
	return {
		major: Number.parseInt(match[1], 10),
		minor: Number.parseInt(match[2], 10),
		patch: Number.parseInt(match[3], 10),
	};
}

function collectOutdatedRows(node, rows = []) {
	if (Array.isArray(node)) {
		for (const entry of node) collectOutdatedRows(entry, rows);
		return rows;
	}
	if (!node || typeof node !== "object") return rows;

	if ("current" in node && "latest" in node) {
		rows.push(node);
	}

	for (const value of Object.values(node)) {
		if (value && typeof value === "object") collectOutdatedRows(value, rows);
	}

	return rows;
}

function summarizeOutdated(jsonText) {
	let parsed;
	try {
		parsed = JSON.parse(jsonText);
	} catch {
		return { total: 0, major: 0, minor: 0, patch: 0, unknown: 0, parseable: false };
	}

	const rows = collectOutdatedRows(parsed);
	let major = 0;
	let minor = 0;
	let patch = 0;
	let unknown = 0;

	for (const row of rows) {
		const current = parseSemver(row.current);
		const latest = parseSemver(row.latest);
		if (!current || !latest) {
			unknown += 1;
			continue;
		}
		if (latest.major > current.major) {
			major += 1;
			continue;
		}
		if (latest.minor > current.minor) {
			minor += 1;
			continue;
		}
		if (latest.patch > current.patch) {
			patch += 1;
			continue;
		}
	}

	return {
		total: rows.length,
		major,
		minor,
		patch,
		unknown,
		parseable: true,
	};
}

function gitSummary() {
	const result = shell("git status --short");
	const lines = (result.stdout || "").split("\n").filter(Boolean);
	return {
		changedFiles: lines.length,
		preview: lines.slice(0, 20).join("\n"),
	};
}

function writeReport(options, steps, outdatedSummary, errorMessage = "") {
	const reportDir = path.join(root, ".support", "deps");
	fs.mkdirSync(reportDir, { recursive: true });
	const reportPath = path.join(reportDir, `${timestamp()}-deps-update.md`);
	const git = gitSummary();

	const lines = [];
	lines.push("# Dependency Update Report");
	lines.push("");
	lines.push(`- Scope: \`${options.scope}\``);
	lines.push(`- Verify: \`${options.verify}\``);
	lines.push(`- Report only: \`${options.reportOnly}\``);
	lines.push(`- Dry run: \`${options.dryRun}\``);
	lines.push(`- Filters: \`${options.filters.join(",") || "(none)"}\``);
	lines.push("");
	lines.push("## Outdated Summary");
	lines.push("");
	lines.push(`- Parseable JSON: \`${outdatedSummary.parseable}\``);
	lines.push(`- Total entries: \`${outdatedSummary.total}\``);
	lines.push(`- Major updates: \`${outdatedSummary.major}\``);
	lines.push(`- Minor updates: \`${outdatedSummary.minor}\``);
	lines.push(`- Patch updates: \`${outdatedSummary.patch}\``);
	lines.push(`- Unknown semver entries: \`${outdatedSummary.unknown}\``);
	lines.push("");
	lines.push("## Steps");
	lines.push("");

	for (const step of steps) {
		lines.push(`### ${step.label}`);
		lines.push("");
		lines.push(`- Command: \`${step.command}\``);
		lines.push(`- Status: \`${step.ok ? "ok" : `failed (${step.status})`}\``);
		const output = truncate(`${step.stdout}\n${step.stderr}`.trim());
		if (output) {
			lines.push("");
			lines.push("```text");
			lines.push(output);
			lines.push("```");
		}
		lines.push("");
	}

	lines.push("## Git Status");
	lines.push("");
	lines.push(`- Changed files: \`${git.changedFiles}\``);
	if (git.preview) {
		lines.push("");
		lines.push("```text");
		lines.push(git.preview);
		lines.push("```");
	}

	if (errorMessage) {
		lines.push("");
		lines.push("## Error");
		lines.push("");
		lines.push(errorMessage);
	}

	lines.push("");
	fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
	return reportPath;
}

function buildFlags(options) {
	const flags = [];
	if (options.scope === "prod") flags.push("--prod");
	if (options.scope === "dev") flags.push("--dev");
	for (const filter of options.filters) flags.push(`--filter '${filter}'`);
	return flags.join(" ");
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printHelp();
		return;
	}

	if (!["all", "prod", "dev"].includes(options.scope)) {
		console.error("Invalid --scope value. Use: all | prod | dev");
		process.exit(1);
	}
	if (!["full", "quick", "none"].includes(options.verify)) {
		console.error("Invalid --verify value. Use: full | quick | none");
		process.exit(1);
	}

	const steps = [];
	const flags = buildFlags(options);
	let outdatedSummary = { total: 0, major: 0, minor: 0, patch: 0, unknown: 0, parseable: false };

	try {
		const outdated = runStep(
			"Detect outdated dependencies",
			`pnpm outdated -r --format json ${flags}`.trim(),
			steps,
			{ outdatedOk: true }, // pnpm outdated returns exit code 1 when packages are outdated
		);
		outdatedSummary = summarizeOutdated(outdated.stdout || "");

		if (options.reportOnly || options.dryRun) {
			const reportPath = writeReport(options, steps, outdatedSummary);
			console.log(`\nreport_path=${reportPath}`);
			if (options.dryRun) console.log("note=Dry run enabled, update steps skipped.");
			return;
		}

		runStep("Update dependencies to latest", `pnpm up -r --latest ${flags}`.trim(), steps);

		if (options.verify === "quick" || options.verify === "full") {
			runStep("Run type checks", "pnpm run check", steps);
		}
		if (options.verify === "full") {
			runStep("Run lint", "pnpm run lint", steps);
			runStep("Run unit tests", "pnpm run test:unit", steps);
		}

		const reportPath = writeReport(options, steps, outdatedSummary);
		console.log(`\nreport_path=${reportPath}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const reportPath = writeReport(options, steps, outdatedSummary, message);
		console.error(`\nreport_path=${reportPath}`);
		process.exit(1);
	}
}

main();
