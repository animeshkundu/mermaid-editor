import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DownloadSimple,
  Lightning,
  Gear,
  Copy,
  Code,
  Image as ImageIcon,
  List,
} from '@phosphor-icons/react';
import { ExportFormat, DiagramExample } from '@/types';
import { DIAGRAM_EXAMPLES } from '@/lib/constants';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ToolbarProps {
  onExport: (format: ExportFormat) => void;
  onLoadExample: (example: DiagramExample) => void;
  onOpenConfig: () => void;
  onCopyCode: () => void;
  onCopyImage: () => void;
  currentCode: string;
}

export const Toolbar = ({
  onExport,
  onLoadExample,
  onOpenConfig,
  onCopyCode,
  onCopyImage,
}: ToolbarProps) => {
  const isMobile = useIsMobile();

  const handleCopy = () => {
    onCopyCode();
    toast.success('Code copied to clipboard');
  };

  const handleCopyImage = () => {
    onCopyImage();
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-2 p-3 border-b bg-card">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-base font-bold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" weight="duotone" />
            Mermaid
          </h1>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <List className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyImage} className="w-full justify-start">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Copy Image
                  </Button>
                  <Button variant="outline" size="sm" onClick={onOpenConfig} className="w-full justify-start">
                    <Gear className="h-4 w-4 mr-2" />
                    Configuration
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Export</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" onClick={() => onExport('svg')} className="w-full justify-start">
                    <DownloadSimple className="h-4 w-4 mr-2" />
                    Export as SVG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport('png')} className="w-full justify-start">
                    <DownloadSimple className="h-4 w-4 mr-2" />
                    Export as PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onExport('markdown')} className="w-full justify-start">
                    <DownloadSimple className="h-4 w-4 mr-2" />
                    Export as Markdown
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Examples</h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {DIAGRAM_EXAMPLES.map((example) => (
                    <Button
                      key={example.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onLoadExample(example);
                      }}
                      className="w-full justify-start text-left h-auto py-2"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-card">
      <div className="flex items-center gap-2 flex-1">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" weight="duotone" />
          Mermaid Live Editor
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Lightning className="h-4 w-4" />
              Examples
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-auto">
            <DropdownMenuLabel>Diagram Examples</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DIAGRAM_EXAMPLES.map((example) => (
              <DropdownMenuItem
                key={example.id}
                onClick={() => onLoadExample(example)}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{example.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {example.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          Copy Code
        </Button>

        <Button variant="outline" size="sm" onClick={handleCopyImage}>
          <ImageIcon className="h-4 w-4" />
          Copy Image
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm">
              <DownloadSimple className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('svg')}>
              Export as SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('png')}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('markdown')}>
              Export as Markdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onOpenConfig}>
          <Gear className="h-4 w-4" />
          Config
        </Button>
      </div>
    </div>
  );
};
