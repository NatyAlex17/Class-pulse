 'use client';

import * as React from 'react';
import {
  IconArrowRight,
  IconBook2,
  IconDownload,
  IconFilter,
  IconMedicalCross,
  IconRosetteDiscountCheck,
  IconSparkles,
  IconCertificate2,
  IconX,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { StudentShell } from '@/components/student/student-shell';

type ModuleRow = {
  id: string;
  module: string;
  summary: string;
  number: string;
  status: 'Complete' | 'In Progress' | 'Locked';
  examScore: string;
  clinicalHours: string;
  action: string;
};

export default function StudentProgressPage() {
  const {
    modules,
    overallProgressPercent,
    theoryHoursCompleted,
    theoryHoursRequired,
    clinicalHoursCompleted,
    clinicalHoursRequired,
    currentModule,
    learningMinutes,
    advanceLearning,
    examUnlocked,
    selectModule,
    submitModuleExam,
  } = useStudentDemo();

  const [filterView, setFilterView] = React.useState<'all' | 'completed' | 'inprogress'>('all');
  const [showCertificate, setShowCertificate] = React.useState<string | null>(null);

  const allRows: ModuleRow[] = modules.map((module, index) => ({
    id: module.id,
    module: module.title,
    summary: module.summary,
    number: String(index + 1).padStart(2, '0'),
    status: module.status,
    examScore: module.examScore ?? '--',
    clinicalHours: `${Math.min(module.completedHours, module.requiredHours)}/${module.requiredHours}`,
    action:
      module.status === 'In Progress'
        ? 'Resume'
        : module.status === 'Complete'
          ? 'View Certificate'
          : examUnlocked
            ? 'Open Module'
            : 'Prerequisite Needed',
  }));

  const progressRows = allRows.filter(row => {
    if (filterView === 'completed') return row.status === 'Complete';
    if (filterView === 'inprogress') return row.status === 'In Progress';
    return true;
  });

  const columns: DataTableColumn<ModuleRow>[] = [
    {
      id: 'module',
      header: 'Module Name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${
              row.status === 'In Progress'
                ? 'bg-primary text-white'
                : row.status === 'Locked'
                  ? 'bg-surface-container text-on-surface-variant'
                  : 'bg-primary/5 text-primary'
            }`}
          >
            <span className="font-bold">{row.number}</span>
          </div>
          <div>
            <p className="font-semibold text-on-surface">{row.module}</p>
            <p className="text-[12px] text-on-surface-variant">{row.summary}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.status === 'Complete' ? (
          <Badge variant="success">Complete</Badge>
        ) : row.status === 'In Progress' ? (
          <Badge variant="info">In Progress</Badge>
        ) : (
          <Badge variant="neutral">Locked</Badge>
        ),
    },
    { id: 'score', header: 'Exam Score', accessorKey: 'examScore' },
    { id: 'hours', header: 'Clinical Hours', accessorKey: 'clinicalHours' },
    {
      id: 'action',
      header: 'Action',
      cell: (row) => {
        if (row.action === 'Resume' || row.action === 'Open Module') {
          return (
            <Button
              size="sm"
              onClick={() => {
                selectModule(row.id);
                window.location.href = '/student/learning';
              }}
              className={row.action === 'Resume' ? 'bg-info hover:bg-info/90' : ''}
            >
              {row.action}
            </Button>
          );
        } else if (row.action === 'View Certificate') {
          return (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowCertificate(row.id)}
              className="bg-success/10 text-success hover:bg-success/20"
            >
              View Certificate
            </Button>
          );
        } else {
          return (
            <button className="text-sm font-semibold text-outline cursor-not-allowed opacity-60">
              {row.action}
            </button>
          );
        }
      },
    },
  ];

  const selectedModuleData = modules.find(m => m.id === showCertificate);

  return (
    <>
      <StudentShell
        title="My Progress"
        subtitle="Track your compliance, academic milestones, and clinical training requirements."
        topActions={
          <div className="flex gap-2">
            <button
              onClick={() => setFilterView('all')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterView === 'all'
                  ? 'bg-primary text-white'
                  : 'border border-border-subtle bg-surface text-on-surface hover:border-primary'
              }`}
            >
              All Modules
            </button>
            <button
              onClick={() => setFilterView('completed')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterView === 'completed'
                  ? 'bg-success text-white'
                  : 'border border-border-subtle bg-surface text-on-surface hover:border-success'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterView('inprogress')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterView === 'inprogress'
                  ? 'bg-info text-white'
                  : 'border border-border-subtle bg-surface text-on-surface hover:border-info'
              }`}
            >
              In Progress
            </button>
          </div>
        }
      >
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-[18px] border border-border-subtle bg-surface p-8 lg:col-span-2">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-primary) ${overallProgressPercent}%, var(--color-surface-highest) 0)`,
              }}
            >
              <div className="flex h-[79%] w-[79%] flex-col items-center justify-center rounded-full bg-surface">
                <span className="font-display text-[48px] font-bold text-primary">
                  {overallProgressPercent}%
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                  Overall
                </span>
              </div>
            </div>
            <div className="flex-1">
              <span className="mb-2 block font-mono text-[12px] uppercase tracking-[0.1em] text-primary">
                Program Standing
              </span>
              <h3 className="font-display text-[28px] font-semibold text-on-surface">
                Excellent Completion Pace
              </h3>
              <p className="mb-6 mt-3 text-on-surface-variant">
                You are currently focused on {currentModule.title}. This page reflects backend-driven progress from the dashboard, learning flow, and onboarding steps.
              </p>
              <Button className="h-12 rounded-[16px] px-6" onClick={() => advanceLearning(30)}>
                Resume Current Module
                <IconArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {[
            {
              label: 'Theory Hours',
              value: `${theoryHoursCompleted} / ${theoryHoursRequired}`,
              width: `${Math.round((theoryHoursCompleted / theoryHoursRequired) * 100)}%`,
              icon: IconBook2,
            },
            {
              label: 'Clinical Hours',
              value: `${clinicalHoursCompleted} / ${clinicalHoursRequired}`,
              width: `${Math.round((clinicalHoursCompleted / clinicalHoursRequired) * 100)}%`,
              icon: IconMedicalCross,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                      {item.label}
                    </p>
                    <h5 className="font-mono text-[24px] font-semibold text-primary">{item.value}</h5>
                  </div>
                  <Icon className="size-8 text-primary/40" />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary" style={{ width: item.width }} />
                </div>
              </div>
            );
          })}
          <div className="rounded-[18px] border border-primary bg-primary-container p-6 text-on-primary">
            <p className="mb-1 font-mono text-[12px] uppercase tracking-[0.1em] opacity-80">
              Total Engagement
            </p>
            <div className="flex items-baseline gap-2">
              <h5 className="font-mono text-[32px] font-semibold">
                {(learningMinutes / 60).toFixed(1)}
              </h5>
              <span className="text-sm opacity-80">hours active</span>
            </div>
          </div>
        </section>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-muted/50 px-6 py-5">
          <div>
            <h4 className="font-display text-[18px] font-semibold">Curriculum Breakdown</h4>
            <p className="mt-1 text-sm text-on-surface-variant">
              {filterView === 'all' && 'All modules in your program'}
              {filterView === 'completed' && `${progressRows.length} module${progressRows.length !== 1 ? 's' : ''} completed`}
              {filterView === 'inprogress' && `${progressRows.length} module${progressRows.length !== 1 ? 's' : ''} in progress`}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-[10px] border border-border-subtle p-2 hover:bg-surface transition" title="Filter options">
              <IconFilter className="size-5" />
            </button>
            <button
              className="rounded-[10px] border border-border-subtle p-2 hover:bg-surface transition"
              title="Download progress report"
              onClick={() => alert('Progress report downloaded to your device')}
            >
              <IconDownload className="size-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={progressRows}
            classNames={{
              desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
              toolbar: 'hidden',
            }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 md:flex-row">
        <div className="flex-1 rounded-[18px] border border-primary/10 bg-surface-low p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <IconSparkles className="size-5" />
            </div>
            <div>
              <h5 className="font-display text-[18px] font-semibold text-primary">AI Tutor Insight</h5>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Based on your pharmacology performance, focus more on drug-to-drug interactions
                before the final assessment. Your clinical documentation speed has improved by 14%
                this week.
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-tight text-on-surface-variant/80">
                Compliance Disclaimer: AI insights are supplementary and do not replace official
                instructor evaluations.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center rounded-[18px] border border-border-subtle bg-surface p-6 text-center md:w-72">
          <IconRosetteDiscountCheck className="mb-3 size-10 text-success" />
          <h5 className="font-semibold text-on-surface">Compliance Verified</h5>
          <p className="mt-1 text-xs text-on-surface-variant">
            All documentation for current clinical hours is approved.
          </p>
        </div>
      </div>
    </StudentShell>

    {/* Certificate Modal */}
    {showCertificate && selectedModuleData && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-[20px] bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between border-b border-border-subtle bg-surface px-6 py-4">
            <div className="flex items-center gap-3">
              <IconCertificate2 className="size-6 text-success" />
              <h3 className="font-display text-[20px] font-bold text-on-surface">
                {selectedModuleData.title} Certificate
              </h3>
            </div>
            <button
              onClick={() => setShowCertificate(null)}
              className="rounded-full p-2 hover:bg-surface-low transition"
            >
              <IconX className="size-5 text-on-surface-variant" />
            </button>
          </div>

          <div className="space-y-6 p-8">
            {/* Certificate Design */}
            <div className="rounded-[20px] border-4 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center space-y-6">
              <div className="flex justify-center">
                <IconCertificate2 className="size-16 text-primary" />
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[12px] uppercase tracking-widest text-on-surface-variant">
                  Certificate of Completion
                </p>
                <h2 className="font-display text-[36px] font-bold text-primary">
                  {selectedModuleData.title}
                </h2>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-lg text-on-surface">
                  This certifies that
                </p>
                <p className="font-display text-[24px] font-semibold text-primary">
                  Amara Singh
                </p>
                <p className="text-base text-on-surface">
                  has successfully completed all learning objectives and assessments for
                </p>
                <p className="font-semibold text-on-surface">
                  {selectedModuleData.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-sm">
                <div className="text-left">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Exam Score
                  </p>
                  <p className="font-mono text-[24px] font-bold text-primary mt-1">
                    {selectedModuleData.examScore || '--'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Completion Date
                  </p>
                  <p className="font-mono text-[20px] font-bold text-primary mt-1">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-primary/30">
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Certificate ID
                </p>
                <p className="font-mono text-sm text-on-surface-variant mt-2">
                  CERT-{selectedModuleData.id.toUpperCase()}-2026
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 rounded-[14px] h-11" onClick={() => window.print()}>
                <IconDownload className="size-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="secondary"
                className="flex-1 rounded-[14px] h-11"
                onClick={() => setShowCertificate(null)}
              >
                Close
              </Button>
            </div>

            {/* Certificate Info */}
            <div className="rounded-[14px] bg-info/5 border border-info/20 p-4 text-sm text-on-surface-variant">
              <p className="font-semibold text-info mb-2">About Your Certificate</p>
              <p>
                This certificate verifies your successful completion of the {selectedModuleData.title} module.
                It is recognized across our network of partner institutions and employers in the healthcare sector.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
