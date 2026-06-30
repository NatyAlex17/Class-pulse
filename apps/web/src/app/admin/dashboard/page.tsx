import Link from 'next/link';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconChartBar,
  IconChecklist,
  IconDatabaseExport,
  IconFileAnalytics,
  IconUserPlus,
} from '@tabler/icons-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const kpis = [
  { label: 'ACTIVE PROGRAMS', value: '12', tone: 'text-primary' },
  { label: 'PENDING APPS', value: '28', tone: 'text-warning' },
  { label: 'COMPLIANCE GAPS', value: '4', tone: 'text-error' },
  { label: 'AUDIT ITEMS', value: '11', tone: 'text-info' },
] as const;

const alerts = [
  {
    title: '4 compliance items need escalation',
    detail: 'Instructor credential expirations and one missing document packet.',
    href: '/admin/operations',
    icon: IconAlertTriangle,
  },
  {
    title: '28 applications are waiting in the queue',
    detail: 'Five are blocked by missing health documentation.',
    href: '/admin/applications',
    icon: IconChecklist,
  },
  {
    title: 'Latest reporting suite is ready to export',
    detail: 'Operational, admissions, and compliance bundles are up to date.',
    href: '/admin/reports',
    icon: IconDatabaseExport,
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Good morning, Charlie (Admin)"
      subtitle="Operational snapshot across applications, cohorts, and compliance workflows."
      topActions={
        <Button className="hidden rounded-full px-5 md:inline-flex">
          <IconUserPlus className="size-4" />
          Add Student
        </Button>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 rounded-[22px] border border-border-subtle bg-white p-8 shadow-soft lg:col-span-8">
          <Badge variant="primary" className="mb-4">
            Admin Operations
          </Badge>
          <h3 className="font-display text-[36px] font-bold leading-[1.02] tracking-[-0.03em] text-primary">
            Command the full training operation from one audit-ready surface.
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
            Enrollment throughput, student readiness, instructor coverage, and reporting health
            all stay visible here so the team can act before issues become compliance problems.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin/applications">
              <Button className="rounded-[16px] px-6">Open Applications</Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="secondary" className="rounded-[16px] px-6">
                Export Reports
              </Button>
            </Link>
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                {kpi.label}
              </p>
              <p className={`mt-2 font-mono text-[28px] font-semibold ${kpi.tone}`}>{kpi.value}</p>
            </div>
          ))}
        </section>

        <section className="col-span-12 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-[22px] font-semibold">Priority Actions</h4>
            <Link href="/admin/operations" className="text-sm font-semibold text-primary hover:underline">
              View command center
            </Link>
          </div>
          <div className="grid gap-4">
            {alerts.map((alert) => {
              const Icon = alert.icon;

              return (
                <Link
                  key={alert.title}
                  href={alert.href}
                  className="group rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[17px] font-semibold text-on-surface">{alert.title}</h5>
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant">{alert.detail}</p>
                    </div>
                    <IconArrowRight className="mt-1 size-4 text-on-surface-variant transition group-hover:text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5">
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-display text-[22px] font-semibold">Pipeline Snapshot</h4>
              <IconChartBar className="size-5 text-primary" />
            </div>
            <div className="space-y-4">
              {[
                ['New Applications', '34', 'w-[68%]', 'bg-primary'],
                ['Pending Review', '28', 'w-[56%]', 'bg-warning'],
                ['Ready to Enroll', '11', 'w-[32%]', 'bg-success'],
                ['Blocked', '5', 'w-[18%]', 'bg-error'],
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
          </div>
        </section>

        <section className="col-span-12 lg:col-span-8">
          <div className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h4 className="font-display text-[22px] font-semibold">Program Health</h4>
              <Link href="/admin/reports" className="text-sm font-semibold text-primary hover:underline">
                Open suite
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Nursing BSN Program', '92%', 'Stable'],
                ['Medical Assistant', '88%', 'Watch'],
                ['Radiologic Tech', '96%', 'Stable'],
              ].map(([name, score, status]) => (
                <div key={name} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-on-surface">{name}</p>
                  <p className="mt-3 font-mono text-[26px] font-semibold text-primary">{score}</p>
                  <Badge variant={status === 'Watch' ? 'warning' : 'success'} className="mt-3">
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4">
          <div className="rounded-[20px] border border-border-subtle bg-primary p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-[20px] font-semibold">Reporting Status</h4>
              <IconFileAnalytics className="size-5" />
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">Last suite export</p>
                <p className="mt-1 text-lg font-semibold">Today / 06:40 AM</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">Ready bundles</p>
                <p className="mt-1 text-lg font-semibold">7 exports available</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
