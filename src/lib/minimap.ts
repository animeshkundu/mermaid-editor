type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Rectangle = Point & Size;

type MinimapGeometryInput = {
  viewportSize: Size;
  diagramBounds: Rectangle;
  scale: number;
  position: Point;
  minimapSize: Size;
};

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export const calculateMinimapGeometry = ({
  viewportSize,
  diagramBounds,
  scale,
  position,
  minimapSize,
}: MinimapGeometryInput) => {
  if (
    !isPositiveFinite(viewportSize.width) ||
    !isPositiveFinite(viewportSize.height) ||
    !isPositiveFinite(diagramBounds.width) ||
    !isPositiveFinite(diagramBounds.height) ||
    !isPositiveFinite(scale) ||
    !isPositiveFinite(minimapSize.width) ||
    !isPositiveFinite(minimapSize.height)
  ) {
    return null;
  }

  const thumbnailScale = Math.min(
    minimapSize.width / diagramBounds.width,
    minimapSize.height / diagramBounds.height
  );
  const thumbnail = {
    x: (minimapSize.width - diagramBounds.width * thumbnailScale) / 2,
    y: (minimapSize.height - diagramBounds.height * thumbnailScale) / 2,
    width: diagramBounds.width * thumbnailScale,
    height: diagramBounds.height * thumbnailScale,
  };
  const viewportCenter = {
    x: viewportSize.width / 2,
    y: viewportSize.height / 2,
  };
  const visibleDiagramBounds = {
    x: viewportCenter.x - (viewportCenter.x + position.x) / scale,
    y: viewportCenter.y - (viewportCenter.y + position.y) / scale,
    width: viewportSize.width / scale,
    height: viewportSize.height / scale,
  };
  const rawViewport = {
    x:
      thumbnail.x +
      (visibleDiagramBounds.x - diagramBounds.x) * thumbnailScale,
    y:
      thumbnail.y +
      (visibleDiagramBounds.y - diagramBounds.y) * thumbnailScale,
    width: visibleDiagramBounds.width * thumbnailScale,
    height: visibleDiagramBounds.height * thumbnailScale,
  };
  const clippedViewport = {
    x: clamp(rawViewport.x, thumbnail.x, thumbnail.x + thumbnail.width),
    y: clamp(rawViewport.y, thumbnail.y, thumbnail.y + thumbnail.height),
    width:
      clamp(
        rawViewport.x + rawViewport.width,
        thumbnail.x,
        thumbnail.x + thumbnail.width
      ) - clamp(rawViewport.x, thumbnail.x, thumbnail.x + thumbnail.width),
    height:
      clamp(
        rawViewport.y + rawViewport.height,
        thumbnail.y,
        thumbnail.y + thumbnail.height
      ) - clamp(rawViewport.y, thumbnail.y, thumbnail.y + thumbnail.height),
  };

  return {
    thumbnail,
    thumbnailScale,
    rawViewport,
    viewport:
      clippedViewport.width > 0 && clippedViewport.height > 0
        ? clippedViewport
        : null,
  };
};

export const calculatePositionFromMinimapPoint = (
  input: MinimapGeometryInput,
  minimapPoint: Point
) => {
  const geometry = calculateMinimapGeometry(input);

  if (!geometry) {
    return null;
  }

  const target = {
    x:
      input.diagramBounds.x +
      clamp(
        (minimapPoint.x - geometry.thumbnail.x) / geometry.thumbnailScale,
        0,
        input.diagramBounds.width
      ),
    y:
      input.diagramBounds.y +
      clamp(
        (minimapPoint.y - geometry.thumbnail.y) / geometry.thumbnailScale,
        0,
        input.diagramBounds.height
      ),
  };

  return {
    x: input.scale * (input.viewportSize.width / 2 - target.x),
    y: input.scale * (input.viewportSize.height / 2 - target.y),
  };
};
