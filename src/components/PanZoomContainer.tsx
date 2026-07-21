import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassMinus, MagnifyingGlassPlus, ArrowsOut } from '@phosphor-icons/react';
import { DiagramMinimap } from '@/components/DiagramMinimap';
import { cn } from '@/lib/utils';

type PanZoomContainerProps = {
  children: ReactNode;
  svg?: string;
};

type PanZoomLayout = {
  viewportSize: {
    width: number;
    height: number;
  };
  diagramBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const isSameLayout = (current: PanZoomLayout | null, next: PanZoomLayout | null) => {
  if (!current || !next) {
    return current === next;
  }

  return (
    current.viewportSize.width === next.viewportSize.width &&
    current.viewportSize.height === next.viewportSize.height &&
    current.diagramBounds.x === next.diagramBounds.x &&
    current.diagramBounds.y === next.diagramBounds.y &&
    current.diagramBounds.width === next.diagramBounds.width &&
    current.diagramBounds.height === next.diagramBounds.height
  );
};

export const PanZoomContainer = ({ children, svg }: PanZoomContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layout, setLayout] = useState<PanZoomLayout | null>(null);

  useLayoutEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    const svgElement = contentRef.current?.querySelector('svg');

    if (!container || !svgElement) {
      setLayout((current) => (isSameLayout(current, null) ? current : null));
      return;
    }

    const viewportBounds = container.getBoundingClientRect();
    const transformedDiagramBounds = svgElement.getBoundingClientRect();
    const computedDiagramStyle = window.getComputedStyle(svgElement);
    const computedDiagramWidth = Number.parseFloat(computedDiagramStyle.width);
    const computedDiagramHeight = Number.parseFloat(computedDiagramStyle.height);
    const currentScale = scaleRef.current;

    if (
      viewportBounds.width <= 0 ||
      viewportBounds.height <= 0 ||
      transformedDiagramBounds.width <= 0 ||
      transformedDiagramBounds.height <= 0 ||
      currentScale <= 0
    ) {
      setLayout((current) => (isSameLayout(current, null) ? current : null));
      return;
    }

    const diagramWidth =
      Number.isFinite(computedDiagramWidth) && computedDiagramWidth > 0
        ? computedDiagramWidth
        : transformedDiagramBounds.width / currentScale;
    const diagramHeight =
      Number.isFinite(computedDiagramHeight) && computedDiagramHeight > 0
        ? computedDiagramHeight
        : transformedDiagramBounds.height / currentScale;
    const nextLayout = {
      viewportSize: {
        width: viewportBounds.width,
        height: viewportBounds.height,
      },
      diagramBounds: {
        x: (viewportBounds.width - diagramWidth) / 2,
        y: (viewportBounds.height - diagramHeight) / 2,
        width: diagramWidth,
        height: diagramHeight,
      },
    };

    setLayout((current) => (isSameLayout(current, nextLayout) ? current : nextLayout));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(s => Math.min(Math.max(0.1, s + delta), 16));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from anywhere in the container
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.2, 16));
  };

  const zoomOut = () => {
    setScale((s) => Math.max(s - 0.2, 0.1));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const svgElement = content?.querySelector('svg');

    measureLayout();
    window.addEventListener('resize', measureLayout);

    if (!container || !content || !svgElement || typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', measureLayout);
      };
    }

    const observer = new ResizeObserver(measureLayout);
    observer.observe(container);
    observer.observe(content);
    observer.observe(svgElement);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureLayout);
    };
  }, [measureLayout, svg]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive diagram canvas"
        className={cn(
          'h-full w-full',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className="h-full w-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition:
              isDragging || isMinimapDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {children}
        </div>
      </div>

      {svg && (
        <DiagramMinimap
          svg={svg}
          viewportSize={layout?.viewportSize ?? null}
          diagramBounds={layout?.diagramBounds ?? null}
          scale={scale}
          position={position}
          onPositionChange={setPosition}
          onInteractionChange={setIsMinimapDragging}
        />
      )}

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <span className="text-xs font-mono bg-secondary/80 px-2 py-1 rounded shadow-sm min-w-[4rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          type="button"
          aria-label="Zoom out"
          size="sm"
          variant="secondary"
          onClick={zoomOut}
          className="shadow-lg"
        >
          <MagnifyingGlassMinus className="h-4 w-4" weight="duotone" />
        </Button>
        <Button
          type="button"
          aria-label="Reset pan and zoom"
          size="sm"
          variant="secondary"
          onClick={resetZoom}
          className="shadow-lg"
        >
          <ArrowsOut className="h-4 w-4" weight="duotone" />
        </Button>
        <Button
          type="button"
          aria-label="Zoom in"
          size="sm"
          variant="secondary"
          onClick={zoomIn}
          className="shadow-lg"
        >
          <MagnifyingGlassPlus className="h-4 w-4" weight="duotone" />
        </Button>
      </div>
    </div>
  );
};
