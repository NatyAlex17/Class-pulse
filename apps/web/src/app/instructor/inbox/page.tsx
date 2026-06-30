import { IconPaperclip, IconPhoneCall, IconSearch, IconSend2, IconVideo } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const conversations = [
  { name: 'Alice Smith', note: 'Updated wound care checklist and sent questions.', time: '10:45 AM', active: true },
  { name: 'Marcus Chen', note: 'Concerned about missing verified hours this week.', time: '09:18 AM', active: false },
  { name: 'Placement Office', note: 'Site swap request for Friday morning rotation.', time: 'Yesterday', active: false },
] as const;

const thread = [
  { from: 'student', body: 'Hi Dr. Chen, I uploaded the revised log and checklist. Can you confirm if I am cleared for Thursday?', stamp: '10:31 AM' },
  { from: 'instructor', body: 'I reviewed the upload. Your checklist is almost complete, but I still need one verified wound care observation.', stamp: '10:38 AM' },
  { from: 'student', body: 'Understood. I can complete that during tomorrow morning lab if there is an opening.', stamp: '10:42 AM' },
] as const;

export default function InstructorInboxPage() {
  return (
    <InstructorShell
      title="Instructor Inbox"
      subtitle="Messages, escalations, and student follow-up in one workspace."
      topActions={<Button className="hidden rounded-full px-5 md:inline-flex">Check-in Session</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
        <section className="rounded-[20px] border border-border-subtle bg-white shadow-soft">
          <div className="border-b border-border-subtle p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Messages</h3>
              <Badge variant="primary">3 unread</Badge>
            </div>
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input placeholder="Search conversations..." className="h-11 rounded-[16px] pl-10" />
            </div>
          </div>
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.name}
                className={`w-full rounded-[18px] border p-4 text-left transition ${
                  conversation.active
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-transparent hover:border-border-subtle hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{conversation.name}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{conversation.note}</p>
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant">{conversation.time}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex min-h-[620px] flex-col rounded-[20px] border border-border-subtle bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-border-subtle p-5">
            <div>
              <h3 className="font-display text-[20px] font-semibold">Alice Smith</h3>
              <p className="text-sm text-on-surface-variant">CNA Cohort 12 / Sunrise Care</p>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                <IconPhoneCall className="size-4" />
              </button>
              <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                <IconVideo className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-4 bg-surface-muted p-5">
            {thread.map((message, index) => (
              <div
                key={`${message.stamp}-${index}`}
                className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.from === 'instructor'
                    ? 'ml-auto rounded-br-md bg-primary text-white'
                    : 'rounded-bl-md bg-white text-on-surface'
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-2 text-[11px] ${message.from === 'instructor' ? 'text-white/70' : 'text-on-surface-variant'}`}>
                  {message.stamp}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border-subtle p-4">
            <div className="flex items-center gap-3 rounded-[18px] border border-border-subtle bg-white px-4 py-3">
              <button className="text-on-surface-variant transition hover:text-primary">
                <IconPaperclip className="size-4" />
              </button>
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-on-surface-variant"
                placeholder="Type a response..."
              />
              <button className="rounded-full bg-primary p-2 text-white transition hover:opacity-90">
                <IconSend2 className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
          <h3 className="font-display text-[20px] font-semibold">Conversation Context</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Current status</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">Needs one more observed competency</p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Last checklist update</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">Today / 10:14 AM</p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Escalation tag</p>
              <Badge variant="warning" className="mt-3">
                Placement readiness watch
              </Badge>
            </div>
          </div>
        </aside>
      </div>
    </InstructorShell>
  );
}
