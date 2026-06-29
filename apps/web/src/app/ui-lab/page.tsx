'use client';

import * as React from 'react';
import {
  IconArrowUpRight,
  IconChecklist,
  IconFileDescription,
  IconFilter,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';
import { Input } from '@/components/ui/input';

type ApplicationRecord = {
  id: string;
  applicant: string;
  cohort: string;
  status: 'pending' | 'missing_docs' | 'approved';
  progress: string;
  submittedAt: string;
  track: string;
};

const applications: ApplicationRecord[] = [
  {
    id: '#APP-2048',
    applicant: 'Eve Williams',
    cohort: 'Fall 2024',
    status: 'pending',
    progress: '85%',
    submittedAt: 'Jul 12, 2024',
    track: 'Accelerated BSN',
  },
  {
    id: '#APP-2051',
    applicant: 'Marcus Chen',
    cohort: 'Fall 2024',
    status: 'missing_docs',
    progress: '60%',
    submittedAt: 'Jul 14, 2024',
    track: 'NATP Day Cohort',
  },
  {
    id: '#APP-2055',
    applicant: 'Sarah Jenkins',
    cohort: 'Winter 2025',
    status: 'approved',
    progress: '100%',
    submittedAt: 'Jul 15, 2024',
    track: 'Evening CNA',
  },
];

function statusBadge(status: ApplicationRecord['status']) {
  switch (status) {
    case 'approved':
      return <Badge variant="success">Ready For Approval</Badge>;
    case 'missing_docs':
      return <Badge variant="warning">Missing Docs</Badge>;
    case 'pending':
      return <Badge variant="info">Pending Review</Badge>;
  }
}

const applicationColumns: DataTableColumn<ApplicationRecord>[] = [
  {
    id: 'applicant',
    header: 'Applicant',
    cell: (row) => (
      <div className="space-y-1">
        <div className="font-display text-[15px] font-semibold text-on-surface">
          {row.applicant}
        </div>
        <div className="text-sm text-on-surface-variant">
          {row.track} / {row.id}
        </div>
      </div>
    ),
    mobileLabel: 'Applicant',
    mobileValue: (row) => (
      <div>
        <div className="font-semibold">{row.applicant}</div>
        <div className="text-on-surface-variant">{row.id}</div>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => statusBadge(row.status),
  },
  {
    id: 'cohort',
    header: 'Cohort',
    accessorKey: 'cohort',
  },
  {
    id: 'progress',
    header: 'Completion',
    cell: (row) => (
      <div className="space-y-2">
        <div className="font-mono text-sm font-medium text-primary">{row.progress}</div>
        <div className="h-2 rounded-full bg-surface-high">
          <div className="h-2 rounded-full bg-primary" style={{ width: row.progress }} />
        </div>
      </div>
    ),
  },
  {
    id: 'submittedAt',
    header: 'Submitted',
    accessorKey: 'submittedAt',
  },
];

const formSchema: FormSchema = {
  title: 'Enrollment Form Designer',
  description:
    'Schema-driven form sections with field-level overrides, Tailwind slot overrides, and room for role-specific business rules.',
  sections: [
    {
      id: 'student',
      title: 'Student Profile',
      description:
        'Use this structure for onboarding, application review, and compliance intake forms.',
      badge: 'core',
      columns: 2,
      fields: [
        {
          type: 'text',
          name: 'fullName',
          label: 'Full legal name',
          placeholder: 'Eve Marie Williams',
          required: true,
        },
        {
          type: 'email',
          name: 'email',
          label: 'Primary email',
          placeholder: 'student@classpulse.edu',
          required: true,
        },
        {
          type: 'select',
          name: 'programTrack',
          label: 'Program track',
          placeholder: 'Select a track',
          options: [
            { label: 'Accelerated BSN', value: 'accelerated-bsn' },
            { label: 'NATP Day Cohort', value: 'natp-day' },
            { label: 'Evening CNA', value: 'evening-cna' },
          ],
        },
        {
          type: 'date',
          name: 'examDate',
          label: 'Preferred exam date',
        },
      ],
    },
    {
      id: 'compliance',
      title: 'Compliance Controls',
      description:
        'This is the same component layer you can reuse for approvals, attendance corrections, and document workflows.',
      columns: 2,
      fields: [
        {
          type: 'textarea',
          name: 'reviewNotes',
          label: 'Reviewer notes',
          placeholder: 'Capture rationale, exceptions, or next steps.',
          className: 'md:col-span-2',
        },
        {
          type: 'checkbox',
          name: 'entranceExamPassed',
          label: 'Entrance exam passed',
          description: 'Enables the next workflow stage only after backend validation.',
          className: 'md:col-span-2',
        },
      ],
    },
  ],
};

export default function UiLabPage() {
  const [values, setValues] = React.useState<Record<string, string | number | boolean | undefined>>(
    {
      fullName: 'Eve Marie Williams',
      email: 'eve.williams@email.com',
      programTrack: 'accelerated-bsn',
      examDate: '2026-07-10',
      reviewNotes: '',
      entranceExamPassed: true,
    }
  );

  return (
    <main className="cp-grid-pattern min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="cp-surface overflow-hidden rounded-[28px] border border-white/70 p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge variant="primary" className="mb-4">
                Reusable UI foundation
              </Badge>
              <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-primary sm:text-[42px] sm:leading-[1.05]">
                Class Verse component system starter
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                We now have a flexible data table and form designer built around your Stitch Clarity
                language, ready for Tailwind overrides and role-specific workflows.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Table behavior
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-primary">Responsive</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Form model
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-primary">Schema-driven</div>
                </CardContent>
              </Card>
              <Card className="bg-white/90">
                <CardContent className="p-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Styling
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-primary">Override-ready</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex flex-col gap-4 border-b border-border-subtle bg-white/85 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Reusable Data Table</CardTitle>
                <CardDescription>
                  Desktop table plus mobile card reflow, custom cells, row actions, and Tailwind
                  class slots.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                <IconShieldCheck className="size-4" />
                Compliance-friendly structure
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <DataTable
                columns={applicationColumns}
                data={applications}
                mobileCardTitle={(row) => row.applicant}
                mobileCardSubtitle={(row) => `${row.track} / ${row.id}`}
                rowActions={(_row) => (
                  <Button size="sm" variant="ghost" className="text-primary">
                    Review
                    <IconArrowUpRight className="size-4" />
                  </Button>
                )}
                renderToolbar={
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative min-w-0 flex-1 md:min-w-[280px]">
                      <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input className="pl-10" placeholder="Search applicants..." />
                    </div>
                    <Button variant="secondary" className="justify-center">
                      <IconFilter className="size-4" />
                      Filters
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>

          <FormDesigner
            schema={formSchema}
            values={values}
            onChange={(name, value) =>
              setValues((current) => ({
                ...current,
                [name]: value,
              }))
            }
            submitLabel="Save form schema"
            secondaryAction={
              <Button type="button" variant="secondary">
                <IconChecklist className="size-4" />
                Preview workflow
              </Button>
            }
            footer={
              <span className="inline-flex items-center gap-2">
                <IconFileDescription className="size-4 text-primary" />
                Backend validation and audit logging still belong in the API layer.
              </span>
            }
            classNames={{
              section: 'bg-gradient-to-b from-white to-surface-muted/70',
            }}
            onSubmit={(event) => {
              event.preventDefault();
            }}
          />
        </div>
      </div>
    </main>
  );
}
