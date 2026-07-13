'use client';

import * as React from 'react';
import { IconChecklist, IconFileCheck, IconRefresh, IconUserSearch } from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type StudentStatus = 'On Track' | 'At Risk' | 'Complete';
type CertificationEligibility = 'Eligible' | 'Blocked' | 'Pending Review';

type StudentRecord = {
  id: string;
  name: string;
  cohort: string;
  status: StudentStatus;
  recordsComplete: string;
  lastReview: string;
  theoryHours: number;
  clinicalHours: number;
  attendanceRate: number;
  certificationEligibility: CertificationEligibility;
  missingEvidence: string[];
  notes: string[];
};

type StudentRecordsWorkspace = {
  summary: {
    totalStudents: number;
    recordsCompleteAverage: string;
    needsReview: number;
  };
  activeStudentId: string;
  records: StudentRecord[];
};

const verifyStatusOptions = [
  { label: 'On Track', value: 'On Track' },
  { label: 'At Risk', value: 'At Risk' },
  { label: 'Complete', value: 'Complete' },
];

const certificationOptions = [
  { label: 'Eligible', value: 'Eligible' },
  { label: 'Pending Review', value: 'Pending Review' },
  { label: 'Blocked', value: 'Blocked' },
];

function formatStatusVariant(status: StudentStatus) {
  if (status === 'Complete') return 'success' as const;
  if (status === 'At Risk') return 'warning' as const;
  return 'primary' as const;
}

function formatEligibilityVariant(value: CertificationEligibility) {
  if (value === 'Eligible') return 'success' as const;
  if (value === 'Blocked') return 'error' as const;
  return 'warning' as const;
}

export default function AuditorStudentRecordsPage() {
  const { session, syncedUser } = useAuth();
  const auditorId = React.useMemo(
    () => (syncedUser?.role === 'auditor' && syncedUser.localUserId ? syncedUser.localUserId : 'auditor-alex'),
    [syncedUser?.localUserId, syncedUser?.role],
  );
  const accessToken = session?.access_token;

  const [workspace, setWorkspace] = React.useState<StudentRecordsWorkspace | null>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [verifyStatus, setVerifyStatus] = React.useState<StudentStatus>('On Track');
  const [certificationEligibility, setCertificationEligibility] =
    React.useState<CertificationEligibility>('Pending Review');
  const [reviewNote, setReviewNote] = React.useState('');
  const [noteDraft, setNoteDraft] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [savingReview, setSavingReview] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchWorkspace = React.useCallback(async () => {
    if (!accessToken) {
      setWorkspace(null);
      setError('Sign in as an auditor to load student records.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/auditors/${auditorId}/student-records`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to load student records (${response.status}).`);
      }

      const payload = await response.json();
      const nextWorkspace = payload.data as StudentRecordsWorkspace;
      setWorkspace(nextWorkspace);
      setSelectedStudentId((current) =>
        current && nextWorkspace.records.some((record) => record.id === current)
          ? current
          : nextWorkspace.activeStudentId || nextWorkspace.records[0]?.id || '',
      );
    } catch (nextError) {
      setWorkspace(null);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load student records.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, auditorId]);

  React.useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  const filteredRecords = React.useMemo(() => {
    const records = workspace?.records ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [record.name, record.cohort, record.status, record.certificationEligibility]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [search, workspace?.records]);

  const selectedStudent =
    filteredRecords.find((record) => record.id === selectedStudentId) ||
    workspace?.records.find((record) => record.id === selectedStudentId) ||
    null;

  React.useEffect(() => {
    if (!selectedStudent) return;
    setVerifyStatus(selectedStudent.status);
    setCertificationEligibility(selectedStudent.certificationEligibility);
    setReviewNote('');
  }, [selectedStudent?.id]);

  const handleSelectStudent = React.useCallback(
    async (student: StudentRecord) => {
      setSelectedStudentId(student.id);

      if (!accessToken) return;

      try {
        await fetch(`${API_BASE_URL}/auditors/${auditorId}/student-records/${student.id}/select`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch {
        // Non-blocking selection tracking.
      }
    },
    [accessToken, auditorId],
  );

  const handleVerify = React.useCallback(async () => {
    if (!selectedStudent || !accessToken) return;

    try {
      setSavingReview(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/auditors/${auditorId}/student-records/${selectedStudent.id}/verify`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: verifyStatus,
          certificationEligibility,
          note: reviewNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to verify student record (${response.status}).`);
      }

      const payload = await response.json();
      const updatedRecord = payload.data as StudentRecord;

      setWorkspace((current) =>
        current
          ? {
              ...current,
              summary: {
                ...current.summary,
                needsReview: current.records
                  .map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
                  .filter((record) => record.status === 'At Risk').length,
              },
              records: current.records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
            }
          : current,
      );
      setSuccess(`Student record updated for ${updatedRecord.name}.`);
      setReviewNote('');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to verify student record.');
    } finally {
      setSavingReview(false);
    }
  }, [accessToken, auditorId, certificationEligibility, reviewNote, selectedStudent, verifyStatus]);

  const handleAddNote = React.useCallback(async () => {
    if (!selectedStudent || !accessToken) return;

    if (!noteDraft.trim()) {
      setError('Enter a note before saving it to the student file.');
      return;
    }

    try {
      setSavingNote(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_URL}/auditors/${auditorId}/student-records/${selectedStudent.id}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: noteDraft.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save student note (${response.status}).`);
      }

      const payload = await response.json();
      const updatedRecord = payload.data as StudentRecord;

      setWorkspace((current) =>
        current
          ? {
              ...current,
              records: current.records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
            }
          : current,
      );
      setNoteDraft('');
      setSuccess(`Note added to ${updatedRecord.name}'s record.`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to save student note.');
    } finally {
      setSavingNote(false);
    }
  }, [accessToken, auditorId, noteDraft, selectedStudent]);

  const columns: DataTableColumn<StudentRecord>[] = [
    { id: 'name', header: 'Student Name', accessorKey: 'name' },
    { id: 'cohort', header: 'Cohort', accessorKey: 'cohort' },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={formatStatusVariant(row.status)}>{row.status}</Badge>,
    },
    { id: 'recordsComplete', header: 'Records Complete', accessorKey: 'recordsComplete' },
    { id: 'lastReview', header: 'Last Review', accessorKey: 'lastReview' },
  ];

  return (
    <AuditorShell
      title="Student Records"
      subtitle="Verify student file completeness and documentation status."
    >
      {loading ? (
        <div className="rounded-[20px] border border-border-subtle bg-surface p-8 text-sm text-on-surface-variant shadow-soft">
          Loading student records...
        </div>
      ) : error && !workspace ? (
        <div className="rounded-[20px] border border-error/30 bg-error/5 p-8 text-sm text-error shadow-soft">
          {error}
        </div>
      ) : workspace ? (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Students</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{workspace.summary.totalStudents}</p>
              <p className="mt-3 text-sm text-on-surface-variant">Across all cohorts</p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Records Complete</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-success">{workspace.summary.recordsCompleteAverage}</p>
              <p className="mt-3 text-sm text-on-surface-variant">Average completion</p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs Review</p>
              <p className="mt-2 font-mono text-[32px] font-semibold text-warning">{workspace.summary.needsReview}</p>
              <p className="mt-3 text-sm text-on-surface-variant">At risk students</p>
            </div>
          </div>

          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Student File Status</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Select any student row to open the full record workspace and review everything on file.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student, cohort, status..."
                  className="w-full min-[520px]:w-[280px]"
                />
                <Button variant="secondary" className="rounded-[16px] px-5" onClick={() => void fetchWorkspace()}>
                  <IconRefresh className="size-4" />
                  Refresh
                </Button>
                <Button className="rounded-[16px] px-5">
                  <IconFileCheck className="size-4" />
                  Audit All
                </Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredRecords}
              getRowId={(row) => row.id}
              getRowClassName={(row) =>
                row.id === selectedStudentId ? 'bg-primary/5 ring-1 ring-primary/10' : undefined
              }
              onRowClick={(row) => void handleSelectStudent(row)}
              mobileCardTitle={(row) => row.name}
              mobileCardSubtitle={(row) => `${row.cohort} / ${row.status}`}
              rowActions={(row) => (
                <Button
                  variant={row.id === selectedStudentId ? 'default' : 'secondary'}
                  className="rounded-[12px] px-3"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleSelectStudent(row);
                  }}
                >
                  <IconUserSearch className="size-4" />
                  View
                </Button>
              )}
              emptyState="No student records matched the current search."
            />
          </section>

          {selectedStudent ? (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-display text-[24px] font-semibold text-on-surface">{selectedStudent.name}</h3>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {selectedStudent.cohort} · Last reviewed {selectedStudent.lastReview}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={formatStatusVariant(selectedStudent.status)}>{selectedStudent.status}</Badge>
                    <Badge variant={formatEligibilityVariant(selectedStudent.certificationEligibility)}>
                      {selectedStudent.certificationEligibility}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Record Completion</p>
                    <p className="mt-2 text-3xl font-semibold text-primary">{selectedStudent.recordsComplete}</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Attendance Rate</p>
                    <p className="mt-2 text-3xl font-semibold text-success">{selectedStudent.attendanceRate}%</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Theory Hours</p>
                    <p className="mt-2 text-3xl font-semibold text-on-surface">{selectedStudent.theoryHours}</p>
                  </div>
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Clinical Hours</p>
                    <p className="mt-2 text-3xl font-semibold text-on-surface">{selectedStudent.clinicalHours}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Missing Evidence</h4>
                    <div className="mt-3 space-y-3">
                      {selectedStudent.missingEvidence.length > 0 ? (
                        selectedStudent.missingEvidence.map((item) => (
                          <div
                            key={item}
                            className="rounded-[16px] border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning"
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[16px] border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                          No missing evidence on this file.
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Audit Notes</h4>
                    <div className="mt-3 space-y-3">
                      {selectedStudent.notes.length > 0 ? (
                        selectedStudent.notes.map((note, index) => (
                          <div
                            key={`${selectedStudent.id}-note-${index}`}
                            className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-on-surface"
                          >
                            {note}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-on-surface-variant">
                          No notes have been recorded yet.
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
                      <IconChecklist className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-[22px] font-semibold text-on-surface">Verification Controls</h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Update the file status, eligibility, and leave the review note on the record.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-on-surface">Student status</label>
                      <Select
                        value={verifyStatus}
                        onChange={(event) => setVerifyStatus(event.target.value as StudentStatus)}
                        options={verifyStatusOptions}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-on-surface">Certification eligibility</label>
                      <Select
                        value={certificationEligibility}
                        onChange={(event) => setCertificationEligibility(event.target.value as CertificationEligibility)}
                        options={certificationOptions}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-on-surface">Verification note</label>
                      <Textarea
                        value={reviewNote}
                        onChange={(event) => setReviewNote(event.target.value)}
                        placeholder="Document the auditor review, disposition, or exception."
                      />
                    </div>

                    <Button className="rounded-[16px]" onClick={() => void handleVerify()} disabled={savingReview}>
                      <IconFileCheck className="size-4" />
                      {savingReview ? 'Saving review...' : 'Save verification'}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Add Audit Note</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Keep a running narrative of evidence checks, follow-up items, and compliance findings.
                  </p>

                  <div className="mt-4 grid gap-4">
                    <Textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder="Add a new note to this student record."
                    />
                    <Button variant="secondary" className="rounded-[16px]" onClick={() => void handleAddNote()} disabled={savingNote}>
                      {savingNote ? 'Saving note...' : 'Add note'}
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
