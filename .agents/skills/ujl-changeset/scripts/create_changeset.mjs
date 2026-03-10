#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const changesetDir = path.join(root, ".changeset");
const configPath = path.join(changesetDir, "config.json");

function sh(cmd) {
	return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function parseArgs(argv) {
	const args = { bump: "auto", message: "", range: "", dryRun: false };
	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];
		if (token === "--bump") args.bump = argv[index + 1] ?? "auto";
		if (token === "--message") args.message = argv[index + 1] ?? "";
		if (token === "--range") args.range = argv[index + 1] ?? "";
		if (token === "--dry-run") args.dryRun = true;
	}
	return args;
}

function readConfig() {
	const fallback = { baseBranch: "main", ignore: [] };
	if (!fs.existsSync(configPath)) return fallback;
	try {
		const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
		return { baseBranch: parsed.baseBranch || "main", ignore: parsed.ignore || [] };
	} catch {
		return fallback;
	}
}

function resolveRange(cliRange, baseBranch) {
	if (cliRange) return cliRange;
	try {
		sh(`git rev-parse --verify ${baseBranch}`);
		return `${baseBranch}...HEAD`;
	} catch {
		return "HEAD~1..HEAD";
	}
}

function safeBranchName() {
	try {
		return sh("git branch --show-current")
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	} catch {
		return "branch";
	}
}

function readWorkspacePackages(ignoreList) {
	const packagesRoot = path.join(root, "packages");
	if (!fs.existsSync(packagesRoot)) return [];
	const folders = fs.readdirSync(packagesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
	const packages = [];
	for (const folder of folders) {
		const packageJsonPath = path.join(packagesRoot, folder.name, "package.json");
		if (!fs.existsSync(packageJsonPath)) continue;
		try {
			const data = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
			if (!data.name || ignoreList.includes(data.name)) continue;
			packages.push({
				name: data.name,
				relativePrefix: `packages/${folder.name}/`,
			});
		} catch {
			// Ignore unreadable package metadata.
		}
	}
	return packages;
}

function determineBump(cliBump, subjects) {
	if (cliBump !== "auto") return cliBump;
	const text = subjects.join("\n");
	if (/(BREAKING CHANGE|!:\s)/i.test(text)) return "major";
	if (/^feat(\(.+\))?:\s/im.test(text)) return "minor";
	return "patch";
}

function normalizeSummary(subject) {
	const stripped = subject
		.replace(/^(feat|fix|refactor|chore|docs|test|perf)(\([^)]+\))?!?:\s*/i, "")
		.replace(/^merge\b.*$/i, "")
		.trim();
	if (!stripped || /^(wip|tmp|fixup|squash)/i.test(stripped)) return "";
	return stripped.charAt(0).toUpperCase() + stripped.slice(1).replace(/\.*$/, ".");
}

function defaultSummary(changedPackages, bump) {
	const labels = changedPackages
		.map((name) => name.replace("@ujl-framework/", ""))
		.slice(0, 3)
		.join(", ");
	if (bump === "minor") return `Add feature updates in ${labels || "UJL packages"}.`;
	if (bump === "major") return `Introduce breaking updates in ${labels || "UJL packages"}.`;
	return `Improve ${labels || "UJL packages"}.`;
}

function nextFilename(branch) {
	const now = new Date();
	const stamp = [
		now.getUTCFullYear(),
		String(now.getUTCMonth() + 1).padStart(2, "0"),
		String(now.getUTCDate()).padStart(2, "0"),
		"-",
		String(now.getUTCHours()).padStart(2, "0"),
		String(now.getUTCMinutes()).padStart(2, "0"),
		String(now.getUTCSeconds()).padStart(2, "0"),
	].join("");
	const base = `${stamp}-${branch || "branch"}`;
	let candidate = `${base}.md`;
	let counter = 1;
	while (fs.existsSync(path.join(changesetDir, candidate))) {
		counter += 1;
		candidate = `${base}-${counter}.md`;
	}
	return candidate;
}

function run() {
	const args = parseArgs(process.argv.slice(2));
	if (!fs.existsSync(changesetDir)) {
		console.error("Missing .changeset directory.");
		process.exit(1);
	}

	const config = readConfig();
	const range = resolveRange(args.range, config.baseBranch);
	const changedFiles = sh(`git diff --name-only ${range}`)
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	const packageInfo = readWorkspacePackages(config.ignore || []);
	const changedPackages = packageInfo
		.filter((pkg) => changedFiles.some((file) => file.startsWith(pkg.relativePrefix)))
		.map((pkg) => pkg.name);

	const subjects = sh(`git log --format=%s ${range}`)
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	const bump = determineBump(args.bump, subjects);
	const summary =
		args.message.trim() ||
		subjects.map(normalizeSummary).find(Boolean) ||
		defaultSummary(changedPackages, bump);

	const frontmatterLines = ["---"];
	for (const pkg of changedPackages) {
		frontmatterLines.push(`"${pkg}": ${bump}`);
	}
	frontmatterLines.push("---", "", summary, "");
	const content = `${frontmatterLines.join("\n")}`;

	const branch = safeBranchName();
	const filename = nextFilename(branch);
	const outputPath = path.join(changesetDir, filename);

	if (!args.dryRun) fs.writeFileSync(outputPath, content, "utf8");

	console.log(`changeset_path=${outputPath}`);
	console.log(`range=${range}`);
	console.log(`packages=${changedPackages.join(",") || "(none)"}`);
	console.log(`bump=${bump}`);
	console.log(`summary=${summary}`);
	if (changedPackages.length === 0) {
		console.log("note=No release package changes detected; generated changeset has empty frontmatter.");
	}
}

run();
