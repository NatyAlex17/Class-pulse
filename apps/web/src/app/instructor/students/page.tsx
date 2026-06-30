'use client';

import * as React from 'react';
import {
  IconClockHour4,
  IconDots,
  IconSearch,
  IconShieldCheck,
  IconX,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconCheckCircle,
  IconAlertCircle,
  IconTrendingUp,
  IconFileText,
} from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type StudentRow = {
  id: string;
  name: string;
  cohort: string;
  placement: string;
  checklist: string;
  hours: string;
  risk: 'Stable' | 'Watch' | 'Urgent';
};

type StudentDetail = StudentRow & {
  email: string;
  phone: string;
  city: string;
  startDate: string;
  certificationStatus: string;
  progressPercent: number;
  recentNotes: Array<{ date: string; note: string; instructor: string }>;
  skills: Array<{ name: string; level: 'Competent' | 'Developing' | 'Novice' }>;
  absences: number;
};

const studentsData: StudentDetail[] = [
  {
    id: '001',
    name: 'Alice Smith',
    cohort: 'CNA Cohort 12',
    placement: 'Sunrise Care',
    checklist: '18/20',
    hours: '34/40',
    risk: 'Watch',
    email: 'alice.smith@email.com',
    phone: '(555) 123-4567',
    city: 'Portland, OR',
    startDate: 'January 15, 2024',
    certificationStatus: 'In Progress',
    progressPercent: 85,
    recentNotes: [
      { date: '2024-10-28', note: 'Strong performance in patient care. Needs improvement in documentation speed.', instructor: 'James Miller' },
      { date: '2024-10-20', note: 'Excellent communication with patients. Keep up the good work!', instructor: 'Sarah Chen' },
    ],
    skills: [
      { name: 'Vital Signs Assessment', level: 'Competent' },
      { name: 'Patient Communication', level: 'Competent' },
      { name: 'Medical Documentation', level: 'Developing' },
    ],
    absences: 1,
  },
  {
    id: '002',
    name: 'Marcus Chen',
    cohort: 'CNA Cohort 12',
    placement: 'Oak Ridge Rehab',
    checklist: '15/20',
    hours: '28/40',
    risk: 'Urgent',
    email: 'marcus.chen@email.com',
    phone: '(555) 234-5678',
    city: 'Salem, OR',
    startDate: 'January 15, 2024',
    certificationStatus: 'At Risk',
    progressPercent: 70,
    recentNotes: [
      { date: '2024-10-25', note: 'Struggling with some clinical procedures. Recommended additional tutoring.', instructor: 'Patricia Johnson' },
      { date: '2024-10-18', note: 'Attendance concerns - 3 absences this month.', instructor: 'James Miller' },
    ],
    skills: [
      { name: 'Vital Signs Assessment', level: 'Developing' },
      { name: 'Patient Communication', level: 'Competent' },
      { name: 'Medical Documentation', level: 'Novice' },
    ],
    absences: 3,
  },
  {
    id: '003',
    name: 'Elena Ford',
    cohort: 'HHA Spring Track',
    placement: 'Westbrook Clinic',
    checklist: '19/20',
    hours: '39/40',
    risk: 'Stable',
    email: 'elena.ford@email.com',
    phone: '(555) 345-6789',
    city: 'Eugene, OR',
    startDate: 'February 1, 2024',
    certificationStatus: 'On Track',
    progressPercent: 95,
    recentNotes: [
      { date: '2024-10-27', note: 'Excellent all-around performance. Ready for independent practice.', instructor: 'Sarah Chen' },
      { date: '2024-10-15', note: 'Outstanding leadership skills demonstrated during group projects.', instructor: 'James Miller' },
    ],
    skills: [
      { name: 'Vital Signs Assessment', level: 'Competent' },
      { name: 'Patient Communication', level: 'Competent' },
      { name: 'Medical Documentation', level: 'Competent' },
    ],
    absences: 0,
  },
  {
    id: '004',
    name: 'Priya Patel',
    cohort: 'CNA Cohort 13',
    placement: 'Bayview Center',
    checklist: '14/20',
    hours: '22/40',
    risk: 'Watch',
    email: 'priya.patel@email.com',
    phone: '(555) 456-7890',
    city: 'Corvallis, OR',
    startDate: 'March 1, 2024',
    certificationStatus: 'Developing',
    progressPercent: 72,
    recentNotes: [
      { date: '2024-10-26', note: 'Showing improvement in clinical skills. Continue with current support plan.', instructor: 'Patricia Johnson' },
    ],
    skills: [
      { name: 'Vital Signs Assessment', level: 'Competent' },
      { name: 'Patient Communication', level: 'Developing' },
      { name: 'Medical Documentation', level: 'Developing' },
    ],
    absences: 2,
  },
];

const students: StudentRow[] = studentsData;

const columns: DataTableColumn<StudentRow>[] = [
  { id: 'name', header: 'Student', accessorKey: 'name' },
  { id: 'cohort', header: 'Cohort', accessorKey: 'cohort' },
  { id: 'placement', header: 'Placement', accessorKey: 'placement' },
  { id: 'checklist', header: 'Checklist', accessorKey: 'checklist' },
  { id: 'hours', header: 'Clinical Hours', accessorKey: 'hours' },
  {
    id: 'risk',
    header: 'Risk',
    cell: (row) => (
      <Badge variant={row.risk === 'Urgent' ? 'error' : row.risk === 'Watch' ? 'warning' : 'success'}>
        {row.risk}
      </Badge>
    ),
  },
];

export default function InstructorStudentsPage() {
  const [selectedStudent, setSelectedStudent] = React.useState<StudentDetail | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRisk, setFilterRisk] = React.useState<string | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.cohort.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterRisk || student.risk === filterRisk;
    return matchesSearch && matchesFilter;
  });

  return (
    <InstructorShell
      title="My Students Workspace"
      subtitle="Monitor progress, placement readiness, and checklist health across assigned cohorts."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-full px-5">
            Daily roster export
          </Button>
          <Button className="rounded-full px-5">Add review note</Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Assigned students</p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-primary">42</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Watchlist</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-warning">
              <IconClockHour4 className="size-6" />
              <span>8</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Audit ready</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-success">
              <IconShieldCheck className="size-6" />
              <span>27</span>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredStudents}
          mobileCardTitle={(row) => row.name}
          mobileCardSubtitle={(row) => `${row.cohort} / ${row.placement}`}
          onRowClick={(row) => setSelectedStudent(studentsData.find((s) => s.name === row.name) || null)}
          rowActions={() => (
            <button className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-primary">
              <IconDots className="size-4" />
            </button>
          )}
          renderToolbar={
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative min-w-[240px]">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  placeholder="Search students..."
                  className="h-11 rounded-[16px] pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterRisk(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !filterRisk
                      ? 'bg-primary text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-primary'
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setFilterRisk('Urgent')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterRisk === 'Urgent'
                      ? 'bg-error text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-error'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setFilterRisk('Watch')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterRisk === 'Watch'
                      ? 'bg-warning text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-warning'
                  }`}
                >
                  Watch
                </button>
                <button
                  onClick={() => setFilterRisk('Stable')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filterRisk === 'Stable'
                      ? 'bg-success text-white'
                      : 'border border-border-subtle bg-surface text-on-surface hover:border-success'
                  }`}
                >
                  Stable
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[24px] bg-surface shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-border-subtle bg-surface p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">{selectedStudent.name}</h2>
                  <p className="text-sm text-on-surface-variant">{selectedStudent.cohort}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 p-6">
              {/* Status Overview */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[16px] border border-border-subtle p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase">Progress</p>
                    <span className="font-mono text-sm font-bold text-primary">{selectedStudent.progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${selectedStudent.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Certification Status</p>
                  <Badge
                    variant={
                      selectedStudent.certificationStatus === 'On Track'
                        ? 'success'
                        : selectedStudent.certificationStatus === 'At Risk'
                          ? 'error'
                          : 'warning'
                    }
                  >
                    {selectedStudent.certificationStatus}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <IconMail className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconPhone className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">{selectedStudent.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconMapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">{selectedStudent.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconCalendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-on-surface-variant">Started {selectedStudent.startDate}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Hours & Checklist */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Clinical Hours</p>
                  <p className="font-mono text-2xl font-bold text-primary">{selectedStudent.hours}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">of 40 hours required</p>
                </div>
                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Checklist</p>
                  <p className="font-mono text-2xl font-bold text-primary">{selectedStudent.checklist}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">skills completed</p>
                </div>
              </div>

              {/* Skills Assessment */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Skills Assessment</h3>
                <div className="space-y-3">
                  {selectedStudent.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-sm text-on-surface">{skill.name}</span>
                      <Badge
                        variant={
                          skill.level === 'Competent'
                            ? 'success'
                            : skill.level === 'Developing'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-on-surface">Attendance</h3>
                  <span className="text-2xl font-bold text-warning">{selectedStudent.absences}</span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {selectedStudent.absences === 0
                    ? 'Perfect attendance'
                    : `${selectedStudent.absences} absence${selectedStudent.absences > 1 ? 's' : ''} this month`}
                </p>
              </div>

              {/* Recent Notes */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Instructor Notes</h3>
                <div className="space-y-4">
                  {selectedStudent.recentNotes.map((note, idx) => (
                    <div key={idx} className="rounded-[12px] border border-border-subtle bg-surface-muted p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-on-surface-variant">{note.instructor}</span>
                        <span className="text-xs text-on-surface-variant">{note.date}</span>
                      </div>
                      <p className="text-sm text-on-surface">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-[14px]" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button className="flex-1 rounded-[14px] gap-2">
                  <IconFileText className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </InstructorShell>
  );
}
