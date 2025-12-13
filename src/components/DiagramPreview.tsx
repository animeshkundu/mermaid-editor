import { useEffect, useRef, useState, useCallback } from 'react';
import { renderMermaid, extractErrorMessage } from '@/lib/mermaid';
import { MermaidConfig } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WarningCircle } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { PanZoomContainer } from '@/components/PanZoomContainer';

interface DiagramPreviewProps {
  code: string;
  config: MermaidConfig;
  onSvgRendered?: (svgString: string) => void;
}

export const DiagramPreview = ({ code, config, onSvgRendered }: DiagramPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvg('');
      setError('');
      onSvgRendered?.('');
      return;
    }

    setIsRendering(true);
    setError('');

    try {
      const elementId = `mermaid-${Date.now()}`;
      const result = await renderMermaid(code, elementId, config);
      setSvg(result.svg);
      setError('');
      onSvgRendered?.(result.svg);
    } catch (err) {
      setError(extractErrorMessage(err));
      setSvg('');
      onSvgRendered?.('');
    } finally {
      setIsRendering(false);
    }
  }, [code, config, onSvgRendered]);

  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(() => {
      renderDiagram();
    }, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [renderDiagram]);

  return (
    <div className="h-full w-full diagram-preview-bg">
      {isRendering && !svg && !error && (
        <div className="flex items-center justify-center h-full p-6">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full p-6">
          <div className="w-full max-w-2xl">
            <Alert variant="destructive">
              <WarningCircle className="h-5 w-5" />
              <AlertDescription className="mt-2">
                <div className="font-semibold mb-1">Syntax Error</div>
                <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {svg && !error && (
        <PanZoomContainer>
          <div className="flex items-center justify-center min-h-full p-6">
            <div
              ref={containerRef}
              className="mermaid-diagram"
              data-testid="mermaid-diagram"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </PanZoomContainer>
      )}

      {!code.trim() && !isRendering && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground space-y-2">
            <div className="text-lg font-medium">Start typing to see your diagram</div>
            <div className="text-sm">Try selecting an example from the toolbar above</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const getSvgContent = (containerRef: React.RefObject<HTMLDivElement>): string | undefined => {
  return containerRef.current?.querySelector('svg')?.outerHTML;
};
