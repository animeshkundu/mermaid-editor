import { useState, useRef, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toolbar } from '@/components/Toolbar';
import { CodeEditor } from '@/components/CodeEditor';
import { DiagramPreview } from '@/components/DiagramPreview';
import { ConfigDialog } from '@/components/ConfigDialog';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
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

function App() {
  const [code, setCode] = useKV('mermaid-code', DEFAULT_DIAGRAM_CODE);
  const [config, setConfig] = useKV<MermaidConfig>('mermaid-config', DEFAULT_MERMAID_CONFIG);
  const [editorSettings] = useKV<EditorSettings>('editor-settings', DEFAULT_EDITOR_SETTINGS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
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
      const svgElement = previewRef.current?.querySelector('svg');
      const svgContent = svgElement?.outerHTML;

      await exportDiagram(format, code || '', svgContent);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  }, [code]);

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
      const svgElement = previewRef.current?.querySelector('svg');
      const svgContent = svgElement?.outerHTML;

      if (svgContent) {
        await copyImageToClipboard(svgContent);
        toast.success('Image copied to clipboard');
      } else {
        toast.error('No diagram to copy');
      }
    } catch (error) {
      toast.error('Failed to copy image');
      console.error(error);
    }
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
            <CodeEditor
              value={code || ''}
              onChange={handleCodeChange}
              settings={editorSettings || DEFAULT_EDITOR_SETTINGS}
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0" ref={previewRef}>
            <DiagramPreview code={code || ''} config={config || DEFAULT_MERMAID_CONFIG} />
          </TabsContent>
        </Tabs>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <CodeEditor
                value={code || ''}
                onChange={handleCodeChange}
                settings={editorSettings || DEFAULT_EDITOR_SETTINGS}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div ref={previewRef} className="h-full">
              <DiagramPreview code={code || ''} config={config || DEFAULT_MERMAID_CONFIG} />
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