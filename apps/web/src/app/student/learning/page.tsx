'use client';

import * as React from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBolt,
  IconBrain,
  IconCircleCheckFilled,
  IconClockHour4,
  IconLock,
  IconPlayerPlayFilled,
  IconSend2,
  IconUserCircle,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const outlineSteps: Array<{
  title: string;
  state: string;
  complete: boolean;
  current?: boolean;
}> = [
  { title: 'Introduction to Vital Signs', state: 'COMPLETED', complete: true },
  {
    title: 'Measuring Body Temperature & Respiratory Rate',
    state: 'IN PROGRESS',
    complete: false,
    current: true,
  },
  { title: 'Pulse Assessment & Oximetry', state: '', complete: false },
  { title: 'Blood Pressure Techniques', state: '', complete: false },
  { title: 'Clinical Documentation Standards', state: '', complete: false },
] as const;

const suggestionQuestions = [
  'How do I take an accurate pulse?',
  'What are normal BP ranges for elderly?',
  'Explain respiratory rhythm vs depth.',
];

export default function StudentLearningPage() {
  const [tab, setTab] = React.useState<'ai' | 'instructor'>('ai');
  const [message, setMessage] = React.useState('');

  return (
    <main className="h-screen overflow-hidden bg-background text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high">
            <IconArrowLeft className="size-5" />
          </button>
          <div className="mx-2 h-8 w-px bg-border-subtle" />
          <div>
            <span className="block font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Learning Home
            </span>
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-primary">
              Module 4: Vital Signs & Monitoring
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Engagement Progress
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[24px] font-semibold text-primary">
                6.5 <span className="font-sans text-sm text-on-surface-variant">/ 8h</span>
              </span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-high">
                <div className="h-full w-[81%] rounded-full bg-primary" />
              </div>
              <span className="font-mono text-sm font-bold text-success">81%</span>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-border-subtle pl-8">
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <div className="overflow-hidden rounded-full border-2 border-primary-container p-0.5">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAlIAQOrWnQ3pXIjFC7XMyDXOrooYGBlv3TOvWzMFgJYRcBCiCb6POf7Ckye-wxhhZTkWMo3VML3ip-NXf55odJTNh_wdIUTyXOSeEXV33ae1f3yeUtX4D0wjlLlYKcPjCmU4xnQAz9B4xOWasL0PDcBwjyvxEKcOREyEbcb8aG9wUSLd7NlB7RjhzEns5s3wcQ8DEzzcAOg_EmwoJ2ofVHp4djx1YLkY2N5oQnSIu3gspJfJ-8yXAQeg8UGji2pBYbEP38NbDCBL1"
                alt="Student avatar"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-full pt-[72px]">
        <section className="h-[calc(100vh-72px)] w-[70%] overflow-y-auto border-r border-border-subtle bg-white px-8 py-6">
          <div className="mb-6 flex items-center justify-between rounded-[18px] border border-primary/10 bg-surface-low p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
                <IconLock className="size-5" />
              </div>
              <div>
                <p className="font-display text-[18px] font-semibold text-on-surface">
                  Exam locked until required engagement time is met
                </p>
                <p className="text-sm text-on-surface-variant">
                  You need 1.5 more hours of active learning to unlock the final module assessment.
                </p>
              </div>
            </div>
            <button
              disabled
              className="cursor-not-allowed rounded-[14px] bg-surface-variant px-6 py-2.5 font-semibold text-outline opacity-60"
            >
              Take Module Exam
            </button>
          </div>

          <div className="mb-10">
            <h2 className="mb-4 font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
              Understanding the Fundamentals of Patient Monitoring
            </h2>
            <p className="max-w-3xl text-base text-on-surface-variant">
              This module covers the critical procedures for measuring and recording vital signs,
              which are essential indicators of a patient&apos;s physiological status.
            </p>
          </div>

          <div className="group relative mb-10 aspect-video overflow-hidden rounded-[18px] shadow-lg">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8ACNksHtjdcUHUVqett4FhYrcHpeKG2HZxap3TljN-lSkiB7SjE9mZNc76MEY1yRDXc8YLniSDgmu0nvX91gjz178MveFYpyz7sxTuPp5uXRuMtfmurtvVAHHOl4s-jzg7X4qbEtIvrNk4Y3SWL3QoLIvwb1HaVATyVofvFLVlYjcaal8RHX0BGlPwqQ7WjxDz1IRv3-w7Fbw7DBiZEsYT2HxIDracaID146OkwxKEfaV_8cPCid5XY5QL2EMuFnDNvqQghamLOpu')",
              }}
            />
            <div className="absolute inset-0 bg-primary/5 transition group-hover:bg-primary/0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-white shadow-xl transition hover:scale-110">
                <IconPlayerPlayFilled className="size-10" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
              <p className="font-semibold">Lecture: Assessment Techniques for Clinical Practice</p>
              <p className="text-sm opacity-80">Duration: 24:15 / 12.4 MB</p>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="mb-6 flex items-center gap-2 font-display text-[22px] font-semibold text-on-surface">
              <IconClockHour4 className="size-5 text-primary" />
              Module Outline
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {outlineSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`flex items-center gap-4 rounded-[14px] border p-4 ${
                    step.complete
                      ? 'border-success/10 bg-success/5'
                      : step.current
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-border-subtle bg-surface-muted opacity-60'
                  }`}
                >
                  {step.complete ? (
                    <IconCircleCheckFilled className="size-5 text-success" />
                  ) : (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        step.current
                          ? 'border-primary text-primary'
                          : 'border-outline text-on-surface-variant'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      step.current
                        ? 'text-primary'
                        : step.complete
                          ? 'text-on-surface'
                          : 'text-on-surface-variant'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.state ? (
                    <span
                      className={`ml-auto font-mono text-[12px] uppercase ${
                        step.complete ? 'text-success' : 'text-primary'
                      }`}
                    >
                      {step.state}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <article className="mb-24 max-w-none">
            <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">
              The Four Main Vital Signs
            </h3>
            <p className="mb-8 text-base leading-relaxed text-on-surface-variant">
              Vital signs reflect essential body functions, including your heartbeat, breathing
              rate, temperature, and blood pressure. Your healthcare provider may watch, measure, or
              monitor your vital signs to assess your level of physical functioning.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  title: '1. Body Temperature',
                  text: 'A normal body temperature varies depending on the person, age, activity, and time of day. The average is 98.6°F (37°C).',
                },
                {
                  title: '2. Pulse Rate',
                  text: 'The pulse rate is a measurement of the heart rate, or the number of times the heart beats per minute.',
                },
                {
                  title: '3. Respiration Rate',
                  text: 'The respiration rate is the number of breaths a person takes per minute, usually measured when a person is at rest.',
                },
                {
                  title: '4. Blood Pressure',
                  text: 'Blood pressure is the force of the blood pushing against the artery walls during contraction and relaxation of the heart.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[18px] border border-border-subtle bg-surface-muted p-6 transition hover:border-primary/30"
                >
                  <h4 className="mb-2 font-display text-[18px] font-semibold text-primary">
                    {item.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="flex h-[calc(100vh-72px)] w-[30%] flex-col bg-surface-low">
          <div className="flex border-b border-border-subtle px-4 pt-4">
            <button
              className={`flex flex-1 items-center justify-center gap-2 pb-4 ${
                tab === 'ai'
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'font-medium text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setTab('ai')}
            >
              <IconBrain className="size-5" />
              AI Tutor
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-2 pb-4 ${
                tab === 'instructor'
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'font-medium text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setTab('instructor')}
            >
              <IconUserCircle className="size-5" />
              Instructor
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {tab === 'ai' ? (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                      <IconBolt className="size-4" />
                    </div>
                    <div className="max-w-[85%] rounded-bl-xl rounded-br-xl rounded-tr-xl border border-border-subtle bg-white p-3 shadow-sm">
                      <p className="text-sm text-on-surface">
                        Hello! I&apos;m your Clinical Assistant. I&apos;ve analyzed Module 4 for
                        you. Is there anything specific about vital signs you&apos;d like to
                        clarify?
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row-reverse gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-high text-primary">
                      <IconUserCircle className="size-4" />
                    </div>
                    <div className="max-w-[85%] rounded-bl-xl rounded-br-xl rounded-tl-xl bg-primary p-3 text-white shadow-sm">
                      <p className="text-sm">
                        What&apos;s the difference between tachycardia and bradycardia?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                      <IconBolt className="size-4" />
                    </div>
                    <div className="max-w-[85%] rounded-bl-xl rounded-br-xl rounded-tr-xl border border-border-subtle bg-white p-3 shadow-sm">
                      <p className="text-sm text-on-surface">
                        Great question! <strong>Tachycardia</strong> refers to a heart rate that&apos;s
                        too fast, while <strong>bradycardia</strong> is a heart rate that&apos;s too
                        slow.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border-subtle bg-surface p-4">
                  <div className="mb-4 space-y-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">
                      Suggested Questions
                    </p>
                    {suggestionQuestions.map((question) => (
                      <button
                        key={question}
                        className="group flex w-full items-center justify-between rounded-[14px] border border-border-subtle bg-white p-3 text-left text-sm transition hover:border-primary hover:bg-primary/5"
                      >
                        {question}
                        <IconBrain className="size-4 text-primary opacity-0 transition group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Ask your clinical tutor..."
                      className="h-12 rounded-[16px] pr-12"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary transition hover:scale-110">
                      <IconSend2 className="size-5" />
                    </button>
                  </div>
                  <p className="mt-3 text-center text-[10px] text-on-surface-variant/60">
                    AI responses are for educational support. Always verify with clinical standards.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-on-surface-variant">
                Instructor conversation panel is available here for module-specific questions and
                review feedback.
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-[60] flex h-20 items-center justify-between border-t border-border-subtle bg-white/80 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Current Session
            </span>
            <div className="flex items-center gap-2 font-mono text-[24px] font-semibold text-primary">
              <IconClockHour4 className="size-5" />
              <span>6h 30m</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Remaining Requirement
            </span>
            <span className="font-mono text-sm text-on-surface">1h 30m until Exam Unlock</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-12 rounded-[14px] border-2 border-primary text-primary">
            Save & Exit
          </Button>
          <Button className="h-12 rounded-[14px] px-8 shadow-lg shadow-primary/20">
            Continue Learning
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      </footer>
    </main>
  );
}
