'use client';

import * as React from 'react';
import {
  IconActivityHeartbeat,
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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

type AdminTone = 'primary' | 'success' | 'warning' | 'error' | 'info';
type QueueType = 'all' | 'Student Intake' | 'Instructor Onboarding';

type OperationsWorkspace = {
  generatedAt: string;
  metrics: Array<{ label: string; value: string; tone: AdminTone }>;
  trend: Array<{ label: string; studentSubmissions: number; instructorSubmissions: number; activeStudents: number }>;
  workload: Array<{ name: string; value: number }>;
  modules: Array<{
    id: string;
    title: string;
    learners: number;
    avgProgress: number;
    completed: number;
    inProgress: number;
    blocked: number;
  }>;
  escalations: Array<{
    id: string;
    title: string;
    group: 'Compliance' | 'Admissions' | 'Scheduling' | 'Financials';
    tone: 'error' | 'warning';
  }>;
  queue: Array<{
    id: string;
    type: 'Student Intake' | 'Instructor Onboarding';
    candidate: string;
    track: string;
    submittedAt: string;
    status: string;
    documentsComplete: string;
    blockers: string;
  }>;
  highlights: Array<{ id: string; title: string; detail: string; tone: AdminTone }>;
};

const chartColors = ['#0F766E', '#2563EB', '#D97706', '#7C3AED', '#DC2626'];

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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => `"${String(row[header]).replaceAll('"', '""')}"`).join(',')),
  ].join('\n');
}

function toneClasses(tone: AdminTone) {
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

export default function AdminOperationsPage() {
  const { session, syncedUser } = useAuth();
  const adminId = React.useMemo(
    () => (syncedUser?.role === 'admin' && syncedUser.localUserId ? syncedUser.localUserId : 'admin-001'),
    [syncedUser?.localUserId, syncedUser?.role],
  );
  const accessToken = session?.access_token;

  const [workspace, setWorkspace] = React.useState<OperationsWorkspace | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queueType, setQueueType] = React.useState<QueueType>('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const fetchOperations = React.useCallback(async () => {
    if (!accessToken) {
      setWorkspace(null);
      setError('Sign in to load the command center.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/operations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to load command center (${response.status}).`);
      }

      const payload = await response.json();
      setWorkspace(payload.data as OperationsWorkspace);
    } catch (nextError) {
      setWorkspace(null);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load command center.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, adminId]);

  React.useEffect(() => {
    void fetchOperations();
  }, [fetchOperations]);

  const statuses = React.useMemo(() => {
    const values = new Set(workspace?.queue.map((row) => row.status) ?? []);
    return ['all', ...Array.from(values)];
  }, [workspace]);

  const filteredQueue = React.useMemo(() => {
    if (!workspace) return [];
    return workspace.queue.filter((row) => {
      if (queueType !== 'all' && row.type !== queueType) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      return true;
    });
  }, [queueType, statusFilter, workspace]);

  const queueColumns: DataTableColumn<OperationsWorkspace['queue'][number]>[] = [
    { id: 'candidate', header: 'Candidate', accessorKey: 'candidate' },
    { id: 'type', header: 'Queue', accessorKey: 'type' },
    { id: 'track', header: 'Track', accessorKey: 'track' },
    { id: 'submittedAt', header: 'Submitted', cell: (row) => formatDateTime(row.submittedAt) },
    { id: 'documentsComplete', header: 'Docs', accessorKey: 'documentsComplete' },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    { id: 'blockers', header: 'Blockers', accessorKey: 'blockers' },
  ];

  const moduleColumns: DataTableColumn<OperationsWorkspace['modules'][number]>[] = [
    { id: 'title', header: 'Module', accessorKey: 'title' },
    { id: 'learners', header: 'Learners', accessorKey: 'learners' },
    { id: 'avgProgress', header: 'Avg Progress', cell: (row) => `${row.avgProgress}%` },
    { id: 'completed', header: 'Completed', accessorKey: 'completed' },
    { id: 'inProgress', header: 'In Progress', accessorKey: 'inProgress' },
    { id: 'blocked', header: 'Blocked', accessorKey: 'blocked' },
  ];

  const exportQueueCsv = React.useCallback(() => {
    if (filteredQueue.length === 0) return;
    downloadTextFile(
      'admin-command-center-queue.csv',
      toCsv(
        filteredQueue.map((row) => ({
          candidate: row.candidate,
          queue: row.type,
          track: row.track,
          submittedAt: row.submittedAt,
          status: row.status,
          documentsComplete: row.documentsComplete,
          blockers: row.blockers,
        })),
      ),
      'text/csv;charset=utf-8',
    );
  }, [filteredQueue]);

  const exportWorkspaceJson = React.useCallback(() => {
    if (!workspace) return;
    downloadTextFile(
      'admin-command-center.json',
      JSON.stringify(workspace, null, 2),
      'application/json;charset=utf-8',
    );
  }, [workspace]);

  return (
    <AdminShell
      title="Operational Command Center"
      subtitle="Live intake, activation, and compliance reporting for the admin workspace."
      searchPlaceholder="Search command center records..."
      topLinks={[
        { label: 'Command Center', href: '/admin/operations' },
        { label: 'Applications', href: '/admin/applications' },
        { label: 'Reports', href: '/admin/reports' },
      ]}
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" className="rounded-full px-4" onClick={() => void fetchOperations()}>
            <IconRefresh className="mr-2 size-4" />
            Refresh
          </Button>
          <Button variant="outline" className="rounded-full px-4" onClick={exportQueueCsv} disabled={!filteredQueue.length}>
            <IconDownload className="mr-2 size-4" />
            Export Queue CSV
          </Button>
          <Button className="rounded-full px-4" onClick={exportWorkspaceJson} disabled={!workspace}>
            <IconDownload className="mr-2 size-4" />
            Export JSON
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="rounded-[24px] border border-border-subtle bg-surface p-8 text-sm text-on-surface-variant shadow-soft">
          Loading command center data...
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-error/30 bg-error/5 p-8 text-sm text-error shadow-soft">
          {error}
        </div>
      ) : workspace ? (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workspace.metrics.map((metric) => (
              <div key={metric.label} className="rounded-[22px] border border-border-subtle bg-surface p-5 shadow-soft">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{metric.label}</p>
                <p className={`mt-3 font-mono text-[30px] font-semibold ${toneClasses(metric.tone)}`}>{metric.value}</p>
                <p className="mt-2 text-xs text-on-surface-variant">Updated {formatDateTime(workspace.generatedAt)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[22px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Operational trend</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Six-week intake and activation movement from the live admin API.</p>
                </div>
                <Badge variant="primary">API live</Badge>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workspace.trend}>
                    <defs>
                      <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#64748B" />
                    <YAxis stroke="#64748B" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Area type="monotone" dataKey="studentSubmissions" name="Student intake" stroke="#0F766E" fill="url(#studentGradient)" strokeWidth={3} />
                    <Area type="monotone" dataKey="instructorSubmissions" name="Instructor onboarding" stroke="#2563EB" fillOpacity={0} strokeWidth={3} />
                    <Area type="monotone" dataKey="activeStudents" name="Active students" stroke="#D97706" fillOpacity={0} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-[22px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Workload mix</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Current admin volume split across intake, onboarding, and activation.</p>
                </div>
                <IconUsersGroup className="size-5 text-primary" />
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={workspace.workload} dataKey="value" nameKey="name" innerRadius={64} outerRadius={98} paddingAngle={3}>
                      {workspace.workload.map((slice, index) => (
                        <Cell key={slice.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-3">
                {workspace.workload.map((slice, index) => (
                  <div key={slice.name} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="size-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                      <span className="text-sm text-on-surface">{slice.name}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-on-surface">{slice.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[22px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Module health</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Live module performance, completion, and blocked learner counts from active learning records.</p>
                </div>
                <Badge variant="info">{workspace.modules.length} modules</Badge>
              </div>
              <DataTable
                columns={moduleColumns}
                data={workspace.modules}
                getRowId={(row) => row.id}
                emptyState="No module performance records are available yet."
              />
            </section>

            <section className="rounded-[22px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Escalation feed</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">Real blockers detected from submission reviews and instructor credential status.</p>
                </div>
                <IconActivityHeartbeat className="size-5 text-primary" />
              </div>
              <div className="space-y-4">
                {workspace.escalations.length === 0 ? (
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4 text-sm text-on-surface-variant">
                    No escalations are active right now.
                  </div>
                ) : (
                  workspace.escalations.map((item) => (
                    <div key={item.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-[14px] ${
                            item.tone === 'error' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                          }`}
                        >
                          <IconAlertTriangle className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">{item.group}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="rounded-[22px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Queue review workspace</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Filter the API queue by intake type and status, then export the exact slice you are reviewing.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={queueType}
                  onChange={(event) => setQueueType(event.target.value as QueueType)}
                  className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface"
                >
                  <option value="all">All queues</option>
                  <option value="Student Intake">Student intake</option>
                  <option value="Instructor Onboarding">Instructor onboarding</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-on-surface"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DataTable
              columns={queueColumns}
              data={filteredQueue}
              getRowId={(row) => row.id}
              emptyState="No queue items matched the current filters."
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {workspace.highlights.map((highlight) => (
              <div key={highlight.id} className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
                <p className={`font-mono text-[11px] uppercase tracking-[0.12em] ${toneClasses(highlight.tone)}`}>{highlight.title}</p>
                <p className="mt-3 text-sm leading-6 text-on-surface">{highlight.detail}</p>
              </div>
            ))}
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}
