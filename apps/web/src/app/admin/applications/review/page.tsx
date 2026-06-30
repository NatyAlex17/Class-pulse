'use client';

import * as React from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type QueueStatus = 'Pending Review' | 'Missing Docs' | 'Ready';
type ChecklistStatus = 'Received' | 'Missing';

type QueueEntry = {
  name: string;
  status: QueueStatus;
  note: string;
  summary: string;
  actions: {
    primary: string;
    secondary: string;
  };
  detailCards: ReadonlyArray<readonly [string, string]>;
  reviewerNotes: readonly string[];
  checklist: ReadonlyArray<readonly [string, ChecklistStatus]>;
};

const queue: readonly QueueEntry[] = [
  {
    name: 'Eve Williams',
    status: 'Pending Review',
    note: 'Transcript received / immunization missing',
    summary: 'Admissions packet under active review for the next CNA cohort.',
    actions: {
      primary: 'Approve',
      secondary: 'Place on hold',
    },
    detailCards: [
      ['Program', 'CNA Cohort 12'],
      ['Submitted', 'June 27, 2026'],
      ['Checklist', '6 of 7 received'],
      ['Interview', 'Completed / recommended'],
    ],
    reviewerNotes: [
      'Personal statement aligns well with long-term care track expectations.',
      'Transcript and interview score are complete and meet threshold.',
      'Final immunization record still required before approval can convert to enrolled.',
    ],
    checklist: [
      ['Government ID', 'Received'],
      ['Transcript', 'Received'],
      ['Background Check', 'Received'],
      ['Immunization Record', 'Missing'],
    ],
  },
  {
    name: 'Noah Carter',
    status: 'Missing Docs',
    note: 'Awaiting TB test and ID verification',
    summary: 'Application is paused until core compliance documents are uploaded and verified.',
    actions: {
      primary: 'Mark for follow-up',
      secondary: 'Request documents',
    },
    detailCards: [
      ['Program', 'CNA Cohort 13'],
      ['Submitted', 'June 25, 2026'],
      ['Checklist', '4 of 7 received'],
      ['Interview', 'Pending scheduling'],
    ],
    reviewerNotes: [
      'Applicant completed the personal statement and tuition preference forms.',
      'TB clearance and government ID are still blocking the file from advancing.',
      'Hold outreach until compliance packet is fully uploaded.',
    ],
    checklist: [
      ['Government ID', 'Missing'],
      ['Transcript', 'Received'],
      ['Background Check', 'Received'],
      ['TB Test', 'Missing'],
    ],
  },
  {
    name: 'Mila Bennett',
    status: 'Ready',
    note: 'Ready for final enrollment decision',
    summary: 'File is complete and ready for admissions approval into the upcoming cohort.',
    actions: {
      primary: 'Approve',
      secondary: 'Return to pipeline',
    },
    detailCards: [
      ['Program', 'HHA Fast Track'],
      ['Submitted', 'June 24, 2026'],
      ['Checklist', '7 of 7 received'],
      ['Interview', 'Completed / strong fit'],
    ],
    reviewerNotes: [
      'All onboarding and identity verification requirements have been satisfied.',
      'Interview response quality and scheduling flexibility make this a strong admit candidate.',
      'No outstanding compliance blockers remain on this file.',
    ],
    checklist: [
      ['Government ID', 'Received'],
      ['Transcript', 'Received'],
      ['Background Check', 'Received'],
      ['Immunization Record', 'Received'],
    ],
  },
] as const;

function getBadgeVariant(status: QueueStatus | ChecklistStatus) {
  if (status === 'Ready' || status === 'Received') {
    return 'success' as const;
  }

  if (status === 'Missing Docs' || status === 'Missing') {
    return 'warning' as const;
  }

  return 'primary' as const;
}

export default function AdminApplicationsReviewPage() {
  const [selectedApplicantName, setSelectedApplicantName] = React.useState(queue[0].name);

  const selectedApplicant =
    queue.find((entry) => entry.name === selectedApplicantName) ?? queue[0];

  return (
    <AdminShell
      title="Application Review Workspace"
      subtitle="Deep review workspace for admissions decisions, notes, and checklist verification."
      searchPlaceholder="Search applicant records..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-full px-5">
            Request documents
          </Button>
          <Button className="rounded-full px-5">Approve applicant</Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[20px] border border-border-subtle bg-surface-muted p-4">
          <h3 className="px-2 pb-4 font-display text-[22px] font-semibold">Application Queue</h3>
          <div className="space-y-3">
            {queue.map((entry) => (
              <button
                key={entry.name}
                onClick={() => setSelectedApplicantName(entry.name)}
                className={`w-full rounded-[18px] border p-4 text-left shadow-soft transition ${
                  selectedApplicant.name === entry.name
                    ? 'border-primary bg-surface'
                    : 'border-border-subtle bg-surface/80 hover:border-primary/40 hover:bg-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{entry.name}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{entry.note}</p>
                  </div>
                  <Badge variant={getBadgeVariant(entry.status)}>{entry.status}</Badge>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant={getBadgeVariant(selectedApplicant.status)}>
                {selectedApplicant.status}
              </Badge>
              <h3 className="mt-4 font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
                {selectedApplicant.name}
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {selectedApplicant.summary}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="rounded-[16px] px-5">
                {selectedApplicant.actions.secondary}
              </Button>
              <Button className="rounded-[16px] px-5">{selectedApplicant.actions.primary}</Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {selectedApplicant.detailCards.map(([label, value]) => (
              <div key={label} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
                <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-[20px] border border-border-subtle bg-surface p-5">
              <h4 className="font-display text-[20px] font-semibold">Reviewer Notes</h4>
              <div className="mt-4 space-y-4">
                {selectedApplicant.reviewerNotes.map((note) => (
                  <div key={note} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-on-surface-variant">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[20px] border border-border-subtle bg-surface-muted p-5">
              <h4 className="font-display text-[20px] font-semibold">Checklist</h4>
              <div className="mt-4 space-y-3">
                {selectedApplicant.checklist.map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface p-3">
                    <span className="text-sm font-medium text-on-surface">{label}</span>
                    <Badge variant={getBadgeVariant(status)}>{status}</Badge>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
