# Mermaid Live Editor

A React-based live editor for creating and editing [Mermaid](https://mermaid.js.org/) diagrams with real-time preview.

## Features

- 🎨 **Live Preview** - See your diagrams render in real-time as you type
- 📝 **Monaco Editor** - Full-featured code editor with syntax highlighting
- 🎭 **Multiple Themes** - Choose from Default, Forest, Dark, Neutral, and Base themes
- 📤 **Export Options** - Export as SVG, PNG (with configurable scale), or Markdown
- 🔗 **Share URLs** - Share diagrams via encoded URLs
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with common shortcuts
- 📱 **Responsive** - Works on desktop and mobile devices
- 🌙 **Dark Mode** - Light and dark application themes

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
npm run lint         # Run ESLint
npm run kill         # Kill process on port 5000
```

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
- **Vitest** - Testing

## License

MIT License - see [LICENSE](LICENSE) for details.

