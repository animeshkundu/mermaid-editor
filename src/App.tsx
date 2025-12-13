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
import { ExportFormat, MermaidConfig, EditorSettings, DiagramExample, MermaidTheme, PNGScale, EditMode, VisualState, DiagramType } from '@/types';
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
import { VisualEditorRegistry } from '@/components/visual-editor/VisualEditorRegistry';
import { SyncEngine } from '@/lib/visual-editor/SyncEngine';
import '@xyflow/react/dist/style.css';

const CodeEditor = lazy(() => import('@/components/CodeEditor').then(module => ({ default: module.CodeEditor })));

// Initialize sync engine (singleton)
const syncEngine = new SyncEngine();

function App() {
  const [code, setCode] = useLocalStorage('mermaid-code', DEFAULT_DIAGRAM_CODE);
  const [config, setConfig] = useLocalStorage<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
  const [editorSettings] = useLocalStorage<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSvgString, setCurrentSvgString] = useState<string>('');
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [layout, setLayout] = useLocalStorage<LayoutDirection>('layout-direction', 'horizontal');
  const [appTheme, setAppTheme] = useLocalStorage<AppTheme>('app-theme', 'light');
  
  // Visual Editor state
  const [editMode, setEditMode] = useLocalStorage<EditMode>('edit-mode', 'text');
  const [visualStates, setVisualStates] = useLocalStorage<Record<string, VisualState>>('visual-states', {});
  
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
    try {
      if (!currentSvgString && format !== 'markdown') {
        toast.error('No diagram to export');
        return;
      }

      await exportDiagram(format, code || '', currentSvgString, { scale });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  }, [code, currentSvgString]);

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
      if (!currentSvgString) {
        toast.error('No diagram to copy');
        return;
      }

      await copyImageToClipboard(currentSvgString);
      toast.success('Image copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy image');
      console.error(error);
    }
  }, [currentSvgString]);

  const handleSvgRendered = useCallback((svgString: string) => {
    setCurrentSvgString(svgString);
  }, []);

  // Visual editor state management
  const handleEditModeChange = useCallback((mode: EditMode) => {
    setEditMode(mode);
  }, [setEditMode]);

  const handleVisualStateChange = useCallback((diagramType: string, state: VisualState) => {
    setVisualStates(prev => ({
      ...prev,
      [diagramType]: state,
    }));

    // Sync visual changes back to text (debounced)
    syncEngine.syncVisualToText(state, diagramType as DiagramType).then(newCode => {
      if (newCode) {
        setCode(newCode);
      }
    });
  }, [setVisualStates, setCode]);

  // Sync text changes to visual (when in visual mode)
  useEffect(() => {
    if (editMode === 'visual' && code) {
      const diagramType = currentDiagramType();
      syncEngine.syncTextToVisual(code, diagramType).then(newState => {
        if (newState) {
          setVisualStates(prev => ({
            ...prev,
            [diagramType]: newState,
          }));
        }
      });
    }
  }, [code, editMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect current diagram type (simple heuristic)
  const currentDiagramType = useCallback((): DiagramType => {
    const codeStr = code || '';
    if (codeStr.includes('flowchart')) return 'flowchart';
    if (codeStr.includes('sequenceDiagram')) return 'sequence';
    if (codeStr.includes('classDiagram')) return 'class';
    if (codeStr.includes('stateDiagram')) return 'state';
    if (codeStr.includes('erDiagram')) return 'er';
    if (codeStr.includes('gantt')) return 'gantt';
    if (codeStr.includes('pie')) return 'pie';
    if (codeStr.includes('journey')) return 'journey';
    if (codeStr.includes('gitGraph')) return 'gitGraph';
    if (codeStr.includes('mindmap')) return 'mindmap';
    if (codeStr.includes('timeline')) return 'timeline';
    if (codeStr.includes('quadrantChart')) return 'quadrant';
    if (codeStr.includes('requirementDiagram')) return 'requirement';
    if (codeStr.includes('C4')) return 'c4';
    if (codeStr.includes('sankey-beta')) return 'sankey';
    if (codeStr.includes('xychart')) return 'xychart';
    if (codeStr.includes('block-beta')) return 'block';
    if (codeStr.includes('packet-beta')) return 'packet';
    if (codeStr.includes('kanban')) return 'kanban';
    if (codeStr.includes('architecture-beta')) return 'architecture';
    return 'flowchart'; // default
  }, [code]);

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
        onEditModeChange={handleEditModeChange}
        currentCode={code || ''}
        currentTheme={config?.theme || 'default'}
        currentLayout={layout || 'horizontal'}
        currentAppTheme={appTheme || 'light'}
        currentEditMode={editMode || 'text'}
        canUndo={historyState.canUndo}
        canRedo={historyState.canRedo}
        isVisualSupported={true}
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
      ) : isFullscreen ? (
        <div className="flex-1 relative">
          <div ref={previewRef} className="h-full w-full">
            <DiagramPreview 
              code={code || ''} 
              config={config || DEFAULT_MERMAID_CONFIG}
              onSvgRendered={handleSvgRendered}
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
          <ResizablePanel defaultSize={editMode === 'visual' ? 33 : 50} minSize={20}>
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

          <ResizablePanel defaultSize={editMode === 'visual' ? 33 : 50} minSize={20}>
            <div ref={previewRef} className="h-full">
              <DiagramPreview 
                code={code || ''} 
                config={config || DEFAULT_MERMAID_CONFIG}
                onSvgRendered={handleSvgRendered}
              />
            </div>
          </ResizablePanel>

          {editMode === 'visual' && (
            <>
              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={33} minSize={20} data-panel="visual">
                <div className="h-full flex flex-col">
                  <div className="border-b px-4 py-2 bg-muted/50">
                    <h2 className="text-sm font-semibold">Visual Editor</h2>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <VisualEditorRegistry
                      diagramType={currentDiagramType()}
                      visualState={visualStates[currentDiagramType()] || null}
                      onChange={(state) => handleVisualStateChange(currentDiagramType(), state)}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
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