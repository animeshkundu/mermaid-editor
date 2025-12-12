import { ExportFormat } from '@/types';

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSVG = (svgContent: string, filename: string = 'diagram.svg') => {
  downloadFile(svgContent, filename, 'image/svg+xml');
};

const prepareSVGForExport = (svgContent: string): string => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');
  
  if (!svgElement) {
    throw new Error('Invalid SVG content');
  }

  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  const existingStyles = svgDoc.querySelectorAll('style');
  existingStyles.forEach(style => {
    if (style.textContent) {
      style.textContent = style.textContent.replace(/@import[^;]+;/g, '');
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
};

const getSVGDimensions = (svgContent: string): { width: number; height: number } => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');
  
  if (!svgElement) {
    return { width: 800, height: 600 };
  }

  let width = parseFloat(svgElement.getAttribute('width') || '0');
  let height = parseFloat(svgElement.getAttribute('height') || '0');

  const viewBox = svgElement.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(parseFloat);
    if (parts.length === 4) {
      const [, , vbWidth, vbHeight] = parts;
      if (!width || isNaN(width) || String(svgElement.getAttribute('width') || '').includes('%')) {
        width = vbWidth;
      }
      if (!height || isNaN(height) || String(svgElement.getAttribute('height') || '').includes('%')) {
        height = vbHeight;
      }
    }
  }

  if (!width || !height || isNaN(width) || isNaN(height)) {
    width = 800;
    height = 600;
  }

  return { width: Math.ceil(width), height: Math.ceil(height) };
};

export const exportPNG = async (svgContent: string, filename: string = 'diagram.png') => {
  return new Promise<void>((resolve, reject) => {
    try {
      const preparedSVG = prepareSVGForExport(svgContent);
      const { width, height } = getSVGDimensions(preparedSVG);

      const scale = 4;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: false 
      });
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const svgBlob = new Blob([preparedSVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load timeout'));
      }, 15000);

      img.onload = () => {
        clearTimeout(timeoutId);
        
        try {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(pngUrl), 100);
              resolve();
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          }, 'image/png', 1.0);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = (err) => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image: ' + String(err)));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

export const copyImageToClipboard = async (svgContent: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      const preparedSVG = prepareSVGForExport(svgContent);
      const { width, height } = getSVGDimensions(preparedSVG);

      const scale = 4;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: false 
      });
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const svgBlob = new Blob([preparedSVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load timeout'));
      }, 15000);

      img.onload = () => {
        clearTimeout(timeoutId);
        
        try {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            URL.revokeObjectURL(url);
            
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
          }, 'image/png', 1.0);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = (err) => {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image: ' + String(err)));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

export const exportMarkdown = (code: string, filename: string = 'diagram.md') => {
  const markdown = `\`\`\`mermaid\n${code}\n\`\`\``;
  downloadFile(markdown, filename, 'text/markdown');
};

export const exportDiagram = async (
  format: ExportFormat,
  code: string,
  svgContent?: string
) => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `mermaid-${timestamp}`;

  switch (format) {
    case 'svg':
      if (svgContent) {
        exportSVG(svgContent, `${filename}.svg`);
      }
      break;
    case 'png':
      if (svgContent) {
        await exportPNG(svgContent, `${filename}.png`);
      }
      break;
    case 'markdown':
      exportMarkdown(code, `${filename}.md`);
      break;
  }
};
