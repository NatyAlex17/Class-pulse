import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-28 w-full rounded-[14px] border border-border-subtle bg-surface px-3.5 py-3 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-high',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
