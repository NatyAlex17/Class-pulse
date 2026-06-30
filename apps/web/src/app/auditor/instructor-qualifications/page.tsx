'use client';

import { IconCheck, IconUserCheck, IconX } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const instructors = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Lead Clinical Instructor',
    credentials: ['RN-BSN', 'ACLS', 'BLS', 'Clinical Instructor Cert'],
    certifications: { valid: 3, expired: 0 },
    status: 'Compliant',
  },
  {
    name: 'Michael Torres',
    role: 'Clinical Instructor',
    credentials: ['LVN', 'ACLS', 'BLS'],
    certifications: { valid: 3, expired: 0 },
    status: 'Compliant',
  },
  {
    name: 'Jennifer Park',
    role: 'Classroom Instructor',
    credentials: ['RN', 'BSN', 'ACLS'],
    certifications: { valid: 2, expired: 1 },
    status: 'Review Required',
  },
  {
    name: 'David Martinez',
    role: 'Clinical Coordinator',
    credentials: ['RN', 'ACLS', 'BLS'],
    certifications: { valid: 3, expired: 0 },
    status: 'Compliant',
  },
];

export default function AuditorInstructorQualificationsPage() {
  return (
    <AuditorShell
      title="Instructor Qualifications"
      subtitle="Verify instructor credentials, licenses, and certification status."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Total Instructors</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-primary">{instructors.length}</p>
            <p className="mt-3 text-sm text-on-surface-variant">Active instructors</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Compliant</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-success">3</p>
            <p className="mt-3 text-sm text-on-surface-variant">All credentials valid</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Review Required</p>
            <p className="mt-2 font-mono text-[32px] font-semibold text-warning">1</p>
            <p className="mt-3 text-sm text-on-surface-variant">Pending verification</p>
          </div>
        </div>

        <section className="space-y-4">
          {instructors.map((instructor) => (
            <div key={instructor.name} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">{instructor.name}</h3>
                  <p className="text-sm text-on-surface-variant">{instructor.role}</p>
                </div>
                <Badge variant={instructor.status === 'Compliant' ? 'success' : 'warning'}>
                  {instructor.status}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold text-on-surface">Credentials</p>
                  <div className="space-y-2">
                    {instructor.credentials.map((cred) => (
                      <div key={cred} className="flex items-center gap-2 text-sm text-on-surface">
                        <IconCheck className="h-4 w-4 text-success" />
                        {cred}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-on-surface">Certification Status</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">Valid Certifications</span>
                      <Badge variant="success">{instructor.certifications.valid}</Badge>
                    </div>
                    {instructor.certifications.expired > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-on-surface-variant">Expired</span>
                        <Badge variant="error">{instructor.certifications.expired}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="secondary" className="mt-4 rounded-[12px]">
                <IconUserCheck className="size-4" />
                Review Full Profile
              </Button>
            </div>
          ))}
        </section>
      </div>
    </AuditorShell>
  );
}
