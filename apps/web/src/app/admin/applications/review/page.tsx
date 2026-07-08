'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ReviewType = 'students' | 'instructors';
type SubmissionStatus = 'pending' | 'approved' | 'rejected';
type ChecklistStatus = 'Received' | 'Missing';

interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  status: SubmissionStatus;
  entranceExamScore: number | null;
  entranceExamPassed?: boolean | null;
  passingScore?: number;
  questions: Array<{ questionId: string; prompt?: string; reviewStatus: 'pending' | 'correct' | 'wrong' }>;
  documents: Array<{
    documentId: string;
    name?: string;
    required: boolean;
    reviewStatus: 'pending' | 'approved' | 'rejected';
  }>;
  enrollmentData?: { hhaAddon?: boolean; wantsToTestAtDaisy?: boolean | null };
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

interface InstructorIntakeSubmission {
  id: string;
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  status: SubmissionStatus;
  documents: Array<{
    documentId: string;
    name?: string;
    required: boolean;
    reviewStatus: 'pending' | 'approved' | 'rejected';
  }>;
  agreedToTerms: boolean;
  selectedModuleIds: string[];
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

type ReviewRecord =
  | {
      kind: 'students';
      id: string;
      name: string;
      email?: string;
      status: SubmissionStatus;
      note: string;
      summary: string;
      submittedAt: string;
      approvedAt?: string;
      reviewedBy?: string;
      primaryAction: string;
      secondaryAction: string;
      detailCards: Array<[string, string]>;
      reviewerNotes: string[];
      checklist: Array<[string, ChecklistStatus]>;
      route: string;
    }
  | {
      kind: 'instructors';
      id: string;
      name: string;
      email?: string;
      status: SubmissionStatus;
      note: string;
      summary: string;
      submittedAt: string;
      approvedAt?: string;
      reviewedBy?: string;
      primaryAction: string;
      secondaryAction: string;
      detailCards: Array<[string, string]>;
      reviewerNotes: string[];
      checklist: Array<[string, ChecklistStatus]>;
      route: string;
    };

function statusBadgeVariant(status: SubmissionStatus | ChecklistStatus) {
  if (status === 'approved' || status === 'Received') return 'success' as const;
  if (status === 'rejected' || status === 'Missing') return 'error' as const;
  return 'warning' as const;
}

function statusLabel(status: SubmissionStatus) {
  return status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending Review';
}

function formatDate(value?: string) {
  if (!value) return 'Not yet processed';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildStudentRecord(submission: StudentIntakeSubmission): ReviewRecord {
  const requiredDocs = submission.documents.filter((document) => document.required);
  const approvedDocs = requiredDocs.filter((document) => document.reviewStatus === 'approved').length;
  const missingDocs = requiredDocs.filter((document) => document.reviewStatus !== 'approved').length;
  const pendingQuestions = submission.questions.filter((question) => question.reviewStatus === 'pending').length;
  const correctAnswers = submission.questions.filter((question) => question.reviewStatus === 'correct').length;
  const note =
    submission.status === 'approved'
      ? 'Accepted and cleared from the admissions review queue.'
      : submission.status === 'rejected'
        ? submission.rejectionReason?.trim() || 'Review completed with a rejected decision.'
        : missingDocs > 0
          ? `${missingDocs} required document item(s) still need review`
          : `${pendingQuestions} entrance exam item(s) still need grading`;

  const reviewerNotes = [
    submission.status === 'approved'
      ? `Applicant was approved${submission.approvedAt ? ` on ${formatDate(submission.approvedAt)}` : ''}.`
      : submission.status === 'rejected'
        ? submission.rejectionReason?.trim() || 'Application was rejected during review.'
        : 'Application is still active in the review queue.',
    submission.entranceExamScore !== null
      ? `Entrance exam reviewed at ${submission.entranceExamScore}/${submission.questions.length}.`
      : 'Entrance exam still has items waiting for grading.',
    approvedDocs === requiredDocs.length && requiredDocs.length > 0
      ? 'All required admissions documents have been approved.'
      : `${approvedDocs} of ${requiredDocs.length} required admissions documents are approved.`,
  ];

  return {
    kind: 'students',
    id: submission.id,
    name: submission.studentName ?? submission.studentId,
    email: submission.studentEmail,
    status: submission.status,
    note,
    summary:
      submission.status === 'approved'
        ? 'Accepted student intake submission with full review history and checklist confirmation.'
        : submission.status === 'rejected'
          ? 'Previously reviewed student intake submission with rejection details preserved for audit.'
          : 'Active student intake submission still moving through admissions review.',
    submittedAt: submission.submittedAt,
    approvedAt: submission.approvedAt,
    reviewedBy: submission.reviewedBy,
    primaryAction: submission.status === 'pending' ? 'Open student review' : 'View decision',
    secondaryAction: submission.status === 'approved' ? 'Accepted history' : submission.status === 'rejected' ? 'Rejected history' : 'Needs review',
    detailCards: [
      ['Type', 'Student intake'],
      ['Submitted', formatDate(submission.submittedAt)],
      ['Checklist', `${approvedDocs} of ${requiredDocs.length} received`],
      ['Exam', submission.entranceExamScore !== null ? `${correctAnswers}/${submission.questions.length} scored` : 'Pending review'],
    ],
    reviewerNotes,
    checklist: requiredDocs.map((document) => [
      document.name ?? document.documentId,
      document.reviewStatus === 'approved' ? 'Received' : 'Missing',
    ]),
    route: `/admin/applications/intake-submissions/${submission.id}`,
  };
}

function buildInstructorRecord(submission: InstructorIntakeSubmission): ReviewRecord {
  const requiredDocs = submission.documents.filter((document) => document.required);
  const approvedDocs = requiredDocs.filter((document) => document.reviewStatus === 'approved').length;
  const missingDocs = requiredDocs.filter((document) => document.reviewStatus !== 'approved').length;
  const note =
    submission.status === 'approved'
      ? 'Accepted instructor onboarding packet with completed approvals.'
      : submission.status === 'rejected'
        ? submission.rejectionReason?.trim() || 'Instructor onboarding was rejected during review.'
        : missingDocs > 0
          ? `${missingDocs} required onboarding document(s) still need approval`
          : 'Instructor onboarding packet is pending final review';

  const reviewerNotes = [
    submission.status === 'approved'
      ? `Instructor onboarding approved${submission.approvedAt ? ` on ${formatDate(submission.approvedAt)}` : ''}.`
      : submission.status === 'rejected'
        ? submission.rejectionReason?.trim() || 'Instructor onboarding was rejected.'
        : 'Instructor onboarding is still active in the review queue.',
    submission.agreedToTerms ? 'Terms and onboarding agreements were accepted.' : 'Terms acceptance is still missing.',
    submission.selectedModuleIds.length > 0
      ? `${submission.selectedModuleIds.length} teaching module(s) were selected for assignment.`
      : 'No teaching modules were selected yet.',
  ];

  return {
    kind: 'instructors',
    id: submission.id,
    name: submission.instructorName ?? submission.instructorId,
    email: submission.instructorEmail,
    status: submission.status,
    note,
    summary:
      submission.status === 'approved'
        ? 'Accepted instructor onboarding submission with modules, documents, and prior approval state.'
        : submission.status === 'rejected'
          ? 'Previously reviewed instructor onboarding submission with preserved rejection history.'
          : 'Active instructor onboarding submission still awaiting review decisions.',
    submittedAt: submission.submittedAt,
    approvedAt: submission.approvedAt,
    reviewedBy: submission.reviewedBy,
    primaryAction: submission.status === 'pending' ? 'Open instructor review' : 'View decision',
    secondaryAction: submission.status === 'approved' ? 'Accepted history' : submission.status === 'rejected' ? 'Rejected history' : 'Needs review',
    detailCards: [
      ['Type', 'Instructor onboarding'],
      ['Submitted', formatDate(submission.submittedAt)],
      ['Checklist', `${approvedDocs} of ${requiredDocs.length} received`],
      ['Modules', `${submission.selectedModuleIds.length} selected`],
    ],
    reviewerNotes,
    checklist: requiredDocs.map((document) => [
      document.name ?? document.documentId,
      document.reviewStatus === 'approved' ? 'Received' : 'Missing',
    ]),
    route: `/admin/applications/instructor-intake-submissions/${submission.id}`,
  };
}

export default function AdminApplicationsReviewPage() {
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const accessToken = session?.access_token;

  const [reviewType, setReviewType] = React.useState<ReviewType>('students');
  const [statusFilter, setStatusFilter] = React.useState<'all' | SubmissionStatus>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [studentSubmissions, setStudentSubmissions] = React.useState<StudentIntakeSubmission[]>([]);
  const [instructorSubmissions, setInstructorSubmissions] = React.useState<InstructorIntakeSubmission[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWorkspace = React.useCallback(async () => {
    if (!accessToken) {
      setStudentSubmissions([]);
      setInstructorSubmissions([]);
      setError('Sign in to load the application review workspace.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [studentResponse, instructorResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/${adminId}/intake/submissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/admins/${adminId}/instructor-intake/submissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
      ]);

      if (!studentResponse.ok || !instructorResponse.ok) {
        const studentPayload = studentResponse.ok ? null : await studentResponse.json().catch(() => null);
        const instructorPayload = instructorResponse.ok ? null : await instructorResponse.json().catch(() => null);
        throw new Error(
          studentPayload?.error?.message ||
            instructorPayload?.error?.message ||
            'Failed to load the application review workspace.',
        );
      }

      const studentPayload = await studentResponse.json();
      const instructorPayload = await instructorResponse.json();

      setStudentSubmissions(studentPayload.data ?? []);
      setInstructorSubmissions(instructorPayload.data ?? []);
    } catch (nextError) {
      setStudentSubmissions([]);
      setInstructorSubmissions([]);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load the application review workspace.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, adminId]);

  React.useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  const records = React.useMemo(() => {
    const source =
      reviewType === 'students'
        ? studentSubmissions.map(buildStudentRecord)
        : instructorSubmissions.map(buildInstructorRecord);

    return source
      .filter((record) => {
        if (statusFilter !== 'all' && record.status !== statusFilter) return false;
        const haystack = `${record.name} ${record.email ?? ''} ${record.note}`.toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      })
      .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime());
  }, [instructorSubmissions, reviewType, searchQuery, statusFilter, studentSubmissions]);

  React.useEffect(() => {
    if (records.length === 0) {
      setSelectedId('');
      return;
    }

    if (!records.some((record) => record.id === selectedId)) {
      setSelectedId(records[0]?.id ?? '');
    }
  }, [records, selectedId]);

  const selectedRecord = records.find((record) => record.id === selectedId) ?? null;
  const totals = React.useMemo(() => {
    const source = reviewType === 'students' ? studentSubmissions : instructorSubmissions;
    return {
      total: source.length,
      pending: source.filter((item) => item.status === 'pending').length,
      approved: source.filter((item) => item.status === 'approved').length,
      rejected: source.filter((item) => item.status === 'rejected').length,
    };
  }, [instructorSubmissions, reviewType, studentSubmissions]);

  return (
    <AdminShell
      title="Application Review Workspace"
      subtitle="Dynamic review workspace for students and instructors, including pending, approved, and rejected history."
      searchPlaceholder="Search review records..."
      topActions={
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="primary">{totals.total} Total</Badge>
          <Badge variant="warning">{totals.pending} Pending</Badge>
          <Badge variant="success">{totals.approved} Accepted</Badge>
          <Badge variant="error">{totals.rejected} Rejected</Badge>
          <Button variant="secondary" size="sm" onClick={() => void fetchWorkspace()}>
            <IconRefresh className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <section className="rounded-[20px] border border-border-subtle bg-surface p-4 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-full border border-border-subtle bg-surface-muted p-1">
              <button
                onClick={() => setReviewType('students')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  reviewType === 'students' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setReviewType('instructors')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  reviewType === 'instructors' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Instructors
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[260px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 rounded-full pl-10"
                  placeholder={reviewType === 'students' ? 'Search students...' : 'Search instructors...'}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | SubmissionStatus)}
                className="h-11 rounded-full border border-border-subtle bg-surface px-4 text-sm text-on-surface"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending review</option>
                <option value="approved">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        {error ? <div className="rounded-[18px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div> : null}

        {loading ? (
          <div className="rounded-[20px] border border-border-subtle bg-surface p-8 text-center text-on-surface-variant shadow-soft">
            Loading review workspace...
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section className="rounded-[20px] border border-border-subtle bg-surface-muted p-4">
              <div className="flex items-center justify-between px-2 pb-4">
                <h3 className="font-display text-[22px] font-semibold">
                  {reviewType === 'students' ? 'Student Queue' : 'Instructor Queue'}
                </h3>
                <Badge variant="info">{records.length} shown</Badge>
              </div>

              <div className="space-y-3">
                {records.length === 0 ? (
                  <div className="rounded-[18px] border border-border-subtle bg-surface p-4 text-sm text-on-surface-variant">
                    No records matched the current filter.
                  </div>
                ) : (
                  records.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedId(entry.id)}
                      className={`w-full rounded-[18px] border p-4 text-left shadow-soft transition ${
                        selectedRecord?.id === entry.id
                          ? 'border-primary bg-surface'
                          : 'border-border-subtle bg-surface/80 hover:border-primary/40 hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface">{entry.name}</p>
                          <p className="mt-1 text-sm leading-6 text-on-surface-variant">{entry.note}</p>
                          <p className="mt-2 text-xs text-on-surface-variant">{formatDate(entry.submittedAt)}</p>
                        </div>
                        <Badge variant={statusBadgeVariant(entry.status)}>{statusLabel(entry.status)}</Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              {selectedRecord ? (
                <>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <Badge variant={statusBadgeVariant(selectedRecord.status)}>{statusLabel(selectedRecord.status)}</Badge>
                      <h3 className="mt-4 font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
                        {selectedRecord.name}
                      </h3>
                      <p className="mt-2 text-sm text-on-surface-variant">{selectedRecord.summary}</p>
                      {selectedRecord.email ? (
                        <p className="mt-2 text-xs text-on-surface-variant">{selectedRecord.email}</p>
                      ) : null}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="rounded-[16px] px-5">
                        {selectedRecord.secondaryAction}
                      </Button>
                      <Button className="rounded-[16px] px-5" onClick={() => router.push(selectedRecord.route)}>
                        {selectedRecord.primaryAction}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {selectedRecord.detailCards.map(([label, value]) => (
                      <div key={label} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="rounded-[20px] border border-border-subtle bg-surface p-5">
                      <h4 className="font-display text-[20px] font-semibold">Review History</h4>
                      <div className="mt-4 space-y-4">
                        {selectedRecord.reviewerNotes.map((note) => (
                          <div
                            key={note}
                            className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-on-surface-variant"
                          >
                            {note}
                          </div>
                        ))}
                        <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-on-surface-variant">
                          Reviewed by: {selectedRecord.reviewedBy ?? 'Not assigned yet'}
                        </div>
                        <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-on-surface-variant">
                          Final decision date: {formatDate(selectedRecord.approvedAt ?? selectedRecord.submittedAt)}
                        </div>
                      </div>
                    </div>

                    <aside className="rounded-[20px] border border-border-subtle bg-surface-muted p-5">
                      <h4 className="font-display text-[20px] font-semibold">Checklist</h4>
                      <div className="mt-4 space-y-3">
                        {selectedRecord.checklist.length === 0 ? (
                          <div className="rounded-[16px] border border-border-subtle bg-surface p-3 text-sm text-on-surface-variant">
                            No required checklist items were found.
                          </div>
                        ) : (
                          selectedRecord.checklist.map(([label, status]) => (
                            <div
                              key={label}
                              className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface p-3"
                            >
                              <span className="text-sm font-medium text-on-surface">{label}</span>
                              <Badge variant={statusBadgeVariant(status)}>{status}</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </aside>
                  </div>
                </>
              ) : (
                <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-5 text-sm text-on-surface-variant">
                  Select a submission to review its details.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
