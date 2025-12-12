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

const prepareSVGForExport = (svgString: string): string => {
  const svgElement = parseSVGString(svgString);
  
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  const existingStyle = svgElement.querySelector('style');
  if (existingStyle && existingStyle.textContent) {
    existingStyle.textContent = existingStyle.textContent.replace(/@import[^;]+;/g, '');
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};

const getSVGDimensions = (svgString: string): { width: number; height: number } => {
  const svgElement = parseSVGString(svgString);
  
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
    width = 800;
    height = 600;
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

const svgStringToCanvas = (
  svgString: string,
  scale: number = 3
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    try {
      const preparedSvg = prepareSVGForExport(svgString);
      const { width, height } = getSVGDimensions(svgString);

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
      const svgBlob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
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
