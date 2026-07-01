'use client';

import * as React from 'react';
import {
  IconArrowRight,
  IconBook2,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLock,
  IconRosetteDiscountCheck,
  IconStethoscope,
} from '@tabler/icons-react';
import { StudentShell } from '@/components/student/student-shell';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getStatusBadge(status: 'Complete' | 'In Progress' | 'Locked') {
  if (status === 'Complete') {
    return <Badge variant="success">Complete</Badge>;
  }

  if (status === 'In Progress') {
    return <Badge variant="info">In Progress</Badge>;
  }

  return <Badge variant="neutral">Locked</Badge>;
}

export default function StudentCurriculumPage() {
  const {
    modules,
    currentModule,
    overallProgressPercent,
    theoryHoursCompleted,
    theoryHoursRequired,
    clinicalHoursCompleted,
    clinicalHoursRequired,
    moduleCertificatesReady,
    programCertificateReady,
    portalUnlocked,
    selectModule,
  } = useStudentDemo();

  const [selectedModuleId, setSelectedModuleId] = React.useState(currentModule.id);

  React.useEffect(() => {
    setSelectedModuleId(currentModule.id);
  }, [currentModule.id]);

  const selectedModule =
    modules.find((module) => module.id === selectedModuleId) ?? currentModule;

  return (
    <StudentShell
      title="Student Curriculum"
      subtitle="Review your learning sequence, module requirements, and completion checkpoints before entering the lesson player."
      topActions={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => {
              selectModule(selectedModule.id);
              window.location.href = '/student/learning';
            }}
          >
            Open Learning
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[22px] border border-border-subtle bg-surface p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-primary">
                Program Roadmap
              </p>
              <h3 className="mt-3 font-display text-[34px] font-bold tracking-[-0.03em] text-on-surface">
                Follow each module in order and unlock the next stage of training.
              </h3>
              <p className="mt-3 text-base leading-7 text-on-surface-variant">
                This page maps the student curriculum into clear instructional blocks so theory,
                skill checks, exams, and clinical readiness stay visible and easy to follow.
              </p>
            </div>

            <div className="min-w-[220px] rounded-[20px] border border-primary/15 bg-primary/5 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Overall Completion
              </p>
              <p className="mt-2 font-display text-[42px] font-bold text-primary">
                {overallProgressPercent}%
              </p>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {[
            {
              label: 'Theory Hours',
              value: `${theoryHoursCompleted}/${theoryHoursRequired}`,
              detail: 'Required study time',
              icon: IconBook2,
              tone: 'bg-primary/5 text-primary',
            },
            {
              label: 'Clinical Hours',
              value: `${clinicalHoursCompleted}/${clinicalHoursRequired}`,
              detail: 'Verified practice hours',
              icon: IconStethoscope,
              tone: 'bg-warning/10 text-warning',
            },
            {
              label: 'Certificates Ready',
              value: String(moduleCertificatesReady),
              detail: programCertificateReady ? 'Program certificate unlocked' : 'Module awards only',
              icon: IconRosetteDiscountCheck,
              tone: 'bg-success/10 text-success',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-[20px] border border-border-subtle bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                      {item.label}
                    </p>
                    <p className="mt-3 font-display text-[30px] font-bold text-on-surface">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">{item.detail}</p>
                  </div>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-[14px]', item.tone)}>
                    <Icon className="size-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <section className="mt-8 rounded-[22px] border border-border-subtle bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">
              Curriculum Sequence
            </p>
            <h3 className="mt-2 font-display text-[28px] font-semibold text-on-surface">
              Program modules from foundation through clinical readiness
            </h3>
          </div>
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            Students progress in sequence. Locked modules remain visible so expectations stay clear
            before the next instructional stage opens.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {modules.map((module, index) => {
            const completedSteps = module.steps.filter((step) => step.complete).length;
            const isSelected = selectedModule.id === module.id;

            return (
              <button
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                className={cn(
                  'rounded-[20px] border p-6 text-left transition',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border-subtle bg-surface hover:border-primary/30 hover:bg-primary/5',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                      Module {String(index + 1).padStart(2, '0')}
                    </p>
                    <h4 className="mt-2 font-display text-[24px] font-semibold text-on-surface">
                      {module.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      {module.summary}
                    </p>
                  </div>
                  {module.status === 'Locked' ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                      <IconLock className="size-5" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                      <IconCircleCheckFilled className="size-5" />
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {getStatusBadge(module.status)}
                  <span className="text-sm text-on-surface-variant">
                    {completedSteps}/{module.steps.length} lessons complete
                  </span>
                  <span className="text-sm text-on-surface-variant">
                    {module.completedHours}/{module.requiredHours} hours
                  </span>
                </div>

                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      module.status === 'Complete'
                        ? 'bg-success'
                        : module.status === 'In Progress'
                          ? 'bg-primary'
                          : 'bg-outline-variant',
                    )}
                    style={{ width: `${module.progressPercent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[22px] border border-border-subtle bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">
                Selected Module
              </p>
              <h3 className="mt-2 font-display text-[28px] font-semibold text-on-surface">
                {selectedModule.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                {selectedModule.summary}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(selectedModule.status)}
              <span className="font-mono text-sm text-on-surface-variant">
                {selectedModule.examScore ?? 'Exam pending'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {selectedModule.steps.map((step, index) => (
              <div
                key={step.id}
                className="flex gap-4 rounded-[18px] border border-border-subtle bg-surface p-4"
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    step.complete
                      ? 'bg-success text-white'
                      : selectedModule.status === 'Locked'
                        ? 'bg-surface-container text-on-surface-variant'
                        : 'bg-primary/10 text-primary',
                  )}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-base font-semibold text-on-surface">{step.title}</h4>
                    <Badge variant={step.complete ? 'success' : 'neutral'}>{step.type}</Badge>
                    <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                      {step.duration}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[22px] border border-border-subtle bg-surface p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">
              Progress Rules
            </p>
            <div className="mt-4 space-y-4">
              {[
                'Students complete modules in sequence and unlock the next block after the current checkpoint is satisfied.',
                'Quiz and exam checkpoints remain part of the curriculum path and should not be skipped in the normal workflow.',
                'Clinical readiness stays locked until prior theory work and skill validation are complete.',
              ].map((item) => (
                <div key={item} className="rounded-[16px] bg-surface p-4 text-sm leading-6 text-on-surface-variant">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-border-subtle bg-[linear-gradient(180deg,rgba(49,24,155,0.06),rgba(49,24,155,0.02))] p-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-primary">
              Next Student Action
            </p>
            <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">
              {portalUnlocked ? `Continue ${selectedModule.title}` : 'Finish intake to unlock learning'}
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {portalUnlocked
                ? 'Use the curriculum page to choose your module, then open the lesson player to continue videos, readings, PDFs, and skill checks.'
                : 'The curriculum is visible for planning, but the active lesson player stays gated until the student intake flow is complete.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  selectModule(selectedModule.id);
                  window.location.href = '/student/learning';
                }}
                disabled={!portalUnlocked && selectedModule.status !== 'Complete'}
              >
                Open Module
                <IconArrowRight className="size-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface-variant">
                <IconClockHour4 className="size-4 text-primary" />
                Current module progress: {selectedModule.progressPercent}%
              </div>
            </div>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
