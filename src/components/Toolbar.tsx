import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DownloadSimple,
  Lightning,
  Gear,
  Copy,
  Code,
  Image as ImageIcon,
  List,
  ArrowUUpLeft,
  ArrowUUpRight,
  Palette,
  Link as LinkIcon,
  Keyboard,
  SplitHorizontal,
  SplitVertical,
  CornersOut,
  Sun,
  Moon,
  Cursor,
} from '@phosphor-icons/react';
import { ExportFormat, DiagramExample, MermaidTheme, MERMAID_THEMES, PNGScale, PNG_SCALE_OPTIONS, EditMode } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DIAGRAM_EXAMPLES } from '@/lib/constants';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export type LayoutDirection = 'horizontal' | 'vertical';
export type AppTheme = 'light' | 'dark';

interface ToolbarProps {
  onExport: (format: ExportFormat, scale?: PNGScale) => void;
  onLoadExample: (example: DiagramExample) => void;
  onOpenConfig: () => void;
  onCopyCode: () => void;
  onCopyImage: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onShare?: () => void;
  onThemeChange?: (theme: MermaidTheme) => void;
  onShowShortcuts?: () => void;
  onLayoutChange?: (direction: LayoutDirection) => void;
  onFullscreen?: () => void;
  onAppThemeChange?: (theme: AppTheme) => void;
  onEditModeChange?: (mode: EditMode) => void;
  currentCode: string;
  currentTheme?: MermaidTheme;
  currentLayout?: LayoutDirection;
  currentAppTheme?: AppTheme;
  currentEditMode?: EditMode;
  canUndo?: boolean;
  canRedo?: boolean;
  isVisualSupported?: boolean;
}

export const Toolbar = ({
  onExport,
  onLoadExample,
  onOpenConfig,
  onCopyCode,
  onCopyImage,
  onUndo,
  onRedo,
  onShare,
  onThemeChange,
  onShowShortcuts,
  onLayoutChange,
  onFullscreen,
  onAppThemeChange,
  onEditModeChange,
  currentTheme = 'default',
  currentLayout = 'horizontal',
  currentAppTheme = 'light',
  currentEditMode = 'text',
  canUndo = false,
  canRedo = false,
  isVisualSupported = true,
}: ToolbarProps) => {
  const isMobile = useIsMobile();

  const handleCopy = () => {
    onCopyCode();
    toast.success('Code copied to clipboard');
  };

  const handleCopyImage = () => {
    onCopyImage();
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      toast.success('Share link copied to clipboard');
    }
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
                <h3 className="font-semibold text-sm">Theme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MERMAID_THEMES.map((theme) => (
                    <Button
                      key={theme.value}
                      variant={currentTheme === theme.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onThemeChange?.(theme.value)}
                      className="w-full"
                    >
                      {theme.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Actions</h3>
                <div className="space-y-2">
                   <Button variant="outline" size="sm" onClick={handleCopy} className="w-full justify-start" data-testid="toolbar-copy-code">
                     <Copy className="h-4 w-4 mr-2" />
                     Copy Code
                   </Button>
                   <Button variant="outline" size="sm" onClick={handleCopyImage} className="w-full justify-start" data-testid="toolbar-copy-image">
                     <ImageIcon className="h-4 w-4 mr-2" />
                     Copy Image
                   </Button>
                   <Button variant="outline" size="sm" onClick={handleShare} className="w-full justify-start" data-testid="toolbar-share">
                     <LinkIcon className="h-4 w-4 mr-2" />
                     Share Link
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
    <TooltipProvider>
      <div className="flex items-center gap-2 p-3 border-b bg-card">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" weight="duotone" />
            Mermaid Live Editor
          </h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="px-2"
              >
                <ArrowUUpLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="px-2"
              >
                <ArrowUUpRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Theme selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4" />
                Theme
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Diagram Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={currentTheme}
                onValueChange={(value) => onThemeChange?.(value as MermaidTheme)}
              >
                {MERMAID_THEMES.map((theme) => (
                  <DropdownMenuRadioItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Examples */}
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

          <div className="w-px h-6 bg-border mx-1" />

          {/* Edit Mode Toggle */}
          {onEditModeChange && (
            <>
              <ToggleGroup
                type="single"
                value={currentEditMode}
                onValueChange={(value) => {
                  if (value && value !== currentEditMode) {
                    onEditModeChange(value as EditMode);
                  }
                }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="text" aria-label="Code mode" data-mode="text" data-testid="edit-mode-text">
                      <Code className="h-4 w-4" weight="duotone" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Code Mode</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="visual" 
                      aria-label="Visual mode"
                      disabled={!isVisualSupported}
                      data-mode="visual"
                      data-testid="edit-mode-visual"
                    >
                      <Cursor className="h-4 w-4" weight="duotone" />
                      <Badge variant="secondary" className="ml-1 px-1 text-[10px] h-4">
                        BETA
                      </Badge>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Visual Mode (Beta)</TooltipContent>
                </Tooltip>
              </ToggleGroup>

              <div className="w-px h-6 bg-border mx-1" />
            </>
          )}

          {/* Copy buttons */}
           <Tooltip>
             <TooltipTrigger asChild>
               <Button variant="outline" size="sm" onClick={handleCopy} data-testid="toolbar-copy-code">
                 <Copy className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent>Copy Code</TooltipContent>
           </Tooltip>

           <Tooltip>
             <TooltipTrigger asChild>
               <Button variant="outline" size="sm" onClick={handleCopyImage} data-testid="toolbar-copy-image">
                 <ImageIcon className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent>Copy Image</TooltipContent>
           </Tooltip>

          {/* Share button */}
           <Tooltip>
             <TooltipTrigger asChild>
               <Button variant="outline" size="sm" onClick={handleShare} data-testid="toolbar-share">
                 <LinkIcon className="h-4 w-4" />
               </Button>
             </TooltipTrigger>
             <TooltipContent>Copy Share Link</TooltipContent>
           </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Export */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="default" size="sm" data-testid="toolbar-export">
                 <DownloadSimple className="h-4 w-4" />
                 Export
               </Button>
             </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('svg')}>
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Export as PNG
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {PNG_SCALE_OPTIONS.map((option) => (
                    <DropdownMenuItem 
                      key={option.value} 
                      onClick={() => onExport('png', option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => onExport('markdown')}>
                Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Config */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onOpenConfig}>
                <Gear className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configuration (Ctrl+,)</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Layout toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLayoutChange?.(currentLayout === 'horizontal' ? 'vertical' : 'horizontal')}
                className="px-2"
              >
                {currentLayout === 'horizontal' ? (
                  <SplitVertical className="h-4 w-4" />
                ) : (
                  <SplitHorizontal className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentLayout === 'horizontal' ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
            </TooltipContent>
          </Tooltip>

          {/* Fullscreen preview */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onFullscreen} className="px-2">
                <CornersOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fullscreen Preview (F11)</TooltipContent>
          </Tooltip>

          {/* App theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onAppThemeChange?.(currentAppTheme === 'light' ? 'dark' : 'light')}
                className="px-2"
              >
                {currentAppTheme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {currentAppTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </TooltipContent>
          </Tooltip>

          {/* Keyboard shortcuts */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onShowShortcuts} className="px-2">
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
