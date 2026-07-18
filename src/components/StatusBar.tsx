import { cn } from '@/lib/utils';

type StatusBarProps = {
  code: string;
};

export const StatusBar = ({ code }: StatusBarProps) => {
  const characterCount = code.length;
  const lineCount = code.length === 0 ? 0 : code.split('\n').length;

  return (
    <footer
      aria-label="Diagram source statistics"
      className={cn(
        'flex h-6 shrink-0 items-center justify-end gap-3 border-t bg-card px-3 text-xs text-muted-foreground'
      )}
    >
      <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
      <span aria-hidden="true">·</span>
      <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
    </footer>
  );
};
