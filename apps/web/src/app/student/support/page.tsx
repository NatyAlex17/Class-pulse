 'use client';

import * as React from 'react';
import { IconArrowRight, IconHelpCircle, IconMail, IconPhone, IconRefresh } from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';

function statusBadgeVariant(status: 'Open' | 'In Review' | 'Resolved') {
  return status === 'Resolved' ? 'success' : status === 'In Review' ? 'warning' : 'error';
}

export default function StudentSupportPage() {
  const { supportTickets, submitSupportTicket, refreshPortal } = useStudentDemo();
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPortal();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <StudentShell
      title="Support"
      subtitle="Get help with access, coursework, documents, and compliance questions."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Program Support',
            description: 'Contact the operations team for account, scheduling, and enrollment questions.',
            icon: IconHelpCircle,
          },
          {
            title: 'Email Assistance',
            description: 'support@classverse.edu',
            icon: IconMail,
          },
          {
            title: 'Call Center',
            description: '+1 (555) 010-2024',
            icon: IconPhone,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="rounded-[14px]">
                  Open
                  <IconArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
          <h3 className="font-display text-[20px] font-semibold text-on-surface">
            Create Support Request
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Submit a ticket directly into the student support queue.
          </p>
          <div className="mt-6 space-y-4">
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject"
              className="h-11 rounded-[14px]"
            />
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe the issue or request"
              rows={5}
            />
            <Button
              className="rounded-[14px]"
              onClick={() => {
                submitSupportTicket({
                  subject: subject || 'General support request',
                  category: 'Support',
                  message,
                });
                setSubject('');
                setMessage('');
              }}
            >
              Submit Ticket
              <IconArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[20px] font-semibold text-on-surface">Recent Tickets</h3>
            <button
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline disabled:opacity-50"
            >
              <IconRefresh className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} />
              Refresh
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {supportTickets.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No support requests submitted yet.</p>
            ) : (
              supportTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{ticket.subject}</p>
                      <p className="mt-1 text-[12px] text-on-surface-variant">{ticket.message}</p>
                    </div>
                    <Badge variant={statusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-on-surface-variant">{ticket.createdAt}</p>

                  {ticket.adminReply ? (
                    <div className="mt-3 rounded-[12px] border border-success/20 bg-success/5 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                        Admin Reply{ticket.respondedAt ? ` · ${ticket.respondedAt}` : ''}
                      </p>
                      <p className="mt-1 text-[12px] text-on-surface">{ticket.adminReply}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] italic text-on-surface-variant">Awaiting a response from the admin team.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
