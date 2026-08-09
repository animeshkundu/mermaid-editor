import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onCopyCode?: () => void;
  onShowHelp?: () => void;
  onOpenConfig?: () => void;
  onOpenExamples?: () => void;
  onToggleFullscreen?: () => void;
  onToggleLayout?: () => void;
  isFullscreen?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 * - Ctrl+S: Save (prevent default, trigger export)
 * - Ctrl+Shift+C: Copy code
 * - ?: Show keyboard shortcuts help
 * - Ctrl+,: Open config
 * - Ctrl+E: Open examples
 * - F11: Toggle fullscreen; Escape: Exit fullscreen
 * - Ctrl+\\: Toggle layout
 */
export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onCopyCode,
  onShowHelp,
  onOpenConfig,
  onOpenExamples,
  onToggleFullscreen,
  onToggleLayout,
  isFullscreen,
}: KeyboardShortcuts) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Ignore if in input or textarea (let Monaco handle it)
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // ? key to show help (Shift + / on US keyboard)
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        // Ctrl+Z: Undo
        event.preventDefault();
        onUndo?.();
      } else if (
        (isCtrlOrCmd && event.key === 'z' && event.shiftKey) ||
        (isCtrlOrCmd && event.key === 'y')
      ) {
        // Ctrl+Shift+Z or Ctrl+Y: Redo
        event.preventDefault();
        onRedo?.();
      } else if (isCtrlOrCmd && event.key === 's') {
        // Ctrl+S: Save/Export
        event.preventDefault();
        onSave?.();
        onExport?.();
      } else if (isCtrlOrCmd && event.shiftKey && event.key === 'c') {
        // Ctrl+Shift+C: Copy code
        event.preventDefault();
        onCopyCode?.();
      } else if (isCtrlOrCmd && event.key === ',') {
        // Ctrl+,: Open config
        event.preventDefault();
        onOpenConfig?.();
      } else if (isCtrlOrCmd && event.key === 'e') {
        // Ctrl+E: Open examples (prevent default browser behavior)
        event.preventDefault();
        onOpenExamples?.();
      } else if (event.key === 'F11') {
        // F11: Toggle fullscreen
        event.preventDefault();
        onToggleFullscreen?.();
      } else if (event.key === 'Escape') {
        // Escape: Exit fullscreen
        if (isFullscreen) {
          onToggleFullscreen?.();
        }
      } else if (isCtrlOrCmd && event.key === '\\') {
        // Ctrl+\: Toggle layout
        event.preventDefault();
        onToggleLayout?.();
      }
    },
    [onUndo, onRedo, onSave, onExport, onCopyCode, onShowHelp, onOpenConfig, onOpenExamples, onToggleFullscreen, onToggleLayout, isFullscreen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
