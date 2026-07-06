'use client';

import { IconAdjustments, IconBell, IconShieldCheck } from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';
import { StudentShell } from '@/components/student/student-shell';

const settingsSchema: FormSchema = {
  title: 'Student Settings',
  description: 'Control notifications, device preferences, and account defaults.',
  sections: [
    {
      id: 'notifications',
      title: 'Notifications',
      badge: 'alerts',
      fields: [
        {
          type: 'checkbox',
          name: 'email_updates',
          label: 'Email updates',
          description: 'Receive course, compliance, and scheduling notices by email.',
        },
        {
          type: 'checkbox',
          name: 'sms_alerts',
          label: 'SMS alerts',
          description: 'Receive urgent reminders for deadlines and sessions.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security Defaults',
      badge: 'secure',
      fields: [
        {
          type: 'checkbox',
          name: 'remember_device',
          label: 'Remember this device',
          description: 'Keep your preferred device signed in for demo workflows.',
        },
      ],
    },
  ],
};

export default function StudentSettingsPage() {
  const { settings, updateSetting, lastAction } = useStudentDemo();

  return (
    <StudentShell
      title="Settings"
      subtitle="Manage your notification and account defaults."
    >
      <div className="mb-6 flex flex-wrap gap-3 text-sm text-on-surface-variant">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
          <IconAdjustments className="size-4" />
          Personal preferences
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-info/10 px-3 py-1 text-info">
          <IconBell className="size-4" />
          Alerts
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-success">
          <IconShieldCheck className="size-4" />
          Security
        </span>
      </div>
      <FormDesigner
        schema={settingsSchema}
        values={settings}
        onChange={(name, value) => updateSetting(name as keyof typeof settings, Boolean(value))}
        submitLabel="Save settings"
        onSubmit={(event) => event.preventDefault()}
        footer={lastAction}
      />
    </StudentShell>
  );
}
