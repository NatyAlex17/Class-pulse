import Link from 'next/link';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconClockHour4,
  IconFileAnalytics,
  IconMail,
  IconUsers,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InstructorShell } from '@/components/instructor/instructor-shell';

const metrics = [
  { label: 'Critical Actions', value: '3', tone: 'text-error' },
  { label: 'Students Assigned', value: '42', tone: 'text-primary' },
  { label: 'Checklist Completion', value: '87%', tone: 'text-success' },
  { label: 'Clinical Hours Pending', value: '16', tone: 'text-warning' },
] as const;

const priorityActions = [
  {
    title: 'Review 3 urgent student messages',
    detail: 'Placement questions and one escalation require a response.',
    icon: IconMail,
    href: '/instructor/inbox',
  },
  {
    title: 'Approve 5 clinical log submissions',
    detail: 'Hours are waiting on your verification before audit closeout.',
    icon: IconCheck,
    href: '/instructor/clinical-logs',
  },
  {
    title: 'Resolve 1 scheduling conflict',
    detail: 'Wednesday rotation overlaps with a competency assessment block.',
    icon: IconAlertTriangle,
    href: '/instructor/availability',
  },
] as const;

const sessions = [
  { date: 'Jun 30', time: '08:00 AM', title: 'Skills Lab / Vitals Practicum', site: 'Simulation Lab B' },
  { date: 'Jul 01', time: '10:30 AM', title: 'Clinical Rotation / Sunrise Care', site: 'Sunrise Long-Term Care' },
  { date: 'Jul 02', time: '02:00 PM', title: 'Checklist Signoff Window', site: 'Faculty Review Room' },
] as const;

const studentsNeedingReview = [
  { name: 'Alice Smith', issue: 'Needs final wound care signoff', status: 'Ready now' },
  { name: 'Marcus Chen', issue: 'Missing 2 verified hours this week', status: 'At risk' },
  { name: 'Elena Ford', issue: 'Credential packet uploaded for review', status: 'Awaiting review' },
] as const;

export default function InstructorDashboardPage() {
  return (
    <InstructorShell
      title="Good Morning, Dr. Chen"
      subtitle="Golden State Nurse Assistant Training Program"
      patternedCanvas
      topActions={
        <Button className="hidden rounded-full px-6 sm:inline-flex">Check-in Session</Button>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 overflow-hidden rounded-[22px] border border-border-subtle bg-white p-8 shadow-soft lg:col-span-8">
          <Badge variant="primary" className="mb-4">
            Certified Lead Instructor
          </Badge>
          <h3 className="font-display text-[36px] font-bold leading-[1.02] tracking-[-0.03em] text-primary">
            Your instructor command center is clear, fast, and audit-ready.
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
            Today includes one scheduling conflict, three high-priority student conversations, and
            five clinical logs waiting for verification before end-of-day reconciliation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/instructor/students">
              <Button className="rounded-[16px] px-6">Open Student Workspace</Button>
            </Link>
            <Link href="/instructor/reports">
              <Button variant="secondary" className="rounded-[16px] px-6">
                Export Daily Snapshot
              </Button>
            </Link>
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {metric.label}
              </p>
              <p className={`mt-2 font-mono text-[28px] font-semibold ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="col-span-12 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-[22px] font-semibold">Priority Actions</h4>
            <Link href="/instructor/inbox" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-4">
            {priorityActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[17px] font-semibold text-on-surface">{action.title}</h5>
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant">{action.detail}</p>
                    </div>
                    <IconArrowRight className="mt-1 size-4 text-on-surface-variant transition group-hover:text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5">
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-display text-[22px] font-semibold">Today&apos;s Schedule</h4>
              <IconCalendarEvent className="size-5 text-primary" />
            </div>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                        {session.date}
                      </p>
                      <h5 className="mt-1 text-[15px] font-semibold text-on-surface">{session.title}</h5>
                      <p className="mt-1 text-sm text-on-surface-variant">{session.site}</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-2 font-mono text-[12px] font-semibold text-on-surface">
                      {session.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-display text-[22px] font-semibold">Students Requiring Review</h4>
              <Link href="/instructor/students" className="text-sm font-semibold text-primary hover:underline">
                Open roster
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {studentsNeedingReview.map((student) => (
                <div key={student.name} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconUsers className="size-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-on-surface">{student.name}</h5>
                      <p className="text-[12px] text-on-surface-variant">{student.status}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">{student.issue}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4">
          <div className="rounded-[20px] border border-border-subtle bg-primary p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[20px] font-semibold">Audit Snapshot</h4>
              <IconFileAnalytics className="size-5" />
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">Last export</p>
                <p className="mt-1 text-lg font-semibold">Today / 07:10 AM</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">Pending signoffs</p>
                <p className="mt-1 text-lg font-semibold">12 open verifications</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">Time to close</p>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <IconClockHour4 className="size-5" />
                  <span>4h 18m</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </InstructorShell>
  );
}
