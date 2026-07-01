'use client';

import * as React from 'react';
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconSearch,
  IconDownload,
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
  entranceExamPassed: boolean;
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
  const [selectedSubmission, setSelectedSubmission] = React.useState<StudentIntakeSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  React.useEffect(() => {
    if (!hasAuth) return;

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/intake/pending-submissions`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [hasAuth, adminId, session?.access_token]);

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
          body: JSON.stringify({ approved: true }),
        }
      );

      if (response.ok) {
        setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Failed to approve:', err);
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
          }),
        }
      );

      if (response.ok) {
        setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: 'rejected' } : s));
        setSelectedSubmission(null);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Failed to reject:', err);
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
          </div>
        }
      >
        <div className="space-y-6">
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
                        <p>Exam Score: {submission.entranceExamScore !== null ? `${submission.entranceExamScore}/6` : 'N/A'}</p>
                        <p>Exam Status: {submission.entranceExamPassed ? 'Passed' : 'Failed'}</p>
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
                        ? `${selectedSubmission.entranceExamScore}/6`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Status</p>
                    <div className="mt-1">
                      <Badge variant={selectedSubmission.entranceExamPassed ? 'success' : 'error'}>
                        {selectedSubmission.entranceExamPassed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedSubmission.studentAnswers && Object.keys(selectedSubmission.studentAnswers).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-on-surface-variant mb-3">Answer Review</p>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(selectedSubmission.studentAnswers).map(([questionId, studentAnswer], idx) => (
                        <div key={questionId} className="text-xs bg-surface p-3 rounded border border-border-subtle">
                          <p className="font-semibold text-on-surface mb-2">Question {idx + 1}</p>
                          <div className="space-y-1">
                            <p><span className="text-on-surface-variant">Student Answer:</span> <span className="text-on-surface">{studentAnswer || '(no answer)'}</span></p>
                          </div>
                        </div>
                      ))}
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
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Approving...' : 'Approve Application'}
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
