import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-[14px] border border-border-subtle bg-white px-3.5 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-high',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
