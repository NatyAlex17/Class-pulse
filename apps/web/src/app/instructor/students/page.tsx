'use client';

import { IconClockHour4, IconDots, IconSearch, IconShieldCheck } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type StudentRow = {
  name: string;
  cohort: string;
  placement: string;
  checklist: string;
  hours: string;
  risk: 'Stable' | 'Watch' | 'Urgent';
};

const students: StudentRow[] = [
  { name: 'Alice Smith', cohort: 'CNA Cohort 12', placement: 'Sunrise Care', checklist: '18/20', hours: '34/40', risk: 'Watch' },
  { name: 'Marcus Chen', cohort: 'CNA Cohort 12', placement: 'Oak Ridge Rehab', checklist: '15/20', hours: '28/40', risk: 'Urgent' },
  { name: 'Elena Ford', cohort: 'HHA Spring Track', placement: 'Westbrook Clinic', checklist: '19/20', hours: '39/40', risk: 'Stable' },
  { name: 'Priya Patel', cohort: 'CNA Cohort 13', placement: 'Bayview Center', checklist: '14/20', hours: '22/40', risk: 'Watch' },
];

const columns: DataTableColumn<StudentRow>[] = [
  { id: 'name', header: 'Student', accessorKey: 'name' },
  { id: 'cohort', header: 'Cohort', accessorKey: 'cohort' },
  { id: 'placement', header: 'Placement', accessorKey: 'placement' },
  { id: 'checklist', header: 'Checklist', accessorKey: 'checklist' },
  { id: 'hours', header: 'Clinical Hours', accessorKey: 'hours' },
  {
    id: 'risk',
    header: 'Risk',
    cell: (row) => (
      <Badge variant={row.risk === 'Urgent' ? 'error' : row.risk === 'Watch' ? 'warning' : 'success'}>
        {row.risk}
      </Badge>
    ),
  },
];

export default function InstructorStudentsPage() {
  return (
    <InstructorShell
      title="My Students Workspace"
      subtitle="Monitor progress, placement readiness, and checklist health across assigned cohorts."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-full px-5">
            Daily roster export
          </Button>
          <Button className="rounded-full px-5">Add review note</Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Assigned students</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-primary">42</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Watchlist</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-warning">
              <IconClockHour4 className="size-6" />
              <span>8</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Audit ready</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-success">
              <IconShieldCheck className="size-6" />
              <span>27</span>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={students}
          mobileCardTitle={(row) => row.name}
          mobileCardSubtitle={(row) => `${row.cohort} / ${row.placement}`}
          rowActions={() => (
            <button className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-primary">
              <IconDots className="size-4" />
            </button>
          )}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input placeholder="Search students..." className="h-11 rounded-[16px] pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">All cohorts</Badge>
                <Badge variant="warning">Needs review</Badge>
                <Badge variant="success">Audit ready</Badge>
              </div>
            </div>
          }
        />
      </div>
    </InstructorShell>
  );
}
