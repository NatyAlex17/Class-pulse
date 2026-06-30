'use client';

import { IconMail, IconPhone, IconMapPin, IconCalendarEvent, IconBadge } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AuditorProfilePage() {
  return (
    <AuditorShell
      title="My Profile"
      subtitle="View and manage your auditor profile and credentials."
    >
      <div className="max-w-2xl space-y-6">
        <section className="rounded-[20px] border border-border-subtle bg-surface p-8 shadow-soft">
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary">
              AA
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Alex Auditor</h2>
              <p className="text-on-surface-variant">Compliance Officer</p>
              <Badge variant="success" className="mt-2">
                Active
              </Badge>
            </div>
          </div>

          <div className="space-y-4 border-t border-border-subtle pt-6">
            <div className="flex items-center gap-4">
              <IconMail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Email</p>
                <p className="font-medium text-on-surface">alex.auditor@hospital.edu</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconPhone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Phone</p>
                <p className="font-medium text-on-surface">(555) 987-6543</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconMapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Location</p>
                <p className="font-medium text-on-surface">San Francisco, CA</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconCalendarEvent className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-on-surface-variant">Member Since</p>
                <p className="font-medium text-on-surface">January 15, 2023</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-6 font-display text-[22px] font-semibold text-on-surface">Credentials & Certifications</h3>
          <div className="space-y-3">
            {[
              'CAHC - Certified Auditor of Healthcare Compliance',
              'CCEP - Certified Compliance and Ethics Professional',
              'HIPAA Privacy Certified',
              'Healthcare Quality Improvement Certified',
            ].map((cert) => (
              <div key={cert} className="flex items-center gap-3 rounded-[12px] bg-surface-muted p-3">
                <IconBadge className="h-5 w-5 text-primary" />
                <span className="text-sm text-on-surface">{cert}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-6 font-display text-[22px] font-semibold text-on-surface">Programs Assigned</h3>
          <div className="space-y-3">
            {[
              'Golden State Nurse Assistant Training Program',
              'Medical Assistant Program',
              'Radiologic Technology Program',
            ].map((program) => (
              <div key={program} className="rounded-[12px] border border-border-subtle p-3 text-sm text-on-surface">
                {program}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-6 font-display text-[22px] font-semibold text-on-surface">Account Actions</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full rounded-[12px]">
              Edit Profile
            </Button>
            <Button variant="secondary" className="w-full rounded-[12px]">
              Change Password
            </Button>
            <Button variant="secondary" className="w-full rounded-[12px] text-error">
              Export Profile Data
            </Button>
          </div>
        </section>
      </div>
    </AuditorShell>
  );
}
