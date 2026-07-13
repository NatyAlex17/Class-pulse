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
  IconFileText,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RiskLevel = 'Stable' | 'Watch' | 'Urgent';

interface InstructorStudentRecord {
  id: string;
  name: string;
  cohort: string;
  placement: string;
  checklistCompleted: number;
  checklistTotal: number;
  clinicalHoursCompleted: number;
  clinicalHoursRequired: number;
  risk: RiskLevel;
  email: string;
  phone: string;
  city: string;
  startDate: string;
  certificationStatus: string;
  progressPercent: number;
  absences: number;
  recentNotes: Array<{ date: string; note: string; instructor: string }>;
  skills: Array<{ name: string; level: 'Competent' | 'Developing' | 'Novice' }>;
}

type StudentRow = InstructorStudentRecord & {
  checklist: string;
  hours: string;
};

export default function InstructorStudentsPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [students, setStudents] = React.useState<InstructorStudentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRisk, setFilterRisk] = React.useState<RiskLevel | null>(null);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);

  const fetchStudents = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your students.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch students (${response.status}).`);
      }

      const data = await response.json();
      setStudents(data.data?.students ?? []);
    } catch (err) {
      setStudents([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const rows: StudentRow[] = students.map((student) => ({
    ...student,
    checklist: `${student.checklistCompleted}/${student.checklistTotal}`,
    hours: `${student.clinicalHoursCompleted}/${student.clinicalHoursRequired}`,
  }));

  const filteredStudents = rows.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.cohort.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterRisk || student.risk === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;

  const watchlistCount = students.filter((student) => student.risk === 'Watch' || student.risk === 'Urgent').length;
  const auditReadyCount = students.filter((student) => student.risk === 'Stable').length;

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

  const handleAddNote = async () => {
    if (!selectedStudent || !instructorId || !accessToken || !noteDraft.trim()) return;

    try {
      setSavingNote(true);
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudent.id}/notes`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ note: noteDraft.trim() }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to add note (${response.status}).`);
      }

      const data = await response.json();
      const updated: InstructorStudentRecord = data.data;
      setStudents((current) => current.map((student) => (student.id === updated.id ? updated : student)));
      setNoteDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <InstructorShell
      title="My Students Workspace"
      subtitle="Monitor progress, placement readiness, and checklist health across the modules you teach."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-full px-5">
            Daily roster export
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
              Assigned students
            </p>
            <p className="mt-2 font-mono text-[28px] font-semibold text-primary">{students.length}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Watchlist</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-warning">
              <IconClockHour4 className="size-6" />
              <span>{watchlistCount}</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Audit ready</p>
            <div className="mt-2 flex items-center gap-2 font-mono text-[28px] font-semibold text-success">
              <IconShieldCheck className="size-6" />
              <span>{auditReadyCount}</span>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredStudents}
          mobileCardTitle={(row) => row.name}
          mobileCardSubtitle={(row) => `${row.cohort} / ${row.placement}`}
          onRowClick={(row) => setSelectedStudentId(row.id)}
          rowActions={() => (
            <button className="rounded-full p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-primary">
              <IconDots className="size-4" />
            </button>
          )}
          emptyState={
            loading
              ? 'Loading students...'
              : "No students found in the modules you're approved to teach yet."
          }
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
                onClick={() => {
                  setSelectedStudentId(null);
                  setNoteDraft('');
                }}
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
                    <span className="font-mono text-sm font-bold text-primary">
                      {selectedStudent.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${selectedStudent.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">
                    Certification Status
                  </p>
                  <Badge
                    variant={
                      selectedStudent.certificationStatus === 'On Track'
                        ? 'success'
                        : selectedStudent.certificationStatus === 'Not Started'
                          ? 'neutral'
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
                  {selectedStudent.startDate ? (
                    <div className="flex items-center gap-3">
                      <IconCalendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-on-surface-variant">Started {selectedStudent.startDate}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Clinical Hours & Checklist */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Clinical Hours</p>
                  <p className="font-mono text-2xl font-bold text-primary">
                    {selectedStudent.clinicalHoursCompleted}/{selectedStudent.clinicalHoursRequired}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    of {selectedStudent.clinicalHoursRequired} hours required
                  </p>
                </div>
                <div className="rounded-[16px] border border-border-subtle p-4">
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase mb-2">Checklist</p>
                  <p className="font-mono text-2xl font-bold text-primary">
                    {selectedStudent.checklistCompleted}/{selectedStudent.checklistTotal}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">steps completed</p>
                </div>
              </div>

              {/* Skills Assessment */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Skills Assessment</h3>
                {selectedStudent.skills.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No skills assessed yet.</p>
                ) : (
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
                )}
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
                    : `${selectedStudent.absences} unplanned absence${selectedStudent.absences > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Recent Notes */}
              <div className="rounded-[16px] border border-border-subtle p-4">
                <h3 className="mb-4 font-semibold text-on-surface">Instructor Notes</h3>
                <div className="space-y-4">
                  {selectedStudent.recentNotes.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No notes yet.</p>
                  ) : (
                    selectedStudent.recentNotes.map((note, idx) => (
                      <div key={idx} className="rounded-[12px] border border-border-subtle bg-surface-muted p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-on-surface-variant">{note.instructor}</span>
                          <span className="text-xs text-on-surface-variant">{note.date}</span>
                        </div>
                        <p className="text-sm text-on-surface">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>
                <Textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Write a new note about this student..."
                  className="mt-4"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-[14px]"
                  onClick={() => {
                    setSelectedStudentId(null);
                    setNoteDraft('');
                  }}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 rounded-[14px] gap-2"
                  disabled={!noteDraft.trim() || savingNote}
                  onClick={handleAddNote}
                >
                  <IconFileText className="h-4 w-4" />
                  {savingNote ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </InstructorShell>
  );
}
