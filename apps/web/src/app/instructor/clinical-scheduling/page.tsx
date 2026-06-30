'use client';

import * as React from 'react';
import {
  IconCalendarMonth,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type ScheduledStudent = {
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

const students = [
  { label: 'Alice Smith', value: 'Alice Smith' },
  { label: 'Marcus Chen', value: 'Marcus Chen' },
  { label: 'Elena Ford', value: 'Elena Ford' },
  { label: 'Priya Patel', value: 'Priya Patel' },
  { label: 'James Rodriguez', value: 'James Rodriguez' },
  { label: 'Lisa Wong', value: 'Lisa Wong' },
] as const;

const studentCohorts: Record<string, string> = {
  'Alice Smith': 'CNA 12',
  'Marcus Chen': 'CNA 12',
  'Elena Ford': 'HHA',
  'Priya Patel': 'CNA 13',
  'James Rodriguez': 'CNA 13',
  'Lisa Wong': 'HHA',
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
  const initialWeekStart = React.useMemo(() => startOfWeek(new Date('2026-06-30')), []);
  const [selectedWeekStart, setSelectedWeekStart] = React.useState(initialWeekStart);
  const [schedule, setSchedule] = React.useState<ScheduleSlot[]>([
    {
      id: '1',
      weekStart: '2026-06-29',
      day: 0,
      time: '08:00',
      students: [{ name: 'Alice Smith', cohort: 'CNA 12' }],
      notes: 'Vitals Lab - Simulation',
    },
    {
      id: '2',
      weekStart: '2026-06-29',
      day: 1,
      time: '10:00',
      students: [{ name: 'Marcus Chen', cohort: 'CNA 12' }],
      notes: 'Sunrise Care Rotation',
    },
    {
      id: '3',
      weekStart: '2026-06-29',
      day: 2,
      time: '13:00',
      students: [
        { name: 'Elena Ford', cohort: 'HHA' },
        { name: 'Priya Patel', cohort: 'CNA 13' },
      ],
      notes: 'Competency Assessment',
    },
  ]);

  const [selectedSlot, setSelectedSlot] = React.useState<ScheduleSlot | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState('');
  const [slotNotes, setSlotNotes] = React.useState('');

  const weekStartIso = toIsoDate(selectedWeekStart);
  const weekSchedule = schedule.filter((slot) => slot.weekStart === weekStartIso);
  const totalStudentsScheduled = weekSchedule.reduce((sum, slot) => sum + slot.students.length, 0);

  const getSlotContent = React.useCallback(
    (day: number, time: string) =>
      weekSchedule.find((slot) => slot.day === day && slot.time === time),
    [weekSchedule],
  );

  function handleAddToSlot(day: number, time: string) {
    const existingSlot = getSlotContent(day, time);

    setSelectedSlot(
      existingSlot ?? {
        id: Date.now().toString(),
        weekStart: weekStartIso,
        day,
        time,
        students: [],
        notes: '',
      },
    );
    setSlotNotes(existingSlot?.notes ?? '');
    setSelectedStudent('');
    setShowAddModal(true);
  }

  function handleSaveStudent() {
    if (!selectedStudent || !selectedSlot) {
      return;
    }

    const existingSlot = schedule.find(
      (slot) =>
        slot.weekStart === selectedSlot.weekStart &&
        slot.day === selectedSlot.day &&
        slot.time === selectedSlot.time,
    );

    if (existingSlot) {
      const alreadyScheduled = existingSlot.students.some(
        (student) => student.name === selectedStudent,
      );

      setSchedule(
        schedule.map((slot) =>
          slot.id === existingSlot.id
            ? {
                ...slot,
                students: alreadyScheduled
                  ? slot.students
                  : [
                      ...slot.students,
                      {
                        name: selectedStudent,
                        cohort: studentCohorts[selectedStudent] ?? 'CNA 12',
                      },
                    ],
                notes: slotNotes || slot.notes,
              }
            : slot,
        ),
      );
    } else {
      setSchedule([
        ...schedule,
        {
          ...selectedSlot,
          students: [
            {
              name: selectedStudent,
              cohort: studentCohorts[selectedStudent] ?? 'CNA 12',
            },
          ],
          notes: slotNotes,
        },
      ]);
    }

    setShowAddModal(false);
    setSelectedSlot(null);
    setSelectedStudent('');
    setSlotNotes('');
  }

  function handleRemoveStudent(slotId: string, studentName: string) {
    setSchedule(
      schedule
        .map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                students: slot.students.filter((student) => student.name !== studentName),
              }
            : slot,
        )
        .filter((slot) => slot.students.length > 0),
    );
  }

  return (
    <InstructorShell
      title="Clinical Scheduling"
      subtitle="Manage rotations, student placements, and assessment blocks."
      topActions={
        <Button
          className="gap-2 rounded-[16px] px-5"
          onClick={() => handleAddToSlot(0, times[0])}
        >
          <IconPlus className="size-4" />
          Add Slot
        </Button>
      }
    >
      <div className="space-y-6">
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
                              key={student.name}
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
                                    handleRemoveStudent(slotContent.id, student.name);
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

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Selected Week</label>
                <Input value={formatWeekRange(selectedWeekStart)} readOnly className="rounded-[12px]" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Select Student</label>
                <Select
                  value={selectedStudent}
                  onChange={(event) => setSelectedStudent(event.target.value)}
                  options={[...students]}
                  placeholder="Choose a student..."
                  className="rounded-[12px]"
                />
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
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-[12px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveStudent}
                disabled={!selectedStudent}
                className="flex-1 rounded-[12px]"
              >
                Add to Schedule
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </InstructorShell>
  );
}
