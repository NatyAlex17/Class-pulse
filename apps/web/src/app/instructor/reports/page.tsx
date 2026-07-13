'use client';

import * as React from 'react';
import {
  IconChartBar,
  IconDownload,
  IconFileAnalytics,
  IconRefresh,
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RangeOption = '7d' | '30d' | 'term';
type ReportFormat = 'CSV' | 'PDF' | 'JSON';

type SummaryMetric = {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'error';
  note: string;
};

type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  category: 'teaching' | 'students' | 'compliance' | 'operations';
  formats: ReportFormat[];
};

type Narrative = {
  title: string;
  text: string;
};

type TeachingTrendPoint = {
  label: string;
  teachingHours: number;
  studentContacts: number;
  signoffsCompleted: number;
  attendanceRate: number;
};

type ModulePerformancePoint = {
  moduleId: string;
  moduleTitle: string;
  students: number;
  completion: number;
  attendance: number;
  signoffLag: number;
};

type TeachingMixSlice = {
  name: string;
  value: number;
};

type CohortSnapshot = {
  cohort: string;
  learners: number;
  attendance: number;
  readiness: number;
  risk: 'Low' | 'Moderate' | 'High';
};

type StudentAttentionRow = {
  studentId: string;
  student: string;
  cohort: string;
  module: string;
  progress: number;
  attendance: number;
  hoursRemaining: number;
  signoffsOpen: number;
  risk: 'Stable' | 'Watch' | 'Critical';
  action: string;
};

type OperationalHighlight = {
  title: string;
  detail: string;
  supportingText: string;
  tone: 'primary' | 'success' | 'warning' | 'error';
};

type ExportRow = {
  id: string;
  reportId?: string;
  report: string;
  format: string;
  cadence: string;
  updated: string;
  status: 'Ready' | 'Queued';
  range?: RangeOption;
};

type ReportsWorkspace = {
  generatedAt: string;
  selectedRange: RangeOption;
  availableRanges: RangeOption[];
  reports: ReportDefinition[];
  summaryMetrics: SummaryMetric[];
  narratives: Narrative[];
  teachingTrend: TeachingTrendPoint[];
  modulePerformance: ModulePerformancePoint[];
  teachingMix: TeachingMixSlice[];
  cohortSnapshots: CohortSnapshot[];
  studentAttention: StudentAttentionRow[];
  highlights: OperationalHighlight[];
  exports: ExportRow[];
};

const palette = {
  primary: '#0F766E',
  secondary: '#2563EB',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#7C3AED',
  neutral: '#94A3B8',
  grid: '#CBD5E1',
  axis: '#64748B',
  tooltipBg: '#0F172A',
  tooltipBorder: '#1E293B',
};

const mixColors: Record<string, string> = {
  Theory: palette.secondary,
  'Skills Lab': palette.primary,
  Clinical: palette.success,
  Advising: palette.info,
};

function chartTooltipStyle() {
  return {
    backgroundColor: palette.tooltipBg,
    border: `1px solid ${palette.tooltipBorder}`,
    borderRadius: '12px',
    color: '#F8FAFC',
  };
}

function csvFromRows<TData extends Record<string, string | number>>(rows: readonly TData[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => `"${String(row[header]).replaceAll('"', '""')}"`).join(','),
    ),
  ].join('\n');
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

export default function InstructorReportsPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [selectedRange, setSelectedRange] = React.useState<RangeOption>('30d');
  const [workspace, setWorkspace] = React.useState<ReportsWorkspace | null>(null);
  const [selectedReportId, setSelectedReportId] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState<ReportFormat>('CSV');
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchReports = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load reports.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/reports?range=${selectedRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch reports (${response.status}).`);
      }

      const payload = await response.json();
      const nextWorkspace: ReportsWorkspace = payload.data;
      setWorkspace(nextWorkspace);
      setSelectedReportId((current) =>
        current && nextWorkspace.reports.some((report) => report.id === current)
          ? current
          : (nextWorkspace.reports[0]?.id ?? ''),
      );
    } catch (err) {
      setWorkspace(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId, selectedRange]);

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

  const exportColumns: DataTableColumn<ExportRow>[] = [
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

  const studentColumns: DataTableColumn<StudentAttentionRow>[] = [
    { id: 'student', header: 'Student', accessorKey: 'student' },
    { id: 'cohort', header: 'Cohort', accessorKey: 'cohort' },
    { id: 'module', header: 'Module', accessorKey: 'module' },
    { id: 'progress', header: 'Progress', cell: (row) => `${row.progress}%` },
    { id: 'attendance', header: 'Attendance', cell: (row) => `${row.attendance}%` },
    { id: 'hoursRemaining', header: 'Hours Left', cell: (row) => `${row.hoursRemaining}h` },
    {
      id: 'risk',
      header: 'Risk',
      cell: (row) => (
        <Badge variant={row.risk === 'Critical' ? 'error' : row.risk === 'Watch' ? 'warning' : 'success'}>
          {row.risk}
        </Badge>
      ),
    },
  ];

  const buildReportPayload = React.useCallback(
    (reportId: string) => {
      if (!workspace) return null;

      switch (reportId) {
        case 'student-risk-watchlist':
          return workspace.studentAttention.map((row) => ({
            student: row.student,
            cohort: row.cohort,
            module: row.module,
            progress: row.progress,
            attendance: row.attendance,
            hoursRemaining: row.hoursRemaining,
            signoffsOpen: row.signoffsOpen,
            risk: row.risk,
            action: row.action,
          }));
        case 'module-performance-breakdown':
          return workspace.modulePerformance.map((row) => ({
            moduleTitle: row.moduleTitle,
            students: row.students,
            completion: row.completion,
            attendance: row.attendance,
            signoffLag: row.signoffLag,
          }));
        case 'instruction-load-planner':
          return {
            teachingTrend: workspace.teachingTrend,
            teachingMix: workspace.teachingMix,
            generatedAt: workspace.generatedAt,
            range: workspace.selectedRange,
          };
        case 'clinical-compliance-audit':
          return {
            summaryMetrics: workspace.summaryMetrics,
            studentAttention: workspace.studentAttention,
            cohortSnapshots: workspace.cohortSnapshots,
            generatedAt: workspace.generatedAt,
          };
        default:
          return {
            summaryMetrics: workspace.summaryMetrics,
            teachingTrend: workspace.teachingTrend,
            modulePerformance: workspace.modulePerformance,
            cohortSnapshots: workspace.cohortSnapshots,
            studentAttention: workspace.studentAttention,
            generatedAt: workspace.generatedAt,
            range: workspace.selectedRange,
          };
      }
    },
    [workspace],
  );

  const triggerExport = React.useCallback(async () => {
    if (!instructorId || !accessToken || !selectedReport) return;

    try {
      setExporting(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/reports/exports`, {
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
        throw new Error(payload?.error?.message ?? `Failed to generate export (${response.status}).`);
      }

      const payload = await response.json();
      const exportRow: ExportRow = payload.data;
      setWorkspace((current) =>
        current
          ? {
              ...current,
              exports: [exportRow, ...current.exports],
            }
          : current,
      );

      const reportPayload = buildReportPayload(selectedReport.id);
      if (selectedFormat === 'CSV' && Array.isArray(reportPayload) && reportPayload.length > 0) {
        downloadTextFile(
          `${selectedReport.id}-${selectedRange}.csv`,
          csvFromRows(reportPayload as Array<Record<string, string | number>>),
          'text/csv;charset=utf-8;',
        );
      } else if (selectedFormat === 'JSON' && reportPayload) {
        downloadTextFile(
          `${selectedReport.id}-${selectedRange}.json`,
          JSON.stringify(reportPayload, null, 2),
          'application/json',
        );
      }

      setSuccess(
        selectedFormat === 'PDF'
          ? `${selectedReport.title} queued for PDF export.`
          : `${selectedReport.title} exported successfully.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  }, [accessToken, buildReportPayload, instructorId, selectedFormat, selectedRange, selectedReport]);

  const focusReport = React.useCallback(
    (reportId: string, format?: string) => {
      setSelectedReportId(reportId);
      if (format === 'CSV' || format === 'JSON' || format === 'PDF') {
        setSelectedFormat(format);
      }
    },
    [],
  );

  const attentionScatterData = React.useMemo(
    () =>
      (workspace?.studentAttention ?? []).map((student) => ({
        x: student.attendance,
        y: student.progress,
        z: student.signoffsOpen,
        name: student.student,
        risk: student.risk,
      })),
    [workspace],
  );

  return (
    <InstructorShell
      title="Reports and Exports"
      subtitle="Detailed instructor analytics generated from live portal data, not page-level static fixtures."
    >
      <div className="grid gap-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        {success ? (
          <div className="rounded-[16px] border border-success/20 bg-success/5 p-4 text-sm text-success">{success}</div>
        ) : null}

        <section className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <Badge variant="primary">API-backed reporting</Badge>
              <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight text-on-surface">
                Customizable, exportable reports for every student, module, cohort, and teaching load signal.
              </h2>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Everything below is loaded from the instructor reports API and recalculated by range, so the page is
                now a reporting client rather than a static mockup.
              </p>
            </div>

            <div className="grid gap-3 xl:min-w-[420px]">
              <div className="flex flex-wrap gap-2">
                {(workspace?.availableRanges ?? ['7d', '30d', 'term']).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedRange(option)}
                    className={`rounded-[14px] px-4 py-2.5 text-sm font-medium transition ${
                      selectedRange === option
                        ? 'bg-primary text-on-primary'
                        : 'border border-border-subtle bg-surface-muted text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {option === '7d' ? 'Last 7 Days' : option === '30d' ? 'Last 30 Days' : 'Current Term'}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={selectedReportId}
                  onChange={(event) => setSelectedReportId(event.target.value)}
                  className="h-11 rounded-[14px] border border-border-subtle bg-surface-muted px-4 text-sm text-on-surface outline-none"
                >
                  {(workspace?.reports ?? []).map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedFormat}
                  onChange={(event) => setSelectedFormat(event.target.value as ReportFormat)}
                  className="h-11 rounded-[14px] border border-border-subtle bg-surface-muted px-4 text-sm text-on-surface outline-none"
                >
                  {(selectedReport?.formats ?? ['CSV']).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="rounded-[16px] px-5" onClick={() => void fetchReports()}>
                  <IconRefresh className="size-4" />
                  Refresh
                </Button>
                <Button
                  className="rounded-[16px] px-5"
                  disabled={!selectedReport || exporting}
                  onClick={() => void triggerExport()}
                >
                  <IconDownload className="size-4" />
                  {exporting ? 'Exporting...' : 'Generate Export'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {loading || !workspace ? (
          <div className="rounded-[20px] border border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
            Loading instructor reports...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {workspace.reports.map((report) => (
                <div
                  key={report.id}
                  className={`rounded-[20px] border bg-surface p-5 shadow-soft transition ${
                    selectedReportId === report.id ? 'border-primary/40' : 'border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={selectedReportId === report.id ? 'primary' : 'info'}>{report.category}</Badge>
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-on-surface-variant">
                      {report.formats.join(' / ')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[20px] font-semibold text-on-surface">{report.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{report.description}</p>
                  <Button
                    variant="secondary"
                    className="mt-5 rounded-[16px] px-5"
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <IconFileAnalytics className="size-4" />
                    Focus report
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {workspace.summaryMetrics.map((item) => (
                <div key={item.label} className="rounded-[18px] border border-border-subtle bg-surface p-5 shadow-soft">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{item.label}</p>
                  <p
                    className={`mt-3 font-display text-[30px] font-bold ${
                      item.tone === 'primary'
                        ? 'text-primary'
                        : item.tone === 'success'
                          ? 'text-success'
                          : item.tone === 'warning'
                            ? 'text-warning'
                            : 'text-error'
                    }`}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.note}</p>
                </div>
              ))}
            </div>

            <ReportSection
              title="Report Readout"
              subtitle="Narrative explanations generated by the instructor reports API to make the data easier to read fast."
              actions={
                <Badge variant="info">
                  Generated {new Date(workspace.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </Badge>
              }
            >
              <div className="grid gap-4 lg:grid-cols-3">
                {workspace.narratives.map((story) => (
                  <div key={story.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{story.title}</p>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">{story.text}</p>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection
              title="Teaching Load Trend"
              subtitle="Live time-series from the reporting API showing instruction hours, student contacts, signoffs, and attendance by range."
            >
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={workspace.teachingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                  <XAxis dataKey="label" stroke={palette.axis} />
                  <YAxis yAxisId="left" stroke={palette.axis} />
                  <YAxis yAxisId="right" orientation="right" stroke={palette.axis} />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="teachingHours" fill={palette.primary} radius={[8, 8, 0, 0]} name="Teaching Hours" />
                  <Line yAxisId="left" type="monotone" dataKey="studentContacts" stroke={palette.secondary} strokeWidth={2.5} name="Student Contacts" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="attendanceRate" stroke={palette.success} strokeWidth={2.5} name="Attendance %" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ReportSection>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <ReportSection
                title="Module Performance Breakdown"
                subtitle="Real module-by-module performance from the backend, built from the students tied to this instructor."
                actions={
                  <Badge variant="primary">
                    {workspace.modulePerformance.length} module{workspace.modulePerformance.length === 1 ? '' : 's'}
                  </Badge>
                }
              >
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={workspace.modulePerformance} margin={{ bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                    <XAxis dataKey="moduleTitle" stroke={palette.axis} angle={-18} textAnchor="end" height={80} />
                    <YAxis stroke={palette.axis} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle()} formatter={(value) => `${value}%`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="completion" fill={palette.primary} name="Completion %" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="attendance" fill={palette.secondary} name="Attendance %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ReportSection>

              <ReportSection
                title="Teaching Mix"
                subtitle="API-derived distribution across theory, skills lab, clinical supervision, and advising work."
              >
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={workspace.teachingMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={3}>
                      {workspace.teachingMix.map((entry) => (
                        <Cell key={entry.name} fill={mixColors[entry.name] ?? palette.neutral} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle()} formatter={(value) => `${value}% of effort`} />
                    <Legend wrapperStyle={{ paddingTop: '18px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ReportSection>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <ReportSection
                title="Cohort Readiness"
                subtitle="Backend-calculated attendance and readiness summaries for every cohort this instructor currently teaches."
              >
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={workspace.cohortSnapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                    <XAxis dataKey="cohort" stroke={palette.axis} />
                    <YAxis stroke={palette.axis} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle()} formatter={(value) => `${value}%`} />
                    <Legend wrapperStyle={{ paddingTop: '18px' }} />
                    <Area type="monotone" dataKey="attendance" stroke={palette.secondary} fill={palette.secondary} fillOpacity={0.18} name="Attendance %" />
                    <Area type="monotone" dataKey="readiness" stroke={palette.primary} fill={palette.primary} fillOpacity={0.28} name="Readiness %" />
                  </AreaChart>
                </ResponsiveContainer>
              </ReportSection>

              <ReportSection
                title="Student Attention Matrix"
                subtitle="Progress versus attendance for each learner, colored by risk from the instructor reports API."
              >
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} opacity={0.35} />
                    <XAxis type="number" dataKey="x" name="Attendance" unit="%" stroke={palette.axis} domain={[0, 100]} />
                    <YAxis type="number" dataKey="y" name="Progress" unit="%" stroke={palette.axis} domain={[0, 100]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={chartTooltipStyle()}
                      formatter={(value, name) => {
                        if ((name === 'Attendance' || name === 'Progress') && typeof value === 'number') {
                          return `${value}%`;
                        }
                        return value;
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? 'Student'}
                    />
                    <Scatter name="Students" data={attentionScatterData}>
                      {attentionScatterData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.risk === 'Critical'
                              ? palette.danger
                              : entry.risk === 'Watch'
                                ? palette.warning
                                : palette.success
                          }
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ReportSection>
            </div>

            <ReportSection
              title="Intervention Watchlist"
              subtitle="Detailed student-level action list returned by the API so the instructor can act immediately without guessing."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Badge variant="warning">
                    {workspace.studentAttention.filter((student) => student.risk !== 'Stable').length} learners need attention
                  </Badge>
                  <Button
                    variant="secondary"
                    className="rounded-[16px] px-4"
                    onClick={() => focusReport('student-risk-watchlist', 'CSV')}
                  >
                    <IconChartBar className="size-4" />
                    Focus Watchlist Export
                  </Button>
                </div>
              }
            >
              <DataTable
                columns={studentColumns}
                data={workspace.studentAttention}
                mobileCardTitle={(row) => row.student}
                mobileCardSubtitle={(row) => `${row.cohort} / ${row.module}`}
                rowActions={(row) => (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{row.action}</p>
                    <p className="text-xs text-on-surface-variant">{row.signoffsOpen} open signoffs</p>
                  </div>
                )}
              />
            </ReportSection>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <ReportSection
                title="Operational Highlights"
                subtitle="Quick summary cards produced from API-derived calculations."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {workspace.highlights.map((highlight) => (
                    <div key={highlight.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                      <p className="text-sm font-semibold text-on-surface">{highlight.title}</p>
                      <p
                        className={`mt-2 text-base font-semibold ${
                          highlight.tone === 'primary'
                            ? 'text-primary'
                            : highlight.tone === 'success'
                              ? 'text-success'
                              : highlight.tone === 'warning'
                                ? 'text-warning'
                                : 'text-error'
                        }`}
                      >
                        {highlight.detail}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{highlight.supportingText}</p>
                    </div>
                  ))}
                </div>
              </ReportSection>

              <ReportSection
                title="Export Center"
                subtitle="Every export request is API-backed and recorded in instructor export history."
              >
                <DataTable
                  columns={exportColumns}
                  data={workspace.exports}
                  mobileCardTitle={(row) => row.report}
                  mobileCardSubtitle={(row) => `${row.format} / ${row.cadence}`}
                  rowActions={(row) => (
                    <Button
                      variant="secondary"
                      className="rounded-[14px] px-4"
                      onClick={() => row.reportId && focusReport(row.reportId, row.format)}
                    >
                      Focus
                    </Button>
                  )}
                />
              </ReportSection>
            </div>
          </>
        )}
      </div>
    </InstructorShell>
  );
}
