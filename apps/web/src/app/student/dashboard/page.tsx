'use client';

import Link from 'next/link';
import * as React from 'react';
import {
  IconArrowRight,
  IconBook2,
  IconCalendarEvent,
  IconCheck,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLocation,
  IconMail,
  IconMessageCircle,
  IconNotebook,
  IconPlayerPlayFilled,
  IconQuestionMark,
  IconShieldCheck,
  IconStethoscope,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function StudentDashboardPage() {
  const {
    tasks,
    modules,
    threads,
    upcomingSessions,
    assignments,
    currentModule,
    onboardingSteps,
    onboardingProgressPercent,
    overallProgressPercent,
    theoryHoursCompleted,
    theoryHoursRequired,
    clinicalHoursCompleted,
    clinicalHoursRequired,
    learningMinutes,
    reflectionResponse,
    questionOfDayAnswer,
    unreadCount,
    urgentTaskCount,
    todayTheoryCheckedIn,
    todayClinicalCheckedIn,
    portalUnlocked,
    workflowStage,
    lastAction,
    toggleTask,
    completeOnboardingStep,
    advanceLearning,
    checkIn,
    reportAbsence,
    submitReflection,
    submitQuestionAnswer,
    submitAssignment,
  } = useStudentDemo();

  const [reflectionDraft, setReflectionDraft] = React.useState('');
  const [questionDraft, setQuestionDraft] = React.useState('');

  const metrics = [
    {
      label: 'OVERALL PROGRESS',
      value: `${overallProgressPercent}%`,
      width: `${overallProgressPercent}%`,
      tone: 'bg-primary',
    },
    {
      label: 'THEORY HOURS',
      value: `${theoryHoursCompleted}/${theoryHoursRequired}`,
      width: `${Math.round((theoryHoursCompleted / theoryHoursRequired) * 100)}%`,
      tone: 'bg-success',
    },
    {
      label: 'CLINICAL HOURS',
      value: `${clinicalHoursCompleted}/${clinicalHoursRequired}`,
      width: `${Math.round((clinicalHoursCompleted / clinicalHoursRequired) * 100)}%`,
      tone: 'bg-warning',
    },
    {
      label: 'ENGAGEMENT',
      value: `${(learningMinutes / 60).toFixed(1)} hrs`,
      width: `${Math.round((learningMinutes / 480) * 100)}%`,
      tone: 'bg-info',
    },
  ] as const;

  return (
    <StudentShell
      title="Welcome Back, Amara"
      subtitle="Student operations hub for onboarding, learning, compliance, documents, and support."
      topActions={
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/student/onboarding">
            <Button variant="secondary" className="rounded-full">
              Review Onboarding
            </Button>
          </Link>
          <Link href="/student/forms">
            <Button className="rounded-full">Open Forms</Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <div className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <Badge variant="primary" className="mb-4">
                  Active Learning Flow
                </Badge>
                <h3 className="font-display text-[28px] font-bold tracking-[-0.02em] text-primary sm:text-[32px]">
                  {portalUnlocked
                    ? `Resume ${currentModule.title}`
                    : 'Finish the student intake flow'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant sm:text-base">
                  {portalUnlocked
                    ? 'Attendance check-ins, onboarding progress, assignments, reflections, inbox state, and module activity now stay in sync through the backend student portal.'
                    : `The portal is still staged at ${workflowStage.replaceAll('_', ' ')}. Open the shared walkthrough to finish the real student journey before continuing deeper into the portal.`}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/student/learning">
                    <Button className="h-12 rounded-[16px] px-6" disabled={!portalUnlocked}>
                      <IconPlayerPlayFilled className="size-4" />
                      {portalUnlocked ? 'Continue Learning' : 'Learning Locked'}
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="h-12 rounded-[16px] px-6"
                    onClick={() => advanceLearning(30)}
                    disabled={!portalUnlocked}
                  >
                    Simulate 30 Minutes
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-[18px] border border-primary/10 bg-surface-low p-4 sm:min-w-[280px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Next actions
                  </span>
                  <Badge variant="info">{unreadCount} unread</Badge>
                </div>
                <button
                  onClick={() => checkIn('Theory')}
                  disabled={!portalUnlocked}
                  className={cn(
                    'flex items-center justify-between rounded-[14px] border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                    todayTheoryCheckedIn
                      ? 'border-success/20 bg-success/10 text-success'
                      : 'border-border-subtle bg-surface hover:border-primary/30',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <IconBook2 className="size-4" />
                    Theory check-in
                  </span>
                  <span>{todayTheoryCheckedIn ? 'Done' : 'Check in'}</span>
                </button>
                <button
                  onClick={() => checkIn('Clinical')}
                  disabled={!portalUnlocked}
                  className={cn(
                    'flex items-center justify-between rounded-[14px] border px-4 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                    todayClinicalCheckedIn
                      ? 'border-success/20 bg-success/10 text-success'
                      : 'border-border-subtle bg-surface hover:border-primary/30',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <IconStethoscope className="size-4" />
                    Clinical check-in
                  </span>
                  <span>{todayClinicalCheckedIn ? 'Done' : 'Check in'}</span>
                </button>
                <button
                  onClick={() => reportAbsence('future')}
                  disabled={!portalUnlocked}
                  className="rounded-[14px] border border-border-subtle bg-surface px-4 py-3 text-left text-sm font-semibold text-on-surface transition hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit planned absence for next session
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[18px] border border-border-subtle bg-surface p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
                {metric.label}
              </p>
              <p className="mt-2 font-mono text-[22px] font-semibold text-on-surface sm:text-[26px]">
                {metric.value}
              </p>
              <div className="mt-4 h-1.5 rounded-full bg-surface-container">
                <div className={cn('h-full rounded-full', metric.tone)} style={{ width: metric.width }} />
              </div>
            </div>
          ))}
        </section>

        <section className="col-span-12 space-y-6 lg:col-span-8">
          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-display text-[22px] font-semibold text-on-surface">
                  Onboarding Snapshot
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Static onboarding behaves like a live intake workflow across dashboard, forms, and documents.
                </p>
              </div>
              <Badge variant="info">{onboardingProgressPercent}% complete</Badge>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-primary" style={{ width: `${onboardingProgressPercent}%` }} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {onboardingSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => completeOnboardingStep(step.id)}
                  className={cn(
                    'rounded-[16px] border p-4 text-left transition',
                    step.complete
                      ? 'border-success/20 bg-success/5'
                      : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{step.title}</p>
                      <p className="mt-1 text-[12px] text-on-surface-variant">{step.description}</p>
                    </div>
                    {step.complete ? (
                      <IconCircleCheckFilled className="size-5 shrink-0 text-success" />
                    ) : (
                      <Badge variant="neutral">{step.actionLabel}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-display text-[22px] font-semibold text-on-surface">
                  Curriculum Progress
                </h4>
                <Link href="/student/progress" className="text-sm font-semibold text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{module.title}</p>
                        <p className="text-[12px] text-on-surface-variant">{module.summary}</p>
                      </div>
                      <Badge
                        variant={
                          module.status === 'Complete'
                            ? 'success'
                            : module.status === 'In Progress'
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {module.status}
                      </Badge>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${module.progressPercent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                      <span>{module.completedHours}/{module.requiredHours} hours</span>
                      <span>{module.examScore ?? 'Exam pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-display text-[22px] font-semibold text-on-surface">
                  Upcoming Sessions
                </h4>
                <IconCalendarEvent className="size-5 text-primary" />
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{session.title}</p>
                        <p className="mt-1 text-[12px] text-on-surface-variant">{session.date}</p>
                      </div>
                      <Badge variant={session.type === 'Clinical' ? 'primary' : 'info'}>
                        {session.type}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-[12px] text-on-surface-variant">
                      <p className="flex items-center gap-2">
                        <IconMessageCircle className="size-4" />
                        {session.instructor}
                      </p>
                      <p className="flex items-center gap-2">
                        <IconLocation className="size-4" />
                        {session.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <IconNotebook className="size-5 text-primary" />
                <h4 className="font-display text-[20px] font-semibold text-on-surface">
                  Daily Reflection
                </h4>
              </div>
              <p className="mb-4 text-sm text-on-surface-variant">
                What did you improve today that will matter most in clinical practice?
              </p>
              {reflectionResponse ? (
                <div className="rounded-[16px] border border-success/20 bg-success/5 p-4">
                  <p className="text-sm text-on-surface">{reflectionResponse}</p>
                </div>
              ) : (
                <>
                  <Textarea
                    value={reflectionDraft}
                    onChange={(event) => setReflectionDraft(event.target.value)}
                    placeholder="Write a short reflection..."
                  />
                  <Button
                    className="mt-4 rounded-[14px]"
                    onClick={() => {
                      submitReflection(reflectionDraft);
                      setReflectionDraft('');
                    }}
                  >
                    Submit Reflection
                  </Button>
                </>
              )}
            </div>

            <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <IconQuestionMark className="size-5 text-primary" />
                <h4 className="font-display text-[20px] font-semibold text-on-surface">
                  Question Of The Day
                </h4>
              </div>
              <p className="mb-4 text-sm text-on-surface-variant">
                Why should respiration be measured before telling the patient what you are counting?
              </p>
              {questionOfDayAnswer ? (
                <div className="rounded-[16px] border border-success/20 bg-success/5 p-4">
                  <p className="text-sm text-on-surface">{questionOfDayAnswer}</p>
                </div>
              ) : (
                <>
                  <Input
                    value={questionDraft}
                    onChange={(event) => setQuestionDraft(event.target.value)}
                    placeholder="Write your response..."
                    className="h-12 rounded-[14px]"
                  />
                  <Button
                    className="mt-4 rounded-[14px]"
                    onClick={() => {
                      submitQuestionAnswer(questionDraft);
                      setQuestionDraft('');
                    }}
                  >
                    Save Response
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="col-span-12 space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle p-5">
              <h4 className="font-display text-[18px] font-semibold">To-Do List</h4>
              <span className="rounded bg-error-container px-2 py-0.5 text-[11px] font-bold text-error">
                {urgentTaskCount} urgent
              </span>
            </div>
            <div className="p-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-[14px] p-3 transition hover:bg-surface-muted"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.complete ? (
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded bg-success text-white">
                      <IconCheck className="size-3.5" />
                    </div>
                  ) : (
                    <div className="mt-1 h-5 w-5 rounded border-2 border-outline-variant transition group-hover:border-primary" />
                  )}
                  <div>
                    <p className={cn('text-sm font-semibold text-on-surface', task.complete && 'line-through opacity-70')}>
                      {task.title}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">{task.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle p-5">
              <h4 className="font-display text-[18px] font-semibold">Assignments</h4>
              <Badge variant="warning">
                {assignments.filter((assignment) => assignment.status === 'Pending').length} pending
              </Badge>
            </div>
            <div className="divide-y divide-border-subtle">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4">
                  <p className="text-sm font-semibold text-on-surface">{assignment.title}</p>
                  <p className="mt-1 text-[12px] text-on-surface-variant">{assignment.detail}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-on-surface-variant">Due {assignment.due}</span>
                    {assignment.status === 'Submitted' ? (
                      <Badge variant="success">Submitted</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => submitAssignment(assignment.id)}>
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
            <div className="border-b border-border-subtle p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-display text-[18px] font-semibold">Instructor Messages</h4>
                <Badge variant="info">{unreadCount} unread</Badge>
              </div>
            </div>
            <div className="divide-y divide-border-subtle">
              {threads.slice(0, 2).map((message) => (
                <div key={message.id} className="p-4 transition hover:bg-surface-muted">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {message.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-on-surface">{message.name}</p>
                      <p className="text-[11px] text-primary">{message.role}</p>
                    </div>
                    {message.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="line-clamp-2 text-sm italic text-on-surface-variant">{message.preview}</p>
                </div>
              ))}
            </div>
            <Link
              href="/student/inbox"
              className="flex w-full items-center justify-center gap-2 border-t border-border-subtle p-4 text-sm font-bold text-primary transition hover:bg-surface-low"
            >
              Open Inbox
              <IconMail className="size-4" />
            </Link>
          </div>

          <div className="rounded-[18px] bg-primary-container p-6 text-on-primary">
            <div className="mb-4 flex items-center gap-2">
              <IconShieldCheck className="size-5" />
              <h5 className="text-[18px] font-bold">System Activity</h5>
            </div>
            <p className="text-sm text-white/80">{lastAction}</p>
            <Link href="/student/documents">
              <Button variant="secondary" className="mt-4 rounded-[12px] bg-surface text-primary hover:bg-primary-fixed">
                View Student Record
                <IconArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
