import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

describe('useKeyboardShortcuts Hook', () => {
  const mockHandlers = {
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onSave: vi.fn(),
    onExport: vi.fn(),
    onCopyCode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onUndo on Ctrl+Z', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: false,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });

  it('should call onRedo on Ctrl+Shift+Z', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onRedo).toHaveBeenCalled();
  });

  it('should call onRedo on Ctrl+Y', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onRedo).toHaveBeenCalled();
  });

  it('should call onSave and onExport on Ctrl+S', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onSave).toHaveBeenCalled();
    expect(mockHandlers.onExport).toHaveBeenCalled();
  });

  it('should call onCopyCode on Ctrl+Shift+C', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onCopyCode).toHaveBeenCalled();
  });

  it('should not call handlers for regular key presses', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: false,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onUndo).not.toHaveBeenCalled();
  });

  it('should support metaKey (Cmd on Mac)', () => {
    renderHook(() => useKeyboardShortcuts(mockHandlers));

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      metaKey: true,
      shiftKey: false,
    });
    window.dispatchEvent(event);

    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardShortcuts(mockHandlers));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
