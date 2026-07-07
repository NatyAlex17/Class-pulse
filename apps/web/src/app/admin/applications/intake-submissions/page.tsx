'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  entranceExamScore: number | null;
  entranceExamPassed: boolean | null;
  passingScore: number;
  questions: Array<{ questionId: string; reviewStatus: 'pending' | 'correct' | 'wrong' }>;
  documents: Array<{ documentId: string; required: boolean; reviewStatus: 'pending' | 'approved' | 'rejected' }>;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

function statusBadgeVariant(status: StudentIntakeSubmission['status']) {
  return status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
}

function statusLabel(status: StudentIntakeSubmission['status']) {
  return status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending Review';
}

export default function IntakeSubmissionsPage() {
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [submissions, setSubmissions] = React.useState<StudentIntakeSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

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
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/intake/submissions`, {
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

  const filteredSubmissions = submissions.filter((sub) =>
    `${sub.studentName ?? ''} ${sub.studentId}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  const columns: DataTableColumn<StudentIntakeSubmission>[] = [
    {
      id: 'student',
      header: 'Student',
      cell: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.studentName ?? row.studentId}</p>
          {row.studentName ? <p className="text-xs text-on-surface-variant">{row.studentId}</p> : null}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={statusBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      id: 'exam',
      header: 'Exam Score',
      cell: (row) => (
        <span>
          {row.entranceExamScore !== null ? `${row.entranceExamScore}/${row.questions.length}` : 'Pending review'}
        </span>
      ),
    },
    {
      id: 'documents',
      header: 'Documents',
      cell: (row) => {
        const required = row.documents.filter((document) => document.required);
        const approved = required.filter((document) => document.reviewStatus === 'approved').length;
        const rejected = required.some((document) => document.reviewStatus === 'rejected');
        return (
          <Badge variant={rejected ? 'error' : approved === required.length && required.length > 0 ? 'success' : 'warning'}>
            {approved}/{required.length} approved
          </Badge>
        );
      },
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: (row) => <span>{new Date(row.submittedAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <AdminShell
      title="Intake Submissions"
      subtitle="Review and approve student entrance exam submissions and uploaded documents"
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
          <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Search by student ID..."
            className="h-11 rounded-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant">Loading submissions...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredSubmissions}
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(`/admin/applications/intake-submissions/${row.id}`)}
            mobileCardTitle={(row) => row.studentName ?? row.studentId}
            mobileCardSubtitle={(row) => statusLabel(row.status)}
            emptyState="No intake submissions found."
          />
        )}
      </div>
    </AdminShell>
  );
}
