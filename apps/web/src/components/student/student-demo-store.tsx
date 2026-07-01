'use client';

import * as React from 'react';

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
  type: 'Video' | 'PDF' | 'Reading' | 'Skill Check' | 'Quiz';
  duration: string;
  note: string;
  complete: boolean;
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

type StudentDemoState = {
  workflowStage: StudentWorkflowStage;
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
  setWorkflowStage: (stage: StudentWorkflowStage) => void;
  answerEntranceExamQuestion: (questionId: string, answer: string) => void;
  submitEntranceExam: () => void;
  updateEnrollmentWizardField: (
    key: 'hhaAddon' | 'scrubTop' | 'scrubBottom' | 'shipping' | 'wantsToTestAtDaisy' | 'signature',
    value: string | boolean | null,
  ) => void;
  toggleEnrollmentAgreement: (
    key: keyof EnrollmentWizardState['agreements'],
  ) => void;
  setEnrollmentWizardStep: (step: number) => void;
  submitEnrollmentWizard: () => void;
  updateEntranceSurveyAnswer: (questionId: string, answer: string) => void;
  setEntranceSurveyStep: (step: number) => void;
  submitEntranceSurvey: () => void;
  toggleTask: (taskId: string) => void;
  completeOnboardingStep: (stepId: string) => void;
  answerOnboardingQuestion: (questionId: string, answer: string) => void;
  toggleAcknowledgement: (
    key: keyof StudentDemoState['acknowledgements'],
  ) => void;
  toggleReadinessUpload: (
    key: keyof StudentDemoState['readinessUploads'],
  ) => void;
  submitOnboardingPackage: () => void;
  selectThread: (threadId: string) => void;
  sendMessage: (threadId: string, text: string) => void;
  uploadDocument: () => void;
  replaceDocument: (uploadId: string) => void;
  updateSetting: <TKey extends keyof StudentSettings>(
    key: TKey,
    value: StudentSettings[TKey],
  ) => void;
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
  updateCdphField: <TKey extends keyof CdphForm>(
    key: TKey,
    value: CdphForm[TKey],
  ) => void;
  signCdphForm: () => void;
  logClinicalHours: () => void;
  submitAssignment: (assignmentId: string) => void;
  submitSupportTicket: (ticket: { subject: string; category: string; message: string }) => void;
};

const STORAGE_KEY = 'class-verse-student-demo-v2';
const TOTAL_TUITION = 3500;
const CLINICAL_HOURS_REQUIRED = 40;
const ENROLLMENT_STUDENT_NAME = 'Amara Singh';

const ENTRANCE_EXAM_QUESTIONS = [
  {
    id: 'q1',
    correct: 'B',
  },
  {
    id: 'q2',
    correct: 'B',
  },
  {
    id: 'q3',
    correct: 'C',
  },
  {
    id: 'q4',
    correct: 'B',
  },
  {
    id: 'q5',
    correct: 'B',
  },
  {
    id: 'q6',
    correct: 'written',
  },
] as const;

const initialState: StudentDemoState = {
  workflowStage: 'entrance_exam',
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
    agreements: {
      ip: false,
      refund: false,
      conduct: false,
      lateFee: false,
    },
    signature: '',
    submitted: false,
  },
  entranceSurvey: {
    step: 1,
    answers: {},
    completed: false,
  },
  onboardingSteps: [
    {
      id: 'profile',
      title: 'Confirm student profile',
      description: 'Review your legal name, emergency contact, and mailing details.',
      complete: true,
      actionLabel: 'Reviewed',
    },
    {
      id: 'documents',
      title: 'Upload admissions documents',
      description: 'Submit your ID, diploma, and health-clearance packet.',
      complete: true,
      actionLabel: 'Open documents',
    },
    {
      id: 'orientation',
      title: 'Finish orientation checklist',
      description: 'Acknowledge schedule, attendance policy, and online study readiness.',
      complete: false,
      actionLabel: 'Finish now',
    },
    {
      id: 'billing',
      title: 'Set payment preference',
      description: 'Confirm your installment plan and active card on file.',
      complete: false,
      actionLabel: 'Review billing',
    },
  ],
  onboardingQuestions: [
    {
      id: 'motivation',
      prompt: 'Why are you pursuing this healthcare training program right now?',
      answer: '',
    },
    {
      id: 'schedule',
      prompt: 'How will you protect time for theory study, labs, and clinical shifts each week?',
      answer: '',
    },
    {
      id: 'support',
      prompt: 'What kind of support will help you stay consistent through the program?',
      answer: '',
    },
  ],
  acknowledgements: {
    schedule: false,
    attendance: false,
    technology: false,
  },
  readinessUploads: {
    photoId: true,
    diploma: true,
    tbTest: false,
  },
  onboardingSubmitted: false,
  tasks: [
    {
      id: 'theory-hours',
      title: 'Complete 2 theory hours',
      detail: 'Required to unlock the Module 3 exam',
      complete: false,
      urgent: true,
    },
    {
      id: 'entrance-survey',
      title: 'Finish onboarding intake survey',
      detail: 'Administrative review is waiting on your final response',
      complete: false,
      urgent: true,
    },
    {
      id: 'clinical-log',
      title: 'Submit Clinical Log #04',
      detail: 'Skills lab follow-up needs one pending hour entry',
      complete: false,
    },
  ],
  modules: [
    {
      id: 'm1',
      title: 'Foundation of Patient Care',
      summary: 'Core ethics, workflow, and patient communication',
      status: 'Complete',
      progressPercent: 100,
      requiredHours: 20,
      completedHours: 20,
      examScore: '96/100',
      certificateUnlocked: true,
      steps: [
        {
          id: 'm1-video',
          title: 'Intro lecture',
          type: 'Video',
          duration: '18 min',
          note: 'Recorded orientation-style lecture',
          complete: true,
        },
        {
          id: 'm1-pdf',
          title: 'Handbook packet',
          type: 'PDF',
          duration: '6 pages',
          note: 'FERPA and attendance policy overview',
          complete: true,
        },
        {
          id: 'm1-quiz',
          title: 'Readiness checkpoint',
          type: 'Quiz',
          duration: '10 questions',
          note: 'Passed',
          complete: true,
        },
      ],
    },
    {
      id: 'm2',
      title: 'Anatomy & Physiology',
      summary: 'System review, terminology, and patient observation',
      status: 'Complete',
      progressPercent: 100,
      requiredHours: 15,
      completedHours: 15,
      examScore: '92/100',
      certificateUnlocked: true,
      steps: [
        {
          id: 'm2-video',
          title: 'Body systems overview',
          type: 'Video',
          duration: '22 min',
          note: 'Module recording',
          complete: true,
        },
        {
          id: 'm2-reading',
          title: 'System terminology notes',
          type: 'Reading',
          duration: '12 min',
          note: 'Self-paced content',
          complete: true,
        },
        {
          id: 'm2-quiz',
          title: 'Module assessment',
          type: 'Quiz',
          duration: '15 questions',
          note: 'Passed',
          complete: true,
        },
      ],
    },
    {
      id: 'm3',
      title: 'Vital Signs & Monitoring',
      summary: 'Temperature, pulse, respiration, blood pressure, and charting',
      status: 'In Progress',
      progressPercent: 72,
      requiredHours: 25,
      completedHours: 18,
      certificateUnlocked: false,
      steps: [
        {
          id: 'm3-video',
          title: 'Vital signs lecture',
          type: 'Video',
          duration: '24 min',
          note: 'Play recorded lesson and log engagement',
          complete: true,
        },
        {
          id: 'm3-pdf',
          title: 'Procedure PDF',
          type: 'PDF',
          duration: '8 pages',
          note: 'Printable bedside checklist',
          complete: false,
        },
        {
          id: 'm3-reading',
          title: 'Clinical reading notes',
          type: 'Reading',
          duration: '14 min',
          note: 'Reference ranges and documentation standards',
          complete: false,
        },
        {
          id: 'm3-skill',
          title: 'Skill demonstration upload',
          type: 'Skill Check',
          duration: '1 upload',
          note: 'Static demo evidence submission',
          complete: false,
        },
        {
          id: 'm3-quiz',
          title: 'Module exam',
          type: 'Quiz',
          duration: '20 questions',
          note: 'Unlocks after learning requirement',
          complete: false,
        },
      ],
    },
    {
      id: 'm4',
      title: 'Clinical Readiness',
      summary: 'Scenario walkthroughs, safety checks, and final prep',
      status: 'Locked',
      progressPercent: 0,
      requiredHours: 20,
      completedHours: 0,
      certificateUnlocked: false,
      steps: [
        {
          id: 'm4-video',
          title: 'Simulation briefing',
          type: 'Video',
          duration: '20 min',
          note: 'Unlocks after Module 3 exam pass',
          complete: false,
        },
        {
          id: 'm4-pdf',
          title: 'Clinical packet',
          type: 'PDF',
          duration: '5 pages',
          note: 'Lab expectations and supply checklist',
          complete: false,
        },
        {
          id: 'm4-quiz',
          title: 'Final module exam',
          type: 'Quiz',
          duration: '25 questions',
          note: 'Required for completion certificate',
          complete: false,
        },
      ],
    },
  ],
  activeModuleId: 'm3',
  activeThreadId: 'lisa-wong',
  threads: [
    {
      id: 'lisa-wong',
      name: 'Lisa Wong',
      role: 'Senior Instructor',
      status: 'Unread',
      preview: "Great progress on your vital signs drill. I've left feedback on your charting.",
      time: '10:45 AM',
      unread: true,
      messages: [
        {
          id: 'lw-1',
          sender: 'staff',
          text: "Great progress on your vital signs drill. I've left feedback on your charting.",
          time: '10:45 AM',
        },
        {
          id: 'lw-2',
          sender: 'student',
          text: "Thank you. I'm reviewing the charting notes before I upload the skill check.",
          time: '11:02 AM',
        },
      ],
    },
    {
      id: 'james-miller',
      name: 'James Miller',
      role: 'Clinical Supervisor',
      status: 'New',
      preview: 'Bring your printed checklist to Thursday lab so we can verify your skills signoff.',
      time: 'Yesterday',
      unread: true,
      messages: [
        {
          id: 'jm-1',
          sender: 'staff',
          text: 'Bring your printed checklist to Thursday lab so we can verify your skills signoff.',
          time: 'Yesterday',
        },
      ],
    },
    {
      id: 'ops-team',
      name: 'Admissions Team',
      role: 'Program Operations',
      status: 'Read',
      preview: 'Your intake packet is almost complete. One health-clearance upload is still pending.',
      time: 'Mon',
      unread: false,
      messages: [
        {
          id: 'ops-1',
          sender: 'system',
          text: 'Your intake packet is almost complete. One health-clearance upload is still pending.',
          time: 'Mon',
        },
      ],
    },
  ],
  uploads: [
    {
      id: 'photo-id',
      title: 'Photo ID',
      subtitle: "California driver's license",
      date: 'MAR 12, 2024',
      status: 'Verified',
    },
    {
      id: 'diploma',
      title: 'High School Diploma',
      subtitle: 'Education eligibility proof',
      date: 'FEB 28, 2024',
      status: 'Verified',
    },
    {
      id: 'tb-clearance',
      title: 'Physical + TB Clearance',
      subtitle: 'Clinical health-compliance packet',
      date: 'JUN 11, 2026',
      status: 'Pending Review',
    },
  ],
  supportTickets: [
    {
      id: 'ticket-001',
      subject: 'Clinical schedule clarification',
      category: 'Scheduling',
      message: 'Need confirmation on the arrival time for Thursday skills lab.',
      status: 'In Review',
      createdAt: 'Today 08:14 AM',
    },
  ],
  settings: {
    email_updates: true,
    sms_alerts: false,
    remember_device: true,
  },
  learningMinutes: 390,
  learningSessionActive: false,
  attendanceRecords: [],
  reflectionResponse: '',
  questionOfDayAnswer: '',
  assignments: [
    {
      id: 'assign-1',
      title: 'Charting practice sheet',
      due: 'Jul 02',
      detail: 'Upload one completed set of sample vital-sign notes.',
      moduleId: 'm3',
      status: 'Pending',
    },
    {
      id: 'assign-2',
      title: 'Hand hygiene checklist',
      due: 'Jul 05',
      detail: 'Review the PDF and confirm each compliance step.',
      moduleId: 'm4',
      status: 'Pending',
    },
  ],
  upcomingSessions: [
    {
      id: 'session-1',
      title: 'Skills Lab: Vitals Rotation',
      date: 'Jul 01, 2:00 PM',
      location: 'Skills Lab B',
      instructor: 'James Miller',
      type: 'Clinical',
    },
    {
      id: 'session-2',
      title: 'Theory Review Live Session',
      date: 'Jul 03, 9:00 AM',
      location: 'Virtual Classroom',
      instructor: 'Lisa Wong',
      type: 'Theory',
    },
  ],
  paymentHistory: [
    { id: 'pay-1', date: 'Jan 15, 2026', amount: 875, status: 'Completed', method: 'Visa ....4242' },
    { id: 'pay-2', date: 'Apr 15, 2026', amount: 875, status: 'Completed', method: 'Visa ....4242' },
    { id: 'pay-3', date: 'Jul 15, 2026', amount: 875, status: 'Upcoming', method: 'Visa ....4242' },
    { id: 'pay-4', date: 'Oct 15, 2026', amount: 875, status: 'Upcoming', method: 'Visa ....4242' },
  ],
  clinicalLogs: [
    {
      id: 'log-1',
      date: 'JUN 10, 2026',
      module: 'Patient Mobility',
      hours: 12,
      instructor: 'James Miller',
      status: 'Verified',
    },
    {
      id: 'log-2',
      date: 'JUN 17, 2026',
      module: 'Bedside Care',
      hours: 14,
      instructor: 'Lisa Wong',
      status: 'Verified',
    },
    {
      id: 'log-3',
      date: 'JUN 24, 2026',
      module: 'Vitals Simulation',
      hours: 12,
      instructor: 'James Miller',
      status: 'Pending',
    },
  ],
  textbookIssued: true,
  textbookOpened: false,
  liveScanGenerated: false,
  liveScanUploaded: false,
  cdphForm: {
    lastName: 'Singh',
    firstName: 'Amara',
    dob: '',
    phone: '(555) 010-2291',
    email: 'amara.singh@classverse.edu',
    city: 'San Francisco',
    zip: '94110',
    conviction: false,
    convictionDetails: '',
  },
  cdphSigned: false,
  exitSurveyComplete: false,
  lastAction: 'Student portal ready for demo walkthrough.',
};

const StudentDemoContext = React.createContext<StudentDemoContextValue | null>(null);

function formatTime() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

function formatDateStamp() {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();
}

function formatIsoDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0] ?? '';
}

function recalculateModule(module: ModuleItem) {
  const completedSteps = module.steps.filter((step) => step.complete).length;
  const progressPercent = Math.round((completedSteps / module.steps.length) * 100);
  const completedHours = Math.min(
    module.requiredHours,
    Math.max(0, Math.round((progressPercent / 100) * module.requiredHours)),
  );

  return {
    ...module,
    progressPercent,
    completedHours,
    status:
      progressPercent >= 100
        ? 'Complete'
        : progressPercent > 0 && module.status !== 'Locked'
          ? 'In Progress'
          : module.status,
  } satisfies ModuleItem;
}

export function StudentDemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StudentDemoState>(initialState);

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as StudentDemoState;
      setState(parsed);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setWorkflowStage = React.useCallback((stage: StudentWorkflowStage) => {
    setState((current) => ({
      ...current,
      workflowStage: stage,
      lastAction: `Student workflow moved to ${stage.replaceAll('_', ' ')}.`,
    }));
  }, []);

  const answerEntranceExamQuestion = React.useCallback((questionId: string, answer: string) => {
    setState((current) => ({
      ...current,
      entranceExam: {
        ...current.entranceExam,
        answers: {
          ...current.entranceExam.answers,
          [questionId]: answer,
        },
      },
      lastAction: 'Entrance exam response saved in demo state.',
    }));
  }, []);

  const submitEntranceExam = React.useCallback(() => {
    setState((current) => {
      const score = ENTRANCE_EXAM_QUESTIONS.reduce((total, question) => {
        const answer = current.entranceExam.answers[question.id]?.trim() ?? '';
        if (question.correct === 'written') {
          return total + (answer.length >= 12 ? 1 : 0);
        }

        return total + (answer.startsWith(question.correct) ? 1 : 0);
      }, 0);
      const passed = score >= 5;

      return {
        ...current,
        workflowStage: passed ? 'enrollment_wizard' : 'entrance_exam',
        entranceExam: {
          ...current.entranceExam,
          score,
          taken: true,
          passed,
        },
        lastAction: passed
          ? `Entrance exam passed with ${score}/${ENTRANCE_EXAM_QUESTIONS.length}. Enrollment setup unlocked.`
          : `Entrance exam scored ${score}/${ENTRANCE_EXAM_QUESTIONS.length}. Review required before continuing.`,
      };
    });
  }, []);

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
        } as EnrollmentWizardState,
        lastAction: 'Enrollment wizard updated locally for the demo flow.',
      }));
    },
    [],
  );

  const toggleEnrollmentAgreement = React.useCallback(
    (key: keyof EnrollmentWizardState['agreements']) => {
      setState((current) => ({
        ...current,
        enrollmentWizard: {
          ...current.enrollmentWizard,
          agreements: {
            ...current.enrollmentWizard.agreements,
            [key]: !current.enrollmentWizard.agreements[key],
          },
        },
        lastAction: 'Enrollment agreement acknowledgement updated.',
      }));
    },
    [],
  );

  const setEnrollmentWizardStep = React.useCallback((step: number) => {
    setState((current) => ({
      ...current,
      enrollmentWizard: {
        ...current.enrollmentWizard,
        step: Math.min(5, Math.max(1, step)),
      },
    }));
  }, []);

  const submitEnrollmentWizard = React.useCallback(() => {
    setState((current) => ({
      ...current,
      workflowStage: 'admin_review',
      enrollmentWizard: {
        ...current.enrollmentWizard,
        submitted: true,
        step: 5,
      },
      lastAction: 'Enrollment package submitted for simulated admin review.',
    }));
  }, []);

  const updateEntranceSurveyAnswer = React.useCallback((questionId: string, answer: string) => {
    setState((current) => ({
      ...current,
      entranceSurvey: {
        ...current.entranceSurvey,
        answers: {
          ...current.entranceSurvey.answers,
          [questionId]: answer,
        },
      },
      lastAction: 'Orientation survey answer auto-saved.',
    }));
  }, []);

  const setEntranceSurveyStep = React.useCallback((step: number) => {
    setState((current) => ({
      ...current,
      entranceSurvey: {
        ...current.entranceSurvey,
        step: Math.min(5, Math.max(1, step)),
      },
    }));
  }, []);

  const submitEntranceSurvey = React.useCallback(() => {
    setState((current) => ({
      ...current,
      workflowStage: 'active',
      entranceSurvey: {
        ...current.entranceSurvey,
        completed: true,
        step: 5,
      },
      tasks: current.tasks.map((task) =>
        task.id === 'entrance-survey' ? { ...task, complete: true } : task,
      ),
      lastAction: 'Orientation survey completed. Student portal fully unlocked.',
    }));
  }, []);

  const toggleTask = React.useCallback((taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, complete: !task.complete } : task,
      ),
      lastAction: 'Task checklist updated across the student workflow.',
    }));
  }, []);

  const completeOnboardingStep = React.useCallback((stepId: string) => {
    setState((current) => ({
      ...current,
      onboardingSteps: current.onboardingSteps.map((step) =>
        step.id === stepId ? { ...step, complete: !step.complete } : step,
      ),
      lastAction: 'Onboarding checklist progress refreshed.',
    }));
  }, []);

  const answerOnboardingQuestion = React.useCallback((questionId: string, answer: string) => {
    setState((current) => ({
      ...current,
      onboardingQuestions: current.onboardingQuestions.map((question) =>
        question.id === questionId ? { ...question, answer } : question,
      ),
      lastAction: 'Onboarding response auto-saved in local demo state.',
    }));
  }, []);

  const toggleAcknowledgement = React.useCallback(
    (key: keyof StudentDemoState['acknowledgements']) => {
      setState((current) => ({
        ...current,
        acknowledgements: {
          ...current.acknowledgements,
          [key]: !current.acknowledgements[key],
        },
        lastAction: 'Orientation acknowledgements updated.',
      }));
    },
    [],
  );

  const toggleReadinessUpload = React.useCallback(
    (key: keyof StudentDemoState['readinessUploads']) => {
      setState((current) => ({
        ...current,
        readinessUploads: {
          ...current.readinessUploads,
          [key]: !current.readinessUploads[key],
        },
        lastAction: 'Readiness upload status updated for onboarding.',
      }));
    },
    [],
  );

  const submitOnboardingPackage = React.useCallback(() => {
    setState((current) => ({
      ...current,
      onboardingSubmitted: true,
      onboardingSteps: current.onboardingSteps.map((step) =>
        step.id === 'orientation'
          ? { ...step, complete: true, actionLabel: 'Submitted' }
          : step,
      ),
      tasks: current.tasks.map((task) =>
        task.id === 'entrance-survey' ? { ...task, complete: true } : task,
      ),
      lastAction: 'Onboarding package submitted to admissions review in the demo flow.',
    }));
  }, []);

  const selectThread = React.useCallback((threadId: string) => {
    setState((current) => ({
      ...current,
      activeThreadId: threadId,
      threads: current.threads.map((thread) =>
        thread.id === threadId ? { ...thread, unread: false, status: 'Read' } : thread,
      ),
      lastAction: 'Inbox conversation switched.',
    }));
  }, []);

  const sendMessage = React.useCallback((threadId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setState((current) => ({
      ...current,
      threads: current.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              preview: trimmed,
              time: formatTime(),
              status: 'Read',
              unread: false,
              messages: [
                ...thread.messages,
                {
                  id: `${threadId}-${Date.now()}`,
                  sender: 'student',
                  text: trimmed,
                  time: formatTime(),
                },
              ],
            }
          : thread,
      ),
      lastAction: `Reply sent to ${current.threads.find((thread) => thread.id === threadId)?.name ?? 'thread'}.`,
    }));
  }, []);

  const uploadDocument = React.useCallback(() => {
    setState((current) => ({
      ...current,
      uploads: [
        {
          id: `upload-${Date.now()}`,
          title: 'Livescan Form',
          subtitle: 'Student uploaded a refreshed compliance artifact',
          date: formatDateStamp(),
          status: 'Pending Review',
        },
        ...current.uploads,
      ],
      lastAction: 'A new document was added to the student record demo.',
    }));
  }, []);

  const replaceDocument = React.useCallback((uploadId: string) => {
    setState((current) => ({
      ...current,
      uploads: current.uploads.map((upload) =>
        upload.id === uploadId
          ? { ...upload, date: formatDateStamp(), status: 'Pending Review' }
          : upload,
      ),
      lastAction: 'A document replacement was staged for review.',
    }));
  }, []);

  const updateSetting = React.useCallback(
    <TKey extends keyof StudentSettings>(key: TKey, value: StudentSettings[TKey]) => {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          [key]: value,
        },
        lastAction: 'Student preferences saved locally for the demo.',
      }));
    },
    [],
  );

  const advanceLearning = React.useCallback((minutes = 30) => {
    setState((current) => {
      const learningMinutes = Math.min(current.learningMinutes + minutes, 480);
      const moduleIndex = current.modules.findIndex((module) => module.id === current.activeModuleId);
      const modules = [...current.modules];
      const activeModule = modules[moduleIndex];

      if (activeModule) {
        const nextIncompleteStep = activeModule.steps.find((step) => !step.complete);
        if (nextIncompleteStep && nextIncompleteStep.type !== 'Quiz') {
          nextIncompleteStep.complete = true;
        }

        modules[moduleIndex] = recalculateModule({
          ...activeModule,
          steps: [...activeModule.steps],
        });
      }

      const shouldUnlockExam = learningMinutes >= 480;
      const refreshedModules = modules.map((module) =>
        module.id === current.activeModuleId && shouldUnlockExam
          ? {
              ...module,
              steps: module.steps.map((step) =>
                step.type === 'Quiz'
                  ? { ...step, note: 'Assessment ready to launch' }
                  : step,
              ),
            }
          : module,
      );

      return {
        ...current,
        learningMinutes,
        modules: refreshedModules,
        tasks: current.tasks.map((task) =>
          task.id === 'theory-hours' && shouldUnlockExam ? { ...task, complete: true } : task,
        ),
        lastAction: shouldUnlockExam
          ? 'Module exam unlocked after simulated learning time.'
          : 'Learning progress and module steps advanced.',
      };
    });
  }, []);

  const toggleLearningSession = React.useCallback(() => {
    setState((current) => ({
      ...current,
      learningSessionActive: !current.learningSessionActive,
      lastAction: current.learningSessionActive
        ? 'Learning session paused.'
        : 'Learning session resumed.',
    }));
  }, []);

  const selectModule = React.useCallback((moduleId: string) => {
    setState((current) => ({
      ...current,
      activeModuleId: moduleId,
      lastAction: 'Learning viewer switched to a different module.',
    }));
  }, []);

  const markStepComplete = React.useCallback((moduleId: string, stepId: string) => {
    setState((current) => {
      const modules = current.modules.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        return recalculateModule({
          ...module,
          steps: module.steps.map((step) =>
            step.id === stepId ? { ...step, complete: !step.complete } : step,
          ),
        });
      });

      return {
        ...current,
        modules,
        lastAction: 'Module activity status updated.',
      };
    });
  }, []);

  const submitModuleExam = React.useCallback(() => {
    setState((current) => {
      const activeIndex = current.modules.findIndex((module) => module.id === current.activeModuleId);
      if (activeIndex === -1) {
        return current;
      }

      const modules = [...current.modules];
      const activeModule = modules[activeIndex];
      const score = activeModule.id === 'm3' ? '94/100' : '91/100';
      const completedModule = recalculateModule({
        ...activeModule,
        status: 'Complete',
        examScore: score,
        certificateUnlocked: true,
        steps: activeModule.steps.map((step) => ({ ...step, complete: true })),
      });
      modules[activeIndex] = completedModule;

      const nextModule = modules[activeIndex + 1];
      if (nextModule && nextModule.status === 'Locked') {
        modules[activeIndex + 1] = {
          ...nextModule,
          status: 'In Progress',
          progressPercent: 10,
          completedHours: 2,
        };
      }

      return {
        ...current,
        modules,
        activeModuleId: nextModule?.id ?? current.activeModuleId,
        lastAction: `${activeModule.title} exam submitted and certificate unlocked.`,
      };
    });
  }, []);

  const issueTextbook = React.useCallback(() => {
    setState((current) => ({
      ...current,
      textbookIssued: true,
      textbookOpened: true,
      lastAction: 'Digital textbook opened and access logged for the demo.',
    }));
  }, []);

  const completeExitSurvey = React.useCallback(() => {
    setState((current) => ({
      ...current,
      exitSurveyComplete: true,
      lastAction: 'Exit survey completed. Program certificate conditions updated.',
    }));
  }, []);

  const makePayment = React.useCallback(() => {
    setState((current) => {
      const nextPayment = current.paymentHistory.find((payment) => payment.status === 'Upcoming');
      if (!nextPayment) {
        return {
          ...current,
          lastAction: 'Account already shows all scheduled payments completed.',
        };
      }

      const paymentHistory = current.paymentHistory.map((payment) =>
        payment.id === nextPayment.id ? { ...payment, status: 'Completed' as const } : payment,
      );
      const billingComplete = paymentHistory.every((payment) => payment.status === 'Completed');

      return {
        ...current,
        paymentHistory,
        onboardingSteps: current.onboardingSteps.map((step) =>
          step.id === 'billing' ? { ...step, complete: billingComplete } : step,
        ),
        lastAction: `Payment recorded for ${nextPayment.date}.`,
      };
    });
  }, []);

  const checkIn = React.useCallback((type: 'Theory' | 'Clinical') => {
    setState((current) => ({
      ...current,
      attendanceRecords: [
        {
          id: `${type}-${Date.now()}`,
          date: formatIsoDay(),
          type,
          status: 'Present',
          note: `${type} session check-in captured.`,
        },
        ...current.attendanceRecords.filter(
          (record) => !(record.date === formatIsoDay() && record.type === type),
        ),
      ],
      lastAction: `${type} attendance check-in recorded for today.`,
    }));
  }, []);

  const reportAbsence = React.useCallback((kind: 'today' | 'future') => {
    setState((current) => ({
      ...current,
      attendanceRecords: [
        {
          id: `absence-${Date.now()}`,
          date: formatIsoDay(kind === 'future' ? 1 : 0),
          type: 'Theory',
          status: kind === 'today' ? 'Unplanned Absence' : 'Planned Absence',
          note: kind === 'today' ? 'Illness reported to support staff.' : 'Planned absence submitted for approval.',
        },
        ...current.attendanceRecords,
      ],
      lastAction:
        kind === 'today'
          ? 'An unplanned absence was submitted for today.'
          : 'A planned absence was submitted for the next session.',
    }));
  }, []);

  const submitReflection = React.useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) {
      return;
    }

    setState((current) => ({
      ...current,
      reflectionResponse: clean,
      lastAction: 'Daily reflection submitted to the student activity feed.',
    }));
  }, []);

  const submitQuestionAnswer = React.useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) {
      return;
    }

    setState((current) => ({
      ...current,
      questionOfDayAnswer: clean,
      lastAction: 'Question-of-the-day response recorded.',
    }));
  }, []);

  const generateLiveScan = React.useCallback(() => {
    setState((current) => ({
      ...current,
      liveScanGenerated: true,
      lastAction: 'Live Scan form generated for the student forms walkthrough.',
    }));
  }, []);

  const toggleLiveScanUpload = React.useCallback(() => {
    setState((current) => ({
      ...current,
      liveScanUploaded: !current.liveScanUploaded,
      lastAction: current.liveScanUploaded
        ? 'Live Scan upload removed from demo state.'
        : 'Live Scan receipt uploaded to the static student record.',
    }));
  }, []);

  const updateCdphField = React.useCallback(
    <TKey extends keyof CdphForm>(key: TKey, value: CdphForm[TKey]) => {
      setState((current) => ({
        ...current,
        cdphForm: {
          ...current.cdphForm,
          [key]: value,
        },
        lastAction: 'CDPH application field updated.',
      }));
    },
    [],
  );

  const signCdphForm = React.useCallback(() => {
    setState((current) => ({
      ...current,
      cdphSigned: true,
      lastAction: 'CDPH 283B application signed and staged for review.',
    }));
  }, []);

  const logClinicalHours = React.useCallback(() => {
    setState((current) => ({
      ...current,
      clinicalLogs: [
        {
          id: `log-${Date.now()}`,
          date: formatDateStamp(),
          module: 'Vitals Simulation',
          hours: 4,
          instructor: 'James Miller',
          status: 'Pending',
        },
        ...current.clinicalLogs,
      ],
      tasks: current.tasks.map((task) =>
        task.id === 'clinical-log' ? { ...task, complete: true } : task,
      ),
      lastAction: 'Clinical practice session logged and sent for verification.',
    }));
  }, []);

  const submitAssignment = React.useCallback((assignmentId: string) => {
    setState((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, status: 'Submitted' } : assignment,
      ),
      lastAction: 'Assignment submitted to the module workflow.',
    }));
  }, []);

  const submitSupportTicket = React.useCallback(
    (ticket: { subject: string; category: string; message: string }) => {
      const cleanMessage = ticket.message.trim();
      const cleanSubject = ticket.subject.trim();
      if (!cleanMessage || !cleanSubject) {
        return;
      }

      setState((current) => ({
        ...current,
        supportTickets: [
          {
            id: `ticket-${Date.now()}`,
            subject: cleanSubject,
            category: ticket.category,
            message: cleanMessage,
            status: 'Open',
            createdAt: formatTime(),
          },
          ...current.supportTickets,
        ],
        lastAction: 'Support request created and added to the demo queue.',
      }));
    },
    [],
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
  const theoryHoursRequired = state.modules.reduce(
    (total, module) => total + module.requiredHours,
    0,
  );
  const clinicalHoursCompleted = state.clinicalLogs.reduce((total, log) => total + log.hours, 0);
  const overallProgressPercent = Math.round(
    ((theoryHoursCompleted + clinicalHoursCompleted) /
      (theoryHoursRequired + CLINICAL_HOURS_REQUIRED)) *
      100,
  );
  const unreadCount = state.threads.filter((thread) => thread.unread).length;
  const urgentTaskCount = state.tasks.filter((task) => task.urgent && !task.complete).length;
  const portalUnlocked = state.workflowStage === 'active';
  const readinessCount =
    Object.values(state.acknowledgements).filter(Boolean).length +
    Object.values(state.readinessUploads).filter(Boolean).length;
  const answeredQuestions = state.onboardingQuestions.filter((question) => question.answer.trim()).length;
  const onboardingProgressPercent = Math.round(
    ((completedOnboardingCount + readinessCount + answeredQuestions) /
      (state.onboardingSteps.length + 6 + state.onboardingQuestions.length)) *
      100,
  );
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
  const todayTheoryCheckedIn = state.attendanceRecords.some(
    (record) =>
      record.date === formatIsoDay() &&
      record.type === 'Theory' &&
      record.status === 'Present',
  );
  const todayClinicalCheckedIn = state.attendanceRecords.some(
    (record) =>
      record.date === formatIsoDay() &&
      record.type === 'Clinical' &&
      record.status === 'Present',
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
      state,
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
      overallProgressPercent,
      examUnlocked,
      moduleCertificatesReady,
      programCertificateReady,
      paymentBalance,
      todayTheoryCheckedIn,
      todayClinicalCheckedIn,
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
