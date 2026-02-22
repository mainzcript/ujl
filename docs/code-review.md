# UJL — Code Review Playbook

> **Purpose**  
> Provide a clear, pragmatic, and repeatable process for code reviews that maximizes quality and maintainability **without over-optimizing**.  
> The review follows an **80/20 Pareto principle**:
>
> - **Critical issues are always addressed**
> - **High-impact, low-effort improvements are encouraged**
> - **Perfection is explicitly not the goal**

> **Project Context (Very Short)**  
> UJL separates **content** (`.ujlc.json`) and **theme/design** (`.ujlt.json`).  
> `core` composes both into an AST, adapters (e.g. Svelte, Web Components) generate output, UI provides base components.

---

## 0) Reviewer Mindset (System-Prompt Style)

You are acting as a **quality gate**, not as a perfection enforcer.

Apply the following priorities in strict order:

1. **Correctness & Safety**
2. **Architecture & Public API Integrity**
3. **Maintainability & Clean Code**
4. **Tests & Validation**
5. **Cost–Benefit Awareness (Pareto 80/20)**

If an issue is real but **not worth fixing now**, explicitly classify it as such.

Do **not** block a merge for low-impact aesthetic improvements.

---

## 1) Inputs Expected for a Review

- List of **changed files** (diff or full files)
- Short MR/PR description (what + why)
- CI status or expected commands (if available)

---

## 2) Review Flow

### Step A — Scope & Risk Assessment (Fast)

- What layers/packages are touched?
- Does this affect:
  - Public APIs?
  - AST / schemas?
  - Adapters?
- Does it require updates to user-facing docs (`apps/docs`) to keep terminology/APIs consistent?
- Assign **Risk Level**: Low / Medium / High

### Step B — Reality Check

- Types, linting, tests (if applicable)
- Missing tests for changed logic → usually a **Must**, unless strongly justified

### Step C — Focused Deep Review

Review **only what matters most**:

- New or modified logic
- Public or shared code
- Error paths and edge cases

Avoid bikeshedding unchanged or low-risk legacy code.

---

## 3) Clean Code Checklist (Mandatory, but Pragmatic)

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

---

## 4) Comment Rules — **Critical Review Item**

### 4.1 Language

- **All comments must be in English**  
  (inline comments, TODOs, doc comments)

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
- If code needs many comments, structure is likely wrong

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

---

## 5) Documentation & Terminology Rules

### 5.1 Language & Style

- All documentation (README files, doc comments, etc.) must be in English
- Follow the same comment rules (see Section 4)
- No emojis (see Section 4.5)

### 5.2 Terminology Consistency — **Critical Review Item**

- **Documentation must use the same terminology as the code**
- Framework concepts and components must be **uniquely defined and consistently named**
- Reviewers must check that:
  - Terms used in READMEs match code identifiers and comments
  - Concepts are clearly defined and not ambiguous
  - No conflicting names for the same concept exist
- Inconsistencies in terminology are a **Should** (or **Must** if they cause confusion or ambiguity)

---

## 6) UJL Architecture Checks (Must)

### 6.1 Layer Discipline

Ensure code changes stay within their intended layer:

- `packages/types`  
  Types, schemas, runtime validation
- `packages/core`  
  Composition, registries, AST creation
- `packages/adapter-*`  
  AST → framework-specific output
- `packages/ui`  
  Base components and tokens
- `packages/crafter`  
  Authoring/editor UI

**Must:**  
No cross-layer shortcuts or hidden dependencies.

---

### 6.2 Schema / AST Changes

If schemas or AST structures change:

- Types + validation updated together
- Adapters checked for compatibility
- Breaking changes explicitly called out

---

### 6.3 Accessibility & Semantics

UJL claims semantic HTML and accessibility by design.

**Any UI or markup change must be reviewed for:**

- Correct semantics
- Keyboard usability
- Obvious ARIA or contrast issues

---

## 7) AI / Vibe-Coding Anti-Pattern Scan

Actively look for:

- Over-generated boilerplate
- Repeated copy/paste patterns
- Debug leftovers (`console.log`, flags, commented code)
- Over-commented obvious code
- Inconsistent paradigms without justification

---

## 8) Pareto Rule — How to Judge Findings

Every finding must be classified by **impact vs. effort**.

### Severity Levels

#### **Must**

- Bugs
- Runtime errors
- Architectural violations
- API or schema inconsistencies
- Accessibility regressions
  → **Always fix before merge**

#### **Should**

- Clear maintainability wins
- Readability improvements with low effort
- Missing but easy tests
  → **Fix if reasonable within scope**

#### **Optional / Nit**

- Minor naming/style issues
- Refactors with questionable ROI
  → **Mention, but do not block**

If a fix is high-effort and low-impact:  
**Explicitly recommend NOT fixing it now.**

---

## 9) Review Output Format (Required)

### Summary

- **Scope:** What changed (1–2 sentences)
- **Risk:** Low / Medium / High (with reason)
- **Decision:** Approve / Request Changes / Comments Only

### Findings

For each item:

- **Severity:** Must / Should / Optional
- **Location:** `path/to/file.ts:line`
- **Issue:** Clear description
- **Why it matters:** Short rationale
- **Suggested fix:** Concrete and minimal

Example:

- **Must** — `packages/core/composer.ts:128`  
  **Issue:** Registry lookup may return undefined.  
  **Why:** Can crash at runtime with invalid content.  
  **Fix:** Add explicit guard and surface a meaningful error.

---

## 10) Merge-Ready Criteria

A change is ready when:

- No **Must** findings remain
- Critical paths are tested or justified
- Architecture boundaries are respected
- Comments follow English + minimalism rules (Section 4)
- No emojis in code, comments, or documentation (Section 4.5)
- Documentation terminology is consistent with code (Section 5.2)
- No unnecessary AI artifacts or overengineering
- Review respected the **80/20 rule**

---

_End of document._
