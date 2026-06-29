import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const queue = [
  { name: 'Eve Williams', status: 'Pending Review', note: 'Transcript received / immunization missing' },
  { name: 'Noah Carter', status: 'Missing Docs', note: 'Awaiting TB test and ID verification' },
  { name: 'Mila Bennett', status: 'Ready', note: 'Ready for final enrollment decision' },
] as const;

const detailCards = [
  ['Program', 'CNA Cohort 12'],
  ['Submitted', 'June 27, 2026'],
  ['Checklist', '6 of 7 received'],
  ['Interview', 'Completed / recommended'],
] as const;

export default function AdminApplicationsReviewPage() {
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
            {queue.map((entry, index) => (
              <div
                key={entry.name}
                className={`rounded-[18px] border p-4 shadow-soft ${
                  index === 0 ? 'border-primary bg-white' : 'border-border-subtle bg-white/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{entry.name}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">{entry.note}</p>
                  </div>
                  <Badge
                    variant={
                      entry.status === 'Ready'
                        ? 'success'
                        : entry.status === 'Missing Docs'
                          ? 'warning'
                          : 'primary'
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="warning">Pending Review</Badge>
              <h3 className="mt-4 font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
                Eve Williams
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Admissions packet under active review for the next CNA cohort.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="rounded-[16px] px-5">
                Place on hold
              </Button>
              <Button className="rounded-[16px] px-5">Approve</Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {detailCards.map(([label, value]) => (
              <div key={label} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
                <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-[20px] border border-border-subtle bg-white p-5">
              <h4 className="font-display text-[20px] font-semibold">Reviewer Notes</h4>
              <div className="mt-4 space-y-4">
                {[
                  'Personal statement aligns well with long-term care track expectations.',
                  'Transcript and interview score are complete and meet threshold.',
                  'Final immunization record still required before approval can convert to enrolled.',
                ].map((note) => (
                  <div key={note} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm leading-6 text-on-surface-variant">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[20px] border border-border-subtle bg-surface-muted p-5">
              <h4 className="font-display text-[20px] font-semibold">Checklist</h4>
              <div className="mt-4 space-y-3">
                {[
                  ['Government ID', 'Received'],
                  ['Transcript', 'Received'],
                  ['Background Check', 'Received'],
                  ['Immunization Record', 'Missing'],
                ].map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-white p-3">
                    <span className="text-sm font-medium text-on-surface">{label}</span>
                    <Badge variant={status === 'Missing' ? 'warning' : 'success'}>{status}</Badge>
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
