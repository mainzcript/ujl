## Description

<!-- Brief description of what this PR does. -->

## Type of Change

<!-- Please check the relevant option(s): -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)

<!-- If this is a breaking change, please provide additional details: -->

### Breaking Change Details (if applicable)

**Justification:**
<!-- Explain why this breaking change is necessary and cannot be avoided. -->

**Migration Path:**
<!-- Describe how users should migrate from the old API/behavior to the new one. -->

**Affected Packages/Components:**
<!-- List all packages, components, or APIs that are affected. -->

## Definition of Done

### Changeset

- [ ] I have added a changeset for this change
- [ ] Breaking change is clearly marked in the changeset (if applicable)

### Testing

- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix/feature works
- [ ] All existing tests pass
- [ ] I have run `pnpm lint` and `pnpm check`

### Code Quality

- [ ] All comments are in English
- [ ] No emojis in code, comments, or documentation
- [ ] Comments explain WHY, not WHAT
- [ ] My changes generate no new warnings
- [ ] I have performed a self-review of my own code

### Architecture

- [ ] Layer discipline maintained (no cross-layer shortcuts or hidden dependencies)
- [ ] If schemas or AST structures changed: types and validation updated together
- [ ] If applicable: adapters checked for compatibility
- [ ] Breaking changes explicitly called out (if any)

### Documentation

- [ ] All documentation (README, doc comments) is in English
- [ ] Terminology is consistent with code and existing documentation
- [ ] I have made corresponding changes to the documentation (if applicable)
- [ ] Migration guide is provided (if breaking change)

### Performance & Usability (if applicable)

- [ ] Performance requirements met (<200ms for 200 entries)
- [ ] Clear status/error messages implemented
- [ ] Required fields are clearly marked
- [ ] User experience is responsive

### Accessibility (if UI changes)

- [ ] Focus states are clearly visible
- [ ] Fully navigable with keyboard only
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Semantic HTML used correctly
