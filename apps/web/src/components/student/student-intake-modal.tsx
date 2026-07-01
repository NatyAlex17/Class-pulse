'use client';

import * as React from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLockAccess,
  IconRosetteDiscountCheck,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const examQuestions = [
  {
    id: 'q1',
    prompt: 'What must students do in the self-paced program?',
    type: 'choice',
    options: [
      'A. Only watch videos',
      'B. Read instructions and finish work',
      'C. Skip assignments',
      'D. Wait for instructors to do everything',
    ],
  },
  {
    id: 'q2',
    prompt: 'Why is English important in this program?',
    type: 'choice',
    options: [
      'A. Only for chatting',
      'B. To understand lessons and exams',
      'C. To avoid clinical hours',
      'D. Only for orientation day',
    ],
  },
  {
    id: 'q3',
    prompt: 'When can students ask instructors questions?',
    type: 'choice',
    options: [
      'A. Never',
      'B. Only after graduation',
      'C. During scheduled support hours',
      'D. Only on weekends',
    ],
  },
  {
    id: 'q4',
    prompt: 'What can happen if a student does not understand instructions?',
    type: 'choice',
    options: [
      'A. Nothing changes',
      'B. They may fail assignments or exams',
      'C. They automatically pass',
      'D. The program pauses for everyone',
    ],
  },
  {
    id: 'q5',
    prompt: 'What is the main point of the readiness passage?',
    type: 'choice',
    options: [
      'A. Clinical practice is optional',
      'B. English comprehension is required to succeed',
      'C. Instructors complete the work',
      'D. Technology is never used',
    ],
  },
  {
    id: 'q6',
    prompt: 'Write one complete sentence explaining why following instructions matters in healthcare training.',
    options: [],
    type: 'text',
  },
] as const;

const surveySections = [
  {
    title: 'Student Background',
    fields: [
      {
        id: 'healthcare_exp',
        label: 'Have you worked in healthcare before?',
        type: 'select',
        options: [
          { label: 'No, this is my first time', value: 'first_time' },
          { label: 'Yes, unpaid or volunteer', value: 'volunteer' },
          { label: 'Yes, paid experience', value: 'paid' },
        ],
      },
      {
        id: 'motivation',
        label: 'What motivated you to enroll?',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Confidence & Readiness',
    fields: [
      {
        id: 'confidence',
        label: 'How confident do you feel starting the program?',
        type: 'select',
        options: [
          { label: 'Very confident', value: 'very_confident' },
          { label: 'Somewhat confident', value: 'somewhat_confident' },
          { label: 'A little nervous', value: 'nervous' },
        ],
      },
      {
        id: 'support_needs',
        label: 'Where do you expect to need the most support?',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Expectations',
    fields: [
      {
        id: 'expectations',
        label: 'What do you expect to gain from this program?',
        type: 'textarea',
      },
      {
        id: 'success_definition',
        label: 'What does a successful student experience look like to you?',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Goals & Outcomes',
    fields: [
      {
        id: 'post_grad_goals',
        label: 'What are your goals after completing the program?',
        type: 'textarea',
      },
      {
        id: 'work_timeline',
        label: 'How soon do you hope to start working after certification?',
        type: 'select',
        options: [
          { label: 'Immediately', value: 'immediately' },
          { label: 'Within 1-3 months', value: 'one_to_three_months' },
          { label: 'Not sure yet', value: 'not_sure' },
        ],
      },
    ],
  },
  {
    title: 'Support & Communication',
    fields: [
      {
        id: 'instructor_support',
        label: 'What kind of support do you expect from instructors?',
        type: 'textarea',
      },
      {
        id: 'additional_info',
        label: 'Anything else you would like the team to know?',
        type: 'textarea',
      },
    ],
  },
] as const;

type StudentIntakeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StudentIntakeModal({ open, onClose }: StudentIntakeModalProps) {
  const {
    workflowStage,
    entranceExam,
    enrollmentWizard,
    entranceSurvey,
    answerEntranceExamQuestion,
    submitEntranceExam,
    updateEnrollmentWizardField,
    toggleEnrollmentAgreement,
    setEnrollmentWizardStep,
    submitEnrollmentWizard,
    updateEntranceSurveyAnswer,
    setEntranceSurveyStep,
    submitEntranceSurvey,
    setWorkflowStage,
  } = useStudentDemo();

  if (!open) {
    return null;
  }

  const examComplete = examQuestions.every((question) =>
    (entranceExam.answers[question.id] ?? '').trim(),
  );
  const wizardStep = enrollmentWizard.step;
  const wizardStepValid =
    wizardStep === 1
      ? true
      : wizardStep === 2
        ? Boolean(
            enrollmentWizard.scrubTop &&
              enrollmentWizard.scrubBottom &&
              enrollmentWizard.wantsToTestAtDaisy !== null,
          )
        : wizardStep === 3
          ? true
          : wizardStep === 4
            ? Object.values(enrollmentWizard.agreements).every(Boolean)
            : enrollmentWizard.signature.trim().toLowerCase() === 'amara singh';

  const currentSurveySection = surveySections[entranceSurvey.step - 1];
  const surveyStepValid = currentSurveySection
    ? currentSurveySection.fields.every((field) =>
        (entranceSurvey.answers[field.id] ?? '').trim(),
      )
    : false;

  const stageIndex =
    {
      entrance_exam: 1,
      enrollment_wizard: 2,
      admin_review: 3,
      orientation_survey: 4,
      active: 5,
    }[workflowStage] ?? 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-surface shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-6 border-b border-border-subtle bg-primary px-6 py-5 text-white sm:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
              Student Journey
            </p>
            <h2 className="mt-1 font-display text-[28px] font-bold tracking-[-0.02em]">
              Intake, Enrollment, and Orientation
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              This mirrors the intended student intake flow, and each step now persists through the backend student workflow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-surface/10 hover:text-white"
          >
            <IconX className="size-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border-subtle bg-surface-low px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {[
              'Entrance Exam',
              'Enrollment Wizard',
              'Admin Review',
              'Orientation Survey',
              'Portal Active',
            ].map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                    index + 1 <= stageIndex
                      ? 'bg-primary text-white'
                      : 'bg-surface text-on-surface-variant',
                  )}
                >
                  {index + 1 < stageIndex ? <IconCheck className="size-4" /> : index + 1}
                </div>
                <span className="text-sm font-semibold text-on-surface">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {workflowStage === 'entrance_exam' ? (
              <section className="space-y-6">
              <div className="rounded-[22px] border border-warning/20 bg-warning/5 p-5">
                <p className="text-sm leading-6 text-on-surface-variant">
                  Passing score is 5 out of 6. This gates
                  the rest of the onboarding journey.
                </p>
              </div>

              {entranceExam.taken && entranceExam.score !== null ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <Badge variant={entranceExam.passed ? 'success' : 'warning'}>
                    {entranceExam.passed ? 'Passed' : 'Needs Review'}
                  </Badge>
                  <h3 className="mt-4 font-display text-[26px] font-semibold text-on-surface">
                    Score: {entranceExam.score} / {examQuestions.length}
                  </h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {entranceExam.passed
                      ? 'The student is cleared to continue to enrollment setup.'
                      : 'The intake flow normally stops here until the entrance exam is passed or reviewed.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => setWorkflowStage('enrollment_wizard')}>
                      Continue To Enrollment
                    </Button>
                    {!entranceExam.passed ? (
                      <Button variant="secondary" onClick={() => setWorkflowStage('enrollment_wizard')}>
                        Override For Demo
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {examQuestions.map((question, index) => (
                    <div key={question.id} className="rounded-[20px] border border-border-subtle bg-surface p-5">
                      <p className="mb-3 text-sm font-semibold text-on-surface">
                        {index + 1}. {question.prompt}
                      </p>
                      {question.type === 'text' ? (
                        <Textarea
                          value={entranceExam.answers[question.id] ?? ''}
                          onChange={(event) =>
                            answerEntranceExamQuestion(question.id, event.target.value)
                          }
                          placeholder="Write one complete sentence..."
                        />
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => answerEntranceExamQuestion(question.id, option)}
                              className={cn(
                                'rounded-[16px] border p-4 text-left text-sm font-medium transition',
                                entranceExam.answers[question.id] === option
                                  ? 'border-primary bg-primary text-white shadow-md'
                                  : 'border-border-subtle bg-surface hover:border-primary hover:bg-primary/5',
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </section>
            ) : null}

            {workflowStage === 'enrollment_wizard' ? (
              <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="info">Step {wizardStep} of 5</Badge>
                  <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">
                    Enrollment Setup
                  </h3>
                </div>
                <div className="h-2 w-44 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(wizardStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {wizardStep === 1 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    Step 1: Career Boost
                  </h4>
                  <button
                    onClick={() =>
                      updateEnrollmentWizardField('hhaAddon', !enrollmentWizard.hhaAddon)
                    }
                    className={cn(
                      'mt-4 w-full rounded-[18px] border p-5 text-left transition',
                      enrollmentWizard.hhaAddon
                        ? 'border-primary bg-primary/5'
                        : 'border-border-subtle bg-surface hover:border-primary/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-on-surface">
                          Home Health Aide Add-On
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          Add a second certification track to the student journey.
                        </p>
                      </div>
                      <Badge variant={enrollmentWizard.hhaAddon ? 'success' : 'neutral'}>
                        {enrollmentWizard.hhaAddon ? 'Selected' : '+$500'}
                      </Badge>
                    </div>
                  </button>
                </div>
              ) : null}

              {wizardStep === 2 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="font-display text-[22px] font-semibold text-on-surface">
                      Step 2: Gear Up
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Select
                        value={enrollmentWizard.scrubTop}
                        onChange={(event) =>
                          updateEnrollmentWizardField('scrubTop', event.target.value)
                        }
                        placeholder="Scrub top size"
                        options={['XS', 'S', 'M', 'L', 'XL', '2XL'].map((size) => ({
                          label: size,
                          value: size,
                        }))}
                      />
                      <Select
                        value={enrollmentWizard.scrubBottom}
                        onChange={(event) =>
                          updateEnrollmentWizardField('scrubBottom', event.target.value)
                        }
                        placeholder="Scrub bottom size"
                        options={['XS', 'S', 'M', 'L', 'XL', '2XL'].map((size) => ({
                          label: size,
                          value: size,
                        }))}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ['pickup', 'Pick up at orientation'],
                        ['ship', 'Ship to home (+$10)'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => updateEnrollmentWizardField('shipping', value)}
                          className={cn(
                            'w-full rounded-[16px] border p-4 text-left transition',
                            enrollmentWizard.shipping === value
                              ? 'border-primary bg-primary/5'
                              : 'border-border-subtle bg-surface hover:border-primary/30',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="font-display text-[22px] font-semibold text-on-surface">
                      State Exam Preference
                    </h4>
                    <div className="mt-4 space-y-3">
                      {[
                        [true, 'Yes, test at Daisy Medical Institute'],
                        [false, 'No, use another regional testing site'],
                      ].map(([value, label]) => (
                        <button
                          key={String(value)}
                          onClick={() =>
                            updateEnrollmentWizardField(
                              'wantsToTestAtDaisy',
                              value === true,
                            )
                          }
                          className={cn(
                            'w-full rounded-[16px] border p-4 text-left transition',
                            enrollmentWizard.wantsToTestAtDaisy === value
                              ? 'border-primary bg-primary/5'
                              : 'border-border-subtle bg-surface hover:border-primary/30',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {wizardStep === 3 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    Step 3: Orientation Briefing
                  </h4>
                  <div className="mt-5 aspect-video rounded-[18px] bg-[radial-gradient(circle_at_top_left,_rgba(39,110,241,0.28),_transparent_34%),linear-gradient(135deg,#11244a,#1c3f83,#276ef1)] p-6 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
                      Video Preview
                    </p>
                    <h5 className="mt-4 font-display text-[28px] font-semibold">
                      Program Orientation
                    </h5>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                      This checkpoint represents the orientation briefing and records that the student completed the review stage.
                    </p>
                  </div>
                </div>
              ) : null}

              {wizardStep === 4 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    Step 4: Terms of Agreement
                  </h4>
                  <div className="mt-5 space-y-3">
                    {[
                      ['ip', 'I understand curriculum and AI tools are proprietary.'],
                      ['refund', 'I understand the refund and withdrawal timeline.'],
                      ['conduct', 'I understand conduct standards can affect enrollment status.'],
                      ['lateFee', 'I understand installment timing and late-fee policy.'],
                    ].map(([key, label]) => {
                      const checked =
                        enrollmentWizard.agreements[
                          key as keyof typeof enrollmentWizard.agreements
                        ];

                      return (
                        <button
                          key={key}
                          onClick={() =>
                            toggleEnrollmentAgreement(
                              key as keyof typeof enrollmentWizard.agreements,
                            )
                          }
                          className={cn(
                            'flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition',
                            checked
                              ? 'border-success/20 bg-success/5'
                              : 'border-border-subtle bg-surface hover:border-primary/30',
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 h-5 w-5 shrink-0 rounded border-2',
                              checked ? 'border-success bg-success' : 'border-outline-variant',
                            )}
                          />
                          <span className="text-sm text-on-surface">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {wizardStep === 5 ? (
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="font-display text-[22px] font-semibold text-on-surface">
                      Step 5: Review & Sign
                    </h4>
                    <div className="mt-5 rounded-[18px] bg-surface p-5">
                      <p className="text-sm text-on-surface-variant">
                        Registration, tuition, optional HHA add-on, and delivery preference are staged in the enrollment packet for review.
                      </p>
                      <Input
                        value={enrollmentWizard.signature}
                        onChange={(event) =>
                          updateEnrollmentWizardField('signature', event.target.value)
                        }
                        placeholder="Type Amara Singh to sign"
                        className="mt-4 h-12 rounded-[14px]"
                      />
                      <p className="mt-3 text-xs text-on-surface-variant">
                        Signature must match <strong>Amara Singh</strong> to continue.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-border-subtle bg-primary p-6 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
                      Enrollment Summary
                    </p>
                    <div className="mt-5 space-y-3 text-sm text-white/85">
                      <p>HHA add-on: {enrollmentWizard.hhaAddon ? 'Included' : 'Not selected'}</p>
                      <p>
                        Scrubs: {enrollmentWizard.scrubTop || 'TBD'} /{' '}
                        {enrollmentWizard.scrubBottom || 'TBD'}
                      </p>
                      <p>Delivery: {enrollmentWizard.shipping}</p>
                      <p>
                        State exam preference:{' '}
                        {enrollmentWizard.wantsToTestAtDaisy === null
                          ? 'TBD'
                          : enrollmentWizard.wantsToTestAtDaisy
                            ? 'Daisy Medical Institute'
                            : 'Other site'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              </section>
            ) : null}

            {workflowStage === 'admin_review' ? (
              <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[22px] bg-[linear-gradient(135deg,#11244a,#1a2d58,#1f4da1)] p-6 text-white">
                <Badge variant="warning">Pending Review</Badge>
                <h3 className="mt-4 font-display text-[28px] font-semibold">
                  Admissions is reviewing the packet
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  This stage mirrors the reference dashboard where the student sees a waiting state
                  before the main portal is unlocked.
                </p>
              </div>
              <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                <div className="space-y-5 border-l-2 border-primary/20 pl-5">
                  {[
                    'Entrance exam passed and attached to admissions record',
                    'Enrollment selections captured for logistics and billing',
                    'Packet awaiting approval from student operations',
                  ].map((item) => (
                    <div key={item} className="relative">
                      <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-primary" />
                      <p className="text-sm font-semibold text-on-surface">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => setWorkflowStage('orientation_survey')}>
                    Simulate Approval
                  </Button>
                  <Button variant="secondary" onClick={() => setWorkflowStage('enrollment_wizard')}>
                    Return To Wizard
                  </Button>
                </div>
              </div>
              </section>
            ) : null}

            {workflowStage === 'orientation_survey' ? (
              <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="primary">Section {entranceSurvey.step} of 5</Badge>
                  <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">
                    Orientation Intake Survey
                  </h3>
                </div>
                <div className="h-2 w-44 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${(entranceSurvey.step / 5) * 100}%` }}
                  />
                </div>
              </div>

              {currentSurveySection ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    {currentSurveySection.title}
                  </h4>
                  <div className="mt-5 space-y-5">
                    {currentSurveySection.fields.map((field) => (
                      <div key={field.id}>
                        <label className="mb-2 block text-sm font-semibold text-on-surface">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <Select
                            value={entranceSurvey.answers[field.id] ?? ''}
                            onChange={(event) =>
                              updateEntranceSurveyAnswer(field.id, event.target.value)
                            }
                            placeholder="Select one"
                            options={field.options ?? []}
                          />
                        ) : (
                          <Textarea
                            value={entranceSurvey.answers[field.id] ?? ''}
                            onChange={(event) =>
                              updateEntranceSurveyAnswer(field.id, event.target.value)
                            }
                            placeholder="Write your response..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              </section>
            ) : null}

            {workflowStage === 'active' ? (
              <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[22px] bg-[linear-gradient(135deg,#0b7a53,#159a6d,#1db581)] p-6 text-white">
                <Badge variant="success">Portal Active</Badge>
                <h3 className="mt-4 font-display text-[30px] font-semibold">
                  Student flow fully unlocked
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  The student can now move through learning, forms, documents, financials, and
                  messaging through the live student portal workflow.
                </p>
              </div>
              <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Entrance exam stored', icon: IconCheck },
                    {
                      label: 'Enrollment package submitted',
                      icon: IconRosetteDiscountCheck,
                    },
                    { label: 'Orientation survey completed', icon: IconSparkles },
                    { label: 'Student tools available', icon: IconLockAccess },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-[16px] border border-border-subtle bg-surface p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                        <item.icon className="size-5" />
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Button className="mt-6" onClick={onClose}>
                  Continue To Portal
                </Button>
              </div>
              </section>
            ) : null}
          </div>

          {workflowStage === 'entrance_exam' && (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
              <Button disabled={!examComplete} onClick={submitEntranceExam} className="w-full">
                Submit Entrance Exam
              </Button>
            </div>
          )}

          {/* Sticky button footer for enrollment wizard */}
          {workflowStage === 'enrollment_wizard' && (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setEnrollmentWizardStep(wizardStep - 1)}
                  disabled={wizardStep === 1}
                >
                  <IconArrowLeft className="size-4" />
                  Back
                </Button>
                {wizardStep < 5 ? (
                  <Button
                    onClick={() => setEnrollmentWizardStep(wizardStep + 1)}
                    disabled={!wizardStepValid}
                    className="flex-1"
                  >
                    Next
                    <IconArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitEnrollmentWizard}
                    disabled={!wizardStepValid}
                    className="flex-1"
                  >
                    Submit Enrollment
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Sticky button footer for survey */}
          {workflowStage === 'orientation_survey' && (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setEntranceSurveyStep(entranceSurvey.step - 1)}
                  disabled={entranceSurvey.step === 1}
                >
                  <IconArrowLeft className="size-4" />
                  Back
                </Button>
                {entranceSurvey.step < 5 ? (
                  <Button
                    onClick={() => setEntranceSurveyStep(entranceSurvey.step + 1)}
                    disabled={!surveyStepValid}
                    className="flex-1"
                  >
                    Next Section
                    <IconArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitEntranceSurvey}
                    disabled={!surveyStepValid}
                    className="flex-1"
                  >
                    Submit & Unlock Portal
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
