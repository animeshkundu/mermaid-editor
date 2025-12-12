# AGENT.md — Mermaid Live Editor

AI agent instructions for working with this codebase. This file is optimized for GitHub Copilot, Claude, Cursor, and similar AI coding assistants.

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
CodeEditor → setCode(useLocalStorage) → DiagramPreview → renderMermaid() → SVG → Export
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
