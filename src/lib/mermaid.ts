import * as mermaidAPI from 'mermaid';
import { MermaidConfig } from '@/types';

const mermaid = mermaidAPI.default || mermaidAPI;

let isInitialized = false;

export const initializeMermaid = (config: MermaidConfig = {}) => {
  mermaid.initialize({
    startOnLoad: false,
    theme: config.theme || 'base',
    look: config.look || 'classic',
    fontFamily: config.fontFamily || '"Inter", "Segoe UI", sans-serif',
    themeVariables: config.themeVariables || {},
    ...config,
  } as any);
  isInitialized = true;
};

export const renderMermaid = async (
  code: string,
  elementId: string,
  config?: MermaidConfig
): Promise<{ svg: string }> => {
  if (!isInitialized || config) {
    initializeMermaid(config);
  }

  try {
    const { svg } = await mermaid.render(elementId, code);
    return { svg };
  } catch (error) {
    throw error;
  }
};

export const validateMermaidSyntax = async (code: string): Promise<boolean> => {
  try {
    await mermaid.parse(code);
    return true;
  } catch (error) {
    return false;
  }
};

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};
