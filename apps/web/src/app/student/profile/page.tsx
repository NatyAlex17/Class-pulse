'use client';

import * as React from 'react';
import {
  IconArrowRight,
  IconChartBar,
  IconCircleCheckFilled,
  IconClockHour4,
  IconHistory,
  IconLocation,
  IconMessageCircle,
  IconNotes,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';

const tabItems = ['Overview', 'Onboarding', 'Documents', 'Financials', 'Messages', 'Audit Trail'];

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = React.useState('Overview');
  const {
    onboardingSteps,
    uploads,
    threads,
    completedOnboardingCount,
    overallProgressPercent,
    clinicalHoursCompleted,
    clinicalHoursRequired,
    theoryHoursCompleted,
    theoryHoursRequired,
    lastAction,
    completeOnboardingStep,
  } = useStudentDemo();

  return (
    <StudentShell
      title="My Record Center"
      subtitle="Profile, onboarding readiness, and student record visibility in one place."
      patternedCanvas
    >
      <div className="rounded-[24px] border border-border-subtle bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                className="h-24 w-24 rounded-2xl border-2 border-white object-cover shadow-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz7JfU1KwFuLnEo8rQ_OlNzVaVcld2yA02c4Da13Ox4UAwu56s1osUgtjz1Y56-m11p1DznONZ1RAyfZJdh-C9f0lq4DOiyA5Qe4w5q91jFqfkZJuI0uitWYhT9eRfh3eeQTzq2Hy0WElbEZyqq81mC1fU0frtNVYrnM75KU5p1a06rF4MT3MyBm9SHcYkdS6VHHd1k1tx41rqfgubFYY9o28azQagLqDaNF8MmpG0gK31ArOddoB3NQamX3IwPsf6A-wc9eNK9IxO"
                alt="Amara Singh"
              />
              <span className="absolute -bottom-2 -right-2 rounded-lg border-2 border-white bg-success px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                ACTIVE
              </span>
            </div>
            <div>
              <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-on-surface">
                Amara Singh
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">Student ID: #9928-11</span>
                <span>|</span>
                <span>Bachelor of Science in Nursing (BSN)</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <IconLocation className="size-4" />
                  San Francisco Campus
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-xs">
                  Edit Profile
                </Button>
                <Button className="rounded-[12px] text-xs">Contact Student Services</Button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'OVERALL', value: `${overallProgressPercent}%`, icon: IconChartBar },
              {
                label: 'ONBOARDING',
                value: `${completedOnboardingCount}/${onboardingSteps.length}`,
                icon: IconShieldCheck,
              },
              { label: 'MESSAGES', value: `${threads.length}`, icon: IconMessageCircle },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] text-on-surface-variant">{card.label}</p>
                    <Icon className="size-4 text-primary/60" />
                  </div>
                  <p className="mt-3 font-mono text-2xl font-bold text-primary">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky top-16 z-10 -mx-8 border-y border-border-subtle bg-white px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {tabItems.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap py-4 text-sm ${
                  activeTab === tab
                    ? 'font-semibold text-primary'
                    : 'text-on-surface-variant transition hover:text-primary'
                }`}
              >
                {tab}
                {activeTab === tab ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  label: 'THEORY HOURS',
                  value: `${theoryHoursCompleted}/${theoryHoursRequired}`,
                  tone: 'bg-primary',
                  width: `${Math.round((theoryHoursCompleted / theoryHoursRequired) * 100)}%`,
                },
                {
                  label: 'CLINICAL HOURS',
                  value: `${clinicalHoursCompleted}/${clinicalHoursRequired}`,
                  tone: 'bg-secondary',
                  width: `${Math.round((clinicalHoursCompleted / clinicalHoursRequired) * 100)}%`,
                },
                {
                  label: 'READINESS',
                  value: `${overallProgressPercent}%`,
                  tone: 'bg-success',
                  width: `${overallProgressPercent}%`,
                },
              ].map((card) => (
                <div key={card.label} className="rounded-[18px] border border-border-subtle bg-white p-5">
                  <p className="mb-3 font-mono text-[12px] text-on-surface-variant">{card.label}</p>
                  <p className="font-mono text-2xl font-semibold text-primary">{card.value}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-highest">
                    <div className={`h-full ${card.tone}`} style={{ width: card.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[18px] border border-border-subtle bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-[18px] font-semibold">Onboarding Checklist</h3>
                <Badge variant="info">{completedOnboardingCount} completed</Badge>
              </div>
              <div className="space-y-3">
                {onboardingSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => completeOnboardingStep(step.id)}
                    className={`flex w-full items-center justify-between rounded-[16px] border p-4 text-left ${
                      step.complete
                        ? 'border-success/20 bg-success/5'
                        : 'border-border-subtle bg-surface-muted'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{step.title}</p>
                      <p className="mt-1 text-[12px] text-on-surface-variant">{step.description}</p>
                    </div>
                    {step.complete ? (
                      <IconCircleCheckFilled className="size-5 text-success" />
                    ) : (
                      <IconClockHour4 className="size-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-border-subtle bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-[18px] font-semibold">Documents In Record</h3>
                <button className="flex items-center gap-1 text-xs font-bold text-primary">
                  View detailed log <IconArrowRight className="size-3.5" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {uploads.map((upload) => (
                  <div key={upload.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{upload.title}</p>
                        <p className="mt-1 text-[12px] text-on-surface-variant">{upload.subtitle}</p>
                      </div>
                      <Badge variant={upload.status === 'Verified' ? 'success' : 'warning'}>
                        {upload.status}
                      </Badge>
                    </div>
                    <p className="mt-3 font-mono text-[11px] text-on-surface-variant">{upload.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
              <div className="flex items-center justify-between border-b border-border-subtle bg-surface-container p-4">
                <h3 className="text-sm font-bold">Recent Activity</h3>
                <IconHistory className="size-5 text-primary" />
              </div>
              <div className="space-y-4 p-5">
                {[
                  ['Orientation checklist updated', 'SYSTEM / 09:41 AM'],
                  ['Document review refreshed', 'OPS / 08:30 AM'],
                  ['Clinical hour summary recalculated', 'SYSTEM / 07:55 AM'],
                ].map((item) => (
                  <div key={item[0]} className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
                    <p className="text-sm font-semibold text-on-surface">{item[0]}</p>
                    <p className="mt-1 font-mono text-[10px] text-on-surface-variant">{item[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
              <div className="flex items-center justify-between border-b border-border-subtle bg-surface-container p-4">
                <h3 className="text-sm font-bold">Advising Notes</h3>
                <IconNotes className="size-5 text-primary" />
              </div>
              <div className="space-y-5 p-5">
                <div>
                  <p className="font-mono text-[10px] text-on-surface-variant">DR. SARAH MILLER / 2 DAYS AGO</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface">
                    Amara is progressing well through clinical documentation and is ready for the
                    next simulation lab once orientation is fully acknowledged.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-on-surface-variant">LATEST SYSTEM NOTE</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface">{lastAction}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
