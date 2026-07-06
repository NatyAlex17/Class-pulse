'use client';

import * as React from 'react';
import { IconAlertCircle, IconCheck, IconRefresh } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

export type DeleteConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export function DeleteConfirmModal({
  state,
  onCancel,
}: {
  state: DeleteConfirmState | null;
  onCancel: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-error/10">
            <IconAlertCircle className="size-6 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-on-surface">{state.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">This action cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
          <p className="break-words text-sm font-medium text-on-surface">{state.description}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              state.onConfirm();
              onCancel();
            }}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RowIconButton({
  title,
  destructive,
  active,
  onClick,
  children,
}: {
  title: string;
  destructive?: boolean;
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-[8px] p-2 transition ${
        destructive
          ? 'text-on-surface-variant hover:bg-error/10 hover:text-error'
          : active
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface-variant hover:bg-surface hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

export function ConfigBanner({ error, success }: { error: string | null; success: string | null }) {
  return (
    <>
      {error ? (
        <div className="rounded-[14px] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-[14px] border border-success/20 bg-success/10 p-4 text-sm text-success">
          <IconCheck className="size-4" />
          {success}
        </div>
      ) : null}
    </>
  );
}

export function PageToolbar({
  onRefresh,
  onReset,
  onSave,
  resetting,
  saving,
}: {
  onRefresh: () => void;
  onReset: () => void;
  onSave: () => void;
  resetting: boolean;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <IconRefresh className="size-4" />
        Refresh
      </Button>
      <Button variant="secondary" size="sm" onClick={onReset} disabled={resetting}>
        {resetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
