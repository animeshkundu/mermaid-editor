import { useRef, useEffect, useState, ReactNode, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassMinus, MagnifyingGlassPlus, ArrowsOut } from '@phosphor-icons/react';

interface PanZoomContainerProps {
  children: ReactNode;
}

export const PanZoomContainer = ({ children }: PanZoomContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {children}
        </div>
      </div>

      {/* Zoom controls with percentage display */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <span className="text-xs font-mono bg-secondary/80 px-2 py-1 rounded shadow-sm min-w-[4rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomOut}
          className="shadow-lg"
        >
          <MagnifyingGlassMinus className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={resetZoom}
          className="shadow-lg"
        >
          <ArrowsOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={zoomIn}
          className="shadow-lg"
        >
          <MagnifyingGlassPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
