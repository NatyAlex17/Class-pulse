import { IconDownload, IconDeviceFloppy } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const groups = [
  {
    title: 'Module 4 / Vital Signs',
    progress: '75%',
    items: [
      ['Hand hygiene protocol', 'Verified'],
      ['Temperature and pulse sequence', 'Verified'],
      ['Blood pressure measurement', 'Needs observation'],
    ],
  },
  {
    title: 'Module 5 / Patient Care',
    progress: '60%',
    items: [
      ['Safe transfer setup', 'Verified'],
      ['Bed bath workflow', 'Needs observation'],
      ['Documentation accuracy', 'Ready for signoff'],
    ],
  },
] as const;

export default function InstructorSkillsPage() {
  return (
    <InstructorShell
      title="Clinical Skills Checklist"
      subtitle="Alice Smith / Clinical skills verification workspace"
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconDownload className="size-4" />
            Download PDF
          </Button>
          <Button className="rounded-[16px] px-5">
            <IconDeviceFloppy className="size-4" />
            Save Checklist
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Badge variant="success">Autosave active</Badge>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                  Last saved / 14:32 today
                </p>
              </div>
              <h3 className="mt-4 font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
                Alice Smith <span className="font-normal text-on-surface-variant">/ Clinical Skills</span>
              </h3>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Completion progress</span>
                <span className="font-mono text-sm font-semibold text-primary">75%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-high">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.title} className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-[22px] font-semibold">{group.title}</h4>
                  <p className="text-sm text-on-surface-variant">Section completion {group.progress}</p>
                </div>
                <Badge variant="primary">{group.progress}</Badge>
              </div>
              <div className="space-y-3">
                {group.items.map((entry) => {
                  const [item, status] = entry;

                  return (
                    <div key={item} className="flex flex-col gap-3 rounded-[18px] border border-border-subtle bg-surface-muted p-4 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium text-on-surface">{item}</p>
                      <Badge
                        variant={
                          status === 'Verified'
                            ? 'success'
                            : status === 'Needs observation'
                              ? 'warning'
                              : 'primary'
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </InstructorShell>
  );
}
