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
  IconClockHour4,
  IconFile,
  IconLock,
  IconMenu2,
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
    learningMinutes,
    learningSessionActive,
    examUnlocked,
    portalHydrated,
    portalUnlocked,
    workflowStage,
    currentModule,
    modules,
    advanceLearning,
    toggleLearningSession,
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
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
  const remainingMinutes = Math.max(480 - learningMinutes, 0);
  const engagementPercent = Math.round((learningMinutes / 480) * 100);

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

  React.useEffect(() => {
    void refreshLearning();
  }, [refreshLearning]);

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
  }, [selectedLessonId]);

  const isLessonComplete = (lessonId: string) =>
    completedLessons.has(lessonId) ||
    lessons.find((lesson) => lesson.id === lessonId)?.complete === true;

  const openLesson = (lessonId: string) => {
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
      openLesson(target.id);
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
      if (outcome.result.passed) {
        advanceLearning(30);
      }
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

  return (
    <main className="h-screen overflow-hidden bg-background text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex items-center gap-4">
          <a href="/student/dashboard">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high"
              title="Back to Dashboard"
            >
              <IconArrowLeft className="size-5" />
            </button>
          </a>
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

        <div className="flex items-center gap-8">
          {/* Session Time Display */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-[14px] bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <IconClockHour4 className="size-5 text-primary" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
                  Session Time
                </span>
                <span className="font-mono text-[20px] font-bold text-primary">
                  {Math.floor(learningMinutes / 60)}h{' '}
                  {String(learningMinutes % 60).padStart(2, '0')}m
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Progress */}
          <div className="flex flex-col items-end">
            <span className="font-mono text-[12px] uppercase tracking-widest text-on-surface-variant">
              Engagement Progress
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[20px] font-semibold text-primary">
                {(learningMinutes / 60).toFixed(1)}{' '}
                <span className="font-sans text-xs text-on-surface-variant">/ 8h</span>
              </span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-high">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${engagementPercent}%` }}
                />
              </div>
              <span className="font-mono text-sm font-bold text-success">{engagementPercent}%</span>
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
                            onClick={() => openLesson(lesson.id)}
                            className={cn(
                              'w-full text-left rounded-[14px] border p-3 text-sm transition',
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
                      disabled={locked}
                      onClick={() => {
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
                        const target =
                          lessons.find((lesson) => !isLessonComplete(lesson.id)) ?? lessons[0];
                        if (target) {
                          openLesson(target.id);
                        }
                      }}
                      disabled={lessons.length === 0}
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
                            onClick={() => openSection(section.id)}
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
                                onClick={() => openLesson(lesson.id)}
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
                      disabled={completedLessons.has(selectedLesson.id)}
                      onClick={() => {
                        setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                        advanceLearning(10);
                      }}
                    >
                      <IconCheck className="size-4 mr-2" />
                      {completedLessons.has(selectedLesson.id) ? 'Done ✓' : 'Complete'}
                    </Button>
                  </div>
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
                      disabled={completedLessons.has(selectedLesson.id)}
                      onClick={() => {
                        setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                        advanceLearning(15);
                      }}
                    >
                      <IconCheck className="size-4 mr-2" />
                      {completedLessons.has(selectedLesson.id) ? 'Completed' : 'Mark as Complete'}
                    </Button>
                  </div>
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
                    ) : quizQuestionSet.length > 0 ? (
                      <>
                        <div className="space-y-4">
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
                        setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                        advanceLearning(20);
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
                  onClick={() => setViewMode('module')}
                >
                  <IconBook2 className="size-4 mr-2" />
                  Sections
                </Button>

                {currentLessonIndex > 0 && (
                  <Button
                    variant="secondary"
                    className="rounded-[14px]"
                    onClick={() => setSelectedLessonId(lessons[currentLessonIndex - 1].id)}
                  >
                    <IconArrowLeft className="size-4 mr-2" />
                    Previous
                  </Button>
                )}

                {nextLesson ? (
                  <Button
                    className="rounded-[14px] ml-auto"
                    onClick={() => {
                      setSelectedLessonId(nextLesson.id);
                      advanceLearning(15);
                    }}
                  >
                    Next Lesson
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                ) : quizStep &&
                  quizStep.id !== selectedLesson.id &&
                  !isLessonComplete(quizStep.id) ? (
                  <Button
                    className="rounded-[14px] ml-auto"
                    onClick={() => openLesson(quizStep.id)}
                  >
                    Go to Assessment
                    <IconPlayerPlayFilled className="size-4 ml-2" />
                  </Button>
                ) : currentModule.status === 'Complete' && nextModuleId ? (
                  <Button
                    className="rounded-[14px] ml-auto bg-success hover:bg-success/90"
                    onClick={() => {
                      selectModule(nextModuleId);
                      setViewMode('module');
                    }}
                  >
                    Next Module
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                ) : !quizStep && currentModule.status !== 'Complete' ? (
                  <Button
                    className="rounded-[14px] ml-auto bg-success hover:bg-success/90"
                    disabled={examSubmitting}
                    onClick={() => void handleCompleteModuleWithoutExam()}
                  >
                    {examSubmitting ? 'Completing…' : 'Complete Module'}
                    <IconCheck className="size-4 ml-2" />
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
                      <p className="text-on-surface">Ready to help with your lesson!</p>
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
                          setMessage(question);
                          sendMessage(activeThread.id, question);
                        }}
                        key={question}
                        className="group flex w-full items-center justify-between rounded-[10px] border border-border-subtle bg-surface p-2 text-left text-[11px] transition hover:border-primary hover:bg-primary/5"
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
                      disabled={!portalUnlocked}
                    />
                    <button
                      className="text-primary transition hover:scale-110 disabled:opacity-50 p-1"
                      disabled={!portalUnlocked || !message.trim()}
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

      <footer className="fixed bottom-0 left-0 right-0 z-[60] flex h-20 items-center justify-between border-t border-border-subtle bg-surface/80 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-8 text-sm">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
              Session Time
            </span>
            <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
              <IconClockHour4 className="size-4" />
              {Math.floor(learningMinutes / 60)}h {String(learningMinutes % 60).padStart(2, '0')}m
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">
              Progress
            </span>
            <span className="font-mono text-sm text-on-surface">
              {examUnlocked
                ? '✓ Ready for exam'
                : `${(remainingMinutes / 60).toFixed(1)}h to unlock`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-[12px] border-2 border-primary text-primary text-sm"
            onClick={toggleLearningSession}
            disabled={!portalUnlocked}
          >
            {learningSessionActive ? 'Pause' : 'Resume'}
          </Button>
          <Button
            className="h-10 rounded-[12px] px-6 shadow-lg shadow-primary/20 text-sm"
            disabled={!portalUnlocked}
            onClick={() => {
              advanceLearning(30);
            }}
          >
            +30 Min
            <IconArrowRight className="size-3 ml-1" />
          </Button>
        </div>
      </footer>

      <StudentIntakeModal open={workflowOpen} onClose={() => setWorkflowOpen(false)} />
    </main>
  );
}
