'use client';

import * as React from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBolt,
  IconBook2,
  IconBrain,
  IconCheck,
  IconCircleCheckFilled,
  IconFile,
  IconLock,
  IconMenu2,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconSend2,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { StudentIntakeModal } from '@/components/student/student-intake-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const suggestionQuestions = [
  'How do I take an accurate pulse?',
  'What are normal BP ranges for elderly?',
  'Explain respiratory rhythm vs depth.',
];

function formatSessionTime(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

function parseDurationToMinutes(duration?: string) {
  if (!duration) {
    return null;
  }

  const normalized = duration.trim().toLowerCase();
  const match = normalized.match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  if (
    normalized.includes('hour') ||
    normalized.includes(' hr') ||
    normalized.endsWith('hr') ||
    normalized.endsWith('hrs') ||
    normalized.includes('hrs')
  ) {
    return Math.round(value * 60);
  }

  if (normalized.includes('min') || /^\d+(?:\.\d+)?$/.test(normalized)) {
    return Math.round(value);
  }

  return null;
}

function toEmbedUrl(url?: string) {
  if (!url) {
    return '';
  }

  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  return url;
}

export default function StudentLearningPage() {
  const {
    learningSessionActive,
    sessionMinutes,
    requiredSessionMinutes,
    lessonElapsedMinutes,
    activeExamSession,
    examUnlocked,
    portalHydrated,
    portalUnlocked,
    workflowStage,
    currentModule,
    modules,
    advanceLearning,
    setLearningSession,
    recordLessonSessionStart,
    startModuleExamSession,
    reportExamSecurityEvent,
    selectModule,
    markStepComplete,
    sendMessage,
    activeThread,
    submitModuleExam,
    refreshLearning,
  } = useStudentDemo();
  const [tab, setTab] = React.useState<'ai' | 'instructor'>('ai');
  const [message, setMessage] = React.useState('');
  const [workflowOpen, setWorkflowOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedLessonId, setSelectedLessonId] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState<'module' | 'lesson'>('module');
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [examResult, setExamResult] = React.useState<ModuleExamResult | null>(null);
  const [examError, setExamError] = React.useState<string | null>(null);
  const [examSubmitting, setExamSubmitting] = React.useState(false);
  const [examSecurityNotice, setExamSecurityNotice] = React.useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
  const examEventCooldownRef = React.useRef<Record<string, number>>({});
  const sessionRemainingMinutes = Math.max(requiredSessionMinutes - sessionMinutes, 0);
  const sessionPercent =
    requiredSessionMinutes > 0
      ? Math.min(100, Math.round((sessionMinutes / requiredSessionMinutes) * 100))
      : 100;

  const lessons = currentModule.steps;
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const currentLessonIndex = selectedLesson
    ? lessons.findIndex((lesson) => lesson.id === selectedLesson.id)
    : -1;
  const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : undefined;
  const nextModuleId =
    modules[modules.findIndex((module) => module.id === currentModule.id) + 1]?.id;
  const quizStep = lessons.find((lesson) => lesson.type === 'Quiz');
  const lessonSections = lessons.reduce<
    Array<{ id: string; title: string; description?: string; lessons: typeof lessons }>
  >((sections, lesson) => {
    const id = lesson.sectionId || 'module-content';
    const existing = sections.find((section) => section.id === id);

    if (existing) {
      existing.lessons.push(lesson);
      return sections;
    }

    return [
      ...sections,
      {
        id,
        title: lesson.sectionTitle || 'Module Content',
        description: lesson.sectionDescription,
        lessons: [lesson],
      },
    ];
  }, []);
  const quizQuestionSet = selectedLesson?.type === 'Quiz' ? (selectedLesson.questions ?? []) : [];
  const quizPassingPercent = selectedLesson?.passingScore ?? 70;
  const unansweredCount = quizQuestionSet.filter(
    (question) => !(quizAnswers[question.id] ?? '').trim()
  ).length;
  const secureExamSession =
    selectedLesson?.type === 'Quiz' &&
    activeExamSession?.moduleId === currentModule.id &&
    activeExamSession?.stepId === selectedLesson.id
      ? activeExamSession
      : null;
  const examModeActive =
    Boolean(secureExamSession) &&
    !completedLessons.has(selectedLesson?.id ?? '') &&
    examResult === null;
  const selectedLessonTargetMinutes = parseDurationToMinutes(selectedLesson?.duration);
  const selectedLessonElapsedMinutes = selectedLesson
    ? Math.max(0, lessonElapsedMinutes[selectedLesson.id] ?? 0)
    : 0;
  const selectedLessonRemainingMinutes =
    selectedLessonTargetMinutes === null
      ? 0
      : Math.max(0, selectedLessonTargetMinutes - selectedLessonElapsedMinutes);
  const selectedLessonPercent =
    selectedLessonTargetMinutes && selectedLessonTargetMinutes > 0
      ? Math.min(100, Math.round((selectedLessonElapsedMinutes / selectedLessonTargetMinutes) * 100))
      : null;
  const showingLessonTimer =
    viewMode === 'lesson' && selectedLesson?.type !== 'Quiz' && selectedLessonTargetMinutes !== null;
  const displaySessionMinutes = showingLessonTimer ? selectedLessonElapsedMinutes : sessionMinutes;
  const displayRequiredSessionMinutes = showingLessonTimer
    ? selectedLessonTargetMinutes ?? requiredSessionMinutes
    : requiredSessionMinutes;
  const displaySessionPercent = showingLessonTimer ? selectedLessonPercent ?? 0 : sessionPercent;
  const canMarkCurrentLessonComplete =
    !selectedLesson ||
    completedLessons.has(selectedLesson.id) ||
    (selectedLessonTargetMinutes !== null
      ? selectedLessonElapsedMinutes >= selectedLessonTargetMinutes
      : learningSessionActive);

  React.useEffect(() => {
    void refreshLearning();
  }, [refreshLearning]);

  const reportExamEvent = React.useCallback(
    (
      type:
        | 'visibility_hidden'
        | 'window_blur'
        | 'fullscreen_exit'
        | 'navigation_blocked'
        | 'shortcut_blocked'
        | 'context_menu'
        | 'copy_attempt'
        | 'paste_attempt'
        | 'back_button_blocked',
      detail?: string
    ) => {
      if (!activeExamSession) {
        return;
      }

      const now = Date.now();
      const key = `${type}:${detail ?? ''}`;
      const lastReportedAt = examEventCooldownRef.current[key] ?? 0;

      if (now - lastReportedAt < 1200) {
        return;
      }

      examEventCooldownRef.current[key] = now;
      reportExamSecurityEvent(activeExamSession.moduleId, { type, detail });
    },
    [activeExamSession, reportExamSecurityEvent]
  );

  const blockExamNavigation = React.useCallback(
    (detail: string) => {
      if (!examModeActive) {
        return false;
      }

      reportExamEvent('navigation_blocked', detail);
      setExamSecurityNotice('Secure exam mode is active. Submit the assessment before leaving this screen.');
      return true;
    },
    [examModeActive, reportExamEvent]
  );

  React.useEffect(() => {
    return () => setLearningSession(false);
  }, [setLearningSession]);

  // Session time is recorded server-side one real minute at a time — only while
  // the session is running, the tab is visible, and the target is not yet met.
  React.useEffect(() => {
    if (!portalUnlocked || !learningSessionActive || examUnlocked) {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        advanceLearning(1);
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [advanceLearning, examUnlocked, learningSessionActive, portalUnlocked]);

  React.useEffect(() => {
    if (portalHydrated && !portalUnlocked) {
      setWorkflowOpen(true);
    }
  }, [portalHydrated, portalUnlocked]);

  React.useEffect(() => {
    setViewMode('module');
  }, [currentModule.id]);

  React.useEffect(() => {
    setSelectedLessonId((current) => {
      if (current && lessons.some((lesson) => lesson.id === current)) {
        return current;
      }

      return lessons[0]?.id ?? '';
    });
  }, [lessons]);

  React.useEffect(() => {
    setCompletedLessons(
      new Set(
        modules.flatMap((module) =>
          module.steps.filter((step) => step.complete).map((step) => step.id)
        )
      )
    );
  }, [modules]);

  React.useEffect(() => {
    setQuizAnswers({});
    setExamError(null);
    setExamSecurityNotice(null);
  }, [selectedLessonId]);

  React.useEffect(() => {
    if (!activeExamSession) {
      return;
    }

    setSelectedLessonId(activeExamSession.stepId);
    setViewMode('lesson');
    setSidebarOpen(false);
  }, [activeExamSession]);

  React.useEffect(() => {
    if (!examModeActive) {
      return;
    }

    window.history.pushState(null, '', window.location.href);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportExamEvent('visibility_hidden');
        setExamSecurityNotice('Exam attention warning recorded because the exam tab lost visibility.');
      }
    };

    const handleWindowBlur = () => {
      reportExamEvent('window_blur');
      setExamSecurityNotice('Exam attention warning recorded because focus left the exam window.');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportExamEvent('fullscreen_exit');
        setExamSecurityNotice('Exam attention warning recorded because fullscreen was exited.');
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      reportExamEvent('back_button_blocked');
      setExamSecurityNotice('Back navigation is blocked during secure exam mode.');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const blockedShortcut =
        event.key === 'F5' ||
        ((event.ctrlKey || event.metaKey) &&
          ['a', 'c', 'p', 's', 'v', 'x'].includes(event.key.toLowerCase()));

      if (!blockedShortcut) {
        return;
      }

      event.preventDefault();
      reportExamEvent('shortcut_blocked', event.key);
      setExamSecurityNotice(`Shortcut ${event.key.toUpperCase()} is blocked during secure exam mode.`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [examModeActive, reportExamEvent]);

  const isLessonComplete = (lessonId: string) =>
    completedLessons.has(lessonId) ||
    lessons.find((lesson) => lesson.id === lessonId)?.complete === true;

  const startLessonSession = React.useCallback(
    (lessonId: string) => {
      recordLessonSessionStart(lessonId);

      if (!learningSessionActive) {
        setLearningSession(true);
      }
    },
    [learningSessionActive, recordLessonSessionStart, setLearningSession]
  );

  const openLesson = (lessonId: string, options?: { startSession?: boolean }) => {
    if (options?.startSession) {
      startLessonSession(lessonId);
    }

    setSelectedLessonId(lessonId);
    setViewMode('lesson');
  };

  const openSection = (sectionId: string) => {
    const section = lessonSections.find((item) => item.id === sectionId);
    if (!section) {
      return;
    }

    const target =
      section.lessons.find((lesson) => !isLessonComplete(lesson.id)) ?? section.lessons[0];
    if (target) {
      openLesson(target.id, { startSession: true });
    }
  };

  const handleSubmitExam = async (answers?: Record<string, string>) => {
    if (!selectedLesson) {
      return;
    }

    setExamSubmitting(true);
    setExamError(null);
    const outcome = await submitModuleExam({ stepId: selectedLesson.id, answers });
    setExamSubmitting(false);

    if (outcome.ok) {
      setExamResult(outcome.result);
    } else {
      setExamError(outcome.error);
    }
  };

  const handleCompleteModuleWithoutExam = async () => {
    setExamSubmitting(true);
    setExamError(null);
    const outcome = await submitModuleExam();
    setExamSubmitting(false);

    if (outcome.ok) {
      setExamResult(outcome.result);
    } else {
      setExamError(outcome.error);
    }
  };

  const handleStartSecureExam = async () => {
    if (!selectedLesson) {
      return;
    }

    setExamSubmitting(true);
    setExamError(null);
    const session = await startModuleExamSession(currentModule.id, selectedLesson.id);
    setExamSubmitting(false);

    if (!session) {
      setExamError('Secure exam mode could not be started. Please try again.');
      return;
    }

    if (document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().catch(() => {
        reportExamEvent('fullscreen_exit', 'fullscreen_request_denied');
      });
    }

    setExamSecurityNotice(
      'Secure exam mode is active. Fullscreen, attention, and navigation attempts are being tracked.'
    );
  };

  return (
    <main className="h-screen overflow-hidden bg-background text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (blockExamNavigation('dashboard_exit')) {
                return;
              }

              window.location.href = '/student/dashboard';
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high disabled:opacity-50"
            title="Back to Dashboard"
            disabled={examModeActive}
          >
            <IconArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
          <div className="mx-2 h-8 w-px bg-border-subtle" />
          <div>
            <span className="block font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              {viewMode === 'lesson' ? 'Current Lesson' : 'Module Overview'}
            </span>
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-primary">
              {viewMode === 'lesson' ? selectedLesson?.title : `${currentModule.title}`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Session timer — the target comes from the module's configured hours */}
          <div className="flex items-center gap-3 rounded-[14px] border border-primary/20 bg-primary/10 px-4 py-2">
            <span
              className={cn(
                'h-2.5 w-2.5 shrink-0 rounded-full',
                examUnlocked
                  ? 'bg-success'
                  : learningSessionActive
                    ? 'animate-pulse bg-success'
                    : 'bg-on-surface-variant/40'
              )}
            />
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {showingLessonTimer
                  ? learningSessionActive
                    ? 'Lesson running'
                    : 'Lesson paused'
                  : examUnlocked
                    ? 'Session complete'
                    : learningSessionActive
                      ? 'Session running'
                      : 'Session paused'}
              </span>
              <span className="font-mono text-[18px] font-bold leading-tight text-primary">
                {formatSessionTime(displaySessionMinutes)}
                <span className="ml-1 font-sans text-xs font-medium text-on-surface-variant">
                  / {formatSessionTime(displayRequiredSessionMinutes)}
                </span>
              </span>
              {showingLessonTimer ? (
                <span className="mt-0.5 block text-[11px] text-on-surface-variant">
                  Module total {formatSessionTime(sessionMinutes)} / {formatSessionTime(requiredSessionMinutes)}
                </span>
              ) : null}
            </div>
            <div className="hidden w-28 flex-col gap-1 md:flex">
              <div className="h-2 overflow-hidden rounded-full bg-surface-high">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${displaySessionPercent}%` }}
                />
              </div>
              <span className="text-right font-mono text-[10px] text-on-surface-variant">
                {displaySessionPercent}%
              </span>
            </div>
            {!examUnlocked && (
              <button
                onClick={() => {
                  if (!learningSessionActive && selectedLesson) {
                    startLessonSession(selectedLesson.id);
                    return;
                  }

                  setLearningSession(!learningSessionActive);
                }}
                disabled={!portalUnlocked || examModeActive}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50"
                title={learningSessionActive ? 'Pause session' : 'Resume session'}
              >
                {learningSessionActive ? (
                  <IconPlayerPauseFilled className="size-4" />
                ) : (
                  <IconPlayerPlayFilled className="size-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 border-l border-border-subtle pl-4">
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
        {/* Sidebar with lessons */}
        <aside
          className={cn(
            'border-r border-border-subtle bg-surface-low transition-all duration-300 overflow-y-auto',
            sidebarOpen ? 'w-[280px]' : 'w-0'
          )}
        >
          {sidebarOpen && (
            <div className="p-4 space-y-6">
              <div>
                <button
                  onClick={() => setViewMode('module')}
                  className={cn(
                    'mb-4 flex w-full items-center gap-2 rounded-[14px] border p-3 text-left transition',
                    viewMode === 'module'
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border-subtle bg-surface hover:border-primary/20'
                  )}
                >
                  <IconBook2 className="size-4 shrink-0 text-primary" />
                  <span className="font-display text-[15px] font-semibold text-on-surface">
                    {currentModule.title}
                  </span>
                </button>
                <div className="space-y-2">
                  {lessonSections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <p className="px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                        {section.title}
                      </p>
                      {section.lessons.map((lesson, index) => {
                        const isSelected = viewMode === 'lesson' && lesson.id === selectedLessonId;
                        const isComplete = isLessonComplete(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (blockExamNavigation(`lesson:${lesson.id}`)) {
                                return;
                              }

                              openLesson(lesson.id);
                            }}
                            disabled={examModeActive}
                            className={cn(
                              'w-full text-left rounded-[14px] border p-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-60',
                              isSelected
                                ? 'border-primary/30 bg-primary/10'
                                : 'border-border-subtle bg-surface hover:border-primary/20'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {isComplete ? <IconCheck className="size-4" /> : index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-semibold text-on-surface">
                                  {lesson.title}
                                </p>
                                <p className="mt-0.5 text-[11px] text-on-surface-variant">
                                  {lesson.type} • {lesson.duration}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Navigation */}
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <p className="px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                  All Modules
                </p>
                {modules.map((mod, index) => {
                  const locked = mod.status === 'Locked';
                  return (
                    <button
                      key={mod.id}
                      disabled={locked || examModeActive}
                      onClick={() => {
                        if (blockExamNavigation(`module:${mod.id}`)) {
                          return;
                        }

                        selectModule(mod.id);
                        setViewMode('module');
                        setSelectedLessonId(mod.steps[0]?.id ?? '');
                      }}
                      className={cn(
                        'w-full text-left rounded-[14px] border p-3 text-sm transition',
                        locked
                          ? 'border-border-subtle bg-surface-container opacity-60 cursor-not-allowed'
                          : currentModule.id === mod.id
                            ? 'border-primary/30 bg-primary/10'
                            : 'border-border-subtle bg-surface hover:border-primary/20'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-on-surface text-[12px]">
                          {index + 1}. {mod.title}
                        </p>
                        {locked ? (
                          <IconLock className="size-4 shrink-0 text-on-surface-variant" />
                        ) : mod.status === 'Complete' ? (
                          <IconCircleCheckFilled className="size-4 shrink-0 text-success" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {locked
                          ? 'Unlocks after the previous module'
                          : `${mod.completedHours}/${mod.requiredHours} hours • ${mod.progressPercent}%`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <section className="flex-1 h-[calc(100vh-72px)] overflow-y-auto bg-surface">
          {!portalUnlocked ? (
            <div className="p-8">
              <div className="rounded-[18px] border border-warning/20 bg-warning/5 p-4">
                <p className="text-sm text-on-surface">
                  Learning is staged behind the student journey and is currently paused at{' '}
                  <strong>{workflowStage.replaceAll('_', ' ')}</strong>.
                </p>
                <Button className="mt-3" onClick={() => setWorkflowOpen(true)}>
                  Continue Intake Flow
                </Button>
              </div>
            </div>
          ) : examResult ? (
            <div className="p-8">
              <div className="mx-auto max-w-2xl rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                <div
                  className={cn(
                    'rounded-[16px] p-8 text-center',
                    examResult.passed
                      ? 'bg-success/10 border border-success/30'
                      : 'bg-warning/10 border border-warning/30'
                  )}
                >
                  {examResult.graded ? (
                    <>
                      <h4
                        className={cn(
                          'font-display text-[42px] font-bold',
                          examResult.passed ? 'text-success' : 'text-warning'
                        )}
                      >
                        {examResult.scorePercent}%
                      </h4>
                      <p
                        className={cn(
                          'text-sm font-semibold mt-2',
                          examResult.passed ? 'text-success' : 'text-warning'
                        )}
                      >
                        {examResult.passed ? '✓ PASSED — Great job!' : '✗ Not passed yet'}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-3">
                        {examResult.correctCount}/{examResult.totalQuestions} questions correct •{' '}
                        {examResult.earnedPoints}/{examResult.totalPoints} points • passing score{' '}
                        {examResult.passingScore}%
                      </p>
                      <p className="text-sm text-on-surface-variant mt-2">
                        {examResult.passed
                          ? nextModuleId
                            ? 'The next module is now unlocked. Keep going!'
                            : 'You have completed the final module of this program.'
                          : 'Review the module materials and retake the assessment when you are ready.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-display text-[32px] font-bold text-success">
                        Module Complete
                      </h4>
                      <p className="text-sm text-on-surface-variant mt-3">
                        This module&apos;s checkpoint was recorded.{' '}
                        {nextModuleId
                          ? 'The next module is now unlocked.'
                          : 'You have finished the program modules.'}
                      </p>
                    </>
                  )}
                </div>

                <Button
                  className="mt-6 h-11 w-full rounded-[14px]"
                  onClick={() => {
                    setExamResult(null);
                    setQuizAnswers({});
                    setViewMode('module');
                  }}
                >
                  {examResult.passed ? 'Continue' : 'Review & Retake'}
                  <IconArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : viewMode === 'module' ? (
            <div className="p-8 space-y-6">
              {/* Module Header */}
              <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-primary">
                      Module{' '}
                      {String(
                        modules.findIndex((module) => module.id === currentModule.id) + 1
                      ).padStart(2, '0')}
                    </p>
                    <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.02em] text-on-surface">
                      {currentModule.title}
                    </h2>
                    <p className="mt-2 text-base leading-7 text-on-surface-variant">
                      {currentModule.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Badge
                        variant={
                          currentModule.status === 'Complete'
                            ? 'success'
                            : currentModule.status === 'In Progress'
                              ? 'info'
                              : 'neutral'
                        }
                      >
                        {currentModule.status}
                      </Badge>
                      <span className="text-sm text-on-surface-variant">
                        {lessonSections.length} section{lessonSections.length === 1 ? '' : 's'} •{' '}
                        {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        {currentModule.completedHours}/{currentModule.requiredHours} hours
                      </span>
                      {currentModule.examScore ? (
                        <span className="font-mono text-sm text-success">
                          Exam {currentModule.examScore}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="min-w-[220px] rounded-[16px] border border-primary/15 bg-primary/5 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                      Module Progress
                    </p>
                    <p className="mt-2 font-display text-[36px] font-bold text-primary">
                      {currentModule.progressPercent}%
                    </p>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${currentModule.progressPercent}%` }}
                      />
                    </div>
                    <Button
                      className="mt-4 h-10 w-full rounded-[12px]"
                      onClick={() => {
                        if (blockExamNavigation('start-learning')) {
                          return;
                        }

                        const target =
                          lessons.find((lesson) => !isLessonComplete(lesson.id)) ?? lessons[0];
                        if (target) {
                          openLesson(target.id, { startSession: true });
                        }
                      }}
                      disabled={lessons.length === 0 || examModeActive}
                    >
                      <IconPlayerPlayFilled className="size-4 mr-2" />
                      {currentModule.progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">
                  Sections in this module
                </p>
                {lessonSections.length === 0 ? (
                  <div className="rounded-[18px] border border-warning/20 bg-warning/5 p-5 text-sm text-on-surface">
                    No learning content has been configured for this module yet. Check back soon.
                  </div>
                ) : (
                  lessonSections.map((section, sectionIndex) => {
                    const sectionComplete = section.lessons.filter((lesson) =>
                      isLessonComplete(lesson.id)
                    ).length;
                    const allDone = sectionComplete === section.lessons.length;

                    return (
                      <div
                        key={section.id}
                        className="rounded-[20px] border border-border-subtle bg-surface p-6 transition hover:border-primary/30"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <div
                              className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                allDone ? 'bg-success text-white' : 'bg-primary/10 text-primary'
                              )}
                            >
                              {allDone ? <IconCheck className="size-5" /> : sectionIndex + 1}
                            </div>
                            <div>
                              <h3 className="font-display text-[20px] font-semibold text-on-surface">
                                {section.title}
                              </h3>
                              {section.description ? (
                                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                                  {section.description}
                                </p>
                              ) : null}
                              <p className="mt-2 text-sm text-on-surface-variant">
                                {sectionComplete}/{section.lessons.length} lessons complete
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={allDone ? 'secondary' : 'default'}
                            className="rounded-[12px] shrink-0"
                            onClick={() => {
                              if (blockExamNavigation(`section:${section.id}`)) {
                                return;
                              }

                              openSection(section.id);
                            }}
                            disabled={examModeActive}
                          >
                            {allDone
                              ? 'Review Section'
                              : sectionComplete > 0
                                ? 'Continue Section'
                                : 'Start Section'}
                            <IconArrowRight className="size-4 ml-2" />
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          {section.lessons.map((lesson) => {
                            const isComplete = isLessonComplete(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  if (blockExamNavigation(`lesson-card:${lesson.id}`)) {
                                    return;
                                  }

                                  openLesson(lesson.id);
                                }}
                                disabled={examModeActive}
                                className="flex items-center gap-3 rounded-[14px] border border-border-subtle bg-surface-muted p-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                              >
                                <div
                                  className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                    isComplete
                                      ? 'bg-success text-white'
                                      : 'bg-primary/10 text-primary'
                                  )}
                                >
                                  {isComplete ? (
                                    <IconCheck className="size-4" />
                                  ) : (
                                    <IconPlayerPlayFilled className="size-3" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-on-surface">
                                    {lesson.title}
                                  </p>
                                  <p className="text-[11px] text-on-surface-variant">
                                    {lesson.type} • {lesson.duration}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : selectedLesson ? (
            <div className="p-8 space-y-6">
              {/* Video Viewer */}
              {selectedLesson.type === 'Video' && (
                <div className="space-y-4">
                  <div className="rounded-[20px] overflow-hidden shadow-lg">
                    <div className="aspect-video bg-black relative">
                      <iframe
                        width="100%"
                        height="100%"
                        src={toEmbedUrl(selectedLesson.resourceUrl)}
                        title={selectedLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-[14px] bg-surface border border-border-subtle p-4">
                      <p className="text-sm font-semibold text-on-surface">
                        {selectedLesson.title}
                      </p>
                      <p className="text-[12px] text-on-surface-variant mt-1">
                        {selectedLesson.duration} • {selectedLesson.note}
                      </p>
                    </div>
                    <Button
                      className="rounded-[14px] bg-success hover:bg-success/90"
                      disabled={!canMarkCurrentLessonComplete}
                      onClick={() => {
                        setCompletedLessons((current) => new Set([...current, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                      }}
                    >
                      <IconCheck className="size-4 mr-2" />
                      {completedLessons.has(selectedLesson.id) ? 'Done ✓' : 'Complete'}
                    </Button>
                  </div>
                  {!completedLessons.has(selectedLesson.id) &&
                  selectedLessonTargetMinutes !== null &&
                  selectedLessonRemainingMinutes > 0 ? (
                    <p className="text-xs text-on-surface-variant">
                      Complete unlocks after the configured lesson time has run.
                    </p>
                  ) : null}
                </div>
              )}

              {(selectedLesson.type === 'PDF' ||
                selectedLesson.type === 'Reading' ||
                selectedLesson.type === 'Link') && (
                <div className="rounded-[20px] overflow-hidden border border-border-subtle bg-surface-muted space-y-6">
                  <div className="bg-surface rounded-[20px] p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-primary/10 text-primary shrink-0">
                        <IconFile className="size-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-[24px] font-bold text-on-surface">
                          {selectedLesson.title}
                        </h3>
                        <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4 md:col-span-2">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Lesson Summary
                        </p>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          {selectedLesson.content || selectedLesson.note || currentModule.summary}
                        </p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Section
                        </p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {selectedLesson.sectionTitle || 'Module Content'}
                        </p>
                      </div>
                    </div>

                    {selectedLesson.type === 'PDF' && selectedLesson.resourceUrl ? (
                      <iframe
                        title={selectedLesson.title}
                        src={selectedLesson.resourceUrl}
                        className="h-[640px] w-full rounded-[16px] border border-border-subtle bg-surface"
                      />
                    ) : null}

                    {selectedLesson.type === 'PDF' && !selectedLesson.resourceUrl ? (
                      <div className="rounded-[16px] border border-warning/20 bg-warning/5 p-5 text-sm text-on-surface">
                        No PDF file has been linked to this lesson yet.
                      </div>
                    ) : null}

                    {selectedLesson.type === 'Reading' ? (
                      <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-6">
                        <h4 className="font-display text-[20px] font-semibold text-on-surface">
                          Reading Content
                        </h4>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-on-surface-variant">
                          {(
                            selectedLesson.content ||
                            selectedLesson.note ||
                            'No lesson text was configured yet.'
                          )
                            .split('\n')
                            .filter(Boolean)
                            .map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedLesson.type === 'Link' ? (
                      <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-6">
                        <h4 className="font-display text-[20px] font-semibold text-on-surface">
                          External Learning Resource
                        </h4>
                        <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                          {selectedLesson.content ||
                            selectedLesson.note ||
                            'Open the configured link to continue this lesson.'}
                        </p>
                        {selectedLesson.resourceUrl ? (
                          <div className="mt-4 rounded-[12px] border border-border-subtle bg-surface p-4 text-sm text-on-surface">
                            {selectedLesson.resourceUrl}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="px-8 pb-8 flex gap-3">
                    <Button
                      className="flex-1 rounded-[14px] h-11"
                      variant="secondary"
                      disabled={!selectedLesson.resourceUrl}
                      onClick={() => window.open(selectedLesson.resourceUrl || '#', '_blank')}
                    >
                      <IconFile className="size-4 mr-2" />
                      {selectedLesson.type === 'PDF'
                        ? 'Open PDF'
                        : selectedLesson.type === 'Link'
                          ? 'Open Link'
                          : 'Open Resource'}
                    </Button>
                    <Button
                      className="flex-1 rounded-[14px] h-11 bg-success hover:bg-success/90"
                      disabled={!canMarkCurrentLessonComplete}
                      onClick={() => {
                        setCompletedLessons((current) => new Set([...current, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                      }}
                    >
                      <IconCheck className="size-4 mr-2" />
                      {completedLessons.has(selectedLesson.id) ? 'Completed' : 'Mark as Complete'}
                    </Button>
                  </div>
                  {!completedLessons.has(selectedLesson.id) &&
                  selectedLessonTargetMinutes !== null &&
                  selectedLessonRemainingMinutes > 0 ? (
                    <div className="px-8 pb-8 -mt-4 text-xs text-on-surface-variant">
                      Finish the configured lesson time before marking this lesson complete.
                    </div>
                  ) : null}
                </div>
              )}

              {selectedLesson.type === 'Quiz' && (
                <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-info/10 text-info">
                      <IconCircleCheckFilled className="size-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[24px] font-bold text-on-surface">
                        {selectedLesson.title}
                      </h3>
                      <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-border-subtle bg-surface p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4 md:col-span-2">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Assessment Brief
                        </p>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          {selectedLesson.content ||
                            selectedLesson.note ||
                            'Complete the configured module assessment to move forward.'}
                        </p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Passing Score
                        </p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {quizQuestionSet.length > 0
                            ? `${quizPassingPercent}%`
                            : 'Completion checkpoint'}
                        </p>
                        <p className="mt-1 text-[11px] text-on-surface-variant">
                          {quizQuestionSet.length > 0
                            ? `${quizQuestionSet.length} question${quizQuestionSet.length === 1 ? '' : 's'} • ${selectedLesson.duration}`
                            : selectedLesson.duration}
                        </p>
                      </div>
                    </div>

                    {completedLessons.has(selectedLesson.id) ? (
                      <div className="rounded-[16px] border border-success/30 bg-success/10 p-5 text-center">
                        <p className="text-sm font-semibold text-success">✓ Assessment completed</p>
                        {currentModule.examScore ? (
                          <p className="mt-1 text-sm text-on-surface-variant">
                            Score: {currentModule.examScore}
                          </p>
                        ) : null}
                      </div>
                    ) : !examUnlocked ? (
                      <div className="rounded-[16px] border border-warning/30 bg-warning/10 p-6 text-center">
                        <IconLock className="mx-auto size-8 text-warning" />
                        <p className="mt-3 text-sm font-semibold text-on-surface">
                          Assessment locked
                        </p>
                        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                          Keep learning — {formatSessionTime(sessionRemainingMinutes)} of your
                          required {formatSessionTime(requiredSessionMinutes)} session time is left
                          before this assessment unlocks.
                        </p>
                      </div>
                    ) : !secureExamSession ? (
                      <>
                        <div className="rounded-[16px] border border-primary/25 bg-primary/5 p-6">
                          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                            Secure Exam Mode
                          </p>
                          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                            Starting this assessment locks navigation, tracks attention and fullscreen
                            exits, and records blocked shortcuts or copy/paste attempts for review.
                          </p>
                        </div>
                        {examError ? (
                          <div className="rounded-[12px] border border-error/20 bg-error/5 p-4 text-sm text-error">
                            {examError}
                          </div>
                        ) : null}
                        <Button
                          className="h-11 w-full rounded-[14px] bg-success hover:bg-success/90"
                          disabled={examSubmitting}
                          onClick={() => void handleStartSecureExam()}
                        >
                          {examSubmitting ? 'Starting Secure Exam…' : 'Start Secure Exam'}
                        </Button>
                      </>
                    ) : quizQuestionSet.length > 0 ? (
                      <>
                        <div className="rounded-[16px] border border-warning/20 bg-warning/5 p-4 text-sm text-on-surface">
                          <p className="font-semibold">Secure exam mode is active.</p>
                          <p className="mt-1 text-on-surface-variant">
                            Warnings: {secureExamSession.warnings} • Focus exits: {secureExamSession.focusLossCount} •
                            Hidden tab events: {secureExamSession.visibilityLossCount} • Fullscreen exits:{' '}
                            {secureExamSession.fullscreenExitCount}
                          </p>
                          {examSecurityNotice ? (
                            <p className="mt-2 text-warning">{examSecurityNotice}</p>
                          ) : null}
                        </div>
                        <div
                          className="space-y-4"
                          onCopy={(event) => {
                            event.preventDefault();
                            reportExamEvent('copy_attempt');
                            setExamSecurityNotice('Copy is blocked during secure exam mode.');
                          }}
                          onPaste={(event) => {
                            event.preventDefault();
                            reportExamEvent('paste_attempt');
                            setExamSecurityNotice('Paste is blocked during secure exam mode.');
                          }}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            reportExamEvent('context_menu');
                            setExamSecurityNotice('Context menu is blocked during secure exam mode.');
                          }}
                        >
                          {quizQuestionSet.map((question, index) => (
                            <div
                              key={question.id}
                              className="p-4 border border-border-subtle rounded-[12px] hover:bg-surface-low transition"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <p className="font-semibold text-sm text-on-surface">
                                  Question {index + 1}: {question.prompt}
                                </p>
                                <span className="shrink-0 font-mono text-[11px] text-on-surface-variant">
                                  {question.points} pt{question.points === 1 ? '' : 's'}
                                </span>
                              </div>
                              {question.options && question.options.length > 0 ? (
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <label
                                      key={`${question.id}-${optionIndex}`}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={question.id}
                                        value={String(optionIndex)}
                                        checked={quizAnswers[question.id] === String(optionIndex)}
                                        onChange={(event) =>
                                          setQuizAnswers({
                                            ...quizAnswers,
                                            [question.id]: event.target.value,
                                          })
                                        }
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm text-on-surface-variant">
                                        {option}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <Input
                                  value={quizAnswers[question.id] ?? ''}
                                  onChange={(event) =>
                                    setQuizAnswers({
                                      ...quizAnswers,
                                      [question.id]: event.target.value,
                                    })
                                  }
                                  placeholder="Type your answer"
                                  className="h-11"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {examError ? (
                          <div className="rounded-[12px] border border-error/20 bg-error/5 p-4 text-sm text-error">
                            {examError}
                          </div>
                        ) : null}

                        <Button
                          className="h-11 w-full rounded-[14px] bg-success hover:bg-success/90"
                          disabled={examSubmitting || unansweredCount > 0}
                          onClick={() => void handleSubmitExam(quizAnswers)}
                        >
                          {examSubmitting
                            ? 'Submitting…'
                            : unansweredCount > 0
                              ? `Answer ${unansweredCount} more question${unansweredCount === 1 ? '' : 's'}`
                              : 'Submit Assessment'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="rounded-[16px] border border-warning/20 bg-warning/5 p-4 text-sm text-on-surface">
                          <p className="font-semibold">Secure exam mode is active.</p>
                          <p className="mt-1 text-on-surface-variant">
                            Warnings: {secureExamSession.warnings} • Navigation attempts:{' '}
                            {secureExamSession.navigationAttemptCount}
                          </p>
                          {examSecurityNotice ? (
                            <p className="mt-2 text-warning">{examSecurityNotice}</p>
                          ) : null}
                        </div>
                        {examError ? (
                          <div className="rounded-[12px] border border-error/20 bg-error/5 p-4 text-sm text-error">
                            {examError}
                          </div>
                        ) : null}
                        <Button
                          className="h-11 w-full rounded-[14px] bg-success hover:bg-success/90"
                          disabled={examSubmitting}
                          onClick={() => void handleSubmitExam()}
                        >
                          {examSubmitting ? 'Submitting…' : 'Launch Assessment'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedLesson.type === 'Skill Check' && (
                <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-info/10 text-info">
                      <IconUserCircle className="size-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[24px] font-bold text-on-surface">
                        {selectedLesson.title}
                      </h3>
                      <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-border-subtle bg-surface p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4 md:col-span-2">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Submission Guidance
                        </p>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          {selectedLesson.content ||
                            selectedLesson.note ||
                            'Upload the required skill evidence for instructor review.'}
                        </p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Section
                        </p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {selectedLesson.sectionTitle || 'Skill Check'}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-[14px] h-11 bg-success hover:bg-success/90"
                      disabled={completedLessons.has(selectedLesson.id)}
                      onClick={() => {
                        setCompletedLessons((current) => new Set([...current, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                      }}
                    >
                      {completedLessons.has(selectedLesson.id)
                        ? 'Submission Recorded'
                        : 'Mark Submission Complete'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 pt-4 border-t border-border-subtle">
                <Button
                  variant="secondary"
                  className="rounded-[14px]"
                  onClick={() => {
                    if (blockExamNavigation('sections')) {
                      return;
                    }

                    setViewMode('module');
                  }}
                  disabled={examModeActive}
                >
                  <IconBook2 className="size-4 mr-2" />
                  Sections
                </Button>

                {currentLessonIndex > 0 && (
                  <Button
                    variant="secondary"
                    className="rounded-[14px]"
                    onClick={() => {
                      if (blockExamNavigation('previous-lesson')) {
                        return;
                      }

                      setSelectedLessonId(lessons[currentLessonIndex - 1].id);
                    }}
                    disabled={examModeActive}
                  >
                    <IconArrowLeft className="size-4 mr-2" />
                    Previous
                  </Button>
                )}

                {nextLesson ? (
                  <Button
                    className="rounded-[14px] ml-auto"
                    onClick={() => {
                      if (blockExamNavigation('next-lesson')) {
                        return;
                      }

                      setSelectedLessonId(nextLesson.id);
                    }}
                    disabled={examModeActive}
                  >
                    Next Lesson
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                ) : quizStep &&
                  quizStep.id !== selectedLesson.id &&
                  !isLessonComplete(quizStep.id) ? (
                  <Button
                    className="rounded-[14px] ml-auto"
                    onClick={() => {
                      if (blockExamNavigation('go-to-assessment')) {
                        return;
                      }

                      openLesson(quizStep.id);
                    }}
                    disabled={examModeActive}
                  >
                    Go to Assessment
                    <IconPlayerPlayFilled className="size-4 ml-2" />
                  </Button>
                ) : currentModule.status === 'Complete' && nextModuleId ? (
                  <Button
                    className="rounded-[14px] ml-auto bg-success hover:bg-success/90"
                    onClick={() => {
                      if (blockExamNavigation('next-module')) {
                        return;
                      }

                      selectModule(nextModuleId);
                      setViewMode('module');
                    }}
                    disabled={examModeActive}
                  >
                    Next Module
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                ) : !quizStep && currentModule.status !== 'Complete' ? (
                  <Button
                    className="rounded-[14px] ml-auto bg-success hover:bg-success/90"
                    disabled={examSubmitting || !examUnlocked}
                    onClick={() => void handleCompleteModuleWithoutExam()}
                  >
                    {examSubmitting
                      ? 'Completing…'
                      : examUnlocked
                        ? 'Complete Module'
                        : `${formatSessionTime(sessionRemainingMinutes)} of session time left`}
                    {examUnlocked ? (
                      <IconCheck className="size-4 ml-2" />
                    ) : (
                      <IconLock className="size-4 ml-2" />
                    )}
                  </Button>
                ) : null}
              </div>
              {examError && selectedLesson.type !== 'Quiz' ? (
                <div className="rounded-[12px] border border-error/20 bg-error/5 p-4 text-sm text-error">
                  {examError}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* AI Assistant Panel */}
        <aside
          className={cn(
            'border-l border-border-subtle bg-surface-low transition-all duration-300 flex flex-col overflow-hidden',
            sidebarOpen ? 'w-[300px]' : 'w-[350px]'
          )}
        >
          <div className="flex border-b border-border-subtle px-4 pt-4">
            <button
              className={`flex flex-1 items-center justify-center gap-2 pb-4 text-xs ${
                tab === 'ai'
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'font-medium text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setTab('ai')}
            >
              <IconBrain className="size-4" />
              AI Tutor
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-2 pb-4 text-xs ${
                tab === 'instructor'
                  ? 'border-b-2 border-primary font-bold text-primary'
                  : 'font-medium text-on-surface-variant hover:text-primary'
              }`}
              onClick={() => setTab('instructor')}
            >
              <IconUserCircle className="size-4" />
              Instructor
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            {tab === 'ai' ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                      <IconBolt className="size-3" />
                    </div>
                    <div className="max-w-[80%] rounded-bl-lg rounded-br-lg rounded-tr-lg border border-border-subtle bg-surface p-2 shadow-sm text-[12px]">
                      <p className="text-on-surface">
                        {examModeActive
                          ? 'AI help is locked while secure exam mode is active.'
                          : 'Ready to help with your lesson!'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border-subtle bg-surface p-3 space-y-3">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Quick Help
                    </p>
                    {suggestionQuestions.slice(0, 2).map((question) => (
                      <button
                        onClick={() => {
                          if (examModeActive) {
                            return;
                          }

                          setMessage(question);
                          sendMessage(activeThread.id, question);
                        }}
                        key={question}
                        disabled={examModeActive}
                        className="group flex w-full items-center justify-between rounded-[10px] border border-border-subtle bg-surface p-2 text-left text-[11px] transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                      >
                        {question.slice(0, 18)}...
                        <IconBrain className="size-3 text-primary opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                  <div className="relative flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && message.trim()) {
                          sendMessage(activeThread.id, message);
                          setMessage('');
                        }
                      }}
                      placeholder="Ask something..."
                      className="h-9 rounded-[10px] pr-9 text-sm flex-1"
                      disabled={!portalUnlocked || examModeActive}
                    />
                    <button
                      className="text-primary transition hover:scale-110 disabled:opacity-50 p-1"
                      disabled={!portalUnlocked || examModeActive || !message.trim()}
                      onClick={() => {
                        if (message.trim()) {
                          sendMessage(activeThread.id, message);
                          setMessage('');
                        }
                      }}
                    >
                      <IconSend2 className="size-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-4 text-center text-[11px] text-on-surface-variant">
                Message your instructor here for feedback on this lesson.
              </div>
            )}
          </div>
        </aside>
      </div>

      <StudentIntakeModal open={workflowOpen} onClose={() => setWorkflowOpen(false)} />
    </main>
  );
}
