# History Archive

This directory contains records of removed features, deprecated code, and abandoned approaches.

## Purpose

When code is removed from the codebase, the context and reasoning behind it often gets lost. This archive preserves that institutional knowledge so future developers can:

1. **Understand why something was removed** — Avoid re-implementing failed approaches
2. **Recover useful patterns** — Some code may be useful in different contexts
3. **Learn from past decisions** — See what was tried and what didn't work

## When to Add a Record

Create a new file here when:
- Removing a user-facing feature
- Deleting >50 lines of non-trivial code
- Reverting an architectural decision (link to the ADR)
- Abandoning an approach after significant investment

## Naming Convention

```
YYYY-MM-DD-descriptive-name.md
```

Examples:
- `2024-12-01-removed-pako-compression.md`
- `2024-11-15-deprecated-custom-theme-builder.md`
- `2024-10-20-reverted-webworker-rendering.md`

## File Template

See `AGENT.md` for the full template, but at minimum include:
- What was removed
- Why it existed originally
- Why it was removed
- Any code worth preserving for reference

## Behavior Changes

### 2026-07-18: Blank-on-error preview

The preview no longer clears a compatible last valid diagram for every syntax error. It now keeps
that SVG in memory, dims it, and presents persistent error feedback plus a Monaco marker. Empty
source or a changed root diagram type still clears the preview and uses the blocking error card.
Visual exports can use the retained SVG, but always warn that current source has errors.

Related: [ADR-002](../ADR/002-render-pipeline-error-resilience.md).
