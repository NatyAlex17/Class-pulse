'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLockAccess,
  IconRosetteDiscountCheck,
  IconSparkles,
  IconX,
  IconAlertCircle,
  IconClockPause,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { EnrollmentPaymentSection } from '@/components/student/enrollment-payment-section';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type StudentIntakeModalProps = {
  open: boolean;
  onClose: () => void;
};

type AvailableCohort = {
  id: string;
  name: string;
  description: string;
  feeAmount: number;
  moduleCount: number;
  moduleTitles: string[];
};

type EnrollmentPaymentIntentSnapshot = {
  cohortId: string;
  cohortName: string;
  amount: number;
  currency: string;
  clientSecret: string;
  publishableKey: string;
};

function isEnrollmentPaymentIntentSnapshot(value: unknown): value is EnrollmentPaymentIntentSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.cohortId === 'string' &&
    typeof candidate.cohortName === 'string' &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.currency === 'string' &&
    typeof candidate.clientSecret === 'string' &&
    typeof candidate.publishableKey === 'string'
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function formatCohortFee(amount: number) {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function StudentIntakeModal({ open, onClose }: StudentIntakeModalProps) {
  const router = useRouter();
  const { session, syncedUser, signOut } = useAuth();
  const [approvalStatus, setApprovalStatus] = React.useState<'pending' | 'approved' | 'rejected' | null | undefined>(undefined);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = React.useState(false);
  const [cohorts, setCohorts] = React.useState<AvailableCohort[]>([]);
  const [registeredCohortId, setRegisteredCohortId] = React.useState<string | null>(null);
  const [cohortsLoaded, setCohortsLoaded] = React.useState(false);
  const [selectedCohortId, setSelectedCohortId] = React.useState<string | null>(null);
  const [isRegisteringCohort, setIsRegisteringCohort] = React.useState(false);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = React.useState(false);
  const [paymentIntent, setPaymentIntent] = React.useState<EnrollmentPaymentIntentSnapshot | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = React.useState<string | null>(null);
  const paymentSectionRef = React.useRef<HTMLDivElement | null>(null);

  const {
    workflowStage,
    intakeJourney,
    entranceExam,
    enrollmentWizard,
    entranceSurvey,
    answerEntranceExamQuestion,
    updateEnrollmentWizardField,
    toggleEnrollmentAgreement,
    setEnrollmentWizardStep,
    submitEnrollmentWizard,
    updateEntranceSurveyAnswer,
    setEntranceSurveyStep,
    submitEntranceSurvey,
  } = useStudentDemo();

  const studentId = React.useMemo(() => syncedUser?.localUserId || 'student-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);
  const isStudentUser = syncedUser?.role === 'student';

  const checkApprovalStatus = React.useCallback(async () => {
    if (!hasAuth || !isStudentUser || !syncedUser?.localUserId) {
      setApprovalStatus(null);
      return;
    }

    try {
      setIsCheckingStatus(true);
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/intake/approval-status`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApprovalStatus(data.data.status);
      } else {
        setApprovalStatus(null);
      }
    } catch {
      setApprovalStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [hasAuth, isStudentUser, session?.access_token, studentId, syncedUser?.localUserId]);

  React.useEffect(() => {
    if (!open || !hasAuth || !isStudentUser) return;
    void checkApprovalStatus();
  }, [checkApprovalStatus, hasAuth, isStudentUser, open]);

  const loadCohorts = React.useCallback(async () => {
    if (!hasAuth || !isStudentUser || !syncedUser?.localUserId) {
      setCohortsLoaded(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/cohorts`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const payload = await response.json();
        setCohorts(payload.data?.cohorts ?? []);
        setRegisteredCohortId(payload.data?.registeredCohortId ?? null);
      }
    } catch {
      // Cohort registration is skipped when the list cannot be loaded.
    } finally {
      setCohortsLoaded(true);
    }
  }, [hasAuth, isStudentUser, session?.access_token, studentId, syncedUser?.localUserId]);

  React.useEffect(() => {
    if (!open) return;
    void loadCohorts();
  }, [loadCohorts, open]);

  React.useEffect(() => {
    setPaymentIntent((current) => (current && current.cohortId !== selectedCohortId ? null : current));
  }, [selectedCohortId]);

  React.useEffect(() => {
    if (paymentIntent) {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [paymentIntent]);

  React.useEffect(() => {
    if (!paymentSuccessMessage) return;
    const timeout = setTimeout(() => setPaymentSuccessMessage(null), 6000);
    return () => clearTimeout(timeout);
  }, [paymentSuccessMessage]);

  const handleRegisterCohort = async (paymentIntentId?: string) => {
    if (!selectedCohortId || !session?.access_token) return;

    try {
      setIsRegisteringCohort(true);
      setSubmitError(null);
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/cohorts/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cohortId: selectedCohortId, paymentIntentId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? 'Failed to register for the cohort.');
      }

      const payload = await response.json();
      setRegisteredCohortId(payload.data?.registeredCohortId ?? selectedCohortId);

      if (paymentIntentId) {
        const cohortName = paymentIntent?.cohortName ?? selectedCohort?.name ?? 'your cohort';
        const amount = paymentIntent?.amount;
        setPaymentSuccessMessage(
          Number.isFinite(amount)
            ? `Payment of $${(amount as number).toLocaleString()} confirmed — you're enrolled in ${cohortName}.`
            : `Payment confirmed — you're enrolled in ${cohortName}.`,
        );
      }

      setPaymentIntent(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to register for the cohort.');
    } finally {
      setIsRegisteringCohort(false);
    }
  };

  const handleCreatePaymentIntent = async () => {
    if (!selectedCohortId || !session?.access_token) return;

    try {
      setIsCreatingPaymentIntent(true);
      setSubmitError(null);
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/cohorts/payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cohortId: selectedCohortId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? 'Failed to start secure payment.');
      }

      const payload = await response.json();
      if (!isEnrollmentPaymentIntentSnapshot(payload.data)) {
        throw new Error('Payment setup returned an invalid response. Please try again.');
      }

      setPaymentIntent(payload.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to start secure payment.');
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!session?.access_token || !isStudentUser || !syncedUser?.localUserId) return;

    try {
      setIsSubmittingExam(true);
      setSubmitError(null);
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/intake/entrance-exam/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? 'Failed to submit entrance exam.');
      }

      await checkApprovalStatus();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit entrance exam.');
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      router.push('/');
    }
  };

  if (!open) {
    return null;
  }

  const journey = intakeJourney;
  const examQuestions = journey?.entranceExam.questions ?? [];
  const enrollmentSteps = journey?.enrollmentWizard.steps ?? [];
  const surveySections = journey?.orientationSurvey.sections ?? [];
  const hasStudentAccess = hasAuth && isStudentUser && Boolean(syncedUser?.localUserId);

  // Students choose a cohort before anything else — it decides their modules and fee.
  const needsCohortSelection =
    cohortsLoaded &&
    hasStudentAccess &&
    !registeredCohortId &&
    cohorts.length > 0 &&
    workflowStage === 'entrance_exam' &&
    !entranceExam.taken;
  const selectedCohort = cohorts.find((cohort) => cohort.id === selectedCohortId) ?? null;
  const selectedCohortRequiresPayment = (selectedCohort?.feeAmount ?? 0) > 0;

  const examComplete = examQuestions.every((question) =>
    (entranceExam.answers[question.id] ?? '').trim(),
  );
  const wizardStep = enrollmentWizard.step;
  const currentWizardDefinition =
    enrollmentSteps.find((item) => item.step === wizardStep) ?? enrollmentSteps[0];
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
              : enrollmentWizard.signature.trim().toLowerCase() ===
                (journey?.enrollmentWizard.signatureRequirement.value ?? '').trim().toLowerCase();

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

  if (!journey) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-surface shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-6 border-b border-border-subtle bg-primary px-6 py-5 text-white sm:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
              {journey.header.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-[28px] font-bold tracking-[-0.02em]">
              {journey.header.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              {journey.header.description}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={workflowStage !== 'active'}
            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-surface/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title={workflowStage !== 'active' ? 'Complete all steps to close' : 'Close'}
          >
            <IconX className="size-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border-subtle bg-surface-low px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {journey.stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3">
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
                <span className="text-sm font-semibold text-on-surface">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        {approvalStatus === 'pending' ? (
          <div className="shrink-0 border-b border-warning/20 bg-warning/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconClockPause className="size-5 text-warning mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Application Under Review</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Your intake has been submitted and is pending admin approval. You will be allowed to use the platform once approved.
                </p>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  Logout & Check Back Later
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {approvalStatus === 'rejected' && (
          <div className="shrink-0 border-b border-error/20 bg-error/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="size-5 text-error mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Application Rejected</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Your intake application was rejected. Please contact support for more information.
                </p>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {!hasStudentAccess ? (
          <div className="shrink-0 border-b border-warning/20 bg-warning/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="size-5 text-warning mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Student Access Required</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  This intake flow can only run with a synced student account. The current session is not authorized for student intake requests.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {paymentSuccessMessage ? (
          <div className="shrink-0 border-b border-success/20 bg-success/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconCheck className="size-5 text-success mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Payment Successful</p>
                <p className="text-xs text-on-surface-variant mt-1">{paymentSuccessMessage}</p>
              </div>
              <button
                onClick={() => setPaymentSuccessMessage(null)}
                className="text-on-surface-variant transition hover:text-on-surface"
              >
                <IconX className="size-4" />
              </button>
            </div>
          </div>
        ) : null}

        {approvalStatus === null && workflowStage === 'entrance_exam' && !entranceExam.taken && hasStudentAccess && (
          <div className="shrink-0 border-b border-info/20 bg-info/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="size-5 text-info mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Submit for Admin Review</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Complete the entrance exam and submit your application for admin review to access the platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitError ? (
          <div className="shrink-0 border-b border-error/20 bg-error/5 px-6 py-4 text-sm text-error sm:px-8">
            {submitError}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {needsCohortSelection ? (
              <section className="space-y-6">
                <div className="rounded-[22px] border border-info/20 bg-info/5 p-5">
                  <p className="text-sm leading-6 text-on-surface-variant">
                    Choose the cohort you are enrolling into. Your cohort determines the modules you will
                    learn and the program fee.
                  </p>
                </div>

                <div className="space-y-4">
                  {cohorts.map((cohort) => {
                    const selected = selectedCohortId === cohort.id;
                    return (
                      <button
                        key={cohort.id}
                        type="button"
                        onClick={() => setSelectedCohortId(cohort.id)}
                        className={cn(
                          'w-full rounded-[20px] border p-5 text-left transition',
                          selected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border-subtle bg-surface hover:border-primary/40',
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-on-surface">{cohort.name}</p>
                            {cohort.description ? (
                              <p className="mt-1 text-sm text-on-surface-variant">{cohort.description}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="font-display text-[22px] font-semibold text-primary">
                              {formatCohortFee(cohort.feeAmount)}
                            </p>
                            <p className="text-xs text-on-surface-variant">program fee</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge variant={selected ? 'success' : 'info'}>
                            {selected ? 'Selected' : `${cohort.moduleCount} modules`}
                          </Badge>
                          {cohort.moduleTitles.slice(0, 4).map((title) => (
                            <span
                              key={title}
                              className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs text-on-surface-variant"
                            >
                              {title}
                            </span>
                          ))}
                          {cohort.moduleTitles.length > 4 ? (
                            <span className="text-xs text-on-surface-variant">
                              +{cohort.moduleTitles.length - 4} more
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentIntent && Number.isFinite(paymentIntent.amount) ? (
                  <div ref={paymentSectionRef} className="scroll-mt-6">
                    <EnrollmentPaymentSection
                      amount={paymentIntent.amount}
                      clientSecret={paymentIntent.clientSecret}
                      cohortName={paymentIntent.cohortName}
                      publishableKey={paymentIntent.publishableKey}
                      onError={(message) => setSubmitError(message || null)}
                      onSuccess={async (paymentIntentId) => {
                        await handleRegisterCohort(paymentIntentId);
                      }}
                    />
                  </div>
                ) : null}
              </section>
            ) : null}

            {workflowStage === 'entrance_exam' && !needsCohortSelection ? (
              <section className="space-y-6">
              <div className="rounded-[22px] border border-warning/20 bg-warning/5 p-5">
                <p className="text-sm leading-6 text-on-surface-variant">
                  {journey.entranceExam.intro}
                </p>
              </div>

              {entranceExam.taken ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <Badge variant={entranceExam.score === null ? 'warning' : entranceExam.passed ? 'success' : 'warning'}>
                    {entranceExam.score === null ? 'Pending Review' : entranceExam.passed ? 'Passed' : 'Needs Review'}
                  </Badge>
                  <h3 className="mt-4 font-display text-[26px] font-semibold text-on-surface">
                    {entranceExam.score === null
                      ? 'Submitted for review'
                      : `Score: ${entranceExam.score} / ${journey.entranceExam.questions.length}`}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    Rank: {entranceExam.rank ?? 'Pending'}
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {entranceExam.score === null
                      ? 'Your answers are waiting for staff review. The reviewer will mark each question correct or wrong before final approval.'
                      : entranceExam.passed
                        ? 'The result is ready and now waiting for admin approval before the student can continue.'
                        : 'The result is waiting for admin review. The student stays locked here until staff approves or rejects the intake.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {approvalStatus === 'approved' ? (
                      <p className="text-sm text-success">
                        Admin approved this intake. Enrollment is now unlocked.
                      </p>
                    ) : (
                      <p className="text-sm text-on-surface-variant">
                        {approvalStatus === 'pending' && 'Your application is pending admin review.'}
                        {approvalStatus === 'rejected' && 'Your application was rejected. Contact support.'}
                        {approvalStatus === null && 'Submit your exam to get started.'}
                      </p>
                    )}
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
                          placeholder={question.placeholder ?? 'Write your response...'}
                        />
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => answerEntranceExamQuestion(question.id, option.value)}
                              className={cn(
                                'rounded-[16px] border p-4 text-left text-sm font-medium transition',
                                entranceExam.answers[question.id] === option.value
                                  ? 'border-primary bg-primary text-white shadow-md'
                                  : 'border-border-subtle bg-surface hover:border-primary hover:bg-primary/5',
                              )}
                            >
                              {option.label}
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

            {workflowStage === 'enrollment_wizard' && approvalStatus !== 'approved' ? (
              <section className="flex flex-col items-center justify-center py-12 text-center">
                <IconLockAccess className="size-12 text-warning mb-4" />
                <h3 className="font-display text-[26px] font-semibold text-on-surface">
                  Portal Access Locked
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant max-w-md">
                  Your application must be approved by admin before you can proceed. Please wait for approval notification.
                </p>
                {approvalStatus === 'rejected' && (
                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="mt-4"
                  >
                    Logout
                  </Button>
                )}
              </section>
            ) : null}

            {workflowStage === 'enrollment_wizard' && approvalStatus === 'approved' ? (
              <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="info">Step {wizardStep} of {enrollmentSteps.length}</Badge>
                  <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">
                    {currentWizardDefinition?.title ?? 'Enrollment Setup'}
                  </h3>
                  {currentWizardDefinition?.description ? (
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {currentWizardDefinition.description}
                    </p>
                  ) : null}
                </div>
                <div className="h-2 w-44 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(wizardStep / Math.max(enrollmentSteps.length, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {wizardStep === 1 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  {currentWizardDefinition?.sections[0] ? (
                    <>
                      <h4 className="font-display text-[22px] font-semibold text-on-surface">
                        {currentWizardDefinition.sections[0].title}
                      </h4>
                      {currentWizardDefinition.sections[0].description ? (
                        <p className="mt-2 text-sm text-on-surface-variant">
                          {currentWizardDefinition.sections[0].description}
                        </p>
                      ) : null}
                      <div className="mt-4 space-y-3">
                        {currentWizardDefinition.sections[0].fields[0]?.options?.map((option) => {
                          const selected = String(enrollmentWizard.hhaAddon) === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                updateEnrollmentWizardField('hhaAddon', option.value === 'true')
                              }
                              className={cn(
                                'w-full rounded-[18px] border p-5 text-left transition',
                                selected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border-subtle bg-surface hover:border-primary/30',
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-base font-semibold text-on-surface">
                                    {option.label}
                                  </p>
                                  {option.description ? (
                                    <p className="mt-1 text-sm text-on-surface-variant">
                                      {option.description}
                                    </p>
                                  ) : null}
                                </div>
                                {option.badge ? (
                                  <Badge variant={selected ? 'success' : 'neutral'}>
                                    {selected ? 'Selected' : option.badge}
                                  </Badge>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {wizardStep === 2 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="font-display text-[22px] font-semibold text-on-surface">
                      {currentWizardDefinition?.sections[0]?.title ?? 'Scrub Sizing'}
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Select
                        value={enrollmentWizard.scrubTop}
                        onChange={(event) =>
                          updateEnrollmentWizardField('scrubTop', event.target.value)
                        }
                        placeholder={currentWizardDefinition?.sections[0]?.fields[0]?.label ?? 'Scrub top size'}
                        options={currentWizardDefinition?.sections[0]?.fields[0]?.options ?? []}
                      />
                      <Select
                        value={enrollmentWizard.scrubBottom}
                        onChange={(event) =>
                          updateEnrollmentWizardField('scrubBottom', event.target.value)
                        }
                        placeholder={currentWizardDefinition?.sections[0]?.fields[1]?.label ?? 'Scrub bottom size'}
                        options={currentWizardDefinition?.sections[0]?.fields[1]?.options ?? []}
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {currentWizardDefinition?.sections[1]?.fields[0]?.options?.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateEnrollmentWizardField('shipping', option.value)}
                          className={cn(
                            'w-full rounded-[16px] border p-4 text-left transition',
                            enrollmentWizard.shipping === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border-subtle bg-surface hover:border-primary/30',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                    <h4 className="font-display text-[22px] font-semibold text-on-surface">
                      {currentWizardDefinition?.sections[2]?.title ?? 'State Exam Preference'}
                    </h4>
                    <div className="mt-4 space-y-3">
                      {currentWizardDefinition?.sections[2]?.fields[0]?.options?.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            updateEnrollmentWizardField(
                              'wantsToTestAtDaisy',
                              option.value === 'true',
                            )
                          }
                          className={cn(
                            'w-full rounded-[16px] border p-4 text-left transition',
                            String(enrollmentWizard.wantsToTestAtDaisy) === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border-subtle bg-surface hover:border-primary/30',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {wizardStep === 3 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    {currentWizardDefinition?.sections[0]?.title ?? 'Program Orientation'}
                  </h4>
                  <div className="mt-5 aspect-video rounded-[18px] bg-[radial-gradient(circle_at_top_left,_rgba(39,110,241,0.28),_transparent_34%),linear-gradient(135deg,#11244a,#1c3f83,#276ef1)] p-6 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
                      Video Preview
                    </p>
                    <h5 className="mt-4 font-display text-[28px] font-semibold">
                      {currentWizardDefinition?.sections[0]?.title ?? 'Program Orientation'}
                    </h5>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                      {currentWizardDefinition?.sections[0]?.description}
                    </p>
                  </div>
                </div>
              ) : null}

              {wizardStep === 4 ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    {currentWizardDefinition?.sections[0]?.title ?? 'Program Agreements'}
                  </h4>
                  <div className="mt-5 space-y-3">
                    {currentWizardDefinition?.sections[0]?.fields.map((field) => {
                      const key = field.id as keyof typeof enrollmentWizard.agreements;
                      const checked =
                        enrollmentWizard.agreements[key];

                      return (
                        <button
                          key={field.id}
                          onClick={() =>
                            toggleEnrollmentAgreement(key)
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
                          <span className="text-sm text-on-surface">{field.label}</span>
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
                      {currentWizardDefinition?.sections[0]?.title ?? 'Program Signature'}
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
                        placeholder={
                          currentWizardDefinition?.sections[0]?.fields[0]?.placeholder ??
                          'Type the required signature'
                        }
                        className="mt-4 h-12 rounded-[14px]"
                      />
                      <p className="mt-3 text-xs text-on-surface-variant">
                        {journey.enrollmentWizard.signatureRequirement.hint}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-border-subtle bg-primary p-6 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
                      Enrollment Summary
                    </p>
                    <div className="mt-5 space-y-3 text-sm text-white/85">
                      {journey.enrollmentWizard.summaryItems.map((item) => (
                        <p key={item.id}>
                          {item.label}:{' '}
                          {item.id === 'hhaAddon'
                            ? enrollmentWizard.hhaAddon
                              ? 'Included'
                              : 'Not selected'
                            : item.id === 'scrubs'
                              ? `${enrollmentWizard.scrubTop || 'TBD'} / ${enrollmentWizard.scrubBottom || 'TBD'}`
                              : item.id === 'shipping'
                                ? enrollmentWizard.shipping
                                : enrollmentWizard.wantsToTestAtDaisy === null
                                  ? 'TBD'
                                  : enrollmentWizard.wantsToTestAtDaisy
                                    ? 'Daisy Medical Institute'
                                    : 'Other site'}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              </section>
            ) : null}

            {workflowStage === 'admin_review' && approvalStatus !== 'approved' ? (
              <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[22px] bg-[linear-gradient(135deg,#11244a,#1a2d58,#1f4da1)] p-6 text-white">
                <Badge variant="warning">{journey.adminReview.badgeLabel}</Badge>
                <h3 className="mt-4 font-display text-[28px] font-semibold">
                  {journey.adminReview.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {journey.adminReview.description}
                </p>
              </div>
              <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                <div className="space-y-5 border-l-2 border-primary/20 pl-5">
                  {journey.adminReview.checklist.map((item) => (
                    <div key={item} className="relative">
                      <div className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full bg-primary" />
                      <p className="text-sm font-semibold text-on-surface">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={checkApprovalStatus} disabled={isCheckingStatus}>
                    {isCheckingStatus ? 'Checking Approval...' : 'Refresh Approval Status'}
                  </Button>
                </div>
              </div>
              </section>
            ) : null}

            {workflowStage === 'orientation_survey' && approvalStatus !== 'approved' ? (
              <section className="flex flex-col items-center justify-center py-12 text-center">
                <IconLockAccess className="size-12 text-warning mb-4" />
                <h3 className="font-display text-[26px] font-semibold text-on-surface">
                  Portal Access Locked
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant max-w-md">
                  Your application must be approved by admin before proceeding. Check back after approval.
                </p>
              </section>
            ) : null}

            {workflowStage === 'orientation_survey' && approvalStatus === 'approved' ? (
              <section className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant="primary">
                    Section {entranceSurvey.step} of {surveySections.length}
                  </Badge>
                  <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">
                    Orientation Intake Survey
                  </h3>
                </div>
                <div className="h-2 w-44 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${(entranceSurvey.step / Math.max(surveySections.length, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {currentSurveySection ? (
                <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                  <h4 className="font-display text-[22px] font-semibold text-on-surface">
                    {currentSurveySection.title}
                  </h4>
                  {currentSurveySection.description ? (
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {currentSurveySection.description}
                    </p>
                  ) : null}
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

            {workflowStage === 'active' && approvalStatus !== 'approved' ? (
              <section className="flex flex-col items-center justify-center py-12 text-center">
                <IconLockAccess className="size-12 text-warning mb-4" />
                <h3 className="font-display text-[26px] font-semibold text-on-surface">
                  Portal Access Locked
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant max-w-md">
                  Your account is not yet approved. Please complete all intake stages first.
                </p>
              </section>
            ) : null}

            {workflowStage === 'active' && approvalStatus === 'approved' ? (
              <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[22px] bg-[linear-gradient(135deg,#0b7a53,#159a6d,#1db581)] p-6 text-white">
                <Badge variant="success">{journey.activation.badgeLabel}</Badge>
                <h3 className="mt-4 font-display text-[30px] font-semibold">
                  {journey.activation.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  {journey.activation.description}
                </p>
              </div>
              <div className="rounded-[22px] border border-border-subtle bg-surface-muted p-6">
                <div className="space-y-4">
                  {journey.activation.checklist.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-[16px] border border-border-subtle bg-surface p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                        {item.toLowerCase().includes('enrollment') ? (
                          <IconRosetteDiscountCheck className="size-5" />
                        ) : item.toLowerCase().includes('orientation') ? (
                          <IconSparkles className="size-5" />
                        ) : item.toLowerCase().includes('tools') ? (
                          <IconLockAccess className="size-5" />
                        ) : (
                          <IconCheck className="size-5" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{item}</p>
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

          {needsCohortSelection && (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
              {paymentIntent ? (
                <p className="text-center text-sm font-semibold text-on-surface-variant">
                  {isRegisteringCohort
                    ? 'Completing enrollment...'
                    : 'Enter your card details above to finish enrollment.'}
                </p>
              ) : (
                <Button
                  disabled={!selectedCohortId || isRegisteringCohort || isCreatingPaymentIntent}
                  onClick={() => {
                    if (!selectedCohort) {
                      return;
                    }

                    if (selectedCohortRequiresPayment) {
                      void handleCreatePaymentIntent();
                      return;
                    }

                    void handleRegisterCohort();
                  }}
                  className="w-full"
                >
                  {isRegisteringCohort
                    ? 'Completing enrollment...'
                    : isCreatingPaymentIntent
                      ? 'Preparing secure payment...'
                    : selectedCohort
                      ? selectedCohortRequiresPayment
                        ? `Continue to payment for ${selectedCohort.name} — ${formatCohortFee(selectedCohort.feeAmount)}`
                        : `Register for ${selectedCohort.name}`
                      : 'Select a cohort to continue'}
                </Button>
              )}
            </div>
          )}

          {workflowStage === 'entrance_exam' && !needsCohortSelection && (
            <div className="shrink-0 border-t border-border-subtle bg-surface px-6 py-4 sm:px-8">
              <Button
                disabled={!examComplete || approvalStatus === 'pending' || isSubmittingExam || !hasStudentAccess}
                onClick={handleSubmitExam}
                className="w-full"
              >
                {isSubmittingExam ? 'Submitting...' : 'Submit for Admin Review'}
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
                {wizardStep < enrollmentSteps.length ? (
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
                {entranceSurvey.step < surveySections.length ? (
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
