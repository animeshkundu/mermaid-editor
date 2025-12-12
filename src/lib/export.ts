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

const inlineStyles = (element: Element, computedStyles: Map<Element, CSSStyleDeclaration>): void => {
  if (!(element instanceof SVGElement && element instanceof Element)) {
    return;
  }

  const computed = computedStyles.get(element) || window.getComputedStyle(element);
  
  const importantStyles = [
    'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
    'opacity', 'font-family', 'font-size', 'font-weight', 'font-style',
    'text-anchor', 'dominant-baseline', 'alignment-baseline',
    'color', 'display', 'visibility', 'marker-start', 'marker-end', 'marker-mid'
  ];

  let styleString = '';
  importantStyles.forEach(prop => {
    const value = computed.getPropertyValue(prop);
    if (value && value !== 'none' && value !== 'normal') {
      styleString += `${prop}:${value};`;
    }
  });

  if (styleString) {
    const existingStyle = element.getAttribute('style') || '';
    element.setAttribute('style', existingStyle + styleString);
  }

  Array.from(element.children).forEach(child => {
    inlineStyles(child, computedStyles);
  });
};

const cloneSVGWithStyles = (originalSvg: SVGSVGElement): SVGSVGElement => {
  const computedStyles = new Map<Element, CSSStyleDeclaration>();
  
  const collectStyles = (element: Element) => {
    if (element instanceof SVGElement) {
      computedStyles.set(element, window.getComputedStyle(element));
    }
    Array.from(element.children).forEach(collectStyles);
  };
  
  collectStyles(originalSvg);
  
  const clonedSvg = originalSvg.cloneNode(true) as SVGSVGElement;
  
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  const existingStyle = clonedSvg.querySelector('style');
  if (existingStyle && existingStyle.textContent) {
    existingStyle.textContent = existingStyle.textContent.replace(/@import[^;]+;/g, '');
  }
  
  inlineStyles(clonedSvg, computedStyles);
  
  return clonedSvg;
};

const getSVGDimensions = (svgElement: SVGSVGElement): { width: number; height: number } => {
  let width = parseFloat(svgElement.getAttribute('width') || '0');
  let height = parseFloat(svgElement.getAttribute('height') || '0');

  const viewBox = svgElement.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4) {
      const [, , vbWidth, vbHeight] = parts;
      if (!width || isNaN(width) || width === 0) {
        width = vbWidth;
      }
      if (!height || isNaN(height) || height === 0) {
        height = vbHeight;
      }
    }
  }

  if (!width || !height || isNaN(width) || isNaN(height) || width === 0 || height === 0) {
    const bbox = svgElement.getBBox();
    width = bbox.width || 800;
    height = bbox.height || 600;
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

const svgToCanvas = (
  svgElement: SVGSVGElement,
  scale: number = 3
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    try {
      const clonedSvg = cloneSVGWithStyles(svgElement);
      const { width, height } = getSVGDimensions(clonedSvg);

      clonedSvg.setAttribute('width', String(width));
      clonedSvg.setAttribute('height', String(height));

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false,
      });

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeoutId);

        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

export const exportSVG = (svgElement: SVGSVGElement, filename: string = 'diagram.svg') => {
  const clonedSvg = cloneSVGWithStyles(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  downloadFile(svgString, filename, 'image/svg+xml');
};

export const exportPNG = async (
  svgElement: SVGSVGElement,
  filename: string = 'diagram.png'
): Promise<void> => {
  const canvas = await svgToCanvas(svgElement, 3);

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

export const copyImageToClipboard = async (svgElement: SVGSVGElement): Promise<void> => {
  const canvas = await svgToCanvas(svgElement, 3);

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

export const exportMarkdown = (code: string, filename: string = 'diagram.md') => {
  const markdown = `\`\`\`mermaid\n${code}\n\`\`\``;
  downloadFile(markdown, filename, 'text/markdown');
};

export const exportDiagram = async (
  format: ExportFormat,
  code: string,
  svgElement?: SVGSVGElement
) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `mermaid-${timestamp}`;

  switch (format) {
    case 'svg':
      if (svgElement) {
        exportSVG(svgElement, `${filename}.svg`);
      }
      break;
    case 'png':
      if (svgElement) {
        await exportPNG(svgElement, `${filename}.png`);
      }
      break;
    case 'markdown':
      exportMarkdown(code, `${filename}.md`);
      break;
  }
};
