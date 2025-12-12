# Mermaid Live Editor - Copilot Instructions

## Architecture

React app for editing mermaid diagrams with real-time preview. All rendering is client-side.

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
- [src/App.tsx](../src/App.tsx) - Central state hub, all `useLocalStorage` calls live here
- [src/lib/mermaid.ts](../src/lib/mermaid.ts) - Mermaid rendering wrapper
- [src/lib/export.ts](../src/lib/export.ts) - SVG/PNG export with style inlining
- [src/lib/constants.ts](../src/lib/constants.ts) - Defaults and diagram examples
- [src/types/index.ts](../src/types/index.ts) - TypeScript types (DiagramType, MermaidConfig, etc.)

## Commands

```bash
npm run dev          # Vite dev server (port 5000)
npm run build        # tsc + vite build
npm run preview      # Preview production build
npm run test         # vitest (single run)
npm run test:watch   # vitest in watch mode
npm run lint         # ESLint
npm run clean        # Clear build cache
```

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

Tests use Vitest + jsdom. Setup in [src/test/setup.ts](../src/test/setup.ts) mocks:
- `mermaid` module (render, parse, initialize)
- `navigator.clipboard` APIs
- Canvas context for export tests

Test files are colocated: `Component.tsx` → `Component.test.tsx`

## Adding Diagram Examples

Add to `DIAGRAM_EXAMPLES` array in [src/lib/constants.ts](../src/lib/constants.ts):
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

Defined in [src/hooks/use-keyboard-shortcuts.ts](../src/hooks/use-keyboard-shortcuts.ts). Add new shortcuts by extending the `KeyboardShortcuts` interface and handling in `handleKeyDown`.

## URL Sharing

[src/lib/share.ts](../src/lib/share.ts) encodes state as base64 in URL query params. Uses browser-native `btoa`/`atob` (no external compression library).
