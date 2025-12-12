# Mermaid Live Editor - Copilot Instructions

## Architecture Overview

This is a **GitHub Spark** application—a React-based mermaid diagram editor with real-time preview. Key architecture decisions:

- **Single-page app** in `src/App.tsx` - manages all state and coordinates components
- **Persistence via `useKV`** from `@github/spark/hooks` - auto-saves code, config, and settings to Spark's KV store
- **Client-side only** - all diagram rendering and export happens in-browser using mermaid.js
- **Responsive layout** - split panels on desktop, tabbed view on mobile (via `useIsMobile` hook)

### Core Data Flow
```
User types → CodeEditor → setCode(useKV) → DiagramPreview → renderMermaid → SVG output → Export/Copy
```

## Key Files & Patterns

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Main app shell, state management, layout switching |
| `src/lib/mermaid.ts` | Mermaid initialization and rendering wrapper |
| `src/lib/export.ts` | SVG/PNG/markdown export with style inlining |
| `src/lib/constants.ts` | Default config, editor settings, diagram examples |
| `src/types/index.ts` | TypeScript types for config, exports, examples |

## Development Commands

```bash
npm run dev      # Start Vite dev server (port 5000)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run kill     # Kill process on port 5000 if stuck
```

## UI Components

Uses **shadcn/ui** (new-york style) with Radix primitives. Components are in `src/components/ui/`.

- Import UI components from `@/components/ui/[component]`
- Use `cn()` from `@/lib/utils` for className merging
- Icons: Use `@phosphor-icons/react` with `weight="duotone"` for consistency
- Toasts: Use `sonner` via `toast.success()`, `toast.error()`

### Adding shadcn Components
Check `components.json` for config. The alias structure:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`

## Spark-Specific Patterns

### State Persistence
```tsx
// Always use useKV for user data that should persist
const [code, setCode] = useKV('mermaid-code', DEFAULT_DIAGRAM_CODE);
```

### Required Imports
```tsx
import "@github/spark/spark" // Required in main.tsx
import { useKV } from '@github/spark/hooks';
```

### Vite Config
The `sparkPlugin()` and `createIconImportProxy()` in `vite.config.ts` are **required**—do not remove.

## Export Implementation

PNG exports use 3x scale for high resolution. The export flow:
1. Capture current SVG string from `DiagramPreview`
2. Inline computed styles via `prepareSVGForExport()`
3. Convert to canvas at 3x scale for PNG
4. Trigger download or clipboard copy

## Mermaid Configuration

Config is JSON stored via `useKV`. Support these themes: `default`, `forest`, `dark`, `neutral`, `base`. The `ConfigDialog` allows JSON editing with validation.

## Adding Diagram Examples

Add new examples to `DIAGRAM_EXAMPLES` array in `src/lib/constants.ts`:
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  type: 'flowchart', // DiagramType from types/index.ts
  description: 'Brief description',
  code: `mermaid code here`,
}
```

## CSS & Theming

- Tailwind 4 with CSS variables in `src/index.css`
- Radix color scales imported in `src/styles/theme.css`
- Custom theme overrides via `theme.json` (loaded by tailwind.config.js)
- Editor background: `var(--editor-bg)`, foreground: `var(--editor-fg)`
