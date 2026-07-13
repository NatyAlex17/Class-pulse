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

type DocumentChecklistItem = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  fileUrl?: string;
};

type TaskItem = {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
  urgent?: boolean;
};

type LearningStepExamQuestion = {
  id: string;
  prompt: string;
  points: number;
  options?: string[];
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
  sectionDescription?: string;
  examFormat?: 'text' | 'multiple-choice';
  passingScore?: number;
  questionCount?: number;
  questions?: LearningStepExamQuestion[];
};

type ModuleExamResult = {
  graded: boolean;
  passed: boolean;
  scorePercent: number;
  earnedPoints: number;
  totalPoints: number;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
};

type ModuleExamOutcome = { ok: true; result: ModuleExamResult } | { ok: false; error: string };

type LearningAttentionEventType = 'visibility_hidden' | 'window_blur' | 'session_paused';

type LearningAttentionEvent = {
  id: string;
  type: LearningAttentionEventType;
  occurredAt: string;
  detail?: string;
};

type ActiveLearningAttention = {
  moduleId: string;
  lessonId: string;
  startedAt: string;
  lastActivityAt: string;
  focusLossCount: number;
  visibilityLossCount: number;
  manualPauseCount: number;
  warnings: number;
  recentEvents: LearningAttentionEvent[];
};

type ExamSecurityEventType =
  | 'visibility_hidden'
  | 'window_blur'
  | 'fullscreen_exit'
  | 'navigation_blocked'
  | 'shortcut_blocked'
  | 'context_menu'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'back_button_blocked';

type ExamSecurityEvent = {
  id: string;
  type: ExamSecurityEventType;
  occurredAt: string;
  detail?: string;
};

type ActiveExamSession = {
  moduleId: string;
  stepId: string;
  startedAt: string;
  lastActivityAt: string;
  focusLossCount: number;
  visibilityLossCount: number;
  fullscreenExitCount: number;
  shortcutBlockCount: number;
  copyPasteCount: number;
  navigationAttemptCount: number;
  warnings: number;
  recentEvents: ExamSecurityEvent[];
};

type AiTutorMessage = {
  id: string;
  role: 'student' | 'tutor';
  text: string;
  sentAt: string;
};

type AiTutorConversation = {
  moduleId: string;
  lessonId: string;
  updatedAt: string;
  messages: AiTutorMessage[];
};

type ModuleItem = {
  id: string;
  title: string;
  summary: string;
  status: 'Complete' | 'In Progress' | 'Locked';
  progressPercent: number;
  requiredHours: number;
  completedHours: number;
  sessionMinutes?: number;
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
  adminReply?: string;
  respondedAt?: string;
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

export type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Upcoming';
  method: string;
  stripePaymentIntentId?: string;
};

type ClinicalLog = {
  id: string;
  date: string;
  module: string;
  hours: number;
  instructor: string;
  status: 'Verified' | 'Pending' | 'Flagged';
  note?: string;
};

type CdphForm = {
  requestType: 'enrollment' | 'reconsideration';
  lastName: string;
  firstName: string;
  middleInitial: string;
  sex: 'Male' | 'Female' | '';
  dob: string;
  ssn: string;
  itin: string;
  addressLine1: string;
  confidentialAddressLine1: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  confidentialCity: string;
  confidentialState: string;
  confidentialZip: string;
  driversLicenseNumber: string;
  driversLicenseState: string;
  textMessageConsent: boolean;
  conviction: boolean;
  convictionDescription: string;
  convictionCourt: string;
  convictionDate: string;
  adverseAction: boolean;
  adverseActionLicenseType: string;
  adverseActionLicenseNumber: string;
  adverseActionType: string;
  trainingProgramName: string;
  trainingProgramPhone: string;
  trainingProgramAddressLine1: string;
  trainingProgramCity: string;
  trainingProgramState: string;
  trainingProgramZip: string;
  trainingProgramId: string;
  trainingBeginDate: string;
  trainingEndDate: string;
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

type StudentProfileSummary = {
  fullName: string;
  preferredName?: string;
  email: string;
  cohort: string;
  studentNumber: string;
  location: string;
};

type StudentDemoState = {
  profile: StudentProfileSummary;
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
  readinessUploads: Record<string, boolean>;
  documentChecklist: DocumentChecklistItem[];
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
  activeLessonId?: string;
  lessonElapsedMinutes: Record<string, number>;
  activeLearningAttention?: ActiveLearningAttention;
  activeExamSession?: ActiveExamSession;
  aiTutorConversations: Record<string, AiTutorConversation>;
  attendanceRecords: AttendanceRecord[];
  reflectionResponse: string;
  questionOfDayAnswer: string;
  assignments: AssignmentItem[];
  upcomingSessions: SessionItem[];
  paymentHistory: PaymentRecord[];
  totalTuition: number;
  depositRequired: number;
  depositPaid: boolean;
  financialStatus: 'Current' | 'Payment Due' | 'Past Due';
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
  portalHydrated: boolean;
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
  sessionMinutes: number;
  requiredSessionMinutes: number;
  examUnlocked: boolean;
  moduleCertificatesReady: number;
  programCertificateReady: boolean;
  paymentBalance: number;
  amountPaid: number;
  todayTheoryCheckedIn: boolean;
  todayClinicalCheckedIn: boolean;
  refreshLearning: () => Promise<void>;
  refreshPortal: () => Promise<void>;
  setWorkflowStage: (stage: StudentWorkflowStage) => void;
  answerEntranceExamQuestion: (questionId: string, answer: string) => void;
  submitEntranceExam: () => void;
  updateEnrollmentWizardField: (
    key: 'hhaAddon' | 'scrubTop' | 'scrubBottom' | 'shipping' | 'wantsToTestAtDaisy' | 'signature',
    value: string | boolean | null
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
  uploadReadinessDocument: (documentId: string, file: File) => Promise<void>;
  submitOnboardingPackage: () => void;
  selectThread: (threadId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  uploadDocument: () => void;
  replaceDocument: (uploadId: string) => void;
  updateSetting: <TKey extends keyof StudentSettings>(
    key: TKey,
    value: StudentSettings[TKey]
  ) => void;
  advanceLearning: (minutes?: number) => void;
  toggleLearningSession: () => void;
  setLearningSession: (active: boolean) => void;
  recordLessonSessionStart: (lessonId: string) => void;
  reportLearningAttentionEvent: (payload: {
    type: LearningAttentionEventType;
    detail?: string;
  }) => void;
  startModuleExamSession: (moduleId: string, stepId: string) => Promise<ActiveExamSession | null>;
  reportExamSecurityEvent: (
    moduleId: string,
    payload: { type: ExamSecurityEventType; detail?: string }
  ) => void;
  loadAiTutorConversation: (moduleId: string, lessonId: string) => Promise<void>;
  askAiTutor: (moduleId: string, lessonId: string, question: string) => Promise<AiTutorConversation | null>;
  selectModule: (moduleId: string) => void;
  markStepComplete: (moduleId: string, stepId: string) => void;
  submitModuleExam: (payload?: {
    stepId?: string;
    answers?: Record<string, string>;
  }) => Promise<ModuleExamOutcome>;
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
  downloadCdph283bPdf: () => Promise<void>;
  logClinicalHours: () => void;
  submitAssignment: (assignmentId: string) => void;
  submitSupportTicket: (ticket: { subject: string; category: string; message: string }) => void;
};

type StudentPortalApi = {
  profile: StudentProfileSummary;
  workflowStage: StudentWorkflowStage;
  intakeJourney: StudentIntakeJourney;
  tasks: TaskItem[];
  onboarding: {
    workflowStage: StudentWorkflowStage;
    steps: OnboardingStep[];
    questions: OnboardingQuestion[];
    acknowledgements: StudentDemoState['acknowledgements'];
    readinessUploads: StudentDemoState['readinessUploads'];
    documentChecklist: DocumentChecklistItem[];
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
    status: 'Verified' | 'Pending' | 'Flagged';
    note?: string;
  }>;
  financials: {
    totalTuition: number;
    amountPaid: number;
    balance: number;
    depositRequired: number;
    depositPaid: boolean;
    status: 'Current' | 'Payment Due' | 'Past Due';
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
  activeLessonId?: string;
  lessonElapsedMinutes: Record<string, number>;
  activeLearningAttention?: ActiveLearningAttention;
  activeExamSession?: ActiveExamSession;
  reflectionResponse: string;
  questionOfDayAnswer: string;
  lastAction: string;
};

type StudentLearningApi = {
  activeModuleId: string;
  currentModule: ModuleItem;
  modules: ModuleItem[];
  learningMinutes: number;
  sessionMinutes: number;
  requiredSessionMinutes: number;
  learningSessionActive: boolean;
  activeLessonId?: string;
  lessonElapsedMinutes: Record<string, number>;
  activeLearningAttention?: ActiveLearningAttention;
  activeExamSession?: ActiveExamSession;
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

const DEFAULT_CDPH_FORM: CdphForm = {
  requestType: 'enrollment',
  lastName: '',
  firstName: '',
  middleInitial: '',
  sex: '',
  dob: '',
  ssn: '',
  itin: '',
  addressLine1: '',
  confidentialAddressLine1: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  zip: '',
  confidentialCity: '',
  confidentialState: '',
  confidentialZip: '',
  driversLicenseNumber: '',
  driversLicenseState: '',
  textMessageConsent: false,
  conviction: false,
  convictionDescription: '',
  convictionCourt: '',
  convictionDate: '',
  adverseAction: false,
  adverseActionLicenseType: '',
  adverseActionLicenseNumber: '',
  adverseActionType: '',
  trainingProgramName: '',
  trainingProgramPhone: '',
  trainingProgramAddressLine1: '',
  trainingProgramCity: '',
  trainingProgramState: '',
  trainingProgramZip: '',
  trainingProgramId: '',
  trainingBeginDate: '',
  trainingEndDate: '',
};

// Portal records saved before the CDPH form gained new fields can be missing
// keys (and may use the legacy `convictionDetails` name); fill from defaults so
// inputs always stay controlled.
function normalizeCdphForm(raw: Partial<CdphForm> | undefined): CdphForm {
  const legacy = raw as (Partial<CdphForm> & { convictionDetails?: string }) | undefined;
  return {
    ...DEFAULT_CDPH_FORM,
    ...Object.fromEntries(
      Object.entries(raw ?? {}).filter(([, value]) => value !== undefined && value !== null)
    ),
    convictionDescription:
      raw?.convictionDescription ?? legacy?.convictionDetails ?? DEFAULT_CDPH_FORM.convictionDescription,
  };
}

function createFallbackState(): StudentDemoState {
  return {
    profile: { fullName: '', email: '', cohort: '', studentNumber: '', location: '' },
    workflowStage: 'entrance_exam',
    intakeJourney: null,
    entranceExam: {
      answers: {},
      score: null,
      totalQuestions: 0,
      rank: null,
      taken: false,
      passed: false,
    },
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
    readinessUploads: {},
    documentChecklist: [],
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
        sessionMinutes: 0,
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
    activeLessonId: undefined,
    lessonElapsedMinutes: {},
    activeLearningAttention: undefined,
    activeExamSession: undefined,
    aiTutorConversations: {},
    attendanceRecords: [],
    reflectionResponse: '',
    questionOfDayAnswer: '',
    assignments: [],
    upcomingSessions: [],
    paymentHistory: [],
    totalTuition: TOTAL_TUITION,
    depositRequired: 0,
    depositPaid: false,
    financialStatus: 'Current',
    clinicalLogs: [],
    textbookIssued: false,
    textbookOpened: false,
    liveScanGenerated: false,
    liveScanUploaded: false,
    cdphForm: { ...DEFAULT_CDPH_FORM },
    cdphSigned: false,
    exitSurveyComplete: false,
    lastAction: 'Student portal is waiting for authenticated sync.',
  };
}

function mapPortalToState(portal: StudentPortalApi): StudentDemoState {
  return {
    profile: portal.profile,
    workflowStage: portal.workflowStage,
    intakeJourney: portal.intakeJourney,
    entranceExam: portal.entranceExam,
    enrollmentWizard: portal.enrollmentWizard,
    entranceSurvey: portal.entranceSurvey,
    onboardingSteps: portal.onboarding.steps,
    onboardingQuestions: portal.onboarding.questions,
    acknowledgements: portal.onboarding.acknowledgements,
    readinessUploads: portal.onboarding.readinessUploads,
    documentChecklist: portal.onboarding.documentChecklist ?? [],
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
    activeLessonId: portal.activeLessonId,
    lessonElapsedMinutes: portal.lessonElapsedMinutes ?? {},
    activeLearningAttention: portal.activeLearningAttention,
    activeExamSession: portal.activeExamSession,
    aiTutorConversations: {},
    attendanceRecords: portal.attendanceRecords,
    reflectionResponse: portal.reflectionResponse,
    questionOfDayAnswer: portal.questionOfDayAnswer,
    assignments: portal.assignments,
    upcomingSessions: portal.clinicalSessions,
    paymentHistory: portal.financials.paymentPlan,
    totalTuition: portal.financials.totalTuition,
    depositRequired: portal.financials.depositRequired,
    depositPaid: portal.financials.depositPaid,
    financialStatus: portal.financials.status,
    clinicalLogs: portal.clinicalLogs.map((log) => ({
      id: log.id,
      date: log.date,
      module: log.moduleTitle,
      hours: log.hours,
      instructor: log.instructor,
      status: log.status,
      note: log.note,
    })),
    textbookIssued: portal.textbookIssued,
    textbookOpened: portal.textbookOpened,
    liveScanGenerated: portal.liveScanGenerated,
    liveScanUploaded: portal.liveScanUploaded,
    cdphForm: normalizeCdphForm(portal.cdphForm),
    cdphSigned: portal.cdphSigned,
    exitSurveyComplete: portal.exitSurveyComplete,
    lastAction: portal.lastAction,
  };
}

function mergeLearningIntoState(
  current: StudentDemoState,
  learning: StudentLearningApi
): StudentDemoState {
  return {
    ...current,
    activeModuleId: learning.activeModuleId,
    modules: learning.modules,
    learningMinutes: learning.learningMinutes,
    learningSessionActive: learning.learningSessionActive,
    activeLessonId: learning.activeLessonId,
    lessonElapsedMinutes: learning.lessonElapsedMinutes ?? {},
    activeLearningAttention: learning.activeLearningAttention,
    activeExamSession: learning.activeExamSession,
    textbookIssued: learning.textbookIssued,
    textbookOpened: learning.textbookOpened,
    exitSurveyComplete: learning.exitSurveyComplete,
  };
}

export function StudentDemoProvider({ children }: { children: React.ReactNode }) {
  const { session, syncedUser, isSupabaseEnabled, isLoading, refreshSyncedUser } = useAuth();
  const [state, setState] = React.useState<StudentDemoState>(() => createFallbackState());
  const [portalHydrated, setPortalHydrated] = React.useState(false);

  const studentId = syncedUser?.localUserId;
  const accessToken = session?.access_token;
  const isStudentUser = syncedUser?.role === 'student';

  const callStudentApi = React.useCallback(
    async <TData,>(
      path: string,
      init?: RequestInit,
      options?: { studentId?: string; accessToken?: string; isStudentUser?: boolean }
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
    [accessToken, isStudentUser, studentId]
  );

  const refreshPortal = React.useCallback(async () => {
    if (!studentId || !accessToken || !isStudentUser) {
      setState(createFallbackState());
      setPortalHydrated(true);
      return;
    }

    const portal = await callStudentApi<StudentPortalApi>('/portal', { method: 'GET' });
    setState(mapPortalToState(portal));
    setPortalHydrated(true);
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
      setPortalHydrated(true);
      return;
    }

    setPortalHydrated(false);

    const hydratePortal = async () => {
      try {
        const resolvedSyncedUser =
          syncedUser ?? (await refreshSyncedUser(accessToken).catch(() => null));

        if (!resolvedSyncedUser || resolvedSyncedUser.role !== 'student') {
          setState(createFallbackState());
          setPortalHydrated(true);
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
        setPortalHydrated(true);
      } catch {
        setState(createFallbackState());
        setPortalHydrated(true);
      }
    };

    void hydratePortal();
  }, [
    accessToken,
    callStudentApi,
    isLoading,
    isSupabaseEnabled,
    refreshPortal,
    refreshSyncedUser,
    syncedUser,
  ]);

  const mutate = React.useCallback(
    (path: string, method: 'POST' | 'PATCH', body?: unknown) => {
      if (!studentId || !accessToken || !isStudentUser) {
        return;
      }

      const refresh = path.startsWith('/learning') ? refreshLearning : refreshPortal;

      void callStudentApi(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      })
        .then(() => refresh())
        .catch(() => refresh());
    },
    [accessToken, callStudentApi, isStudentUser, refreshLearning, refreshPortal, studentId]
  );

  const setWorkflowStage = React.useCallback(
    (workflowStage: StudentWorkflowStage) => {
      setState((current) => ({ ...current, workflowStage }));
      mutate('/intake/workflow-stage', 'PATCH', { workflowStage });
    },
    [mutate]
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
    [mutate]
  );

  const submitEntranceExam = React.useCallback(() => {
    mutate('/intake/entrance-exam/submit', 'POST');
  }, [mutate]);

  const updateEnrollmentWizardField = React.useCallback(
    (
      key:
        | 'hhaAddon'
        | 'scrubTop'
        | 'scrubBottom'
        | 'shipping'
        | 'wantsToTestAtDaisy'
        | 'signature',
      value: string | boolean | null
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
    [mutate]
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
    [mutate, state.enrollmentWizard.agreements]
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
    [mutate, state.intakeJourney]
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
    [mutate]
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
    [mutate, state.intakeJourney]
  );

  const submitEntranceSurvey = React.useCallback(() => {
    mutate('/intake/entrance-survey/submit', 'POST');
  }, [mutate]);

  const toggleTask = React.useCallback(
    (taskId: string) => {
      mutate(`/tasks/${taskId}/toggle`, 'PATCH');
    },
    [mutate]
  );

  const completeOnboardingStep = React.useCallback(
    (stepId: string) => {
      mutate(`/onboarding/steps/${stepId}/toggle`, 'PATCH');
    },
    [mutate]
  );

  const answerOnboardingQuestion = React.useCallback(
    (questionId: string, answer: string) => {
      setState((current) => ({
        ...current,
        onboardingQuestions: current.onboardingQuestions.map((question) =>
          question.id === questionId ? { ...question, answer } : question
        ),
      }));
      mutate(`/onboarding/questions/${questionId}`, 'PATCH', { answer });
    },
    [mutate]
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
    [mutate, state.acknowledgements]
  );

  const uploadReadinessDocument = React.useCallback(
    async (documentId: string, file: File) => {
      if (!studentId || !accessToken || !isStudentUser) {
        throw new Error('Student portal is not authenticated.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE_URL}/students/${studentId}/onboarding/documents/${documentId}/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? 'Failed to upload document.');
      }

      await refreshPortal();
    },
    [accessToken, isStudentUser, refreshPortal, studentId]
  );

  const submitOnboardingPackage = React.useCallback(() => {
    mutate('/onboarding/submit', 'POST');
  }, [mutate]);

  const selectThread = React.useCallback(
    (threadId: string) => {
      mutate(`/messages/${threadId}/select`, 'PATCH');
    },
    [mutate]
  );

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
        moduleName:
          state.modules.find((module) => module.id === state.activeModuleId)?.title ??
          'Student Support',
        text: cleanText,
      });
    },
    [mutate, state.activeModuleId, state.modules, state.threads]
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
    [mutate, state.uploads]
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
    [mutate]
  );

  const advanceLearning = React.useCallback(
    (minutes = 1) => {
      mutate('/learning/advance', 'POST', { minutes });
    },
    [mutate]
  );

  const toggleLearningSession = React.useCallback(() => {
    mutate('/learning/session/toggle', 'POST');
  }, [mutate]);

  const setLearningSession = React.useCallback(
    (active: boolean) => {
      setState((current) => ({ ...current, learningSessionActive: active }));
      mutate('/learning/session', 'PATCH', { active });
    },
    [mutate]
  );

  const recordLessonSessionStart = React.useCallback(
    (lessonId: string) => {
      setState((current) => {
        const now = new Date().toISOString();
        return {
          ...current,
          activeLessonId: lessonId,
          lessonElapsedMinutes: {
            ...current.lessonElapsedMinutes,
            [lessonId]: Math.max(0, current.lessonElapsedMinutes[lessonId] ?? 0),
          },
          activeLearningAttention:
            current.activeLearningAttention &&
            current.activeLearningAttention.moduleId === current.activeModuleId &&
            current.activeLearningAttention.lessonId === lessonId
              ? current.activeLearningAttention
              : {
                  moduleId: current.activeModuleId,
                  lessonId,
                  startedAt: now,
                  lastActivityAt: now,
                  focusLossCount: 0,
                  visibilityLossCount: 0,
                  manualPauseCount: 0,
                  warnings: 0,
                  recentEvents: [],
                },
        };
      });
      mutate(`/learning/lessons/${lessonId}/session-start`, 'PATCH');
    },
    [mutate]
  );

  const reportLearningAttentionEvent = React.useCallback(
    (payload: { type: LearningAttentionEventType; detail?: string }) => {
      setState((current) => {
        const now = new Date().toISOString();
        const activeLearningAttention =
          current.activeLearningAttention &&
          current.activeLessonId &&
          current.activeLearningAttention.lessonId === current.activeLessonId &&
          current.activeLearningAttention.moduleId === current.activeModuleId
            ? { ...current.activeLearningAttention }
            : current.activeLessonId
              ? {
                  moduleId: current.activeModuleId,
                  lessonId: current.activeLessonId,
                  startedAt: now,
                  lastActivityAt: now,
                  focusLossCount: 0,
                  visibilityLossCount: 0,
                  manualPauseCount: 0,
                  warnings: 0,
                  recentEvents: [],
                }
              : undefined;

        if (!activeLearningAttention) {
          return current;
        }

        activeLearningAttention.warnings += 1;
        activeLearningAttention.lastActivityAt = now;

        if (payload.type === 'visibility_hidden') {
          activeLearningAttention.visibilityLossCount += 1;
        } else if (payload.type === 'window_blur') {
          activeLearningAttention.focusLossCount += 1;
        } else if (payload.type === 'session_paused') {
          activeLearningAttention.manualPauseCount += 1;
        }

        return {
          ...current,
          learningSessionActive: false,
          activeLearningAttention,
        };
      });

      mutate('/learning/attention-events', 'POST', payload);
    },
    [mutate]
  );

  const startModuleExamSession = React.useCallback(
    async (moduleId: string, stepId: string) => {
      try {
        const session = await callStudentApi<ActiveExamSession>(
          `/learning/modules/${moduleId}/exam/session`,
          { method: 'POST', body: JSON.stringify({ stepId }) }
        );
        setState((current) => ({
          ...current,
          activeModuleId: moduleId,
          activeLessonId: undefined,
          activeExamSession: session,
        }));
        await refreshLearning().catch(() => undefined);
        return session;
      } catch {
        await refreshLearning().catch(() => undefined);
        return null;
      }
    },
    [callStudentApi, refreshLearning]
  );

  const reportExamSecurityEvent = React.useCallback(
    (moduleId: string, payload: { type: ExamSecurityEventType; detail?: string }) => {
      setState((current) => {
        const activeExamSession =
          current.activeExamSession && current.activeExamSession.moduleId === moduleId
            ? {
                ...current.activeExamSession,
                warnings: current.activeExamSession.warnings + 1,
                lastActivityAt: new Date().toISOString(),
              }
            : current.activeExamSession;

        return {
          ...current,
          activeExamSession,
        };
      });

      mutate(`/learning/modules/${moduleId}/exam/session/events`, 'POST', payload);
    },
    [mutate]
  );

  const loadAiTutorConversation = React.useCallback(
    async (moduleId: string, lessonId: string) => {
      try {
        const conversation = await callStudentApi<AiTutorConversation>(
          `/learning/modules/${moduleId}/lessons/${lessonId}/ai-tutor`,
          { method: 'GET' }
        );
        setState((current) => ({
          ...current,
          aiTutorConversations: {
            ...current.aiTutorConversations,
            [`${moduleId}::${lessonId}`]: conversation,
          },
        }));
      } catch {
        // Keep any previously loaded conversation on failure.
      }
    },
    [callStudentApi]
  );

  const askAiTutor = React.useCallback(
    async (moduleId: string, lessonId: string, question: string): Promise<AiTutorConversation | null> => {
      try {
        const conversation = await callStudentApi<AiTutorConversation>(
          `/learning/modules/${moduleId}/lessons/${lessonId}/ai-tutor`,
          { method: 'POST', body: JSON.stringify({ question }) }
        );
        setState((current) => ({
          ...current,
          aiTutorConversations: {
            ...current.aiTutorConversations,
            [`${moduleId}::${lessonId}`]: conversation,
          },
        }));
        return conversation;
      } catch {
        return null;
      }
    },
    [callStudentApi]
  );

  const selectModule = React.useCallback(
    (moduleId: string) => {
      setState((current) => ({ ...current, activeModuleId: moduleId }));
      mutate('/learning/modules/active', 'PATCH', { moduleId });
    },
    [mutate]
  );

  const markStepComplete = React.useCallback(
    (moduleId: string, stepId: string) => {
      mutate(`/learning/modules/${moduleId}/steps/${stepId}/toggle`, 'PATCH');
    },
    [mutate]
  );

  const submitModuleExam = React.useCallback(
    async (payload?: {
      stepId?: string;
      answers?: Record<string, string>;
    }): Promise<ModuleExamOutcome> => {
      try {
        const response = await callStudentApi<{ module: ModuleItem; result: ModuleExamResult }>(
          `/learning/modules/${state.activeModuleId}/exam`,
          { method: 'POST', body: JSON.stringify(payload ?? {}) }
        );
        await refreshLearning().catch(() => undefined);
        return { ok: true, result: response.result };
      } catch (error) {
        await refreshLearning().catch(() => undefined);
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'Module exam submission failed.',
        };
      }
    },
    [callStudentApi, refreshLearning, state.activeModuleId]
  );

  const issueTextbook = React.useCallback(() => {
    mutate('/learning/textbook/open', 'POST');
  }, [mutate]);

  const completeExitSurvey = React.useCallback(() => {
    mutate('/learning/exit-survey/complete', 'POST');
  }, [mutate]);

  const makePayment = React.useCallback(() => {
    mutate('/financials/payments/next', 'POST');
  }, [mutate]);

  const checkIn = React.useCallback(
    (type: 'Theory' | 'Clinical') => {
      mutate('/attendance/check-in', 'POST', { type });
    },
    [mutate]
  );

  const reportAbsence = React.useCallback(
    (kind: 'today' | 'future') => {
      mutate('/attendance/absences', 'POST', { kind });
    },
    [mutate]
  );

  const submitReflection = React.useCallback(
    (text: string) => {
      const answer = text.trim();
      if (answer) {
        mutate('/reflections', 'POST', { answer });
      }
    },
    [mutate]
  );

  const submitQuestionAnswer = React.useCallback(
    (text: string) => {
      const answer = text.trim();
      if (answer) {
        mutate('/daily-question', 'POST', { answer });
      }
    },
    [mutate]
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
    [mutate]
  );

  const signCdphForm = React.useCallback(() => {
    mutate('/forms/cdph-283b/sign', 'POST');
  }, [mutate]);

  const downloadCdph283bPdf = React.useCallback(async () => {
    if (!studentId || !accessToken || !isStudentUser) {
      throw new Error('Student portal is not authenticated.');
    }

    const response = await fetch(`${API_BASE_URL}/students/${studentId}/forms/cdph-283b/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to generate the CDPH 283B PDF.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cdph-283b.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [accessToken, isStudentUser, studentId]);

  const logClinicalHours = React.useCallback(() => {
    mutate('/clinical-hours/logs', 'POST', {
      date: new Date().toISOString().slice(0, 10),
      moduleId: state.activeModuleId,
      moduleTitle:
        state.modules.find((module) => module.id === state.activeModuleId)?.title ??
        'Clinical Practice',
      hours: 4,
      instructor: 'James Miller',
      note: 'Logged from the student clinical hours workspace.',
    });
  }, [mutate, state.activeModuleId, state.modules]);

  const submitAssignment = React.useCallback(
    (assignmentId: string) => {
      mutate(`/assignments/${assignmentId}/submit`, 'POST');
    },
    [mutate]
  );

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
    [mutate]
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
    0
  );
  const theoryHoursRequired = state.modules.reduce(
    (total, module) => total + module.requiredHours,
    0
  );
  const clinicalHoursCompleted = state.clinicalLogs.reduce((total, log) => total + log.hours, 0);
  const overallProgressPercent =
    theoryHoursRequired + CLINICAL_HOURS_REQUIRED > 0
      ? Math.round(
          ((theoryHoursCompleted + clinicalHoursCompleted) /
            (theoryHoursRequired + CLINICAL_HOURS_REQUIRED)) *
            100
        )
      : 0;
  const unreadCount = state.threads.filter((thread) => thread.unread).length;
  const urgentTaskCount = state.tasks.filter((task) => task.urgent && !task.complete).length;
  const portalUnlocked = state.workflowStage === 'active';
  const readinessCount =
    Object.values(state.acknowledgements).filter(Boolean).length +
    Object.values(state.readinessUploads).filter(Boolean).length;
  const answeredQuestions = state.onboardingQuestions.filter((question) =>
    question.answer.trim()
  ).length;
  const onboardingProgressPercent =
    state.onboardingSteps.length + 6 + state.onboardingQuestions.length > 0
      ? Math.round(
          ((completedOnboardingCount + readinessCount + answeredQuestions) /
            (state.onboardingSteps.length + 6 + state.onboardingQuestions.length)) *
            100
        )
      : 0;
  // Session target comes from the configured module hours fetched from the API.
  const requiredSessionMinutes = Math.max(0, Math.round((currentModule?.requiredHours ?? 0) * 60));
  const sessionMinutes = Math.min(
    Math.max(
      0,
      Math.round(currentModule?.sessionMinutes ?? (currentModule?.completedHours ?? 0) * 60)
    ),
    requiredSessionMinutes
  );
  const examUnlocked = sessionMinutes >= requiredSessionMinutes;
  const moduleCertificatesReady = state.modules.filter(
    (module) => module.certificateUnlocked
  ).length;
  const paymentCompleted = state.paymentHistory
    .filter((payment) => payment.status === 'Completed')
    .reduce((total, payment) => total + payment.amount, 0);
  const paymentBalance = Math.max(state.totalTuition - paymentCompleted, 0);
  const programCertificateReady =
    state.modules.every((module) => module.status === 'Complete') &&
    paymentBalance === 0 &&
    state.exitSurveyComplete;
  const today = new Date().toISOString().slice(0, 10);
  const todayTheoryCheckedIn = state.attendanceRecords.some(
    (record) => record.date === today && record.type === 'Theory' && record.status === 'Present'
  );
  const todayClinicalCheckedIn = state.attendanceRecords.some(
    (record) => record.date === today && record.type === 'Clinical' && record.status === 'Present'
  );

  const value = React.useMemo<StudentDemoContextValue>(
    () => ({
      ...state,
      portalHydrated,
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
      sessionMinutes,
      requiredSessionMinutes,
      examUnlocked,
      moduleCertificatesReady,
      programCertificateReady,
      paymentBalance,
      amountPaid: paymentCompleted,
      todayTheoryCheckedIn,
      todayClinicalCheckedIn,
      refreshLearning,
      refreshPortal,
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
      uploadReadinessDocument,
      submitOnboardingPackage,
      selectThread,
      sendMessage,
      uploadDocument,
      replaceDocument,
      updateSetting,
      advanceLearning,
      toggleLearningSession,
      setLearningSession,
      recordLessonSessionStart,
      reportLearningAttentionEvent,
      startModuleExamSession,
      reportExamSecurityEvent,
      loadAiTutorConversation,
      askAiTutor,
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
      downloadCdph283bPdf,
      logClinicalHours,
      submitAssignment,
      submitSupportTicket,
    }),
    [
      activeThread,
      advanceLearning,
      answerEntranceExamQuestion,
      answerOnboardingQuestion,
      askAiTutor,
      checkIn,
      clinicalHoursCompleted,
      completeExitSurvey,
      completedOnboardingCount,
      completeOnboardingStep,
      currentModule,
      downloadCdph283bPdf,
      examUnlocked,
      generateLiveScan,
      issueTextbook,
      loadAiTutorConversation,
      logClinicalHours,
      makePayment,
      markStepComplete,
      moduleCertificatesReady,
      onboardingProgressPercent,
      overallProgressPercent,
      paymentBalance,
      paymentCompleted,
      portalHydrated,
      portalUnlocked,
      programCertificateReady,
      reportLearningAttentionEvent,
      reportExamSecurityEvent,
      refreshLearning,
      refreshPortal,
      readinessCount,
      recordLessonSessionStart,
      replaceDocument,
      reportAbsence,
      startModuleExamSession,
      requiredSessionMinutes,
      selectModule,
      selectThread,
      sendMessage,
      sessionMinutes,
      setEnrollmentWizardStep,
      setEntranceSurveyStep,
      setLearningSession,
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
      uploadReadinessDocument,
      toggleTask,
      toggleLiveScanUpload,
      unreadCount,
      updateCdphField,
      updateEnrollmentWizardField,
      updateEntranceSurveyAnswer,
      updateSetting,
      uploadDocument,
      urgentTaskCount,
    ]
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
