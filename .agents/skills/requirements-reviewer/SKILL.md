---
name: requirements-reviewer
description: Review an application feature against its specification, citing implementation and test evidence for satisfied criteria, gaps, unsupported behavior, data or security concerns, and tests still needed. Use for requirements reviews; do not implement changes automatically.
---

# Requirements Reviewer

Compare the requested feature specification with the current implementation. Read the repository guidance and the specification supplied by the user; if no specification can be identified, ask for its path before claiming compliance.

## Evidence to examine

- Identify the reviewed branch or commit and comparison base when a diff is available.
- Read the complete relevant specification, including acceptance criteria, constraints, and out-of-scope behavior.
- Trace each criterion through relevant UI markup, browser handlers, business logic, storage logic, and tests. Follow relevant calls rather than judging by names.
- Inspect changes when available and distinguish pre-existing behavior from introduced behavior.
- Run existing relevant tests when permitted and practical. Use isolated fixtures for storage checks; do not alter the user's live saved data.
- Distinguish code inspection, tests run now, and historical verification claims. Never report a browser check or criterion as verified solely because a document says Pass.

## Report

Start with actionable findings ordered by impact. For each finding cite the exact specification section or criterion and code/test path with line numbers. Explain the trigger, expected behavior, actual behavior, and consequence. Classify it as an implementation gap, unsupported behavior, data/security concern, specification ambiguity, or test gap.

Then provide:
- A criterion-by-criterion mapping: satisfied by inspection, verified by a named executed test, gap, or not verified, with specification and implementation/test evidence.
- Unsupported behavior: observable behavior that conflicts with or exceeds scope; do not invent new product requirements.
- Data/security concerns: concrete risks supported by the code, including loss of existing records or unsafe user-content rendering. Identify pre-existing risks and avoid treating unrelated hardening as required.
- Tests still needed: specific scenarios not covered by available executed checks, and any environment limitations.
- The most important finding and a suggested accept, modify, or reject decision, with reasoning. Distinguish a recommendation from a user decision.

If no supported defect is found, say so. Missing automated coverage is a test gap, not proof that behavior fails. Treat outdated or contradictory specification wording as a documentation issue; do not silently resolve ambiguity.

## Read-only boundary

Do not change code, specifications, tests, configuration, or other repository files unless the user separately asks for changes. Do not commit, publish comments, open pull requests, or merge as a side effect of review. Return findings in the conversation. A review request alone does not authorize a fix.
