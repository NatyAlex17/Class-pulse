'use client';

import { IconActivity, IconFilter } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const auditEntries = [
  {
    timestamp: '2026-06-28 11:08 AM',
    action: 'Evidence export initiated',
    actor: 'Alex Auditor',
    status: 'Success',
    details: 'Clinical hours audit - CSV format, 156 records',
  },
  {
    timestamp: '2026-06-28 10:45 AM',
    action: 'Student record verified',
    actor: 'Alex Auditor',
    status: 'Success',
    details: 'Marcus Chen - All documentation complete',
  },
  {
    timestamp: '2026-06-28 10:12 AM',
    action: 'Certification readiness check',
    actor: 'System',
    status: 'Alert',
    details: '2 students flagged - missing final evidence',
  },
  {
    timestamp: '2026-06-28 09:30 AM',
    action: 'Instructor credential update',
    actor: 'Dr. Sarah Chen',
    status: 'Success',
    details: 'ACLS certification renewed - valid through 2028',
  },
  {
    timestamp: '2026-06-28 08:00 AM',
    action: 'Program compliance report',
    actor: 'System',
    status: 'Success',
    details: 'Automated daily report generated - 92% compliance',
  },
  {
    timestamp: '2026-06-27 03:15 PM',
    action: 'Clinical placement audit',
    actor: 'Alex Auditor',
    status: 'Success',
    details: 'All 5 facilities verified - standards met',
  },
  {
    timestamp: '2026-06-27 02:00 PM',
    action: 'Document backup completed',
    actor: 'System',
    status: 'Success',
    details: 'Automated backup - 2.3 GB archived',
  },
  {
    timestamp: '2026-06-27 10:30 AM',
    action: 'Safety training reminder sent',
    actor: 'System',
    status: 'Success',
    details: '2 students notified of pending training',
  },
];

export default function AuditorAuditLogPage() {
  return (
    <AuditorShell
      title="Audit Log"
      subtitle="Complete timeline of all compliance and verification activities."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Events</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{auditEntries.length}</p>
            <p className="mt-3 text-sm text-on-surface-variant">In last 30 days</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Successful</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-success">6</p>
            <p className="mt-3 text-sm text-on-surface-variant">All audits passed</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Alerts</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-warning">1</p>
            <p className="mt-3 text-sm text-on-surface-variant">Requires action</p>
          </div>
        </div>

        <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Activity Timeline</h3>
            <Button variant="secondary" className="rounded-[12px]">
              <IconFilter className="size-4" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {auditEntries.map((entry, idx) => (
              <div key={idx} className="flex gap-4 border-l-2 border-border-subtle px-4 py-3 hover:bg-surface-muted rounded-r-lg transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  <IconActivity className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="font-semibold text-on-surface">{entry.action}</h4>
                    <Badge variant={entry.status === 'Success' ? 'success' : 'warning'}>
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant">{entry.details}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-on-surface-variant">
                    <span>{entry.timestamp}</span>
                    <span>•</span>
                    <span>{entry.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuditorShell>
  );
}
