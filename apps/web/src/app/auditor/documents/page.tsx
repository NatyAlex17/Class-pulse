'use client';

import { IconDownload, IconFile, IconFileText } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const documents = [
  {
    title: 'Student Attendance Records',
    type: 'Spreadsheet',
    status: 'Current',
    lastUpdated: '2026-06-28 10:15 AM',
    size: '2.4 MB',
  },
  {
    title: 'Clinical Skills Assessment Forms',
    type: 'PDF',
    status: 'Current',
    lastUpdated: '2026-06-28 09:30 AM',
    size: '15.8 MB',
  },
  {
    title: 'Instructor Credential Files',
    type: 'Archive',
    status: 'Current',
    lastUpdated: '2026-06-27 02:00 PM',
    size: '48.2 MB',
  },
  {
    title: 'Safety Training Completion',
    type: 'Spreadsheet',
    status: 'Needs Review',
    lastUpdated: '2026-06-25 11:45 AM',
    size: '1.2 MB',
  },
  {
    title: 'Program Curriculum Documentation',
    type: 'PDF',
    status: 'Current',
    lastUpdated: '2026-06-20 03:15 PM',
    size: '5.6 MB',
  },
  {
    title: 'Clinical Placement Agreements',
    type: 'PDF',
    status: 'Current',
    lastUpdated: '2026-06-28 08:00 AM',
    size: '3.1 MB',
  },
];

export default function AuditorDocumentsPage() {
  return (
    <AuditorShell
      title="Documents & Evidence"
      subtitle="Maintain and audit program documentation and evidence files."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Documents</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{documents.length}</p>
            <p className="mt-3 text-sm text-on-surface-variant">All critical files</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Current</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-success">5</p>
            <p className="mt-3 text-sm text-on-surface-variant">Up to date</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs Review</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-warning">1</p>
            <p className="mt-3 text-sm text-on-surface-variant">Action required</p>
          </div>
        </div>

        <section className="rounded-[20px] border border-border-subtle bg-surface shadow-soft overflow-hidden">
          <div className="border-b border-border-subtle p-6">
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Document Library</h3>
          </div>
          <div className="divide-y divide-border-subtle">
            {documents.map((doc) => (
              <div key={doc.title} className="flex items-center justify-between border-border-subtle px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-primary/10 p-2 text-primary">
                    <IconFileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-on-surface">{doc.title}</h4>
                    <div className="mt-2 flex items-center gap-3 text-sm text-on-surface-variant">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={doc.status === 'Current' ? 'success' : 'warning'}>
                    {doc.status}
                  </Badge>
                  <Button variant="secondary" className="rounded-lg px-3">
                    <IconDownload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuditorShell>
  );
}
