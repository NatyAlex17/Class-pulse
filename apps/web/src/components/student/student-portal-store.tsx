'use client';

import * as React from 'react';

import { useAuth } from '@/components/auth/auth-provider';

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  actionLabel: string;
};

type OnboardingQuestion = {
  id: string;
  prompt: string;
  answer: string;
};

type TaskItem = {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
  urgent?: boolean;
};

type LearningStep = {
  id: string;
  title: string;
  type: 'Video' | 'PDF' | 'Link' | 'Reading' | 'Skill Check' | 'Quiz';
  duration: string;
  note: string;
  complete: boolean;
  resourceUrl?: string;
  content?: string;
  sectionId?: string;
  sectionTitle?: string;
};

type ModuleItem = {
  id: string;
  title: string;
  summary: string;
  status: 'Complete' | 'In Progress' | 'Locked';
  progressPercent: number;
  requiredHours: number;
  completedHours: number;
  examScore?: string;
  certificateUnlocked: boolean;
  steps: LearningStep[];
};

type DemoMessage = {
  id: string;
  sender: 'student' | 'staff' | 'system';
  text: string;
  time: string;
};

type DemoThread = {
  id: string;
  name: string;
  role: string;
  status: 'Unread' | 'New' | 'Read';
  preview: string;
  time: string;
  unread: boolean;
  messages: DemoMessage[];
};

type UploadItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: 'Verified' | 'Pending Review';
};

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
};

type StudentSettings = {
  email_updates: boolean;
  sms_alerts: boolean;
  remember_device: boolean;
};

type AttendanceRecord = {
  id: string;
  date: string;
  type: 'Theory' | 'Clinical';
  status: 'Present' | 'Planned Absence' | 'Unplanned Absence';
  note: string;
};

type AssignmentItem = {
  id: string;
  title: string;
  due: string;
  detail: string;
  moduleId: string;
  status: 'Pending' | 'Submitted';
};

type SessionItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  instructor: string;
  type: 'Clinical' | 'Theory';
};

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Upcoming';
  method: string;
};

type ClinicalLog = {
  id: string;
  date: string;
  module: string;
  hours: number;
  instructor: string;
  status: 'Verified' | 'Pending';
};

type CdphForm = {
  lastName: string;
  firstName: string;
  dob: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  conviction: boolean;
  convictionDetails: string;
};

type StudentWorkflowStage =
  | 'entrance_exam'
  | 'enrollment_wizard'
  | 'admin_review'
  | 'orientation_survey'
  | 'active';

type EntranceExamState = {
  answers: Record<string, string>;
  score: number | null;
  totalQuestions: number;
  rank: string | null;
  taken: boolean;
  passed: boolean;
  submittedAt?: string;
};

type EnrollmentWizardState = {
  step: number;
  hhaAddon: boolean;
  scrubTop: string;
  scrubBottom: string;
  shipping: 'pickup' | 'ship';
  wantsToTestAtDaisy: boolean | null;
  agreements: {
    ip: boolean;
    refund: boolean;
    conduct: boolean;
    lateFee: boolean;
  };
  signature: string;
  submitted: boolean;
};

type EntranceSurveyState = {
  step: number;
  answers: Record<string, string>;
  completed: boolean;
};

type IntakeOptionDefinition = {
  label: string;
  value: string;
  description?: string;
  badge?: string;
};

type IntakeFieldDefinition = {
  id: string;
  label: string;
  type: 'choice' | 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: IntakeOptionDefinition[];
};

type IntakeStageDefinition = {
  id: StudentWorkflowStage;
  label: string;
};

type EntranceExamQuestionDefinition = {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  preferredAnswer: string;
  options: IntakeOptionDefinition[];
};

type EnrollmentWizardStepDefinition = {
  step: number;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: IntakeFieldDefinition[];
  }>;
};

type IntakeSurveySectionDefinition = {
  id: string;
  title: string;
  description?: string;
  fields: IntakeFieldDefinition[];
};

type StudentIntakeJourney = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stages: IntakeStageDefinition[];
  entranceExam: {
    intro: string;
    passingScore: number;
    questions: EntranceExamQuestionDefinition[];
  };
  enrollmentWizard: {
    steps: EnrollmentWizardStepDefinition[];
    signatureRequirement: {
      value: string;
      hint: string;
    };
    summaryItems: Array<{
      id: string;
      label: string;
    }>;
  };
  adminReview: {
    badgeLabel: string;
    title: string;
    description: string;
    checklist: string[];
  };
  orientationSurvey: {
    sections: IntakeSurveySectionDefinition[];
  };
  activation: {
    badgeLabel: string;
    title: string;
    description: string;
    checklist: string[];
  };
};

type StudentDemoState = {
  workflowStage: StudentWorkflowStage;
  intakeJourney: StudentIntakeJourney | null;
  entranceExam: EntranceExamState;
  enrollmentWizard: EnrollmentWizardState;
  entranceSurvey: EntranceSurveyState;
  onboardingSteps: OnboardingStep[];
  onboardingQuestions: OnboardingQuestion[];
  acknowledgements: {
    schedule: boolean;
    attendance: boolean;
    technology: boolean;
  };
  readinessUploads: {
    photoId: boolean;
    diploma: boolean;
    tbTest: boolean;
  };
  onboardingSubmitted: boolean;
  tasks: TaskItem[];
  modules: ModuleItem[];
  activeModuleId: string;
  activeThreadId: string;
  threads: DemoThread[];
  uploads: UploadItem[];
  supportTickets: SupportTicket[];
  settings: StudentSettings;
  learningMinutes: number;
  learningSessionActive: boolean;
  attendanceRecords: AttendanceRecord[];
  reflectionResponse: string;
  questionOfDayAnswer: string;
  assignments: AssignmentItem[];
  upcomingSessions: SessionItem[];
  paymentHistory: PaymentRecord[];
  clinicalLogs: ClinicalLog[];
  textbookIssued: boolean;
  textbookOpened: boolean;
  liveScanGenerated: boolean;
  liveScanUploaded: boolean;
  cdphForm: CdphForm;
  cdphSigned: boolean;
  exitSurveyComplete: boolean;
  lastAction: string;
};

type StudentDemoContextValue = StudentDemoState & {
  unreadCount: number;
  urgentTaskCount: number;
  completedOnboardingCount: number;
  onboardingProgressPercent: number;
  readinessCount: number;
  portalUnlocked: boolean;
  currentModule: ModuleItem;
  activeThread: DemoThread;
  theoryHoursCompleted: number;
  theoryHoursRequired: number;
  clinicalHoursCompleted: number;
  clinicalHoursRequired: number;
  overallProgressPercent: number;
  examUnlocked: boolean;
  moduleCertificatesReady: number;
  programCertificateReady: boolean;
  paymentBalance: number;
  todayTheoryCheckedIn: boolean;
  todayClinicalCheckedIn: boolean;
  refreshLearning: () => Promise<void>;
  setWorkflowStage: (stage: StudentWorkflowStage) => void;
  answerEntranceExamQuestion: (questionId: string, answer: string) => void;
  submitEntranceExam: () => void;
  updateEnrollmentWizardField: (
    key: 'hhaAddon' | 'scrubTop' | 'scrubBottom' | 'shipping' | 'wantsToTestAtDaisy' | 'signature',
    value: string | boolean | null,
  ) => void;
  toggleEnrollmentAgreement: (key: keyof EnrollmentWizardState['agreements']) => void;
  setEnrollmentWizardStep: (step: number) => void;
  submitEnrollmentWizard: () => void;
  updateEntranceSurveyAnswer: (questionId: string, answer: string) => void;
  setEntranceSurveyStep: (step: number) => void;
  submitEntranceSurvey: () => void;
  toggleTask: (taskId: string) => void;
  completeOnboardingStep: (stepId: string) => void;
  answerOnboardingQuestion: (questionId: string, answer: string) => void;
  toggleAcknowledgement: (key: keyof StudentDemoState['acknowledgements']) => void;
  toggleReadinessUpload: (key: keyof StudentDemoState['readinessUploads']) => void;
  submitOnboardingPackage: () => void;
  selectThread: (threadId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  uploadDocument: () => void;
  replaceDocument: (uploadId: string) => void;
  updateSetting: <TKey extends keyof StudentSettings>(key: TKey, value: StudentSettings[TKey]) => void;
  advanceLearning: (minutes?: number) => void;
  toggleLearningSession: () => void;
  selectModule: (moduleId: string) => void;
  markStepComplete: (moduleId: string, stepId: string) => void;
  submitModuleExam: () => void;
  issueTextbook: () => void;
  completeExitSurvey: () => void;
  makePayment: () => void;
  checkIn: (type: 'Theory' | 'Clinical') => void;
  reportAbsence: (kind: 'today' | 'future') => void;
  submitReflection: (text: string) => void;
  submitQuestionAnswer: (text: string) => void;
  generateLiveScan: () => void;
  toggleLiveScanUpload: () => void;
  updateCdphField: <TKey extends keyof CdphForm>(key: TKey, value: CdphForm[TKey]) => void;
  signCdphForm: () => void;
  logClinicalHours: () => void;
  submitAssignment: (assignmentId: string) => void;
  submitSupportTicket: (ticket: { subject: string; category: string; message: string }) => void;
};

type StudentPortalApi = {
  workflowStage: StudentWorkflowStage;
  intakeJourney: StudentIntakeJourney;
  tasks: TaskItem[];
  onboarding: {
    workflowStage: StudentWorkflowStage;
    steps: OnboardingStep[];
    questions: OnboardingQuestion[];
    acknowledgements: StudentDemoState['acknowledgements'];
    readinessUploads: StudentDemoState['readinessUploads'];
    submitted: boolean;
  };
  modules: ModuleItem[];
  activeModuleId: string;
  threads: Array<{
    id: string;
    recipientName: string;
    recipientRole: string;
    status: 'Unread' | 'New' | 'Read';
    preview: string;
    time: string;
    unread: boolean;
    messages: DemoMessage[];
  }>;
  activeThreadId: string;
  clinicalSessions: SessionItem[];
  clinicalLogs: Array<{
    id: string;
    date: string;
    moduleTitle: string;
    hours: number;
    instructor: string;
    status: 'Verified' | 'Pending';
  }>;
  financials: {
    paymentPlan: PaymentRecord[];
  };
  documents: Array<{
    id: string;
    title: string;
    subtitle: string;
    submittedAt: string;
    status: 'Verified' | 'Pending Review' | 'Missing';
  }>;
  entranceExam: EntranceExamState;
  enrollmentWizard: EnrollmentWizardState;
  entranceSurvey: EntranceSurveyState;
  settings: StudentSettings;
  attendanceRecords: AttendanceRecord[];
  assignments: AssignmentItem[];
  supportTickets: SupportTicket[];
  cdphForm: CdphForm;
  cdphSigned: boolean;
  liveScanGenerated: boolean;
  liveScanUploaded: boolean;
  textbookIssued: boolean;
  textbookOpened: boolean;
  exitSurveyComplete: boolean;
  learningMinutes: number;
  learningSessionActive: boolean;
  reflectionResponse: string;
  questionOfDayAnswer: string;
  lastAction: string;
};

type StudentLearningApi = {
  activeModuleId: string;
  currentModule: ModuleItem;
  modules: ModuleItem[];
  learningMinutes: number;
  learningSessionActive: boolean;
  examUnlocked: boolean;
  textbookIssued: boolean;
  textbookOpened: boolean;
  exitSurveyComplete: boolean;
  moduleCertificatesReady: number;
  programCertificateReady: boolean;
};

type ApiEnvelope<TData> = {
  success: boolean;
  data: TData;
};

const TOTAL_TUITION = 3500;
const CLINICAL_HOURS_REQUIRED = 40;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const StudentDemoContext = React.createContext<StudentDemoContextValue | null>(null);

function createFallbackState(): StudentDemoState {
  return {
    workflowStage: 'entrance_exam',
    intakeJourney: null,
    entranceExam: { answers: {}, score: null, totalQuestions: 0, rank: null, taken: false, passed: false },
    enrollmentWizard: {
      step: 1,
      hhaAddon: false,
      scrubTop: '',
      scrubBottom: '',
      shipping: 'pickup',
      wantsToTestAtDaisy: null,
      agreements: { ip: false, refund: false, conduct: false, lateFee: false },
      signature: '',
      submitted: false,
    },
    entranceSurvey: { step: 1, answers: {}, completed: false },
    onboardingSteps: [],
    onboardingQuestions: [],
    acknowledgements: { schedule: false, attendance: false, technology: false },
    readinessUploads: { photoId: false, diploma: false, tbTest: false },
    onboardingSubmitted: false,
    tasks: [],
    modules: [
      {
        id: 'm1',
        title: 'Foundation of Patient Care',
        summary: 'Student portal is syncing your assigned learning path.',
        status: 'In Progress',
        progressPercent: 0,
        requiredHours: 15,
        completedHours: 0,
        certificateUnlocked: false,
        steps: [],
      },
    ],
    activeModuleId: 'm1',
    activeThreadId: 'system-thread',
    threads: [
      {
        id: 'system-thread',
        name: 'Student Services',
        role: 'Support',
        status: 'Read',
        preview: 'Your student portal is being prepared.',
        time: new Date().toISOString(),
        unread: false,
        messages: [],
      },
    ],
    uploads: [],
    supportTickets: [],
    settings: { email_updates: true, sms_alerts: false, remember_device: true },
    learningMinutes: 0,
    learningSessionActive: false,
    attendanceRecords: [],
    reflectionResponse: '',
    questionOfDayAnswer: '',
    assignments: [],
    upcomingSessions: [],
    paymentHistory: [],
    clinicalLogs: [],
    textbookIssued: false,
    textbookOpened: false,
    liveScanGenerated: false,
    liveScanUploaded: false,
    cdphForm: {
      lastName: '',
      firstName: '',
      dob: '',
      phone: '',
      email: '',
      city: '',
      zip: '',
      conviction: false,
      convictionDetails: '',
    },
    cdphSigned: false,
    exitSurveyComplete: false,
    lastAction: 'Student portal is waiting for authenticated sync.',
  };
}

function mapPortalToState(portal: StudentPortalApi): StudentDemoState {
  return {
    workflowStage: portal.workflowStage,
    intakeJourney: portal.intakeJourney,
    entranceExam: portal.entranceExam,
    enrollmentWizard: portal.enrollmentWizard,
    entranceSurvey: portal.entranceSurvey,
    onboardingSteps: portal.onboarding.steps,
    onboardingQuestions: portal.onboarding.questions,
    acknowledgements: portal.onboarding.acknowledgements,
    readinessUploads: portal.onboarding.readinessUploads,
    onboardingSubmitted: portal.onboarding.submitted,
    tasks: portal.tasks,
    modules: portal.modules,
    activeModuleId: portal.activeModuleId,
    activeThreadId: portal.activeThreadId,
    threads: portal.threads.map((thread) => ({
      id: thread.id,
      name: thread.recipientName,
      role: thread.recipientRole,
      status: thread.status,
      preview: thread.preview,
      time: thread.time,
      unread: thread.unread,
      messages: thread.messages,
    })),
    uploads: portal.documents.map((document) => ({
      id: document.id,
      title: document.title,
      subtitle: document.subtitle,
      date: document.submittedAt,
      status: document.status === 'Missing' ? 'Pending Review' : document.status,
    })),
    supportTickets: portal.supportTickets,
    settings: portal.settings,
    learningMinutes: portal.learningMinutes,
    learningSessionActive: portal.learningSessionActive,
    attendanceRecords: portal.attendanceRecords,
    reflectionResponse: portal.reflectionResponse,
    questionOfDayAnswer: portal.questionOfDayAnswer,
    assignments: portal.assignments,
    upcomingSessions: portal.clinicalSessions,
    paymentHistory: portal.financials.paymentPlan,
    clinicalLogs: portal.clinicalLogs.map((log) => ({
      id: log.id,
      date: log.date,
      module: log.moduleTitle,
      hours: log.hours,
      instructor: log.instructor,
      status: log.status,
    })),
    textbookIssued: portal.textbookIssued,
    textbookOpened: portal.textbookOpened,
    liveScanGenerated: portal.liveScanGenerated,
    liveScanUploaded: portal.liveScanUploaded,
    cdphForm: portal.cdphForm,
    cdphSigned: portal.cdphSigned,
    exitSurveyComplete: portal.exitSurveyComplete,
    lastAction: portal.lastAction,
  };
}

function mergeLearningIntoState(current: StudentDemoState, learning: StudentLearningApi): StudentDemoState {
  return {
    ...current,
    activeModuleId: learning.activeModuleId,
    modules: learning.modules,
    learningMinutes: learning.learningMinutes,
    learningSessionActive: learning.learningSessionActive,
    textbookIssued: learning.textbookIssued,
    textbookOpened: learning.textbookOpened,
    exitSurveyComplete: learning.exitSurveyComplete,
  };
}

export function StudentDemoProvider({ children }: { children: React.ReactNode }) {
  const { session, syncedUser, isSupabaseEnabled, isLoading, refreshSyncedUser } = useAuth();
  const [state, setState] = React.useState<StudentDemoState>(() => createFallbackState());

  const studentId = syncedUser?.localUserId;
  const accessToken = session?.access_token;
  const isStudentUser = syncedUser?.role === 'student';

  const callStudentApi = React.useCallback(
    async <TData,>(
      path: string,
      init?: RequestInit,
      options?: { studentId?: string; accessToken?: string; isStudentUser?: boolean },
    ) => {
      const resolvedStudentId = options?.studentId ?? studentId;
      const resolvedAccessToken = options?.accessToken ?? accessToken;
      const resolvedIsStudentUser = options?.isStudentUser ?? isStudentUser;

      if (!resolvedStudentId || !resolvedAccessToken || !resolvedIsStudentUser) {
        throw new Error('Student portal is not authenticated.');
      }

      const response = await fetch(`${API_BASE_URL}/students/${resolvedStudentId}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resolvedAccessToken}`,
          ...(init?.headers ?? {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        let message = 'Student portal request failed.';

        try {
          const payload = (await response.json()) as { error?: { message?: string } };
          message = payload.error?.message ?? message;
        } catch {
          // Keep generic message when the response is not JSON.
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as ApiEnvelope<TData>;
      return payload.data;
    },
    [accessToken, isStudentUser, studentId],
  );

  const refreshPortal = React.useCallback(async () => {
    if (!studentId || !accessToken || !isStudentUser) {
      setState(createFallbackState());
      return;
    }

    const portal = await callStudentApi<StudentPortalApi>('/portal', { method: 'GET' });
    setState(mapPortalToState(portal));
  }, [accessToken, callStudentApi, isStudentUser, studentId]);

  const refreshLearning = React.useCallback(async () => {
    if (!studentId || !accessToken || !isStudentUser) {
      return;
    }

    const learning = await callStudentApi<StudentLearningApi>('/learning', { method: 'GET' });
    setState((current) => mergeLearningIntoState(current, learning));
  }, [accessToken, callStudentApi, isStudentUser, studentId]);

  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isSupabaseEnabled || !accessToken) {
      setState(createFallbackState());
      return;
    }

    const hydratePortal = async () => {
      try {
        const resolvedSyncedUser =
          syncedUser ?? (await refreshSyncedUser(accessToken).catch(() => null));

        if (!resolvedSyncedUser || resolvedSyncedUser.role !== 'student') {
          setState(createFallbackState());
          return;
        }

        const options = {
          studentId: resolvedSyncedUser.localUserId,
          accessToken,
          isStudentUser: true,
        };
        const [portal, learning] = await Promise.all([
          callStudentApi<StudentPortalApi>('/portal', { method: 'GET' }, options),
          callStudentApi<StudentLearningApi>('/learning', { method: 'GET' }, options),
        ]);
        setState(mergeLearningIntoState(mapPortalToState(portal), learning));
      } catch {
        setState(createFallbackState());
      }
    };

    void hydratePortal();
  }, [accessToken, callStudentApi, isLoading, isSupabaseEnabled, refreshPortal, refreshSyncedUser, syncedUser]);

  const mutate = React.useCallback(
    (path: string, method: 'POST' | 'PATCH', body?: unknown) => {
      const refresh = path.startsWith('/learning') ? refreshLearning : refreshPortal;

      void callStudentApi(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      })
        .then(() => refresh())
        .catch(() => refresh());
    },
    [callStudentApi, refreshLearning, refreshPortal],
  );

  const setWorkflowStage = React.useCallback(
    (workflowStage: StudentWorkflowStage) => {
      setState((current) => ({ ...current, workflowStage }));
      mutate('/intake/workflow-stage', 'PATCH', { workflowStage });
    },
    [mutate],
  );

  const answerEntranceExamQuestion = React.useCallback(
    (questionId: string, answer: string) => {
      setState((current) => ({
        ...current,
        entranceExam: {
          ...current.entranceExam,
          answers: { ...current.entranceExam.answers, [questionId]: answer },
        },
      }));
      mutate(`/intake/entrance-exam/questions/${questionId}`, 'PATCH', { answer });
    },
    [mutate],
  );

  const submitEntranceExam = React.useCallback(() => {
    mutate('/intake/entrance-exam/submit', 'POST');
  }, [mutate]);

  const updateEnrollmentWizardField = React.useCallback(
    (
      key: 'hhaAddon' | 'scrubTop' | 'scrubBottom' | 'shipping' | 'wantsToTestAtDaisy' | 'signature',
      value: string | boolean | null,
    ) => {
      setState((current) => ({
        ...current,
        enrollmentWizard: {
          ...current.enrollmentWizard,
          [key]: value,
        },
      }));
      mutate('/intake/enrollment-wizard', 'PATCH', { [key]: value });
    },
    [mutate],
  );

  const toggleEnrollmentAgreement = React.useCallback(
    (key: keyof EnrollmentWizardState['agreements']) => {
      const value = !state.enrollmentWizard.agreements[key];
      setState((current) => ({
        ...current,
        enrollmentWizard: {
          ...current.enrollmentWizard,
          agreements: {
            ...current.enrollmentWizard.agreements,
            [key]: value,
          },
        },
      }));
      mutate('/intake/enrollment-wizard/agreements', 'PATCH', { [key]: value });
    },
    [mutate, state.enrollmentWizard.agreements],
  );

  const setEnrollmentWizardStep = React.useCallback(
    (step: number) => {
      const maxStep = state.intakeJourney?.enrollmentWizard.steps.length ?? 1;
      setState((current) => ({
        ...current,
        enrollmentWizard: {
          ...current.enrollmentWizard,
          step: Math.max(1, Math.min(maxStep, step)),
        },
      }));
      mutate('/intake/enrollment-wizard/step', 'PATCH', { step });
    },
    [mutate, state.intakeJourney],
  );

  const submitEnrollmentWizard = React.useCallback(() => {
    mutate('/intake/enrollment-wizard/submit', 'POST');
  }, [mutate]);

  const updateEntranceSurveyAnswer = React.useCallback(
    (questionId: string, answer: string) => {
      setState((current) => ({
        ...current,
        entranceSurvey: {
          ...current.entranceSurvey,
          answers: { ...current.entranceSurvey.answers, [questionId]: answer },
        },
      }));
      mutate(`/intake/entrance-survey/questions/${questionId}`, 'PATCH', { answer });
    },
    [mutate],
  );

  const setEntranceSurveyStep = React.useCallback(
    (step: number) => {
      const maxStep = state.intakeJourney?.orientationSurvey.sections.length ?? 1;
      setState((current) => ({
        ...current,
        entranceSurvey: {
          ...current.entranceSurvey,
          step: Math.max(1, Math.min(maxStep, step)),
        },
      }));
      mutate('/intake/entrance-survey/step', 'PATCH', { step });
    },
    [mutate, state.intakeJourney],
  );

  const submitEntranceSurvey = React.useCallback(() => {
    mutate('/intake/entrance-survey/submit', 'POST');
  }, [mutate]);

  const toggleTask = React.useCallback((taskId: string) => {
    mutate(`/tasks/${taskId}/toggle`, 'PATCH');
  }, [mutate]);

  const completeOnboardingStep = React.useCallback((stepId: string) => {
    mutate(`/onboarding/steps/${stepId}/toggle`, 'PATCH');
  }, [mutate]);

  const answerOnboardingQuestion = React.useCallback(
    (questionId: string, answer: string) => {
      setState((current) => ({
        ...current,
        onboardingQuestions: current.onboardingQuestions.map((question) =>
          question.id === questionId ? { ...question, answer } : question,
        ),
      }));
      mutate(`/onboarding/questions/${questionId}`, 'PATCH', { answer });
    },
    [mutate],
  );

  const toggleAcknowledgement = React.useCallback(
    (key: keyof StudentDemoState['acknowledgements']) => {
      const value = !state.acknowledgements[key];
      setState((current) => ({
        ...current,
        acknowledgements: {
          ...current.acknowledgements,
          [key]: value,
        },
      }));
      mutate('/onboarding/acknowledgements', 'PATCH', { [key]: value });
    },
    [mutate, state.acknowledgements],
  );

  const toggleReadinessUpload = React.useCallback(
    (key: keyof StudentDemoState['readinessUploads']) => {
      const value = !state.readinessUploads[key];
      setState((current) => ({
        ...current,
        readinessUploads: {
          ...current.readinessUploads,
          [key]: value,
        },
      }));
      mutate('/onboarding/uploads', 'PATCH', { [key]: value });
    },
    [mutate, state.readinessUploads],
  );

  const submitOnboardingPackage = React.useCallback(() => {
    mutate('/onboarding/submit', 'POST');
  }, [mutate]);

  const selectThread = React.useCallback((threadId: string) => {
    mutate(`/messages/${threadId}/select`, 'PATCH');
  }, [mutate]);

  const sendMessage = React.useCallback(
    (threadId: string, text: string) => {
      const cleanText = text.trim();
      const thread = state.threads.find((item) => item.id === threadId) ?? state.threads[0];

      if (!cleanText || !thread) {
        return;
      }

      mutate('/messages', 'POST', {
        threadId,
        recipientName: thread.name,
        recipientRole: thread.role,
        moduleId: state.activeModuleId,
        moduleName: state.modules.find((module) => module.id === state.activeModuleId)?.title ?? 'Student Support',
        text: cleanText,
      });
    },
    [mutate, state.activeModuleId, state.modules, state.threads],
  );

  const uploadDocument = React.useCallback(() => {
    mutate('/documents/upload', 'POST', {
      title: `Student Upload ${state.uploads.length + 1}`,
      category: 'compliance',
      subtitle: 'Submitted from the student documents center.',
      fileName: `student-upload-${state.uploads.length + 1}.pdf`,
    });
  }, [mutate, state.uploads.length]);

  const replaceDocument = React.useCallback(
    (uploadId: string) => {
      const upload = state.uploads.find((item) => item.id === uploadId);
      if (!upload) {
        return;
      }

      mutate(`/documents/${uploadId}/replace`, 'PATCH', {
        subtitle: `${upload.subtitle} (replacement submitted)`,
        fileName: `${upload.id}-replacement.pdf`,
      });
    },
    [mutate, state.uploads],
  );

  const updateSetting = React.useCallback(
    <TKey extends keyof StudentSettings>(key: TKey, value: StudentSettings[TKey]) => {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          [key]: value,
        },
      }));
      mutate('/settings', 'PATCH', { [key]: value });
    },
    [mutate],
  );

  const advanceLearning = React.useCallback((minutes = 30) => {
    mutate('/learning/advance', 'POST', { minutes });
  }, [mutate]);

  const toggleLearningSession = React.useCallback(() => {
    mutate('/learning/session/toggle', 'POST');
  }, [mutate]);

  const selectModule = React.useCallback(
    (moduleId: string) => {
      setState((current) => ({ ...current, activeModuleId: moduleId }));
      mutate('/learning/modules/active', 'PATCH', { moduleId });
    },
    [mutate],
  );

  const markStepComplete = React.useCallback((moduleId: string, stepId: string) => {
    mutate(`/learning/modules/${moduleId}/steps/${stepId}/toggle`, 'PATCH');
  }, [mutate]);

  const submitModuleExam = React.useCallback(() => {
    mutate(`/learning/modules/${state.activeModuleId}/exam`, 'POST');
  }, [mutate, state.activeModuleId]);

  const issueTextbook = React.useCallback(() => {
    mutate('/learning/textbook/open', 'POST');
  }, [mutate]);

  const completeExitSurvey = React.useCallback(() => {
    mutate('/learning/exit-survey/complete', 'POST');
  }, [mutate]);

  const makePayment = React.useCallback(() => {
    mutate('/financials/payments/next', 'POST');
  }, [mutate]);

  const checkIn = React.useCallback((type: 'Theory' | 'Clinical') => {
    mutate('/attendance/check-in', 'POST', { type });
  }, [mutate]);

  const reportAbsence = React.useCallback((kind: 'today' | 'future') => {
    mutate('/attendance/absences', 'POST', { kind });
  }, [mutate]);

  const submitReflection = React.useCallback(
    (text: string) => {
      const answer = text.trim();
      if (answer) {
        mutate('/reflections', 'POST', { answer });
      }
    },
    [mutate],
  );

  const submitQuestionAnswer = React.useCallback(
    (text: string) => {
      const answer = text.trim();
      if (answer) {
        mutate('/daily-question', 'POST', { answer });
      }
    },
    [mutate],
  );

  const generateLiveScan = React.useCallback(() => {
    mutate('/forms/live-scan/generate', 'POST');
  }, [mutate]);

  const toggleLiveScanUpload = React.useCallback(() => {
    mutate('/forms/live-scan/toggle-upload', 'POST');
  }, [mutate]);

  const updateCdphField = React.useCallback(
    <TKey extends keyof CdphForm>(key: TKey, value: CdphForm[TKey]) => {
      setState((current) => ({
        ...current,
        cdphForm: {
          ...current.cdphForm,
          [key]: value,
        },
      }));
      mutate('/forms/cdph-283b', 'PATCH', { [key]: value });
    },
    [mutate],
  );

  const signCdphForm = React.useCallback(() => {
    mutate('/forms/cdph-283b/sign', 'POST');
  }, [mutate]);

  const logClinicalHours = React.useCallback(() => {
    mutate('/clinical-hours/logs', 'POST', {
      date: new Date().toISOString().slice(0, 10),
      moduleId: state.activeModuleId,
      moduleTitle: state.modules.find((module) => module.id === state.activeModuleId)?.title ?? 'Clinical Practice',
      hours: 4,
      instructor: 'James Miller',
      note: 'Logged from the student clinical hours workspace.',
    });
  }, [mutate, state.activeModuleId, state.modules]);

  const submitAssignment = React.useCallback((assignmentId: string) => {
    mutate(`/assignments/${assignmentId}/submit`, 'POST');
  }, [mutate]);

  const submitSupportTicket = React.useCallback(
    (ticket: { subject: string; category: string; message: string }) => {
      const subject = ticket.subject.trim();
      const message = ticket.message.trim();

      if (!subject || !message) {
        return;
      }

      mutate('/support', 'POST', {
        subject,
        category: ticket.category,
        message,
      });
    },
    [mutate],
  );

  const currentModule =
    state.modules.find((module) => module.id === state.activeModuleId) ??
    state.modules.find((module) => module.status === 'In Progress') ??
    state.modules[0];
  const activeThread =
    state.threads.find((thread) => thread.id === state.activeThreadId) ?? state.threads[0];
  const completedOnboardingCount = state.onboardingSteps.filter((step) => step.complete).length;
  const theoryHoursCompleted = state.modules.reduce(
    (total, module) => total + Math.min(module.completedHours, module.requiredHours),
    0,
  );
  const theoryHoursRequired = state.modules.reduce((total, module) => total + module.requiredHours, 0);
  const clinicalHoursCompleted = state.clinicalLogs.reduce((total, log) => total + log.hours, 0);
  const overallProgressPercent =
    theoryHoursRequired + CLINICAL_HOURS_REQUIRED > 0
      ? Math.round(
          ((theoryHoursCompleted + clinicalHoursCompleted) /
            (theoryHoursRequired + CLINICAL_HOURS_REQUIRED)) *
            100,
        )
      : 0;
  const unreadCount = state.threads.filter((thread) => thread.unread).length;
  const urgentTaskCount = state.tasks.filter((task) => task.urgent && !task.complete).length;
  const portalUnlocked = state.workflowStage === 'active';
  const readinessCount =
    Object.values(state.acknowledgements).filter(Boolean).length +
    Object.values(state.readinessUploads).filter(Boolean).length;
  const answeredQuestions = state.onboardingQuestions.filter((question) => question.answer.trim()).length;
  const onboardingProgressPercent =
    state.onboardingSteps.length + 6 + state.onboardingQuestions.length > 0
      ? Math.round(
          ((completedOnboardingCount + readinessCount + answeredQuestions) /
            (state.onboardingSteps.length + 6 + state.onboardingQuestions.length)) *
            100,
        )
      : 0;
  const examUnlocked = state.learningMinutes >= 480;
  const moduleCertificatesReady = state.modules.filter((module) => module.certificateUnlocked).length;
  const paymentCompleted = state.paymentHistory
    .filter((payment) => payment.status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
  const paymentBalance = Math.max(TOTAL_TUITION - paymentCompleted, 0);
  const programCertificateReady =
    state.modules.every((module) => module.status === 'Complete') &&
    paymentBalance === 0 &&
    state.exitSurveyComplete;
  const today = new Date().toISOString().slice(0, 10);
  const todayTheoryCheckedIn = state.attendanceRecords.some(
    (record) => record.date === today && record.type === 'Theory' && record.status === 'Present',
  );
  const todayClinicalCheckedIn = state.attendanceRecords.some(
    (record) => record.date === today && record.type === 'Clinical' && record.status === 'Present',
  );

  const value = React.useMemo<StudentDemoContextValue>(
    () => ({
      ...state,
      unreadCount,
      urgentTaskCount,
      completedOnboardingCount,
      onboardingProgressPercent,
      readinessCount,
      portalUnlocked,
      currentModule,
      activeThread,
      theoryHoursCompleted,
      theoryHoursRequired,
      clinicalHoursCompleted,
      clinicalHoursRequired: CLINICAL_HOURS_REQUIRED,
      overallProgressPercent,
      examUnlocked,
      moduleCertificatesReady,
      programCertificateReady,
      paymentBalance,
      todayTheoryCheckedIn,
      todayClinicalCheckedIn,
      refreshLearning,
      setWorkflowStage,
      answerEntranceExamQuestion,
      submitEntranceExam,
      updateEnrollmentWizardField,
      toggleEnrollmentAgreement,
      setEnrollmentWizardStep,
      submitEnrollmentWizard,
      updateEntranceSurveyAnswer,
      setEntranceSurveyStep,
      submitEntranceSurvey,
      toggleTask,
      completeOnboardingStep,
      answerOnboardingQuestion,
      toggleAcknowledgement,
      toggleReadinessUpload,
      submitOnboardingPackage,
      selectThread,
      sendMessage,
      uploadDocument,
      replaceDocument,
      updateSetting,
      advanceLearning,
      toggleLearningSession,
      selectModule,
      markStepComplete,
      submitModuleExam,
      issueTextbook,
      completeExitSurvey,
      makePayment,
      checkIn,
      reportAbsence,
      submitReflection,
      submitQuestionAnswer,
      generateLiveScan,
      toggleLiveScanUpload,
      updateCdphField,
      signCdphForm,
      logClinicalHours,
      submitAssignment,
      submitSupportTicket,
    }),
    [
      activeThread,
      advanceLearning,
      answerEntranceExamQuestion,
      answerOnboardingQuestion,
      checkIn,
      clinicalHoursCompleted,
      completeExitSurvey,
      completedOnboardingCount,
      completeOnboardingStep,
      currentModule,
      examUnlocked,
      generateLiveScan,
      issueTextbook,
      logClinicalHours,
      makePayment,
      markStepComplete,
      moduleCertificatesReady,
      onboardingProgressPercent,
      overallProgressPercent,
      paymentBalance,
      portalUnlocked,
      programCertificateReady,
      refreshLearning,
      readinessCount,
      replaceDocument,
      reportAbsence,
      selectModule,
      selectThread,
      sendMessage,
      setEnrollmentWizardStep,
      setEntranceSurveyStep,
      setWorkflowStage,
      signCdphForm,
      state,
      submitAssignment,
      submitEntranceExam,
      submitEntranceSurvey,
      submitEnrollmentWizard,
      submitOnboardingPackage,
      submitQuestionAnswer,
      submitReflection,
      submitSupportTicket,
      theoryHoursCompleted,
      theoryHoursRequired,
      todayClinicalCheckedIn,
      todayTheoryCheckedIn,
      toggleAcknowledgement,
      toggleEnrollmentAgreement,
      toggleLearningSession,
      toggleReadinessUpload,
      toggleTask,
      toggleLiveScanUpload,
      unreadCount,
      updateCdphField,
      updateEnrollmentWizardField,
      updateEntranceSurveyAnswer,
      updateSetting,
      uploadDocument,
      urgentTaskCount,
    ],
  );

  return <StudentDemoContext.Provider value={value}>{children}</StudentDemoContext.Provider>;
}

export function useStudentDemo() {
  const context = React.useContext(StudentDemoContext);

  if (!context) {
    throw new Error('useStudentDemo must be used within StudentDemoProvider.');
  }

  return context;
}
