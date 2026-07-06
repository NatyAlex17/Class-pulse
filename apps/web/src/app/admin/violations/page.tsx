'use client';

import * as React from 'react';
import { IconSearch, IconShieldExclamation } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ViolationContext = 'secure_exam' | 'learning_session';
type ViolationTone = 'warning' | 'error' | 'info';

interface StudentViolationLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  context: ViolationContext;
  contextLabel: string;
  type: string;
  label: string;
  tone: ViolationTone;
  moduleId?: string;
  moduleTitle?: string;
  stepId?: string;
  warningsAtEvent?: number;
  detail?: string;
  occurredAt: string;
}

const CONTEXT_FILTERS: Array<{ value: 'all' | ViolationContext; label: string }> = [
  { value: 'all', label: 'All contexts' },
  { value: 'secure_exam', label: 'Secure exam' },
  { value: 'learning_session', label: 'Learning session' },
];

function toneToBadgeVariant(tone: ViolationTone) {
  if (tone === 'error') return 'error' as const;
  if (tone === 'info') return 'info' as const;
  return 'warning' as const;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminViolationsLogPage() {
  const { session, syncedUser } = useAuth();
  const [violations, setViolations] = React.useState<StudentViolationLogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [contextFilter, setContextFilter] = React.useState<'all' | ViolationContext>('all');
  const [selectedViolation, setSelectedViolation] = React.useState<StudentViolationLogEntry | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchViolations = React.useCallback(async () => {
    if (!hasAuth || !session?.access_token) {
      setViolations([]);
      setError('Sign in as an admin to load the violation log.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/security-violations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch violation log (${response.status}).`);
      }

      const data = await response.json();
      setViolations(data.data || []);
    } catch (err) {
      setViolations([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch violation log.');
    } finally {
      setLoading(false);
    }
  }, [adminId, hasAuth, session?.access_token]);

  React.useEffect(() => {
    if (!hasAuth) return;
    void fetchViolations();
  }, [fetchViolations, hasAuth]);

  const filteredViolations = violations.filter((violation) => {
    const matchesContext = contextFilter === 'all' || violation.context === contextFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      violation.studentName.toLowerCase().includes(query) ||
      violation.studentNumber.toLowerCase().includes(query) ||
      (violation.moduleTitle ?? '').toLowerCase().includes(query);
    return matchesContext && matchesQuery;
  });

  const examViolationCount = violations.filter((v) => v.context === 'secure_exam').length;
  const learningViolationCount = violations.filter((v) => v.context === 'learning_session').length;
  const highSeverityCount = violations.filter((v) => v.tone === 'error').length;
  const flaggedStudentCount = new Set(violations.map((v) => v.studentId)).size;

  const columns: DataTableColumn<StudentViolationLogEntry>[] = [
    {
      id: 'student',
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.studentName}</p>
          <p className="text-xs text-on-surface-variant">{row.studentNumber}</p>
        </div>
      ),
    },
    {
      id: 'context',
      header: 'Context',
      cell: (row) => <Badge variant={row.context === 'secure_exam' ? 'primary' : 'neutral'}>{row.contextLabel}</Badge>,
    },
    {
      id: 'violation',
      header: 'Violation',
      cell: (row) => (
        <div>
          <p className="text-on-surface">{row.label}</p>
          {row.moduleTitle ? <p className="text-xs text-on-surface-variant">{row.moduleTitle}</p> : null}
        </div>
      ),
    },
    {
      id: 'warnings',
      header: 'Warnings',
      cell: (row) => (row.warningsAtEvent !== undefined ? row.warningsAtEvent : '—'),
    },
    {
      id: 'severity',
      header: 'Severity',
      cell: (row) => (
        <Badge variant={toneToBadgeVariant(row.tone)}>
          {row.tone === 'error' ? 'High' : row.tone === 'info' ? 'Low' : 'Medium'}
        </Badge>
      ),
    },
    {
      id: 'occurredAt',
      header: 'Occurred',
      cell: (row) => <span className="text-on-surface-variant">{formatTimestamp(row.occurredAt)}</span>,
    },
  ];

  return (
    <>
      <AdminShell
        title="Violations Log"
        subtitle="Exam integrity and learning session violations recorded across all students."
        topActions={
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="primary">{violations.length} Total</Badge>
            <Badge variant="error">{highSeverityCount} High Severity</Badge>
            <Badge variant="neutral">{flaggedStudentCount} Students Flagged</Badge>
            <Button variant="secondary" size="sm" onClick={() => void fetchViolations()}>
              Refresh
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] border border-outline-variant/70 bg-surface/80 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">Secure exam</p>
              <p className="mt-1 text-2xl font-semibold text-on-surface">{examViolationCount}</p>
            </div>
            <div className="rounded-[18px] border border-outline-variant/70 bg-surface/80 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">Learning session</p>
              <p className="mt-1 text-2xl font-semibold text-on-surface">{learningViolationCount}</p>
            </div>
            <div className="rounded-[18px] border border-outline-variant/70 bg-surface/80 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-on-surface-variant">Students flagged</p>
              <p className="mt-1 text-2xl font-semibold text-on-surface">{flaggedStudentCount}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center">Loading violation log...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredViolations}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedViolation(row)}
              mobileCardTitle={(row) => row.studentName}
              mobileCardSubtitle={(row) => row.label}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-6 text-on-surface-variant">
                  <IconShieldExclamation className="size-6" />
                  <p>No violations recorded{searchQuery || contextFilter !== 'all' ? ' for this filter' : ''}.</p>
                </div>
              }
              renderToolbar={
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative min-w-[240px]">
                    <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    <Input
                      placeholder="Search by student or module..."
                      className="h-11 rounded-[16px] pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CONTEXT_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setContextFilter(filter.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          contextFilter === filter.value
                            ? 'bg-primary text-white'
                            : 'bg-surface-high text-on-surface-variant hover:bg-surface-muted'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </div>
      </AdminShell>

      <Modal
        open={Boolean(selectedViolation)}
        onClose={() => setSelectedViolation(null)}
        title="Violation Detail"
        description={selectedViolation ? `${selectedViolation.studentName} · ${selectedViolation.studentNumber}` : undefined}
        size="md"
      >
        {selectedViolation ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={selectedViolation.context === 'secure_exam' ? 'primary' : 'neutral'}>
                {selectedViolation.contextLabel}
              </Badge>
              <Badge variant={toneToBadgeVariant(selectedViolation.tone)}>
                {selectedViolation.tone === 'error' ? 'High Severity' : selectedViolation.tone === 'info' ? 'Low Severity' : 'Medium Severity'}
              </Badge>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
              <p className="font-semibold text-on-surface">{selectedViolation.label}</p>
              <p className="mt-1 text-on-surface-variant">Event type: {selectedViolation.type}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <p className="text-xs text-on-surface-variant">Module</p>
                <p className="font-semibold text-on-surface">{selectedViolation.moduleTitle ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <p className="text-xs text-on-surface-variant">Warnings at event</p>
                <p className="font-semibold text-on-surface">{selectedViolation.warningsAtEvent ?? '—'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs text-on-surface-variant">Occurred</p>
              <p className="font-semibold text-on-surface">{formatTimestamp(selectedViolation.occurredAt)}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
