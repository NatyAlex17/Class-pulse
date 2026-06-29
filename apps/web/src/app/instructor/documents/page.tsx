'use client';

import { IconSearch, IconUpload } from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type DocumentRow = {
  name: string;
  category: string;
  owner: string;
  updated: string;
  status: 'Approved' | 'Pending' | 'Needs update';
};

const documents: DocumentRow[] = [
  { name: 'Instructor Credential Packet', category: 'Compliance', owner: 'Dr. Sarah Chen', updated: '2026-06-27', status: 'Approved' },
  { name: 'Sunrise Care Placement Roster', category: 'Placement', owner: 'Placement Office', updated: '2026-06-28', status: 'Pending' },
  { name: 'Clinical Supervision Policy', category: 'Policy', owner: 'Operations', updated: '2026-06-25', status: 'Needs update' },
];

const columns: DataTableColumn<DocumentRow>[] = [
  { id: 'name', header: 'Document', accessorKey: 'name' },
  { id: 'category', header: 'Category', accessorKey: 'category' },
  { id: 'owner', header: 'Owner', accessorKey: 'owner' },
  { id: 'updated', header: 'Updated', accessorKey: 'updated' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}>
        {row.status}
      </Badge>
    ),
  },
];

export default function InstructorDocumentsPage() {
  return (
    <InstructorShell
      title="Documents Center"
      subtitle="Central access to instructor compliance files, placement records, and operating documents."
      topActions={
        <Button className="hidden rounded-[16px] px-5 md:inline-flex">
          <IconUpload className="size-4" />
          Upload document
        </Button>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Approved files</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-success">18</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Needs review</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-warning">4</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-white p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Expiring items</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-error">2</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={documents}
          mobileCardTitle={(row) => row.name}
          mobileCardSubtitle={(row) => `${row.category} / ${row.owner}`}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input placeholder="Search documents..." className="h-11 rounded-[16px] pl-10" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">All types</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="error">Needs update</Badge>
              </div>
            </div>
          }
        />
      </div>
    </InstructorShell>
  );
}
