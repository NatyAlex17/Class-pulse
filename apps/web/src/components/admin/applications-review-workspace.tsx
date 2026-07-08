'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconSearch } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApplicationsTab = 'intake' | 'instructor';

interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  studentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  entranceExamScore: number | null;
  questions: Array<{ questionId: string; reviewStatus: 'pending' | 'correct' | 'wrong' }>;
  documents: Array<{ documentId: string; required: boolean; reviewStatus: 'pending' | 'approved' | 'rejected' }>;
  submittedAt: string;
}

interface InstructorIntakeSubmission {
  id: string;
  instructorId: string;
  instructorName?: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: Array<{ documentId: string; required: boolean; reviewStatus: 'pending' | 'approved' | 'rejected' }>;
  selectedModuleIds: string[];
  submittedAt: string;
}

function statusBadgeVariant(status: 'pending' | 'approved' | 'rejected') {
  return status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
}

function statusLabel(status: 'pending' | 'approved' | 'rejected') {
  return status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending Review';
}

export function ApplicationsReviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, syncedUser } = useAuth();

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const accessToken = session?.access_token;
  const activeTab: ApplicationsTab = searchParams.get('tab') === 'instructor' ? 'instructor' : 'intake';

  const [studentSubmissions, setStudentSubmissions] = React.useState<StudentIntakeSubmission[]>([]);
  const [instructorSubmissions, setInstructorSubmissions] = React.useState<InstructorIntakeSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const setTab = React.useCallback(
    (tab: ApplicationsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`/admin/applications?${params.toString()}`);
    },
    [router, searchParams],
  );

  const fetchWorkspace = React.useCallback(async () => {
    if (!accessToken) {
      setStudentSubmissions([]);
      setInstructorSubmissions([]);
      setError('Sign in as an admin to load applications review.');
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

      if (!studentResponse.ok) {
        const payload = await studentResponse.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch intake submissions (${studentResponse.status}).`);
      }

      if (!instructorResponse.ok) {
        const payload = await instructorResponse.json().catch(() => null);
        throw new Error(
          payload?.error?.message ?? `Failed to fetch instructor onboarding submissions (${instructorResponse.status}).`,
        );
      }

      const studentPayload = await studentResponse.json();
      const instructorPayload = await instructorResponse.json();

      setStudentSubmissions(studentPayload.data || []);
      setInstructorSubmissions(instructorPayload.data || []);
    } catch (err) {
      setStudentSubmissions([]);
      setInstructorSubmissions([]);
      setError(err instanceof Error ? err.message : 'Failed to load applications review.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, adminId]);

  React.useEffect(() => {
    void fetchWorkspace();
  }, [fetchWorkspace]);

  const filteredStudentSubmissions = studentSubmissions.filter((sub) =>
    `${sub.studentName ?? ''} ${sub.studentId}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredInstructorSubmissions = instructorSubmissions.filter((sub) =>
    `${sub.instructorName ?? ''} ${sub.instructorId}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentData = activeTab === 'intake' ? studentSubmissions : instructorSubmissions;
  const currentTotal = currentData.length;
  const currentPending = currentData.filter((item) => item.status === 'pending').length;
  const currentApproved = currentData.filter((item) => item.status === 'approved').length;
  const currentRejected = currentData.filter((item) => item.status === 'rejected').length;

  const intakeColumns: DataTableColumn<StudentIntakeSubmission>[] = [
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
      cell: (row) => (row.entranceExamScore !== null ? `${row.entranceExamScore}/${row.questions.length}` : 'Pending review'),
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
      cell: (row) => new Date(row.submittedAt).toLocaleDateString(),
    },
  ];

  const instructorColumns: DataTableColumn<InstructorIntakeSubmission>[] = [
    {
      id: 'instructor',
      header: 'Instructor',
      cell: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.instructorName ?? row.instructorId}</p>
          {row.instructorName ? <p className="text-xs text-on-surface-variant">{row.instructorId}</p> : null}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={statusBadgeVariant(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      id: 'modules',
      header: 'Modules Requested',
      cell: (row) => row.selectedModuleIds.length,
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
      cell: (row) => new Date(row.submittedAt).toLocaleDateString(),
    },
  ];

  return (
    <AdminShell
      title="Applications Review"
      subtitle="Monitor student intake submissions and instructor onboarding approvals from one workspace."
      searchPlaceholder="Search applications..."
      topActions={
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="primary">{currentTotal} Total</Badge>
          <Badge variant="warning">{currentPending} Pending</Badge>
          <Badge variant="success">{currentApproved} Approved</Badge>
          <Badge variant="error">{currentRejected} Rejected</Badge>
          <Button variant="secondary" size="sm" onClick={() => void fetchWorkspace()}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-border-subtle">
          <button
            onClick={() => setTab('intake')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'intake'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Intake Submissions
          </button>
          <button
            onClick={() => setTab('instructor')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'instructor'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Instructor Onboarding
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder={
              activeTab === 'intake' ? 'Search by student name or ID...' : 'Search by instructor name or ID...'
            }
            className="h-11 rounded-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant">Loading submissions...</div>
        ) : activeTab === 'intake' ? (
          <DataTable
            columns={intakeColumns}
            data={filteredStudentSubmissions}
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(`/admin/applications/intake-submissions/${row.id}`)}
            mobileCardTitle={(row) => row.studentName ?? row.studentId}
            mobileCardSubtitle={(row) => statusLabel(row.status)}
            emptyState="No intake submissions found."
          />
        ) : (
          <DataTable
            columns={instructorColumns}
            data={filteredInstructorSubmissions}
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(`/admin/applications/instructor-intake-submissions/${row.id}`)}
            mobileCardTitle={(row) => row.instructorName ?? row.instructorId}
            mobileCardSubtitle={(row) => statusLabel(row.status)}
            emptyState="No instructor onboarding submissions found."
          />
        )}
      </div>
    </AdminShell>
  );
}

export default ApplicationsReviewWorkspace;
