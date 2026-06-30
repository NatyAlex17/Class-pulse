'use client';

import * as React from 'react';
import {
  IconCheck,
  IconDots,
  IconSearch,
  IconX,
  IconFile,
  IconCalendarEvent,
  IconMail,
  IconPhone,
  IconFileText,
} from '@tabler/icons-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ApplicationDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  stage: string;
  documents: number;
  docsTotal: number;
  updated: string;
  status: 'Pending Review' | 'Missing Docs' | 'Ready' | 'Approved' | 'Rejected';
  gpa: number;
  highSchoolDiploma: boolean;
  backgroundCheck: boolean;
  interview: boolean;
  interviewScore: number;
  notes: string[];
  appliedDate: string;
};

type ApplicationRow = {
  id: string;
  applicant: string;
  program: string;
  stage: string;
  documents: string;
  updated: string;
  status: 'Pending Review' | 'Missing Docs' | 'Ready' | 'Approved' | 'Rejected';
};

const applicationsData: ApplicationDetail[] = [
  {
    id: '001',
    name: 'Eve Williams',
    email: 'eve.williams@email.com',
    phone: '(555) 123-4567',
    program: 'CNA Cohort 12',
    stage: 'Eligibility Review',
    documents: 6,
    docsTotal: 7,
    updated: '10:18 AM',
    status: 'Pending Review',
    gpa: 3.8,
    highSchoolDiploma: true,
    backgroundCheck: true,
    interview: true,
    interviewScore: 92,
    notes: ['Strong interview performance', 'All documents except final transcript'],
    appliedDate: 'June 15, 2026',
  },
  {
    id: '002',
    name: 'Noah Carter',
    email: 'noah.carter@email.com',
    phone: '(555) 234-5678',
    program: 'Medical Assistant',
    stage: 'Document Collection',
    documents: 4,
    docsTotal: 7,
    updated: '09:42 AM',
    status: 'Missing Docs',
    gpa: 3.5,
    highSchoolDiploma: true,
    backgroundCheck: false,
    interview: false,
    interviewScore: 0,
    notes: ['Needs background check clearance', 'Missing interview appointment'],
    appliedDate: 'June 10, 2026',
  },
  {
    id: '003',
    name: 'Mila Bennett',
    email: 'mila.bennett@email.com',
    phone: '(555) 345-6789',
    program: 'Radiologic Tech',
    stage: 'Final Approval',
    documents: 7,
    docsTotal: 7,
    updated: '08:55 AM',
    status: 'Ready',
    gpa: 3.9,
    highSchoolDiploma: true,
    backgroundCheck: true,
    interview: true,
    interviewScore: 95,
    notes: ['Excellent candidate', 'Ready for enrollment'],
    appliedDate: 'June 5, 2026',
  },
  {
    id: '004',
    name: 'Isaac Brooks',
    email: 'isaac.brooks@email.com',
    phone: '(555) 456-7890',
    program: 'CNA Cohort 13',
    stage: 'Interview Review',
    documents: 7,
    docsTotal: 7,
    updated: 'Yesterday',
    status: 'Pending Review',
    gpa: 3.6,
    highSchoolDiploma: true,
    backgroundCheck: true,
    interview: true,
    interviewScore: 88,
    notes: ['Good technical skills', 'Passed all background checks'],
    appliedDate: 'June 8, 2026',
  },
];

const applications: ApplicationRow[] = applicationsData.map((app) => ({
  id: app.id,
  applicant: app.name,
  program: app.program,
  stage: app.stage,
  documents: `${app.documents}/${app.docsTotal}`,
  updated: app.updated,
  status: app.status,
}));

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
          row.status === 'Ready' || row.status === 'Approved'
            ? 'success'
            : row.status === 'Missing Docs'
              ? 'warning'
              : row.status === 'Rejected'
                ? 'error'
                : 'primary'
        }
      >
        {row.status}
      </Badge>
    ),
  },
];

export default function AdminApplicationsPage() {
  const [selectedApp, setSelectedApp] = React.useState<ApplicationDetail | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newNote, setNewNote] = React.useState('');
  const [applications_, setApplications] = React.useState(applicationsData);

  const filteredApplications = applications_.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRows = filteredApplications.map((app) => ({
    id: app.id,
    applicant: app.name,
    program: app.program,
    stage: app.stage,
    documents: `${app.documents}/${app.docsTotal}`,
    updated: app.updated,
    status: app.status,
  }));

  const handleApprove = () => {
    if (!selectedApp) return;
    setApplications(
      applications_.map((app) =>
        app.id === selectedApp.id ? { ...app, status: 'Approved' as const } : app
      )
    );
    setSelectedApp(null);
  };

  const handleReject = () => {
    if (!selectedApp) return;
    setApplications(
      applications_.map((app) =>
        app.id === selectedApp.id ? { ...app, status: 'Rejected' as const } : app
      )
    );
    setSelectedApp(null);
  };

  const handleAddNote = () => {
    if (!selectedApp || !newNote.trim()) return;
    setApplications(
      applications_.map((app) =>
        app.id === selectedApp.id
          ? { ...app, notes: [...app.notes, newNote] }
          : app
      )
    );
    setSelectedApp({
      ...selectedApp,
      notes: [...selectedApp.notes, newNote],
    });
    setNewNote('');
  };

  return (
    <>
      <AdminShell
        title="Applications Review"
        subtitle="Monitor the admissions queue, missing documents, and approval progress."
        searchPlaceholder="Search applications..."
        topActions={
          <div className="hidden items-center gap-3 md:flex">
            <Badge variant="primary">{applications_.length} total</Badge>
            <Badge variant="success">
              {applications_.filter((a) => a.status === 'Approved').length} approved
            </Badge>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredRows}
          onRowClick={(row) => {
            const app = applications_.find((a) => a.id === row.id);
            if (app) setSelectedApp(app);
          }}
          mobileCardTitle={(row) => row.applicant}
          mobileCardSubtitle={(row) => `${row.program} / ${row.stage}`}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  placeholder="Search applicants..."
                  className="h-11 rounded-[16px] pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">
                  {applications_.filter((a) => a.status === 'Pending Review').length} Pending
                </Badge>
                <Badge variant="warning">
                  {applications_.filter((a) => a.status === 'Missing Docs').length} Missing
                </Badge>
                <Badge variant="success">
                  {applications_.filter((a) => a.status === 'Ready').length} Ready
                </Badge>
              </div>
            </div>
          }
        />
      </AdminShell>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[24px] bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{selectedApp.name}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{selectedApp.program}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-on-surface">Application Status</h3>
                <Badge
                  variant={
                    selectedApp.status === 'Ready' || selectedApp.status === 'Approved'
                      ? 'success'
                      : selectedApp.status === 'Missing Docs'
                        ? 'warning'
                        : selectedApp.status === 'Rejected'
                          ? 'error'
                          : 'primary'
                  }
                >
                  {selectedApp.status}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <IconMail className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">{selectedApp.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconPhone className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">{selectedApp.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCalendarEvent className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">Applied: {selectedApp.appliedDate}</span>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">GPA</p>
                    <p className="font-mono text-xl font-bold text-primary">{selectedApp.gpa.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">High School</p>
                    {selectedApp.highSchoolDiploma ? (
                      <Badge variant="success">Diploma</Badge>
                    ) : (
                      <Badge variant="warning">Missing</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">Background Check</span>
                    {selectedApp.backgroundCheck ? (
                      <Badge variant="success">
                        <IconCheck className="mr-1 h-3 w-3" />
                        Cleared
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">Interview</span>
                    {selectedApp.interview ? (
                      <Badge variant="success">
                        <IconCheck className="mr-1 h-3 w-3" />
                        {selectedApp.interviewScore}%
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface">Documents</span>
                    <span className="text-sm font-semibold">
                      {selectedApp.documents}/{selectedApp.docsTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Review Notes</h3>
                {selectedApp.notes.length > 0 ? (
                  <div className="mb-4 space-y-2">
                    {selectedApp.notes.map((note, idx) => (
                      <div key={idx} className="rounded-[12px] bg-surface-muted p-3 text-sm text-on-surface">
                        • {note}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant mb-4">No notes yet</p>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface">Add Note</label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this application..."
                    className="rounded-[12px]"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    variant="secondary"
                    className="rounded-[12px]"
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApp.status !== 'Approved' && selectedApp.status !== 'Rejected' && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleReject}
                    variant="secondary"
                    className="flex-1 rounded-[12px] text-error"
                  >
                    Reject Application
                  </Button>
                  <Button
                    onClick={handleApprove}
                    className="flex-1 rounded-[12px]"
                  >
                    Approve Application
                  </Button>
                </div>
              )}

              <Button
                onClick={() => setSelectedApp(null)}
                variant="secondary"
                className="w-full rounded-[12px]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
