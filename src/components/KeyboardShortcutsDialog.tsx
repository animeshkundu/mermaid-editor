import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';
import { Keyboard } from '@phosphor-icons/react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsDialog = ({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to speed up your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid gap-3">
            {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.action}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Editor Shortcuts</h4>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Find</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                  Ctrl + F
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Replace</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                  Ctrl + H
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Select All</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                  Ctrl + A
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Duplicate Line</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">
                  Alt + Shift + ↓
                </kbd>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted border border-border rounded">?</kbd> to toggle this dialog
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
