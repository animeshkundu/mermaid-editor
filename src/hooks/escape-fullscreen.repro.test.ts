import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

/**
 * Acceptance / regression reproduction for the "Escape enters fullscreen" bug.
 *
 * Documented contract (README.md, constants.ts KEYBOARD_SHORTCUTS,
 * KeyboardShortcutsDialog): "Escape = Exit fullscreen". Escape must only be
 * able to LEAVE fullscreen (true -> false); it must never ENTER fullscreen
 * (false -> true). F11 remains a full toggle and is covered separately.
 *
 * On the untouched base commit the window-level Escape handler calls
 * `onToggleFullscreen?.()` unconditionally, so pressing Escape while NOT in
 * fullscreen flips the app INTO fullscreen. The first assertion below
 * therefore FAILS on the base (expected 0 calls, received 1) and PASSES once
 * the handler is guarded with `if (isFullscreen) onToggleFullscreen?.()`.
 *
 * The props are passed via a variable (not a fresh object literal) so that the
 * optional `isFullscreen` field does not trip TypeScript excess-property
 * checks on the base tree where the interface field does not yet exist. At
 * runtime Vitest transpiles without type-checking, so the extra field is
 * simply ignored by the base hook.
 */
describe('useKeyboardShortcuts — Escape is exit-only for fullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dispatchEscape = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  it('does NOT invoke onToggleFullscreen when Escape is pressed while not in fullscreen', () => {
    const onToggleFullscreen = vi.fn();
    // Non-literal props object so `isFullscreen` is accepted structurally on
    // the pre-fix base (excess-property checks only apply to fresh literals).
    const props = { onToggleFullscreen, isFullscreen: false };

    renderHook(() => useKeyboardShortcuts(props));
    dispatchEscape();

    // Escape must never ENTER fullscreen. FAILS on the base (called once).
    expect(onToggleFullscreen).not.toHaveBeenCalled();
  });

  it('invokes onToggleFullscreen exactly once when Escape is pressed while in fullscreen', () => {
    const onToggleFullscreen = vi.fn();
    const props = { onToggleFullscreen, isFullscreen: true };

    renderHook(() => useKeyboardShortcuts(props));
    dispatchEscape();

    // Escape must still EXIT fullscreen (true -> false).
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('does nothing on Escape when fullscreen state is unknown (undefined treated as falsy)', () => {
    const onToggleFullscreen = vi.fn();
    const props = { onToggleFullscreen };

    renderHook(() => useKeyboardShortcuts(props));
    dispatchEscape();

    expect(onToggleFullscreen).not.toHaveBeenCalled();
  });

  it('keeps F11 a full toggle: F11 enters fullscreen even when not currently fullscreen', () => {
    const onToggleFullscreen = vi.fn();
    const props = { onToggleFullscreen, isFullscreen: false };

    renderHook(() => useKeyboardShortcuts(props));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F11' }));

    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });
});
