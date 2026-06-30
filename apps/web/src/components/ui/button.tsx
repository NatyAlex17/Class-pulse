import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 focus-visible:ring-2 focus-visible:ring-primary/25',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary shadow-soft hover:-translate-y-0.5 hover:shadow-lg',
        secondary: 'bg-white text-on-surface border border-border-subtle hover:bg-surface-muted',
        ghost: 'text-on-surface-variant hover:bg-white/70 hover:text-primary',
        outline: 'border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10',
      },
      size: {
        sm: 'h-9 px-3.5',
        default: 'h-11 px-4',
        lg: 'h-12 px-5',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
