'use client';

import * as React from 'react';
import {
  IconCalendarMonth,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ScheduledStudent = {
  id: string;
  name: string;
  cohort: string;
};

type ScheduleSlot = {
  id: string;
  weekStart: string;
  day: number;
  time: string;
  students: ScheduledStudent[];
  notes: string;
};

type TaughtStudent = {
  id: string;
  name: string;
  cohort: string;
};

const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function startOfWeek(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addWeeks(date: Date, amount: number) {
  return addDays(date, amount * 7);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 4);
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'long' });

  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
  }

  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
}

function formatDayLabel(weekStart: Date, dayIndex: number) {
  return addDays(weekStart, dayIndex).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isCurrentWeek(weekStart: Date) {
  return toIsoDate(startOfWeek(new Date())) === toIsoDate(weekStart);
}

export default function InstructorClinicalSchedulingPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const initialWeekStart = React.useMemo(() => startOfWeek(new Date()), []);
  const [selectedWeekStart, setSelectedWeekStart] = React.useState(initialWeekStart);
  const [schedule, setSchedule] = React.useState<ScheduleSlot[]>([]);
  const [taughtStudents, setTaughtStudents] = React.useState<TaughtStudent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = React.useState<{ id: string | null; day: number; time: string } | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [slotNotes, setSlotNotes] = React.useState('');
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your clinical schedule.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [scheduleResponse, studentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-scheduling`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE_URL}/instructors/${instructorId}/students`, { headers, cache: 'no-store' }),
      ]);

      if (!scheduleResponse.ok) {
        throw new Error(`Failed to fetch schedule (${scheduleResponse.status}).`);
      }
      if (!studentsResponse.ok) {
        throw new Error(`Failed to fetch students (${studentsResponse.status}).`);
      }

      const scheduleData = await scheduleResponse.json();
      const studentsData = await studentsResponse.json();
      setSchedule(scheduleData.data ?? []);
      setTaughtStudents(studentsData.data?.students ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clinical scheduling.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const weekStartIso = toIsoDate(selectedWeekStart);
  const weekSchedule = schedule.filter((slot) => slot.weekStart === weekStartIso);
  const totalStudentsScheduled = weekSchedule.reduce((sum, slot) => sum + slot.students.length, 0);

  const getSlotContent = React.useCallback(
    (day: number, time: string) => weekSchedule.find((slot) => slot.day === day && slot.time === time),
    [weekSchedule],
  );

  function handleAddToSlot(day: number, time: string) {
    const existingSlot = getSlotContent(day, time);
    setSelectedSlot({ id: existingSlot?.id ?? null, day, time });
    setSlotNotes(existingSlot?.notes ?? '');
    setSelectedStudentId('');
    setModalError(null);
    setShowAddModal(true);
  }

  async function handleSaveStudent() {
    if (!selectedStudentId || !selectedSlot || !instructorId || !accessToken) {
      return;
    }

    try {
      setSaving(true);
      setModalError(null);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      let slotId = selectedSlot.id;

      if (!slotId) {
        const createResponse = await fetch(`${API_BASE_URL}/instructors/${instructorId}/clinical-scheduling/slots`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            weekStart: weekStartIso,
            day: selectedSlot.day,
            time: selectedSlot.time,
            notes: slotNotes,
          }),
        });

        if (!createResponse.ok) {
          const payload = await createResponse.json().catch(() => null);
          throw new Error(payload?.error?.message ?? `Failed to create slot (${createResponse.status}).`);
        }

        const createData = await createResponse.json();
        slotId = createData.data.id;
      }

      const assignResponse = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/clinical-scheduling/slots/${slotId}/students`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ studentId: selectedStudentId, notes: slotNotes || undefined }),
        },
      );

      if (!assignResponse.ok) {
        const payload = await assignResponse.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to assign student (${assignResponse.status}).`);
      }

      await fetchAll();
      setShowAddModal(false);
      setSelectedSlot(null);
      setSelectedStudentId('');
      setSlotNotes('');
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveStudent(slotId: string, studentId: string) {
    if (!instructorId || !accessToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/clinical-scheduling/slots/${slotId}/students/${studentId}/remove`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to remove student (${response.status}).`);
      }

      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student.');
    }
  }

  const studentOptions = taughtStudents.map((student) => ({ label: student.name, value: student.id }));

  return (
    <InstructorShell
      title="Clinical Scheduling"
      subtitle="Manage rotations, student placements, and assessment blocks."
      topActions={
        <Button className="gap-2 rounded-[16px] px-5" onClick={() => handleAddToSlot(0, times[0])}>
          <IconPlus className="size-4" />
          Add Slot
        </Button>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        <section className="overflow-x-auto rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="font-display text-[22px] font-semibold">
                Week Schedule ({formatWeekRange(selectedWeekStart)})
              </h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Pick any date and the board updates to that Monday through Friday range.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-[16px] border border-border-subtle bg-surface-muted p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[12px]"
                  onClick={() => setSelectedWeekStart((current) => addWeeks(current, -1))}
                >
                  <IconChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[12px]"
                  onClick={() => setSelectedWeekStart(startOfWeek(new Date()))}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[12px]"
                  onClick={() => setSelectedWeekStart((current) => addWeeks(current, 1))}
                >
                  <IconChevronRight className="size-4" />
                </Button>
              </div>

              <label className="flex items-center gap-3 rounded-[16px] border border-border-subtle bg-surface px-4 py-2.5">
                <IconCalendarMonth className="size-4 text-primary" />
                <span className="text-sm font-semibold text-on-surface">Week of</span>
                <Input
                  type="date"
                  value={weekStartIso}
                  onChange={(event) =>
                    setSelectedWeekStart(startOfWeek(new Date(`${event.target.value}T00:00:00`)))
                  }
                  className="h-auto min-w-[150px] border-0 bg-transparent px-0 py-0 text-sm shadow-none focus:ring-0"
                />
              </label>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-on-surface-variant">
              <span className="font-semibold text-on-surface">{weekSchedule.length}</span> filled time blocks
            </div>
            <div className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-on-surface-variant">
              <span className="font-semibold text-on-surface">{totalStudentsScheduled}</span> student placements
            </div>
            <div className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-on-surface-variant">
              {isCurrentWeek(selectedWeekStart) ? 'Viewing current week' : 'Viewing selected week'}
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-on-surface-variant">Loading schedule...</div>
          ) : (
            <div className="min-w-[980px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                <div className="rounded-t-[12px] bg-surface-muted p-3 text-center text-xs font-bold uppercase">
                  Time
                </div>
                {days.map((day, index) => (
                  <div
                    key={day}
                    className="rounded-t-[12px] bg-primary p-3 text-center text-xs font-bold uppercase text-on-primary"
                  >
                    <div>{day}</div>
                    <div className="mt-1 text-[10px] font-medium text-on-primary/80">
                      {formatDayLabel(selectedWeekStart, index)}
                    </div>
                  </div>
                ))}
              </div>

              {times.map((time) => (
                <div key={time} className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                  <div className="bg-surface-muted p-3 text-center text-xs font-mono font-bold text-on-surface-variant">
                    {time}
                  </div>
                  {days.map((_, dayIndex) => {
                    const slotContent = getSlotContent(dayIndex, time);

                    return (
                      <button
                        key={`${dayIndex}-${time}`}
                        onClick={() => handleAddToSlot(dayIndex, time)}
                        className={`relative min-h-24 rounded-[8px] border-2 p-2 text-left transition ${
                          slotContent
                            ? 'border-primary bg-primary/10'
                            : 'border-dashed border-border-subtle bg-surface hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        {slotContent ? (
                          <div className="space-y-2">
                            {slotContent.students.map((student) => (
                              <div
                                key={student.id}
                                className="relative rounded-[8px] bg-primary px-2 py-1.5 text-[11px] font-semibold text-on-primary"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="truncate">
                                    <p className="font-bold">{student.name}</p>
                                    <p className="text-[9px] opacity-80">{student.cohort}</p>
                                  </div>
                                  <div
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      void handleRemoveStudent(slotContent.id, student.id);
                                    }}
                                    className="cursor-pointer text-on-primary/70 transition hover:text-on-primary"
                                  >
                                    <IconX className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {slotContent.notes ? (
                              <div className="line-clamp-2 rounded-[6px] bg-warning/15 p-1.5 text-[9px] text-warning">
                                {slotContent.notes}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-[12px] text-on-surface-variant/50">
                            <IconPlus className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold">Summary</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold uppercase text-on-surface-variant">Total Slots Filled</p>
              <p className="mt-2 font-mono text-2xl font-bold text-primary">{weekSchedule.length}</p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold uppercase text-on-surface-variant">Total Students</p>
              <p className="mt-2 font-mono text-2xl font-bold text-success">{totalStudentsScheduled}</p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold uppercase text-on-surface-variant">With Notes</p>
              <p className="mt-2 font-mono text-2xl font-bold text-warning">
                {weekSchedule.filter((slot) => slot.notes).length}
              </p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold uppercase text-on-surface-variant">Empty Slots</p>
              <p className="mt-2 font-mono text-2xl font-bold text-outline">
                {times.length * days.length - weekSchedule.length}
              </p>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && selectedSlot ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-on-surface">
                Add to {days[selectedSlot.day]} at {selectedSlot.time}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            {modalError ? (
              <div className="mb-4 rounded-[12px] border border-error/20 bg-error/5 p-3 text-sm text-error">
                {modalError}
              </div>
            ) : null}

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Selected Week</label>
                <Input value={formatWeekRange(selectedWeekStart)} readOnly className="rounded-[12px]" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Select Student</label>
                {studentOptions.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    You don&apos;t have any students yet. Students appear here once they&apos;re enrolled in a
                    module you teach.
                  </p>
                ) : (
                  <Select
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                    options={studentOptions}
                    placeholder="Choose a student..."
                    className="rounded-[12px]"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Notes (Optional)</label>
                <Textarea
                  value={slotNotes}
                  onChange={(event) => setSlotNotes(event.target.value)}
                  placeholder="Add notes about this session..."
                  className="rounded-[12px]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1 rounded-[12px]">
                Cancel
              </Button>
              <Button
                onClick={() => void handleSaveStudent()}
                disabled={!selectedStudentId || saving}
                className="flex-1 rounded-[12px]"
              >
                {saving ? 'Saving...' : 'Add to Schedule'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </InstructorShell>
  );
}
