'use client';

import * as React from 'react';
import {
  IconDownload,
  IconRefresh,
  IconReportAnalytics,
  IconShieldCheck,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RangeOption = '7d' | '30d' | 'quarter';
type ReportFormat = 'CSV' | 'JSON' | 'PDF';

type ReportCard = {
  id: string;
  title: string;
  detail: string;
  badge: string;
};

type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  badge: string;
  formats: ReportFormat[];
};

type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: 'primary' | 'success' | 'warning' | 'error' | 'info';
  note?: string;
};

type Narrative = {
  title: string;
  text: string;
};

type TrendPoint = {
  label: string;
  applications: number;
  approved: number;
  activeStudents: number;
  activeInstructors: number;
};

type StatusSlice = {
  name: string;
  value: number;
};

type ModulePoint = {
  moduleId: string;
  moduleTitle: string;
  learners: number;
  completion: number;
  inProgress: number;
  blocked: number;
};

type ExportRow = {
  id: string;
  reportId?: string;
  report: string;
  scope: string;
  cadence: string;
  updated: string;
  format: string;
  status: 'Ready' | 'Queued';
  owner?: string;
  range?: RangeOption;
};

type ReportsWorkspace = {
  generatedAt: string;
  selectedRange: RangeOption;
  availableRanges: RangeOption[];
  cards: ReportCard[];
  reports: ReportDefinition[];
  summaryMetrics: SummaryMetric[];
  narratives: Narrative[];
  enrollmentTrend: TrendPoint[];
  applicationStatus: StatusSlice[];
  modulePerformance: ModulePoint[];
  exports: ExportRow[];
};

const rangeOptions: Array<{ label: string; value: RangeOption }> = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Current Quarter', value: 'quarter' },
];

const palette = {
  primary: '#6D5EF7',
  info: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  grid: '#CBD5E1',
  axis: '#64748B',
  tooltipBg: '#111827',
  tooltipBorder: '#334155',
};

const cardIcons = [IconUsersGroup, IconShieldCheck, IconReportAnalytics];
const pieColors = ['#0EA5E9', '#6D5EF7', '#22C55E', '#F59E0B', '#EF4444', '#A855F7'];

function chartTooltipStyle() {
  return {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: '12px',
    color: '#F8FAFC',
  };
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toneClass(tone: SummaryMetric['tone']) {
  switch (tone) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-error';
    case 'info':
      return 'text-secondary';
    default:
      return 'text-primary';
  }
}

export default function AdminReportsPage() {
  const { session, syncedUser } = useAuth();
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const accessToken = session?.access_token;

  const [selectedRange, setSelectedRange] = React.useState<RangeOption>('30d');
  const [workspace, setWorkspace] = React.useState<ReportsWorkspace | null>(null);
  const [selectedReportId, setSelectedReportId] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState<ReportFormat>('CSV');
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReports = React.useCallback(async () => {
    if (!accessToken) {
      setWorkspace(null);
      setError('Sign in to load admin reports.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/reports?range=${selectedRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to load reports (${response.status}).`);
      }

      const payload = await response.json();
      const nextWorkspace = payload.data as ReportsWorkspace;
      setWorkspace(nextWorkspace);
      setSelectedReportId((current) =>
        current && nextWorkspace.reports.some((report) => report.id === current)
          ? current
          : (nextWorkspace.reports[0]?.id ?? ''),
      );
    } catch (nextError) {
      setWorkspace(null);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, adminId, selectedRange]);

  React.useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const selectedReport = workspace?.reports.find((report) => report.id === selectedReportId) ?? null;

  React.useEffect(() => {
    if (!selectedReport) return;
    if (!selectedReport.formats.includes(selectedFormat)) {
      setSelectedFormat(selectedReport.formats[0] ?? 'CSV');
    }
  }, [selectedFormat, selectedReport]);

  const handleExport = React.useCallback(async () => {
    if (!selectedReport || !accessToken) return;

    try {
      setExporting(true);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/reports/exports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          format: selectedFormat,
          range: selectedRange,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to export report (${response.status}).`);
      }

      await fetchReports();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  }, [accessToken, adminId, fetchReports, selectedFormat, selectedRange, selectedReport]);

  const exportColumns: DataTableColumn<ExportRow>[] = [
    { id: 'report', header: 'Report', accessorKey: 'report' },
    { id: 'scope', header: 'Scope', accessorKey: 'scope' },
    { id: 'format', header: 'Format', accessorKey: 'format' },
    { id: 'range', header: 'Range', cell: (row) => row.range ?? '30d' },
    { id: 'updated', header: 'Updated', cell: (row) => formatDateTime(row.updated) },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{row.status}</Badge>,
    },
  ];

  return (
    <AdminShell
      title="Admin Reports Suite"
      subtitle="Live admissions, activation, and compliance reporting powered by the admin API."
      searchPlaceholder="Search reports..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5" onClick={() => void fetchReports()}>
            <IconRefresh className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="rounded-[20px] border border-border-subtle bg-surface p-8 text-sm text-on-surface-variant shadow-soft">
          Loading admin reports...
        </div>
      ) : error ? (
        <div className="rounded-[20px] border border-error/30 bg-error/5 p-8 text-sm text-error shadow-soft">{error}</div>
      ) : workspace ? (
        <div className="grid gap-6">
          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Reporting Controls</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Updated {formatDateTime(workspace.generatedAt)}. Change the reporting window and generate export bundles from live admin data.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-[16px] border border-border-subtle bg-surface-muted p-1">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedRange(option.value)}
                      className={`rounded-[12px] px-3 py-2 text-sm font-medium transition ${
                        selectedRange === option.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <select
                  value={selectedReportId}
                  onChange={(event) => setSelectedReportId(event.target.value)}
                  className="rounded-[16px] border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface"
                >
                  {workspace.reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedFormat}
                  onChange={(event) => setSelectedFormat(event.target.value as ReportFormat)}
                  className="rounded-[16px] border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface"
                >
                  {(selectedReport?.formats ?? ['CSV']).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
                <Button className="rounded-[16px] px-5" onClick={() => void handleExport()} disabled={!selectedReport || exporting}>
                  <IconDownload className="size-4" />
                  {exporting ? 'Generating...' : 'Export Report'}
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            {workspace.cards.map((card, index) => {
              const Icon = cardIcons[index % cardIcons.length];
              return (
                <div key={card.id} className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <Badge variant="primary">{card.badge}</Badge>
                  </div>
                  <h3 className="mt-5 font-display text-[20px] font-semibold text-on-surface">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workspace.summaryMetrics.map((metric) => (
              <div key={metric.id} className="rounded-[18px] border border-border-subtle bg-surface p-5 shadow-soft">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{metric.label}</p>
                <p className={`mt-3 font-display text-[30px] font-bold ${toneClass(metric.tone)}`}>{metric.value}</p>
                <p className="mt-1 text-sm font-medium text-on-surface">{metric.delta}</p>
                {metric.note ? <p className="mt-2 text-sm leading-6 text-on-surface-variant">{metric.note}</p> : null}
              </div>
            ))}
          </div>

          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5">
              <h3 className="font-display text-[22px] font-semibold text-on-surface">Executive Snapshot</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Narratives generated from the live reporting window so leadership can read the trend before diving into charts.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {workspace.narratives.map((story) => (
                <div key={story.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{story.title}</p>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">{story.text}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5">
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Admissions Trend</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">Combined student and instructor submission movement, approval pace, and activation signals across the selected range.</p>
              </div>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workspace.enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                    <XAxis dataKey="label" stroke={palette.axis} />
                    <YAxis stroke={palette.axis} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle()} />
                    <Area type="monotone" dataKey="applications" stroke={palette.info} fill="#0EA5E922" strokeWidth={3} name="Applications" />
                    <Area type="monotone" dataKey="approved" stroke={palette.success} fill="#22C55E18" strokeWidth={3} name="Approved" />
                    <Line type="monotone" dataKey="activeStudents" stroke={palette.primary} strokeWidth={2.5} name="Active Students" />
                    <Line type="monotone" dataKey="activeInstructors" stroke={palette.warning} strokeWidth={2.5} name="Active Instructors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5">
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Status Mix</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">Live breakdown of student and instructor decisions in the current reporting window.</p>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={workspace.applicationStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                      {workspace.applicationStatus.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle()} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {workspace.applicationStatus.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                      <span className="text-sm font-medium text-on-surface">{entry.name}</span>
                    </div>
                    <span className="font-display text-xl font-semibold text-on-surface">{entry.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5">
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Module Performance</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">Module-level learner load, completion rate, in-progress volume, and blocked learners from live student records.</p>
              </div>
              <DataTable
                columns={[
                  { id: 'moduleTitle', header: 'Module', accessorKey: 'moduleTitle' },
                  { id: 'learners', header: 'Learners', accessorKey: 'learners' },
                  { id: 'completion', header: 'Completion', cell: (row) => `${row.completion}%` },
                  { id: 'inProgress', header: 'In Progress', accessorKey: 'inProgress' },
                  { id: 'blocked', header: 'Blocked', accessorKey: 'blocked' },
                ]}
                data={workspace.modulePerformance}
                getRowId={(row) => row.moduleId}
                mobileCardTitle={(row) => row.moduleTitle}
                mobileCardSubtitle={(row) => `${row.learners} learners`}
                emptyState="No module performance data is available for this range."
              />
            </section>

            <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5">
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Export Center</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">Generated export bundles and queued report requests created from the live admin reporting suite.</p>
              </div>
              <DataTable
                columns={exportColumns}
                data={workspace.exports}
                getRowId={(row) => row.id}
                mobileCardTitle={(row) => row.report}
                mobileCardSubtitle={(row) => `${row.format} · ${row.status}`}
                emptyState="No report exports have been generated yet."
              />
            </section>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
