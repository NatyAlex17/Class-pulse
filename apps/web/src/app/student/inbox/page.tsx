 'use client';

import Link from 'next/link';
import * as React from 'react';
import { IconArrowRight, IconMessageCircle, IconSchool, IconSend2 } from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';

export default function StudentInboxPage() {
  const { threads, activeThread, selectThread, sendMessage, unreadCount } = useStudentDemo();
  const [draft, setDraft] = React.useState('');

  return (
    <StudentShell
      title="Inbox"
      subtitle="Student-to-instructor communication, updates, and operational notices."
      topActions={<Badge variant="info">{unreadCount} unread</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-5">
            <div className="relative">
              <Input placeholder="Search messages..." className="h-11 rounded-[14px]" />
            </div>
          </div>
          <div className="divide-y divide-border-subtle">
            {threads.map((thread, index) => (
              <button
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`w-full cursor-pointer p-4 text-left transition hover:bg-surface-muted ${
                  activeThread.id === thread.id || index === 0 && activeThread.id === thread.id
                    ? 'bg-primary/5'
                    : ''
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{thread.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{thread.role}</p>
                  </div>
                  <Badge variant={thread.status === 'Read' ? 'neutral' : 'info'}>{thread.status}</Badge>
                </div>
                <p className="text-sm text-on-surface-variant">{thread.preview}</p>
                <p className="mt-2 text-right font-mono text-[10px] text-outline">{thread.time}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
          <div className="border-b border-border-subtle p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconSchool className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-[18px] font-semibold">{activeThread.name}</h3>
                <p className="text-sm text-on-surface-variant">{activeThread.role} / Student Communications</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            {activeThread.messages.map((message) =>
              message.sender === 'student' ? (
                <div key={message.id} className="flex justify-end gap-3">
                  <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tl-[18px] bg-primary p-4 text-white">
                    <p className="text-sm">{message.text}</p>
                    <p className="mt-2 text-right text-[10px] text-white/70">{message.time}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconMessageCircle className="size-4" />
                  </div>
                  <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="text-sm text-on-surface">{message.text}</p>
                    <p className="mt-2 text-right text-[10px] text-outline">{message.time}</p>
                  </div>
                </div>
              ),
            )}
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="text-sm text-on-surface-variant">
                This demo keeps thread history, unread state, and replies in shared student state so
                reviewers can click around and still feel the system responding.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a reply..."
                className="h-12 rounded-[16px]"
              />
              <Button
                className="h-12 rounded-[16px] px-5"
                onClick={() => {
                  sendMessage(activeThread.id, draft);
                  setDraft('');
                }}
              >
                <IconSend2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="border-t border-border-subtle p-4">
            <Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Return to dashboard
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
