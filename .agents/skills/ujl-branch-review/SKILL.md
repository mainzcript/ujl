---
name: ujl-branch-review
description: Performs automated branch reviews for the UJL Framework by analyzing git diffs and generating structured review reports saved to .support/review. Use when the user asks for a branch review, code review, PR review, or requests a review of current changes in the repository.
---

# UJL Branch Review

## Purpose

Perform an automated code review for the UJL Framework following a pragmatic, repeatable process that maximizes quality and maintainability **without over-optimizing**.

**Core principle — 80/20 Pareto rule:**

- Critical issues are always addressed
- High-impact, low-effort improvements are encouraged
- Perfection is explicitly not the goal

**Project Context**
UJL separates **content** (`.ujlc.json`) and **theme/design** (`.ujlt.json`). `core` composes both into an AST, adapters (e.g. Svelte, Web Components) generate output, UI provides base components.

## When to Apply This Skill

Use this skill whenever:

- The user asks for a **branch review**, **code review**, **PR/MR review**, or **feedback on changes**
- The user wants to review the current working branch before merging
- The changes affect UJL packages, apps, or services in this repository

## Workflow

This skill operates autonomously:

1. **Discover changes**: Use git commands to identify changed files automatically
2. **Analyze**: Review the diff following the UJL Code Review Playbook
3. **Report**: Save the structured review to `.support/review/`

### Step 1 — Gather Changes via Git

Run these commands to collect review inputs:

```bash
# Get list of changed files against main
git diff --name-only main...HEAD

# Get the full diff
git diff main...HEAD

# Get branch name
git branch --show-current

# Get recent commit messages for context
git log --oneline main..HEAD
```

If the user provided specific files or a diff, use those instead.

### Step 2 — Perform Review

Follow all sections below (Mindset, Flow, Checklists, etc.) to analyze the changes.

### Step 3 — Save Review Report

Save the complete review output to:

```
.support/review/YYYY-MM-DD_<branch-name>_review.md
```

Use the current date and the current branch name in the filename.

Create the `.support/review/` directory if it does not exist.

## Reviewer Mindset

Act as a **quality gate**, not a perfection enforcer.

Apply priorities in this exact order:

1. **Correctness & Safety**
2. **Architecture & Public API Integrity**
3. **Maintainability & Clean Code**
4. **Tests & Validation**
5. **Cost–Benefit Awareness (Pareto 80/20)**

Do not block merges for low-impact aesthetic issues.  
If something is technically an issue but **not worth fixing now**, explicitly classify it as such.

## Review Flow

Follow this flow, adapted to the information available:

### Step A — Scope & Risk Assessment (Fast)

- Identify which packages/layers are touched
- Check whether public APIs, schemas/AST, adapters, or user-facing docs could be affected
- Does it require updates to user-facing docs (`apps/docs`) to keep terminology/APIs consistent?
- Check documentation consistency across developer docs (`README*`, `CONTRIBUTING.md`, `AGENTS.md`), agentic instructions (`.agents/rules/*`, `.agents/skills/*`, subagents if present), and docs site (`apps/docs`)
- Assign a **Risk Level**: Low / Medium / High (with a short reason)

### Step B — Reality Check

- Pay attention to types, linting, and tests mentioned or implied in the changes
- Missing tests for changed logic should normally be a **Must**, unless strongly justified

### Step C — Focused Deep Review

- Focus on new/modified logic, public/shared code, error paths, and edge cases
- Avoid bikeshedding unchanged or clearly low-risk legacy code

## Clean Code Checklist

When reviewing code, check:

### 3.1 Structure & Readability

- Clear responsibilities (SRP)
- Functions are understandable without comments
- Names reflect domain intent, not implementation details

### 3.2 Complexity Discipline

- No unnecessary abstractions
- No premature generalization
- Prefer the simplest solution that is correct

### 3.3 Duplication

- Remove **obvious** duplication
- Accept minor duplication if refactoring would be invasive or risky

### 3.4 Robustness

- Explicit handling of invalid input and failure states
- No silent failures without explanation

## Comment Rules — Critical Review Item

### 4.1 Language

- **All comments must be in English** (inline comments, TODOs, doc comments)

### 4.2 Content Rules (Very Important)

Comments must explain **WHY**, never **WHAT**.

**Disallowed comments (must be removed):**

- Change history ("changed from…", "previously…", "quick fix")
- Obvious restatements of code
- Temporary reasoning that will not matter in 3 months

**Allowed comments:**

- Non-obvious decisions
- Trade-offs
- Constraints or invariants
- Intent that cannot be expressed in code

### 4.3 Minimalism

- Zero comments is better than redundant comments
- If a piece of code needs many comments, structure is likely wrong

### 4.4 TODOs

- Must include **reason** and preferably a **reference**
- TODOs without context should be rejected

### 4.5 Emojis

- **Emojis are generally not allowed** in comments, code, or documentation
- Only permitted in **very special cases** where they provide significant value
- LLMs tend to overuse emojis — actively reject unnecessary emoji usage
- This applies to:
  - Inline comments
  - Log messages
  - Doc comments
  - README files
  - All documentation files

## Documentation & Terminology Rules

### 5.1 Language & Style

- All documentation (README files, doc comments, etc.) must be in English
- Follow the same comment rules
- No emojis

### 5.2 Terminology Consistency — Critical Review Item

- **Documentation must use the same terminology as the code**
- Framework concepts and components must be **uniquely defined and consistently named**
- Reviewers must check that:
  - Terms used in READMEs match code identifiers and comments
  - Concepts are clearly defined and not ambiguous
  - No conflicting names for the same concept exist
- Inconsistencies in terminology are a **Should** (or **Must** if they cause confusion or ambiguity)

### 5.3 Documentation Surface Consistency

- Reviewers must verify that relevant changes are reflected consistently across:
  - Developer docs (`README*`, `CONTRIBUTING.md`, `AGENTS.md`)
  - Agentic instructions (`.agents/rules/*`, `.agents/skills/*`, and subagent definitions if present)
  - Documentation website content (`apps/docs`)
- If behavior, workflows, or standards changed, missing updates in any relevant surface are at least a **Should**
- Broken or stale links in touched documentation are a **Should** (or **Must** when they block key contributor workflows)

## UJL Architecture Checks

### 6.1 Layer Discipline

Ensure code changes stay within their intended layer:

- `packages/types`: Types, schemas, runtime validation
- `packages/core`: Composition, registries, AST creation
- `packages/adapter-*`: AST to framework-specific output
- `packages/ui`: Base components and tokens
- `packages/crafter`: Authoring/editor UI

**Must:** No cross-layer shortcuts or hidden dependencies.

### 6.2 Schema / AST Changes

If schemas or AST structures change:

- Types + validation updated together
- Adapters checked for compatibility
- Breaking changes explicitly called out

### 6.3 Accessibility & Semantics

UJL claims semantic HTML and accessibility by design.

**Any UI or markup change must be reviewed for:**

- Correct semantics
- Keyboard usability
- Obvious ARIA or contrast issues

## AI / "Vibe Coding" Smell Scan

Actively look for:

- Over-generated or repetitive boilerplate
- Repeated copy/paste patterns without abstraction
- Debug leftovers (`console.log`, flags, commented-out code)
- Over-commented obvious code
- Inconsistent paradigms or styles without justification

Call these out, but weigh them against the Pareto principle when classifying severity.

## Severity & Pareto Classification

Classify each finding by **impact vs. effort** using these levels:

### Must

- Bugs, runtime errors
- Architectural violations
- API or schema inconsistencies
- Accessibility regressions
- Breaking changes without documentation
- Items that must be fixed before merge

### Should

- Clear maintainability or readability wins
- Missing but easy tests
- Terminology inconsistencies (if they cause confusion)
- Fix if reasonable within scope

### Optional (or "Nit")

- Minor naming or style issues
- Refactors with questionable return on investment
- Mention, but do not block

If a fix is high-effort and low-impact, explicitly recommend **not** fixing it now.

## Required Review Output Format

Always format the review using this structure:

### Summary

- **Scope:** What changed (1–2 sentences)
- **Risk:** Low / Medium / High (with reason)
- **Decision:** Approve / Request Changes / Comments Only

### Findings

For each finding, use this template:

- **Severity:** Must / Should / Optional
- **Location:** `path/to/file.ts:line`
- **Issue:** Clear description
- **Why it matters:** Short rationale
- **Suggested fix:** Concrete and minimal

Only include findings that are meaningful under the Pareto rule.  
Group related findings by file or topic when helpful.

## Merge-Ready Criteria

In your decision, treat a change as **merge-ready** when:

- No **Must** findings remain
- Critical paths are tested or their lack of tests is explicitly justified
- Architecture boundaries are respected
- Comments and docs follow the English/minimalism rules and avoid emojis
- Documentation terminology is consistent with code where relevant
- Documentation surfaces stay consistent (developer docs, agentic instructions, docs site) for affected changes
- No obvious AI artifacts or unnecessary overengineering remain
- The overall review respects the **80/20 rule**
