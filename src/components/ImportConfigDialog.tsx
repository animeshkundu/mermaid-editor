import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MermaidConfig } from '@/types';
import { ShieldCheck } from '@phosphor-icons/react';

type ImportConfigDialogProps = {
  open: boolean;
  config: MermaidConfig | null;
  onApply: () => void;
  onDiscard: () => void;
};

export const ImportConfigDialog = ({
  open,
  config,
  onApply,
  onDiscard,
}: ImportConfigDialogProps) => (
  <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onDiscard()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck weight="duotone" />
          Apply shared configuration?
        </DialogTitle>
        <DialogDescription>
          The shared diagram is open, but its visual configuration has not been saved.
          Review and apply it only if you trust the link.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium">
          {Object.keys(config ?? {}).length.toLocaleString()} configuration settings
        </p>
        <p className="mt-1 text-muted-foreground">
          Network-capable settings were removed and security remains locked to strict mode.
        </p>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDiscard}>
          Keep my settings
        </Button>
        <Button type="button" onClick={onApply}>
          Apply shared settings
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
