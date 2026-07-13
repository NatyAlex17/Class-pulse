'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconArrowLeft, IconCircleCheck, IconCircleX, IconEye } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface SubmittedQuestion {
  questionId: string;
  prompt: string;
  type: 'choice' | 'text';
  preferredAnswer: string;
  options: Array<{ label: string; value: string }>;
  studentAnswer: string;
  reviewStatus: 'pending' | 'correct' | 'wrong';
}

interface SubmittedDocument {
  documentId: string;
  name: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileUrl?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

interface EnrollmentData {
  step?: number;
  hhaAddon?: boolean;
  scrubTop?: string;
  scrubBottom?: string;
  shipping?: string;
  wantsToTestAtDaisy?: boolean | null;
  agreements?: {
    ip?: boolean;
    refund?: boolean;
    conduct?: boolean;
    lateFee?: boolean;
  };
}

interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  entranceExamScore: number | null;
  entranceExamPassed: boolean | null;
  passingScore: number;
  questions: SubmittedQuestion[];
  documents: SubmittedDocument[];
  enrollmentData: EnrollmentData;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export default function IntakeSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();

  const submissionId = params.submissionId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const [submission, setSubmission] = React.useState<StudentIntakeSubmission | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [questionReviews, setQuestionReviews] = React.useState<Record<string, 'correct' | 'wrong'>>({});
  const [documentReviews, setDocumentReviews] = React.useState<Record<string, 'approved' | 'rejected'>>({});
  const [previewDocument, setPreviewDocument] = React.useState<{ title: string; fileUrl: string } | null>(null);

  const fetchSubmission = React.useCallback(async () => {
    if (!hasAuth || !session?.access_token) {
      setError('Sign in as an admin to load this submission.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/intake/submissions/${submissionId}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch submission (${response.status}).`);
      }

      const data = await response.json();
      setSubmission(data.data);
    } catch (err) {
      setSubmission(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch submission.');
    } finally {
      setLoading(false);
    }
  }, [adminId, hasAuth, session?.access_token, submissionId]);

  React.useEffect(() => {
    if (!hasAuth) return;
    void fetchSubmission();
  }, [fetchSubmission, hasAuth]);

  React.useEffect(() => {
    if (!submission) {
      setQuestionReviews({});
      setDocumentReviews({});
      return;
    }

    setQuestionReviews(
      Object.fromEntries(
        submission.questions
          .filter((question) => question.reviewStatus !== 'pending')
          .map((question) => [question.questionId, question.reviewStatus as 'correct' | 'wrong']),
      ),
    );
    setDocumentReviews(
      Object.fromEntries(
        submission.documents
          .filter((document) => document.reviewStatus !== 'pending')
          .map((document) => [document.documentId, document.reviewStatus as 'approved' | 'rejected']),
      ),
    );
  }, [submission]);

  const reviewedQuestionCount = submission
    ? submission.questions.filter(
        (question) => questionReviews[question.questionId] === 'correct' || questionReviews[question.questionId] === 'wrong',
      ).length
    : 0;
  const allQuestionsReviewed = submission ? reviewedQuestionCount === submission.questions.length : false;
  const provisionalScore = submission
    ? submission.questions.filter((question) => questionReviews[question.questionId] === 'correct').length
    : 0;
  const provisionalPassed = submission ? provisionalScore >= submission.passingScore : false;

  const requiredDocuments = submission ? submission.documents.filter((document) => document.required) : [];
  const reviewedRequiredDocumentCount = requiredDocuments.filter(
    (document) => documentReviews[document.documentId] === 'approved' || documentReviews[document.documentId] === 'rejected',
  ).length;
  const allRequiredDocumentsReviewed = requiredDocuments.length === reviewedRequiredDocumentCount;

  const readyToApprove = allQuestionsReviewed && allRequiredDocumentsReviewed;

  const handleApprove = async () => {
    if (!hasAuth || !session?.access_token || !submission) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/intake/submissions/${submission.id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: true, questionReviews, documentReviews }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to approve application (${response.status}).`);
      }

      router.push('/admin/applications?tab=intake');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!hasAuth || !session?.access_token || !submission || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/intake/submissions/${submission.id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: false, rejectionReason, questionReviews, documentReviews }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to reject application (${response.status}).`);
      }

      router.push('/admin/applications?tab=intake');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell
      title="Intake Submission"
      subtitle="Review the entrance exam and required documents, then approve or reject."
      topActions={
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin/applications?tab=intake')}>
          <IconArrowLeft className="size-4" />
          Back to submissions
        </Button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-8 text-center text-on-surface-variant">Loading submission...</div>
      ) : !submission ? (
        <div className="py-8 text-center text-on-surface-variant">Submission not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-muted p-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{submission.studentName ?? submission.studentId}</h2>
              <p className="text-xs text-on-surface-variant">{submission.studentId}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            <Badge
              variant={
                submission.status === 'approved' ? 'success' : submission.status === 'rejected' ? 'error' : 'warning'
              }
            >
              {submission.status === 'pending' && 'Pending Review'}
              {submission.status === 'approved' && 'Approved'}
              {submission.status === 'rejected' && 'Rejected'}
            </Badge>
          </div>

          {/* Entrance Exam Results */}
          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-4 text-sm font-semibold text-on-surface-variant">Entrance Exam Results</p>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-on-surface-variant">Score</p>
                <p className="mt-1 text-2xl font-bold text-on-surface">
                  {submission.entranceExamScore !== null
                    ? `${submission.entranceExamScore}/${submission.questions.length}`
                    : `${provisionalScore}/${submission.questions.length}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Status</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      submission.entranceExamPassed === null
                        ? provisionalPassed && allQuestionsReviewed
                          ? 'success'
                          : allQuestionsReviewed
                            ? 'error'
                            : 'warning'
                        : submission.entranceExamPassed
                          ? 'success'
                          : 'error'
                    }
                  >
                    {submission.entranceExamPassed === null
                      ? allQuestionsReviewed
                        ? provisionalPassed
                          ? 'Ready to approve'
                          : 'Reviewed below threshold'
                        : 'Awaiting review'
                      : submission.entranceExamPassed
                        ? 'Passed threshold'
                        : 'Below threshold'}
                  </Badge>
                </div>
              </div>
            </div>

            {submission.questions.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-xs font-semibold text-on-surface-variant">
                  Answer Review ({reviewedQuestionCount}/{submission.questions.length} marked)
                </p>
                <div className="space-y-3">
                  {submission.questions.map((question, idx) => {
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

                        {submission.status === 'pending' ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionReviews((current) => ({ ...current, [question.questionId]: 'correct' }))
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
                                setQuestionReviews((current) => ({ ...current, [question.questionId]: 'wrong' }))
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

          {/* Documents */}
          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-1 text-sm font-semibold text-on-surface-variant">Uploaded Documents</p>
            <p className="mb-4 text-xs text-on-surface-variant">
              Required documents ({reviewedRequiredDocumentCount}/{requiredDocuments.length} reviewed)
            </p>
            {submission.documents.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No documents were required for this submission.</p>
            ) : (
              <div className="space-y-3">
                {submission.documents.map((document) => {
                  const review = documentReviews[document.documentId];
                  return (
                    <div key={document.documentId} className="rounded border border-border-subtle bg-surface p-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-on-surface">{document.name}</p>
                        <Badge variant={document.required ? 'warning' : 'neutral'}>
                          {document.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-on-surface-variant">{document.description}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {document.fileUrl ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-9 rounded-lg px-3 text-xs"
                            onClick={() =>
                              setPreviewDocument({
                                title: document.fileName ?? document.name,
                                fileUrl: document.fileUrl as string,
                              })
                            }
                          >
                            <IconEye className="size-4" />
                            View
                          </Button>
                        ) : (
                          <Badge variant="error">Not uploaded</Badge>
                        )}

                        {submission.status === 'pending' && document.fileUrl ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setDocumentReviews((current) => ({ ...current, [document.documentId]: 'approved' }))
                              }
                              className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold transition',
                                review === 'approved'
                                  ? 'border-success bg-success text-white'
                                  : 'border-border-subtle bg-surface text-on-surface-variant hover:border-success/40',
                              )}
                            >
                              <IconCircleCheck className="size-4" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDocumentReviews((current) => ({ ...current, [document.documentId]: 'rejected' }))
                              }
                              className={cn(
                                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold transition',
                                review === 'rejected'
                                  ? 'border-error bg-error text-white'
                                  : 'border-border-subtle bg-surface text-on-surface-variant hover:border-error/40',
                              )}
                            >
                              <IconCircleX className="size-4" />
                              Reject
                            </button>
                          </>
                        ) : document.reviewStatus !== 'pending' ? (
                          <Badge variant={document.reviewStatus === 'approved' ? 'success' : 'error'}>
                            {document.reviewStatus === 'approved' ? 'Approved' : 'Rejected'}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrollment Data */}
          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-4 text-sm font-semibold text-on-surface-variant">Enrollment Information</p>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">Step</p>
                  <p className="font-semibold text-on-surface">{submission.enrollmentData.step || '-'}</p>
                </div>
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">HHA Add-on</p>
                  <p className="font-semibold text-on-surface">{submission.enrollmentData.hhaAddon ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">Scrub Top</p>
                  <p className="font-semibold text-on-surface">{submission.enrollmentData.scrubTop || '-'}</p>
                </div>
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">Scrub Bottom</p>
                  <p className="font-semibold text-on-surface">{submission.enrollmentData.scrubBottom || '-'}</p>
                </div>
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">Shipping</p>
                  <p className="font-semibold capitalize text-on-surface">{submission.enrollmentData.shipping || '-'}</p>
                </div>
                <div className="rounded bg-surface p-3">
                  <p className="mb-1 text-xs text-on-surface-variant">Test at Daisy</p>
                  <p className="font-semibold text-on-surface">
                    {submission.enrollmentData.wantsToTestAtDaisy !== null
                      ? submission.enrollmentData.wantsToTestAtDaisy
                        ? 'Yes'
                        : 'No'
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="rounded bg-surface p-3">
                <p className="mb-1 text-xs text-on-surface-variant">Agreements</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface">
                      {submission.enrollmentData.agreements?.ip ? '✓' : '○'} IP/Curriculum
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface">
                      {submission.enrollmentData.agreements?.refund ? '✓' : '○'} Refund Policy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface">
                      {submission.enrollmentData.agreements?.conduct ? '✓' : '○'} Conduct Standards
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface">
                      {submission.enrollmentData.agreements?.lateFee ? '✓' : '○'} Late Fee Policy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {submission.status === 'rejected' && submission.rejectionReason && (
            <div className="rounded-lg border border-error/20 bg-error/5 p-4">
              <p className="mb-2 text-sm font-semibold text-error">Rejection Reason</p>
              <p className="text-sm text-on-surface">{submission.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          {submission.status === 'pending' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4 text-sm text-on-surface-variant">
                Mark every question as correct or wrong, and approve or reject every required document, before
                final approval. Once this intake is approved, no additional approval is required to unlock the
                student.
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Rejection Reason (if rejecting)
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why you're rejecting this application..."
                  className="h-24"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => router.push('/admin/applications?tab=intake')}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Application'}
                </Button>
                <Button onClick={handleApprove} disabled={actionLoading || !readyToApprove}>
                  {actionLoading ? 'Approving...' : 'Finalize Approval'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {previewDocument ? (
        <DocumentPreviewModal
          title={previewDocument.title}
          fileUrl={previewDocument.fileUrl}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </AdminShell>
  );
}
