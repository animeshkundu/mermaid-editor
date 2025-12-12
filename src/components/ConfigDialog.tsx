import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MermaidConfig } from '@/types';
import { toast } from 'sonner';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: MermaidConfig;
  onSave: (config: MermaidConfig) => void;
}

export const ConfigDialog = ({
  open,
  onOpenChange,
  config,
  onSave,
}: ConfigDialogProps) => {
  const [configText, setConfigText] = useState(
    JSON.stringify(config, null, 2)
  );
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      const parsed = JSON.parse(configText);
      onSave(parsed);
      setError('');
      toast.success('Configuration saved');
      onOpenChange(false);
    } catch (err) {
      setError('Invalid JSON format');
      toast.error('Invalid JSON format');
    }
  };

  const handleReset = () => {
    const defaultConfig = {
      theme: 'default',
      themeVariables: {},
      flowchart: {
        curve: 'basis',
      },
    };
    setConfigText(JSON.stringify(defaultConfig, null, 2));
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Mermaid Configuration</DialogTitle>
          <DialogDescription>
            Edit the Mermaid configuration in JSON format. Changes will be applied to the diagram immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-editor">Configuration JSON</Label>
            <Textarea
              id="config-editor"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder="Enter Mermaid configuration..."
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
