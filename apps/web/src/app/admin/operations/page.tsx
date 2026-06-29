import { IconActivityHeartbeat, IconAlertTriangle, IconChecklist, IconClockHour4 } from '@tabler/icons-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const escalationItems = [
  {
    title: 'Instructor credential expires in 3 days',
    group: 'Compliance',
    icon: IconAlertTriangle,
    tone: 'error',
  },
  {
    title: 'Background check pending for 2 applicants',
    group: 'Admissions',
    icon: IconChecklist,
    tone: 'warning',
  },
  {
    title: 'Thursday clinical coverage below threshold',
    group: 'Scheduling',
    icon: IconClockHour4,
    tone: 'warning',
  },
] as const;

export default function AdminOperationsPage() {
  return (
    <AdminShell
      title="Operational Command Center"
      subtitle="Real-time operational monitoring across admissions, cohorts, and compliance controls."
      searchPlaceholder="Global operational search..."
      topActions={<Button className="hidden rounded-full px-5 md:inline-flex">New Record</Button>}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Admissions velocity', '82%', 'text-primary'],
            ['Instructor coverage', '91%', 'text-success'],
            ['Schedule pressure', '6 alerts', 'text-warning'],
            ['Compliance exceptions', '3 open', 'text-error'],
          ].map(([label, value, tone]) => (
            <div key={label} className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
              <p className={`mt-2 font-mono text-[28px] font-semibold ${tone}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Cohort View</h3>
              <Badge variant="primary">Live</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['CNA Cohort 12', '34 students', '2 blockers', 'warning'],
                ['CNA Cohort 13', '29 students', 'On track', 'success'],
                ['Medical Assistant Spring', '21 students', '1 credential hold', 'warning'],
                ['Radiologic Tech Summer', '18 students', 'Audit ready', 'success'],
              ].map(([name, size, note, tone]) => (
                <div key={name} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-on-surface">{name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{size}</p>
                  <Badge variant={tone === 'warning' ? 'warning' : 'success'} className="mt-3">
                    {note}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Escalation Feed</h3>
              <IconActivityHeartbeat className="size-5 text-primary" />
            </div>
            <div className="space-y-4">
              {escalationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-[14px] ${
                        item.tone === 'error' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{item.group}</p>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
