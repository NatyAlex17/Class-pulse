'use client';

import * as React from 'react';
import {
  IconPaperclip,
  IconPhoneCall,
  IconSearch,
  IconSend2,
  IconVideo,
} from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { instructorDemoThreads, instructorDemoUser } from '@/lib/chat/mock-data';
import { useRealtimeInbox } from '@/lib/chat/use-realtime-inbox';

function formatThreadTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function InstructorInboxPage() {
  const inbox = useRealtimeInbox({
    fallbackCurrentUser: instructorDemoUser,
    fallbackThreads: instructorDemoThreads,
  });
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = inbox.threads.filter((thread) =>
    [thread.title, thread.subtitle, thread.preview]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <InstructorShell
      title="Instructor Inbox"
      subtitle="Messages, escalations, and student follow-up in one workspace."
      topActions={<Button className="hidden rounded-full px-5 md:inline-flex">Check-in Session</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_280px] h-[calc(100vh-200px)]">
        {/* Conversations List - Fixed */}
        <section className="rounded-[20px] border border-border-subtle bg-surface shadow-soft flex flex-col overflow-hidden">
          <div className="border-b border-border-subtle p-5 shrink-0">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Messages</h3>
              <Badge variant={inbox.setupState.mode === 'supabase' ? 'success' : 'warning'}>
                {inbox.setupState.mode === 'supabase'
                  ? `${inbox.threads.length} live`
                  : `${inbox.threads.length} demo`}
              </Badge>
            </div>
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                placeholder="Search conversations..."
                className="h-11 rounded-[16px] pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="mt-3 text-sm text-on-surface-variant">{inbox.setupState.statusMessage}</p>
            {inbox.setupState.errorMessage ? (
              <p className="mt-2 text-xs text-error">{inbox.setupState.errorMessage}</p>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => inbox.selectThread(conversation.id)}
                className={`w-full rounded-[18px] border p-4 text-left transition ${
                  inbox.activeThread?.id === conversation.id
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-transparent hover:border-border-subtle hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{conversation.title}</p>
                    <p className="mt-1 text-sm leading-5 text-on-surface-variant line-clamp-2">{conversation.preview}</p>
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant whitespace-nowrap">
                    {formatThreadTime(conversation.updatedAt)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
                  {conversation.subtitle}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Chat View */}
        <section className="flex min-h-[620px] flex-col rounded-[20px] border border-border-subtle bg-surface shadow-soft overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0">
            {inbox.activeThread ? (
              <>
                <div>
                  <h3 className="font-display text-[20px] font-semibold">{inbox.activeThread.title}</h3>
                  <p className="text-sm text-on-surface-variant">{inbox.activeThread.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                    <IconPhoneCall className="size-4" />
                  </button>
                  <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                    <IconVideo className="size-4" />
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Messages - Scrollable Container */}
          <div className="flex-1 overflow-y-auto bg-surface-muted p-5 space-y-4">
            {inbox.activeThread ? (
              inbox.activeThread.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.isCurrentUser
                      ? 'ml-auto rounded-br-md bg-primary text-white'
                      : 'rounded-bl-md bg-surface text-on-surface'
                  }`}
                >
                  <p>{message.body}</p>
                  <p
                    className={`mt-2 text-[11px] ${
                      message.isCurrentUser ? 'text-white/70' : 'text-on-surface-variant'
                    }`}
                  >
                    {formatThreadTime(message.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">No conversations are available yet.</p>
            )}
          </div>

          {/* Message Input - Sticky */}
          <div className="shrink-0 border-t border-border-subtle bg-surface p-4 sticky bottom-0">
            <div className="flex items-center gap-3 rounded-[18px] border border-border-subtle bg-surface-muted px-4 py-3">
              <button className="text-on-surface-variant transition hover:text-primary">
                <IconPaperclip className="size-4" />
              </button>
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-on-surface-variant"
                placeholder="Type a response..."
                value={inbox.composerValue}
                onChange={(e) => inbox.setComposerValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void inbox.sendMessage();
                  }
                }}
              />
              <button
                onClick={() => void inbox.sendMessage()}
                disabled={!inbox.composerValue.trim() || inbox.setupState.sendPending}
                className="rounded-full bg-primary p-2 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <IconSend2 className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Conversation Context - Fixed */}
        <aside className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft overflow-y-auto">
          <h3 className="font-display text-[20px] font-semibold">Details</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Messages</p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {inbox.activeThread?.messages.length ?? 0}
              </p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Last message</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">
                {inbox.activeThread
                  ? formatThreadTime(
                      inbox.activeThread.messages[inbox.activeThread.messages.length - 1]?.createdAt ??
                        inbox.activeThread.updatedAt,
                    )
                  : 'N/A'}
              </p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Status</p>
              <Badge
                variant={inbox.setupState.mode === 'supabase' ? 'success' : 'warning'}
                className="mt-3"
              >
                {inbox.setupState.mode === 'supabase' ? 'Realtime conversation' : 'Demo fallback'}
              </Badge>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Current user</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{inbox.currentUser.displayName}</p>
              <p className="text-xs text-on-surface-variant">{inbox.currentUser.role}</p>
            </div>
          </div>
        </aside>
      </div>
    </InstructorShell>
  );
}
