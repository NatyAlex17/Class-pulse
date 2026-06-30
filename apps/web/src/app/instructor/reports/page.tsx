'use client';

import { IconDownload, IconFileAnalytics } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const reportCards = [
  { title: 'Clinical Hours Audit', detail: 'Cross-check verified hours by student, cohort, and site.', badge: 'Most used' },
  { title: 'Checklist Completion Matrix', detail: 'Compare competency completion against program requirements.', badge: 'Daily' },
  { title: 'Placement Risk Digest', detail: 'Surface students at risk because of hours, signoffs, or conflicts.', badge: 'Priority' },
] as const;

type ExportRow = {
  report: string;
  format: string;
  cadence: string;
  updated: string;
  status: 'Ready' | 'Queued';
};

const exportsData: ExportRow[] = [
  { report: 'Clinical Hours Audit', format: 'CSV', cadence: 'Daily', updated: '2026-06-28 07:10', status: 'Ready' },
  { report: 'Checklist Completion Matrix', format: 'PDF', cadence: 'Weekly', updated: '2026-06-27 05:40', status: 'Ready' },
  { report: 'Placement Risk Digest', format: 'XLSX', cadence: 'On demand', updated: '2026-06-28 09:02', status: 'Queued' },
];

const columns: DataTableColumn<ExportRow>[] = [
  { id: 'report', header: 'Report', accessorKey: 'report' },
  { id: 'format', header: 'Format', accessorKey: 'format' },
  { id: 'cadence', header: 'Cadence', accessorKey: 'cadence' },
  { id: 'updated', header: 'Last Updated', accessorKey: 'updated' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
];

export default function InstructorReportsPage() {
  return (
    <InstructorShell
      title="Reports and Exports"
      subtitle="Generate audit-ready exports and operational reporting snapshots."
      topActions={<Button className="hidden rounded-full px-5 md:inline-flex">Generate export</Button>}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {reportCards.map((card) => (
            <div key={card.title} className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[20px] font-semibold text-on-surface">{card.title}</h3>
                <Badge variant="primary">{card.badge}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
              <Button variant="secondary" className="mt-5 rounded-[16px] px-5">
                <IconFileAnalytics className="size-4" />
                Open report
              </Button>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={exportsData}
          mobileCardTitle={(row) => row.report}
          mobileCardSubtitle={(row) => `${row.format} / ${row.cadence}`}
          rowActions={() => (
            <Button variant="secondary" className="rounded-[14px] px-4">
              <IconDownload className="size-4" />
              Download
            </Button>
          )}
        />
      </div>
    </InstructorShell>
  );
}
