# AGENT.md — Mermaid Live Editor

AI agent instructions for working with this codebase. This file is optimized for GitHub Copilot, Claude, Cursor, and similar AI coding assistants.

## Before You Start

**Read the documentation first.** Before making any changes:

1. **Read `/docs/PRD.md`** — Understand product requirements and scope
2. **Read `/docs/ADR/`** — Review all Architecture Decision Records
3. **Check `/docs/HISTORY.md`** — Understand what's been tried/removed and why
4. **Read `/docs/DEVELOPER_GUIDE.md`** — Setup, core concepts, and contribution workflow
5. **Read `/docs/ARCHITECTURE_GUIDELINES.md`** — Architectural principles and patterns
6. **Read `/docs/DESIGN_GUIDELINES.md`** — UI/UX and styling standards
7. **Read `/docs/TESTING_GUIDELINES.md`** — Testing strategy and best practices

**Reference docs during work:**
- Before solving a problem, check if an ADR already covers it
- Before removing code, check if there's context in HISTORY.md
- When in doubt about product direction, consult PRD.md

**Update docs as you work:**
- **New architectural decisions** → Create ADR in `/docs/ADR/`
- **Significant changes** → Update relevant sections in this file
- **Removed features/code** → Document in `/docs/history/` (see below)

## Quick Reference

```bash
npm run dev          # Vite dev server (port 5000)
npm run build        # TypeScript + Vite production build
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint
```

## Architecture

React 19 + TypeScript app for editing Mermaid diagrams with real-time preview. All rendering is client-side.

**Data flow:**
```
CodeEditor -> setCode(useLocalStorage) -> DiagramPreview epoch -> serialized renderMermaid()
     ^                                                         -> last-good SVG -> Export
     |                                                         -> RenderDiagnostic
     +----------------------- one Monaco marker -------------------------+
```

**Key files:**
- `src/App.tsx` — Central state hub, ALL `useLocalStorage` calls live here
- `src/lib/mermaid.ts` — Mermaid rendering wrapper (lazy initialization)
- `src/lib/export.ts` — SVG/PNG export with style inlining
- `src/lib/constants.ts` — Defaults, diagram examples, keyboard shortcuts
- `src/types/index.ts` — TypeScript types (DiagramType, MermaidConfig, etc.)

**Directory structure:**
```
src/
├── components/      # React components
│   └── ui/          # shadcn/ui primitives (do not edit directly)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── styles/          # globals.css only
├── test/            # Test setup and mocks
└── types/           # TypeScript type definitions
```

## Critical Rules

### State Management
- **NEVER** add `useLocalStorage` calls outside `App.tsx` — pass state via props
- All localStorage keys are centralized in `App.tsx`
- Use `useHistory` hook for undo/redo, not custom implementations

### Render Reliability
- Treat Mermaid as a mutable singleton: configuration plus render plus cleanup stays serialized
- Render only into detached offscreen containers and clean temporary/orphan nodes in `finally`
- `DiagramPreview` epochs guard every SVG, diagnostic, stale, and export-source commit
- Keep the mobile `DiagramPreview` mounted while its tab is hidden so edits still validate
- Retain a last-good SVG only when the current root diagram type still matches
- Monaco markers must derive from the same debounced rejection as preview feedback
- Visual export may use retained SVG only with an explicit stale warning
- Run `sanitizeMermaidSource()` and the preflight guard before every Mermaid render
- Never raise `HARD_DIAGRAM_CEILING` without production-browser measurements
- Diagrams above `INTERACTIVE_RENDER_THRESHOLD` require an explicit **Render now** action

### Offline and Shared-Content Security

- Runtime assets must be same-origin and included in the production precache
- Keep Monaco local through `src/lib/monaco-loader.ts`; never restore CDN loader paths
- Keep Mermaid `securityLevel` pinned to `strict`
- The CSP `img-src` must remain `data: blob:` without `'self'`
- Shared configuration must be validated and consent-gated before localStorage persistence
- Shared source must not overwrite the saved local document on initial load

### UI Conventions
- **Components:** shadcn/ui (new-york style) — add via CLI, don't hand-write
- **Icons:** `@phosphor-icons/react` with `weight="duotone"` — NOT lucide-react
- **Toasts:** `import { toast } from 'sonner'` — use `toast.success()`, `toast.error()`
- **Class merging:** Always use `cn()` from `@/lib/utils`
- **Styling:** CSS goes in `src/styles/globals.css` only

### TypeScript
- Prefer `type` over `interface` for object shapes
- Export types from `src/types/index.ts`
- Use strict mode — no `any` without justification

## Common Tasks

### Add a new diagram example
Edit `DIAGRAM_EXAMPLES` in `src/lib/constants.ts`:
```typescript
{
  id: 'unique-kebab-id',
  name: 'Display Name',
  type: 'flowchart', // Must match DiagramType union
  description: 'Brief description',
  code: `mermaid syntax`,
}
```

### Add a keyboard shortcut
1. Extend `KeyboardShortcuts` interface in `src/hooks/use-keyboard-shortcuts.ts`
2. Add handler in `handleKeyDown`
3. Add documentation to `KEYBOARD_SHORTCUTS` in `src/lib/constants.ts`

### Add a new export format
1. Add to `ExportFormat` type in `src/types/index.ts`
2. Implement in `src/lib/export.ts` following `exportSVG`/`exportPNG` pattern
3. Add case in `exportDiagram` switch
4. Update `Toolbar.tsx` export menu

## Testing

- **Framework:** Vitest + jsdom + @testing-library/react
- **File pattern:** Colocated as `Component.test.tsx` or `module.test.ts`
- **Mocks:** See `src/test/setup.ts` for mermaid, clipboard, canvas mocks

Run single test file:
```bash
npm test -- src/lib/export.test.ts
```

### What to mock
- `mermaid` module — already mocked globally
- `navigator.clipboard` — already mocked globally
- Canvas context — already mocked globally
- Do NOT mock React hooks or localStorage (use real implementations)

## Code Style

```typescript
// ✅ Do
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Code } from '@phosphor-icons/react';

export const MyComponent = ({ value }: { value: string }) => {
  return <div className={cn('base-class', value && 'conditional')} />;
};

// ❌ Don't
import { SomeIcon } from 'lucide-react';  // Wrong icon library
export default function MyComponent() {} // Use named exports
```

## What NOT to Do

- Don't create new CSS files — use `globals.css` or Tailwind utilities
- Don't add state persistence outside `App.tsx`
- Don't use default exports (except for lazy-loaded components)
- Don't bypass the `cn()` utility for conditional classes
- Don't add `@import` statements in component-level styles
- Don't mock localStorage in tests — the hook handles it

## Dependencies

| Purpose | Package | Notes |
|---------|---------|-------|
| Diagrams | `mermaid` | v11+, lazy init in lib/mermaid.ts |
| Editor | `@monaco-editor/react` | Lazy loaded in CodeEditor |
| UI primitives | `@radix-ui/*` | Via shadcn/ui |
| Icons | `@phosphor-icons/react` | Use `weight="duotone"` |
| Toasts | `sonner` | Via shadcn Toaster |
| Panels | `react-resizable-panels` | For editor/preview split |

## Project Context

This is a client-side-only Mermaid diagram editor. No backend, no auth, no database. State persists to localStorage. URL sharing uses base64-encoded state in query params.

The app supports 20+ diagram types (flowchart, sequence, class, ER, gantt, etc.) with live preview, pan/zoom, multiple export formats (SVG, PNG at 1-4x, Markdown), and light/dark themes.

## Architecture Decision Records (ADRs)

Significant architectural decisions are documented in `/docs/ADR/`. When making decisions that affect:
- Data flow or state management patterns
- Export/rendering strategies
- Third-party library choices
- Performance trade-offs
- Security considerations

Create a new ADR using this format:

```
docs/ADR/
├── 001-svg-to-canvas-export.md   # PNG export strategy
└── NNN-descriptive-name.md       # Next decision
```

**ADR Template:**
```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Date
YYYY-MM-DD

## Context
What is the issue? What forces are at play?

## Decision
What is the change being proposed or accepted?

## Consequences
What are the trade-offs? What becomes easier/harder?
```

Reference existing ADRs before re-solving similar problems.

## Vertical Slicing

When implementing features, use **vertical slices** — complete end-to-end functionality rather than horizontal layers.

**✅ Good vertical slice:** "Add Kanban diagram example"
1. Add type to `DiagramType` union in `types/index.ts`
2. Add example to `DIAGRAM_EXAMPLES` in `lib/constants.ts`
3. Test the example renders in preview
4. Done — user can immediately use Kanban diagrams

**❌ Bad horizontal approach:** "Build out the types layer first"
1. Add 5 new types to `types/index.ts`
2. Later: add constants for those types
3. Later: wire up the UI
4. User sees nothing until all layers complete

**Slice sizing guidelines:**
- Each slice should be **testable in isolation**
- Aim for slices completable in **1-2 hours**
- A slice must **touch the UI** (otherwise it's just infrastructure)
- Prefer **many small PRs** over one large PR

**Example slices for a "History Panel" feature:**
1. Slice 1: Show current undo/redo count in toolbar (UI feedback)
2. Slice 2: Add dropdown showing last 5 history entries
3. Slice 3: Click history entry to restore that state
4. Slice 4: Add keyboard navigation in history dropdown

## Documentation Maintenance

### Directory Structure
```
docs/
├── AGENT.md              # This file — AI agent instructions
├── PRD.md                # Product requirements document
├── HISTORY.md            # High-level project history
├── ADR/                  # Architecture Decision Records
│   └── 001-*.md          # Individual decisions
└── history/              # Archive of removed features/code
    └── YYYY-MM-DD-*.md   # Dated removal records
```

### When to Create a History Record

Create a file in `/docs/history/` when:
- **Removing a feature** — Document what it did and why it was removed
- **Deleting significant code** (>50 lines) — Preserve context for future reference
- **Reverting a decision** — Link to the original ADR and explain why it didn't work
- **Deprecating an approach** — Help future developers avoid the same path

**History Record Template** (`/docs/history/YYYY-MM-DD-descriptive-name.md`):
```markdown
# Removed: Feature/Component Name

## Date Removed
YYYY-MM-DD

## What Was Removed
Brief description of the feature, component, or code.

## Why It Existed
Original purpose and the problem it solved.

## Why It Was Removed
- Reason 1
- Reason 2

## Key Code (for reference)
\`\`\`typescript
// Preserve any non-obvious logic that might be useful later
\`\`\`

## Related
- ADR-XXX (if applicable)
- PR/commit link (if available)
```

### Documentation Update Checklist

Before completing any significant work:
- [ ] Does this change warrant a new ADR? → Create in `/docs/ADR/`
- [ ] Did I remove/deprecate something? → Document in `/docs/history/`
- [ ] Did I change how something works? → Update this AGENT.md
- [ ] Did I add a new pattern/convention? → Add to relevant section above
