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
	const stripped = subject.replace(/^(feat|fix|refactor|chore|docs|test|perf)(\([^)]+\))?!?:\s*/i, "").trim();
	if (!stripped) return "";
	return stripped.charAt(0).toUpperCase() + stripped.slice(1).replace(/\.*$/, ".");
}

function parseSubject(subject) {
	const trimmed = subject.trim();
	const matched = /^(feat|fix|refactor|perf|test|docs|chore)(\([^)]+\))?!?:\s*(.+)$/i.exec(trimmed);
	if (!matched) return { type: "other", description: trimmed };
	return { type: matched[1].toLowerCase(), description: matched[3].trim() };
}

function selectSummaryFromSubjects(subjects) {
	const typeScore = {
		feat: 50,
		fix: 40,
		refactor: 30,
		perf: 30,
		test: 15,
		docs: 5,
		chore: 0,
		other: 10,
	};

	const scored = subjects
		.map((subject, index) => {
			const { type, description } = parseSubject(subject);
			if (!description || /^merge\b/i.test(description) || /^(wip|tmp|fixup|squash)\b/i.test(description)) {
				return null;
			}

			let score = typeScore[type] ?? typeScore.other;
			if (/(changeset|agent|claude\.md|cursor\/rules|instructions:sync|postinstall)/i.test(description)) {
				score -= 20;
			}

			return {
				score,
				index,
				summary: normalizeSummary(description),
			};
		})
		.filter(Boolean)
		.filter((entry) => entry.summary);

	if (scored.length === 0) return "";

	scored.sort((left, right) => right.score - left.score || left.index - right.index);
	return scored[0]?.summary ?? "";
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

function readExistingChangesetFiles() {
	return fs
		.readdirSync(changesetDir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => name.endsWith(".md") && name !== "README.md");
}

function nextFilename(branch) {
	const existing = readExistingChangesetFiles();
	const numericPrefixes = existing
		.map((name) => /^(\d+)-/.exec(name)?.[1])
		.filter(Boolean)
		.map((value) => Number.parseInt(value, 10))
		.filter((value) => Number.isFinite(value));

	let nextNumber = numericPrefixes.length > 0 ? Math.max(...numericPrefixes) + 1 : existing.length + 1;
	let candidate = `${String(nextNumber).padStart(2, "0")}-${branch || "branch"}.md`;
	while (existing.includes(candidate) || fs.existsSync(path.join(changesetDir, candidate))) {
		nextNumber += 1;
		candidate = `${String(nextNumber).padStart(2, "0")}-${branch || "branch"}.md`;
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
		selectSummaryFromSubjects(subjects) ||
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
