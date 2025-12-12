import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined values', () => {
      const result = cn('class1', undefined, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle null values', () => {
      const result = cn('class1', null, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base active');
    });

    it('should handle false conditional classes', () => {
      const isActive = false;
      const result = cn('base', isActive && 'active');
      expect(result).toBe('base');
    });

    it('should handle object syntax', () => {
      const result = cn({ 'class1': true, 'class2': false, 'class3': true });
      expect(result).toBe('class1 class3');
    });

    it('should handle array syntax', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toBe('class1 class2');
    });

    it('should merge tailwind classes correctly', () => {
      // twMerge should dedupe conflicting tailwind classes
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('should merge tailwind hover/focus states', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
      expect(result).toBe('hover:bg-red-500');
    });

    it('should keep non-conflicting tailwind classes', () => {
      const result = cn('p-4', 'm-2', 'text-red-500');
      expect(result).toBe('p-4 m-2 text-red-500');
    });

    it('should handle complex mixed inputs', () => {
      const variant = 'primary';
      const result = cn(
        'base-class',
        variant === 'primary' && 'bg-blue-500',
        { 'font-bold': true },
        ['rounded', 'shadow']
      );
      expect(result).toContain('base-class');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('font-bold');
      expect(result).toContain('rounded');
      expect(result).toContain('shadow');
    });
  });
});
