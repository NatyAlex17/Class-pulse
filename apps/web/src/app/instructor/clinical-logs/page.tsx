'use client';

import * as React from 'react';
import { IconAlertCircle, IconCheck, IconClock, IconPlayerPlay, IconPlayerStop, IconSearch, IconX } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type LogStatus = 'Pending' | 'Verified' | 'Flagged';

interface ClinicalLog {
  id: string;
  studentId: string;
  student: string;
  moduleId: string;
  moduleTitle: string;
  date: string;
  hours: number;
  status: LogStatus;
  note?: string;
}

interface TaughtStudent {
  id: string;
  name: string;
  modules: Array<{ id: string; title: string }>;
}

interface ActiveTimer {
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleTitle: string;
  startedAt: string;
}

const statusOptions: LogStatus[] = ['Pending', 'Verified', 'Flagged'];

function formatClinicalHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${wholeHours} hr${wholeHours === 1 ? '' : 's'}` : `${wholeHours}h ${minutes}m`;
}

function formatElapsed(startedAt: string): string {
  const elapsedMs = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export default function InstructorClinicalLogsPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [logs, setLogs] = React.useState<ClinicalLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<LogStatus | null>(null);
  const [reviewingLog, setReviewingLog] = React.useState<ClinicalLog | null>(null);
  const [reviewNote, setReviewNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const [taughtStudents, setTaughtStudents] = React.useState<TaughtStudent[]>([]);
  const [activeTimer, setActiveTimer] = React.useState<ActiveTimer | null>(null);
  const [timerLoading, setTimerLoading] = React.useState(true);
  const [timerError, setTimerError] = React.useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [selectedModuleId, setSelectedModuleId] = React.useState('');
  const [stopNote, setStopNote] = React.useState('');
  const [timerBusy, setTimerBusy] = React.useState(false);
  const [, forceTick] = React.useState(0);

  const fetchLogs = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load clinical logs.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-logs`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch clinical logs (${response.status}).`);
      }

      const data = await response.json();
      setLogs(data.data ?? []);
    } catch (err) {
      setLogs([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch clinical logs.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const fetchTimerContext = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setTimerLoading(false);
      return;
    }

    try {
      setTimerLoading(true);
      setTimerError(null);
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [timerResponse, studentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-logs/timer`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE_URL}/instructors/${instructorId}/students`, { headers, cache: 'no-store' }),
      ]);

      if (!timerResponse.ok) throw new Error(`Failed to fetch timer state (${timerResponse.status}).`);
      if (!studentsResponse.ok) throw new Error(`Failed to fetch students (${studentsResponse.status}).`);

      const timerData = await timerResponse.json();
      const studentsData = await studentsResponse.json();
      setActiveTimer(timerData.data ?? null);
      setTaughtStudents(studentsData.data?.students ?? []);
    } catch (err) {
      setTimerError(err instanceof Error ? err.message : 'Failed to load clinical timer.');
    } finally {
      setTimerLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchTimerContext();
  }, [fetchTimerContext]);

  React.useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => forceTick((tick) => tick + 1), 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const selectedStudentModules = taughtStudents.find((student) => student.id === selectedStudentId)?.modules ?? [];

  const startTimer = async () => {
    if (!instructorId || !accessToken || !selectedStudentId || !selectedModuleId) return;

    try {
      setTimerBusy(true);
      setTimerError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-logs/timer/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: selectedStudentId, moduleId: selectedModuleId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to start timer (${response.status}).`);
      }

      const data = await response.json();
      setActiveTimer(data.data);
      setSelectedStudentId('');
      setSelectedModuleId('');
    } catch (err) {
      setTimerError(err instanceof Error ? err.message : 'Failed to start timer.');
    } finally {
      setTimerBusy(false);
    }
  };

  const stopTimer = async () => {
    if (!instructorId || !accessToken) return;

    try {
      setTimerBusy(true);
      setTimerError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-logs/timer/stop`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: stopNote || undefined }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to stop timer (${response.status}).`);
      }

      setStopNote('');
      await Promise.all([fetchLogs(), fetchTimerContext()]);
    } catch (err) {
      setTimerError(err instanceof Error ? err.message : 'Failed to stop timer.');
      // The server may have already discarded the timer (e.g. session too short) even
      // though this request failed, so resync instead of trusting stale local state.
      await fetchTimerContext();
    } finally {
      setTimerBusy(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = logs.filter((log) => log.status === 'Pending').length;
  const flaggedCount = logs.filter((log) => log.status === 'Flagged').length;
  const verifiedCount = logs.filter((log) => log.status === 'Verified').length;

  const openReview = (log: ClinicalLog) => {
    setReviewingLog(log);
    setReviewNote(log.note ?? '');
  };

  const submitReview = async (status: LogStatus) => {
    if (!reviewingLog || !instructorId || !accessToken) return;

    try {
      setSaving(true);
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/clinical-logs/${reviewingLog.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, note: reviewNote || undefined }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to update log (${response.status}).`);
      }

      const data = await response.json();
      const updated: ClinicalLog = data.data;
      setLogs((current) => current.map((log) => (log.id === updated.id ? updated : log)));
      setReviewingLog(null);
      setReviewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update log.');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<ClinicalLog>[] = [
    { id: 'student', header: 'Student', accessorKey: 'student' },
    { id: 'moduleTitle', header: 'Module', accessorKey: 'moduleTitle' },
    { id: 'date', header: 'Date', accessorKey: 'date' },
    { id: 'hours', header: 'Hours', cell: (row) => formatClinicalHours(row.hours) },
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

  return (
    <InstructorShell
      title="Clinical Log Workspace"
      subtitle="Review and verify the clinical hours your students self-report for the modules you teach."
    >
      <div className="grid gap-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        {timerError ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{timerError}</div>
        ) : null}

        <section className="rounded-[20px] border border-primary/20 bg-primary/5 p-6 shadow-soft">
          {activeTimer ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
                  <IconClock className="size-6 animate-pulse" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Timing clinical session
                  </p>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">
                    {activeTimer.studentName} <span className="font-normal text-on-surface-variant">/ {activeTimer.moduleTitle}</span>
                  </h3>
                  <p className="mt-1 font-mono text-[32px] font-bold text-primary">
                    {formatElapsed(activeTimer.startedAt)}
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[280px]">
                <Textarea
                  value={stopNote}
                  onChange={(event) => setStopNote(event.target.value)}
                  placeholder="Add a note for this session (optional)..."
                  className="rounded-[12px]"
                />
                <Button
                  variant="destructive"
                  className="gap-2 rounded-[12px]"
                  disabled={timerBusy}
                  onClick={() => void stopTimer()}
                >
                  <IconPlayerStop className="size-4" />
                  {timerBusy ? 'Stopping...' : 'Stop & Log Hours'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 font-display text-[18px] font-semibold text-on-surface">
                Start a clinical session timer
              </p>
              {timerLoading ? (
                <p className="text-sm text-on-surface-variant">Loading your students...</p>
              ) : taughtStudents.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  You don&apos;t have any students yet. Students appear here once they&apos;re enrolled in a
                  module you teach.
                </p>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Student</label>
                    <Select
                      value={selectedStudentId}
                      onChange={(event) => {
                        setSelectedStudentId(event.target.value);
                        setSelectedModuleId('');
                      }}
                      options={taughtStudents.map((student) => ({ label: student.name, value: student.id }))}
                      placeholder="Choose a student..."
                      className="rounded-[12px]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Module</label>
                    <Select
                      value={selectedModuleId}
                      onChange={(event) => setSelectedModuleId(event.target.value)}
                      options={selectedStudentModules.map((module) => ({ label: module.title, value: module.id }))}
                      placeholder={selectedStudentId ? 'Choose a module...' : 'Select a student first'}
                      className="rounded-[12px]"
                    />
                  </div>
                  <Button
                    className="gap-2 rounded-[12px]"
                    disabled={!selectedStudentId || !selectedModuleId || timerBusy}
                    onClick={() => void startTimer()}
                  >
                    <IconPlayerPlay className="size-4" />
                    {timerBusy ? 'Starting...' : 'Start Timer'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Pending review</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Flagged entries</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-error">
              <IconAlertCircle className="size-6" />
              <span>{flaggedCount}</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Verified</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-success">{verifiedCount}</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLogs}
          mobileCardTitle={(row) => row.student}
          mobileCardSubtitle={(row) => `${row.moduleTitle} / ${row.date}`}
          onRowClick={(row) => openReview(row)}
          emptyState={
            loading
              ? 'Loading clinical logs...'
              : 'No clinical logs yet from students in the modules you teach.'
          }
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  placeholder="Search student logs..."
                  className="h-11 rounded-[16px] pl-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    !filterStatus
                      ? 'bg-primary text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-primary',
                  )}
                >
                  All
                </button>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      filterStatus === status
                        ? status === 'Verified'
                          ? 'bg-success text-white'
                          : status === 'Flagged'
                            ? 'bg-error text-white'
                            : 'bg-warning text-white'
                        : 'border border-border-subtle bg-surface text-on-surface hover:border-primary',
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {reviewingLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-on-surface">{reviewingLog.student}</h2>
                <p className="text-sm text-on-surface-variant">
                  {reviewingLog.moduleTitle} / {reviewingLog.date} / {formatClinicalHours(reviewingLog.hours)}
                </p>
              </div>
              <button
                onClick={() => setReviewingLog(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Note (optional)</label>
                <Textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Add a note about this entry..."
                  className="rounded-[12px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="flex-1 gap-2 rounded-[12px]"
                disabled={saving}
                onClick={() => void submitReview('Flagged')}
              >
                <IconAlertCircle className="size-4" />
                Flag
              </Button>
              <Button
                className="flex-1 gap-2 rounded-[12px]"
                disabled={saving}
                onClick={() => void submitReview('Verified')}
              >
                <IconCheck className="size-4" />
                {saving ? 'Saving...' : 'Verify'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </InstructorShell>
  );
}
