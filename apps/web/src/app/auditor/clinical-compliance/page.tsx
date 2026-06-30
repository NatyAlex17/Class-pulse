'use client';

import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const complianceItems = [
  { category: 'Clinical Hours', standard: '480 hours minimum', status: 'Compliant', details: '95% of students on track' },
  { category: 'Supervision Ratios', standard: '1:8 instructor to student', status: 'Compliant', details: 'All placements verified' },
  { category: 'Facility Standards', standard: 'Joint Commission accredited', status: 'Compliant', details: '5/5 facilities compliant' },
  { category: 'Safety Protocols', standard: 'Annual training required', status: 'At Risk', details: '2 students pending completion' },
  { category: 'Documentation', standard: 'Digital records with backup', status: 'Compliant', details: 'Automated daily backup' },
  { category: 'Assessment Standards', standard: 'AACN competencies', status: 'Compliant', details: 'All assessments aligned' },
];

export default function AuditorClinicalCompliancePage() {
  return (
    <AuditorShell
      title="Clinical Compliance"
      subtitle="Monitor clinical operations against regulatory standards."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Compliance Rate</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-success">92%</p>
            <p className="mt-3 text-sm text-on-surface-variant">5 of 6 standards met</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Issues Open</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-warning">1</p>
            <p className="mt-3 text-sm text-on-surface-variant">Requiring immediate attention</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Last Audit</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-primary">Jun 28</p>
            <p className="mt-3 text-sm text-on-surface-variant">Today at 11:08 AM</p>
          </div>
        </div>

        <section className="space-y-3">
          {complianceItems.map((item) => (
            <div key={item.category} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-on-surface">{item.category}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">{item.standard}</p>
                  <p className="mt-2 text-sm text-on-surface">{item.details}</p>
                </div>
                <Badge variant={item.status === 'Compliant' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-primary p-6 text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Immediate Action Required</h3>
              <p className="mt-1 text-white/80">Safety training completion for 2 students</p>
            </div>
            <IconAlertTriangle className="h-8 w-8" />
          </div>
          <Button variant="secondary" className="mt-4 rounded-[12px] bg-surface text-primary hover:bg-surface/90">
            Review Safety Training Status
          </Button>
        </section>
      </div>
    </AuditorShell>
  );
}
