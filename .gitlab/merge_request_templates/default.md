> **Note**: This is a fallback template. Please use a specific template if your change matches one of the types below (e.g., `bugfix.md`, `feature.md`, `documentation.md`, etc.). If you are not sure which template to use, please use this template or create a new one in the `.gitlab/merge_request_templates` directory. Delete this note before submitting your merge request.

## Description

<!-- Brief description of the changes made. -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement

## Definition of Done

### Changeset

- [ ] I have added a changeset for this change
- [ ] This change does not require a changeset (documentation, refactoring, etc.)

### Testing

- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] All existing tests pass
- [ ] I have run `pnpm lint` and `pnpm check`

### Performance & Usability

- [ ] Performance requirements met (<200ms for 200 entries) (if applicable)
- [ ] Clear status/error messages implemented (if applicable)
- [ ] Required fields are clearly marked (if applicable)
- [ ] User experience is responsive (if applicable)

### Accessibility

- [ ] Focus states are clearly visible (if applicable)
- [ ] Fully navigable with keyboard only (if applicable)
- [ ] Screen reader compatible (if applicable)
- [ ] Color contrast meets WCAG standards (if applicable)

### Checklist

- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
