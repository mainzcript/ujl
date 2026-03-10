---
name: ujl-pr-draft
description: Creates a pull request draft for UJL by inspecting branch changes via git and writing a completed PR document to .support/pr based on .github/pull_request_template.md. Use when the user asks to prepare, draft, or write a PR.
---

# UJL PR Draft

## Purpose

Create a review-ready PR draft from the current branch by using git as the source of truth and filling the repository PR template.

Output target:

```
.support/pr/
```

Template source:

```
.github/pull_request_template.md
```

## When to Apply This Skill

Use this skill whenever the user asks to:

- create a PR draft
- prepare a pull request description
- summarize branch changes for a PR
- save a PR file in `.support/pr`

## Required Workflow

### 1. Collect branch context via git

Run:

```bash
git branch --show-current
git status --short
git log --oneline main..HEAD
git diff --name-status main...HEAD
git diff --stat main...HEAD
git diff main...HEAD
```

If `main...HEAD` is not available (for example in detached states), fall back to `HEAD~1..HEAD` and state that fallback in the PR text.

### 2. Read and apply PR template

Read:

```bash
.github/pull_request_template.md
```

Create a filled draft that keeps the same top-level structure:

- `## Description`
- `## Type of Change`
- `## Definition of Done`
- optional breaking-change section only when applicable

Do not invent behavior that is not present in the diff.

### 3. Fill content rules

- Description: concise summary of what changed and why.
- Type of Change: list only relevant types.
- Breaking change section: include only if truly breaking, with migration path.
- Definition of Done: mark only items that are verifiable from available evidence. Keep unknown items unchecked or explicitly note uncertainty.
- Mention uncommitted local changes from `git status --short` in a short note when relevant.

### 4. Save the PR draft

Create `.support/pr` if missing and save the draft as:

```
.support/pr/NN-<branch-name>.md
```

Rules:

- `NN` is a two-digit increment based on existing files in `.support/pr` (`01`, `02`, ...).
- sanitize branch name to lowercase and hyphen-safe file name.
- never overwrite an existing file; choose the next index.

## Quality Bar

- English only
- No emojis
- No speculative claims
- Terminology must match repository naming (`UJL`, package names, module names)

## Final Response Format

After writing the file, report:

1. Absolute output path
2. Base git range used (for example `main...HEAD`)
3. One-sentence summary of the generated PR scope
