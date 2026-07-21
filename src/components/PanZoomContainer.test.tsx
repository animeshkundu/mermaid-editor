import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PanZoomContainer } from '@/components/PanZoomContainer';

const createRect = (
  width: number,
  height: number,
  left = 0,
  top = 0
): DOMRect =>
  ({
    x: left,
    y: top,
    width,
    height,
    left,
    top,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  }) as DOMRect;

const mockMinimapLayout = () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element
  ) {
    if (this.getAttribute('aria-label') === 'Interactive diagram canvas') {
      return createRect(480, 300);
    }

    if (this.getAttribute('aria-label') === 'Diagram minimap') {
      return createRect(192, 128, 10, 20);
    }

    if (this.tagName.toLowerCase() === 'svg') {
      return createRect(800, 600, -200, -150);
    }

    return createRect(0, 0);
  });
};

const mockResizeObserver = () => {
  let callback: ResizeObserverCallback = () => undefined;

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(nextCallback: ResizeObserverCallback) {
        callback = nextCallback;
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );

  return () => callback([], {} as ResizeObserver);
};

const diagramSvg =
  '<svg viewBox="0 0 800 600"><rect width="800" height="600" /></svg>';

const createPointerEvent = (
  type: string,
  {
    pointerId,
    clientX,
    clientY,
  }: {
    pointerId: number;
    clientX: number;
    clientY: number;
  }
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  return event;
};

const renderWithMinimap = () =>
  render(
    <PanZoomContainer svg={diagramSvg}>
      <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
    </PanZoomContainer>
  );

describe('PanZoomContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should render children', () => {
    render(
      <PanZoomContainer>
        <div data-testid="child-content">Test Content</div>
      </PanZoomContainer>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render zoom controls', () => {
    render(
      <PanZoomContainer>
        <div>Content</div>
      </PanZoomContainer>
    );
    
    // Find zoom buttons by their SVG icons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should have cursor-grab class by default', () => {
    render(
      <PanZoomContainer>
        <div>Content</div>
      </PanZoomContainer>
    );
    
    const container = document.querySelector('.cursor-grab');
    expect(container).toBeInTheDocument();
  });

  it('should apply transform on zoom', async () => {
    render(
      <PanZoomContainer>
        <div data-testid="zoomable">Content</div>
      </PanZoomContainer>
    );
    
    // Get all buttons - should include zoom in, zoom out, reset
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    
    // Click zoom in button
    fireEvent.click(buttons[0]);
    
    // The component should still render
    expect(screen.getByTestId('zoomable')).toBeInTheDocument();
  });

  it('renders an isolated SVG thumbnail and viewport rectangle', () => {
    mockMinimapLayout();
    renderWithMinimap();

    const minimap = screen.getByRole('region', { name: 'Diagram minimap' });
    const thumbnail = minimap.querySelector('img');

    expect(thumbnail).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/svg+xml')
    );
    expect(
      screen.getByRole('button', {
        name: 'Diagram viewport. Drag to navigate or use the arrow keys.',
      })
    ).toBeInTheDocument();
  });

  it('updates the minimap viewport when the main view zooms and pans', () => {
    mockMinimapLayout();
    const triggerResize = mockResizeObserver();
    const originalGetComputedStyle = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
      element.tagName.toLowerCase() === 'svg'
        ? ({ width: '800px', height: '600px' } as CSSStyleDeclaration)
        : originalGetComputedStyle(element)
    );
    renderWithMinimap();

    const getViewport = () =>
      screen.getByRole('button', {
        name: 'Diagram viewport. Drag to navigate or use the arrow keys.',
      });
    const initialWidth = Number.parseFloat(getViewport().style.width);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    act(() => triggerResize());

    expect(Number.parseFloat(getViewport().style.width)).toBeLessThan(initialWidth);
    const zoomedLeft = Number.parseFloat(getViewport().style.left);

    const canvas = screen.getByRole('region', {
      name: 'Interactive diagram canvas',
    });
    fireEvent.mouseDown(canvas, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 140, clientY: 120 });
    fireEvent.mouseUp(canvas);

    expect(Number.parseFloat(getViewport().style.left)).toBeLessThan(zoomedLeft);
  });

  it('recenters the main view when the minimap is clicked', () => {
    mockMinimapLayout();
    renderWithMinimap();

    fireEvent(
      screen.getByRole('button', { name: 'Center diagram from minimap' }),
      createPointerEvent('pointerdown', {
        pointerId: 1,
        clientX: 170,
        clientY: 84,
      })
    );

    const canvas = screen.getByRole('region', {
      name: 'Interactive diagram canvas',
    });
    const transformedContent = canvas.firstElementChild as HTMLElement;

    expect(transformedContent.style.transform).toContain('translate(-300');
  });

  it('drags the minimap viewport to pan the main view', () => {
    mockMinimapLayout();
    renderWithMinimap();

    const viewport = screen.getByRole('button', {
      name: 'Diagram viewport. Drag to navigate or use the arrow keys.',
    });
    fireEvent(viewport, createPointerEvent('pointerdown', {
      pointerId: 7,
      clientX: 106,
      clientY: 84,
    }));
    fireEvent(viewport, createPointerEvent('pointermove', {
      pointerId: 7,
      clientX: 126,
      clientY: 84,
    }));
    fireEvent(viewport, createPointerEvent('pointerup', {
      pointerId: 7,
      clientX: 126,
      clientY: 84,
    }));

    const canvas = screen.getByRole('region', {
      name: 'Interactive diagram canvas',
    });
    const transformedContent = canvas.firstElementChild as HTMLElement;

    expect(transformedContent.style.transform).toContain('translate(-93.75px');
  });

  it('centers the clicked point inside the minimap viewport', () => {
    mockMinimapLayout();
    renderWithMinimap();

    const viewport = screen.getByRole('button', {
      name: 'Diagram viewport. Drag to navigate or use the arrow keys.',
    });
    fireEvent(
      viewport,
      createPointerEvent('pointerdown', {
        pointerId: 8,
        clientX: 130,
        clientY: 84,
      })
    );
    fireEvent(
      viewport,
      createPointerEvent('pointerup', {
        pointerId: 8,
        clientX: 130,
        clientY: 84,
      })
    );

    const canvas = screen.getByRole('region', {
      name: 'Interactive diagram canvas',
    });
    const transformedContent = canvas.firstElementChild as HTMLElement;

    expect(transformedContent.style.transform).toContain('translate(-112.5px');
  });

  it('keeps the minimap safe when browser layout dimensions are unavailable', () => {
    renderWithMinimap();

    expect(screen.getByRole('region', { name: 'Diagram minimap' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Diagram viewport. Drag to navigate or use the arrow keys.',
      })
    ).not.toBeInTheDocument();

    expect(() =>
      fireEvent(
        screen.getByRole('button', { name: 'Center diagram from minimap' }),
        createPointerEvent('pointerdown', {
          pointerId: 1,
          clientX: 10,
          clientY: 10,
        })
      )
    ).not.toThrow();
  });
});
