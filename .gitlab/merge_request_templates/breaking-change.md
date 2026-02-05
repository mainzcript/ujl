## Description

<!-- Brief description of the breaking change. -->

**IMPORTANT: Breaking changes require a very strong justification. Please explain the reason in detail below.**

### Justification

<!-- Explain why this breaking change is necessary and cannot be avoided. -->

### Migration Path

<!-- Describe how users should migrate from the old API/behavior to the new one. -->

### Affected Packages/Components

<!-- List all packages, components, or APIs that are affected by this breaking change. -->

## Definition of Done

### Changeset

- [ ] I have added a changeset for this change
- [ ] Breaking change is clearly marked in the changeset

### Testing

- [ ] I have tested this change locally
- [ ] I have added tests that cover the new behavior
- [ ] All existing tests pass (or have been updated for the breaking change)
- [ ] I have run `pnpm lint` and `pnpm check`
- [ ] Migration path has been tested (if applicable)

### Code Quality

- [ ] All comments are in English
- [ ] No emojis in code, comments, or documentation
- [ ] Comments explain WHY, not WHAT
- [ ] My changes generate no new warnings

### Architecture

- [ ] Layer discipline maintained (no cross-layer shortcuts or hidden dependencies)
- [ ] If schemas or AST structures changed: types and validation updated together
- [ ] All adapters checked for compatibility
- [ ] Breaking changes explicitly called out in code and documentation
- [ ] If UI is affected: Performance & Usability and Accessibility requirements met

### Documentation

- [ ] All documentation (README, doc comments) is in English
- [ ] Terminology is consistent with code and existing documentation
- [ ] Breaking changes are clearly documented
- [ ] Migration guide is provided (if applicable)
- [ ] I have updated all relevant documentation

### Checklist

- [ ] I have performed a self-review of my own code
- [ ] New and existing unit tests pass locally with my changes
- [ ] Breaking change has been discussed and approved by maintainers
