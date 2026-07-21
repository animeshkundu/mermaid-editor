import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor/editor.main';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';

type MonacoWorkerScope = typeof globalThis & {
  monaco?: typeof monaco;
  MonacoEnvironment?: {
    getWorker: () => Worker;
    globalAPI: boolean;
  };
};

(self as MonacoWorkerScope).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
  globalAPI: true,
};
(self as MonacoWorkerScope).monaco = monaco;

loader.config({ monaco });

export { monaco };
