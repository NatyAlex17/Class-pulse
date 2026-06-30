import * as React from 'react';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className={cn('inline-flex items-center gap-3 text-sm text-on-surface', className)}>
        <span className="relative inline-flex size-5 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="peer absolute inset-0 z-10 cursor-pointer appearance-none rounded-md border border-border-subtle bg-surface transition checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            {...props}
          />
          <IconCheck className="pointer-events-none size-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
        </span>
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
