'use client';

import * as React from 'react';
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
  IconChartBar,
  IconTable,
  IconX,
  IconTrendingUp,
  IconAward,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InstructorShell } from '@/components/instructor/instructor-shell';

type StudentStats = {
  name: string;
  cohort: string;
  hoursLogged: number;
  hoursRequired: number;
  checklistCompletion: number;
  status: 'On Track' | 'At Risk' | 'Watch';
  progress: number;
};

const studentsStats: StudentStats[] = [
  { name: 'Alice Smith', cohort: 'CNA 12', hoursLogged: 34, hoursRequired: 40, checklistCompletion: 90, status: 'On Track', progress: 85 },
  { name: 'Marcus Chen', cohort: 'CNA 12', hoursLogged: 28, hoursRequired: 40, checklistCompletion: 75, status: 'At Risk', progress: 70 },
  { name: 'Elena Ford', cohort: 'HHA', hoursLogged: 39, hoursRequired: 40, checklistCompletion: 95, status: 'On Track', progress: 95 },
  { name: 'Priya Patel', cohort: 'CNA 13', hoursLogged: 22, hoursRequired: 40, checklistCompletion: 80, status: 'Watch', progress: 72 },
  { name: 'James Rodriguez', cohort: 'CNA 12', hoursLogged: 35, hoursRequired: 40, checklistCompletion: 88, status: 'On Track', progress: 88 },
  { name: 'Lisa Wong', cohort: 'HHA', hoursLogged: 38, hoursRequired: 40, checklistCompletion: 92, status: 'On Track', progress: 90 },
];

const metrics = [
  { label: 'Critical Actions', value: '3', tone: 'text-error' },
  { label: 'Students Assigned', value: '42', tone: 'text-primary' },
  { label: 'Avg. Checklist', value: '87%', tone: 'text-success' },
  { label: 'Hours Pending', value: '16', tone: 'text-warning' },
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
  { date: 'Jun 30', time: '08:00 AM', title: 'Skills Lab / Vitals Practicum', site: 'Simulation Lab B', students: 12 },
  { date: 'Jul 01', time: '10:30 AM', title: 'Clinical Rotation / Sunrise Care', site: 'Sunrise Long-Term Care', students: 8 },
  { date: 'Jul 02', time: '02:00 PM', title: 'Checklist Signoff Window', site: 'Faculty Review Room', students: 15 },
] as const;

const studentsNeedingReview = [
  { name: 'Alice Smith', issue: 'Needs final wound care signoff', status: 'Ready now', priority: 'high' },
  { name: 'Marcus Chen', issue: 'Missing 2 verified hours this week', status: 'At risk', priority: 'critical' },
  { name: 'Elena Ford', issue: 'Credential packet uploaded for review', status: 'Awaiting review', priority: 'medium' },
] as const;

export default function InstructorDashboardPage() {
  const [viewMode, setViewMode] = React.useState<'table' | 'graph'>('table');
  const [selectedStudent, setSelectedStudent] = React.useState<StudentStats | null>(null);

  return (
    <>
      <InstructorShell
        title="Good Morning, Dr. Chen"
        subtitle="Golden State Nurse Assistant Training Program"
        patternedCanvas
        topActions={
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-[14px] border border-border-subtle p-1 flex items-center gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-[10px] px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <IconTable className="inline mr-1 h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`rounded-[10px] px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === 'graph'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <IconChartBar className="inline mr-1 h-4 w-4" />
                Graph
              </button>
            </div>
            <Button className="rounded-full px-6">Check-in Session</Button>
          </div>
        }
      >
      <div className="grid grid-cols-12 gap-6">
        {/* Header Section */}
        <section className="col-span-12 overflow-hidden rounded-[22px] border border-border-subtle bg-surface p-8 shadow-soft lg:col-span-8">
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

        {/* Metrics */}
        <section className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {metric.label}
              </p>
              <p className={`mt-2 font-mono text-[28px] font-semibold ${metric.tone}`}>{metric.value}</p>
            </div>
          ))}
        </section>

        {/* Students Overview */}
        <section className="col-span-12">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-[22px] font-semibold">Student Progress Overview</h4>
          </div>

          {viewMode === 'table' ? (
            // Table View
            <div className="rounded-[20px] border border-border-subtle bg-surface shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-muted">
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Hours</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Checklist</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Progress</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsStats.map((student) => (
                      <tr key={student.name} className="border-b border-border-subtle hover:bg-surface-muted transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-on-surface">{student.name}</p>
                            <p className="text-[12px] text-on-surface-variant">{student.cohort}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm">{student.hoursLogged}/{student.hoursRequired}h</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm">{student.checklistCompletion}%</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-32 h-2 rounded-full bg-surface-container overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              student.status === 'On Track'
                                ? 'success'
                                : student.status === 'At Risk'
                                  ? 'error'
                                  : 'warning'
                            }
                          >
                            {student.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Graph View
            <div className="rounded-[20px] border border-border-subtle bg-surface shadow-soft p-6">
              <div className="space-y-6">
                {studentsStats.map((student) => (
                  <div
                    key={student.name}
                    onClick={() => setSelectedStudent(student)}
                    className="cursor-pointer rounded-[14px] border border-border-subtle p-4 hover:border-primary/30 hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-on-surface">{student.name}</h5>
                        <p className="text-[12px] text-on-surface-variant">{student.cohort}</p>
                      </div>
                      <Badge
                        variant={
                          student.status === 'On Track'
                            ? 'success'
                            : student.status === 'At Risk'
                              ? 'error'
                              : 'warning'
                        }
                      >
                        {student.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">Hours</p>
                        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className="h-full bg-secondary transition-all"
                            style={{ width: `${(student.hoursLogged / student.hoursRequired) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{student.hoursLogged}/{student.hoursRequired}h</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">Checklist</p>
                        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className="h-full bg-success transition-all"
                            style={{ width: `${student.checklistCompletion}%` }}
                          />
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{student.checklistCompletion}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase mb-1">Overall Progress</p>
                      <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{student.progress}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  className="group rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
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
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
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
                    <div className="rounded-full bg-surface px-3 py-2 font-mono text-[12px] font-semibold text-on-surface">
                      {session.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[24px] bg-surface p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{selectedStudent.name}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{selectedStudent.cohort}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Overview */}
              <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Current Status</p>
                    <Badge
                      variant={
                        selectedStudent.status === 'On Track'
                          ? 'success'
                          : selectedStudent.status === 'At Risk'
                            ? 'error'
                            : 'warning'
                      }
                    >
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Overall Progress</p>
                    <p className="font-mono text-3xl font-bold text-primary">{selectedStudent.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Clinical Hours */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="font-semibold text-on-surface mb-4">Clinical Hours</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-on-surface-variant">Progress</span>
                      <span className="font-mono font-bold text-on-surface">{selectedStudent.hoursLogged}/{selectedStudent.hoursRequired}h</span>
                    </div>
                    <div className="h-3 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${(selectedStudent.hoursLogged / selectedStudent.hoursRequired) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-[12px] bg-surface-muted p-3">
                      <p className="text-[11px] text-on-surface-variant uppercase mb-1">Logged</p>
                      <p className="font-mono text-xl font-bold text-secondary">{selectedStudent.hoursLogged}h</p>
                    </div>
                    <div className="rounded-[12px] bg-surface-muted p-3">
                      <p className="text-[11px] text-on-surface-variant uppercase mb-1">Remaining</p>
                      <p className="font-mono text-xl font-bold text-warning">{selectedStudent.hoursRequired - selectedStudent.hoursLogged}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Completion */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="font-semibold text-on-surface mb-4">Skills Checklist</h3>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-on-surface-variant">Completion</span>
                    <span className="font-mono font-bold text-on-surface">{selectedStudent.checklistCompletion}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{ width: `${selectedStudent.checklistCompletion}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-[16px] border border-primary/20 bg-primary/5 p-4">
                <div className="flex gap-3">
                  {selectedStudent.status === 'On Track' ? (
                    <>
                      <IconAward className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface">On Track for Completion</p>
                        <p className="text-sm text-on-surface-variant mt-1">Student is maintaining good progress. Continue current support plan.</p>
                      </div>
                    </>
                  ) : selectedStudent.status === 'At Risk' ? (
                    <>
                      <IconAlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface">Intervention Required</p>
                        <p className="text-sm text-on-surface-variant mt-1">Student needs additional support. Schedule a check-in this week.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <IconClockHour4 className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface">Monitor Progress</p>
                        <p className="text-sm text-on-surface-variant mt-1">Keep close watch on clinical hours. Student needs to increase pace.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setSelectedStudent(null)} className="flex-1 rounded-[12px]">
                  Close
                </Button>
                <Link href="/instructor/students" className="flex-1">
                  <Button className="w-full rounded-[12px]">View Full Profile</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      </InstructorShell>
    </>
  );
}
