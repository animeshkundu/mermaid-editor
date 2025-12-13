import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ListChecks, ArrowLeft } from '@phosphor-icons/react';

interface VisualBuilderPlaceholderProps {
  onBackToCode: () => void;
}

export function VisualBuilderPlaceholder({ onBackToCode }: VisualBuilderPlaceholderProps) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/40 px-6">
      <Card className="max-w-3xl w-full shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ListChecks className="h-6 w-6 text-primary" weight="duotone" />
            <div>
              <CardTitle>Visual Builder (Flowchart Slice)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Build flowcharts via UI while keeping Mermaid code in sync. This slice scaffolds the mode switch and staging area.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onBackToCode}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Code
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 py-4">
          <p className="text-sm text-muted-foreground">
            Next steps (per plan_flowchart.md):
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Render React Flow canvas bound to flowchart state derived from Mermaid.</li>
            <li>Add node palette action to insert nodes and serialize back to code.</li>
            <li>Enable label editing and connector creation with validation.</li>
            <li>Wire undo/redo and mirror changes into Monaco.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            This placeholder reserves the UI surface for the builder while we implement the flowchart slice incrementally.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
