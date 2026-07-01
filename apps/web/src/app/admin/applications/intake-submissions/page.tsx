'use client';

import * as React from 'react';
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  entranceExamScore: number | null;
  entranceExamPassed: boolean | null;
  passingScore: number;
  questions: Array<{
    questionId: string;
    prompt: string;
    type: 'choice' | 'text';
    preferredAnswer: string;
    options: Array<{ label: string; value: string }>;
    studentAnswer: string;
    reviewStatus: 'pending' | 'correct' | 'wrong';
  }>;
  enrollmentData: Record<string, any>;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export default function IntakeSubmissionsPage() {
  const { session, syncedUser } = useAuth();
  const [submissions, setSubmissions] = React.useState<StudentIntakeSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = React.useState<StudentIntakeSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [questionReviews, setQuestionReviews] = React.useState<Record<string, 'correct' | 'wrong'>>({});

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchSubmissions = React.useCallback(async () => {
    if (!hasAuth || !session?.access_token) {
      setSubmissions([]);
      setError('Sign in as an admin to load intake submissions.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/intake/pending-submissions`, {
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
        throw new Error(payload?.error?.message ?? `Failed to fetch submissions (${response.status}).`);
      }

      const data = await response.json();
      setSubmissions(data.data || []);
    } catch (err) {
      setSubmissions([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  }, [adminId, hasAuth, session?.access_token]);

  React.useEffect(() => {
    if (!hasAuth) return;
    void fetchSubmissions();
  }, [fetchSubmissions, hasAuth]);

  React.useEffect(() => {
    if (!selectedSubmission) {
      setQuestionReviews({});
      return;
    }

    setQuestionReviews(
      Object.fromEntries(
        selectedSubmission.questions
          .filter((question) => question.reviewStatus !== 'pending')
          .map((question) => [question.questionId, question.reviewStatus]),
      ),
    );
  }, [selectedSubmission]);

  const reviewedQuestionCount = selectedSubmission
    ? selectedSubmission.questions.filter(
        (question) => questionReviews[question.questionId] === 'correct' || questionReviews[question.questionId] === 'wrong',
      ).length
    : 0;
  const allQuestionsReviewed = selectedSubmission ? reviewedQuestionCount === selectedSubmission.questions.length : false;
  const provisionalScore = selectedSubmission
    ? selectedSubmission.questions.filter((question) => questionReviews[question.questionId] === 'correct').length
    : 0;
  const provisionalPassed = selectedSubmission ? provisionalScore >= selectedSubmission.passingScore : false;

  const handleApprove = async (submissionId: string) => {
    if (!hasAuth || !session?.access_token) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/intake/submissions/${submissionId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: true, questionReviews }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to approve application (${response.status}).`);
      }

      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
      setSelectedSubmission(null);
      void fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!hasAuth || !session?.access_token || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/intake/submissions/${submissionId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approved: false,
            rejectionReason,
            questionReviews,
          }),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to reject application (${response.status}).`);
      }

      setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'rejected' } : s));
      setSelectedSubmission(null);
      setRejectionReason('');
      void fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub =>
    sub.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  return (
    <>
      <AdminShell
        title="Intake Submissions"
        subtitle="Review and approve student entrance exam submissions and enrollment applications"
        topActions={
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="primary">{submissions.length} Total</Badge>
            <Badge variant="warning">{pendingCount} Pending</Badge>
            <Badge variant="success">{approvedCount} Approved</Badge>
            <Badge variant="error">{rejectedCount} Rejected</Badge>
            <Button variant="secondary" size="sm" onClick={() => void fetchSubmissions()}>
              Refresh
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
              {error}
            </div>
          ) : null}

          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Search by student ID..."
              className="h-11 rounded-lg pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">No submissions found</div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className="rounded-lg border border-border-subtle bg-surface-muted p-4 cursor-pointer hover:border-primary/50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-on-surface">Student {submission.studentId}</p>
                        <Badge
                          variant={
                            submission.status === 'approved'
                              ? 'success'
                              : submission.status === 'rejected'
                                ? 'error'
                                : 'warning'
                          }
                        >
                          {submission.status === 'pending' && 'Pending Review'}
                          {submission.status === 'approved' && 'Approved'}
                          {submission.status === 'rejected' && 'Rejected'}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm text-on-surface-variant md:grid-cols-3">
                        <p>
                          Exam Score:{' '}
                          {submission.entranceExamScore !== null
                            ? `${submission.entranceExamScore}/${submission.questions.length}`
                            : 'Pending review'}
                        </p>
                        <p>
                          Exam Status:{' '}
                          {submission.entranceExamPassed === null
                            ? 'Awaiting question review'
                            : submission.entranceExamPassed
                              ? 'Passed threshold'
                              : 'Below threshold'}
                        </p>
                        <p>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      className="shrink-0 p-2 rounded-lg hover:bg-primary/10 transition"
                      title="View details"
                    >
                      <IconCheck className="size-5 text-on-surface-variant" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminShell>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-surface p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Student {selectedSubmission.studentId}</h2>
                <p className="text-sm text-on-surface-variant mt-1">Intake Submission Review</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface-variant mb-2">Status</p>
                <Badge
                  variant={
                    selectedSubmission.status === 'approved'
                      ? 'success'
                      : selectedSubmission.status === 'rejected'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {selectedSubmission.status === 'pending' && 'Pending Review'}
                  {selectedSubmission.status === 'approved' && 'Approved'}
                  {selectedSubmission.status === 'rejected' && 'Rejected'}
                </Badge>
              </div>

              {/* Entrance Exam Results */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface-variant mb-4">Entrance Exam Results</p>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <p className="text-xs text-on-surface-variant">Score</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">
                      {selectedSubmission.entranceExamScore !== null
                        ? `${selectedSubmission.entranceExamScore}/${selectedSubmission.questions.length}`
                        : `${provisionalScore}/${selectedSubmission.questions.length}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Status</p>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedSubmission.entranceExamPassed === null
                            ? provisionalPassed && allQuestionsReviewed
                              ? 'success'
                              : allQuestionsReviewed
                                ? 'error'
                                : 'warning'
                            : selectedSubmission.entranceExamPassed
                              ? 'success'
                              : 'error'
                        }
                      >
                        {selectedSubmission.entranceExamPassed === null
                          ? allQuestionsReviewed
                            ? provisionalPassed
                              ? 'Ready to approve'
                              : 'Reviewed below threshold'
                            : 'Awaiting review'
                          : selectedSubmission.entranceExamPassed
                            ? 'Passed threshold'
                            : 'Below threshold'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedSubmission.questions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-on-surface-variant mb-3">
                      Answer Review ({reviewedQuestionCount}/{selectedSubmission.questions.length} marked)
                    </p>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedSubmission.questions.map((question, idx) => {
                        const review = questionReviews[question.questionId];

                        return (
                          <div key={question.questionId} className="rounded border border-border-subtle bg-surface p-3 text-xs">
                            <p className="mb-2 font-semibold text-on-surface">Question {idx + 1}</p>
                            <p className="mb-2 text-sm text-on-surface">{question.prompt}</p>
                            <div className="space-y-1">
                              <p>
                                <span className="text-on-surface-variant">Preferred answer:</span>{' '}
                                <span className="text-on-surface">{question.preferredAnswer}</span>
                              </p>
                              <p>
                                <span className="text-on-surface-variant">Student answer:</span>{' '}
                                <span className="text-on-surface">{question.studentAnswer || '(no answer)'}</span>
                              </p>
                            </div>

                            {selectedSubmission.status === 'pending' ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuestionReviews((current) => ({
                                      ...current,
                                      [question.questionId]: 'correct',
                                    }))
                                  }
                                  className={cn(
                                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold transition',
                                    review === 'correct'
                                      ? 'border-success bg-success text-white'
                                      : 'border-border-subtle bg-surface text-on-surface-variant hover:border-success/40',
                                  )}
                                >
                                  <IconCircleCheck className="size-4" />
                                  Correct
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuestionReviews((current) => ({
                                      ...current,
                                      [question.questionId]: 'wrong',
                                    }))
                                  }
                                  className={cn(
                                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold transition',
                                    review === 'wrong'
                                      ? 'border-error bg-error text-white'
                                      : 'border-border-subtle bg-surface text-on-surface-variant hover:border-error/40',
                                  )}
                                >
                                  <IconCircleX className="size-4" />
                                  Wrong
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <Badge
                                  variant={
                                    question.reviewStatus === 'correct'
                                      ? 'success'
                                      : question.reviewStatus === 'wrong'
                                        ? 'error'
                                        : 'warning'
                                  }
                                >
                                  {question.reviewStatus === 'correct'
                                    ? 'Marked Correct'
                                    : question.reviewStatus === 'wrong'
                                      ? 'Marked Wrong'
                                      : 'Not Reviewed'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Enrollment Data */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface-variant mb-4">Enrollment Information</p>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">Step</p>
                      <p className="font-semibold text-on-surface">{selectedSubmission.enrollmentData.step || '-'}</p>
                    </div>
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">HHA Add-on</p>
                      <p className="font-semibold text-on-surface">{selectedSubmission.enrollmentData.hhaAddon ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">Scrub Top</p>
                      <p className="font-semibold text-on-surface">{selectedSubmission.enrollmentData.scrubTop || '-'}</p>
                    </div>
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">Scrub Bottom</p>
                      <p className="font-semibold text-on-surface">{selectedSubmission.enrollmentData.scrubBottom || '-'}</p>
                    </div>
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">Shipping</p>
                      <p className="font-semibold text-on-surface capitalize">{selectedSubmission.enrollmentData.shipping || '-'}</p>
                    </div>
                    <div className="bg-surface p-3 rounded">
                      <p className="text-xs text-on-surface-variant mb-1">Test at Daisy</p>
                      <p className="font-semibold text-on-surface">{selectedSubmission.enrollmentData.wantsToTestAtDaisy !== null ? (selectedSubmission.enrollmentData.wantsToTestAtDaisy ? 'Yes' : 'No') : '-'}</p>
                    </div>
                  </div>

                  <div className="bg-surface p-3 rounded">
                    <p className="text-xs text-on-surface-variant mb-1">Agreements</p>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface">{selectedSubmission.enrollmentData.agreements?.ip ? '✓' : '○'} IP/Curriculum</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface">{selectedSubmission.enrollmentData.agreements?.refund ? '✓' : '○'} Refund Policy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface">{selectedSubmission.enrollmentData.agreements?.conduct ? '✓' : '○'} Conduct Standards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface">{selectedSubmission.enrollmentData.agreements?.lateFee ? '✓' : '○'} Late Fee Policy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Date */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface-variant mb-2">Submitted</p>
                <p className="text-on-surface">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedSubmission.status === 'rejected' && selectedSubmission.rejectionReason && (
                <div className="rounded-lg border border-error/20 bg-error/5 p-4">
                  <p className="text-sm font-semibold text-error mb-2">Rejection Reason</p>
                  <p className="text-on-surface text-sm">{selectedSubmission.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border-subtle bg-surface-muted p-4 text-sm text-on-surface-variant">
                    Mark every question as correct or wrong before final approval. Once this intake is approved, no additional approval is required to unlock the student.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why you're rejecting this application..."
                      className="h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedSubmission.id)}
                      disabled={!rejectionReason.trim() || actionLoading}
                    >
                      {actionLoading ? 'Rejecting...' : 'Reject Application'}
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      disabled={actionLoading || !allQuestionsReviewed}
                    >
                      {actionLoading ? 'Approving...' : 'Finalize Approval'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
