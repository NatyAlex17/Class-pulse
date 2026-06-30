'use client';

import {
  IconBuildingBank,
  IconDatabase,
  IconDownload,
  IconFileAnalytics,
  IconFileTypePdf,
  IconRosetteDiscountCheck,
  IconUserShield,
} from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

type ReportRow = {
  report: string;
  status: 'Up to date' | 'Review req.' | 'Preset: CDPH' | 'Packet';
  generated: string;
  format: string;
};

const reportRows: ReportRow[] = [
  {
    report: 'Comprehensive Compliance Report',
    status: 'Up to date',
    generated: 'Oct 24, 2023 / 14:32',
    format: 'PDF / CSV',
  },
  {
    report: 'Instructor Qualifications Summary',
    status: 'Review req.',
    generated: 'Sep 12, 2023 / 09:15',
    format: 'PDF / CSV',
  },
  {
    report: 'Clinical Hour Audit',
    status: 'Preset: CDPH',
    generated: 'Oct 30, 2023 / 16:45',
    format: 'CDPH PDF / Feed',
  },
  {
    report: 'State Regulatory Packet',
    status: 'Packet',
    generated: 'Oct 18, 2023 / 11:20',
    format: 'Submission Bundle',
  },
];

const columns: DataTableColumn<ReportRow>[] = [
  { id: 'report', header: 'Report', accessorKey: 'report' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge
        variant={
          row.status === 'Up to date'
            ? 'success'
            : row.status === 'Review req.'
              ? 'warning'
              : row.status === 'Preset: CDPH'
                ? 'primary'
                : 'info'
        }
      >
        {row.status}
      </Badge>
    ),
  },
  { id: 'generated', header: 'Last Generated', accessorKey: 'generated' },
  { id: 'format', header: 'Format', accessorKey: 'format' },
];

const cards = [
  {
    title: 'Comprehensive Compliance Report',
    detail:
      'A 360-degree view of institutional compliance across all student cohorts, modules, and instructor certifications.',
    badge: 'Up to date',
    variant: 'success' as const,
    icon: IconRosetteDiscountCheck,
    accent: 'border-l-primary',
    iconTone: 'bg-primary-fixed text-primary',
    primaryAction: 'Generate PDF',
    primaryIcon: IconFileTypePdf,
    secondaryAction: 'Export CSV',
    secondaryIcon: IconDownload,
    generated: 'Oct 24, 2023 / 14:32',
  },
  {
    title: 'Instructor Qualifications Summary',
    detail:
      'Aggregated data on instructor licenses, CEUs, and pedagogical training status for accreditation reviews.',
    badge: 'Review req.',
    variant: 'warning' as const,
    icon: IconUserShield,
    accent: 'border-l-secondary',
    iconTone: 'bg-secondary-fixed text-secondary',
    primaryAction: 'Generate PDF',
    primaryIcon: IconFileTypePdf,
    secondaryAction: 'Export CSV',
    secondaryIcon: IconDownload,
    generated: 'Sep 12, 2023 / 09:15',
  },
  {
    title: 'Clinical Hour Audit',
    detail:
      'Detailed logs of student clinical experiences mapped to state mandate CDPH-283. Includes electronic signatures.',
    badge: 'Preset: CDPH',
    variant: 'primary' as const,
    icon: IconFileAnalytics,
    accent: 'border-l-primary',
    iconTone: 'bg-primary-fixed text-primary',
    primaryAction: 'CDPH PDF',
    primaryIcon: IconFileTypePdf,
    secondaryAction: 'Audit Feed',
    secondaryIcon: IconDatabase,
    generated: 'Oct 30, 2023 / 16:45',
  },
  {
    title: 'State Regulatory Packet',
    detail:
      'Standardized submission package for Board of Nursing renewals. Includes curriculum maps and student pass rates.',
    badge: null,
    variant: 'info' as const,
    icon: IconBuildingBank,
    accent: 'border-l-tertiary',
    iconTone: 'bg-tertiary-fixed text-tertiary',
    primaryAction: 'Generate PDF',
    primaryIcon: IconFileTypePdf,
    secondaryAction: 'Export ZIP',
    secondaryIcon: IconDownload,
    generated: 'Oct 18, 2023 / 11:20',
  },
] as const;

export default function AuditorReportsPage() {
  return (
    <AuditorShell
      title="Reports & Exports"
      subtitle="Generate certified regulatory documentation and deep-dive compliance insights for program audits and state submissions."
      searchPlaceholder="Search reports..."
      activeItem="Reports"
    >
      <div className="space-y-10">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border border-border-subtle bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${card.accent} border-l-4`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`flex size-12 items-center justify-center rounded-lg ${card.iconTone}`}>
                  <card.icon className="size-5" />
                </div>
                {card.badge ? <Badge variant={card.variant}>{card.badge}</Badge> : null}
              </div>
              <h3 className="font-display text-[20px] font-semibold text-on-surface">{card.title}</h3>
              <p className="mb-6 mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
              <div className="border-t border-border-subtle pt-4">
                <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/70">
                  <span>Last Generated</span>
                  <span>{card.generated}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="rounded-[12px] px-4">
                    <card.primaryIcon className="size-4" />
                    {card.primaryAction}
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-[12px] border-primary px-4 text-primary hover:bg-primary-fixed"
                  >
                    <card.secondaryIcon className="size-4" />
                    {card.secondaryAction}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border-subtle bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-[22px] font-semibold text-on-surface">
                Export History
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Auditor-ready export log for reports and evidence bundles.
              </p>
            </div>
            <Button variant="secondary" className="rounded-[12px] px-4">
              <IconDownload className="size-4" />
              Bulk Export
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={reportRows}
            mobileCardTitle={(row) => row.report}
            mobileCardSubtitle={(row) => `${row.generated} / ${row.format}`}
            rowActions={() => (
              <Button variant="secondary" className="rounded-[12px] px-4">
                <IconDownload className="size-4" />
                Export
              </Button>
            )}
            classNames={{
              root: 'gap-0',
              desktopWrapper: 'rounded-[16px] border-border-subtle bg-white shadow-none',
              table: 'bg-white',
              headerRow: 'bg-surface-muted',
              row: 'hover:bg-surface-muted/70',
              toolbar: 'hidden',
              mobileCard: 'rounded-[16px] border-border-subtle bg-white shadow-none',
            }}
          />
        </section>
      </div>
    </AuditorShell>
  );
}
