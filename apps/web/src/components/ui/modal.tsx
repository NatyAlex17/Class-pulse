'use client';

import * as React from 'react';
import { IconX } from '@tabler/icons-react';

type ModalSize = 'md' | 'lg' | 'xl';

const sizeClassName: Record<ModalSize, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, description, size = 'lg', children }: ModalProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full ${sizeClassName[size]} flex-col rounded-[20px] border border-border-subtle bg-surface shadow-2xl animate-in fade-in zoom-in duration-300`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-6 py-4">
          <div>
            <h2 className="font-display text-[20px] font-semibold text-on-surface">{title}</h2>
            {description ? <p className="mt-1 text-sm text-on-surface-variant">{description}</p> : null}
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="rounded-[8px] p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-on-surface"
          >
            <IconX className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
