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

export const exportPNG = async (svgContent: string, filename: string = 'diagram.png') => {
  return new Promise<void>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
};

export const copyImageToClipboard = async (svgContent: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            URL.revokeObjectURL(url);
            resolve();
          } catch (err) {
            URL.revokeObjectURL(url);
            reject(err);
          }
        } else {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
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
