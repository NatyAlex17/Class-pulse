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

interface AdminSupportTicket {
  id: string;
  studentId: string;
  studentName?: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
  adminReply?: string;
  respondedAt?: string;
}

function statusBadgeVariant(status: AdminSupportTicket['status']) {
  return status === 'Resolved' ? 'success' : status === 'In Review' ? 'warning' : 'error';
}

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [tickets, setTickets] = React.useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchTickets = React.useCallback(async () => {
    if (!hasAuth || !session?.access_token) {
      setTickets([]);
      setError('Sign in as an admin to load support requests.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/support-tickets`, {
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
        throw new Error(payload?.error?.message ?? `Failed to fetch support requests (${response.status}).`);
      }

      const data = await response.json();
      setTickets(data.data || []);
    } catch (err) {
      setTickets([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch support requests.');
    } finally {
      setLoading(false);
    }
  }, [adminId, hasAuth, session?.access_token]);

  React.useEffect(() => {
    if (!hasAuth) return;
    void fetchTickets();
  }, [fetchTickets, hasAuth]);

  const filteredTickets = tickets.filter((ticket) =>
    `${ticket.studentName ?? ''} ${ticket.studentId} ${ticket.subject}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inReviewCount = tickets.filter((t) => t.status === 'In Review').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const columns: DataTableColumn<AdminSupportTicket>[] = [
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
      id: 'subject',
      header: 'Subject',
      cell: (row) => (
        <div>
          <p className="font-medium text-on-surface">{row.subject}</p>
          <p className="text-xs text-on-surface-variant">{row.category}</p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>,
    },
    {
      id: 'reply',
      header: 'Admin Reply',
      cell: (row) => (row.adminReply ? <Badge variant="success">Replied</Badge> : <Badge variant="neutral">Awaiting reply</Badge>),
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
    },
  ];

  return (
    <AdminShell
      title="Support Requests"
      subtitle="Review and respond to support tickets submitted by students"
      topActions={
        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="primary">{tickets.length} Total</Badge>
          <Badge variant="error">{openCount} Open</Badge>
          <Badge variant="warning">{inReviewCount} In Review</Badge>
          <Badge variant="success">{resolvedCount} Resolved</Badge>
          <Button variant="secondary" size="sm" onClick={() => void fetchTickets()}>
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
            placeholder="Search by student or subject..."
            className="h-11 rounded-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-on-surface-variant">Loading support requests...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTickets}
            getRowId={(row) => `${row.studentId}-${row.id}`}
            onRowClick={(row) => router.push(`/admin/support/${row.studentId}/${row.id}`)}
            mobileCardTitle={(row) => row.subject}
            mobileCardSubtitle={(row) => row.studentName ?? row.studentId}
            emptyState="No support requests found."
          />
        )}
      </div>
    </AdminShell>
  );
}
