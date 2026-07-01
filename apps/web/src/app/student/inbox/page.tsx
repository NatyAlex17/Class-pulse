'use client';

import Link from 'next/link';
import * as React from 'react';
import { IconArrowRight, IconMessageCircle, IconSchool, IconSend2 } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';
import { studentDemoThreads, studentDemoUser } from '@/lib/chat/mock-data';
import { useRealtimeInbox } from '@/lib/chat/use-realtime-inbox';

function formatThreadTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function StudentInboxPage() {
  const inbox = useRealtimeInbox({
    fallbackCurrentUser: studentDemoUser,
    fallbackThreads: studentDemoThreads,
  });
  const unreadCount = inbox.threads.reduce((total, thread) => total + thread.unreadCount, 0);

  return (
    <StudentShell
      title="Inbox"
      subtitle="Student-to-instructor communication, updates, and operational notices."
      topActions={
        <Badge variant={inbox.setupState.mode === 'supabase' ? 'success' : 'warning'}>
          {inbox.setupState.mode === 'supabase' ? 'Live chat connected' : `${unreadCount} demo unread`}
        </Badge>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-5">
            <div className="relative">
              <Input placeholder="Search messages..." className="h-11 rounded-[14px]" />
            </div>
            <div className="mt-4 rounded-[14px] border border-border-subtle bg-surface-muted p-4">
              <p className="text-sm font-semibold text-on-surface">Chat status</p>
              <p className="mt-1 text-sm text-on-surface-variant">{inbox.setupState.statusMessage}</p>
              {inbox.setupState.errorMessage ? (
                <p className="mt-2 text-xs text-error">{inbox.setupState.errorMessage}</p>
              ) : null}
            </div>
          </div>
          <div className="divide-y divide-border-subtle">
            {inbox.threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => inbox.selectThread(thread.id)}
                className={`w-full cursor-pointer p-4 text-left transition hover:bg-surface-muted ${
                  inbox.activeThread?.id === thread.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{thread.title}</p>
                    <p className="text-[11px] text-on-surface-variant">{thread.subtitle}</p>
                  </div>
                  <Badge variant={thread.unreadCount > 0 ? 'info' : 'neutral'}>
                    {thread.unreadCount > 0 ? `${thread.unreadCount} new` : 'Read'}
                  </Badge>
                </div>
                <p className="text-sm text-on-surface-variant">{thread.preview}</p>
                <p className="mt-2 text-right font-mono text-[10px] text-outline">
                  {formatThreadTime(thread.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
          {inbox.activeThread ? (
            <>
              <div className="border-b border-border-subtle p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconSchool className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-[18px] font-semibold">{inbox.activeThread.title}</h3>
                    <p className="text-sm text-on-surface-variant">{inbox.activeThread.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-6">
                {inbox.activeThread.messages.map((message) =>
                  message.isCurrentUser ? (
                    <div key={message.id} className="flex justify-end gap-3">
                      <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tl-[18px] bg-primary p-4 text-white">
                        <p className="text-sm">{message.body}</p>
                        <p className="mt-2 text-right text-[10px] text-white/70">
                          {formatThreadTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconMessageCircle className="size-4" />
                      </div>
                      <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[18px] border border-border-subtle bg-surface-muted p-4">
                        <p className="text-sm text-on-surface">{message.body}</p>
                        <p className="mt-2 text-right text-[10px] text-outline">
                          {formatThreadTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ),
                )}
                <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <p className="text-sm text-on-surface-variant">
                    Run the SQL in `docs/database/supabase-chat-schema.sql`, then sign in with Supabase
                    Auth to move this inbox from demo mode to realtime mode.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Input
                    value={inbox.composerValue}
                    onChange={(event) => inbox.setComposerValue(event.target.value)}
                    placeholder="Write a reply..."
                    className="h-12 rounded-[16px]"
                  />
                  <Button
                    className="h-12 rounded-[16px] px-5"
                    disabled={inbox.setupState.sendPending}
                    onClick={() => void inbox.sendMessage()}
                  >
                    <IconSend2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="border-t border-border-subtle p-4">
                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Return to dashboard
                  <IconArrowRight className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-6 text-sm text-on-surface-variant">
              No inbox threads are available yet.
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
