import Link from 'next/link';
import { IconArrowRight, IconMessageCircle, IconSchool, IconSend2 } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';

const threads = [
  {
    name: 'Lisa Wong',
    role: 'Senior Instructor',
    status: 'Unread',
    preview: "Great job on your infection control assessment. I've left detailed feedback...",
    time: '10:45 AM',
  },
  {
    name: 'James Miller',
    role: 'Clinical Supervisor',
    status: 'New',
    preview: "Don't forget to bring your updated clinical manual for our session on Feb 6th...",
    time: 'Yesterday',
  },
  {
    name: 'Admissions Team',
    role: 'Program Operations',
    status: 'Read',
    preview: 'Your student records package has been verified and attached to your profile.',
    time: 'Mon',
  },
];

export default function StudentInboxPage() {
  return (
    <StudentShell
      title="Inbox"
      subtitle="Student-to-instructor communication, updates, and operational notices."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
          <div className="border-b border-border-subtle p-5">
            <div className="relative">
              <Input placeholder="Search messages..." className="h-11 rounded-[14px]" />
            </div>
          </div>
          <div className="divide-y divide-border-subtle">
            {threads.map((thread, index) => (
              <div
                key={thread.name}
                className={`cursor-pointer p-4 transition hover:bg-surface-muted ${
                  index === 0 ? 'bg-primary/5' : ''
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
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
          <div className="border-b border-border-subtle p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconSchool className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-[18px] font-semibold">Lisa Wong</h3>
                <p className="text-sm text-on-surface-variant">Senior Instructor / Module 4</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <div className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconMessageCircle className="size-4" />
              </div>
              <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tr-[18px] border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm text-on-surface">
                  Great job on your infection control assessment. I&apos;ve left some detailed
                  feedback and a few points to review before the next clinical lab.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <div className="max-w-[70%] rounded-bl-[18px] rounded-br-[18px] rounded-tl-[18px] bg-primary p-4 text-white">
                <p className="text-sm">
                  Thank you. I reviewed the notes and I&apos;m focusing on the documentation section
                  tonight.
                </p>
              </div>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="text-sm text-on-surface-variant">
                Thread history, unread state, and instructor response cadence can plug into this
                layout directly once the messaging API is ready.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Input placeholder="Write a reply..." className="h-12 rounded-[16px]" />
              <Button className="h-12 rounded-[16px] px-5">
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
