import '@testing-library/jest-dom';

// Mock mermaid module
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    parse: vi.fn().mockResolvedValue(true),
  },
  initialize: vi.fn(),
  render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  parse: vi.fn().mockResolvedValue(true),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high',
})) as any;

HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock'], { type: 'image/png' }));
});

// Polyfill ResizeObserver for test environment
// Some UI libs (Radix) rely on ResizeObserver being available in the DOM.
// Provide a minimal mock that exposes the needed methods.
(global as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
