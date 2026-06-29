import { IconCalendarMonth, IconLayoutList, IconMapPin } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const sessions = [
  { day: 'Mon 30', time: '08:00 - 11:00', title: 'Vitals Practicum', site: 'Simulation Lab B', status: 'Confirmed' },
  { day: 'Tue 01', time: '10:30 - 02:30', title: 'Clinical Rotation', site: 'Sunrise Care', status: 'Travel buffer added' },
  { day: 'Wed 02', time: '01:00 - 04:00', title: 'Competency Assessment', site: 'Faculty Skills Suite', status: 'Conflict flagged' },
  { day: 'Thu 03', time: '09:00 - 12:00', title: 'Medication Safety Review', site: 'Classroom 4A', status: 'Open seats: 3' },
] as const;

const week = [
  ['08:00', 'Vitals Lab', 'Notes Review', 'Assessment Prep', 'Rotation Check-in', ''],
  ['10:00', '', 'Sunrise Care', '', 'Site Visit', ''],
  ['01:00', 'Checklist Window', '', 'Competency Assessment', '', ''],
  ['03:00', '', '', 'Make-up Review', '', ''],
] as const;

export default function InstructorClinicalSchedulingPage() {
  return (
    <InstructorShell
      title="Clinical Scheduling"
      subtitle="Manage rotations, student placements, and assessment blocks."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-[16px] bg-surface-high p-1">
            <Button className="rounded-[12px] px-4">
              <IconCalendarMonth className="size-4" />
              Calendar View
            </Button>
            <Button variant="ghost" className="rounded-[12px] px-4 text-on-surface-variant">
              <IconLayoutList className="size-4" />
              List View
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="rounded-[20px] border border-error/20 bg-error/5 p-4 text-sm text-on-surface">
          <span className="font-semibold text-error">Schedule conflict detected.</span> Wednesday
          01:00 PM overlaps with Marcus Chen&apos;s required assessment window.
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Week Overview</h3>
              <Badge variant="primary">June 30 - July 4</Badge>
            </div>
            <div className="overflow-hidden rounded-[18px] border border-border-subtle">
              <div className="grid grid-cols-6 border-b border-border-subtle bg-surface-muted text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                {['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label) => (
                  <div key={label} className="px-3 py-3">
                    {label}
                  </div>
                ))}
              </div>
              {week.map((row) => (
                <div key={row[0]} className="grid grid-cols-6 border-b border-border-subtle last:border-b-0">
                  {row.map((cell, index) => (
                    <div key={`${row[0]}-${index}`} className="min-h-20 border-r border-border-subtle px-3 py-4 last:border-r-0">
                      {index === 0 ? (
                        <span className="font-mono text-[11px] font-semibold text-on-surface-variant">{cell}</span>
                      ) : cell ? (
                        <div className="rounded-[14px] bg-primary/8 px-3 py-2 text-sm font-medium text-primary">{cell}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Scheduled Sessions</h3>
              <Button className="rounded-[16px] px-5">Add session</Button>
            </div>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{session.day}</p>
                      <h4 className="mt-1 text-[16px] font-semibold text-on-surface">{session.title}</h4>
                      <div className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                        <IconMapPin className="size-4" />
                        <span>{session.site}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-on-surface">{session.time}</p>
                      <p className="mt-1 text-[12px] text-on-surface-variant">{session.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </InstructorShell>
  );
}
