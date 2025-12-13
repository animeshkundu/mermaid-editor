/**
 * EmptyState Component
 * 
 * Displays a placeholder message when visual editing is not yet available
 * for a diagram type. Shows a friendly message with an info icon.
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from '@phosphor-icons/react';

export interface EmptyStateProps {
  /** The message to display */
  message: string;
  /** Optional title (defaults to "Coming Soon") */
  title?: string;
}

export const EmptyState = ({ message, title = 'Coming Soon' }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Alert className="max-w-md">
        <Info weight="duotone" className="h-5 w-5" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
};
