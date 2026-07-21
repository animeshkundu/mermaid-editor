import { describe, expect, it } from 'vitest';
import {
  calculateMinimapGeometry,
  calculatePositionFromMinimapPoint,
} from '@/lib/minimap';

const geometryInput = {
  viewportSize: { width: 400, height: 300 },
  diagramBounds: {
    x: -200,
    y: -150,
    width: 800,
    height: 600,
  },
  scale: 2,
  position: { x: 40, y: -20 },
  minimapSize: { width: 192, height: 128 },
};

describe('diagram minimap geometry', () => {
  it('inverts centered pan and zoom into the minimap viewport', () => {
    const geometry = calculateMinimapGeometry(geometryInput);

    expect(geometry).not.toBeNull();
    expect(geometry?.thumbnail).toEqual({
      x: expect.closeTo(10.6667, 3),
      y: 0,
      width: expect.closeTo(170.6667, 3),
      height: 128,
    });
    expect(geometry?.rawViewport).toEqual({
      x: expect.closeTo(70.4, 3),
      y: expect.closeTo(50.1333, 3),
      width: expect.closeTo(42.6667, 3),
      height: 32,
    });
  });

  it('maps a minimap point back to main-view pan without changing zoom', () => {
    const centeredPosition = calculatePositionFromMinimapPoint(
      geometryInput,
      { x: 96, y: 64 }
    );
    const rightEdgePosition = calculatePositionFromMinimapPoint(
      geometryInput,
      { x: 192, y: 64 }
    );

    expect(centeredPosition).toEqual({ x: 0, y: 0 });
    expect(rightEdgePosition).toEqual({ x: -800, y: 0 });
  });

  it('clips a viewport that extends beyond the diagram thumbnail', () => {
    const geometry = calculateMinimapGeometry({
      ...geometryInput,
      scale: 0.5,
      position: { x: 0, y: 0 },
    });

    expect(geometry?.viewport).toEqual(geometry?.thumbnail);
  });

  it('returns null when layout dimensions are unavailable', () => {
    const zeroLayout = {
      ...geometryInput,
      viewportSize: { width: 0, height: 0 },
    };

    expect(calculateMinimapGeometry(zeroLayout)).toBeNull();
    expect(
      calculatePositionFromMinimapPoint(zeroLayout, { x: 96, y: 64 })
    ).toBeNull();
  });
});
