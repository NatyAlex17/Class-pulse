'use client';

import {
  IconCircleCheckFilled,
  IconClipboardCheck,
  IconFileUpload,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function StudentOnboardingPage() {
  const {
    onboardingQuestions,
    onboardingSubmitted,
    onboardingProgressPercent,
    workflowStage,
    portalUnlocked,
    acknowledgements,
    readinessUploads,
    answerOnboardingQuestion,
    toggleAcknowledgement,
    toggleReadinessUpload,
    submitOnboardingPackage,
  } = useStudentDemo();

  const allQuestionsAnswered = onboardingQuestions.every((question) => question.answer.trim());
  const allChecksComplete =
    Object.values(acknowledgements).every(Boolean) &&
    Object.values(readinessUploads).every(Boolean);
  const readyToSubmit = allQuestionsAnswered && allChecksComplete;

  return (
    <StudentShell
      title="Onboarding Center"
      subtitle="Static data, real-feeling flow: intake questions, readiness checks, uploads, final submission, and the shared modal journey from exam to portal activation."
      patternedCanvas
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <div className="rounded-[20px] bg-primary p-6 text-white">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
              Student Intake
            </p>
            <h2 className="mt-2 font-display text-[30px] font-bold tracking-[-0.02em]">
              Readiness Tracker
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              This demo behaves like a real admissions intake packet with auto-saved answers,
              acknowledgements, upload checkpoints, and a submission gate.
            </p>
            <div className="mt-4">
              <Badge variant={portalUnlocked ? 'success' : 'warning'}>
                {portalUnlocked
                  ? 'Portal active'
                  : `Workflow stage: ${workflowStage.replaceAll('_', ' ')}`}
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface/15">
              <div className="h-full rounded-full bg-surface" style={{ width: `${onboardingProgressPercent}%` }} />
            </div>
            <p className="mt-3 text-sm text-white/80">{onboardingProgressPercent}% complete</p>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconShieldCheck className="size-5 text-primary" />
              <h3 className="font-display text-[18px] font-semibold text-on-surface">Acknowledgements</h3>
            </div>
            <div className="space-y-3">
              {[
                ['schedule', 'I can commit to the class and clinical schedule.'],
                ['attendance', 'I understand attendance, make-up, and withdrawal expectations.'],
                ['technology', 'I have reliable device and internet access for online study.'],
              ].map(([key, label]) => {
                const checked = acknowledgements[key as keyof typeof acknowledgements];
                return (
                  <button
                    key={key}
                    onClick={() => toggleAcknowledgement(key as keyof typeof acknowledgements)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition',
                      checked
                        ? 'border-success/20 bg-success/5'
                        : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                    )}
                  >
                    {checked ? (
                      <IconCircleCheckFilled className="mt-0.5 size-5 shrink-0 text-success" />
                    ) : (
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-outline-variant" />
                    )}
                    <span className="text-sm text-on-surface">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconFileUpload className="size-5 text-primary" />
              <h3 className="font-display text-[18px] font-semibold text-on-surface">Demo Upload Checkpoints</h3>
            </div>
            <div className="space-y-3">
              {[
                ['photoId', 'Photo ID'],
                ['diploma', 'High School Diploma / Transcript'],
                ['tbTest', 'Physical + TB Clearance'],
              ].map(([key, label]) => {
                const complete = readinessUploads[key as keyof typeof readinessUploads];
                return (
                  <div key={key} className="flex items-center justify-between rounded-[16px] border border-border-subtle bg-surface-muted p-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{label}</p>
                      <p className="text-[12px] text-on-surface-variant">Static upload that still changes record state</p>
                    </div>
                    <Button
                      variant={complete ? 'secondary' : 'default'}
                      className="rounded-[12px]"
                      onClick={() => toggleReadinessUpload(key as keyof typeof readinessUploads)}
                    >
                      {complete ? 'Uploaded' : 'Upload'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[28px] font-bold tracking-[-0.02em] text-on-surface">
                Student Onboarding Application
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Each answer updates shared demo state so the dashboard, documents, and readiness views respond.
              </p>
            </div>
            <Badge variant={onboardingSubmitted ? 'success' : 'info'}>
              {onboardingSubmitted ? 'Submitted' : 'Draft'}
            </Badge>
          </div>

          <div className="space-y-6">
            {onboardingQuestions.map((question, index) => (
              <div key={question.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                    Step {index + 1}
                  </span>
                  {question.answer.trim() ? <Badge variant="success">Saved</Badge> : <Badge variant="neutral">Awaiting response</Badge>}
                </div>
                <p className="mb-4 text-base font-semibold text-on-surface">{question.prompt}</p>
                <Textarea
                  value={question.answer}
                  onChange={(event) => answerOnboardingQuestion(question.id, event.target.value)}
                  placeholder="Write a thoughtful answer..."
                />
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[18px] border border-primary/10 bg-surface-low p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconClipboardCheck className="size-5 text-primary" />
              <h3 className="font-display text-[18px] font-semibold text-on-surface">Submission Summary</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[16px] bg-surface p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Questions</p>
                <p className="mt-2 font-mono text-[28px] font-semibold text-primary">
                  {onboardingQuestions.filter((question) => question.answer.trim()).length}/{onboardingQuestions.length}
                </p>
              </div>
              <div className="rounded-[16px] bg-surface p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Readiness checks</p>
                <p className="mt-2 font-mono text-[28px] font-semibold text-primary">
                  {Object.values(acknowledgements).filter(Boolean).length + Object.values(readinessUploads).filter(Boolean).length}/6
                </p>
              </div>
            </div>
            <Button
              className="mt-5 rounded-[14px]"
              disabled={!readyToSubmit}
              onClick={submitOnboardingPackage}
            >
              {onboardingSubmitted ? 'Submission Saved' : 'Submit Onboarding Package'}
            </Button>
            {!readyToSubmit ? (
              <p className="mt-3 text-sm text-on-surface-variant">
                Finish all answers and readiness checks to unlock submission.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
