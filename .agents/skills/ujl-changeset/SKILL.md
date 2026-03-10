---
name: ujl-changeset
description: Creates a lean Changeset for UJL in one run by inspecting branch diff and commit messages, then writing a compact one-line .changeset markdown file. Use when the user asks to add, draft, or create a changeset.
---

# UJL Changeset

## Purpose

Create exactly one compact Changeset entry for the current branch, based on git evidence.

Primary output:

```
.changeset/NN-<branch-name>.md
```

The default body should be a one-liner suitable for changelog output.

## When to Use

Use this skill when the user asks to:

- add/create/draft a changeset
- prepare release notes for a branch
- generate a compact changelog line from branch changes

## One-Command Workflow

From repo root run:

```bash
node .agents/skills/ujl-changeset/scripts/create_changeset.mjs
```

Optional overrides:

```bash
node .agents/skills/ujl-changeset/scripts/create_changeset.mjs --bump patch
node .agents/skills/ujl-changeset/scripts/create_changeset.mjs --message "Improve crafter test stability."
node .agents/skills/ujl-changeset/scripts/create_changeset.mjs --range main...HEAD
```

## How it Works

The script:

1. Reads `.changeset/config.json` and uses `baseBranch` (default `main`)
2. Computes range (`<baseBranch>...HEAD`, fallback `HEAD~1..HEAD`)
3. Detects changed release packages from `packages/*/package.json`
4. Derives bump type automatically:
   - while all release packages are on `0.0.x`: always `patch` (pre-0.1 patch-only policy)
   - otherwise: `major` for breaking markers (`BREAKING CHANGE`, `!:`), `minor` for `feat:`, `patch` otherwise
5. Generates a concise one-line summary from commit subjects (prefers `feat`/`fix`/`refactor`, downweights `docs`/`chore` and agent/meta commits)
6. Writes a unique `NN-<branch-name>.md` file:
   - `NN` is a two-digit sequence (`01`, `02`, ...)
   - if numeric files already exist, use max prefix + 1
   - otherwise, start from count of existing changeset markdown files + 1

## Output Rules

- Keep the summary to one line
- English only
- No emojis
- No speculative claims
- Do not overwrite existing `.changeset/*.md` files

## Notes from official Changesets docs

- A changeset markdown file contains frontmatter with package bump types and a summary line.
- `changeset add --empty` is valid for empty frontmatter changesets.
- CLI supports `--message` and `--empty`; this skill writes files directly to keep the flow non-interactive and lean.

Reference: [Changesets repository](https://github.com/changesets/changesets)
