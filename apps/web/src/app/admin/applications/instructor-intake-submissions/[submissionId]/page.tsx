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

interface SubmittedDocument {
  documentId: string;
  name: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileUrl?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

interface InstructorIntakeSubmission {
  id: string;
  instructorId: string;
  instructorName?: string;
  instructorEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  questions: Array<{ questionId: string; prompt: string; answer: string }>;
  documents: SubmittedDocument[];
  agreedToTerms: boolean;
  selectedModuleIds: string[];
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export default function InstructorIntakeSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();

  const submissionId = params.submissionId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const [submission, setSubmission] = React.useState<InstructorIntakeSubmission | null>(null);
  const [moduleTitles, setModuleTitles] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
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
      const [submissionResponse, modulesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/${adminId}/instructor-intake/submissions/${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        }),
      ]);

      if (!submissionResponse.ok) {
        const payload = await submissionResponse.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch submission (${submissionResponse.status}).`);
      }

      const data = await submissionResponse.json();
      setSubmission(data.data);

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        const modules: Array<{ id: string; title: string }> = modulesData.data?.modules ?? [];
        setModuleTitles(Object.fromEntries(modules.map((module) => [module.id, module.title])));
      }
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
      setDocumentReviews({});
      return;
    }

    setDocumentReviews(
      Object.fromEntries(
        submission.documents
          .filter((document) => document.reviewStatus !== 'pending')
          .map((document) => [document.documentId, document.reviewStatus as 'approved' | 'rejected']),
      ),
    );
  }, [submission]);

  const requiredDocuments = submission ? submission.documents.filter((document) => document.required) : [];
  const reviewedRequiredDocumentCount = requiredDocuments.filter(
    (document) => documentReviews[document.documentId] === 'approved' || documentReviews[document.documentId] === 'rejected',
  ).length;
  const allRequiredDocumentsReviewed = requiredDocuments.length === reviewedRequiredDocumentCount;

  const handleApprove = async () => {
    if (!hasAuth || !session?.access_token || !submission) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/instructor-intake/submissions/${submission.id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: true, documentReviews }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to approve application (${response.status}).`);
      }

      router.push('/admin/applications?tab=instructor');
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
        `${API_BASE_URL}/admins/${adminId}/instructor-intake/submissions/${submission.id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: false, rejectionReason, documentReviews }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to reject application (${response.status}).`);
      }

      router.push('/admin/applications?tab=instructor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminShell
      title="Instructor Onboarding Submission"
      subtitle="Review onboarding answers, documents, and requested modules, then approve or reject."
      topActions={
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin/applications?tab=instructor')}>
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
              <h2 className="text-xl font-bold text-on-surface">{submission.instructorName ?? submission.instructorId}</h2>
              {submission.instructorEmail ? (
                <p className="text-xs text-on-surface-variant">{submission.instructorEmail}</p>
              ) : null}
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

          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-4 text-sm font-semibold text-on-surface-variant">Onboarding Answers</p>
            <div className="space-y-3">
              {submission.questions.map((question, idx) => (
                <div key={question.questionId} className="rounded border border-border-subtle bg-surface p-3 text-xs">
                  <p className="mb-2 font-semibold text-on-surface">Question {idx + 1}</p>
                  <p className="mb-2 text-sm text-on-surface">{question.prompt}</p>
                  <p>
                    <span className="text-on-surface-variant">Answer:</span>{' '}
                    <span className="text-on-surface">{question.answer || '(no answer)'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-4 text-sm font-semibold text-on-surface-variant">Terms and Requested Modules</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded bg-surface p-3">
                <p className="mb-1 text-xs text-on-surface-variant">Agreed to Terms</p>
                <Badge variant={submission.agreedToTerms ? 'success' : 'error'}>
                  {submission.agreedToTerms ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="rounded bg-surface p-3">
                <p className="mb-1 text-xs text-on-surface-variant">Requested Modules ({submission.selectedModuleIds.length})</p>
                {submission.selectedModuleIds.length === 0 ? (
                  <p className="text-sm text-on-surface">None selected</p>
                ) : (
                  <ul className="list-inside list-disc text-sm text-on-surface">
                    {submission.selectedModuleIds.map((moduleId) => (
                      <li key={moduleId}>{moduleTitles[moduleId] ?? moduleId}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

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

          {submission.status === 'rejected' && submission.rejectionReason && (
            <div className="rounded-lg border border-error/20 bg-error/5 p-4">
              <p className="mb-2 text-sm font-semibold text-error">Rejection Reason</p>
              <p className="text-sm text-on-surface">{submission.rejectionReason}</p>
            </div>
          )}

          {submission.status === 'pending' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-4 text-sm text-on-surface-variant">
                Approve or reject every required document before final approval. Once approved, the instructor's
                portal unlocks immediately.
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
                <Button variant="secondary" onClick={() => router.push('/admin/applications?tab=instructor')}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Application'}
                </Button>
                <Button onClick={handleApprove} disabled={actionLoading || !allRequiredDocumentsReviewed}>
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
