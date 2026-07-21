import { useEffect, useRef, useState } from 'react';
import {
  renderMermaid,
} from '@/lib/mermaid';
import { detectContextType as detectDiagramType } from '@/lib/completions';
import { normalizeConfigKey, setCommittedConfig } from '@/lib/mermaid-config';
import {
  createRenderDiagnostic,
} from '@/lib/mermaid-diagnostics';
import type { DiagramType, MermaidConfig, RenderDiagnostic } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowClockwise, Gauge, Play, WarningCircle } from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { PanZoomContainer } from '@/components/PanZoomContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDiagramMetrics, requiresManualRender } from '@/lib/render-guard';

type DiagramPreviewProps = {
  code: string;
  config: MermaidConfig;
  onSvgRendered?: (svgString: string) => void;
  onDiagnostic?: (diagnostic: RenderDiagnostic | null) => void;
  onStaleChange?: (stale: boolean) => void;
  onStatusChange?: (message: string) => void;
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
  onStatusChange,
}: DiagramPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState<RenderDiagnostic | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [retryEpoch, setRetryEpoch] = useState(0);
  const [manualRenderEpoch, setManualRenderEpoch] = useState(0);
  const [needsManualRender, setNeedsManualRender] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const renderTokenRef = useRef(0);
  const mountedRef = useRef(false);
  const lastGoodRef = useRef<LastGoodRender | null>(null);
  const manualRenderApprovalRef = useRef<string | null>(null);

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
      setNeedsManualRender(false);
      onSvgRendered?.('');
      onDiagnostic?.(null);
      onStaleChange?.(false);
      onStatusChange?.('Diagram source is empty');
      return;
    }

    const effectiveConfigKey = normalizeConfigKey(config);
    const requestKey = `${effectiveConfigKey}\u0000${code}`;
    const manualRequired = requiresManualRender(code);

    if (manualRequired && manualRenderApprovalRef.current !== requestKey) {
      const currentType = detectDiagramType(code);
      const retained =
        currentType !== null && lastGoodRef.current?.type === currentType
          ? lastGoodRef.current
          : null;
      const metrics = getDiagramMetrics(code);

      setNeedsManualRender(true);
      setDiagnostic(null);
      setIsRendering(false);
      onDiagnostic?.(null);
      onStatusChange?.(
        `Large diagram ready. ${metrics.estimatedEdges.toLocaleString()} estimated connections. Activate Render now to continue.`
      );

      if (retained) {
        setSvg(retained.svg);
        setIsStale(true);
        onSvgRendered?.(retained.svg);
        onStaleChange?.(true);
      } else {
        setSvg('');
        setIsStale(false);
        onSvgRendered?.('');
        onStaleChange?.(false);
      }
      return;
    }

    setNeedsManualRender(false);

    renderTimeoutRef.current = setTimeout(async () => {
      if (!isCurrent()) {
        return;
      }

      setIsRendering(true);
      onStatusChange?.('Rendering diagram');
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
        onStatusChange?.('Diagram rendered');
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
        onStatusChange?.('Diagram rendered');
      } catch (error) {
        if (!isCurrent()) {
          return;
        }

        const nextDiagnostic = createRenderDiagnostic(error, code);
        const currentType = detectDiagramType(code);
        const retained =
          currentType !== null && lastGoodRef.current?.type === currentType
            ? lastGoodRef.current
            : null;

        setDiagnostic(nextDiagnostic);
        onDiagnostic?.(nextDiagnostic);
        onStatusChange?.(nextDiagnostic.message);

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
    onStatusChange,
    onSvgRendered,
    manualRenderEpoch,
    retryEpoch,
  ]);

  const retryRender = () => {
    setRetryEpoch((current) => current + 1);
  };

  const renderLargeDiagram = () => {
    manualRenderApprovalRef.current = `${normalizeConfigKey(config)}\u0000${code}`;
    setManualRenderEpoch((current) => current + 1);
  };

  const hasBlockingDiagnostic = diagnostic && !svg;
  const staleDescriptionId = 'mermaid-stale-preview-description';
  const metrics = getDiagramMetrics(code);

  return (
    <div className="flex h-full w-full flex-col diagram-preview-bg">
      {needsManualRender && svg && (
        <Alert
          className="mx-3 mt-3 w-auto shrink-0 py-2"
          role="status"
          aria-live="polite"
        >
          <Gauge weight="duotone" />
          <AlertTitle>Large diagram ready to render</AlertTitle>
          <AlertDescription className="flex w-full items-center justify-between gap-3">
            <span className="text-xs">
              Live rendering paused at {metrics.estimatedEdges.toLocaleString()} estimated
              connections to keep editing responsive. The last valid preview remains visible.
            </span>
            <Button type="button" size="sm" onClick={renderLargeDiagram}>
              <Play weight="duotone" />
              Render now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {diagnostic && svg && (
        <Alert
          className="mx-3 mt-3 w-auto shrink-0 py-2"
          variant={diagnostic.kind === 'dependency' ? 'default' : 'destructive'}
          role="status"
          aria-live="polite"
          data-testid="render-feedback"
        >
          <WarningCircle weight="duotone" />
          <AlertTitle>
            {diagnostic.kind === 'dependency'
              ? 'Preview dependency unavailable'
              : diagnostic.kind === 'limit'
                ? 'Diagram exceeds safe rendering limits'
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
              variant={diagnostic.kind === 'dependency' ? 'default' : 'destructive'}
              role="status"
              aria-live="polite"
            >
              <WarningCircle className="h-5 w-5" weight="duotone" />
              <AlertTitle>
                {diagnostic.kind === 'dependency'
                  ? 'Preview dependency unavailable'
                  : diagnostic.kind === 'limit'
                    ? 'Diagram exceeds safe rendering limits'
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

      {needsManualRender && !svg && (
        <div className="flex h-full items-center justify-center p-6">
          <Alert className="max-w-xl" role="status" aria-live="polite">
            <Gauge weight="duotone" />
            <AlertTitle>Large diagram ready to render</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                This source has {metrics.estimatedEdges.toLocaleString()} estimated
                connections. Automatic rendering is paused so editing stays responsive.
              </p>
              <Button type="button" onClick={renderLargeDiagram}>
                <Play weight="duotone" />
                Render now
              </Button>
            </AlertDescription>
          </Alert>
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
                  ? needsManualRender
                    ? 'Large diagram waiting for manual rendering. Showing the previous valid diagram.'
                    : 'Rendering paused. Showing the previous valid diagram.'
                  : 'Rendered Mermaid diagram'
              }
              aria-describedby={isStale ? staleDescriptionId : undefined}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {isStale && (
              <span id={staleDescriptionId} className="sr-only">
                {needsManualRender
                  ? 'The current large diagram has not been rendered yet. The previous valid diagram remains available for viewing and visual export.'
                  : 'The current source has errors. The previous valid diagram remains available for viewing and visual export.'}
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
