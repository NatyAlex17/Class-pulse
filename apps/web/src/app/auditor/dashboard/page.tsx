import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconChecklist,
  IconFileCertificate,
  IconHistory,
  IconRosetteDiscountCheck,
  IconShare3,
  IconShieldCheck,
} from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const kpis = [
  { label: 'COHORT COMPLIANCE', value: '94%', tone: 'text-primary', note: '+2% this cycle' },
  { label: 'MISSING EVIDENCE', value: '07', tone: 'text-warning', note: '2 urgent' },
  { label: 'INSTRUCTOR STATUS', value: '100%', tone: 'text-success', note: 'All current' },
  { label: 'AUDIT READINESS', value: '91%', tone: 'text-info', note: '3 issues open' },
] as const;

const cards = [
  {
    title: 'Student file verification',
    detail: 'Attendance, theory hours, and clinical completion evidence remain in sync.',
    icon: IconChecklist,
    badge: 'Stable',
    variant: 'success' as const,
  },
  {
    title: 'Certification readiness',
    detail: 'Two candidates are blocked by final evidence review before certification release.',
    icon: IconFileCertificate,
    badge: 'Needs review',
    variant: 'warning' as const,
  },
  {
    title: 'Exceptions and gaps',
    detail: 'Open evidence requests and one policy variance require documented disposition.',
    icon: IconAlertTriangle,
    badge: 'Open',
    variant: 'error' as const,
  },
] as const;

export default function AuditorDashboardPage() {
  return (
    <AuditorShell
      title="Compliance Dashboard"
      subtitle="Real-time regulatory oversight for NATP Cohort #2024-B."
    >
      <div className="grid gap-6">
        <section className="flex flex-wrap gap-3 justify-end">
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconShare3 className="size-4" />
            Export Report
          </Button>
          <Button className="rounded-[16px] px-5">
            <IconRosetteDiscountCheck className="size-4" />
            Final Certification
          </Button>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {kpi.label}
              </p>
              <p className={`mt-2 font-mono text-[32px] font-semibold ${kpi.tone}`}>{kpi.value}</p>
              <p className="mt-3 text-sm text-on-surface-variant">{kpi.note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Audit Summary</h3>
              <Badge variant="primary">Live Oversight</Badge>
            </div>
            <div className="space-y-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-[17px] font-semibold text-on-surface">{card.title}</h4>
                          <Badge variant={card.variant}>{card.badge}</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Evidence Readiness</h3>
              <IconShieldCheck className="size-5 text-primary" />
            </div>
            <div className="space-y-5">
              {[
                ['Student records', '97%', 'w-[97%]', 'bg-success'],
                ['Instructor qualifications', '100%', 'w-full', 'bg-primary'],
                ['Clinical compliance', '89%', 'w-[89%]', 'bg-warning'],
                ['Program requirements', '92%', 'w-[92%]', 'bg-info'],
              ].map(([label, value, width, tone]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-on-surface">{label}</p>
                    <p className="font-mono text-sm text-on-surface-variant">{value}</p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-high">
                    <div className={`h-full rounded-full ${tone} ${width}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Open Exceptions</h3>
              <Badge variant="warning">7 open</Badge>
            </div>
            <div className="space-y-4">
              {[
                'Missing immunization evidence for one student file',
                'One clinical session awaiting instructor signoff',
                'Program policy revision note pending archive reference',
              ].map((item) => (
                <div key={item} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4 text-sm text-on-surface-variant">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-border-subtle bg-primary p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Audit Trail Snapshot</h3>
              <IconHistory className="size-5" />
            </div>
            <div className="mt-6 space-y-4">
              {[
                ['Last evidence export', 'Today / 11:08 AM'],
                ['Latest verification event', 'Clinical roster locked'],
                ['Certification batch', '2 pending release'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
              <Button variant="secondary" className="mt-2 rounded-[16px] border-white/20 bg-surface/10 px-5 text-white hover:bg-surface/20">
                <IconArrowUpRight className="size-4" />
                Open full report center
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AuditorShell>
  );
}
