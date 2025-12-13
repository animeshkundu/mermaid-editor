# Design Guidelines

This document outlines the design principles, component patterns, and styling conventions for the Mermaid Live Editor. It serves as a reference for maintaining consistency across the application.

## 1. UI/UX Philosophy

### 1.1 Clean & Minimalist (Focus on the diagram)

The editor is designed with a **diagram-first** approach where the interface fades into the background, allowing users to focus on creating and viewing diagrams.

**Core Principles:**
- **Minimal chrome**: The toolbar is compact and unobtrusive, providing access to essential functions without overwhelming the workspace
- **Neutral backgrounds**: The preview area uses subtle background colors (`diagram-preview-bg` class) that don't compete with diagram content
- **Progressive disclosure**: Advanced features (configuration, examples, export options) are hidden behind menus and dialogs, revealed only when needed
- **Whitespace breathing room**: Generous padding in dialogs and error states (`p-6` on containers) prevents visual clutter

**Implementation Examples:**
- `Toolbar` uses icon-only buttons with tooltips for common actions
- The resizable panel layout allows users to adjust the code/preview split to their preference
- Error messages are contained in `Alert` with clear visual hierarchy using the Alert component

### 1.2 Accessibility First (Keyboard nav, ARIA)

Accessibility is built into every component, not added as an afterthought.

**Keyboard Navigation:**
All primary workflows are fully keyboard-accessible via the `useKeyboardShortcuts` hook:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` / `Cmd+S` | Export diagram |
| `Ctrl+Shift+C` | Copy code |
| `?` | Show keyboard shortcuts help |
| `Ctrl+,` | Open configuration |
| `F11` / `Escape` | Toggle fullscreen |
| `Ctrl+\` | Toggle layout direction |

**ARIA Support:**
- All UI components inherit ARIA attributes from Radix UI primitives (see Component System)
- Form controls include `aria-invalid` states for validation feedback
- Buttons use semantic HTML with proper `aria-label` where icons lack text
- Focus management: Custom `focus-visible:ring-*` styles provide clear focus indicators without visual noise on mouse clicks

**Focus Styles:**
The base button style in `src/components/ui/button.tsx` demonstrates our focus pattern:
```tsx
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```
This creates a 3px ring with 50% opacity that only appears on keyboard focus, not mouse clicks.

**Input States:**
Invalid inputs show visual feedback via `aria-invalid`:
```tsx
aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
```

### 1.3 Responsive Design (Mobile vs Desktop views)

The application adapts to screen size using a mobile-first approach with a **768px breakpoint**.

**Mobile Detection:**
The `useIsMobile` hook provides reactive mobile detection:
```typescript
const MOBILE_BREAKPOINT = 768
export function useIsMobile() {
  // Returns true when viewport width < 768px
}
```

**Responsive Patterns:**

**Desktop (≥768px):**
- Horizontal layout default (editor left, preview right)
- Resizable panels via `react-resizable-panels`
- Toolbar with icon buttons and text labels
- Dropdown menus for secondary actions

**Mobile (<768px):**
- Uses `Sheet` component (slide-out drawer) instead of dropdowns for menus
- Tab-based navigation between code and preview (see `App.tsx`)
- Vertical layout enforced
- Touch-friendly button sizes (`h-9` minimum, `size-10` for icon buttons)
- Pan/zoom controls in preview for easier diagram navigation

**Utility-based Responsive Design:**
Tailwind's responsive modifiers are used throughout:
```tsx
className="text-base md:text-sm" // Larger text on mobile
className="px-4 md:px-6"          // More horizontal padding on desktop
```

---

## 2. Component System

### 2.1 Shadcn/UI Usage (Radix primitives)

All UI components are built on **shadcn/ui** (New York style variant) which wraps **Radix UI** primitives. Components live in `src/components/ui/`.

**Why Shadcn/UI:**
- **Copy-paste architecture**: Components are owned by our codebase, not installed as dependencies
- **Radix foundation**: Unstyled, accessible primitives that handle complex interactions (focus management, keyboard nav, ARIA)
- **Tailwind-first**: Utility classes make customization straightforward
- **Type-safe**: Full TypeScript support with proper generics

**Component Categories:**

**Interactive Controls:**
- `Button` - Primary actions with variants (default, outline, ghost, destructive)
- `<Select>`, `<Checkbox>`, `<Switch>` - Form controls
- `Tooltip` - Context-sensitive help

**Overlays:**
- `<Dialog>` - Modal dialogs (e.g., `ConfigDialog`)
- `Sheet` - Slide-out panels for mobile menus
- `<Popover>` - Non-modal floating content
- `DropdownMenu` - Contextual action menus

**Layout:**
- `Tabs` - Mobile code/preview switching
- `Resizable` - Split-pane layouts
- `<ScrollArea>` - Custom scrollbars matching the theme

**Feedback:**
- `Alert` - Error/warning messages (see `DiagramPreview`)
- `Skeleton` - Loading states
- `Toaster` (Sonner) - Toast notifications

**Key Pattern - Composition:**
Radix components use a compositional API:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleAction}>
      <Icon className="mr-2" />
      Action
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

The `asChild` prop merges component props into the child element, preventing unnecessary wrapper divs.

### 2.2 Tailwind CSS Patterns (Utility-first, `cn()` utility)

**Utility-First Approach:**
Styles are applied directly via Tailwind classes rather than writing custom CSS. This keeps styles colocated with components and leverages Tailwind's design system.

**Common Patterns:**

**Flexbox layouts:**
```tsx
className="flex items-center justify-center gap-2"
```

**Responsive spacing:**
```tsx
className="p-4 md:p-6 lg:p-8"
```

**Transitions:**
```tsx
className="transition-all duration-200 hover:bg-accent"
```

**The `cn` Utility:**
Defined in `lib/utils.ts`, this function merges Tailwind classes intelligently:

```typescript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Why `cn`:**
- **Conditional classes**: `clsx` handles conditional logic cleanly
- **Class merging**: `twMerge` prevents conflicts (e.g., `"bg-red-500 bg-blue-500"` → `"bg-blue-500"`)

**Usage Example:**
```tsx
<Button
  className={cn(
    "base-class",
    isActive && "bg-primary",
    isPending && "opacity-50",
    className // Props override
  )}
/>
```

**Variant Patterns (CVA):**
Component variants use `class-variance-authority`:
```typescript
const buttonVariants = cva(
  "base-classes", // Always applied
  {
    variants: {
      variant: {
        default: "variant-specific-classes",
        outline: "other-variant-classes",
      },
      size: {
        sm: "small-size-classes",
        lg: "large-size-classes",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)
```

See `src/components/ui/button.tsx` for a complete example.

### 2.3 Iconography (Phosphor Icons, weight="duotone")

All icons use **@phosphor-icons/react** with the **duotone weight** for visual consistency.

**Icon Import Pattern:**
```tsx
import { IconName } from '@phosphor-icons/react';
```

**Standard Usage:**
```tsx
<Button>
  <DownloadSimple weight="duotone" />
  Export
</Button>
```

**Common Icons in Use:**
- `Code`, `Eye` - Editor/preview mode toggles
- `DownloadSimple` - Export actions
- `Gear` - Configuration
- `Palette` - Theme selection
- `Copy`, `Clipboard` - Clipboard operations
- `ArrowCounterClockwise`, `ArrowClockwise` - Undo/redo
- `SplitHorizontal`, `SplitVertical` - Layout controls
- `Sun`, `Moon` - Theme toggle
- `WarningCircle` - Error states

**Icon Sizing:**
Button components auto-size icons to `1rem` (16px) via the class:
```tsx
[&_svg:not([class*='size-'])]:size-4
```

Override with explicit size classes when needed:
```tsx
<WarningCircle className="size-5" />
```

---

## 3. Theming

### 3.1 Dark/Light Mode (CSS variables, `globals.css`)

The application uses **CSS custom properties** (defined in `src/styles/globals.css`) for theming. This allows runtime theme switching without CSS-in-JS overhead.

**Theme Architecture:**

**1. Color Variables (OKLCH color space):**
Colors are defined using `oklch()` for perceptually uniform lightness:

```css
:root {
  --background: oklch(0.98 0 0);      /* Light background */
  --foreground: oklch(0.15 0.02 250); /* Dark text */
  --primary: oklch(0.55 0.22 260);    /* Brand color */
  /* ... */
}

.dark {
  --background: oklch(0.15 0.02 250); /* Dark background */
  --foreground: oklch(0.96 0 0);      /* Light text */
  --primary: oklch(0.65 0.22 260);    /* Brighter primary */
  /* ... */
}
```

**2. Semantic Token Mapping:**
The `@theme` block maps CSS variables to Tailwind utilities:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... */
}
```

This enables usage like:
```tsx
className="bg-background text-foreground border-border"
```

**Theme Application (`App.tsx`):**
```typescript
const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');

useEffect(() => {
  if (appTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [appTheme]);
```

**Color Palette Structure:**

| Token | Purpose | Light Value | Dark Value |
|-------|---------|-------------|------------|
| `--background` | Page background | Very light gray | Very dark gray |
| `--foreground` | Primary text | Near black | Near white |
| `--primary` | Brand/CTA buttons | Purple | Lighter purple |
| `--secondary` | Secondary buttons | Dark gray | Medium gray |
| `--muted` | Disabled/subtle | Light gray | Dark gray |
| `--destructive` | Errors/warnings | Red | Red |
| `--border` | Dividers/outlines | Medium gray | Dark gray |
| `--accent` | Hover states | Vibrant purple | Vibrant purple |
| `--success` | Success states | Green | Green |

**Special-Purpose Variables:**
- `--editor-bg`, `--editor-fg` - Monaco editor colors (always dark for code readability)
- `--radius` - Global border radius (0.5rem)
- `--ring` - Focus indicator color

### 3.2 Mermaid Diagram Theming vs App Theming (How they interact)

The application has **two independent theming systems**:

**1. App Theme (UI chrome)**
- Controls toolbar, dialogs, backgrounds
- Toggled via Sun/Moon button in toolbar
- Stored in `app-theme` localStorage key
- Values: `'light'` | `'dark'`

**2. Mermaid Diagram Theme (diagram content)**
- Controls the appearance of diagrams themselves
- Set via Palette button → Theme selector
- Stored in `mermaid-config` (part of MermaidConfig)
- Values: `'default'` | `'dark'` | `'forest'` | `'neutral'` | `'base'` (see types/index.ts)

**Why Separate?**
Users may want different combinations:
- Dark app UI with light diagrams (for presentations)
- Light app UI with dark diagrams (for screenshots)
- Independent control over aesthetic preferences

**Implementation (`App.tsx`):**
```typescript
const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', {
  theme: 'default',  // Mermaid's diagram theme
  // ... other config
});
```

**Visual Separation:**
The diagram preview area (`.diagram-preview-bg`) has its own background styling that remains neutral regardless of app theme, ensuring diagrams are always readable.

**Best Practice:**
When users toggle app theme (Sun/Moon button), we **do not** automatically change the Mermaid diagram theme. This preserves user intent if they've explicitly chosen a specific diagram theme.

---

## 4. Layout Patterns

### 4.1 Resizable Panels (react-resizable-panels)

The editor/preview split uses **react-resizable-panels** for user-adjustable layouts.

**Component Structure (`App.tsx`):**
```tsx
<ResizablePanelGroup direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
  <ResizablePanel defaultSize={50} minSize={20}>
    {/* Code Editor */}
  </ResizablePanel>
  
  <ResizableHandle withHandle />
  
  <ResizablePanel defaultSize={50} minSize={20}>
    {/* Diagram Preview */}
  </ResizablePanel>
</ResizablePanelGroup>
```

**Configuration:**
- `defaultSize={50}` - Start at 50/50 split
- `minSize={20}` - Prevent panels from being collapsed below 20%
- `withHandle` - Visual grabber for resizing
- `direction` - Bound to layout state (`'horizontal'` | `'vertical'`)

**Layout Switching:**
Users can toggle between horizontal and vertical layouts via:
- Toolbar button (SplitHorizontal/SplitVertical icons)
- Keyboard shortcut (`Ctrl+\`)
- Automatically forced to vertical on mobile

**State Persistence:**
Layout preference is saved to localStorage:
```typescript
const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
```

**Mobile Override (`App.tsx`):**
```typescript
{isMobile ? (
  <Tabs> {/* Tab-based mobile layout */}
) : (
  <ResizablePanelGroup> {/* Resizable desktop layout */}
)}
```

### 4.2 Toolbar & Dialogs (Common patterns)

**Toolbar Pattern (`Toolbar.tsx`):**

The toolbar provides a consistent control surface across the top of the app.

**Structure:**
```tsx
<header className="border-b bg-card">
  <div className="flex items-center justify-between px-4 py-2">
    {/* Left: Primary actions */}
    <div className="flex items-center gap-2">
      <Button>Action 1</Button>
      <Button>Action 2</Button>
    </div>
    
    {/* Right: Secondary actions */}
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <Icon />
      </Button>
    </div>
  </div>
</header>
```

**Button Guidelines:**
- **Primary actions**: `variant="default"` (colored background)
- **Secondary actions**: `variant="outline"` (bordered)
- **Tertiary actions**: `variant="ghost"` (no background/border)
- **Icon-only**: `size="icon"` with Tooltip wrapper

**Tooltip Pattern:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Icon />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Action description</p>
      <kbd className="text-xs">Ctrl+K</kbd> {/* Keyboard hint */}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Dropdown Menu Pattern:**
Used for grouping related actions:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Icon />
      Menu
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Section Header</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handler}>
      <Icon className="mr-2" />
      Action
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Dialog Pattern (`ConfigDialog.tsx`):**

Standard structure for modal dialogs:

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Optional description of what this dialog does
      </DialogDescription>
    </DialogHeader>
    
    {/* Dialog body content */}
    <Tabs defaultValue="visual">
      <TabsList>
        <TabsTrigger value="visual">Visual</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="visual">
        {/* Form controls */}
      </TabsContent>
      <TabsContent value="json">
        {/* Alternative view */}
      </TabsContent>
    </Tabs>
    
    <DialogFooter>
      <Button variant="outline" onClick={handleReset}>
        Reset
      </Button>
      <Button onClick={handleSave}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Dialog Best Practices:**
- **Max width**: Use `max-w-2xl` or similar to prevent dialogs from being too wide on large screens
- **Footer alignment**: `DialogFooter` auto-aligns buttons to the right
- **Close behavior**: Dialogs auto-close on Escape key and outside clicks (provided by Radix)
- **Focus trap**: Focus is trapped inside the dialog while open (accessibility requirement)

**Mobile Alternative - Sheet:**
For mobile, use `Sheet` instead of `<Dialog>` for better UX:
```tsx
{isMobile ? (
  <Sheet>
    <SheetContent side="bottom">
      {/* Same content as dialog */}
    </SheetContent>
  </Sheet>
) : (
  <Dialog> {/* Desktop dialog */} </Dialog>
)}
```

---

## Summary

These guidelines ensure consistency across the Mermaid Live Editor:

1. **Philosophy**: Minimize UI chrome, prioritize diagram visibility, keyboard-first workflows
2. **Components**: Leverage shadcn/ui + Radix primitives, compose with Tailwind utilities
3. **Theming**: Separate app and diagram themes, OKLCH color space, CSS variable foundation
4. **Layout**: Responsive panels, mobile-aware patterns, persistent user preferences

When adding new features, refer to existing components in `src/components/` as reference implementations of these patterns.
