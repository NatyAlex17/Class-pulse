'use client';

import * as React from 'react';
import {
  IconCalendarEvent,
  IconDownload,
  IconFileAnalytics,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFilter,
  IconRefresh,
  IconReportAnalytics,
  IconShieldCheck,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

type ExportRow = {
  id: string;
  report: string;
  scope: string;
  cadence: string;
  updated: string;
  format: 'CSV' | 'JSON' | 'PDF';
  status: 'Ready' | 'Queued';
  owner: string;
};

type RangeOption = '7d' | '30d' | 'quarter';

const rangeOptions: Array<{ label: string; value: RangeOption }> = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Current Quarter', value: 'quarter' },
];

const palette = {
  primary: '#6D5EF7',
  primarySoft: '#A99CFB',
  info: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  neutral: '#94A3B8',
  grid: '#334155',
  axis: '#94A3B8',
  tooltipBg: '#111827',
  tooltipBorder: '#334155',
};

const cards = [
  {
    title: 'Enrollment Velocity',
    detail: 'Trend monitoring from application intake through active enrollment conversion.',
    badge: 'Live',
    metric: '+18%',
    support: 'Week-over-week growth in applicant throughput',
    icon: IconUsersGroup,
  },
  {
    title: 'Compliance Monitoring',
    detail: 'Document, background check, and interview completion rates by program.',
    badge: 'Priority',
    metric: '93%',
    support: 'Average program readiness across the active pipeline',
    icon: IconShieldCheck,
  },
  {
    title: 'Audit Readiness',
    detail: 'Prebuilt regulator-ready exports and leadership reporting bundles.',
    badge: 'Ready',
    metric: '7 bundles',
    support: 'Prepared exports available for immediate download',
    icon: IconReportAnalytics,
  },
] as const;

const summaryMetrics = [
  {
    label: 'Applications In Pipeline',
    value: '96',
    tone: 'text-primary',
    note: 'Across all active admissions programs',
  },
  {
    label: 'Approval Rate',
    value: '77.8%',
    tone: 'text-success',
    note: '56 approved out of 72 reviewed in range',
  },
  {
    label: 'Median Cycle Time',
    value: '4.3 days',
    tone: 'text-warning',
    note: 'From submission to final decision',
  },
  {
    label: 'Compliance Exceptions',
    value: '11',
    tone: 'text-error',
    note: 'Missing or expiring items needing follow-up',
  },
] as const;

const exportsData: ExportRow[] = [
  {
    id: 'operational-overview',
    report: 'Operational Overview',
    scope: 'All programs',
    cadence: 'Daily',
    updated: '2026-06-28 06:40',
    format: 'CSV',
    status: 'Ready',
    owner: 'Operations',
  },
  {
    id: 'admissions-queue-audit',
    report: 'Admissions Queue Audit',
    scope: 'Applications',
    cadence: 'Hourly',
    updated: '2026-06-28 10:05',
    format: 'JSON',
    status: 'Ready',
    owner: 'Admissions',
  },
  {
    id: 'compliance-exception-digest',
    report: 'Compliance Exception Digest',
    scope: 'Staff and students',
    cadence: 'On demand',
    updated: '2026-06-28 10:12',
    format: 'PDF',
    status: 'Queued',
    owner: 'Compliance',
  },
  {
    id: 'program-capacity-forecast',
    report: 'Program Capacity Forecast',
    scope: 'Cohorts and waitlists',
    cadence: 'Weekly',
    updated: '2026-06-27 16:25',
    format: 'CSV',
    status: 'Ready',
    owner: 'Enrollment',
  },
] as const;

const columns: DataTableColumn<ExportRow>[] = [
  { id: 'report', header: 'Report', accessorKey: 'report' },
  { id: 'scope', header: 'Scope', accessorKey: 'scope' },
  { id: 'cadence', header: 'Cadence', accessorKey: 'cadence' },
  { id: 'updated', header: 'Last Updated', accessorKey: 'updated' },
  { id: 'format', header: 'Format', accessorKey: 'format' },
  { id: 'owner', header: 'Owner', accessorKey: 'owner' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{row.status}</Badge>
    ),
  },
];

const enrollmentTrendData = [
  { date: 'Jun 1', applications: 12, approved: 8, enrolled: 6, conversion: 50 },
  { date: 'Jun 4', applications: 18, approved: 12, enrolled: 9, conversion: 50 },
  { date: 'Jun 7', applications: 25, approved: 18, enrolled: 14, conversion: 56 },
  { date: 'Jun 10', applications: 32, approved: 24, enrolled: 19, conversion: 59 },
  { date: 'Jun 13', applications: 38, approved: 28, enrolled: 22, conversion: 58 },
  { date: 'Jun 16', applications: 45, approved: 34, enrolled: 27, conversion: 60 },
  { date: 'Jun 19', applications: 52, approved: 40, enrolled: 32, conversion: 62 },
  { date: 'Jun 22', applications: 58, approved: 45, enrolled: 36, conversion: 62 },
  { date: 'Jun 25', applications: 64, approved: 50, enrolled: 41, conversion: 64 },
  { date: 'Jun 28', applications: 72, approved: 56, enrolled: 45, conversion: 63 },
] as const;

const applicationStatusData = [
  { name: 'Pending Review', value: 16, color: palette.info },
  { name: 'Missing Docs', value: 8, color: palette.warning },
  { name: 'Ready', value: 12, color: palette.success },
  { name: 'Approved', value: 56, color: '#16A34A' },
  { name: 'Rejected', value: 4, color: palette.danger },
] as const;

const programEnrollmentData = [
  { program: 'CNA Cohort 12', enrolled: 45, capacity: 50, pending: 8, waitlist: 3, fillRate: 90 },
  { program: 'CNA Cohort 13', enrolled: 32, capacity: 50, pending: 12, waitlist: 6, fillRate: 64 },
  { program: 'Medical Assistant', enrolled: 28, capacity: 40, pending: 10, waitlist: 4, fillRate: 70 },
  { program: 'Radiologic Tech', enrolled: 22, capacity: 35, pending: 7, waitlist: 2, fillRate: 63 },
  { program: 'HHA Program', enrolled: 18, capacity: 30, pending: 5, waitlist: 3, fillRate: 60 },
] as const;

const complianceData = [
  { program: 'CNA Cohort 12', docs: 94, background: 98, interview: 96, overall: 96 },
  { program: 'CNA Cohort 13', docs: 89, background: 92, interview: 91, overall: 91 },
  { program: 'Medical Assistant', docs: 91, background: 95, interview: 93, overall: 93 },
  { program: 'Radiologic Tech', docs: 95, background: 99, interview: 97, overall: 97 },
  { program: 'HHA Program', docs: 87, background: 90, interview: 88, overall: 88 },
] as const;

const dailyApplicationsData = [
  { day: 'Mon', morning: 4, afternoon: 6, evening: 2, total: 12 },
  { day: 'Tue', morning: 5, afternoon: 8, evening: 3, total: 16 },
  { day: 'Wed', morning: 3, afternoon: 7, evening: 4, total: 14 },
  { day: 'Thu', morning: 6, afternoon: 9, evening: 5, total: 20 },
  { day: 'Fri', morning: 8, afternoon: 11, evening: 6, total: 25 },
  { day: 'Sat', morning: 2, afternoon: 3, evening: 1, total: 6 },
  { day: 'Sun', morning: 1, afternoon: 2, evening: 0, total: 3 },
] as const;

const processingTimeData = [
  { stage: 'Initial Review', avgDays: 2.5, min: 1, max: 5 },
  { stage: 'Doc Collection', avgDays: 5.2, min: 2, max: 10 },
  { stage: 'Background Check', avgDays: 4.8, min: 3, max: 8 },
  { stage: 'Interview', avgDays: 3.1, min: 1, max: 6 },
  { stage: 'Final Approval', avgDays: 1.5, min: 0, max: 3 },
] as const;

const reportNarratives = [
  {
    title: 'Pipeline Story',
    text: 'Applicant volume is growing faster than decision throughput, with strongest conversion performance after the midpoint of the month.',
  },
  {
    title: 'Capacity Story',
    text: 'CNA Cohort 12 is near full, while CNA Cohort 13 and HHA still have room but require stronger follow-up to keep pace.',
  },
  {
    title: 'Compliance Story',
    text: 'Program readiness remains strong overall, but document completion is the most common issue in slower-moving cohorts.',
  },
] as const;

function chartTooltipStyle() {
  return {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: '12px',
    color: '#F8FAFC',
  };
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvFromRows<TData extends Record<string, string | number>>(rows: readonly TData[]) {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header]).replaceAll('"', '""')}"`)
        .join(','),
    ),
  ];

  return csvRows.join('\n');
}

function ReportSection({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-display text-[22px] font-semibold text-on-surface">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function AdminReportsPage() {
  const [selectedRange, setSelectedRange] = React.useState<RangeOption>('30d');

  const exportSuite = React.useCallback(() => {
    const payload = {
      generatedAt: '2026-06-28T10:30:00Z',
      range: selectedRange,
      summaryMetrics,
      exports: exportsData,
      enrollmentTrendData,
      applicationStatusData,
      programEnrollmentData,
      complianceData,
      dailyApplicationsData,
      processingTimeData,
    };

    downloadTextFile(
      `admin-report-suite-${selectedRange}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    );
  }, [selectedRange]);

  const exportAdmissionsCsv = React.useCallback(() => {
    downloadTextFile(
      `admissions-velocity-${selectedRange}.csv`,
      csvFromRows(enrollmentTrendData),
      'text/csv;charset=utf-8;',
    );
  }, [selectedRange]);

  const exportCapacityCsv = React.useCallback(() => {
    downloadTextFile(
      `program-capacity-${selectedRange}.csv`,
      csvFromRows(programEnrollmentData),
      'text/csv;charset=utf-8;',
    );
  }, [selectedRange]);

  const downloadExportRow = React.useCallback((row: ExportRow) => {
    const content =
      row.format === 'JSON'
        ? JSON.stringify(row, null, 2)
        : csvFromRows([row as unknown as Record<string, string | number>]);

    downloadTextFile(
      `${row.id}.${row.format.toLowerCase() === 'json' ? 'json' : 'csv'}`,
      content,
      row.format === 'JSON' ? 'application/json' : 'text/csv;charset=utf-8;',
    );
  }, []);

  return (
    <AdminShell
      title="Admin Reports Suite"
      subtitle="Real-time operational insights, export workflows, and structured reporting for admissions and compliance leadership."
      searchPlaceholder="Search reports..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-[16px] border border-border-subtle bg-surface-muted p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRange(option.value)}
                className={`rounded-[12px] px-3 py-2 text-sm font-medium transition ${
                  selectedRange === option.value
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconCalendarEvent className="size-4" />
            Reporting Window
          </Button>
          <Button className="rounded-[16px] px-5" onClick={exportSuite}>
            <IconDownload className="size-4" />
            Export Suite
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <Badge variant="primary">{card.badge}</Badge>
                </div>
                <h3 className="mt-5 font-display text-[20px] font-semibold text-on-surface">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
                <div className="mt-5 rounded-[16px] bg-surface-muted p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Highlight
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">{card.metric}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{card.support}</p>
                </div>
                <Button variant="secondary" className="mt-5 rounded-[16px] px-5">
                  <IconFileAnalytics className="size-4" />
                  Open report
                </Button>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryMetrics.map((item) => (
            <div key={item.label} className="rounded-[18px] border border-border-subtle bg-surface p-5 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {item.label}
              </p>
              <p className={`mt-3 font-display text-[30px] font-bold ${item.tone}`}>{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.note}</p>
            </div>
          ))}
        </div>

        <ReportSection
          title="Executive Snapshot"
          subtitle="A quick narrative layer for leadership so the charts below have immediate operational context."
          actions={
            <>
              <Button variant="secondary" className="rounded-[16px] px-4">
                <IconRefresh className="size-4" />
                Refresh
              </Button>
              <Button variant="secondary" className="rounded-[16px] px-4">
                <IconFilter className="size-4" />
                Filter
              </Button>
            </>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {reportNarratives.map((story) => (
              <div key={story.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                  {story.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{story.text}</p>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection
          title="Enrollment Velocity"
          subtitle="Shows how applications move through review and how effectively approvals convert into actual enrollments over the reporting window."
          actions={
            <Button variant="secondary" className="rounded-[16px] px-4" onClick={exportAdmissionsCsv}>
              <IconFileTypeCsv className="size-4" />
              Export CSV
            </Button>
          }
        >
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[16px] bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Applications Received
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">72</p>
            </div>
            <div className="rounded-[16px] bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Approved
              </p>
              <p className="mt-2 text-2xl font-bold text-success">56</p>
            </div>
            <div className="rounded-[16px] bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Enrolled
              </p>
              <p className="mt-2 text-2xl font-bold text-on-surface">45</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
              <XAxis dataKey="date" stroke={palette.axis} />
              <YAxis stroke={palette.axis} />
              <Tooltip contentStyle={chartTooltipStyle()} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke={palette.info}
                strokeWidth={2.5}
                name="Applications"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke={palette.success}
                strokeWidth={2.5}
                name="Approved"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="enrolled"
                stroke={palette.primary}
                strokeWidth={2.5}
                name="Enrolled"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ReportSection>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <ReportSection
            title="Application Status Distribution"
            subtitle="Breaks down queue health so operations can see where records are waiting, complete, or blocked."
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {applicationStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="name"
                    position="outside"
                    className="fill-on-surface"
                    fontSize={11}
                  />
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  formatter={(value) => `${value} applications`}
                />
              </PieChart>
            </ResponsiveContainer>
          </ReportSection>

          <ReportSection
            title="Applications by Time of Day"
            subtitle="Helps the admissions team staff the busiest intake windows and understand when applicant demand peaks."
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyApplicationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                <XAxis dataKey="day" stroke={palette.axis} />
                <YAxis stroke={palette.axis} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="morning" fill={palette.warning} name="Morning" radius={[8, 8, 0, 0]} />
                <Bar dataKey="afternoon" fill={palette.info} name="Afternoon" radius={[8, 8, 0, 0]} />
                <Bar dataKey="evening" fill={palette.primary} name="Evening" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ReportSection>
        </div>

        <ReportSection
          title="Program Enrollment Status"
          subtitle="Compares live occupancy, pending reviews, waitlists, and total capacity so admins can make cohort planning decisions with structure."
          actions={
            <Button variant="secondary" className="rounded-[16px] px-4" onClick={exportCapacityCsv}>
              <IconFileSpreadsheet className="size-4" />
              Export Capacity
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height={410}>
            <BarChart data={programEnrollmentData} margin={{ bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
              <XAxis dataKey="program" stroke={palette.axis} angle={-28} textAnchor="end" height={90} />
              <YAxis stroke={palette.axis} />
              <Tooltip contentStyle={chartTooltipStyle()} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="enrolled" fill={palette.success} name="Enrolled" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill={palette.warning} name="Pending" radius={[8, 8, 0, 0]} />
              <Bar dataKey="waitlist" fill={palette.danger} name="Waitlist" radius={[8, 8, 0, 0]} />
              <Bar dataKey="capacity" fill={palette.neutral} name="Capacity" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {programEnrollmentData.map((item) => (
              <div key={item.program} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface">{item.program}</p>
                <p className="mt-3 text-2xl font-bold text-primary">{item.fillRate}%</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.enrolled}/{item.capacity} filled
                </p>
              </div>
            ))}
          </div>
        </ReportSection>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ReportSection
            title="Compliance Metrics by Program"
            subtitle="Stacks key readiness checkpoints so leaders can compare documentation, background checks, and interview completion at a glance."
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                <XAxis dataKey="program" stroke={palette.axis} angle={-24} textAnchor="end" height={80} />
                <YAxis stroke={palette.axis} domain={[0, 100]} />
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  formatter={(value) => `${value}%`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area
                  type="monotone"
                  dataKey="docs"
                  stroke={palette.info}
                  fill={palette.info}
                  fillOpacity={0.28}
                  name="Documents"
                />
                <Area
                  type="monotone"
                  dataKey="background"
                  stroke={palette.success}
                  fill={palette.success}
                  fillOpacity={0.22}
                  name="Background Check"
                />
                <Area
                  type="monotone"
                  dataKey="interview"
                  stroke={palette.warning}
                  fill={palette.warning}
                  fillOpacity={0.2}
                  name="Interview"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ReportSection>

          <ReportSection
            title="Average Processing Time by Stage"
            subtitle="Tracks review cycle efficiency so bottlenecks are visible before they impact cohort readiness."
          >
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                <XAxis dataKey="stage" stroke={palette.axis} name="Processing Stage" />
                <YAxis dataKey="avgDays" stroke={palette.axis} name="Days" />
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  formatter={(value, name) => {
                    if (name === 'avgDays' && typeof value === 'number') {
                      return `${value.toFixed(1)} days`;
                    }
                    return value;
                  }}
                />
                <Scatter name="Average Days" data={processingTimeData} fill={palette.primary} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              {processingTimeData.map((item) => (
                <div key={item.stage} className="rounded-[12px] bg-surface-muted p-3">
                  <p className="text-[11px] font-bold uppercase text-on-surface-variant">{item.stage}</p>
                  <p className="mt-2 text-lg font-bold text-primary">{item.avgDays.toFixed(1)}d</p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">
                    {item.min}-{item.max} day range
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>
        </div>

        <ReportSection
          title="Recent Exports"
          subtitle="Download prepared admin and compliance reports directly from the suite. Each row has a real download action."
          actions={
            <Badge variant="info">
              {exportsData.filter((item) => item.status === 'Ready').length} ready for download
            </Badge>
          }
        >
          <DataTable
            columns={columns}
            data={exportsData}
            mobileCardTitle={(row) => row.report}
            mobileCardSubtitle={(row) => `${row.scope} / ${row.cadence}`}
            rowActions={(row) => (
              <Button
                variant="secondary"
                className="rounded-[14px] px-4"
                onClick={() => downloadExportRow(row)}
                disabled={row.status !== 'Ready'}
              >
                <IconDownload className="size-4" />
                Download
              </Button>
            )}
          />
        </ReportSection>
      </div>
    </AdminShell>
  );
}
