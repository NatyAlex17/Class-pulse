'use client';

import * as React from 'react';
import {
  IconHistory,
  IconNotes,
  IconRosetteDiscountCheck,
  IconShieldCheck,
  IconStethoscope,
  IconX,
  IconCheck,
  IconClock,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';

type LogRow = {
  date: string;
  module: string;
  hours: string;
  instructor: string;
  status: 'Verified' | 'Pending';
};

const logColumns: DataTableColumn<LogRow>[] = [
  { id: 'date', header: 'DATE', accessorKey: 'date' },
  { id: 'module', header: 'MODULE', accessorKey: 'module' },
  { id: 'hours', header: 'HOURS', accessorKey: 'hours' },
  { id: 'instructor', header: 'INSTRUCTOR', accessorKey: 'instructor' },
  {
    id: 'status',
    header: 'STATUS',
    cell: (row) => (
      <Badge variant={row.status === 'Verified' ? 'success' : 'warning'}>{row.status}</Badge>
    ),
  },
];

export default function StudentClinicalHoursPage() {
  const [activeTab, setActiveTab] = React.useState('Overview');
  const [showLogModal, setShowLogModal] = React.useState(false);
  const [logFormData, setLogFormData] = React.useState({
    module: 'Vital Signs & Monitoring',
    hours: '4',
    instructor: 'James Miller',
    date: new Date().toISOString().split('T')[0],
  });

  const {
    clinicalHoursCompleted,
    clinicalHoursRequired,
    overallProgressPercent,
    uploads,
    clinicalLogs,
    logClinicalHours,
    lastAction,
  } = useStudentDemo();

  const logRows: LogRow[] = clinicalLogs.map((log) => ({
    date: log.date,
    module: log.module,
    hours: `${log.hours.toFixed(1)} hrs`,
    instructor: log.instructor,
    status: log.status,
  }));

  const handleSubmitLog = () => {
    logClinicalHours();
    setShowLogModal(false);
    setLogFormData({
      module: 'Vital Signs & Monitoring',
      hours: '4',
      instructor: 'James Miller',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <>
      <StudentShell
        title="Clinical Hours"
        subtitle="Track verified hours, pending logs, and compliance readiness."
        topActions={<Button className="rounded-[12px]" onClick={() => setShowLogModal(true)}>Log Practice Session</Button>}
      >
      <div className="mb-8 flex gap-8 overflow-x-auto border-b border-border-subtle pb-3">
        {['Overview', 'Clinical Logs', 'Skills Checklist', 'Audit Timeline'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-2 text-sm ${
              activeTab === tab
                ? 'font-semibold text-primary'
                : 'font-medium text-on-surface-variant transition hover:text-primary'
            }`}
          >
            {tab}
            {activeTab === tab ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-8">
          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">CLINICAL METRICS</h4>
            <div className="space-y-6">
              {[
                {
                  label: 'Verified Clinical Hours',
                  value: `${clinicalHoursCompleted} / ${clinicalHoursRequired} Hours`,
                  width: `${Math.round((clinicalHoursCompleted / clinicalHoursRequired) * 100)}%`,
                  tone: 'bg-secondary',
                },
                {
                  label: 'Overall Program Readiness',
                  value: `${overallProgressPercent}%`,
                  width: `${overallProgressPercent}%`,
                  tone: 'bg-primary',
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="font-mono text-sm">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                    <div className={`h-full ${item.tone}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <h4 className="font-mono text-[12px] text-on-surface-variant">RECENT CLINICAL LOGS</h4>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="p-6">
              <DataTable
                columns={logColumns}
                data={logRows}
                classNames={{
                  desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
                  toolbar: 'hidden',
                }}
              />
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">SUPPORTING DOCUMENTS</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {uploads.slice(0, 2).map((upload) => (
                <div key={upload.id} className="rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{upload.title}</p>
                      <p className="mt-1 text-[12px] text-on-surface-variant">{upload.subtitle}</p>
                    </div>
                    <Badge variant={upload.status === 'Verified' ? 'success' : 'warning'}>
                      {upload.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-on-surface-variant">{upload.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">AUDIT TIMELINE</h4>
            <div className="space-y-8 border-l-2 border-surface-container pl-6">
              {[
                ['TXN_9921_01A', 'Exam Eligibility Confirmed', 'Automated system verification completed.', '2024-10-25 09:14:22', 'primary'],
                ['TXN_9884_55X', 'Log Verified', 'Pediatric Care hours approved by Supervisor.', '2024-10-24 18:45:10', 'success'],
                ['TXN_9100_12B', 'Clinical document refreshed', lastAction, '2024-10-12 11:30:00', 'muted'],
              ].map((event) => (
                <div key={event[0]} className="relative">
                  <div
                    className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-4 border-white ${
                      event[4] === 'primary'
                        ? 'bg-primary'
                        : event[4] === 'success'
                          ? 'bg-success'
                          : 'bg-outline-variant'
                    }`}
                  />
                  <p className={`mb-1 font-mono text-[10px] ${event[4] === 'primary' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {event[0]}
                  </p>
                  <h5 className="text-sm font-bold">{event[1]}</h5>
                  <p className="mt-1 text-xs text-on-surface-variant">{event[2]}</p>
                  <p className="mt-2 font-mono text-[10px] text-on-surface-variant">{event[3]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">READINESS SUMMARY</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <IconStethoscope className="size-5 text-primary" />
                  <span className="text-sm font-semibold">Clinical Logs</span>
                </div>
                <Badge variant="success">On Track</Badge>
              </div>
              <div className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <IconShieldCheck className="size-5 text-primary" />
                  <span className="text-sm font-semibold">Compliance Packet</span>
                </div>
                <Badge variant="warning">1 Pending</Badge>
              </div>
              <div className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <IconRosetteDiscountCheck className="size-5 text-primary" />
                  <span className="text-sm font-semibold">Exam Readiness</span>
                </div>
                <Badge variant="success">Eligible Soon</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold">Student Notes</h4>
              <IconNotes className="size-5 text-primary" />
            </div>
            <p className="mt-4 text-sm text-on-surface-variant">
              This view mirrors a working student clinical area using static data and shared state,
              so stakeholders can see status movement, audit touchpoints, and evidence tracking.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold text-primary">
              <IconHistory className="size-4" />
              Latest action: {lastAction}
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'Clinical Logs' && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
            <div className="border-b border-border-subtle px-6 py-4">
              <h4 className="font-mono text-[12px] text-on-surface-variant">ALL CLINICAL LOGS</h4>
            </div>
            <div className="p-6">
              <DataTable
                columns={logColumns}
                data={logRows}
                classNames={{
                  desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
                  toolbar: 'hidden',
                }}
              />
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h3 className="mb-4 font-semibold text-on-surface">Log Statistics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[14px] bg-surface-muted p-4">
                <p className="text-[12px] font-semibold text-on-surface-variant">Total Hours Logged</p>
                <p className="mt-2 font-mono text-2xl font-bold text-primary">{clinicalHoursCompleted}</p>
              </div>
              <div className="rounded-[14px] bg-surface-muted p-4">
                <p className="text-[12px] font-semibold text-on-surface-variant">Hours Remaining</p>
                <p className="mt-2 font-mono text-2xl font-bold text-secondary">{clinicalHoursRequired - clinicalHoursCompleted}</p>
              </div>
              <div className="rounded-[14px] bg-surface-muted p-4">
                <p className="text-[12px] font-semibold text-on-surface-variant">Verified Entries</p>
                <p className="mt-2 font-mono text-2xl font-bold text-success">{clinicalLogs.filter(log => log.status === 'Verified').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Skills Checklist' && (
        <div className="space-y-6">
          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h3 className="mb-6 font-semibold text-on-surface">Core Clinical Skills Competencies</h3>
            <div className="space-y-4">
              {[
                { skill: 'Vital Signs Assessment', completed: true, hours: '12 hours logged' },
                { skill: 'Patient Communication', completed: true, hours: '8 hours logged' },
                { skill: 'Basic Wound Care', completed: false, hours: '3 of 5 hours' },
                { skill: 'Medication Administration', completed: false, hours: '2 of 6 hours' },
                { skill: 'Electronic Health Records', completed: true, hours: '6 hours logged' },
                { skill: 'Emergency Response Protocols', completed: false, hours: '4 of 8 hours' },
              ].map((item) => (
                <div key={item.skill} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted p-4 transition hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${item.completed ? 'bg-success/20' : 'bg-warning/20'}`}>
                      {item.completed ? (
                        <IconCheck className="h-4 w-4 text-success" />
                      ) : (
                        <IconClock className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{item.skill}</p>
                      <p className="text-[12px] text-on-surface-variant">{item.hours}</p>
                    </div>
                  </div>
                  <Badge variant={item.completed ? 'success' : 'warning'}>
                    {item.completed ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Audit Timeline' && (
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[18px] border border-border-subtle bg-white p-6">
            <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">COMPLETE AUDIT TIMELINE</h4>
            <div className="space-y-8 border-l-2 border-surface-container pl-6">
              {[
                ['TXN_9950_42X', 'Hours Logged', 'Pediatric Care shift completed and recorded.', '2024-10-26 16:22:15', 'primary'],
                ['TXN_9921_01A', 'Exam Eligibility Confirmed', 'Automated system verification completed.', '2024-10-25 09:14:22', 'primary'],
                ['TXN_9884_55X', 'Log Verified', 'Pediatric Care hours approved by Supervisor.', '2024-10-24 18:45:10', 'success'],
                ['TXN_9100_12B', 'Clinical document refreshed', lastAction, '2024-10-12 11:30:00', 'muted'],
                ['TXN_8950_03K', 'Onboarding Complete', 'Student intake packet approved by administration.', '2024-09-15 14:00:00', 'success'],
                ['TXN_8210_99A', 'Program Enrollment', 'Student enrolled in clinical program.', '2024-09-01 08:30:00', 'primary'],
              ].map((event) => (
                <div key={event[0]} className="relative">
                  <div
                    className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-4 border-white ${
                      event[4] === 'primary'
                        ? 'bg-primary'
                        : event[4] === 'success'
                          ? 'bg-success'
                          : 'bg-outline-variant'
                    }`}
                  />
                  <p className={`mb-1 font-mono text-[10px] ${event[4] === 'primary' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {event[0]}
                  </p>
                  <h5 className="text-sm font-bold">{event[1]}</h5>
                  <p className="mt-1 text-xs text-on-surface-variant">{event[2]}</p>
                  <p className="mt-2 font-mono text-[10px] text-on-surface-variant">{event[3]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-[18px] border border-border-subtle bg-white p-6">
              <h3 className="mb-4 font-semibold text-on-surface">Audit Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[14px] bg-surface-muted p-3">
                  <span className="text-sm text-on-surface-variant">Total Entries</span>
                  <span className="font-bold text-primary">{clinicalLogs.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-[14px] bg-surface-muted p-3">
                  <span className="text-sm text-on-surface-variant">Verified</span>
                  <span className="font-bold text-success">{clinicalLogs.filter(log => log.status === 'Verified').length}</span>
                </div>
                <div className="flex items-center justify-between rounded-[14px] bg-surface-muted p-3">
                  <span className="text-sm text-on-surface-variant">Pending Review</span>
                  <span className="font-bold text-warning">{clinicalLogs.filter(log => log.status === 'Pending').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </StudentShell>

      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Log Clinical Hours</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Module</label>
                <select
                  value={logFormData.module}
                  onChange={(e) => setLogFormData({ ...logFormData, module: e.target.value })}
                  className="w-full rounded-[12px] border border-border-subtle px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Vital Signs & Monitoring</option>
                  <option>Patient Care & Hygiene</option>
                  <option>Wound & Infection Control</option>
                  <option>Pediatric Care</option>
                  <option>Emergency Response</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Hours</label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="8"
                    value={logFormData.hours}
                    onChange={(e) => setLogFormData({ ...logFormData, hours: e.target.value })}
                    className="rounded-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Date</label>
                  <Input
                    type="date"
                    value={logFormData.date}
                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                    className="rounded-[12px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Instructor</label>
                <select
                  value={logFormData.instructor}
                  onChange={(e) => setLogFormData({ ...logFormData, instructor: e.target.value })}
                  className="w-full rounded-[12px] border border-border-subtle px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>James Miller</option>
                  <option>Dr. Sarah Chen</option>
                  <option>Patricia Johnson</option>
                  <option>Michael Brown</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 rounded-[12px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitLog}
                  className="flex-1 rounded-[12px]"
                >
                  Log Hours
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
