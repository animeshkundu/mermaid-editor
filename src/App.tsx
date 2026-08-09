import { useState, useRef, useCallback, Suspense, lazy, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Toolbar, LayoutDirection, AppTheme } from '@/components/Toolbar';
import { DiagramPreview } from '@/components/DiagramPreview';
import { ConfigDialog } from '@/components/ConfigDialog';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ExportFormat,
  MermaidConfig,
  EditorSettings,
  DiagramExample,
  MermaidTheme,
  PNGScale,
  RenderDiagnostic,
} from '@/types';
import {
  DEFAULT_DIAGRAM_CODE,
  DEFAULT_MERMAID_CONFIG,
  DEFAULT_EDITOR_SETTINGS,
} from '@/lib/constants';
import { exportDiagram, copyImageToClipboard } from '@/lib/export';
import { copyShareUrl, parseUrlState } from '@/lib/share';
import { useHistory } from '@/hooks/use-history';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Code, Eye } from '@phosphor-icons/react';

const CodeEditor = lazy(() => import('@/components/CodeEditor').then(module => ({ default: module.CodeEditor })));

function App() {
  const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
  const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
  const [editorSettings] = useLocalStorage<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSvgString, setCurrentSvgString] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState<RenderDiagnostic | null>(null);
  const [isExportStale, setIsExportStale] = useState(false);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
  const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Apply app theme to document
  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme]);

  // History management
  const { pushCode, undo, redo, canUndo, canRedo } = useHistory({
    initialCode: code || DEFAULT_DIAGRAM_CODE,
    onCodeChange: (newCode) => setCode(newCode),
  });

  // Load state from URL on mount
  useEffect(() => {
    const urlState = parseUrlState();
    if (urlState?.code) {
      setCode(urlState.code);
      if (urlState.config) {
        setConfig(urlState.config);
      }
      toast.success('Diagram loaded from URL');
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    pushCode(newCode);
    // Update history state for UI
    setHistoryState({ canUndo: canUndo(), canRedo: canRedo() });
  }, [setCode, pushCode, canUndo, canRedo]);

  const handleUndo = useCallback(() => {
    undo();
    setHistoryState({ canUndo: canUndo(), canRedo: canRedo() });
  }, [undo, canUndo, canRedo]);

  const handleRedo = useCallback(() => {
    redo();
    setHistoryState({ canUndo: canUndo(), canRedo: canRedo() });
  }, [redo, canUndo, canRedo]);

  const handleShare = useCallback(async () => {
    try {
      await copyShareUrl({
        code: code || '',
        config: config || DEFAULT_MERMAID_CONFIG,
      });
    } catch (error) {
      toast.error('Failed to copy share link');
      console.error(error);
    }
  }, [code, config]);

  const handleThemeChange = useCallback((theme: MermaidTheme) => {
    setConfig({
      ...config,
      theme,
    });
  }, [config, setConfig]);

  const handleLayoutChange = useCallback((direction: LayoutDirection) => {
    setLayout(direction);
  }, [setLayout]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleAppThemeChange = useCallback((theme: AppTheme) => {
    setAppTheme(theme);
  }, [setAppTheme]);

  const handleConfigSave = useCallback((newConfig: MermaidConfig) => {
    setConfig(newConfig);
  }, [setConfig]);

  const handleExport = useCallback(async (format: ExportFormat, scale?: PNGScale) => {
    const svgAtClick = currentSvgString;

    try {
      if (!svgAtClick && format !== 'markdown') {
        toast.error('No diagram to export');
        return;
      }

      await exportDiagram(format, code || '', svgAtClick, { scale });
      toast.success(`Exported as ${format.toUpperCase()}`);
      if (isExportStale && format !== 'markdown') {
        toast.warning('Exported last valid diagram — current source has errors');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  }, [code, currentSvgString, isExportStale]);

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
    const svgAtClick = currentSvgString;

    try {
      if (!svgAtClick) {
        toast.error('No diagram to copy');
        return;
      }

      await copyImageToClipboard(svgAtClick);
      toast.success('Image copied to clipboard');
      if (isExportStale) {
        toast.warning('Exported last valid diagram — current source has errors');
      }
    } catch (error) {
      toast.error('Failed to copy image');
      console.error(error);
    }
  }, [currentSvgString, isExportStale]);

  const handleSvgRendered = useCallback((svgString: string) => {
    setCurrentSvgString(svgString);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopyCode: handleCopyCode,
    onExport: () => handleExport('png'),
    onShowHelp: () => setIsShortcutsOpen(true),
    onOpenConfig: () => setIsConfigOpen(true),
    onToggleFullscreen: handleFullscreen,
    onToggleLayout: () => handleLayoutChange(layout === 'horizontal' ? 'vertical' : 'horizontal'),
    isFullscreen,
  });

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <Toolbar
        onExport={handleExport}
        onLoadExample={handleLoadExample}
        onOpenConfig={() => setIsConfigOpen(true)}
        onCopyCode={handleCopyCode}
        onCopyImage={handleCopyImage}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onShare={handleShare}
        onThemeChange={handleThemeChange}
        onShowShortcuts={() => setIsShortcutsOpen(true)}
        onLayoutChange={handleLayoutChange}
        onFullscreen={handleFullscreen}
        onAppThemeChange={handleAppThemeChange}
        currentCode={code || ''}
        currentTheme={config?.theme || 'default'}
        currentLayout={layout || 'horizontal'}
        currentAppTheme={appTheme || 'light'}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
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
                errorMarker={diagnostic}
              />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="preview"
            forceMount
            className="flex-1 m-0 data-[state=inactive]:hidden"
            ref={previewRef}
          >
            <DiagramPreview 
              code={code || ''} 
              config={config || DEFAULT_MERMAID_CONFIG}
              onSvgRendered={handleSvgRendered}
              onDiagnostic={setDiagnostic}
              onStaleChange={setIsExportStale}
            />
          </TabsContent>
        </Tabs>
      ) : isFullscreen ? (
        <div className="flex-1 relative">
          <div ref={previewRef} className="h-full w-full">
            <DiagramPreview 
              code={code || ''} 
              config={config || DEFAULT_MERMAID_CONFIG}
              onSvgRendered={handleSvgRendered}
              onDiagnostic={setDiagnostic}
              onStaleChange={setIsExportStale}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-10"
            onClick={() => setIsFullscreen(false)}
          >
            Exit Fullscreen
          </Button>
        </div>
      ) : (
        <ResizablePanelGroup direction={layout || 'horizontal'} className="flex-1">
          <ResizablePanel defaultSize={50} minSize={20}>
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
                  errorMarker={diagnostic}
                />
              </Suspense>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={20}>
            <div ref={previewRef} className="h-full">
              <DiagramPreview 
                code={code || ''} 
                config={config || DEFAULT_MERMAID_CONFIG}
                onSvgRendered={handleSvgRendered}
                onDiagnostic={setDiagnostic}
                onStaleChange={setIsExportStale}
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

      <KeyboardShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />

      <Toaster />
    </div>
  );
}

export default App;