'use client';

import { IconFileCheck, IconUser } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

type StudentRecord = {
  id: string;
  name: string;
  cohort: string;
  status: 'On Track' | 'At Risk' | 'Complete';
  recordsComplete: string;
  lastReview: string;
};

const students: StudentRecord[] = [
  { id: '1', name: 'Alice Smith', cohort: 'CNA 12', status: 'On Track', recordsComplete: '94%', lastReview: '2026-06-28' },
  { id: '2', name: 'Marcus Chen', cohort: 'CNA 12', status: 'On Track', recordsComplete: '89%', lastReview: '2026-06-27' },
  { id: '3', name: 'Elena Ford', cohort: 'HHA', status: 'At Risk', recordsComplete: '78%', lastReview: '2026-06-25' },
  { id: '4', name: 'Priya Patel', cohort: 'CNA 13', status: 'On Track', recordsComplete: '92%', lastReview: '2026-06-28' },
  { id: '5', name: 'James Rodriguez', cohort: 'CNA 13', status: 'Complete', recordsComplete: '100%', lastReview: '2026-06-28' },
  { id: '6', name: 'Lisa Wong', cohort: 'MA', status: 'On Track', recordsComplete: '87%', lastReview: '2026-06-27' },
];

const columns: DataTableColumn<StudentRecord>[] = [
  { id: 'name', header: 'Student Name', accessorKey: 'name' },
  { id: 'cohort', header: 'Cohort', accessorKey: 'cohort' },
  { id: 'status', header: 'Status', cell: (row) => (
    <Badge variant={row.status === 'Complete' ? 'success' : row.status === 'At Risk' ? 'warning' : 'primary'}>
      {row.status}
    </Badge>
  ) },
  { id: 'recordsComplete', header: 'Records Complete', accessorKey: 'recordsComplete' },
  { id: 'lastReview', header: 'Last Review', accessorKey: 'lastReview' },
];

export default function AuditorStudentRecordsPage() {
  return (
    <AuditorShell
      title="Student Records"
      subtitle="Verify student file completeness and documentation status."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Students</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{students.length}</p>
            <p className="mt-3 text-sm text-on-surface-variant">Across all cohorts</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Records Complete</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-success">91%</p>
            <p className="mt-3 text-sm text-on-surface-variant">Average completion</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs Review</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-warning">1</p>
            <p className="mt-3 text-sm text-on-surface-variant">At risk students</p>
          </div>
        </div>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Student File Status</h3>
            <Button className="rounded-[16px] px-5">
              <IconFileCheck className="size-4" />
              Audit All
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={students}
            mobileCardTitle={(row) => row.name}
            mobileCardSubtitle={(row) => `${row.cohort} / ${row.status}`}
          />
        </section>
      </div>
    </AuditorShell>
  );
}
