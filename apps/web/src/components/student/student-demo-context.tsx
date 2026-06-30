'use client';

import * as React from 'react';

type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  actionLabel: string;
};

type TaskItem = {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
  urgent?: boolean;
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

type StudentDemoState = {
  onboardingSteps: OnboardingStep[];
  tasks: TaskItem[];
  modules: ModuleItem[];
  activeThreadId: string;
  threads: DemoThread[];
  uploads: UploadItem[];
  supportTickets: SupportTicket[];
  settings: StudentSettings;
  learningMinutes: number;
  learningSessionActive: boolean;
  lastAction: string;
};

type StudentDemoContextValue = StudentDemoState & {
  unreadCount: number;
  urgentTaskCount: number;
  completedOnboardingCount: number;
  onboardingProgressPercent: number;
  currentModule: ModuleItem;
  clinicalHoursCompleted: number;
  clinicalHoursRequired: number;
  theoryHoursCompleted: number;
  theoryHoursRequired: number;
  overallProgressPercent: number;
  examUnlocked: boolean;
  activeThread: DemoThread;
  toggleTask: (taskId: string) => void;
  completeOnboardingStep: (stepId: string) => void;
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
  submitSupportTicket: (ticket: { subject: string; category: string; message: string }) => void;
};

const STORAGE_KEY = 'class-verse-student-demo';

const initialState: StudentDemoState = {
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
      description: 'Submit your ID, education proof, and background screening package.',
      complete: true,
      actionLabel: 'Open documents',
    },
    {
      id: 'orientation',
      title: 'Finish orientation checklist',
      description: 'Acknowledge program handbook, attendance policy, and lab expectations.',
      complete: false,
      actionLabel: 'Finish now',
    },
    {
      id: 'billing',
      title: 'Set payment preference',
      description: 'Verify the card on file and confirm your installment schedule.',
      complete: false,
      actionLabel: 'Review billing',
    },
  ],
  tasks: [
    {
      id: 'theory-hours',
      title: 'Complete 2 theory hours',
      detail: 'Required for Module 4 completion',
      complete: false,
      urgent: true,
    },
    {
      id: 'exam-prep',
      title: 'Review Module 4 exam prep',
      detail: 'Access via the learning center',
      complete: false,
      urgent: true,
    },
    {
      id: 'clinical-log',
      title: 'Submit Clinical Log #03',
      detail: 'Approved by Instructor Wong',
      complete: true,
    },
  ],
  modules: [
    {
      id: 'm1',
      title: 'Foundation of Patient Care',
      summary: 'Core Methodology & Ethics',
      status: 'Complete',
      progressPercent: 100,
      requiredHours: 20,
      completedHours: 22,
      examScore: '98/100',
    },
    {
      id: 'm2',
      title: 'Anatomy & Physiology',
      summary: 'Systemic Review',
      status: 'Complete',
      progressPercent: 100,
      requiredHours: 15,
      completedHours: 16,
      examScore: '94/100',
    },
    {
      id: 'm3',
      title: 'Clinical Pharmacology',
      summary: 'Drug Administration & Safety',
      status: 'In Progress',
      progressPercent: 85,
      requiredHours: 30,
      completedHours: 26,
    },
    {
      id: 'm4',
      title: 'Advanced Diagnostics',
      summary: 'Radiology & Lab Reports',
      status: 'Locked',
      progressPercent: 25,
      requiredHours: 20,
      completedHours: 0,
    },
  ],
  activeThreadId: 'lisa-wong',
  threads: [
    {
      id: 'lisa-wong',
      name: 'Lisa Wong',
      role: 'Senior Instructor',
      status: 'Unread',
      preview: "Great job on your infection control assessment. I've left detailed feedback...",
      time: '10:45 AM',
      unread: true,
      messages: [
        {
          id: 'lw-1',
          sender: 'staff',
          text: "Great job on your infection control assessment. I've left some detailed feedback and a few points to review before the next clinical lab.",
          time: '10:45 AM',
        },
        {
          id: 'lw-2',
          sender: 'student',
          text: "Thank you. I reviewed the notes and I'm focusing on the documentation section tonight.",
          time: '11:02 AM',
        },
      ],
    },
    {
      id: 'james-miller',
      name: 'James Miller',
      role: 'Clinical Supervisor',
      status: 'New',
      preview: "Don't forget to bring your updated clinical manual for our session on Feb 6th...",
      time: 'Yesterday',
      unread: true,
      messages: [
        {
          id: 'jm-1',
          sender: 'staff',
          text: "Don't forget to bring your updated clinical manual for our Thursday lab. We'll review patient transfer technique first.",
          time: 'Yesterday',
        },
      ],
    },
    {
      id: 'ops-team',
      name: 'Admissions Team',
      role: 'Program Operations',
      status: 'Read',
      preview: 'Your student records package has been verified and attached to your profile.',
      time: 'Mon',
      unread: false,
      messages: [
        {
          id: 'ops-1',
          sender: 'system',
          text: 'Your student records package has been verified and attached to your profile.',
          time: 'Mon',
        },
      ],
    },
  ],
  uploads: [
    {
      id: 'photo-id',
      title: 'Photo ID',
      subtitle: "State Issued Driver's License",
      date: 'MAR 12, 2024',
      status: 'Verified',
    },
    {
      id: 'diploma',
      title: 'High School Diploma',
      subtitle: 'Education Eligibility Proof',
      date: 'FEB 28, 2024',
      status: 'Verified',
    },
    {
      id: 'ssn-card',
      title: 'Social Security Card',
      subtitle: 'Tax Identification Record',
      date: 'FEB 25, 2024',
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
  lastAction: 'Student portal ready for demo walkthrough.',
};

const StudentDemoContext = React.createContext<StudentDemoContextValue | null>(null);

function formatNow() {
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

  const toggleTask = React.useCallback((taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, complete: !task.complete } : task,
      ),
      lastAction: 'Task list updated for the student dashboard.',
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

  const selectThread = React.useCallback((threadId: string) => {
    setState((current) => ({
      ...current,
      activeThreadId: threadId,
      threads: current.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, unread: false, status: 'Read' }
          : thread,
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
              time: formatNow(),
              status: 'Read',
              messages: [
                ...thread.messages,
                {
                  id: `${threadId}-${Date.now()}`,
                  sender: 'student',
                  text: trimmed,
                  time: formatNow(),
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
          title: 'Immunization Record',
          subtitle: 'Student uploaded a refreshed compliance packet',
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
          ? {
              ...upload,
              date: formatDateStamp(),
              status: 'Pending Review',
            }
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
      const shouldUnlock = learningMinutes >= 480;

      return {
        ...current,
        learningMinutes,
        modules: current.modules.map((module) =>
          module.status === 'In Progress'
            ? {
                ...module,
                progressPercent: shouldUnlock ? 100 : Math.min(module.progressPercent + 6, 99),
                completedHours: shouldUnlock ? 30 : Math.min(module.completedHours + 1, 29),
              }
            : module.id === 'm4' && shouldUnlock
              ? { ...module, status: 'In Progress', progressPercent: 30, completedHours: 6 }
              : module,
        ),
        tasks: current.tasks.map((task) =>
          task.id === 'theory-hours' && shouldUnlock ? { ...task, complete: true } : task,
        ),
        lastAction: shouldUnlock
          ? 'Module assessment unlocked for demo walkthrough.'
          : 'Learning time increased and progress metrics refreshed.',
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
            createdAt: formatNow(),
          },
          ...current.supportTickets,
        ],
        lastAction: 'Support request created and added to the demo queue.',
      }));
    },
    [],
  );

  const currentModule =
    state.modules.find((module) => module.status === 'In Progress') ?? state.modules[0];
  const completedOnboardingCount = state.onboardingSteps.filter((step) => step.complete).length;
  const onboardingProgressPercent = Math.round(
    (completedOnboardingCount / state.onboardingSteps.length) * 100,
  );
  const theoryHoursCompleted = state.modules.reduce(
    (total, module) => total + module.completedHours,
    0,
  );
  const theoryHoursRequired = state.modules.reduce(
    (total, module) => total + module.requiredHours,
    0,
  );
  const clinicalHoursCompleted = 38;
  const clinicalHoursRequired = 40;
  const overallProgressPercent = Math.round(
    ((theoryHoursCompleted + clinicalHoursCompleted) /
      (theoryHoursRequired + clinicalHoursRequired)) *
      100,
  );
  const unreadCount = state.threads.filter((thread) => thread.unread).length;
  const urgentTaskCount = state.tasks.filter((task) => task.urgent && !task.complete).length;
  const examUnlocked = state.learningMinutes >= 480;
  const activeThread =
    state.threads.find((thread) => thread.id === state.activeThreadId) ?? state.threads[0];

  const value = React.useMemo<StudentDemoContextValue>(
    () => ({
      ...state,
      unreadCount,
      urgentTaskCount,
      completedOnboardingCount,
      onboardingProgressPercent,
      currentModule,
      clinicalHoursCompleted,
      clinicalHoursRequired,
      theoryHoursCompleted,
      theoryHoursRequired,
      overallProgressPercent,
      examUnlocked,
      activeThread,
      toggleTask,
      completeOnboardingStep,
      selectThread,
      sendMessage,
      uploadDocument,
      replaceDocument,
      updateSetting,
      advanceLearning,
      toggleLearningSession,
      submitSupportTicket,
    }),
    [
      state,
      unreadCount,
      urgentTaskCount,
      completedOnboardingCount,
      onboardingProgressPercent,
      currentModule,
      clinicalHoursCompleted,
      clinicalHoursRequired,
      theoryHoursCompleted,
      theoryHoursRequired,
      overallProgressPercent,
      examUnlocked,
      activeThread,
      toggleTask,
      completeOnboardingStep,
      selectThread,
      sendMessage,
      uploadDocument,
      replaceDocument,
      updateSetting,
      advanceLearning,
      toggleLearningSession,
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
