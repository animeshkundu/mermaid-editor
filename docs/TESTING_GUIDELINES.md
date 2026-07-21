# Testing Guidelines

## 1. Testing Strategy

### 1.1 Unit vs Integration Tests

**Unit Tests** focus on testing individual functions, hooks, or components in isolation with minimal dependencies:
- **Pure utility functions** (`src/lib/utils.ts`, `src/lib/share.ts`)
- **Custom hooks** (`useLocalStorage`, `useHistory`)
- **Export/import logic** (`export.ts`, `mermaid.ts`)

**Integration Tests** verify that multiple components work together correctly:
- **Components with external dependencies** (`DiagramPreview` with Mermaid.js)
- **Components with complex interactions** (`Toolbar` with multiple callbacks)
- **Full user workflows** (code editing → preview rendering → export)

**When to choose:**
- Write **unit tests** when the code is pure, deterministic, and has clear inputs/outputs
- Write **integration tests** when testing component interactions, side effects, or user flows
- Prefer integration tests for components that rely heavily on React context or browser APIs

### 1.2 Testing Tools

**Vitest** is our test runner with Jest-compatible API:
```bash
npm run test          # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Configuration** (`vitest.config.ts`):
```typescript
{
  globals: true,              // No need to import describe/it/expect
  environment: 'jsdom',       // Simulates browser DOM
  setupFiles: ['./src/test/setup.ts'],  // Global mocks
  include: ['src/**/*.{test,spec}.{ts,tsx}'],
  coverage: {
    exclude: ['src/test/setup.ts', 'src/components/ui/**']
  }
}
```

**React Testing Library** for component testing:
- `render` - Mount React components in test environment
- `screen` - Query rendered elements
- `waitFor` - Wait for async updates
- `fireEvent` / `userEvent` - Simulate user interactions

**Production-browser contracts** use Playwright against `npm run preview`:
- Establish service-worker control online before switching the context offline
- Count all hostile-source probe requests, including same-origin requests
- Exercise **Render now** for above-threshold fixtures
- Query controls by role and accessible name; test keyboard pan/zoom and the resize separator
- Measure large-diagram budgets only from a production build

**Testing Library Queries** (in order of preference):
1. `getByRole()` - Accessibility-first (preferred)
2. `getByLabelText()` - Form inputs
3. `getByText()` - Visible text content
4. `getByTestId()` - Last resort for elements without semantic meaning

---

## 2. Writing Tests

### 2.1 Component Testing

**Basic Component Test** (`src/components/Toolbar.test.tsx`):
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toolbar } from '@/components/Toolbar';

describe('Toolbar Component', () => {
  const defaultProps = {
    onExport: vi.fn(),
    onLoadExample: vi.fn(),
    currentCode: 'flowchart TD\n  A --> B',
  };

  beforeEach(() => {
    vi.clearAllMocks();  // Reset mocks between tests
  });

  it('should render the toolbar with title', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Mermaid Live Editor')).toBeInTheDocument();
  });

  it('should render export button', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});
```

**Testing User Interactions:**
```tsx
import { fireEvent } from '@testing-library/react';

it('should call onExport when export button is clicked', async () => {
  const onExport = vi.fn();
  render(<Toolbar {...defaultProps} onExport={onExport} />);
  
  const exportButton = screen.getByText('Export');
  fireEvent.click(exportButton);
  
  expect(onExport).toHaveBeenCalledTimes(1);
});
```

**Testing Async Rendering** (`src/components/DiagramPreview.test.tsx`):
```tsx
import { waitFor } from '@testing-library/react';

it('should call onSvgRendered when diagram is rendered', async () => {
  const onSvgRendered = vi.fn();
  render(
    <DiagramPreview
      code="flowchart TD\n  A --> B"
      config={DEFAULT_MERMAID_CONFIG}
      onSvgRendered={onSvgRendered}
    />
  );

  await waitFor(() => {
    expect(onSvgRendered).toHaveBeenCalled();
  }, { timeout: 5000 });
});
```

**Testing Conditional Rendering:**
```tsx
it('should show placeholder when code is empty', async () => {
  render(<DiagramPreview code="" config={DEFAULT_MERMAID_CONFIG} />);
  
  await waitFor(() => {
    expect(screen.getByText('Start typing to see your diagram')).toBeInTheDocument();
  });
});
```

### 2.2 Hook Testing

Use `renderHook` from `@testing-library/react` for custom hooks (`src/hooks/use-keyboard-shortcuts.test.ts`):

```tsx
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

describe('useKeyboardShortcuts Hook', () => {
  const mockHandlers = {
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onUndo on Ctrl+Z', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });
});
```

**Testing Hook State Changes:**
```tsx
it('should update state on interaction', () => {
  const { result } = renderHook(() => useLocalStorage('key', 'initial'));
  
  act(() => {
    result.current[1]('updated');  // Call setter
  });
  
  expect(result.current[0]).toBe('updated');
});
```

### 2.3 Utility Testing

Test pure functions with straightforward input/output assertions (`src/lib/utils.test.ts`):

```tsx
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base active');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');  // twMerge dedupes
    });
  });
});
```

**Testing Edge Cases:**
```tsx
it('should handle empty inputs', () => {
  expect(cn()).toBe('');
});

it('should handle undefined values', () => {
  expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
});
```

---

## 3. Mocking Strategies

### 3.1 Mocking Mermaid.js

Mermaid is mocked globally in `src/test/setup.ts` to avoid rendering diagrams in tests:

```typescript
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    parse: vi.fn().mockResolvedValue(true),
  },
}));
```

**Override mock behavior in specific tests:**
```tsx
vi.mock('@/lib/mermaid', () => ({
  renderMermaid: vi.fn().mockResolvedValue({ 
    svg: '<svg><text>Test Diagram</text></svg>' 
  }),
}));
```

**Simulate errors:**
```tsx
it('should display error message on render failure', async () => {
  vi.mocked(await import('@/lib/mermaid')).renderMermaid
    .mockRejectedValueOnce(new Error('Syntax error in diagram'));

  render(<DiagramPreview code="invalid" config={DEFAULT_MERMAID_CONFIG} />);
  
  // Assert error handling behavior
});
```

### 3.2 Mocking Canvas/DOM APIs

**Canvas API** (`src/test/setup.ts`):
```typescript
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
}));

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock'], { type: 'image/png' }));
});
```

**Clipboard API:**
```typescript
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined),
  },
});
```

**URL APIs:**
```typescript
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();
```

**Per-test DOM mocking** (`src/lib/export.test.ts`):
```tsx
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
};

beforeEach(() => {
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') return mockLink as unknown as HTMLElement;
    if (tag === 'canvas') return mockCanvas as unknown as HTMLElement;
    return originalCreateElement(tag);  // Fallback
  });
});
```

### 3.3 Mocking LocalStorage

**Option 1: Mock the hook** (preferred for component tests):
```tsx
vi.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: (key: string, initialValue: any) => {
    const [state, setState] = useState(initialValue);
    return [state, setState];
  },
}));
```

**Option 2: Mock Storage API** (for integration tests):
```tsx
const mockStorage: Record<string, string> = {};

beforeEach(() => {
  global.Storage.prototype.getItem = vi.fn((key) => mockStorage[key] || null);
  global.Storage.prototype.setItem = vi.fn((key, value) => {
    mockStorage[key] = value;
  });
  global.Storage.prototype.clear = vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });
});
```

---

## 4. Best Practices

### 4.1 Test Co-location

**Always place test files next to the code they test:**
```
src/components/
  ├── Toolbar.tsx
  ├── Toolbar.test.tsx        ✅ Co-located
  ├── DiagramPreview.tsx
  └── DiagramPreview.test.tsx ✅ Co-located

src/lib/
  ├── export.ts
  └── export.test.ts          ✅ Co-located
```

**Benefits:**
- Easier to find tests when editing code
- Encourages keeping tests in sync with code changes
- Simplifies imports (relative paths)

### 4.2 Snapshot Testing

**When to use snapshots:**
- ✅ Testing complex, stable component output (e.g., error messages, config objects)
- ✅ Verifying serialized data structures (e.g., URL encoding/decoding)

**When to avoid snapshots:**
- ❌ UI components (fragile, hard to review)
- ❌ Frequently changing code
- ❌ As a substitute for proper assertions

**Example (acceptable use):**
```tsx
it('should serialize config correctly', () => {
  const config = { theme: 'dark', logLevel: 'error' };
  const encoded = encodeState(config);
  expect(encoded).toMatchSnapshot();  // Stable, deterministic output
});
```

**Example (avoid):**
```tsx
// ❌ BAD: Fragile, hard to review changes
it('should render toolbar', () => {
  const { container } = render(<Toolbar {...props} />);
  expect(container).toMatchSnapshot();
});

// ✅ GOOD: Explicit assertions
it('should render toolbar', () => {
  render(<Toolbar {...props} />);
  expect(screen.getByText('Export')).toBeInTheDocument();
  expect(screen.getByText('Examples')).toBeInTheDocument();
});
```

### 4.3 Accessibility Testing

**Use accessible queries** (prefer `getByRole`):
```tsx
// ✅ GOOD: Accessible query
const button = screen.getByRole('button', { name: 'Export' });

// ⚠️ ACCEPTABLE: When role is ambiguous
const heading = screen.getByText('Mermaid Live Editor');

// ❌ AVOID: Non-semantic query
const button = screen.getByTestId('export-button');
```

**Test ARIA attributes:**
```tsx
it('should have correct aria-label', () => {
  render(<IconButton aria-label="Undo last change" onClick={onUndo} />);
  expect(screen.getByLabelText('Undo last change')).toBeInTheDocument();
});

it('should indicate disabled state', () => {
  render(<Button disabled>Submit</Button>);
  const button = screen.getByRole('button', { name: 'Submit' });
  expect(button).toHaveAttribute('aria-disabled', 'true');
});
```

**Keyboard navigation:**
```tsx
it('should be keyboard accessible', () => {
  render(<Dialog />);
  const trigger = screen.getByRole('button', { name: 'Open Dialog' });
  
  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'Enter' });
  
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

Security tests should bind to the public seams (`sanitizeMermaidSource`, `createEffectiveConfig`,
`decodeState`) and observable request counts. Do not assert Mermaid's internal chunk names or render
implementation.

---

## Additional Tips

**Keep tests focused:**
- One assertion per test (when practical)
- Descriptive test names: `should [expected behavior] when [condition]`

**Reset state between tests:**
```tsx
beforeEach(() => {
  vi.clearAllMocks();           // Clear mock call history
  vi.restoreAllMocks();         // Restore original implementations
  cleanup();                     // Unmount React components (automatic with RTL)
});
```

**Avoid testing implementation details:**
```tsx
// ❌ BAD: Testing internal state
expect(component.state.counter).toBe(5);

// ✅ GOOD: Testing observable behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

**Use data-testid sparingly:**
```tsx
// ❌ AVOID: Pollutes production code
<div data-testid="diagram-container">

// ✅ PREFER: Use semantic HTML and ARIA
<div role="region" aria-label="Diagram Preview">
```

**Run tests before commits:**
```bash
npm run test          # Quick validation
npm run test:coverage # Ensure coverage thresholds
npm run lint          # Catch style issues
```

---

For more details, see:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
