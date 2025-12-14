/**
 * FlowchartToolbar - Toolbar for adding/editing flowchart nodes and edges
 * 
 * Provides a constrained editing experience similar to MermaidChart:
 * - Add nodes with specific shapes
 * - Delete selected nodes/edges
 * - Auto-layout
 * - Undo/Redo
 */

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Trash,
  ArrowsClockwise,
  ArrowUUpLeft,
  ArrowUUpRight,
} from '@phosphor-icons/react';
import type { MermaidShape } from '@/types';

export interface FlowchartToolbarProps {
  onAddNode: (shape: MermaidShape) => void;
  onDeleteSelected: () => void;
  onAutoLayout: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection: boolean;
}

const SHAPE_OPTIONS: Array<{ shape: MermaidShape; label: string; icon: string }> = [
  { shape: 'rectangle', label: 'Process', icon: '▭' },
  { shape: 'rhombus', label: 'Decision', icon: '◆' },
  { shape: 'rounded', label: 'Rounded', icon: '▢' },
  { shape: 'stadium', label: 'Start/End', icon: '⬭' },
  { shape: 'circle', label: 'Circle', icon: '●' },
  { shape: 'hexagon', label: 'Preparation', icon: '⬡' },
  { shape: 'parallelogram', label: 'Input/Output', icon: '▱' },
  { shape: 'trapezoid', label: 'Manual', icon: '⏢' },
  { shape: 'subroutine', label: 'Subroutine', icon: '▭▭' },
  { shape: 'cylindrical', label: 'Database', icon: '⌭' },
];

export const FlowchartToolbar = ({
  onAddNode,
  onDeleteSelected,
  onAutoLayout,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  hasSelection,
}: FlowchartToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        {/* Add Node */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" weight="bold" />
                  Add Node
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Add a new node to the diagram</TooltipContent>
          </Tooltip>
          
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Basic Shapes</DropdownMenuLabel>
            {SHAPE_OPTIONS.slice(0, 5).map(({ shape, label, icon }) => (
              <DropdownMenuItem key={shape} onClick={() => onAddNode(shape)}>
                <span className="mr-2 text-lg">{icon}</span>
                {label}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Advanced Shapes</DropdownMenuLabel>
            {SHAPE_OPTIONS.slice(5).map(({ shape, label, icon }) => (
              <DropdownMenuItem key={shape} onClick={() => onAddNode(shape)}>
                <span className="mr-2 text-lg">{icon}</span>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteSelected}
              disabled={!hasSelection}
            >
              <Trash className="h-4 w-4" weight="bold" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete selected nodes/edges</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Auto Layout */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onAutoLayout}>
              <ArrowsClockwise className="h-4 w-4 mr-1" weight="bold" />
              Auto-Layout
            </Button>
          </TooltipTrigger>
          <TooltipContent>Automatically arrange nodes</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        {onUndo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <ArrowUUpLeft className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        )}

        {onRedo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <ArrowUUpRight className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
