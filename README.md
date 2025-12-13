# Mermaid Live Editor

A modern, client-side editor for creating [Mermaid](https://mermaid.js.org/) diagrams with real-time preview. No account required, no server-side processing—everything runs in your browser.

**Live demo:** [animeshkundu.github.io/mermaid-editor](https://animeshkundu.github.io/mermaid-editor/)

## Features

- 🎨 **Live Preview** - See diagrams render in real-time as you type
- 📝 **Monaco Editor** - Full-featured code editor with syntax highlighting
- 🔍 **Pan & Zoom** - Navigate large diagrams with smooth pan and zoom controls
- 🎭 **Multiple Themes** - Default, Forest, Dark, Neutral, and Base mermaid themes
- 🎨 **Elegant Color Palette** - Carefully designed beige/neutral color scheme with auto-colored sequence diagram actors
- 📤 **Export Options** - Export as SVG, PNG (1x–4x scale), or Markdown
- 📋 **Copy to Clipboard** - Copy diagram as PNG image directly to clipboard
- 🔗 **Share URLs** - Share diagrams via encoded URLs (no server required)
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with common shortcuts
- ↩️ **Undo/Redo** - Full history support with `Ctrl+Z` / `Ctrl+Y`
- 📱 **Responsive** - Tabbed interface on mobile, resizable panels on desktop
- 🌙 **Dark Mode** - Light and dark application themes
- ✨ **Visual Editor (Beta)** - Drag-and-drop visual editing for supported diagram types

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/animeshkundu/mermaid-editor.git
cd mermaid-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

## Commands

```bash
npm run dev          # Start Vite dev server (port 5000)
npm run build        # Build for production (tsc + vite build)
npm run preview      # Preview production build
npm run test         # Run tests (vitest, single run)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run Playwright integration tests against the dev server
npm run lint         # Run ESLint
npm run clean        # Clear build cache
```

See [docs/integration-testing.md](./docs/integration-testing.md) for details on the Playwright setup and recommended coverage.

## Supported Diagram Types

- Flowchart
- Sequence Diagram
- Class Diagram
- State Diagram
- Entity Relationship Diagram
- Gantt Chart
- Pie Chart
- User Journey
- Git Graph
- Mindmap
- Timeline
- Quadrant Chart
- Requirement Diagram
- C4 Context Diagram
- Sankey Diagram
- XY Chart
- Block Diagram
- Packet Diagram
- Kanban Board
- Architecture Diagram

## Visual Editor (Beta)

The Visual Editor provides an intuitive drag-and-drop interface for creating Mermaid diagrams. Toggle between Code and Visual modes using the toolbar.

### Usage

1. Click the **Visual** button in the toolbar (with BETA badge)
2. A third panel will appear showing the visual editor interface
3. Currently in Phase 0: Foundation—visual editors are coming soon
4. Toggle back to **Code** mode for traditional text editing

### Roadmap

- **Phase 0** (Current): Foundation - UI framework and mode toggle
- **Phase 1**: Flowchart visual editor with drag-and-drop nodes
- **Phase 2**: Sequence diagram editor
- **Phase 3**: Gantt chart editor
- **Phase 4**: Additional diagram types

For detailed implementation plans, see [docs/VISUAL_EDITOR_PRD.md](docs/VISUAL_EDITOR_PRD.md).

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` | Export as PNG |
| `Ctrl+Shift+C` | Copy code |
| `Ctrl+,` | Open configuration |
| `?` | Show keyboard shortcuts |
| `F11` | Toggle fullscreen preview |
| `Escape` | Exit fullscreen |
| `Ctrl+\` | Toggle layout direction |

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Monaco Editor** - Code editor
- **Mermaid** - Diagram rendering
- **shadcn/ui** - UI components
- **Radix UI** - Accessible primitives
- **Vitest** - Testing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.
