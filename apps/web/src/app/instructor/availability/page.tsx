'use client';

import * as React from 'react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';

const schema: FormSchema = {
  title: 'Weekly Availability',
  description: 'Set recurring time windows and override dates for clinical instruction.',
  sections: [
    {
      id: 'weekdays',
      title: 'Recurring Schedule',
      description: 'Use the same fields to override or extend the default pattern.',
      columns: 2,
      fields: [
        { name: 'monday', label: 'Monday', type: 'text', placeholder: '08:00 - 04:00' },
        { name: 'tuesday', label: 'Tuesday', type: 'text', placeholder: '08:00 - 04:00' },
        { name: 'wednesday', label: 'Wednesday', type: 'text', placeholder: '09:00 - 12:00' },
        { name: 'thursday', label: 'Thursday', type: 'text', placeholder: '10:00 - 06:00' },
        { name: 'friday', label: 'Friday', type: 'text', placeholder: '08:00 - 02:00' },
        { name: 'weekend', label: 'Weekend notes', type: 'textarea', rows: 4, placeholder: 'On-call weekends are limited to assessment coverage.' },
      ],
    },
    {
      id: 'rules',
      title: 'Scheduling Controls',
      description: 'These toggles drive when the scheduler can place student sessions.',
      fields: [
        { name: 'allowAutoPlacement', label: 'Allow auto-placement within open hours', type: 'checkbox', description: 'Scheduling can place students directly into open lab windows.' },
        { name: 'travelBuffer', label: 'Require travel buffer between sites', type: 'checkbox', description: 'Blocks back-to-back placement when sites differ.' },
      ],
    },
  ],
};

const conflicts = [
  'Wednesday 09:00 - 12:00 overlaps with Marcus Chen / competency assessment',
  'Friday 01:30 PM site visit ends 15 minutes after your recurring block',
] as const;

export default function InstructorAvailabilityPage() {
  const [values, setValues] = React.useState<Record<string, string | number | boolean>>({
    monday: '08:00 - 04:00',
    tuesday: '08:00 - 04:00',
    wednesday: '09:00 - 12:00',
    thursday: '10:00 - 06:00',
    friday: '08:00 - 02:00',
    weekend: 'Reserved for make-up sessions and approvals only.',
    allowAutoPlacement: true,
    travelBuffer: true,
  });

  return (
    <InstructorShell
      title="My Availability"
      subtitle="Configure clinical instruction schedule and date-specific exceptions."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5">
            Discard
          </Button>
          <Button className="rounded-[16px] px-5">Save Changes</Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="rounded-[20px] border border-error/20 bg-error/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-error">Schedule Conflict Detected</h3>
              <div className="mt-2 space-y-2">
                {conflicts.map((conflict) => (
                  <p key={conflict} className="text-sm text-on-surface-variant">
                    {conflict}
                  </p>
                ))}
              </div>
            </div>
            <Badge variant="error">2 conflicts</Badge>
          </div>
        </div>

        <FormDesigner
          schema={schema}
          values={values}
          onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
          submitLabel="Save Availability"
          footer="Scheduler updates are reflected in student placement workflows after approval."
        />
      </div>
    </InstructorShell>
  );
}
