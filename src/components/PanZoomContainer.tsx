import { useRef, useEffect, useState, ReactNode } from 'react';
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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === contentRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
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

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.2, 3));
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
  }, [scale]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
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
