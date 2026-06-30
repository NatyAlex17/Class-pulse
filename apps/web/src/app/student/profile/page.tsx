'use client';

import * as React from 'react';
import {
  IconArrowRight,
  IconBook,
  IconChartBar,
  IconCircleCheckFilled,
  IconClockHour4,
  IconDroplet,
  IconFlag3,
  IconHistory,
  IconLocation,
  IconMedicalCross,
  IconMessageCircle,
  IconNotes,
  IconSchool,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

type RosterItem = {
  name: string;
  cohort: string;
  progress: string;
  status: 'active' | 'warning' | 'risk';
  initials?: string;
  image?: string;
};

const roster: RosterItem[] = [
  {
    name: 'Amara Singh',
    cohort: 'BSN / COHORT 2024-B',
    progress: '96%',
    status: 'active',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBq4x0DYY2w01ciEf1m7VeANiMfGPDBktJsb_h1k7Vgw4wWkk4CyAqHvwILFopFjz8M6HDkOUtKX5_URfYrd_KIGOXpxKfHI40IO-7W62liB87C-0RLbqFh1jSjzmkXWeW6tODWSxtLKiqzNRHsz4kXtvHqalWHn1_W4cxWZlWiGr8R4OfttgHo9_TWkRco2xYaAQ7XUcjGdiXW5XnDSAEhNcTfCpevc973WQl5Wl-65_UPfMcPWC2CuDsHDItEMf2ViRBNi7R4jckh',
    initials: 'AS',
  },
  { name: 'Julian Vance', cohort: 'BSN / COHORT 2024-B', progress: '82%', status: 'warning', initials: 'JV' },
  { name: 'Elena Rodriguez', cohort: 'BSN / COHORT 2024-A', progress: '64%', status: 'risk', initials: 'ER' },
  { name: 'Marcus Chen', cohort: 'BSN / COHORT 2024-B', progress: '88%', status: 'warning', initials: 'MC' },
  { name: 'Sarah Jenkins', cohort: 'BSN / COHORT 2024-B', progress: '88%', status: 'warning', initials: 'SJ' },
  { name: 'Tariq Aziz', cohort: 'BSN / COHORT 2024-B', progress: '88%', status: 'warning', initials: 'TA' },
];

const clinicalRows = [
  {
    date: '2023-10-25',
    site: 'Mercy General Hospital',
    unit: 'Cardiology Unit',
    preceptor: 'Dr. Robert Chen',
    hours: '08.00',
    status: 'APPROVED',
  },
  {
    date: '2023-10-24',
    site: 'Mercy General Hospital',
    unit: 'Cardiology Unit',
    preceptor: 'Dr. Robert Chen',
    hours: '08.00',
    status: 'APPROVED',
  },
  {
    date: '2023-10-23',
    site: "Saint Luke's Medical Center",
    unit: 'Emergency Room',
    preceptor: 'Nrs. Julia S.',
    hours: '12.00',
    status: 'PENDING',
  },
];

const clinicalColumns: DataTableColumn<(typeof clinicalRows)[number]>[] = [
  { id: 'date', header: 'DATE', accessorKey: 'date' },
  {
    id: 'site',
    header: 'CLINICAL SITE',
    cell: (row) => (
      <div>
        <p className="text-sm font-semibold">{row.site}</p>
        <p className="text-[10px] text-on-surface-variant">{row.unit}</p>
      </div>
    ),
  },
  { id: 'preceptor', header: 'PRECEPTOR', accessorKey: 'preceptor' },
  { id: 'hours', header: 'HOURS', accessorKey: 'hours' },
  {
    id: 'status',
    header: 'STATUS',
    cell: (row) =>
      row.status === 'APPROVED' ? (
        <Badge variant="success">APPROVED</Badge>
      ) : (
        <Badge variant="warning">PENDING</Badge>
      ),
  },
];

const tabItems = [
  'Overview',
  'Application',
  'Learning',
  'Clinical',
  'Skills Checklist',
  'Documents',
  'Financials',
  'Messages',
  'Notes',
  'Audit Trail',
];

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = React.useState('Overview');

  return (
    <main className="h-screen overflow-hidden bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-border-subtle bg-surface-muted">
        <div className="p-6">
          <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
            Class Verse Admin
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant opacity-60">
            Healthcare Education
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {[
            { label: 'Dashboard', icon: IconChartBar },
            { label: 'Programs', icon: IconSchool },
            { label: 'Students', icon: IconUsers, active: true },
            { label: 'Compliance', icon: IconShieldCheck },
            { label: 'Clinical Logs', icon: IconMedicalCross },
            { label: 'Audit Trail', icon: IconHistory },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm ${
                  item.active
                    ? 'border-r-4 border-primary bg-primary-container/10 font-bold text-primary'
                    : 'text-on-surface-variant transition hover:bg-surface-high'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border-subtle bg-surface-low/50 p-4">
          <Button className="mb-4 h-11 w-full rounded-[16px]">
            Generate Report
          </Button>
          <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-on-surface-variant transition hover:text-primary">
            <IconSettings className="size-4" />
            Settings
          </button>
        </div>
      </aside>

      <header className="fixed left-[240px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex flex-1 items-center gap-6">
          <div className="relative w-full max-w-md">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Search students, clinical sites..."
              className="h-10 rounded-full border-0 bg-surface-container pl-10"
            />
          </div>
          <div className="hidden gap-6 lg:flex">
            <button className="border-b-2 border-primary pb-1 text-sm font-bold text-primary">Programs</button>
            <button className="text-sm text-on-surface-variant">Analytics</button>
            <button className="text-sm text-on-surface-variant">Logs</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-border-subtle" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold">Admin Console</p>
              <p className="text-[10px] text-on-surface-variant">Healthcare Ops</p>
            </div>
            <img
              className="h-9 w-9 rounded-full border border-border-subtle object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2OVk2Zl_iQyga90gHE8TFlR0wTr3ksOM0sD56rALVIWYzDgiKpxBhSINEkDS3lMmyStKiIKrrdmsKsZwIJCbr-rt43ZQrxXwCLuRAVYnQ86_ouvTlA9OjiUBHEeZeSi5R0MpXT16zB1cZQPWoMSRTLU_YTBv7ttKWYJwbp6UfncVxThxbrbaVOW8H_O2yC8glKxJhfnc7cCR8-MwkapUiYc5G324iGKndYLMj50lCU4RVBeCBAGAnp-itk3cwSIcbxH3zZKM5GuiD"
              alt="Admin"
            />
          </div>
        </div>
      </header>

      <main className="ml-[240px] flex h-screen overflow-hidden pt-16">
        <section className="flex w-80 flex-col border-r border-border-subtle bg-surface-muted/30">
          <div className="border-b border-border-subtle p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[22px] font-semibold">Student Roster</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                124 TOTAL
              </span>
            </div>
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input placeholder="Quick filter..." className="h-9 rounded-[12px] pl-9 text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {roster.map((student, index) => (
              <div
                key={student.name}
                className={`flex cursor-pointer items-center gap-3 border-b border-border-subtle p-4 transition ${
                  index === 0
                    ? 'border-l-4 border-primary bg-white shadow-sm'
                    : 'hover:bg-surface-low'
                }`}
              >
                {student.image ? (
                  <img className="h-10 w-10 rounded-full object-cover" src={student.image} alt={student.name} />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-high text-xs font-bold text-on-surface-variant">
                    {student.initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className={`truncate text-sm ${index === 0 ? 'font-bold text-primary' : 'font-semibold text-on-surface-variant'}`}>
                      {student.name}
                    </h3>
                    <span
                      className={`font-mono text-[10px] ${
                        student.status === 'active'
                          ? 'text-success'
                          : student.status === 'risk'
                            ? 'text-error'
                            : 'text-warning'
                      }`}
                    >
                      {student.progress}
                    </span>
                  </div>
                  <p className="truncate font-mono text-[11px] text-on-surface-variant">{student.cohort}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col overflow-y-auto bg-white">
          <div className="border-b border-border-subtle bg-surface-bright/50 p-8">
            <div className="mb-8 flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    className="h-24 w-24 rounded-2xl border-2 border-white object-cover shadow-lg"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz7JfU1KwFuLnEo8rQ_OlNzVaVcld2yA02c4Da13Ox4UAwu56s1osUgtjz1Y56-m11p1DznONZ1RAyfZJdh-C9f0lq4DOiyA5Qe4w5q91jFqfkZJuI0uitWYhT9eRfh3eeQTzq2Hy0WElbEZyqq81mC1fU0frtNVYrnM75KU5p1a06rF4MT3MyBm9SHcYkdS6VHHd1k1tx41rqfgubFYY9o28azQagLqDaNF8MmpG0gK31ArOddoB3NQamX3IwPsf6A-wc9eNK9IxO"
                    alt="Amara Singh"
                  />
                  <span className="absolute -bottom-2 -right-2 rounded-lg border-2 border-white bg-success px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    ACTIVE
                  </span>
                </div>
                <div>
                  <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-on-surface">
                    Amara Singh
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                    <span className="font-semibold text-primary">Student ID: #9928-11</span>
                    <span>|</span>
                    <span>Bachelor of Science in Nursing (BSN)</span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <IconLocation className="size-4" />
                      San Francisco Campus
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-xs">
                      Edit Profile
                    </Button>
                    <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-xs">
                      <IconFlag3 className="size-4" />
                      Flag Account
                    </Button>
                    <Button className="rounded-[12px] text-xs">
                      Contact Student
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-[14px] border border-border-subtle bg-white p-4 shadow-sm">
                <div className="border-r border-border-subtle px-4 text-center">
                  <p className="mb-1 font-mono text-[12px] text-on-surface-variant">GPA</p>
                  <p className="font-mono text-xl font-bold text-primary">3.92</p>
                </div>
                <div className="px-4 text-center">
                  <p className="mb-1 font-mono text-[12px] text-on-surface-variant">COMPLIANCE</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <p className="font-mono text-xl font-bold text-success">Pass</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'THEORY HOURS', value: '156 / 160', note: '+12.5h week', width: '97.5%', tone: 'bg-primary', icon: IconBook },
                { label: 'CLINICAL HOURS', value: '38 / 40', note: 'On Schedule', width: '95%', tone: 'bg-secondary', icon: IconMedicalCross },
                { label: 'OVERALL PROGRESS', value: '96%', note: 'EXCELLENT', width: '96%', tone: 'bg-success', icon: IconChartBar },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="group rounded-[18px] border border-border-subtle bg-white p-5 transition hover:border-primary/30">
                    <p className="mb-3 flex items-center justify-between font-mono text-[12px] text-on-surface-variant">
                      {card.label}
                      <Icon className="size-4 opacity-40 transition group-hover:opacity-100" />
                    </p>
                    <div className="mb-4 flex items-end justify-between">
                      <h2 className="font-mono text-2xl font-semibold">
                        <span className="text-primary">{card.value}</span>
                      </h2>
                      <p className="font-mono text-xs font-bold text-success">{card.note}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-highest">
                      <div className={`h-full ${card.tone}`} style={{ width: card.width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sticky top-0 z-10 border-b border-border-subtle bg-white px-8">
            <nav className="flex gap-8 overflow-x-auto">
              {tabItems.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap py-4 text-sm ${
                    activeTab === tab
                      ? 'font-semibold text-primary'
                      : 'text-on-surface-variant transition hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-8 p-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 space-y-8 lg:col-span-8">
                <div className="rounded-[18px] border border-border-subtle bg-white p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-display text-[18px] font-semibold">Program Trajectory</h3>
                    <button className="flex items-center gap-1 text-xs font-bold text-primary">
                      VIEW DETAILED LOGS <IconArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    {[
                      {
                        icon: IconBook,
                        title: 'Core Nursing Fundamentals II',
                        progress: '14 / 15 Modules',
                        width: '93%',
                        badge: 'ON TRACK',
                      },
                      {
                        icon: IconDroplet,
                        title: 'Anatomy & Physiology Practicum',
                        progress: 'Complete',
                        width: '100%',
                        badge: 'PASSED',
                        success: true,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                            <Icon className="size-5" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex justify-between">
                              <p className="text-sm font-semibold">{item.title}</p>
                              <p className="font-mono text-xs">{item.progress}</p>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-surface-low">
                              <div className={`h-full ${item.success ? 'bg-success' : 'bg-primary'}`} style={{ width: item.width }} />
                            </div>
                          </div>
                          <Badge variant="success">{item.badge}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="mb-4 flex items-center gap-2 font-mono text-[12px] text-on-surface-variant">
                      <IconShieldCheck className="size-4" />
                      COMPLIANCE RISKS
                    </h4>
                    <div className="space-y-3">
                      {[
                        { title: 'Immunization Records', meta: 'EXP: 2025-12-01', ok: true },
                        { title: 'Background Check', meta: 'VERIFIED', ok: true },
                        { title: 'TB Test Renewal', meta: 'DUE IN 14 DAYS', ok: false },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className={`flex items-center justify-between rounded-[16px] border p-3 ${
                            item.ok ? 'border-border-subtle bg-white' : 'border-warning/20 bg-warning/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.ok ? (
                              <IconCircleCheckFilled className="size-5 text-success" />
                            ) : (
                              <IconClockHour4 className="size-5 text-warning" />
                            )}
                            <span className={`text-sm ${item.ok ? '' : 'font-semibold'}`}>{item.title}</span>
                          </div>
                          <span className={`font-mono text-[11px] ${item.ok ? 'text-on-surface-variant' : 'text-warning'}`}>
                            {item.meta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="mb-4 flex items-center gap-2 font-mono text-[12px] text-on-surface-variant">
                      <IconChartBar className="size-4" />
                      ENGAGEMENT TRENDS
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="font-mono text-2xl font-bold text-primary">24.5h</p>
                          <p className="font-mono text-[11px] text-on-surface-variant">LAST 7 DAYS ACTIVITY</p>
                        </div>
                        <div className="flex h-12 items-end gap-1">
                          {[4, 8, 10, 6, 12, 9, 5].map((h, i) => (
                            <div
                              key={i}
                              className={`w-2 rounded-t ${
                                i === 4
                                  ? 'bg-primary'
                                  : i > 4
                                    ? 'bg-primary/80'
                                    : 'bg-primary/40'
                              }`}
                              style={{ height: `${h * 4}px` }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-on-surface-variant">
                        Student engagement is <span className="font-bold text-success">18% higher</span>{' '}
                        than the cohort average for this period. No attendance issues noted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 space-y-8 lg:col-span-4">
                <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
                  <div className="flex items-center justify-between border-b border-border-subtle bg-surface-container p-4">
                    <h3 className="text-sm font-bold">Internal Instructor Notes</h3>
                    <IconNotes className="size-5 text-primary" />
                  </div>
                  <div className="max-h-[300px] space-y-6 overflow-y-auto p-5">
                    {[
                      {
                        meta: 'DR. SARAH MILLER / 2 DAYS AGO',
                        note: 'Amara showed exceptional leadership during the simulation lab yesterday. She managed a complex cardiac arrest scenario with calmness and precision.',
                        pinned: true,
                      },
                      {
                        meta: 'PROF. JASON REED / OCT 12, 2023',
                        note: 'Discussed clinical placement options for next semester. Student expressed interest in Critical Care.',
                        pinned: false,
                      },
                    ].map((note) => (
                      <div key={note.meta} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[10px] text-on-surface-variant">{note.meta}</p>
                          {note.pinned ? <IconNotes className="size-3.5 text-on-surface-variant" /> : null}
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
                  <div className="border-b border-border-subtle bg-surface-container p-4">
                    <h3 className="text-sm font-bold">Recent Audit Trail</h3>
                  </div>
                  <div>
                    {[
                      ['Clinical Hour Approval', 'SYSTEM / 14:22:05'],
                      ['Transcript Uploaded', 'ADMIN_JS / 09:12:44'],
                      ['Profile Field Update', 'SYSTEM / 08:30:12'],
                    ].map((item) => (
                      <div key={item[0]} className="flex items-center justify-between border-b border-border-subtle p-3 transition hover:bg-surface-muted">
                        <div>
                          <p className="text-[11px] font-bold">{item[0]}</p>
                          <p className="font-mono text-[10px] uppercase text-on-surface-variant">{item[1]}</p>
                        </div>
                        <IconHistory className="size-4 text-on-surface-variant" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle p-6">
                <div>
                  <h3 className="font-display text-[18px] font-semibold">Recent Clinical Logs</h3>
                  <p className="text-xs text-on-surface-variant">Last 5 entries for Clinical Practicum I</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-xs">
                    Export CSV
                  </Button>
                  <Button className="rounded-[12px] text-xs">Approve All</Button>
                </div>
              </div>
              <div className="p-6">
                <DataTable
                  columns={clinicalColumns}
                  data={clinicalRows}
                  classNames={{
                    desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
                    toolbar: 'hidden',
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <button className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition hover:scale-110">
        <IconMessageCircle className="size-5" />
        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg border border-border-subtle bg-white px-3 py-1.5 text-xs font-bold text-primary opacity-0 shadow-sm transition group-hover:opacity-100">
          Quick Message Amara
        </span>
      </button>
    </main>
  );
}
