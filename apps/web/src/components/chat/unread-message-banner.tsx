'use client';

import * as React from 'react';
import Link from 'next/link';
import { IconMessageCircle, IconX } from '@tabler/icons-react';
import type { UnreadNotification } from '@/lib/chat/use-unread-count';

export interface UnreadMessageBannerProps {
  notification: UnreadNotification | null;
  inboxHref: string;
  onDismiss: () => void;
}

export function UnreadMessageBanner({ notification, inboxHref, onDismiss }: UnreadMessageBannerProps) {
  React.useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-[16px] border border-border-subtle bg-surface p-4 shadow-2xl animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconMessageCircle className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-on-surface">{notification.senderRole}</p>
          <p className="mt-0.5 truncate text-sm text-on-surface-variant">{notification.body}</p>
          <Link
            href={inboxHref}
            onClick={onDismiss}
            className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
          >
            View message
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-on-surface-variant transition hover:text-on-surface"
        >
          <IconX className="size-4" />
        </button>
      </div>
    </div>
  );
}
