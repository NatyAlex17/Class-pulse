import {
  IconArrowRight,
  IconBook2,
  IconDownload,
  IconFilter,
  IconMedicalCross,
  IconRosetteDiscountCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { StudentShell } from '@/components/student/student-shell';

type ModuleRow = {
  module: string;
  summary: string;
  number: string;
  status: 'Complete' | 'In Progress' | 'Locked';
  examScore: string;
  clinicalHours: string;
  action: string;
};

const progressRows: ModuleRow[] = [
  {
    module: 'Foundation of Patient Care',
    summary: 'Core Methodology & Ethics',
    number: '01',
    status: 'Complete',
    examScore: '98/100',
    clinicalHours: '12/12',
    action: 'View Certificate',
  },
  {
    module: 'Anatomy & Physiology',
    summary: 'Systemic Review',
    number: '02',
    status: 'Complete',
    examScore: '94/100',
    clinicalHours: '10/10',
    action: 'View Certificate',
  },
  {
    module: 'Clinical Pharmacology',
    summary: 'Drug Administration & Safety',
    number: '03',
    status: 'In Progress',
    examScore: '--',
    clinicalHours: '16/18',
    action: 'Resume',
  },
  {
    module: 'Advanced Diagnostics',
    summary: 'Radiology & Lab Reports',
    number: '04',
    status: 'Locked',
    examScore: '--',
    clinicalHours: '0/20',
    action: 'Prerequisite Needed',
  },
];

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
    cell: (row) =>
      row.action === 'Resume' ? (
        <Button size="sm">Resume</Button>
      ) : (
        <button className="text-sm font-semibold text-primary hover:underline">{row.action}</button>
      ),
  },
];

export default function StudentProgressPage() {
  return (
    <StudentShell
      title="My Progress"
      subtitle="Track your compliance, academic milestones, and clinical training requirements."
      topActions={
        <>
          <Button variant="secondary" className="hidden rounded-full md:inline-flex">
            Switch Program
          </Button>
          <Button className="hidden rounded-full md:inline-flex">Check Status</Button>
        </>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-[18px] border border-border-subtle bg-white p-8 lg:col-span-2">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(var(--color-primary)_96%,var(--color-surface-highest)_0)]">
              <div className="flex h-[79%] w-[79%] flex-col items-center justify-center rounded-full bg-white">
                <span className="font-display text-[48px] font-bold text-primary">96%</span>
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
                You are currently 4% away from fulfilling all academic requirements for the current
                semester. Your clinical hours are trending ahead of the peer average.
              </p>
              <Button className="h-12 rounded-[16px] px-6">
                Resume Current Module
                <IconArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {[
            { label: 'Theory Hours', value: '156 / 160', width: '97.5%', icon: IconBook2 },
            { label: 'Clinical Hours', value: '38 / 40', width: '95%', icon: IconMedicalCross },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="overflow-hidden rounded-[18px] border border-border-subtle bg-white p-6">
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
              <h5 className="font-mono text-[32px] font-semibold">128</h5>
              <span className="text-sm opacity-80">hours active</span>
            </div>
          </div>
        </section>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-muted/50 px-6 py-5">
          <h4 className="font-display text-[18px] font-semibold">Curriculum Breakdown</h4>
          <div className="flex gap-2">
            <button className="rounded-[10px] border border-border-subtle p-2 hover:bg-white">
              <IconFilter className="size-5" />
            </button>
            <button className="rounded-[10px] border border-border-subtle p-2 hover:bg-white">
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
        <div className="flex-1 rounded-[18px] border border-primary/10 bg-[rgb(238,242,255)] p-6">
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
        <div className="flex w-full flex-col items-center justify-center rounded-[18px] border border-border-subtle bg-white p-6 text-center md:w-72">
          <IconRosetteDiscountCheck className="mb-3 size-10 text-success" />
          <h5 className="font-semibold text-on-surface">Compliance Verified</h5>
          <p className="mt-1 text-xs text-on-surface-variant">
            All documentation for current clinical hours is approved.
          </p>
        </div>
      </div>
    </StudentShell>
  );
}
