import { Editor, OnMount } from '@monaco-editor/react';
import { EditorSettings } from '@/types';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
}

export const CodeEditor = ({ value, onChange, settings }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

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
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap },
      });
    }
  }, [settings]);

  return (
    <Editor
      height="100%"
      language="mermaid"
      theme={settings.theme}
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
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
  );
};
