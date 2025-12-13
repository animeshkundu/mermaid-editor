/**
 * FlowchartNode - Custom React Flow node component for flowchart shapes
 * 
 * Renders different shapes based on MermaidShape type:
 * - Rectangle, Rounded, Stadium
 * - Rhombus (Decision diamond)
 * - Circle, Hexagon
 * - Parallelogram, Trapezoid
 * - And more specialized shapes
 */

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { MermaidShape } from '@/types';
import { cn } from '@/lib/utils';

export interface FlowchartNodeData {
  label: string;
  shape: MermaidShape;
}

/**
 * Base node component with shape-specific rendering
 */
export const FlowchartNode = memo(({ data, selected }: NodeProps<FlowchartNodeData>) => {
  const { label, shape } = data;

  const baseClasses = cn(
    'flex items-center justify-center text-sm font-medium transition-all',
    'border-2 bg-white dark:bg-gray-800',
    selected 
      ? 'border-blue-500 shadow-lg shadow-blue-500/50' 
      : 'border-gray-700 dark:border-gray-400 shadow-md'
  );

  // Render different shapes
  switch (shape) {
    case 'rhombus':
      return (
        <div className="relative" style={{ width: 100, height: 100 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses, 'absolute inset-0')}
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-2">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'circle':
    case 'double-circle':
      return (
        <div className="relative" style={{ width: 90, height: 90 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(
              baseClasses, 
              'rounded-full w-full h-full',
              shape === 'double-circle' && 'border-4'
            )}
          >
            <span className="text-center text-xs px-2">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'hexagon':
      return (
        <div className="relative" style={{ width: 120, height: 80 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-3">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'parallelogram':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'parallelogram-alt':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 15% 100%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'trapezoid':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'trapezoid-alt':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'stadium':
      return (
        <div className="relative" style={{ width: 140, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div className={cn(baseClasses, 'w-full h-full')} style={{ borderRadius: '30px' }}>
            <span className="text-center px-6">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'rounded':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div className={cn(baseClasses, 'w-full h-full rounded-lg')}>
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'subroutine':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div className={cn(baseClasses, 'w-full h-full border-4')}>
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'cylindrical':
      return (
        <div className="relative" style={{ width: 100, height: 80 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div className="relative w-full h-full">
            {/* Top ellipse */}
            <div 
              className={cn(baseClasses, 'absolute top-0 left-0 right-0')}
              style={{ 
                height: '20px',
                borderRadius: '50% 50% 0 0',
                borderBottom: 'none'
              }}
            />
            {/* Body */}
            <div 
              className={cn(baseClasses, 'absolute left-0 right-0 flex items-center justify-center')}
              style={{ 
                top: '10px',
                bottom: '10px',
                borderTop: 'none',
                borderBottom: 'none'
              }}
            >
              <span className="text-center text-xs px-2">{label}</span>
            </div>
            {/* Bottom ellipse */}
            <div 
              className={cn(baseClasses, 'absolute bottom-0 left-0 right-0')}
              style={{ 
                height: '20px',
                borderRadius: '0 0 50% 50%',
                borderTop: 'none'
              }}
            />
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'asymmetric':
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div 
            className={cn(baseClasses)}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 85% 100%, 0% 100%)',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );

    case 'rectangle':
    default:
      return (
        <div className="relative" style={{ width: 130, height: 60 }}>
          <Handle type="target" position={Position.Top} className="!bg-gray-600" />
          <div className={cn(baseClasses, 'w-full h-full')}>
            <span className="text-center px-4">{label}</span>
          </div>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-600" />
        </div>
      );
  }
});

FlowchartNode.displayName = 'FlowchartNode';
