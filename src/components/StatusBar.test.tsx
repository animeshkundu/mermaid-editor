import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBar } from '@/components/StatusBar';

describe('StatusBar Component', () => {
  it('should show source line and character counts', () => {
    const code = 'flowchart TD\n  A --> B';

    render(<StatusBar code={code} />);

    expect(screen.getByRole('contentinfo', { name: 'Diagram source statistics' })).toBeInTheDocument();
    expect(screen.getByText('2 lines')).toBeInTheDocument();
    expect(screen.getByText(`${code.length} characters`)).toBeInTheDocument();
  });

  it('should show zero counts for empty source', () => {
    render(<StatusBar code="" />);

    expect(screen.getByText('0 lines')).toBeInTheDocument();
    expect(screen.getByText('0 characters')).toBeInTheDocument();
  });

  it('should use singular labels and update when source changes', () => {
    const { rerender } = render(<StatusBar code="A" />);

    expect(screen.getByText('1 line')).toBeInTheDocument();
    expect(screen.getByText('1 character')).toBeInTheDocument();

    const updatedCode = 'A\nB';
    rerender(<StatusBar code={updatedCode} />);

    expect(screen.getByText('2 lines')).toBeInTheDocument();
    expect(screen.getByText(`${updatedCode.length} characters`)).toBeInTheDocument();
  });
});
