import { useEffect, useRef, useState } from 'react';
import {
  renderMermaid,
} from '@/lib/mermaid';
import { detectContextType as detectDiagramType } from '@/lib/completions';
import { normalizeConfigKey, setCommittedConfig } from '@/lib/mermaid-config';
import {
  extractErrorLocation,
  extractErrorMessage,
  isDependencyError,
} from '@/lib/mermaid-diagnostics';
import type { DiagramType, MermaidConfig, RenderDiagnostic } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { PanZoomContainer } from '@/components/PanZoomContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DiagramPreviewProps = {
  code: string;
  config: MermaidConfig;
  onSvgRendered?: (svgString: string) => void;
  onDiagnostic?: (diagnostic: RenderDiagnostic | null) => void;
  onStaleChange?: (stale: boolean) => void;
};

type LastGoodRender = {
  code: string;
  effectiveConfigKey: string;
  svg: string;
  type: DiagramType | null;
};

export const DiagramPreview = ({
  code,
  config,
  onSvgRendered,
  onDiagnostic,
  onStaleChange,
}: DiagramPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState<RenderDiagnostic | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [retryEpoch, setRetryEpoch] = useState(0);
  const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const renderTokenRef = useRef(0);
  const mountedRef = useRef(false);
  const lastGoodRef = useRef<LastGoodRender | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      renderTokenRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    const token = ++renderTokenRef.current;
    const isCurrent = () => mountedRef.current && token === renderTokenRef.current;

    if (!code.trim()) {
      lastGoodRef.current = null;
      setSvg('');
      setDiagnostic(null);
      setIsStale(false);
      setIsRendering(false);
      onSvgRendered?.('');
      onDiagnostic?.(null);
      onStaleChange?.(false);
      return;
    }

    const effectiveConfigKey = normalizeConfigKey(config);

    renderTimeoutRef.current = setTimeout(async () => {
      if (!isCurrent()) {
        return;
      }

      setIsRendering(true);
      const cached = lastGoodRef.current;

      if (
        cached &&
        cached.code === code &&
        cached.effectiveConfigKey === effectiveConfigKey
      ) {
        setSvg(cached.svg);
        setDiagnostic(null);
        setIsStale(false);
        setIsRendering(false);
        setCommittedConfig(config);
        onSvgRendered?.(cached.svg);
        onDiagnostic?.(null);
        onStaleChange?.(false);
        return;
      }

      try {
        const result = await renderMermaid(code, `mermaid-preview-${token}`, config, {
          isCurrent,
        });
        if (!isCurrent()) {
          return;
        }

        const lastGood: LastGoodRender = {
          code,
          effectiveConfigKey,
          svg: result.svg,
          type: detectDiagramType(code),
        };
        lastGoodRef.current = lastGood;
        setSvg(result.svg);
        setDiagnostic(null);
        setIsStale(false);
        setCommittedConfig(config);
        onSvgRendered?.(result.svg);
        onDiagnostic?.(null);
        onStaleChange?.(false);
      } catch (error) {
        if (!isCurrent()) {
          return;
        }

        const nextDiagnostic: RenderDiagnostic = {
          message: extractErrorMessage(error),
          location: extractErrorLocation(error, code),
          kind: isDependencyError(error) ? 'dependency' : 'syntax',
        };
        const currentType = detectDiagramType(code);
        const retained =
          currentType !== null && lastGoodRef.current?.type === currentType
            ? lastGoodRef.current
            : null;

        setDiagnostic(nextDiagnostic);
        onDiagnostic?.(nextDiagnostic);

        if (retained) {
          setSvg(retained.svg);
          setIsStale(true);
          onSvgRendered?.(retained.svg);
          onStaleChange?.(true);
        } else {
          lastGoodRef.current = null;
          setSvg('');
          setIsStale(false);
          onSvgRendered?.('');
          onStaleChange?.(false);
        }
      } finally {
        if (isCurrent()) {
          setIsRendering(false);
        }
      }
    }, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [
    code,
    config,
    onDiagnostic,
    onStaleChange,
    onSvgRendered,
    retryEpoch,
  ]);

  const retryRender = () => {
    setRetryEpoch((current) => current + 1);
  };

  const hasBlockingDiagnostic = diagnostic && !svg;
  const staleDescriptionId = 'mermaid-stale-preview-description';

  return (
    <div className="flex h-full w-full flex-col diagram-preview-bg">
      {diagnostic && svg && (
        <Alert
          className="mx-3 mt-3 w-auto shrink-0 py-2"
          variant={diagnostic.kind === 'syntax' ? 'destructive' : 'default'}
          role="status"
          aria-live="polite"
          data-testid="render-feedback"
        >
          <WarningCircle weight="duotone" />
          <AlertTitle>
            {diagnostic.kind === 'dependency'
              ? 'Preview dependency unavailable'
              : 'Rendering paused — showing last valid diagram'}
          </AlertTitle>
          <AlertDescription className="flex w-full grid-cols-none flex-row items-center justify-between gap-3">
            <span className="max-h-12 overflow-auto whitespace-pre-wrap font-mono text-xs">
              {diagnostic.message}
            </span>
            {diagnostic.kind === 'dependency' && (
              <Button type="button" variant="outline" size="sm" onClick={retryRender}>
                <ArrowClockwise weight="duotone" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isRendering && !svg && !diagnostic && (
        <div className="flex items-center justify-center h-full p-6">
          <div className="w-full max-w-2xl space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}

      {hasBlockingDiagnostic && (
        <div className="flex items-center justify-center h-full p-6">
          <div className="w-full max-w-2xl">
            <Alert
              variant={diagnostic.kind === 'syntax' ? 'destructive' : 'default'}
              role="status"
              aria-live="polite"
            >
              <WarningCircle className="h-5 w-5" weight="duotone" />
              <AlertTitle>
                {diagnostic.kind === 'dependency'
                  ? 'Preview dependency unavailable'
                  : 'Syntax Error'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {diagnostic.message}
                </pre>
                {diagnostic.kind === 'dependency' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={retryRender}
                  >
                    <ArrowClockwise weight="duotone" />
                    Retry rendering
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {svg && (
        <div className="min-h-0 flex-1">
          <PanZoomContainer>
          <div className="flex items-center justify-center min-h-full p-6">
            <div
              ref={containerRef}
              className={cn(
                'mermaid-diagram transition-opacity duration-200',
                isStale && 'opacity-[0.45]'
              )}
              data-testid="mermaid-diagram"
              aria-label={
                isStale
                  ? 'Rendering paused. Showing the previous valid diagram.'
                  : 'Rendered Mermaid diagram'
              }
              aria-describedby={isStale ? staleDescriptionId : undefined}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {isStale && (
              <span id={staleDescriptionId} className="sr-only">
                The current source has errors. The previous valid diagram remains available
                for viewing and visual export.
              </span>
            )}
          </div>
          </PanZoomContainer>
        </div>
      )}

      {!code.trim() && !isRendering && !diagnostic && (
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
