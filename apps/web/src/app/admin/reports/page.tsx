'use client';

import { IconCalendarEvent, IconDownload, IconFileAnalytics } from '@tabler/icons-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const cards = [
  { title: 'Enrollment Velocity', detail: 'Daily movement from application to active enrollment.', badge: 'Live' },
  { title: 'Compliance Monitoring', detail: 'Credential, document, and session exception reporting.', badge: 'Priority' },
  { title: 'Audit Readiness', detail: 'Exports prepared for leadership review and regulator response.', badge: 'Ready' },
] as const;

type ExportRow = {
  report: string;
  scope: string;
  cadence: string;
  updated: string;
  status: 'Ready' | 'Queued';
};

const exportsData: ExportRow[] = [
  { report: 'Operational Overview', scope: 'All programs', cadence: 'Daily', updated: '2026-06-28 06:40', status: 'Ready' },
  { report: 'Admissions Queue Audit', scope: 'Applications', cadence: 'Hourly', updated: '2026-06-28 10:05', status: 'Ready' },
  { report: 'Compliance Exception Digest', scope: 'Staff and students', cadence: 'On demand', updated: '2026-06-28 10:12', status: 'Queued' },
];

const columns: DataTableColumn<ExportRow>[] = [
  { id: 'report', header: 'Report', accessorKey: 'report' },
  { id: 'scope', header: 'Scope', accessorKey: 'scope' },
  { id: 'cadence', header: 'Cadence', accessorKey: 'cadence' },
  { id: 'updated', header: 'Last Updated', accessorKey: 'updated' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
];

export default function AdminReportsPage() {
  return (
    <AdminShell
      title="Admin Reports Suite"
      subtitle="Real-time operational insights and exportable compliance reporting."
      searchPlaceholder="Search reports..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconCalendarEvent className="size-4" />
            Last 30 Days
          </Button>
          <Button className="rounded-[16px] px-5">
            <IconDownload className="size-4" />
            Export Suite
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
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
          mobileCardSubtitle={(row) => `${row.scope} / ${row.cadence}`}
          rowActions={() => (
            <Button variant="secondary" className="rounded-[14px] px-4">
              <IconDownload className="size-4" />
              Download
            </Button>
          )}
        />
      </div>
    </AdminShell>
  );
}
