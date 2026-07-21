# Architecture Guidelines

This document defines the architectural principles, patterns, and subsystems of the Mermaid Live Editor. All contributors should familiarize themselves with these guidelines before making significant changes.

---

## 1. Architectural Principles

### 1.1 Client-Side Only (No backend dependency)

**Why**: The editor is designed to be a fully self-contained, privacy-respecting tool that runs entirely in the browser.

**Implications**:
- All diagram rendering happens via Mermaid.js in the browser
- No server-side processing or storage
- No user data is transmitted to external servers
- Can be hosted as static files on any CDN/hosting platform
- Works offline (after initial load)

**Pattern Enforcement**:
- Never introduce API calls to remote services (except for external library CDNs)
- All features must work without network connectivity after initial page load
- User data remains in the browser's `localStorage` and never leaves the client

---

### 1.2 State Persistence Strategy (LocalStorage + URL)

**Why**: Users need diagrams to persist across sessions and be shareable via URL, without requiring accounts or databases.

**Dual Persistence Architecture**:

#### LocalStorage (Session Continuity)
**Location**: All `useLocalStorage` calls live exclusively in [src/App.tsx](../src/App.tsx)

```typescript
const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
const [editorSettings] = useLocalStorage<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
```

**Rules**:
- **NEVER** add new `useLocalStorage` calls outside `App.tsx`
- Pass state down via props to child components
- Use functional updates when state depends on previous value
- Handle JSON serialization errors gracefully (see [use-local-storage.ts](../src/hooks/use-local-storage.ts))

**Keys**:
- `mermaid-code`: Diagram source code
- `mermaid-config`: Mermaid rendering configuration (theme, look, etc.)
- `layout-direction`: UI layout (horizontal/vertical)
- `app-theme`: Application theme (light/dark)
- `editor-settings`: Monaco editor preferences

#### URL State (Sharing)
**Location**: [src/lib/share.ts](../src/lib/share.ts)

**Why URL hash instead of query params**:
- Hash fragments never sent to server (privacy)
- Avoids HTTP 431 errors for large diagrams
- Works with static hosting (no server-side routing needed)

**Encoding Strategy**:
```
Diagram Code → JSON → UTF-8 Bytes → Base64 → URL-safe Base64
```

**Pattern**:
```typescript
// Encode: State → URL
const encoded = encodeState({ code, config });
url.hash = encoded;  // Encoded string placed directly in hash (no prefix)

// Decode: URL → State  
const urlState = parseUrlState();
if (urlState?.code) {
  setCode(urlState.code);
  setConfig(urlState.config);
}
```

**Trade-offs**:
- Base64 encoding increases size by ~33% vs raw JSON
- No compression (unlike mermaid.live which uses pako/zlib) for simplicity and zero-dependency encoding
- URL length limits (~2KB for IE, ~100KB for modern browsers) constrain shareable diagram size

---

### 1.3 Performance (Debouncing, Lazy Loading)

**Why**: Mermaid rendering is computationally expensive. Rendering on every keystroke would block the UI and drain battery.

#### Debounced Rendering
**Location**: [src/components/DiagramPreview.tsx](../src/components/DiagramPreview.tsx)

```typescript
useEffect(() => {
  if (renderTimeoutRef.current) {
    clearTimeout(renderTimeoutRef.current);
  }
  
  renderTimeoutRef.current = setTimeout(() => {
    renderDiagram();
  }, 300); // 300ms debounce
  
  return () => clearTimeout(renderTimeoutRef.current);
}, [code, config, renderDiagram]);
```

**Why 300ms**: Balance between responsiveness and performance. Users typing quickly won't trigger renders; pauses feel instant.

**Effect**: Reduces render calls by ~90% during active editing.

#### Lazy Loading of CodeEditor
**Location**: [src/App.tsx](../src/App.tsx)

```typescript
const CodeEditor = lazy(() => 
  import('@/components/CodeEditor').then(module => ({ 
    default: module.CodeEditor 
  }))
);
```

**Why**: Monaco Editor bundle is large (~2MB). Lazy loading:
- Reduces initial bundle size
- Improves Time to Interactive (TTI)
- Allows preview-only users to skip downloading the editor entirely

**Fallback**: `<Suspense>` with `<Skeleton>` provides visual feedback during load.

#### Mermaid Module Initialization and Serialization
**Location**: [src/lib/mermaid.ts](../src/lib/mermaid.ts)

```typescript
let renderChain: Promise<unknown> = Promise.resolve();

// Every effective-config + detached-container render + cleanup operation
// is one critical section against Mermaid's mutable singleton.
```

Configuration is normalized and initialized only when its effective value changes. Failed,
superseded, and unmounted operations restore the last committed configuration before the queue is
released.

---

## 2. Core Subsystems

### 2.1 Editor (Monaco/CodeMirror wrapper)

**Current Implementation**: Monaco Editor (via `@monaco-editor/react`)

**Location**: [src/components/CodeEditor.tsx](../src/components/CodeEditor.tsx)

**Responsibilities**:
- Syntax highlighting (uses `mermaid` language mode)
- Code editing with undo/redo (separate from diagram history)
- Keyboard shortcuts integration
- Synchronous context-aware keyword and starter-snippet completion
- One best-effort marker from the committed debounced render diagnostic

**Interface Contract**:
```typescript
type CodeEditorProps = {
  value: string;
  onChange: (newCode: string) => void;
  settings: EditorSettings;
  errorMarker?: RenderDiagnostic | null;
};
```

**Key Pattern**: Controlled component. `App.tsx` owns the code state; editor is a pure UI.
Markers use owner `mermaid`, so Monaco's native F8 and Shift+F8 navigation remains available.

**Why Monaco**: 
- Industry-standard editor (VS Code's core)
- Excellent TypeScript/syntax support
- Mature API and community

**Extensibility**: Could swap for CodeMirror 6 if Monaco's bundle size becomes prohibitive. Wrapper component isolates this choice.

---

### 2.2 Preview Engine (Mermaid.js integration)

**Location**: [src/lib/mermaid.ts](../src/lib/mermaid.ts)

**Architecture**:
```
Code → 300 ms debounce → request epoch → serialized renderMermaid() → SVG
                                           ↓                         ↓
                                  detached render DOM       last-good / export
                                           ↓                         ↓
                                  guaranteed cleanup        preview + diagnostic
```

**Key Functions**:

#### `renderMermaid(code, elementId, config)`
**Returns**: `{ svg: string }`
**Throws**: Parse/rendering errors

**Process**:
1. Wait for exclusive access to the Mermaid singleton.
2. Establish the normalized effective config only when it changed.
3. Render into a unique detached offscreen container.
4. Post-process SVG (sequence diagram coloring).
5. Remove temporary and orphan DOM on every outcome.
6. Restore committed config after failure, supersession, or unmount.
7. Return SVG string.

**Preview commit contract**: A monotonic epoch and mounted guard allow only the newest logical
request to commit. Compatible syntax failures retain and dim the previous valid SVG; a changed or
missing root type uses the blocking error card. Visual export continues from the retained SVG with
an explicit stale warning. On mobile, the preview remains mounted while its tab is hidden so editor
changes continue through the same render and diagnostic pipeline.

**Pan/zoom and minimap contract**: `PanZoomContainer` is the single owner of preview scale and
position. The desktop minimap receives the committed displayed SVG, measured layout, and those same
state values; it never re-renders Mermaid or owns a parallel transform. See
[ADR-003](./ADR/003-diagram-minimap-navigation.md).

#### `postProcessSequenceDiagramSvg(svg, code)`
**Purpose**: Auto-color sequence diagram actors when user hasn't defined explicit `box` directives.

**Logic**:
- Detect sequence diagrams (`/^sequencediagram/i`)
- Skip if user-defined `box` directives exist (respect user intent)
- Find actor rectangle elements in SVG DOM
- Apply color palette from `SEQUENCE_COLORS` array
- Adjust text color for contrast

**Why**: Mermaid's default sequence diagrams are monochrome. Auto-coloring improves readability without forcing users to manually define box colors.

**Trade-off**: SVG DOM manipulation adds ~50-100ms for large diagrams. Acceptable given the visual improvement.

---

### 2.3 Export Engine (SVG → Canvas → PNG)

**Location**: [src/lib/export.ts](../src/lib/export.ts)

**Problem**: Mermaid renders diagrams as SVG. Users need PNG (for documents, presentations) and clipboard support.

**Architecture**:
```
SVG String → prepareSVGForExport() → Data URL → Image → Canvas → PNG Blob
```

#### Key Challenges & Solutions

See [ADR-001: SVG to Canvas Export Strategy](../docs/ADR/001-svg-to-canvas-export.md) for detailed rationale.

**Challenge 1: Tainted Canvas**
- **Problem**: `URL.createObjectURL()` blob URLs trigger cross-origin errors
- **Solution**: Use base64 data URLs (`data:image/svg+xml;base64,...`)

**Challenge 2: Missing Styles**
- **Problem**: SVG rendered in isolation loses CSS from page stylesheets
- **Solution**: `prepareSVGForExport()` inlines computed styles

```typescript
const prepareSVGForExport = (svgString: string): string => {
  // 1. Parse SVG
  const svgElement = parseSVGString(svgString);
  
  // 2. Temporarily append to DOM to access computed styles
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  document.body.appendChild(container);
  container.appendChild(svgElement);
  
  // 3. Walk all elements and inline computed styles
  const elements = svgElement.querySelectorAll('*');
  elements.forEach(el => {
    const computed = window.getComputedStyle(el);
    const criticalProps = ['fill', 'stroke', 'font-family', ...];
    criticalProps.forEach(prop => {
      el.style[prop] = computed[prop];
    });
  });
  
  // 4. Add white background
  const rect = document.createElementNS('...', 'rect');
  rect.setAttribute('fill', 'white');
  svgElement.insertBefore(rect, svgElement.firstChild);
  
  // 5. Clean up
  document.body.removeChild(container);
  return svgElement.outerHTML;
};
```

**Challenge 3: Canvas Size Limits**
- **Problem**: Large diagrams at 3x scale exceed browser canvas limits (268M pixels)
- **Solution**: `getMaxSafeScale()` auto-reduces scale (3x → 2x → 1x)

**Challenge 4: Clipboard API**
- **Problem**: `ClipboardItem` only accepts PNG blobs, not SVG
- **Solution**: Always render to PNG via canvas before clipboard write

#### Export Formats

**SVG Export**: Direct download of `prepareSVGForExport()` output
- Smallest file size
- Infinite scalability
- Preserves all visual fidelity

**PNG Export**: Canvas rendering with configurable scale (1x-4x)
- Default: 3x for high-DPI displays
- Universal compatibility
- Larger file size

**Markdown Export**: Wraps code in triple-backtick fence
```markdown
\`\`\`mermaid
[diagram code]
\`\`\`
```

---

### 2.4 URL State Manager (Compression/Encoding)

**Location**: [src/lib/share.ts](../src/lib/share.ts)

**Interface**:
```typescript
interface ShareableState {
  code: string;
  config?: MermaidConfig;
  panZoom?: { x: number; y: number; zoom: number };
}

encodeState(state: ShareableState): string
decodeState(encoded: string): ShareableState | null
generateShareUrl(state: ShareableState): string
parseUrlState(): ShareableState | null
copyShareUrl(state: ShareableState): Promise<void>
```

**Encoding Pipeline**:
```
1. Serialize to JSON
2. UTF-8 encode (TextEncoder)
3. Base64 encode (btoa)
4. URL-safe transform (+ → -, / → _, remove padding)
```

**URL Structure**:
```
https://example.com/#state=eyJjb2RlIjoiZ3JhcGggVEQifQ
                           ↑
                           Base64-encoded state
```

**Decoding Pipeline**:
```
1. URL-safe decode (reverse transform, restore padding)
2. Base64 decode (atob)
3. UTF-8 decode (TextDecoder)
4. Parse JSON
```

**Error Handling**:
- Invalid base64: Return `null`, don't crash
- Invalid JSON: Return `null`, log error
- Corrupted URL: Silently ignore, use localStorage state

**Why No Compression**: 
- Native browser APIs (no dependencies)
- Simpler debugging (base64 is human-inspectable)
- Most diagrams < 2KB (well under URL limits)
- Could add pako compression later if needed

---

## 3. Data Flow

### 3.1 Unidirectional Data Flow

**Architectural Pattern**: Flux-inspired unidirectional flow

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State (Source of Truth)                              │   │
│  │ - code: string                                       │   │
│  │ - config: MermaidConfig                              │   │
│  │ - layout: LayoutDirection                            │   │
│  │ - currentSvgString: string                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                      ↓          ↑                            │
│                   Props     Callbacks                        │
│                      ↓          ↑                            │
│  ┌─────────────┐    │    ┌──────────────┐    ┌───────────┐ │
│  │ CodeEditor  │────┴────│ DiagramPreview│    │ Toolbar   │ │
│  │             │onChange │               │    │           │ │
│  │             │         │  onSvgRendered│    │           │ │
│  └─────────────┘         └───────────────┘    └───────────┘ │
│         ↓                       ↓                            │
│    useLocalStorage         renderMermaid()                   │
│         ↓                       ↓                            │
│    localStorage            Mermaid.js                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:

1. **Single Source of Truth**: `App.tsx` owns all shared state
2. **Props Down**: State flows down to child components as props
3. **Events Up**: Child components call callbacks to request state changes
4. **No Prop Drilling Beyond 2 Levels**: Use context if needed (currently not needed)

**Example Flow: User Edits Code**

```typescript
// 1. User types in CodeEditor
<CodeEditor code={code} onChange={handleCodeChange} />

// 2. CodeEditor invokes callback
const handleCodeChange = (newCode: string) => {
  setCode(newCode);           // Update state
  pushCode(newCode);          // Update history
  setHistoryState({...});     // Update undo/redo UI
};

// 3. React re-renders with new props
<CodeEditor code={newCode} />      // Re-renders with new code
<DiagramPreview code={newCode} />  // Re-renders preview

// 4. DiagramPreview debounces and renders
useEffect(() => {
  clearTimeout(renderTimeoutRef.current);
  renderTimeoutRef.current = setTimeout(() => {
    renderDiagram();  // Call after 300ms
  }, 300);
}, [code]);

// 5. Mermaid renders, preview updates
const { svg } = await renderMermaid(code, elementId, config);
onSvgRendered(svg);  // Callback to App.tsx

// 6. App stores SVG for export
const handleSvgRendered = (svgString: string) => {
  setCurrentSvgString(svgString);
};
```

**Why Unidirectional**:
- Predictable state mutations
- Easy to debug (state changes flow upward through callbacks)
- Avoids circular dependencies
- Facilitates time-travel debugging (undo/redo)

---

### 3.2 Event Handling

**Keyboard Shortcuts**:
- **Location**: [src/hooks/use-keyboard-shortcuts.ts](../src/hooks/use-keyboard-shortcuts.ts)
- **Pattern**: Global event listener on `document`, filtered by key combinations
- **Integration**: Hook called in `App.tsx`, receives callbacks as dependencies

```typescript
useKeyboardShortcuts({
  onUndo: handleUndo,
  onRedo: handleRedo,
  onCopy: handleCopyCode,
  onExport: (format) => handleExport(format),
  // ...
});
```

**Why Centralized**: Prevents conflicts, provides consistent shortcuts, easy to document.

**File Exports**:
- **Pattern**: Download via hidden `<a>` element with blob URL
- **Cleanup**: Always revoke blob URLs after download to prevent memory leaks

```typescript
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);  // Critical: cleanup
};
```

**Clipboard Operations**:
- **API**: `navigator.clipboard.write()` for images, `.writeText()` for text
- **Permissions**: Prompts user if not granted
- **Fallback**: None (modern browsers only; graceful error messages)

**Toast Notifications**:
- **Library**: Sonner (`import { toast } from 'sonner'`)
- **Pattern**: Fire-and-forget, non-blocking feedback
- **Types**: `toast.success()`, `toast.error()`, `toast.info()`

---

## 4. Dependency Management

### 4.1 Key Libraries (Mermaid, Vite, React)

**Core Dependencies** (see [package.json](../package.json)):

| Library | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| `react` | ^18.3 | UI framework | Industry standard, hooks-based, excellent ecosystem |
| `mermaid` | ^11.4 | Diagram rendering | Core functionality, updated frequently for new diagram types |
| `vite` | ^6.0 | Build tool | Fast dev server, superior HMR, zero-config ESM |
| `@monaco-editor/react` | ^4.6 | Code editor | VS Code editor, syntax highlighting, TypeScript support |
| `tailwindcss` | ^3.4 | Styling | Utility-first CSS, excellent with shadcn/ui |
| `@phosphor-icons/react` | ^2.1 | Icons | Consistent duotone style, tree-shakeable |
| `sonner` | ^1.7 | Toast notifications | Minimal API, accessible, beautiful defaults |

**UI Component Library**:
- **shadcn/ui**: NOT a dependency (copy-paste components)
- **Style**: `new-york` variant
- **Why**: Zero runtime overhead, full control, easy customization

**Testing**:
- `vitest` + `jsdom`: Fast, Vite-native, ESM-compatible
- `@testing-library/react`: Standard for React component testing

**Why Vite over Webpack**:
- Dev server starts in <500ms vs 10+ seconds
- HMR is instant (ESM-native)
- Zero config for TypeScript, JSX, CSS
- Build output is smaller (better tree-shaking)

---

### 4.2 Adding New Dependencies

**Decision Framework**:

#### Before Adding Any Dependency, Ask:

1. **Can we build it ourselves in < 1 day?**
   - If yes: Build it. Dependencies are liabilities.
   - Example: We built `useLocalStorage`, `useHistory` instead of using libraries.

2. **Does it align with architectural principles?**
   - Client-side only: No backend dependencies (Express, databases, etc.)
   - Privacy: No analytics, tracking, or telemetry libraries
   - Performance: No heavy frameworks if a light library suffices

3. **Bundle size impact**:
   - Run `npm run build` and check `dist/` sizes before/after
   - Use `vite-bundle-visualizer` to analyze
   - **Threshold**: Reject if adds >100KB to production bundle (exceptions for core features)

4. **Maintenance risk**:
   - Is it actively maintained? (commits in last 6 months)
   - Does it have breaking changes frequently? (check changelog)
   - Is it widely used? (>10k weekly downloads on npm)

5. **Tree-shaking support**:
   - Prefer ESM-native libraries over CommonJS
   - Check if library exports are side-effect-free (`package.json` `"sideEffects": false`)

#### Approval Process:

**Small libraries** (< 10KB, utility functions):
- Add directly, document in commit message

**Medium libraries** (10-100KB, UI components):
- Open issue with justification:
  - Problem it solves
  - Alternatives considered
  - Bundle size impact
  - Maintenance status
- Get approval from maintainer

**Large libraries** (> 100KB, frameworks):
- MUST have architecture discussion
- Write ADR (Architecture Decision Record) in `docs/ADR/`
- Consider lazy loading/code splitting

#### Examples:

**Good Additions**:
- `sonner`: 3KB, solves real UX need (toasts), actively maintained
- `@phosphor-icons/react`: Tree-shakeable, beautiful icons, consistent style

**Bad Additions**:
- `lodash`: Too large, utility functions are trivial to implement
- `moment.js`: Huge, unmaintained, use native `Intl` APIs
- `axios`: Unnecessary, use native `fetch`

**Exception Case**:
- `mermaid`: Large (~500KB), but it's THE core feature. Accepted.

---

## Summary: Architectural Invariants

These rules must NEVER be violated without an ADR:

1. **Zero backend dependencies** (no APIs, no servers, no databases)
2. **`useLocalStorage` only in `App.tsx`** (no exceptions)
3. **No prop drilling beyond 2 levels** (use context if needed)
4. **Debounce all expensive operations** (rendering, exports)
5. **Inline styles for SVG exports** (never rely on external CSS)
6. **Clean up side effects** (timers, blob URLs, event listeners)
7. **localStorage writes must be try/catch wrapped** (quota errors)
8. **Export functions must handle large diagrams** (auto-scale reduction)
9. **URL state must never crash the app** (graceful fallback to localStorage)
10. **New dependencies require bundle size analysis** (reject if >100KB impact)

---

## See Also

- [PRD.md](./PRD.md) - Product requirements and features
- [AGENT.md](./AGENT.md) - AI assistant collaboration guidelines
- [ADR/](./ADR/) - Architecture Decision Records
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Developer quick reference
