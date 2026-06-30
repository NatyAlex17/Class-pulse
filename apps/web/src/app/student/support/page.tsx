 'use client';

import * as React from 'react';
import { IconArrowRight, IconHelpCircle, IconMail, IconPhone } from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';

export default function StudentSupportPage() {
  const { supportTickets, submitSupportTicket } = useStudentDemo();
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

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
            Static demo flow that adds a ticket to the student support queue.
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
          <h3 className="font-display text-[20px] font-semibold text-on-surface">Recent Tickets</h3>
          <div className="mt-5 space-y-4">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{ticket.subject}</p>
                    <p className="mt-1 text-[12px] text-on-surface-variant">{ticket.message}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-on-surface-variant">{ticket.createdAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
