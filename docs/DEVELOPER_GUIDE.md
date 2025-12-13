# Developer Guide

A comprehensive guide for developers contributing to Mermaid Live Editor.

---

## 1. Introduction

### 1.1 Project Purpose

Mermaid Live Editor is a modern, client-side alternative to [Mermaid Live Editor](https://mermaid.live) for creating and editing Mermaid diagrams. Unlike the official editor, our implementation:

- **Runs entirely client-side** - No backend servers, no accounts, no data collection
- **Privacy-first** - All data stays in your browser's localStorage
- **Zero paywalls** - All features are free and open-source
- **Modern stack** - Built with React 19, Vite, TypeScript, and Tailwind CSS 4

The project provides a professional-grade diagram editor with real-time preview, comprehensive export options, and URL sharing—all without requiring server infrastructure.

### 1.2 Key Features

#### Real-Time Preview
- **Live rendering** using Mermaid.js as users type
- **300ms debounce** to balance responsiveness and performance
- **Error handling** with helpful messages displayed in the preview pane

#### Export Capabilities
- **SVG export** - Vector format with embedded styles
- **PNG export** - Raster format at 1x-4x scale (default 3x for retina displays)
- **Markdown export** - Code block format for documentation
- **Clipboard copy** - Direct PNG image copy to system clipboard

#### URL Sharing
- **State encoding** in URL hash fragment (base64-encoded JSON)
- **Privacy-preserving** - Hash never sent to server
- **No server required** - Works with static hosting
- **Shareable links** - Send diagrams via URL with full configuration

#### Developer Experience
- **TypeScript** - Full type safety throughout the codebase
- **Component tests** - Vitest with jsdom for unit and integration tests
- **Hot Module Replacement** - Instant feedback during development
- **Monaco Editor** - Professional code editing with syntax highlighting

---

## 2. Getting Started

### 2.1 Prerequisites

Ensure you have the following installed:

- **Node.js** 18 or higher
- **npm** 9 or higher

Verify your installation:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
```

### 2.2 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/animeshkundu/mermaid-editor.git
   cd mermaid-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install:
   - React 19 and React DOM
   - Vite for build tooling
   - Monaco Editor for code editing
   - Mermaid.js for diagram rendering
   - Tailwind CSS 4 for styling
   - shadcn/ui components
   - Testing tools (Vitest, jsdom)

3. **Verify installation**
   ```bash
   npm run lint   # Should complete without errors
   npm run test   # Should pass all tests
   ```

### 2.3 Running Local Development

Start the development server:
```bash
npm run dev
```

The application will be available at **http://localhost:5000**

**What happens when you run `npm run dev`:**
- Vite starts a development server with HMR (Hot Module Replacement)
- TypeScript compilation runs in the background
- Tailwind CSS processes your styles
- Monaco Editor is lazy-loaded when first accessed

**Development workflow:**
1. Edit files in `src/`
2. Browser auto-refreshes with changes (HMR)
3. Check console for TypeScript/lint errors
4. Run tests in watch mode: `npm run test:watch`

**Other useful commands:**
```bash
npm run build         # Production build (outputs to dist/)
npm run preview       # Preview production build locally
npm run test:coverage # Generate test coverage report
npm run clean         # Clear build cache and node_modules/.vite
```

---

## 3. Project Structure

### 3.1 Directory Layout

```
mermaid-editor/
├── src/                        # Application source code
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives (button, dialog, etc.)
│   │   ├── App.tsx             # Root component, state hub
│   │   ├── CodeEditor.tsx      # Monaco editor wrapper
│   │   ├── DiagramPreview.tsx  # Mermaid rendering component
│   │   ├── Toolbar.tsx         # Top navigation and actions
│   │   ├── ConfigDialog.tsx    # Mermaid config editor
│   │   └── PanZoomContainer.tsx # Pan/zoom controls for preview
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-local-storage.ts    # localStorage persistence
│   │   ├── use-history.ts          # Undo/redo functionality
│   │   ├── use-keyboard-shortcuts.ts # Keyboard event handling
│   │   └── use-mobile.ts           # Mobile detection
│   ├── lib/                    # Utility functions and business logic
│   │   ├── mermaid.ts          # Mermaid rendering wrapper
│   │   ├── export.ts           # SVG/PNG export logic
│   │   ├── share.ts            # URL encoding/decoding
│   │   ├── constants.ts        # Defaults and diagram examples
│   │   └── utils.ts            # General utilities (cn, etc.)
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # All shared types
│   ├── styles/                 # Global CSS
│   │   └── globals.css         # Tailwind imports and custom styles
│   ├── test/                   # Test setup and utilities
│   │   └── setup.ts            # Vitest configuration, mocks
│   └── main.tsx                # Application entry point
├── docs/                       # Documentation
│   ├── PRD.md                  # Product requirements
│   ├── ARCHITECTURE_GUIDELINES.md # Architecture patterns
│   ├── DEVELOPER_GUIDE.md      # This file
│   └── ADR/                    # Architecture Decision Records
├── public/                     # Static assets
├── dist/                       # Build output (generated)
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

### 3.2 Key Files & Entry Points

#### [src/main.tsx](../src/main.tsx)
**Entry point** - Renders the React app into the DOM:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### [src/App.tsx](../src/App.tsx)
**Central state hub** - All `useLocalStorage` calls live here:
- Manages diagram code, config, layout, theme
- Provides state to child components via props
- Handles URL state loading on mount
- Coordinates undo/redo history

**Critical pattern:** Never add `useLocalStorage` outside App.tsx. Pass state down via props.

#### [src/lib/mermaid.ts](../src/lib/mermaid.ts)
**Mermaid rendering wrapper** - Handles diagram rendering:
- Lazy initialization of Mermaid.js
- Error handling for invalid diagrams
- SVG extraction and cleanup
- Config application

#### [src/lib/export.ts](../src/lib/export.ts)
**Export pipeline** - SVG and PNG generation:
- `prepareSVGForExport()` - Inlines styles, adds xmlns
- `svgToPng()` - Renders SVG to canvas at configurable scale
- `exportDiagram()` - Handles all export formats
- `copyImageToClipboard()` - Clipboard API integration

#### [src/lib/share.ts](../src/lib/share.ts)
**URL sharing** - Encodes/decodes state:
- `encodeState()` - JSON → Base64 → URL-safe string
- `decodeState()` - Reverses encoding
- `copyShareUrl()` - Generates and copies shareable URL
- `parseUrlState()` - Extracts state from URL hash on load

#### [src/types/index.ts](../src/types/index.ts)
**Type definitions** - All TypeScript types:
```typescript
export type DiagramType = 'flowchart' | 'sequence' | 'class' | ...;
export type MermaidTheme = 'default' | 'forest' | 'dark' | 'neutral' | 'base';
export interface MermaidConfig { ... }
export interface EditorSettings { ... }
```

---

## 4. Core Concepts

### 4.1 State Management (LocalStorage + URL)

Mermaid Live Editor uses a **dual persistence strategy**:

#### LocalStorage (Session Continuity)
**Purpose:** Remember user's work across browser sessions  
**Location:** All `useLocalStorage` calls in [src/App.tsx](../src/App.tsx)

```typescript
const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
```

**Storage keys:**
- `mermaid-code` - Current diagram source code
- `mermaid-config` - Mermaid rendering configuration (theme, look, etc.)
- `layout-direction` - UI layout (`horizontal` or `vertical`)
- `app-theme` - Application theme (`light` or `dark`)
- `editor-settings` - Monaco editor preferences

**Implementation:** [src/hooks/use-local-storage.ts](../src/hooks/use-local-storage.ts)
- Syncs React state with localStorage
- Handles JSON serialization/deserialization
- Catches and logs parse errors gracefully
- Falls back to default value on corruption

**Architecture rule:** Never add `useLocalStorage` calls outside App.tsx. Pass state down via props instead.

#### URL State (Sharing)
**Purpose:** Share diagrams via URL without server infrastructure  
**Location:** [src/lib/share.ts](../src/lib/share.ts)

**Why hash fragment (`#`) instead of query params (`?`):**
- Hash never sent to server (privacy-preserving)
- Avoids HTTP 431 errors for large diagrams
- Works with static hosting (no server-side routing)

**Encoding pipeline:**
```
State Object → JSON → UTF-8 Bytes → Base64 → URL-safe Base64 → URL hash
```

**Example:**
```typescript
const state = { code: 'graph TD\n  A-->B', config: { theme: 'dark' } };
const encoded = encodeState(state);
// encoded: "eyJjb2RlIjoiZ3JhcGggVEQKICBBLS0+QiIsImNvbmZpZyI6eyJ0aGVtZSI6ImRhcmsifX0"
window.location.hash = `#state=${encoded}`;
```

**Loading from URL:**
```typescript
useEffect(() => {
  const urlState = parseUrlState();
  if (urlState?.code) {
    setCode(urlState.code);
    setConfig(urlState.config || DEFAULT_MERMAID_CONFIG);
    toast.success('Diagram loaded from URL');
  }
}, []);
```

**Trade-offs:**
- Base64 encoding increases size by ~33% vs raw JSON
- No compression (unlike mermaid.live which uses pako/zlib)
- URL length limits: ~2KB (IE), ~100KB (modern browsers)

### 4.2 Rendering Pipeline (Mermaid → SVG)

**Flow:** Code Editor → App state → DiagramPreview → Mermaid.js → SVG → DOM

#### Step 1: User Types in Editor
```typescript
// CodeEditor.tsx
<Editor
  value={code}
  onChange={(value) => onCodeChange(value || '')}
/>
```

#### Step 2: State Updates (with History)
```typescript
// App.tsx
const handleCodeChange = useCallback((newCode: string) => {
  setCode(newCode);           // Update localStorage
  pushCode(newCode);          // Push to undo/redo stack
}, [setCode, pushCode]);
```

#### Step 3: Debounced Rendering
```typescript
// DiagramPreview.tsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    renderDiagram();
  }, 300); // Wait 300ms after last keystroke
  
  return () => clearTimeout(timeoutId);
}, [code, config]);
```

**Why debounce?** Mermaid rendering is expensive (50-200ms). Rendering on every keystroke would:
- Block the UI thread
- Drain battery on mobile devices
- Create visual jitter

**300ms balance:** Fast enough to feel instant when pausing, slow enough to skip renders during active typing.

#### Step 4: Mermaid Rendering
```typescript
// lib/mermaid.ts
export const renderMermaid = async (code, elementId, config) => {
  // Lazy initialization (once per session)
  if (!isInitialized) {
    await mermaid.initialize(config);
    isInitialized = true;
  }
  
  // Generate unique ID
  const { svg } = await mermaid.render(`mermaid-${elementId}-${Date.now()}`, code);
  
  return svg;
};
```

#### Step 5: SVG Injection
```typescript
// DiagramPreview.tsx
const renderDiagram = async () => {
  try {
    const svg = await renderMermaid(code, 'preview', config);
    setCurrentSvg(svg);
    onSvgRendered?.(svg); // Notify parent for export
  } catch (error) {
    setError(error.message);
  }
};

// Insert into DOM
<div dangerouslySetInnerHTML={{ __html: currentSvg }} />
```

**Security:** `dangerouslySetInnerHTML` is safe here because:
- SVG is generated by Mermaid.js (trusted library)
- User code is parsed/sanitized by Mermaid before SVG generation
- No user-provided HTML is directly rendered

### 4.3 Export Pipeline (SVG → Canvas → PNG)

**Challenge:** Browser-rendered SVG includes styles from stylesheets, but exported SVG must be self-contained.

#### Step 1: Capture Current SVG
```typescript
// App.tsx
const [currentSvgString, setCurrentSvgString] = useState<string>('');

<DiagramPreview
  code={code}
  config={config}
  onSvgRendered={(svg) => setCurrentSvgString(svg)}
/>
```

#### Step 2: Prepare SVG for Export
```typescript
// lib/export.ts
export const prepareSVGForExport = (svgString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  
  // 1. Add xmlns for standalone rendering
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  // 2. Inline all computed styles
  inlineStyles(svg);
  
  // 3. Ensure proper dimensions
  ensureDimensions(svg);
  
  return new XMLSerializer().serializeToString(svg);
};
```

**Why inline styles?** When you export SVG and open it outside the browser:
- External stylesheets are not included
- Computed styles (from Tailwind, Mermaid themes) are lost
- Result: diagram appears unstyled

**Solution:** Walk the DOM tree and copy `window.getComputedStyle()` to inline `style` attributes.

#### Step 3: SVG to PNG Conversion
```typescript
// lib/export.ts
export const svgToPng = async (svgString: string, scale: number = 3): Promise<Blob> => {
  const { width, height } = getSVGDimensions(svgString);
  
  // 1. Create canvas at desired scale
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  
  // 2. Scale context for high-DPI rendering
  ctx.scale(scale, scale);
  
  // 3. Load SVG as image
  const img = new Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  
  // 4. Draw to canvas
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  
  // 5. Export as PNG blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
};
```

**Scale parameter:** Default 3x for Retina displays (user-configurable 1x-4x)
- 1x: Standard resolution
- 2x: Retina/HiDPI displays
- 3x: High-quality default (balance of quality and file size)
- 4x: Maximum quality (for large prints)

#### Step 4: Export Execution
```typescript
// App.tsx
const handleExport = useCallback(async (format: ExportFormat, scale: PNGScale) => {
  if (!currentSvgString) {
    toast.error('No diagram to export');
    return;
  }
  
  try {
    await exportDiagram(currentSvgString, format, scale);
    toast.success(`Exported as ${format.toUpperCase()}`);
  } catch (error) {
    toast.error(`Export failed: ${error.message}`);
  }
}, [currentSvgString]);
```

**Export formats:**
- **SVG** - Exports prepared SVG with inlined styles
- **PNG** - Runs SVG → Canvas → PNG pipeline at selected scale
- **Markdown** - Wraps code in mermaid code block
- **Clipboard** - Same as PNG export but uses Clipboard API

---

## 5. Contribution Workflow

### 5.1 Branching Strategy

We follow a simplified Git Flow model:

#### Branch Types

**`main` branch:**
- Always stable and deployable
- Represents production code
- Protected: requires PR approval to merge

**Feature branches:**
```bash
git checkout -b feature/add-zoom-controls
git checkout -b feature/quadrant-chart-support
```

**Bugfix branches:**
```bash
git checkout -b fix/svg-export-dimensions
git checkout -b fix/mobile-layout-overflow
```

**Documentation branches:**
```bash
git checkout -b docs/update-developer-guide
git checkout -b docs/add-adr-for-rendering
```

#### Working on a Feature

1. **Create a branch from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code
   - Add tests
   - Update documentation if needed

3. **Commit frequently with clear messages:**
   ```bash
   git add .
   git commit -m "feat: add zoom controls to preview"
   git commit -m "test: add zoom controls test coverage"
   git commit -m "docs: update feature list in README"
   ```

4. **Keep your branch up to date:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main  # or merge main into your branch
   ```

5. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

### 5.2 Pull Request Process

#### Before Opening a PR

**1. Self-review checklist:**
- [ ] Code follows existing patterns and style
- [ ] All tests pass: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] No TypeScript errors: `npm run build`
- [ ] Updated documentation if needed
- [ ] Manual testing performed

**2. Write comprehensive tests:**
- Unit tests for new utilities/functions
- Component tests for UI changes
- Integration tests for feature workflows

**3. Update documentation:**
- Add JSDoc comments for new functions
- Update README.md if adding user-facing features
- Add ADR in `docs/ADR/` for architectural decisions

#### Opening a Pull Request

**1. Create PR with descriptive title:**
```
feat: Add keyboard shortcut for fullscreen mode
fix: Correct SVG dimensions in export
docs: Add developer onboarding guide
```

**2. Fill out PR description:**
```markdown
## What does this PR do?
Adds Ctrl+F11 keyboard shortcut to toggle fullscreen preview mode.

## Why is this needed?
Users requested a quick way to focus on the diagram without the editor.

## How was it tested?
- Unit tests for keyboard handler
- Manual testing on Windows, macOS, Linux
- Verified no conflicts with existing shortcuts

## Checklist:
- [x] Tests added and passing
- [x] Documentation updated
- [x] No breaking changes
- [x] Follows code style guidelines
```

**3. Request review:**
- Tag relevant reviewers
- Link to related issues
- Provide screenshots/videos for UI changes

#### Review Process

**Reviewer responsibilities:**
- Check code quality and style
- Verify tests are comprehensive
- Test functionality locally
- Suggest improvements

**Author responsibilities:**
- Address feedback promptly
- Explain design decisions
- Update PR based on review comments
- Keep PR scope focused (no scope creep)

#### Merging

**Once approved:**
1. Squash commits if many small commits (optional)
2. Ensure all CI checks pass
3. Merge into `main`
4. Delete feature branch

**After merge:**
- Monitor for issues in production
- Close related issues
- Update project board/roadmap

---

## Additional Resources

- **Architecture Guidelines:** [docs/ARCHITECTURE_GUIDELINES.md](ARCHITECTURE_GUIDELINES.md)
- **Product Requirements:** [docs/PRD.md](PRD.md)
- **Architecture Decision Records:** [docs/ADR/](ADR/)
- **Mermaid Documentation:** [mermaid.js.org](https://mermaid.js.org/)
- **React Documentation:** [react.dev](https://react.dev/)
- **Vite Documentation:** [vitejs.dev](https://vitejs.dev/)

---

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/animeshkundu/mermaid-editor/discussions)
- **Bug reports?** Open a [GitHub Issue](https://github.com/animeshkundu/mermaid-editor/issues)
- **Feature requests?** Open a [GitHub Issue](https://github.com/animeshkundu/mermaid-editor/issues) with the enhancement label

---

**Happy coding! 🚀**
