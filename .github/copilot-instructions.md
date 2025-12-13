# Mermaid Live Editor - Copilot Instructions

## Before You Start

**Read the documentation first.** Before making any changes:

1. **Read `/docs/PRD.md`** — Understand product requirements and scope
2. **Read `/docs/ADR/`** — Review all Architecture Decision Records
3. **Check `/docs/HISTORY.md`** — Understand what's been tried/removed and why
4. **Read `/docs/DEVELOPER_GUIDE.md`** — Setup, core concepts, and contribution workflow
5. **Read `/docs/ARCHITECTURE_GUIDELINES.md`** — Architectural principles and patterns
6. **Read `/docs/DESIGN_GUIDELINES.md`** — UI/UX and styling standards
7. **Read `/docs/TESTING_GUIDELINES.md`** — Testing strategy and best practices

For detailed AI agent instructions, see `/docs/AGENT.md`.

## Architecture

React 19 + TypeScript app for editing mermaid diagrams with real-time preview. All rendering is client-side. No backend, no auth, no database.

**Core data flow:**
```
CodeEditor → setCode(useLocalStorage) → DiagramPreview → renderMermaid() → SVG → Export
```

**Project Structure:**
```
├── src/
│   ├── components/      # React components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── styles/          # CSS files (globals.css)
│   ├── test/            # Test setup
│   └── types/           # TypeScript types
├── docs/                # Documentation (PRD, history)
└── .devcontainer/       # Codespaces configuration
```

**Key files:**
- <a>src/App.tsx</a> - Central state hub, all `useLocalStorage` calls live here
- <a>src/lib/mermaid.ts</a> - Mermaid rendering wrapper
- <a>src/lib/export.ts</a> - SVG/PNG export with style inlining
- <a>src/lib/constants.ts</a> - Defaults and diagram examples
- <a>src/types/index.ts</a> - TypeScript types (DiagramType, MermaidConfig, etc.)

## Commands

```bash
npm run dev          # Vite dev server (port 5000)
npm run build        # tsc + vite build
npm run preview      # Preview production build
npm run test         # vitest (single run)
npm run test:watch   # vitest in watch mode
npm run test:coverage # vitest with coverage report
npm run test:e2e     # Playwright integration tests
npm run lint         # ESLint
npm run clean        # Clear build cache
```

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety (strict mode)
- **Tailwind CSS 4** - Styling with `@tailwindcss/vite`
- **Monaco Editor** - Code editor (lazy loaded)
- **Mermaid** - Diagram rendering (v11+, lazy initialized)
- **shadcn/ui** - UI components (new-york style)
- **Radix UI** - Accessible primitives
- **Vitest + jsdom** - Unit testing
- **Playwright** - E2E testing
- **@phosphor-icons/react** - Icons (`weight="duotone"`)
- **sonner** - Toast notifications
- **react-resizable-panels** - Split pane layout

## Critical Patterns

### State Persistence (localStorage)
All persisted state uses `useLocalStorage` from `@/hooks/use-local-storage`. Keys are defined only in `App.tsx`:
```tsx
const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
```
**Never add `useLocalStorage` calls outside App.tsx** — pass state via props instead.

### Diagram Rendering
`DiagramPreview` debounces rendering (300ms) and reports SVG via `onSvgRendered` callback. The mermaid module is lazily initialized in `lib/mermaid.ts`.

### Export Flow
1. `DiagramPreview` emits SVG string via `onSvgRendered`
2. `prepareSVGForExport()` inlines styles, adds xmlns
3. PNG: render to canvas at configurable scale (1x-4x), default 3x

## UI Conventions

- **Components:** shadcn/ui (new-york style) in `src/components/ui/`
- **Icons:** `@phosphor-icons/react` with `weight="duotone"`
- **Toasts:** `import { toast } from 'sonner'` — use `toast.success()`, `toast.error()`
- **Class merging:** `cn()` from `@/lib/utils`
- **Styling:** Single CSS entry point at `src/styles/globals.css`

## Testing

Tests use Vitest + jsdom. Setup in <a>src/test/setup.ts</a> mocks:
- `mermaid` module (render, parse, initialize)
- `navigator.clipboard` APIs
- Canvas context for export tests

Test files are colocated: `Component.tsx` → `Component.test.tsx`

**Run single test file:**
```bash
npm test -- src/lib/export.test.ts
```

**E2E Tests:**
- Framework: Playwright
- See `docs/integration-testing.md` for setup and coverage
- Run with: `npm run test:e2e`

**What to mock:**
- `mermaid` module — already mocked globally
- `navigator.clipboard` — already mocked globally  
- Canvas context — already mocked globally
- Do NOT mock React hooks or localStorage (use real implementations)

## Adding Diagram Examples

Add to `DIAGRAM_EXAMPLES` array in <a>src/lib/constants.ts</a>:
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  type: 'flowchart', // Must match DiagramType in types/index.ts
  description: 'Brief description',
  code: `mermaid syntax here`,
}
```

## Keyboard Shortcuts

Defined in <a>src/hooks/use-keyboard-shortcuts.ts</a>. Add new shortcuts by extending the `KeyboardShortcuts` interface and handling in `handleKeyDown`.

## URL Sharing

<a>src/lib/share.ts</a> encodes state as base64 in URL query params. Uses browser-native `btoa`/`atob` (no external compression library).

## Code Style & Best Practices

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

**TypeScript:**
- Prefer `type` over `interface` for object shapes
- Export types from `src/types/index.ts`
- Use strict mode — no `any` without justification

**React:**
- Use named exports (not default exports, except lazy-loaded components)
- Functional components with arrow functions
- Use `useEffect` cleanup functions for subscriptions

## What NOT to Do

- ❌ Don't create new CSS files — use `globals.css` or Tailwind utilities
- ❌ Don't add state persistence outside `App.tsx`
- ❌ Don't use default exports (except for lazy-loaded components)
- ❌ Don't bypass the `cn()` utility for conditional classes
- ❌ Don't add `@import` statements in component-level styles
- ❌ Don't mock localStorage in tests — the hook handles it
- ❌ Don't use lucide-react icons — use `@phosphor-icons/react` instead
- ❌ Don't add backend dependencies — this is a client-side-only app
- ❌ Don't add `useLocalStorage` calls outside `App.tsx`

## Common Tasks

### Add a keyboard shortcut
1. Extend `KeyboardShortcuts` interface in `src/hooks/use-keyboard-shortcuts.ts`
2. Add handler in `handleKeyDown`
3. Add documentation to `KEYBOARD_SHORTCUTS` in `src/lib/constants.ts`

### Add a new export format
1. Add to `ExportFormat` type in `src/types/index.ts`
2. Implement in `src/lib/export.ts` following `exportSVG`/`exportPNG` pattern
3. Add case in `exportDiagram` switch
4. Update `Toolbar.tsx` export menu

### Add a UI component
1. Use shadcn CLI: `npx shadcn@latest add <component-name>`
2. Components go in `src/components/ui/` (new-york style)
3. Use `@phosphor-icons/react` for icons with `weight="duotone"`
4. Apply styles with Tailwind utilities and `cn()` helper

## Architecture Decisions

Significant architectural decisions are documented in `/docs/ADR/`. When making decisions that affect data flow, state management, export/rendering strategies, third-party library choices, performance trade-offs, or security considerations, create a new ADR.

**ADR Template:** See `/docs/AGENT.md` for the ADR template format.

## Documentation Updates

Before completing any significant work:
- Does this change warrant a new ADR? → Create in `/docs/ADR/`
- Did I remove/deprecate something? → Document in `/docs/history/`
- Did I change how something works? → Update relevant docs
- Did I add a new pattern/convention? → Add to this file or `/docs/AGENT.md`
