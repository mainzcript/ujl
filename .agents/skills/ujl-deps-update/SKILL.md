---
name: ujl-deps-update
description: Updates UJL workspace dependencies to latest versions in one run by starting with pnpm outdated -r, applying pnpm up -r --latest, and running verification checks with a report in .support/deps. Also checks for pnpm version updates.
---

# UJL Dependency Update

## Purpose

Update dependencies across the pnpm workspace with a pragmatic, reproducible flow:

1. Check pnpm version (`npm view pnpm version` vs `packageManager` in package.json)
2. Inspect outdated dependencies (`pnpm outdated -r`)
3. Update to latest (`pnpm up -r --latest`)
4. Verify project health (`check`, optional `lint` and `test:unit`)
5. Save a compact run report to `.support/deps`

## One-Call Usage

From repo root:

```bash
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs
```

## Common Options

```bash
# Only analyze outdated packages, no updates
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs --report-only

# Update only production dependencies
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs --scope prod

# Faster verification
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs --verify quick

# Skip verification entirely
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs --verify none

# Restrict to selected workspace projects
node .agents/skills/ujl-deps-update/scripts/update_deps.mjs --filter @ujl-framework/crafter
```

## Defaults

- Scope: `all`
- Verification: `full` (`pnpm run lint`, `pnpm run check`, `pnpm run test:unit`)
- Report path: `.support/deps/<timestamp>-deps-update.md`

## Report Output

The report includes:

- **pnpm Version**: Current vs latest pnpm version with update instructions
- **Outdated Summary**: Total, major, minor, patch updates
- **Steps**: Commands executed and their status
- **Git Status**: Changed files after update

## Notes

- This workflow intentionally uses non-interactive commands for repeatable agent runs.
- Network access may require elevated permissions in restricted environments.
- If verification fails, keep dependency updates and report findings instead of reverting automatically.
- pnpm version check requires network access to query npm registry.
