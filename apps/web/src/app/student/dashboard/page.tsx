import Link from 'next/link';
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconCheckupList,
  IconChevronRight,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLocation,
  IconMessageCircle,
  IconPlayerPlayFilled,
  IconSpeakerphone,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';
import { cn } from '@/lib/utils';

const metrics = [
  { label: 'OVERALL PROGRESS', value: '96%', tone: 'text-primary', width: '96%' },
  { label: 'THEORY HOURS', value: '156/160', tone: 'text-success', width: '97.5%' },
  { label: 'CLINICAL HOURS', value: '38/40', tone: 'text-warning', width: '95%' },
  { label: 'ENGAGEMENT', value: '128 hrs', tone: 'text-primary', width: '80%' },
] as const;

const modules = [
  {
    title: 'Module 1: Intro to CNA Role',
    state: 'COMPLETED',
    required: '20h',
    achieved: '22h',
    icon: <IconCircleCheckFilled className="size-6 text-success" />,
    active: false,
  },
  {
    title: 'Module 2: Ethics & Communication',
    state: 'COMPLETED',
    required: '15h',
    achieved: '16h',
    icon: <IconCircleCheckFilled className="size-6 text-success" />,
    active: false,
  },
  {
    title: 'Module 3: Infection Control',
    state: 'COMPLETED',
    required: '25h',
    achieved: '25.5h',
    icon: <IconCircleCheckFilled className="size-6 text-success" />,
    active: false,
  },
  {
    title: 'Module 4: Vital Signs',
    state: 'IN PROGRESS',
    required: '30h',
    achieved: '26h',
    icon: <IconClockHour4 className="size-6 text-primary" />,
    active: true,
  },
] as const;

const tasks = [
  { title: 'Complete 2 theory hours', detail: 'Required for Module 4 completion', complete: false },
  { title: 'Review Module 4 exam prep', detail: 'Access via the Resource library', complete: false },
  { title: 'Submit Clinical Log #03', detail: 'Approved by Instructor Wong', complete: true },
] as const;

const messages = [
  {
    name: 'Lisa Wong',
    role: 'Senior Instructor',
    message: "Great job on your infection control assessment. I've left some detailed feedback...",
    time: '10:45 AM',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA-VXPC6wyH-Dtao0Z8gLwhm4UwEZ1Gx_RCbkpbxxL7D5shHOywYpzjUYQrVdboazNJ44B73g5yg5ROAIrjTQztDnyINsXU9n3mLYthWN3k6_CpnIgRyGtaJw4Z7Do0sQS1mcCh3kPhnvXB5UssCjpXO41uyExnFbV0JxultlCIGLVlvH1driVrQ3bVCybK1jl8uPc7fBbTbt4RCjDWVrvhSb5xnYnExGcNlaZvv1K552DMbvIXcjehNCivUDpduK6dxgMxGljSi4Oa',
  },
  {
    name: 'James Miller',
    role: 'Clinical Supervisor',
    message: "Don't forget to bring your updated clinical manual for our session on Feb 6th...",
    time: 'Yesterday',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDH0mZOWSMx7trNCu82VDJ2D9XM9mqw9qXEnjqZrPkc88TDytSSB-GqakNgqwoc1hQE8vIDAGyD27Z16VcU9-S6OOhDXciCv2JlBYLbhxCEcYC-3XKOcMXapBNW9dBThDx1zo98NF5HSAf8QdtIu1mBZ2KQcNkv0zgsEoUYqx_GUm0NfQER45wNs3s4iryMACPRLV1I5hCIqLLDCgcBdozGqS_obM4KnV_nqymrlacGGMl0wpkgvzli4Ci4TmhH__Bqds72nci92LEw',
  },
] as const;

export default function StudentDashboardPage() {
  return (
    <StudentShell
      title="Welcome Back, Amara"
      subtitle="Golden State Nurse Assistant Training Program"
    >
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-8">
          <div className="group relative overflow-hidden rounded-[18px] border border-border-subtle bg-white p-8 shadow-sm transition hover:shadow-md">
            <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform group-hover:rotate-6">
              <IconCheckupList className="size-[120px] rotate-12 text-primary" />
            </div>
            <div className="relative z-10">
              <Badge variant="primary" className="mb-4">
                Currently In Progress
              </Badge>
              <h3 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
                Resume Module 4: Vital Signs & Monitoring
              </h3>
              <p className="mb-8 mt-2 max-w-xl text-base text-on-surface-variant">
                You are 85% through this module. Complete the final assessment to unlock Clinical
                Simulation prep.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button className="h-14 rounded-[16px] px-8 text-sm">
                  <IconPlayerPlayFilled className="size-4" />
                  Resume Module
                </Button>
                <button className="px-4 py-2 text-sm font-semibold text-primary hover:underline">
                  View Course Map
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[18px] border border-border-subtle bg-white p-4">
              <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                {metric.label}
              </p>
              <p className={cn('mt-1 font-mono text-[24px] font-semibold', metric.tone)}>{metric.value}</p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-surface-container">
                <div
                  className={cn('h-full rounded-full', metric.tone.replace('text-', 'bg-'))}
                  style={{ width: metric.width }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="col-span-12 space-y-6 lg:col-span-8">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-[22px] font-semibold text-on-surface">
                Curriculum Progress
              </h4>
              <Link
                href="/student/progress"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View All <IconChevronRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {modules.map((module) => (
                <div
                  key={module.title}
                  className={cn(
                    'relative flex items-start gap-4 rounded-[18px] border p-5',
                    module.active ? 'border-2 border-primary bg-white shadow-md' : 'border-border-subtle bg-white',
                  )}
                >
                  {module.active ? (
                    <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-[10px] bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      CURRENT
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-[14px]',
                      module.active ? 'bg-primary/10' : 'bg-success/10',
                    )}
                  >
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'mb-1 font-mono text-[12px] font-semibold',
                        module.active ? 'text-primary' : 'text-success',
                      )}
                    >
                      {module.state}
                    </p>
                    <h5 className="mb-3 text-[16px] font-bold text-on-surface">{module.title}</h5>
                    {module.active ? (
                      <>
                        <div className="mb-2 h-1 rounded-full bg-surface-container">
                          <div className="h-full w-[85%] rounded-full bg-primary" />
                        </div>
                        <div className="flex justify-between font-mono text-[11px] text-on-surface-variant">
                          <span>Required: {module.required}</span>
                          <span>Current: {module.achieved}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-mono text-[11px] text-on-surface-variant">
                        <span>Required: {module.required}</span>
                        <span>Achieved: {module.achieved}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-[18px] border border-border-subtle bg-surface-high p-6 md:flex-row">
            <div className="min-w-[100px] rounded-[18px] bg-white p-4 text-center shadow-sm">
              <p className="mb-1 font-mono text-[12px] font-bold uppercase text-error">FEB</p>
              <p className="font-display text-[28px] leading-none">06</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">2:00 PM</p>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-display text-[18px] font-semibold text-on-surface">
                Clinical Session: Module 5 Skills
              </h4>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-on-surface-variant md:justify-start">
                <div className="flex items-center gap-1.5">
                  <IconMessageCircle className="size-4" />
                  <span>Instructor: James Miller</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconLocation className="size-4" />
                  <span>Skills Lab B</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="rounded-[16px] border-primary text-primary hover:bg-primary hover:text-white">
              <IconCalendarEvent className="size-4" />
              Add to Calendar
            </Button>
          </div>
        </section>

        <section className="col-span-12 space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
            <div className="flex items-center justify-between border-b border-border-subtle p-5">
              <h4 className="font-display text-[18px] font-semibold">To-Do List</h4>
              <span className="rounded bg-error-container px-2 py-0.5 text-[11px] font-bold text-error">
                2 Urgent
              </span>
            </div>
            <div className="p-2">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="group flex cursor-pointer items-start gap-3 rounded-[14px] p-3 transition hover:bg-surface-muted"
                >
                  {task.complete ? (
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded bg-success text-white">
                      <IconCheck className="size-3.5" />
                    </div>
                  ) : (
                    <div className="mt-1 h-5 w-5 rounded border-2 border-outline-variant transition group-hover:border-primary" />
                  )}
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold text-on-surface',
                        task.complete && 'line-through opacity-70',
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">{task.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full border-t border-border-subtle p-4 text-center text-sm font-bold text-primary transition hover:bg-surface-low">
              Manage Tasks
            </button>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
            <div className="border-b border-border-subtle p-5">
              <h4 className="font-display text-[18px] font-semibold">Instructor Messages</h4>
            </div>
            <div className="divide-y divide-border-subtle">
              {messages.map((message) => (
                <div key={message.name} className="cursor-pointer p-4 transition hover:bg-surface-muted">
                  <div className="mb-2 flex items-center gap-3">
                    <img className="h-8 w-8 rounded-full object-cover" src={message.image} alt={message.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-on-surface">{message.name}</p>
                      <p className="text-[11px] text-primary">{message.role}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="line-clamp-2 text-sm italic text-on-surface-variant">{message.message}</p>
                  <p className="mt-2 text-right text-[10px] text-outline">{message.time}</p>
                </div>
              ))}
            </div>
            <button className="flex w-full items-center justify-center gap-2 border-t border-border-subtle p-4 text-sm font-bold text-primary transition hover:bg-surface-low">
              Open Inbox
              <IconArrowRight className="size-4" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[18px] bg-primary-container p-6 text-on-primary">
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <IconSpeakerphone className="size-[100px]" />
            </div>
            <h5 className="text-[18px] font-bold">Certification Prep</h5>
            <p className="mb-4 mt-2 text-sm text-white/80">
              Early bird registration for the Spring State Board prep is now open.
            </p>
            <Button variant="secondary" className="rounded-[12px] bg-white text-primary hover:bg-primary-fixed">
              Learn More
            </Button>
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
