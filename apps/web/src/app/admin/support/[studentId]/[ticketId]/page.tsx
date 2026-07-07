'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface AdminSupportTicket {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
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

export default function AdminSupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();

  const studentId = params.studentId as string;
  const ticketId = params.ticketId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const [ticket, setTicket] = React.useState<AdminSupportTicket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [replyLoading, setReplyLoading] = React.useState(false);
  const [reply, setReply] = React.useState('');
  const [replyStatus, setReplyStatus] = React.useState<'In Review' | 'Resolved'>('Resolved');

  const fetchTicket = React.useCallback(async () => {
    if (!hasAuth || !session?.access_token) {
      setError('Sign in as an admin to load this support request.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/support-tickets/${studentId}/${ticketId}`,
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
        throw new Error(payload?.error?.message ?? `Failed to fetch support request (${response.status}).`);
      }

      const data = await response.json();
      setTicket(data.data);
      setReply(data.data?.adminReply ?? '');
    } catch (err) {
      setTicket(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch support request.');
    } finally {
      setLoading(false);
    }
  }, [adminId, hasAuth, session?.access_token, studentId, ticketId]);

  React.useEffect(() => {
    if (!hasAuth) return;
    void fetchTicket();
  }, [fetchTicket, hasAuth]);

  const handleSendReply = async () => {
    if (!hasAuth || !session?.access_token || !ticket || !reply.trim()) return;

    try {
      setReplyLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/admins/${adminId}/support-tickets/${studentId}/${ticketId}/reply`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reply, status: replyStatus }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to send reply (${response.status}).`);
      }

      const data = await response.json();
      setTicket(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <AdminShell
      title="Support Request"
      subtitle="Review the student's request and send a reply."
      topActions={
        <Button variant="secondary" size="sm" onClick={() => router.push('/admin/support')}>
          <IconArrowLeft className="size-4" />
          Back to support requests
        </Button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-8 text-center text-on-surface-variant">Loading support request...</div>
      ) : !ticket ? (
        <div className="py-8 text-center text-on-surface-variant">Support request not found.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-muted p-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{ticket.studentName ?? ticket.studentId}</h2>
              {ticket.studentEmail ? <p className="text-xs text-on-surface-variant">{ticket.studentEmail}</p> : null}
              <p className="mt-1 text-sm text-on-surface-variant">
                Submitted {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-1 text-sm font-semibold text-on-surface-variant">{ticket.category}</p>
            <h3 className="mb-3 text-lg font-bold text-on-surface">{ticket.subject}</h3>
            <p className="whitespace-pre-wrap text-sm text-on-surface">{ticket.message}</p>
          </div>

          {ticket.adminReply ? (
            <div className="rounded-lg border border-success/20 bg-success/5 p-4">
              <p className="mb-2 text-sm font-semibold text-success">
                Admin Reply {ticket.respondedAt ? `· ${new Date(ticket.respondedAt).toLocaleString()}` : ''}
              </p>
              <p className="whitespace-pre-wrap text-sm text-on-surface">{ticket.adminReply}</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-border-subtle bg-surface-muted p-4">
            <p className="mb-3 text-sm font-semibold text-on-surface-variant">
              {ticket.adminReply ? 'Update Reply' : 'Send Reply'}
            </p>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply to the student..."
              className="h-32"
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {(['In Review', 'Resolved'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setReplyStatus(option)}
                    className={
                      replyStatus === option
                        ? 'rounded-lg border border-primary bg-primary px-3 py-2 text-xs font-semibold text-white'
                        : 'rounded-lg border border-border-subtle bg-surface px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-primary/40'
                    }
                  >
                    Mark as {option}
                  </button>
                ))}
              </div>
              <Button onClick={handleSendReply} disabled={replyLoading || !reply.trim()} className="ml-auto">
                {replyLoading ? 'Sending...' : ticket.adminReply ? 'Update Reply' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
