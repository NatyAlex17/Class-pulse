'use client';

import { IconDots, IconSearch } from '@tabler/icons-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type ApplicationRow = {
  applicant: string;
  program: string;
  stage: string;
  documents: string;
  updated: string;
  status: 'Pending Review' | 'Missing Docs' | 'Ready';
};

const applications: ApplicationRow[] = [
  { applicant: 'Eve Williams', program: 'CNA Cohort 12', stage: 'Eligibility Review', documents: '6/7', updated: '10:18 AM', status: 'Pending Review' },
  { applicant: 'Noah Carter', program: 'Medical Assistant', stage: 'Document Collection', documents: '4/7', updated: '09:42 AM', status: 'Missing Docs' },
  { applicant: 'Mila Bennett', program: 'Radiologic Tech', stage: 'Final Approval', documents: '7/7', updated: '08:55 AM', status: 'Ready' },
  { applicant: 'Isaac Brooks', program: 'CNA Cohort 13', stage: 'Interview Review', documents: '7/7', updated: 'Yesterday', status: 'Pending Review' },
];

const columns: DataTableColumn<ApplicationRow>[] = [
  { id: 'applicant', header: 'Applicant', accessorKey: 'applicant' },
  { id: 'program', header: 'Program', accessorKey: 'program' },
  { id: 'stage', header: 'Stage', accessorKey: 'stage' },
  { id: 'documents', header: 'Documents', accessorKey: 'documents' },
  { id: 'updated', header: 'Updated', accessorKey: 'updated' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge
        variant={
          row.status === 'Ready'
            ? 'success'
            : row.status === 'Missing Docs'
              ? 'warning'
              : 'primary'
        }
      >
        {row.status}
      </Badge>
    ),
  },
];

export default function AdminApplicationsPage() {
  return (
    <AdminShell
      title="Applications Review"
      subtitle="Monitor the admissions queue, missing documents, and approval progress."
      searchPlaceholder="Search applications..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Badge variant="primary">28 active</Badge>
          <Button className="rounded-full px-5">Export queue</Button>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={applications}
        mobileCardTitle={(row) => row.applicant}
        mobileCardSubtitle={(row) => `${row.program} / ${row.stage}`}
        rowActions={() => (
          <button className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-primary">
            <IconDots className="size-4" />
          </button>
        )}
        renderToolbar={
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-[240px]">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input placeholder="Search applicants..." className="h-11 rounded-[16px] pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Pending Review</Badge>
              <Badge variant="warning">Missing Docs</Badge>
              <Badge variant="success">Ready</Badge>
            </div>
          </div>
        }
      />
    </AdminShell>
  );
}
