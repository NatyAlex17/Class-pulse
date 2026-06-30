'use client';

import { IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Button } from '@/components/ui/button';

export default function AuditorSettingsPage() {
  return (
    <AuditorShell
      title="Settings"
      subtitle="Manage your auditor account and preferences."
    >
      <div className="max-w-2xl space-y-6">
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-6 font-display text-[22px] font-semibold text-on-surface">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'Daily Compliance Reports', description: 'Receive automated daily compliance summaries' },
              { label: 'Critical Alerts', description: 'Get notified immediately of critical compliance issues' },
              { label: 'Document Updates', description: 'Notifications when files are updated or added' },
              { label: 'Student Record Changes', description: 'Alerts when student records are modified' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[12px] border border-border-subtle p-4">
                <div>
                  <p className="font-semibold text-on-surface">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.description}</p>
                </div>
                <button className="text-success">
                  <IconToggleRight className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-6 font-display text-[22px] font-semibold text-on-surface">Audit Export Settings</h3>
          <div className="space-y-4">
            {[
              { label: 'Automatic Daily Exports', description: 'Automatically export compliance data daily' },
              { label: 'Cloud Backup', description: 'Enable automatic cloud backup of audit logs' },
              { label: 'Encryption', description: 'Encrypt all exported files' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[12px] border border-border-subtle p-4">
                <div>
                  <p className="font-semibold text-on-surface">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.description}</p>
                </div>
                <button className="text-success">
                  <IconToggleRight className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Account Management</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full rounded-[12px]">
              Change Password
            </Button>
            <Button variant="secondary" className="w-full rounded-[12px]">
              View Login History
            </Button>
            <Button variant="secondary" className="w-full rounded-[12px] text-error">
              Download My Data
            </Button>
          </div>
        </section>
      </div>
    </AuditorShell>
  );
}
