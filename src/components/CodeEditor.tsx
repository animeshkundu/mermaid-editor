import { Editor, OnMount } from '@monaco-editor/react';
import { EditorSettings } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
}

export const CodeEditor = ({ value, onChange, settings }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    try {
      monaco.languages.register({ id: 'mermaid' });
      
      monaco.languages.setMonarchTokensProvider('mermaid', {
        tokenizer: {
          root: [
            [/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|C4Context)/, 'keyword'],
            [/\b(TD|TB|BT|RL|LR|subgraph|end|participant|activate|deactivate|loop|alt|else|opt|par|and|rect|Note)\b/, 'keyword'],
            [/-->|---|\-\.\-|===>|==>|\-\-\-\>|\-\-\>/, 'operator'],
            [/\|.*?\|/, 'string'],
            [/\[.*?\]/, 'type'],
            [/\{.*?\}/, 'type'],
            [/\(.*?\)/, 'type'],
            [/%%.*$/, 'comment'],
          ],
        },
      });
    } catch (error) {
      console.warn('Monaco language registration skipped:', error);
    }

    setIsEditorReady(true);
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap },
      });
    }
  }, [settings, isEditorReady]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language="mermaid"
        theme={settings.theme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="h-full w-full bg-[var(--editor-bg)] p-4">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        }
        options={{
          fontSize: settings.fontSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};
