import { useEffect, useMemo, useRef } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import {
  calculateMinimapGeometry,
  calculatePositionFromMinimapPoint,
} from '@/lib/minimap';

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Rectangle = Point & Size;

type DiagramMinimapProps = {
  svg: string;
  viewportSize: Size | null;
  diagramBounds: Rectangle | null;
  scale: number;
  position: Point;
  onPositionChange: (position: Point) => void;
  onInteractionChange: (isInteracting: boolean) => void;
};

type DragState = {
  pointerId: number;
  offset: Point;
  startPoint: Point;
  fromViewport: boolean;
  moved: boolean;
};

const MINIMAP_SIZE = {
  width: 192,
  height: 128,
};

export const DiagramMinimap = ({
  svg,
  viewportSize,
  diagramBounds,
  scale,
  position,
  onPositionChange,
  onInteractionChange,
}: DiagramMinimapProps) => {
  const minimapRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const svgDataUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    [svg]
  );
  const geometry =
    viewportSize && diagramBounds
      ? calculateMinimapGeometry({
          viewportSize,
          diagramBounds,
          scale,
          position,
          minimapSize: MINIMAP_SIZE,
        })
      : null;

  useEffect(
    () => () => {
      onInteractionChange(false);
    },
    [onInteractionChange]
  );

  const getLocalPoint = (clientX: number, clientY: number) => {
    const bounds = minimapRef.current?.getBoundingClientRect();

    if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }

    return {
      x: ((clientX - bounds.left) / bounds.width) * MINIMAP_SIZE.width,
      y: ((clientY - bounds.top) / bounds.height) * MINIMAP_SIZE.height,
    };
  };

  const navigateToPoint = (point: Point, offset: Point) => {
    if (!viewportSize || !diagramBounds) {
      return;
    }

    const nextPosition = calculatePositionFromMinimapPoint(
      {
        viewportSize,
        diagramBounds,
        scale,
        position,
        minimapSize: MINIMAP_SIZE,
      },
      {
        x: point.x - offset.x,
        y: point.y - offset.y,
      }
    );

    if (nextPosition) {
      onPositionChange(nextPosition);
    }
  };

  const startPointerNavigation = (
    event: PointerEvent<HTMLButtonElement>,
    fromViewport: boolean
  ) => {
    const point = getLocalPoint(event.clientX, event.clientY);

    event.preventDefault();
    event.stopPropagation();

    if (!point || !geometry) {
      return;
    }

    const offset = fromViewport
      ? {
          x: point.x - (geometry.rawViewport.x + geometry.rawViewport.width / 2),
          y: point.y - (geometry.rawViewport.y + geometry.rawViewport.height / 2),
        }
      : { x: 0, y: 0 };

    dragStateRef.current = {
      pointerId: event.pointerId,
      offset,
      startPoint: point,
      fromViewport,
      moved: false,
    };
    onInteractionChange(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    navigateToPoint(point, offset);
  };

  const continuePointerNavigation = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const point = getLocalPoint(event.clientX, event.clientY);

    if (point) {
      if (
        Math.hypot(
          point.x - dragState.startPoint.x,
          point.y - dragState.startPoint.y
        ) > 3
      ) {
        dragState.moved = true;
      }
      navigateToPoint(point, dragState.offset);
    }
  };

  const finishPointerNavigation = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    const dragState = dragStateRef.current;
    dragStateRef.current = null;
    onInteractionChange(false);

    if (
      dragState.fromViewport &&
      !dragState.moved &&
      event.type === 'pointerup'
    ) {
      const point = getLocalPoint(event.clientX, event.clientY);

      if (point) {
        navigateToPoint(point, { x: 0, y: 0 });
      }
    }

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 80 : 32;
    let nextPosition: Point | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        nextPosition = { ...position, x: position.x + step };
        break;
      case 'ArrowRight':
        nextPosition = { ...position, x: position.x - step };
        break;
      case 'ArrowUp':
        nextPosition = { ...position, y: position.y + step };
        break;
      case 'ArrowDown':
        nextPosition = { ...position, y: position.y - step };
        break;
      case 'Home':
        nextPosition = { x: 0, y: 0 };
        break;
      default:
        return;
    }

    event.preventDefault();
    onPositionChange(nextPosition);
  };

  return (
    <div
      ref={minimapRef}
      role="region"
      aria-label="Diagram minimap"
      className="absolute left-4 top-4 z-20 hidden overflow-hidden rounded-md border border-border bg-background/90 shadow-lg backdrop-blur-sm md:block"
      style={MINIMAP_SIZE}
    >
      <img
        src={svgDataUrl}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-75"
      />
      <button
        type="button"
        aria-label="Center diagram from minimap"
        className="absolute inset-0 cursor-crosshair rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        style={{ touchAction: 'none' }}
        onPointerDown={(event) => startPointerNavigation(event, false)}
        onPointerMove={continuePointerNavigation}
        onPointerUp={finishPointerNavigation}
        onPointerCancel={finishPointerNavigation}
        onLostPointerCapture={finishPointerNavigation}
        onKeyDown={handleKeyboardNavigation}
        onClick={(event) => {
          if (event.detail === 0) {
            onPositionChange({ x: 0, y: 0 });
          }
        }}
      />
      {geometry?.viewport && (
        <button
          type="button"
          aria-label="Diagram viewport. Drag to navigate or use the arrow keys."
          className="absolute z-10 cursor-grab border-2 border-primary bg-primary/15 shadow-sm outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            left: geometry.viewport.x,
            top: geometry.viewport.y,
            width: geometry.viewport.width,
            height: geometry.viewport.height,
            touchAction: 'none',
          }}
          onPointerDown={(event) => startPointerNavigation(event, true)}
          onPointerMove={continuePointerNavigation}
          onPointerUp={finishPointerNavigation}
          onPointerCancel={finishPointerNavigation}
          onLostPointerCapture={finishPointerNavigation}
          onKeyDown={handleKeyboardNavigation}
        />
      )}
    </div>
  );
};
