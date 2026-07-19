import { ExportFormat } from '@/types';

const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseSVGString = (svgString: string): SVGSVGElement => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');
  
  if (!svgElement) {
    throw new Error('Invalid SVG string');
  }
  
  return svgElement as SVGSVGElement;
};

const parseNumericValue = (value: string | null): number => {
  if (!value) return 0;
  // Remove units like 'px', '%', 'em', etc. and parse the numeric part
  const numericMatch = value.match(/^([\d.]+)/);
  if (numericMatch) {
    const num = parseFloat(numericMatch[1]);
    // If it's a percentage, treat as invalid (need viewBox)
    if (value.includes('%')) return 0;
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const getSVGDimensions = (svgString: string): { width: number; height: number } => {
  const svgElement = parseSVGString(svgString);
  
  const widthAttr = svgElement.getAttribute('width');
  const heightAttr = svgElement.getAttribute('height');
  
  let width = parseNumericValue(widthAttr);
  let height = parseNumericValue(heightAttr);

  // Always check viewBox as it's more reliable for mermaid SVGs
  const viewBox = svgElement.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4) {
      const [, , vbWidth, vbHeight] = parts;
      // Prefer viewBox dimensions if width/height are missing, zero, or percentages
      if (!width || width === 0) {
        width = vbWidth;
      }
      if (!height || height === 0) {
        height = vbHeight;
      }
    }
  }

  // Try to get bounding box from the SVG content if still no dimensions
  if (!width || !height || isNaN(width) || isNaN(height) || width === 0 || height === 0) {
    // Check for style attribute with width/height
    const style = svgElement.getAttribute('style') || '';
    const styleWidth = style.match(/width:\s*([\d.]+)/);
    const styleHeight = style.match(/height:\s*([\d.]+)/);
    if (styleWidth) width = parseFloat(styleWidth[1]) || width;
    if (styleHeight) height = parseFloat(styleHeight[1]) || height;
  }

  // Final fallback
  if (!width || !height || isNaN(width) || isNaN(height) || width === 0 || height === 0) {
    width = 800;
    height = 600;
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

const prepareSVGForExport = (svgString: string): string => {
  const svgElement = parseSVGString(svgString);
  
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  // Get proper dimensions and set them explicitly
  const { width, height } = getSVGDimensions(svgString);
  svgElement.setAttribute('width', String(width));
  svgElement.setAttribute('height', String(height));
  
  // Ensure viewBox is set for proper scaling
  if (!svgElement.getAttribute('viewBox')) {
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  
  // Remove @import rules that won't work in isolated SVG
  const existingStyle = svgElement.querySelector('style');
  if (existingStyle && existingStyle.textContent) {
    existingStyle.textContent = existingStyle.textContent.replace(/@import[^;]+;/g, '');
  }
  
  // Inline computed styles on all elements to ensure they render correctly
  // when the SVG is used as an image (which doesn't have access to page CSS)
  const elementsToStyle = svgElement.querySelectorAll('*');
  
  // Create a temporary container to compute styles
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  document.body.appendChild(tempContainer);
  
  // Clone the SVG and add to DOM to compute styles
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  tempContainer.appendChild(svgClone);
  
  // Important CSS properties to inline for SVG rendering
  const cssProperties = [
    'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
    'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity',
    'font-family', 'font-size', 'font-weight', 'font-style',
    'text-anchor', 'dominant-baseline', 'alignment-baseline',
    'visibility', 'display'
  ];
  
  const clonedElements = svgClone.querySelectorAll('*');
  clonedElements.forEach((clonedEl, index) => {
    const originalEl = elementsToStyle[index];
    if (!originalEl) return;
    
    const computedStyle = window.getComputedStyle(clonedEl);
    const inlineStyles: string[] = [];
    
    cssProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== '' && value !== 'normal') {
        // Skip default/inherited values that don't affect rendering
        if (prop === 'fill' && value === 'rgb(0, 0, 0)') return; // default black
        if (prop === 'stroke' && value === 'none') return;
        if (prop === 'opacity' && value === '1') return;
        if (prop === 'visibility' && value === 'visible') return;
        if (prop === 'display' && value === 'inline') return;
        
        inlineStyles.push(`${prop}: ${value}`);
      }
    });
    
    if (inlineStyles.length > 0) {
      const existingStyle = originalEl.getAttribute('style') || '';
      const newStyle = existingStyle 
        ? `${existingStyle}; ${inlineStyles.join('; ')}`
        : inlineStyles.join('; ');
      originalEl.setAttribute('style', newStyle);
    }
  });
  
  // Clean up
  document.body.removeChild(tempContainer);
  
  // Add a white background rect if not present (ensures no transparency issues)
  const hasBackground = svgElement.querySelector('rect[class*="background"]') || 
                        svgElement.querySelector('rect:first-child');
  if (!hasBackground) {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', '#ffffff');
    svgElement.insertBefore(bgRect, svgElement.firstChild);
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};

// Browser canvas size limits (conservative estimates)
// Most browsers limit canvas to ~16384x16384 pixels or ~268 million total pixels
const MAX_CANVAS_DIMENSION = 16384;
const MAX_CANVAS_PIXELS = 268435456; // 16384 * 16384

/**
 * Calculate the maximum safe scale for a canvas given its dimensions
 */
const getMaxSafeScale = (width: number, height: number, requestedScale: number): number => {
  let scale = requestedScale;
  
  // Reduce scale until we're within browser limits
  while (scale > 1) {
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const totalPixels = scaledWidth * scaledHeight;
    
    if (scaledWidth <= MAX_CANVAS_DIMENSION && 
        scaledHeight <= MAX_CANVAS_DIMENSION && 
        totalPixels <= MAX_CANVAS_PIXELS) {
      break;
    }
    scale--;
  }
  
  return scale;
};

const svgStringToCanvas = async (
  svgString: string,
  scale: number = 3
): Promise<HTMLCanvasElement> => {
  const preparedSvg = prepareSVGForExport(svgString);
  const { width, height } = getSVGDimensions(svgString);

  // Auto-reduce scale for very large diagrams to stay within browser limits
  const safeScale = getMaxSafeScale(width, height, scale);
  if (safeScale < scale) {
    console.warn(`Canvas too large at ${scale}x scale. Reduced to ${safeScale}x.`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width * safeScale;
  canvas.height = height * safeScale;

  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false,
  });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const svgBase64 = btoa(unescape(encodeURIComponent(preparedSvg)));
    const svgDataUrl = 'data:image/svg+xml;base64,' + svgBase64;

    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load SVG'));
    };

    img.src = svgDataUrl;
  });
};

export const exportSVG = (svgString: string, filename: string = 'diagram.svg') => {
  const preparedSvg = prepareSVGForExport(svgString);
  downloadFile(preparedSvg, filename, 'image/svg+xml');
};

export type PNGScale = 1 | 2 | 3 | 4;

export const exportPNG = async (
  svgString: string,
  filename: string = 'diagram.png',
  scale: PNGScale = 3
): Promise<void> => {
  const canvas = await svgStringToCanvas(svgString, scale);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          downloadFile(blob, filename, 'image/png');
          resolve();
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      'image/png',
      1.0
    );
  });
};

export const copyImageToClipboard = async (svgString: string): Promise<void> => {
  const canvas = await svgStringToCanvas(svgString, 3);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            resolve();
          } catch (err) {
            reject(new Error('Clipboard access denied: ' + String(err)));
          }
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      'image/png',
      1.0
    );
  });
};

export const copySVGToClipboard = async (svgString: string): Promise<void> => {
  const preparedSvg = prepareSVGForExport(svgString);
  await navigator.clipboard.writeText(preparedSvg);
};

export const exportMarkdown = (code: string, filename: string = 'diagram.md') => {
  const markdown = `\`\`\`mermaid\n${code}\n\`\`\``;
  downloadFile(markdown, filename, 'text/markdown');
};

export interface ExportOptions {
  scale?: PNGScale;
}

export const exportDiagram = async (
  format: ExportFormat,
  code: string,
  svgString?: string,
  options: ExportOptions = {}
) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `mermaid-${timestamp}`;

  switch (format) {
    case 'svg':
      if (svgString) {
        exportSVG(svgString, `${filename}.svg`);
      }
      break;
    case 'png':
      if (svgString) {
        await exportPNG(svgString, `${filename}.png`, options.scale || 3);
      }
      break;
    case 'markdown':
      exportMarkdown(code, `${filename}.md`);
      break;
  }
};
