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

type ApplicationsTab = 'intake' | 'instructor' | 'incomplete';

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

interface IncompleteOnboardingUser {
  id: string;
  role: 'student' | 'instructor';
  fullName: string;
  email: string;
  workflowStage: string;
  registeredAt?: string;
}

const WORKFLOW_STAGE_LABELS: Record<string, string> = {
  entrance_exam: 'Entrance Exam',
  enrollment_wizard: 'Enrollment Wizard',
  onboarding: 'Onboarding Questions',
};

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
  const tabParam = searchParams.get('tab');
  const activeTab: ApplicationsTab =
    tabParam === 'instructor' ? 'instructor' : tabParam === 'incomplete' ? 'incomplete' : 'intake';

  const [studentSubmissions, setStudentSubmissions] = React.useState<StudentIntakeSubmission[]>([]);
  const [instructorSubmissions, setInstructorSubmissions] = React.useState<InstructorIntakeSubmission[]>([]);
  const [incompleteUsers, setIncompleteUsers] = React.useState<IncompleteOnboardingUser[]>([]);
  const [copiedEmails, setCopiedEmails] = React.useState(false);
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
      setIncompleteUsers([]);
      setError('Sign in as an admin to load applications review.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [studentResponse, instructorResponse, incompleteResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/${adminId}/intake/submissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/admins/${adminId}/instructor-intake/submissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/admins/${adminId}/onboarding/incomplete`, {
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

      if (!incompleteResponse.ok) {
        const payload = await incompleteResponse.json().catch(() => null);
        throw new Error(
          payload?.error?.message ?? `Failed to fetch incomplete onboarding list (${incompleteResponse.status}).`,
        );
      }

      const studentPayload = await studentResponse.json();
      const instructorPayload = await instructorResponse.json();
      const incompletePayload = await incompleteResponse.json();

      setStudentSubmissions(studentPayload.data || []);
      setInstructorSubmissions(instructorPayload.data || []);
      setIncompleteUsers([
        ...(incompletePayload.data?.students || []),
        ...(incompletePayload.data?.instructors || []),
      ]);
    } catch (err) {
      setStudentSubmissions([]);
      setInstructorSubmissions([]);
      setIncompleteUsers([]);
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

  const filteredIncompleteUsers = incompleteUsers.filter((user) =>
    `${user.fullName} ${user.email} ${user.id}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentSubmissions = activeTab === 'instructor' ? instructorSubmissions : studentSubmissions;
  const currentTotal = activeTab === 'incomplete' ? incompleteUsers.length : currentSubmissions.length;
  const currentPending = currentSubmissions.filter((item) => item.status === 'pending').length;
  const currentApproved = currentSubmissions.filter((item) => item.status === 'approved').length;
  const currentRejected = currentSubmissions.filter((item) => item.status === 'rejected').length;

  const copyIncompleteEmails = React.useCallback(() => {
    const emails = filteredIncompleteUsers.map((user) => user.email).filter(Boolean);
    void navigator.clipboard.writeText(emails.join(', ')).then(() => {
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 2000);
    });
  }, [filteredIncompleteUsers]);

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

  const incompleteColumns: DataTableColumn<IncompleteOnboardingUser>[] = [
    {
      id: 'user',
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.fullName}</p>
          <p className="text-xs text-on-surface-variant">{row.id}</p>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (row) => (
        <Badge variant={row.role === 'student' ? 'primary' : 'info'}>
          {row.role === 'student' ? 'Student' : 'Instructor'}
        </Badge>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row) => (
        <a href={`mailto:${row.email}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
          {row.email}
        </a>
      ),
    },
    {
      id: 'stage',
      header: 'Stopped At',
      cell: (row) => <Badge variant="warning">{WORKFLOW_STAGE_LABELS[row.workflowStage] ?? row.workflowStage}</Badge>,
    },
    {
      id: 'registered',
      header: 'Registered',
      cell: (row) => (row.registeredAt ? new Date(row.registeredAt).toLocaleDateString() : '—'),
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
          {activeTab === 'incomplete' ? (
            <Button variant="secondary" size="sm" onClick={copyIncompleteEmails}>
              {copiedEmails ? 'Copied!' : 'Copy Emails'}
            </Button>
          ) : (
            <>
              <Badge variant="warning">{currentPending} Pending</Badge>
              <Badge variant="success">{currentApproved} Approved</Badge>
              <Badge variant="error">{currentRejected} Rejected</Badge>
            </>
          )}
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
          <button
            onClick={() => setTab('incomplete')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'incomplete'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Incomplete Onboarding
            {incompleteUsers.length > 0 ? (
              <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                {incompleteUsers.length}
              </span>
            ) : null}
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <div className="relative max-w-sm">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder={
              activeTab === 'intake'
                ? 'Search by student name or ID...'
                : activeTab === 'instructor'
                  ? 'Search by instructor name or ID...'
                  : 'Search by name, email, or ID...'
            }
            className="h-11 rounded-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant">Loading submissions...</div>
        ) : activeTab === 'incomplete' ? (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Students and instructors who created an account but have not submitted their onboarding yet — reach out
              to bring them back.
            </p>
            <DataTable
              columns={incompleteColumns}
              data={filteredIncompleteUsers}
              getRowId={(row) => row.id}
              mobileCardTitle={(row) => row.fullName}
              mobileCardSubtitle={(row) => row.email}
              emptyState="Everyone who registered has submitted their onboarding. Nothing to follow up on."
            />
          </div>
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
