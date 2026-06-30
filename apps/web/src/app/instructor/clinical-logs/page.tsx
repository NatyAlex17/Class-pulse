'use client';

import { IconAlertCircle, IconDownload, IconSearch } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type LogRow = {
  student: string;
  site: string;
  date: string;
  hours: string;
  status: 'Pending' | 'Verified' | 'Flagged';
};

const logs: LogRow[] = [
  { student: 'Alice Smith', site: 'Sunrise Care', date: '2026-06-28', hours: '6.0', status: 'Pending' },
  { student: 'Marcus Chen', site: 'Oak Ridge Rehab', date: '2026-06-28', hours: '4.5', status: 'Flagged' },
  { student: 'Elena Ford', site: 'Westbrook Clinic', date: '2026-06-27', hours: '7.0', status: 'Verified' },
  { student: 'Priya Patel', site: 'Bayview Center', date: '2026-06-27', hours: '5.5', status: 'Pending' },
];

const columns: DataTableColumn<LogRow>[] = [
  { id: 'student', header: 'Student', accessorKey: 'student' },
  { id: 'site', header: 'Clinical Site', accessorKey: 'site' },
  { id: 'date', header: 'Date', accessorKey: 'date' },
  { id: 'hours', header: 'Hours', accessorKey: 'hours' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status === 'Verified' ? 'success' : row.status === 'Flagged' ? 'error' : 'warning'}>
        {row.status}
      </Badge>
    ),
  },
];

export default function InstructorClinicalLogsPage() {
  return (
    <InstructorShell
      title="Clinical Log Workspace"
      subtitle="Record, review, and export verified student clinical training hours."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconDownload className="size-4" />
            Export CSV
          </Button>
          <Button className="rounded-[16px] px-5">Audit PDF</Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Pending review</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-warning">5</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Flagged entries</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-error">
              <IconAlertCircle className="size-6" />
              <span>2</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Verified today</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-success">18</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          mobileCardTitle={(row) => row.student}
          mobileCardSubtitle={(row) => `${row.site} / ${row.date}`}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input placeholder="Search student logs..." className="h-11 rounded-[16px] pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning">Pending</Badge>
                <Badge variant="error">Flagged</Badge>
                <Badge variant="success">Verified</Badge>
              </div>
            </div>
          }
        />
      </div>
    </InstructorShell>
  );
}
