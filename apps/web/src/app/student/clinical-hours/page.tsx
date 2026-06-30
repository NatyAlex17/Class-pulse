'use client';

import * as React from 'react';
import {
  IconReportAnalytics,
  IconChevronDown,
  IconFileDescription,
  IconHelpCircle,
  IconMail,
  IconNotes,
  IconPhone,
  IconRosetteDiscountCheck,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

const studentList = [
  { name: 'Amara Singh', id: '#ST-98234', progress: '96%', status: 'EXAM READY', tone: 'success' },
  { name: 'Benjamin Brown', id: '#ST-98112', progress: '65%', status: 'ACTIVE', tone: 'info' },
  { name: 'Caleb Richards', id: '#ST-97005', progress: '22%', status: 'AT RISK', tone: 'error' },
  { name: 'Dianne Russell', id: '#ST-95442', progress: '100%', status: 'COMPLETED', tone: 'neutral' },
] as const;

const logRows = [
  {
    date: 'OCT 24, 2024',
    module: 'Pediatric Care',
    hours: '8.0 hrs',
    instructor: 'Dr. Marcus Vance',
    status: 'Verified',
  },
  {
    date: 'OCT 22, 2024',
    module: 'Emergency Ops',
    hours: '12.5 hrs',
    instructor: 'Elena Rodriguez',
    status: 'Verified',
  },
];

const logColumns: DataTableColumn<(typeof logRows)[number]>[] = [
  { id: 'date', header: 'DATE', accessorKey: 'date' },
  { id: 'module', header: 'MODULE', accessorKey: 'module' },
  { id: 'hours', header: 'HOURS', accessorKey: 'hours' },
  { id: 'instructor', header: 'INSTRUCTOR', accessorKey: 'instructor' },
  {
    id: 'status',
    header: 'STATUS',
    cell: () => <Badge variant="success">Verified</Badge>,
  },
];

const overviewTabs = [
  'Overview',
  'Application',
  'Documents',
  'Theory Progress',
  'Clinical Logs',
  'Skills Checklist',
  'Exams',
  'Audit Timeline',
];

export default function StudentClinicalHoursPage() {
  const [activeTab, setActiveTab] = React.useState('Overview');
  const administrativeDetails: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { label: 'FULL NAME', value: 'Amara V. Singh', icon: IconUser },
    { label: 'DATE OF BIRTH', value: 'May 14, 2001', icon: IconNotes },
    { label: 'GENDER', value: 'Female', icon: IconUser },
    { label: 'SOCIAL SECURITY (LAST 4)', value: '***-**-4491', icon: IconShieldCheck },
    { label: 'PRIMARY EMAIL', value: 'a.singh@university.edu', icon: IconMail },
    { label: 'PHONE NUMBER', value: '+1 (555) 012-9934', icon: IconPhone },
    { label: 'ENROLLMENT TYPE', value: 'Full-Time Accelerated', icon: IconChevronDown },
  ];

  return (
    <main className="h-screen overflow-hidden bg-surface text-on-surface">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-border-subtle bg-surface-muted px-4 py-6">
        <div className="mb-10 px-2">
          <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
            Class Verse
          </h1>
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-on-surface-variant opacity-70">
            Auditor Portal
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { label: 'Compliance Dashboard', icon: IconShieldCheck },
            { label: 'Student Records', icon: IconFileDescription, active: true },
            { label: 'Instructor Qualifications', icon: IconRosetteDiscountCheck },
            { label: 'Clinical Compliance', icon: IconStethoscope },
            { label: 'Program Requirements', icon: IconNotes },
            { label: 'Documents & Evidence', icon: IconFileDescription },
            { label: 'Reports', icon: IconReportAnalytics },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm ${
                  item.active
                    ? 'bg-primary-fixed font-bold text-primary'
                    : 'text-on-surface-variant transition hover:bg-surface-container'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border-subtle px-2 pt-6">
          <div className="flex items-center gap-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCgGlGI8kzXRLXxf6bW1XUwRsupa0rSY7HUSp3uAoVD0YMDuV3mKUfCxkogdN654BEGBBbNRAylVqasz-QMtK4PnV3Je4OAZvZlhUPkUUbvZNEl_Kz6UKe_6IDzBdquba4aJtm4nDQfdWdZ-6rin3__GHIbESsL5i0VcB6i7u7gWLenUR9SuOIP4HkoO7vRF9pw66nZ2U6vmcSWVjWKMleNgh3tN-qe-2jQEX50HLGH_qra-7mq-DzCqOKcGSKVU5AoGm1AkZxxN9o"
              alt="Auditor"
            />
            <div>
              <p className="text-sm font-semibold">Sarah Jenkins</p>
              <p className="text-xs text-on-surface-variant">Senior Auditor</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed left-[240px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex flex-1 items-center gap-6">
          <h2 className="font-display text-[22px] font-semibold">Student Records Audit</h2>
          <div className="relative w-96">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Search by name, ID, or SSN..."
              className="h-10 rounded-[16px] bg-surface-muted pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-lg px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5">
            Program Selector
          </button>
          <button className="rounded-full p-2 transition hover:bg-surface-container">
            <IconSettings className="size-5 text-on-surface-variant" />
          </button>
          <button className="rounded-full p-2 transition hover:bg-surface-container">
            <IconHelpCircle className="size-5 text-on-surface-variant" />
          </button>
        </div>
      </header>

      <main className="ml-[240px] flex h-screen overflow-hidden pt-16">
        <section className="flex w-80 flex-col border-r border-border-subtle bg-surface-muted/30">
          <div className="border-b border-border-subtle bg-surface p-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="h-7 rounded-full px-3 text-xs">
                All
              </Button>
              <Button variant="secondary" size="sm" className="h-7 rounded-full px-3 text-xs">
                Exam Ready
              </Button>
              <Button variant="secondary" size="sm" className="h-7 rounded-full px-3 text-xs">
                At Risk
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {studentList.map((student, index) => (
              <div
                key={student.id}
                className={`cursor-pointer border-b border-border-subtle p-4 transition ${
                  index === 0 ? 'border-l-4 border-primary bg-white' : 'hover:bg-surface-container'
                }`}
              >
                <div className="mb-1 flex items-start justify-between">
                  <span className={`text-sm ${index === 0 ? 'font-bold text-primary' : 'font-semibold'}`}>
                    {student.name}
                  </span>
                  <Badge
                    variant={
                      student.tone === 'success'
                        ? 'success'
                        : student.tone === 'error'
                          ? 'error'
                          : student.tone === 'info'
                            ? 'info'
                            : 'neutral'
                    }
                  >
                    {student.status}
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-on-surface-variant">ID: {student.id}</p>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                    <div
                      className={`h-full ${
                        student.tone === 'success'
                          ? 'bg-primary'
                          : student.tone === 'error'
                            ? 'bg-error'
                            : student.tone === 'info'
                              ? 'bg-secondary'
                              : 'bg-paused'
                      }`}
                      style={{ width: student.progress }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant">{student.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col overflow-y-auto bg-surface-muted">
          <div className="border-b border-border-subtle bg-white px-8 py-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="overflow-hidden rounded-2xl bg-primary-fixed">
                  <img
                    className="h-16 w-16 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-94BAu58THcgbhfO2yAsTymWt4-TnG_xO5x1NDYT8pvltQXh9nkl9WnDolsdbBe-sQpuEnL94_T4trouAO05DDjqizFd-YDZstQJvrk6dJPfXyCs8-NUNgrXoTKSnVj7kuif05AGvCV7cqZP6aAzToRQafpZFzFAbfvSG86Q3FrzriQlvPLTAs8sBnw8t2wXpxqR0GSMnDt6h9aLUmv_JUZKVWGV82_3IMdJg30A8JDjXD1_TE1oXT7ULJub1kxlQw8TB7N132kxZ"
                    alt="Amara Singh"
                  />
                </div>
                <div>
                  <h3 className="font-display text-[30px] font-bold tracking-[-0.02em]">Amara Singh</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                    <span className="font-mono">STUDENT ID: #ST-98234</span>
                    <span className="h-1 w-1 rounded-full bg-outline-variant" />
                    <span className="font-mono">ENROLLMENT: JAN 2024</span>
                    <span className="h-1 w-1 rounded-full bg-outline-variant" />
                    <span className="font-mono font-bold text-success">READY FOR LICENSURE EXAM</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="rounded-[12px]">
                  Print Record
                </Button>
                <Button className="rounded-[12px]">
                  Certify Audit
                </Button>
              </div>
            </div>

            <div className="flex gap-8">
              {overviewTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-sm ${
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
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-5xl space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="rounded-[18px] border border-border-subtle bg-white p-6">
                    <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">COMPLIANCE METRICS</h4>
                    <div className="space-y-6">
                      {[
                        { label: 'Theory Hours', value: '156 / 160 Hours', width: '97.5%', tone: 'bg-primary' },
                        { label: 'Clinical Experience', value: '94 / 100 Hours', width: '94%', tone: 'bg-secondary' },
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
                </div>

                <div className="rounded-[18px] border border-border-subtle bg-white p-6">
                  <h4 className="mb-6 font-mono text-[12px] text-on-surface-variant">AUDIT TIMELINE</h4>
                  <div className="space-y-8 border-l-2 border-surface-container pl-6">
                    {[
                      ['TXN_9921_01A', 'Exam Eligibility Confirmed', 'Automated system verification completed.', '2024-10-25 09:14:22', 'primary'],
                      ['TXN_9884_55X', 'Log Verified', 'Pediatric Care hours approved by Supervisor.', '2024-10-24 18:45:10', 'success'],
                      ['TXN_9100_12B', 'Theory Module Mastery', 'Anatomy & Physiology final quiz: 98%.', '2024-10-12 11:30:00', 'muted'],
                      ['TXN_8502_00Z', 'Application Submitted', 'Official program enrollment processed.', '2024-01-15 08:00:00', 'muted'],
                    ].map((event) => (
                      <div key={event[0]} className={`relative ${event[0] === 'TXN_8502_00Z' ? 'opacity-60' : ''}`}>
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
              </div>

              <div className="rounded-[18px] border border-border-subtle bg-white p-8">
                <h4 className="mb-8 font-mono text-[12px] text-on-surface-variant">ADMINISTRATIVE DETAILS</h4>
                <div className="grid grid-cols-4 gap-x-12 gap-y-8">
                  {administrativeDetails.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label}>
                        <p className="mb-1 font-mono text-[10px] text-on-surface-variant">{item.label}</p>
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="size-4 text-primary/60" />
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                  <div>
                    <p className="mb-1 font-mono text-[10px] text-on-surface-variant">FINANCIAL STATUS</p>
                    <Badge variant="success">CLEAR</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </main>
  );
}
