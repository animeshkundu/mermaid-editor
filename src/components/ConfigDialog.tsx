import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MermaidConfig, MERMAID_THEMES, MermaidTheme } from '@/types';
import { toast } from 'sonner';
import { DEFAULT_MERMAID_CONFIG } from '@/lib/constants';

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
  const [visualConfig, setVisualConfig] = useState<MermaidConfig>(config);
  const [error, setError] = useState('');

  // Sync visual config when dialog opens
  useEffect(() => {
    if (open) {
      setConfigText(JSON.stringify(config, null, 2));
      setVisualConfig(config);
      setError('');
    }
  }, [open, config]);

  const handleVisualConfigChange = (updates: Partial<MermaidConfig>) => {
    const newConfig = { ...visualConfig, ...updates };
    setVisualConfig(newConfig);
    setConfigText(JSON.stringify(newConfig, null, 2));
  };

  const handleFlowchartChange = (updates: Partial<NonNullable<MermaidConfig['flowchart']>>) => {
    const newFlowchart = { ...visualConfig.flowchart, ...updates };
    handleVisualConfigChange({ flowchart: newFlowchart });
  };

  const handleSaveVisual = () => {
    onSave(visualConfig);
    toast.success('Configuration saved');
    onOpenChange(false);
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(configText);
      onSave(parsed);
      setError('');
      toast.success('Configuration saved');
      onOpenChange(false);
    } catch {
      setError('Invalid JSON format');
      toast.error('Invalid JSON format');
    }
  };

  const handleReset = () => {
    setVisualConfig(DEFAULT_MERMAID_CONFIG);
    setConfigText(JSON.stringify(DEFAULT_MERMAID_CONFIG, null, 2));
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Mermaid Configuration</DialogTitle>
          <DialogDescription>
            Customize how your diagrams look and behave.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="visual" className="flex-1">Visual Editor</TabsTrigger>
            <TabsTrigger value="json" className="flex-1">JSON Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="flex-1 overflow-auto space-y-6 py-4">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={visualConfig.theme || 'default'}
                onValueChange={(value) => handleVisualConfigChange({ theme: value as MermaidTheme })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {MERMAID_THEMES.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flowchart Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Flowchart Options</h3>
              
              <div className="space-y-2">
                <Label>Curve Style</Label>
                <Select
                  value={visualConfig.flowchart?.curve || 'basis'}
                  onValueChange={(value) => handleFlowchartChange({ curve: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select curve style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basis">Basis (Smooth)</SelectItem>
                    <SelectItem value="linear">Linear (Straight)</SelectItem>
                    <SelectItem value="cardinal">Cardinal</SelectItem>
                    <SelectItem value="monotoneX">Monotone X</SelectItem>
                    <SelectItem value="monotoneY">Monotone Y</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="step">Step</SelectItem>
                    <SelectItem value="stepAfter">Step After</SelectItem>
                    <SelectItem value="stepBefore">Step Before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Padding: {visualConfig.flowchart?.padding || 8}</Label>
                <Slider
                  value={[visualConfig.flowchart?.padding || 8]}
                  onValueChange={([value]) => handleFlowchartChange({ padding: value })}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              <Button onClick={handleSaveVisual}>
                Apply Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="json" className="flex-1 flex flex-col overflow-hidden space-y-4">
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label htmlFor="config-editor">Configuration JSON</Label>
              <Textarea
                id="config-editor"
                value={configText}
                onChange={(e) => {
                  setConfigText(e.target.value);
                  setError('');
                }}
                className="font-mono text-sm flex-1 min-h-[300px] resize-none"
                placeholder="Enter Mermaid configuration..."
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              <Button onClick={handleSaveJson}>
                Apply Changes
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
