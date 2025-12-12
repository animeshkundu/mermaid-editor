import { useState, useRef, useCallback, Suspense, lazy } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toolbar } from '@/components/Toolbar';
import { DiagramPreview } from '@/components/DiagramPreview';
import { ConfigDialog } from '@/components/ConfigDialog';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportFormat, MermaidConfig, EditorSettings, DiagramExample } from '@/types';
import {
  DEFAULT_DIAGRAM_CODE,
  DEFAULT_MERMAID_CONFIG,
  DEFAULT_EDITOR_SETTINGS,
} from '@/lib/constants';
import { exportDiagram, copyImageToClipboard } from '@/lib/export';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Code, Eye } from '@phosphor-icons/react';

const CodeEditor = lazy(() => import('@/components/CodeEditor').then(module => ({ default: module.CodeEditor })));

function App() {
  const [code, setCode] = useKV('mermaid-code', DEFAULT_DIAGRAM_CODE);
  const [config, setConfig] = useKV<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
  const [editorSettings] = useKV<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSvg, setCurrentSvg] = useState<string>('');
  const [currentSvgElement, setCurrentSvgElement] = useState<SVGSVGElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, [setCode]);

  const handleConfigSave = useCallback((newConfig: MermaidConfig) => {
    setConfig(newConfig);
  }, [setConfig]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      if (!currentSvgElement && format !== 'markdown') {
        toast.error('No diagram to export');
        return;
      }

      await exportDiagram(format, code || '', currentSvgElement || undefined);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  }, [code, currentSvgElement]);

  const handleLoadExample = useCallback((example: DiagramExample) => {
    setCode(example.code);
    toast.success(`Loaded: ${example.name}`);
  }, [setCode]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code || '');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [code]);

  const handleCopyImage = useCallback(async () => {
    try {
      if (!currentSvgElement) {
        toast.error('No diagram to copy');
        return;
      }

      await copyImageToClipboard(currentSvgElement);
      toast.success('Image copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy image');
      console.error(error);
    }
  }, [currentSvgElement]);

  const handleSvgRendered = useCallback((svg: string, svgElement: SVGSVGElement | null) => {
    setCurrentSvg(svg);
    setCurrentSvgElement(svgElement);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Toolbar
        onExport={handleExport}
        onLoadExample={handleLoadExample}
        onOpenConfig={() => setIsConfigOpen(true)}
        onCopyCode={handleCopyCode}
        onCopyImage={handleCopyImage}
        currentCode={code || ''}
      />

      {isMobile ? (
        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="editor" className="flex-1">
              <Code className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="editor" className="flex-1 m-0">
            <Suspense fallback={
              <div className="h-full w-full bg-[var(--editor-bg)] p-4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-6 w-5/6 mb-4" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            }>
              <CodeEditor
                value={code || ''}
                onChange={handleCodeChange}
                settings={editorSettings || DEFAULT_EDITOR_SETTINGS}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0" ref={previewRef}>
            <DiagramPreview 
              code={code || ''} 
              config={config || DEFAULT_MERMAID_CONFIG}
              onSvgRendered={handleSvgRendered}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <Suspense fallback={
                <div className="h-full w-full bg-[var(--editor-bg)] p-4">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-5/6 mb-4" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              }>
                <CodeEditor
                  value={code || ''}
                  onChange={handleCodeChange}
                  settings={editorSettings || DEFAULT_EDITOR_SETTINGS}
                />
              </Suspense>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div ref={previewRef} className="h-full">
              <DiagramPreview 
                code={code || ''} 
                config={config || DEFAULT_MERMAID_CONFIG}
                onSvgRendered={handleSvgRendered}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <ConfigDialog
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        config={config || DEFAULT_MERMAID_CONFIG}
        onSave={handleConfigSave}
      />

      <Toaster />
    </div>
  );
}

export default App;