'use client';

import * as React from 'react';
import {
  IconCalendarMonth,
  IconLayoutList,
  IconMapPin,
  IconX,
  IconPlus,
  IconNote,
  IconTrash,
} from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ScheduleSlot = {
  id: string;
  day: number; // 0-4 for Mon-Fri
  time: string;
  students: Array<{ name: string; cohort: string }>;
  notes: string;
};

const students = ['Alice Smith', 'Marcus Chen', 'Elena Ford', 'Priya Patel', 'James Rodriguez', 'Lisa Wong'];
const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function InstructorClinicalSchedulingPage() {
  const [schedule, setSchedule] = React.useState<ScheduleSlot[]>([
    {
      id: '1',
      day: 0,
      time: '08:00',
      students: [{ name: 'Alice Smith', cohort: 'CNA 12' }],
      notes: 'Vitals Lab - Simulation',
    },
    {
      id: '2',
      day: 1,
      time: '10:00',
      students: [{ name: 'Marcus Chen', cohort: 'CNA 12' }],
      notes: 'Sunrise Care Rotation',
    },
    {
      id: '3',
      day: 2,
      time: '13:00',
      students: [{ name: 'Elena Ford', cohort: 'HHA' }, { name: 'Priya Patel', cohort: 'CNA 13' }],
      notes: 'Competency Assessment',
    },
  ]);

  const [selectedSlot, setSelectedSlot] = React.useState<ScheduleSlot | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState('');
  const [slotNotes, setSlotNotes] = React.useState('');

  const handleAddToSlot = (day: number, time: string) => {
    setSelectedSlot({ id: Date.now().toString(), day, time, students: [], notes: '' });
    setSlotNotes('');
    setSelectedStudent('');
    setShowAddModal(true);
  };

  const handleSaveStudent = () => {
    if (!selectedStudent || !selectedSlot) return;

    const existingSlot = schedule.find((s) => s.day === selectedSlot.day && s.time === selectedSlot.time);

    if (existingSlot) {
      setSchedule(
        schedule.map((s) =>
          s === existingSlot
            ? {
                ...s,
                students: [...s.students, { name: selectedStudent, cohort: 'CNA 12' }],
                notes: slotNotes || s.notes,
              }
            : s
        )
      );
    } else {
      setSchedule([
        ...schedule,
        {
          ...selectedSlot,
          students: [{ name: selectedStudent, cohort: 'CNA 12' }],
          notes: slotNotes,
        },
      ]);
    }

    setShowAddModal(false);
    setSelectedSlot(null);
    setSelectedStudent('');
    setSlotNotes('');
  };

  const handleRemoveStudent = (slotId: string, studentName: string) => {
    setSchedule(
      schedule
        .map((slot) =>
          slot.id === slotId
            ? { ...slot, students: slot.students.filter((s) => s.name !== studentName) }
            : slot
        )
        .filter((slot) => slot.students.length > 0)
    );
  };

  const getSlotContent = (day: number, time: string) => {
    return schedule.find((s) => s.day === day && s.time === time);
  };

  return (
    <InstructorShell
      title="Clinical Scheduling"
      subtitle="Manage rotations, student placements, and assessment blocks."
      topActions={
        <Button className="rounded-[16px] px-5 gap-2">
          <IconPlus className="size-4" />
          Add Slot
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Gantt Chart */}
        <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft overflow-x-auto">
          <div className="mb-5">
            <h3 className="font-display text-[22px] font-semibold">Week Schedule (June 30 - July 4)</h3>
          </div>

          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
              <div className="rounded-t-[12px] bg-surface-muted p-3 text-center text-xs font-bold uppercase">Time</div>
              {days.map((day) => (
                <div key={day} className="rounded-t-[12px] bg-primary p-3 text-center text-xs font-bold uppercase text-white">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {times.map((time) => (
              <div key={time} className="grid gap-1" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                <div className="bg-surface-muted p-3 text-center text-xs font-mono font-bold text-on-surface-variant">{time}</div>
                {days.map((_, dayIndex) => {
                  const slotContent = getSlotContent(dayIndex, time);
                  return (
                    <button
                      key={`${dayIndex}-${time}`}
                      onClick={() => handleAddToSlot(dayIndex, time)}
                      className={`relative min-h-24 rounded-[8px] border-2 p-2 transition ${
                        slotContent
                          ? 'border-primary bg-primary/10'
                          : 'border-dashed border-border-subtle bg-white hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {slotContent ? (
                        <div className="space-y-2">
                          {slotContent.students.map((student) => (
                            <div
                              key={student.name}
                              className="relative rounded-[8px] bg-primary px-2 py-1.5 text-[11px] font-semibold text-white"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="truncate">
                                  <p className="font-bold">{student.name}</p>
                                  <p className="text-[9px] opacity-80">{student.cohort}</p>
                                </div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveStudent(slotContent.id, student.name);
                                  }}
                                  className="cursor-pointer text-white/70 hover:text-white transition"
                                >
                                  <IconX className="h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          ))}
                          {slotContent.notes && (
                            <div className="rounded-[6px] bg-yellow-100 p-1.5 text-[9px] text-yellow-900 line-clamp-2">
                              {slotContent.notes}
                            </div>
                          )}
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

        {/* Summary */}
        <section className="rounded-[20px] border border-border-subtle bg-white p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold">Summary</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase">Total Slots Filled</p>
              <p className="mt-2 font-mono text-2xl font-bold text-primary">{schedule.length}</p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase">Total Students</p>
              <p className="mt-2 font-mono text-2xl font-bold text-success">
                {schedule.reduce((sum, s) => sum + s.students.length, 0)}
              </p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase">With Notes</p>
              <p className="mt-2 font-mono text-2xl font-bold text-warning">{schedule.filter((s) => s.notes).length}</p>
            </div>
            <div className="rounded-[14px] bg-surface-muted p-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase">Empty Slots</p>
              <p className="mt-2 font-mono text-2xl font-bold text-outline">{times.length * days.length - schedule.length}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Add Student Modal */}
      {showAddModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-xl">
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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-[12px] border border-border-subtle px-3 py-2.5 text-sm"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student} value={student}>
                      {student}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Notes (Optional)</label>
                <Textarea
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
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
      )}
    </InstructorShell>
  );
}
