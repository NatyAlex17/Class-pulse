'use client';

import * as React from 'react';
import { IconCheck, IconRefresh, IconUserCheck, IconUserSearch } from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type InstructorStatus = 'Compliant' | 'Review Required' | 'Expired';

type InstructorRecord = {
  id: string;
  name: string;
  role: string;
  credentials: string[];
  certifications: {
    valid: number;
    expired: number;
  };
  status: InstructorStatus;
  lastReview: string;
  nextExpiration: string;
  notes: string[];
};

type InstructorQualificationsWorkspace = {
  summary: {
    totalInstructors: number;
    compliant: number;
    reviewRequired: number;
  };
  activeInstructorId: string;
  instructors: InstructorRecord[];
};

const reviewStatusOptions = [
  { label: 'Compliant', value: 'Compliant' },
  { label: 'Review Required', value: 'Review Required' },
  { label: 'Expired', value: 'Expired' },
];

function getStatusVariant(status: InstructorStatus) {
  if (status === 'Compliant') return 'success' as const;
  if (status === 'Expired') return 'error' as const;
  return 'warning' as const;
}

export default function AuditorInstructorQualificationsPage() {
  const { session, syncedUser } = useAuth();
  const auditorId = React.useMemo(
    () => (syncedUser?.role === 'auditor' && syncedUser.localUserId ? syncedUser.localUserId : 'auditor-alex'),
    [syncedUser?.localUserId, syncedUser?.role],
  );
  const accessToken = session?.access_token;

  const [workspace, setWorkspace] = React.useState<InstructorQualificationsWorkspace | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [reviewStatus, setReviewStatus] = React.useState<InstructorStatus>('Compliant');
  const [reviewNote, setReviewNote] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchWorkspace = React.useCallback(async () => {
    if (!accessToken) {
      setWorkspace(null);
      setError('Sign in as an auditor to load instructor qualifications.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/auditors/${auditorId}/instructor-qualifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to load instructor qualifications (${response.status}).`);
      }

      const payload = await response.json();
      const nextWorkspace = payload.data as InstructorQualificationsWorkspace;
      setWorkspace(nextWorkspace);
      setSelectedInstructorId((current) =>
        current && nextWorkspace.instructors.some((item) => item.id === current)
          ? current
          : nextWorkspace.activeInstructorId || nextWorkspace.instructors[0]?.id || '',
      );
    } catch (nextError) {
      setWorkspace(null);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load instructor qualifications.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, auditorId]);

  React.useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  const filteredInstructors = React.useMemo(() => {
    const instructors = workspace?.instructors ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return instructors;
    }

    return instructors.filter((instructor) =>
      [instructor.name, instructor.role, instructor.status, instructor.credentials.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [search, workspace?.instructors]);

  const selectedInstructor =
    filteredInstructors.find((item) => item.id === selectedInstructorId) ||
    workspace?.instructors.find((item) => item.id === selectedInstructorId) ||
    null;

  React.useEffect(() => {
    if (!selectedInstructor) return;
    setReviewStatus(selectedInstructor.status);
    setReviewNote('');
  }, [selectedInstructor?.id]);

  const handleSelectInstructor = React.useCallback(
    async (instructor: InstructorRecord) => {
      setSelectedInstructorId(instructor.id);

      if (!accessToken) return;

      try {
        await fetch(`${API_BASE_URL}/auditors/${auditorId}/instructor-qualifications/${instructor.id}/select`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        // Keep the UI responsive if the selection sync misses.
      }
    },
    [accessToken, auditorId],
  );

  const handleReview = React.useCallback(async () => {
    if (!selectedInstructor || !accessToken) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `${API_BASE_URL}/auditors/${auditorId}/instructor-qualifications/${selectedInstructor.id}/review`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: reviewStatus,
            note: reviewNote.trim() || undefined,
          }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to review instructor qualification (${response.status}).`);
      }

      const payload = await response.json();
      const updatedInstructor = payload.data as InstructorRecord;

      setWorkspace((current) =>
        current
          ? {
              ...current,
              summary: {
                totalInstructors: current.instructors.length,
                compliant: current.instructors
                  .map((item) => (item.id === updatedInstructor.id ? updatedInstructor : item))
                  .filter((item) => item.status === 'Compliant').length,
                reviewRequired: current.instructors
                  .map((item) => (item.id === updatedInstructor.id ? updatedInstructor : item))
                  .filter((item) => item.status !== 'Compliant').length,
              },
              instructors: current.instructors.map((item) =>
                item.id === updatedInstructor.id ? updatedInstructor : item,
              ),
            }
          : current,
      );
      setReviewNote('');
      setSuccess(`Instructor qualification updated for ${updatedInstructor.name}.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to review instructor qualification.');
    } finally {
      setSaving(false);
    }
  }, [accessToken, auditorId, reviewNote, reviewStatus, selectedInstructor]);

  const columns: DataTableColumn<InstructorRecord>[] = [
    { id: 'name', header: 'Instructor', accessorKey: 'name' },
    { id: 'role', header: 'Role', accessorKey: 'role' },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>,
    },
    { id: 'lastReview', header: 'Last Review', accessorKey: 'lastReview' },
    { id: 'nextExpiration', header: 'Next Expiration', accessorKey: 'nextExpiration' },
  ];

  return (
    <AuditorShell
      title="Instructor Qualifications"
      subtitle="Verify instructor credentials, licenses, and certification status."
    >
      {loading ? (
        <div className="rounded-[20px] border border-border-subtle bg-surface p-8 text-sm text-on-surface-variant shadow-soft">
          Loading instructor qualifications...
        </div>
      ) : error && !workspace ? (
        <div className="rounded-[20px] border border-error/30 bg-error/5 p-8 text-sm text-error shadow-soft">
          {error}
        </div>
      ) : workspace ? (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Instructors</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{workspace.summary.totalInstructors}</p>
              <p className="mt-3 text-sm text-on-surface-variant">Active instructors</p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Compliant</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-success">{workspace.summary.compliant}</p>
              <p className="mt-3 text-sm text-on-surface-variant">Credentials currently compliant</p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Review Required</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-warning">{workspace.summary.reviewRequired}</p>
              <p className="mt-3 text-sm text-on-surface-variant">Needs auditor follow-up</p>
            </div>
          </div>

          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Instructor Qualification Queue</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Select an instructor to inspect credentials, expiration counts, and compliance notes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search instructor, role, status..."
                  className="w-full min-[520px]:w-[280px]"
                />
                <Button variant="secondary" className="rounded-[16px] px-5" onClick={() => void fetchWorkspace()}>
                  <IconRefresh className="size-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredInstructors}
              getRowId={(row) => row.id}
              getRowClassName={(row) =>
                row.id === selectedInstructorId ? 'bg-primary/5 ring-1 ring-primary/10' : undefined
              }
              onRowClick={(row) => void handleSelectInstructor(row)}
              mobileCardTitle={(row) => row.name}
              mobileCardSubtitle={(row) => `${row.role} / ${row.status}`}
              rowActions={(row) => (
                <Button
                  variant={row.id === selectedInstructorId ? 'default' : 'secondary'}
                  className="rounded-[12px] px-3"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleSelectInstructor(row);
                  }}
                >
                  <IconUserSearch className="size-4" />
                  View
                </Button>
              )}
              emptyState="No instructor qualifications matched the current search."
            />
          </section>

          {selectedInstructor ? (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                <div className="mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-[24px] font-semibold text-on-surface">{selectedInstructor.name}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">{selectedInstructor.role}</p>
                  </div>
                  <Badge variant={getStatusVariant(selectedInstructor.status)}>{selectedInstructor.status}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Valid Certifications</p>
                    <p className="mt-2 text-3xl font-semibold text-success">{selectedInstructor.certifications.valid}</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Expired Certifications</p>
                    <p className="mt-2 text-3xl font-semibold text-error">{selectedInstructor.certifications.expired}</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Last Review</p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">{selectedInstructor.lastReview}</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Next Expiration</p>
                    <p className="mt-2 text-lg font-semibold text-on-surface">{selectedInstructor.nextExpiration}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-on-surface">Credentials</h4>
                    <div className="space-y-2">
                      {selectedInstructor.credentials.map((credential) => (
                        <div
                          key={credential}
                          className="flex items-center gap-2 rounded-[14px] border border-border-subtle bg-surface-muted px-3.5 py-3 text-sm text-on-surface"
                        >
                          <IconCheck className="size-4 text-success" />
                          {credential}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-on-surface">Audit Notes</h4>
                    <div className="space-y-3">
                      {selectedInstructor.notes.length > 0 ? (
                        selectedInstructor.notes.map((note, index) => (
                          <div
                            key={`${selectedInstructor.id}-note-${index}`}
                            className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-on-surface"
                          >
                            {note}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-on-surface-variant">
                          No qualification notes have been recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                      <IconUserCheck className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-[22px] font-semibold text-on-surface">Review Controls</h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Update qualification status and save the audit finding to the instructor record.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-on-surface">Qualification status</label>
                      <Select
                        value={reviewStatus}
                        onChange={(event) => setReviewStatus(event.target.value as InstructorStatus)}
                        options={reviewStatusOptions}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-on-surface">Review note</label>
                      <Textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        placeholder="Document credential findings, expirations, or remediation notes."
                      />
                    </div>
                    <Button className="rounded-[16px]" onClick={() => void handleReview()} disabled={saving}>
                      <IconUserCheck className="size-4" />
                      {saving ? 'Saving review...' : 'Save qualification review'}
                    </Button>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[16px] border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-[16px] border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                    {success}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </AuditorShell>
  );
}
