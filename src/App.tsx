import { useState, useRef, useCallback, Suspense, lazy, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Toolbar, LayoutDirection, AppTheme } from '@/components/Toolbar';
import { DiagramPreview } from '@/components/DiagramPreview';
import { ConfigDialog } from '@/components/ConfigDialog';
import { ImportConfigDialog } from '@/components/ImportConfigDialog';
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
import {
  clearUrlState,
  copyShareUrl,
  parseUrlStateResult,
} from '@/lib/share';
import { useHistory } from '@/hooks/use-history';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Code, Eye } from '@phosphor-icons/react';
import { sanitizeMermaidSource } from '@/lib/sanitize-source';
import { createEffectiveConfig } from '@/lib/mermaid-config';
import {
  STORAGE_ERROR_EVENT,
  type StorageErrorDetail,
} from '@/hooks/use-local-storage';
import { useOnlineStatus } from '@/hooks/use-online-status';

const CodeEditor = lazy(async () => {
  await import('@/lib/monaco-loader');
  const module = await import('@/components/CodeEditor');
  return { default: module.CodeEditor };
});

function App() {
  const [persistedCode, setPersistedCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
  const [sharedCode, setSharedCode] = useState<string | null>(null);
  const code = sharedCode ?? persistedCode;
  const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
  const [editorSettings] = useLocalStorage<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSvgString, setCurrentSvgString] = useState<string>('');
  const [diagnostic, setDiagnostic] = useState<RenderDiagnostic | null>(null);
  const [isExportStale, setIsExportStale] = useState(false);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [pendingImportedConfig, setPendingImportedConfig] = useState<MermaidConfig | null>(null);
  const [liveMessage, setLiveMessage] = useState('Editor ready');
  const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
  const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
  const previewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();

  const persistCode = useCallback((nextCode: string) => {
    setSharedCode(null);
    setPersistedCode(nextCode);
  }, [setPersistedCode]);

  // Apply app theme to document
  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme]);

  useEffect(() => {
    const handleStorageError = (event: Event) => {
      const detail = (event as CustomEvent<StorageErrorDetail>).detail;
      toast.error('Changes could not be saved locally', {
        description:
          detail.operation === 'read'
            ? 'Stored data is corrupt. The original value was left untouched so it can be recovered.'
            : 'Your current work remains open. Free browser storage before reloading.',
      });
      setLiveMessage('Local storage problem. Current work remains open; do not reload yet.');
    };
    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError);
  }, []);

  useEffect(() => {
    setLiveMessage(
      isOnline
        ? 'Application is online'
        : 'Application is offline. Cached editor features remain available.'
    );
  }, [isOnline]);

  // History management
  const { pushCode, undo, redo, canUndo, canRedo } = useHistory({
    initialCode: code || DEFAULT_DIAGRAM_CODE,
    onCodeChange: persistCode,
  });

  // Load state from URL on mount
  useEffect(() => {
    const result = parseUrlStateResult();
    if (result.status === 'invalid') {
      const description =
        result.reason === 'oversized'
          ? 'The shared diagram exceeds the supported link size. Your saved diagram is unchanged. Ask the sender to reduce it and share again.'
          : 'The link is invalid or damaged. Your saved diagram is unchanged. Check the link or ask the sender to share it again.';
      toast.error('Shared link could not be opened', {
        description,
        action: {
          label: 'Remove invalid link',
          onClick: clearUrlState,
        },
      });
      setLiveMessage(`Shared link could not be opened. ${description}`);
      return;
    }
    if (result.status === 'valid') {
      setSharedCode(sanitizeMermaidSource(result.state.code));
      if (result.state.config) {
        setPendingImportedConfig(result.state.config);
      }
      toast.success('Shared diagram opened without replacing your saved work');
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    persistCode(newCode);
    pushCode(newCode);
    // Update history state for UI
    setHistoryState({ canUndo: canUndo(), canRedo: canRedo() });
  }, [persistCode, pushCode, canUndo, canRedo]);

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
    setConfig(createEffectiveConfig({
      ...config,
      theme,
    }));
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
    setConfig(createEffectiveConfig(newConfig));
  }, [setConfig]);

  const handleApplyImportedConfig = useCallback(() => {
    if (pendingImportedConfig) {
      setConfig(createEffectiveConfig(pendingImportedConfig));
      toast.success('Shared configuration applied');
    }
    setPendingImportedConfig(null);
  }, [pendingImportedConfig, setConfig]);

  const handleExport = useCallback(async (format: ExportFormat, scale?: PNGScale) => {
    const svgAtClick = currentSvgString;

    try {
      if (!svgAtClick && format !== 'markdown') {
        toast.error('No diagram to export');
        return;
      }

      const result = await exportDiagram(format, code || '', svgAtClick, { scale });
      toast.success(`Exported as ${format.toUpperCase()}`);
      if (result?.scaleReduced) {
        toast.warning(
          `PNG scale reduced from ${result.requestedScale}x to ${result.appliedScale}x to stay within browser canvas limits`
        );
      }
      if (isExportStale && format !== 'markdown') {
        toast.warning('Exported last valid diagram — current source has errors');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
      console.error(error);
    }
  }, [code, currentSvgString, isExportStale]);

  const handleLoadExample = useCallback((example: DiagramExample) => {
    persistCode(example.code);
    pushCode(example.code);
    toast.success(`Loaded: ${example.name}`);
  }, [persistCode, pushCode]);

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

      const result = await copyImageToClipboard(svgAtClick);
      toast.success('Image copied to clipboard');
      if (result?.scaleReduced) {
        toast.warning(
          `Image scale reduced from ${result.requestedScale}x to ${result.appliedScale}x to stay within browser canvas limits`
        );
      }
      if (isExportStale) {
        toast.warning('Exported last valid diagram — current source has errors');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to copy image');
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
        isOnline={isOnline}
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
              onStatusChange={setLiveMessage}
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
              onStatusChange={setLiveMessage}
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

          <ResizableHandle withHandle aria-label="Resize editor and preview panels" />

          <ResizablePanel defaultSize={50} minSize={20}>
            <div ref={previewRef} className="h-full">
              <DiagramPreview 
                code={code || ''} 
                config={config || DEFAULT_MERMAID_CONFIG}
                onSvgRendered={handleSvgRendered}
                onDiagnostic={setDiagnostic}
                onStaleChange={setIsExportStale}
                onStatusChange={setLiveMessage}
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

      <ImportConfigDialog
        open={pendingImportedConfig !== null}
        config={pendingImportedConfig}
        onApply={handleApplyImportedConfig}
        onDiscard={() => setPendingImportedConfig(null)}
      />

      <KeyboardShortcutsDialog
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />

      <Toaster />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

export default App;