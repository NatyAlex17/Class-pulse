'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';
import { InstructorShell } from '@/components/instructor/instructor-shell';

const schema: FormSchema = {
  title: 'Profile and Credentials',
  description: 'Maintain instructor profile details and audit-facing certification data.',
  sections: [
    {
      id: 'identity',
      title: 'Profile Details',
      columns: 2,
      fields: [
        { name: 'fullName', label: 'Full name', type: 'text', required: true },
        { name: 'title', label: 'Role title', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'text' },
      ],
    },
    {
      id: 'credentials',
      title: 'Compliance Notes',
      fields: [
        {
          name: 'notes',
          label: 'Credential notes',
          type: 'textarea',
          rows: 5,
          placeholder: 'Add renewal notes, reviewer comments, and licensing context.',
        },
      ],
    },
  ],
};

const credentialCards = [
  { label: 'State CNA Instructor License', status: 'Active', expires: '2027-03-18' },
  { label: 'BLS Instructor Certification', status: 'Active', expires: '2026-11-02' },
  { label: 'Annual Clinical Supervision Review', status: 'Renewal due', expires: '2026-07-15' },
] as const;

export default function InstructorProfilePage() {
  const [values, setValues] = React.useState<Record<string, string>>({
    fullName: 'Dr. Sarah Chen',
    title: 'Lead Clinical Instructor',
    email: 'schen@classverse.edu',
    phone: '(415) 555-0183',
    notes: 'Primary reviewer for CNA Cohorts 12 and 13. Approved for simulation lab signoff and placement oversight.',
  });

  return (
    <InstructorShell
      title="Profile and Credentials"
      subtitle="Maintain operational profile data and compliance-facing credentials."
      topActions={
        <Button className="hidden rounded-[16px] px-5 md:inline-flex">Save Profile</Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXv4mwcZ_4UhLTVKSeBi3j9livM-k3VazMllatomAapg3tcCgAZou3wW9pgqEY37k53D0GESx7R1L_vElZ5sknI3VdGaPpn3W2jaGlcQOj9lapcoLAfbCBOTcOhNtWi_slBEdt54qIKBNbLOFqFEhV7MGuWn5PqmleDEuhENvtFUNlAbpTiptyDS5xD5JjplUUQpEF1yH2fysbEdY8DF4H7mLN-bM2MSIz84Y8KLOBn20JwhWsitZob3jqPU9aivHtONIdH0vlj0N5"
            alt="Instructor portrait"
            className="h-40 w-40 rounded-[24px] object-cover"
          />
          <h3 className="mt-5 font-display text-[24px] font-semibold text-on-surface">Dr. Sarah Chen</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Lead Clinical Instructor</p>
          <div className="mt-6 space-y-3">
            {credentialCards.map((credential) => (
              <div key={credential.label} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                <p className="text-sm font-semibold text-on-surface">{credential.label}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Badge variant={credential.status === 'Renewal due' ? 'warning' : 'success'}>
                    {credential.status}
                  </Badge>
                  <span className="text-[12px] text-on-surface-variant">Exp {credential.expires}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <FormDesigner
          schema={schema}
          values={values}
          onChange={(name, value) => setValues((current) => ({ ...current, [name]: String(value) }))}
          submitLabel="Save Profile"
          footer="Credential changes should remain aligned with compliance records and renewal evidence."
        />
      </div>
    </InstructorShell>
  );
}
