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
  IconBook2,
  IconFile,
  IconCheck,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { StudentIntakeModal } from '@/components/student/student-intake-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Quiz questions with answers
const quizQuestions = {
  'lesson-3': [
    { id: 'q1', question: 'What is the primary goal of patient care?', options: ['A) Profit', 'B) Patient wellbeing and safety', 'C) Efficiency', 'D) Documentation'], correct: 'B' },
    { id: 'q2', question: 'What does FERPA protect?', options: ['A) Medical records', 'B) Student educational records', 'C) Financial info', 'D) Employment'], correct: 'B' },
    { id: 'q3', question: 'What is the first step in infection control?', options: ['A) Glove up', 'B) Hand hygiene', 'C) PPE', 'D) Disinfect'], correct: 'B' },
  ],
  'lesson-6': [
    { id: 'q1', question: 'The circulatory system includes:', options: ['A) Heart and lungs', 'B) Heart and blood vessels', 'C) Lungs and kidneys', 'D) Brain and nerves'], correct: 'B' },
    { id: 'q2', question: 'How many chambers does the heart have?', options: ['A) 2', 'B) 3', 'C) 4', 'D) 5'], correct: 'C' },
    { id: 'q3', question: 'What is the function of hemoglobin?', options: ['A) Carry oxygen', 'B) Fight infection', 'C) Clot blood', 'D) Regulate pH'], correct: 'A' },
  ],
  'lesson-11': [
    { id: 'q1', question: 'Normal body temperature is:', options: ['A) 96.8°F', 'B) 98.6°F', 'C) 100°F', 'D) 102°F'], correct: 'B' },
    { id: 'q2', question: 'Normal resting heart rate for adults:', options: ['A) 40-60 bpm', 'B) 60-100 bpm', 'C) 100-120 bpm', 'D) 120-140 bpm'], correct: 'B' },
    { id: 'q3', question: 'Normal respiratory rate:', options: ['A) 8-12 breaths/min', 'B) 12-16 breaths/min', 'C) 16-20 breaths/min', 'D) 20-24 breaths/min'], correct: 'C' },
  ],
};

// Enhanced module content with video and document support
const moduleContent = {
  m1: {
    id: 'm1',
    title: 'Foundation of Patient Care',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Intro lecture',
        type: 'Video' as const,
        duration: '18 min',
        content: 'Core ethics, workflow, and patient communication fundamentals',
        videoUrl: 'https://www.youtube.com/embed/gUWJ-6nL5-8?si=NgKzHrDWZAnCynR5',
      },
      {
        id: 'lesson-2',
        title: 'Handbook packet',
        type: 'PDF' as const,
        duration: '6 pages',
        content: 'FERPA and attendance policy overview',
        documentUrl: '#',
      },
      {
        id: 'lesson-3',
        title: 'Readiness checkpoint',
        type: 'Quiz' as const,
        duration: '10 questions',
        content: 'Test your knowledge of core concepts',
      },
    ],
  },
  m2: {
    id: 'm2',
    title: 'Anatomy & Physiology',
    lessons: [
      {
        id: 'lesson-4',
        title: 'Body systems overview',
        type: 'Video' as const,
        duration: '22 min',
        content: 'Complete overview of major body systems',
        videoUrl: 'https://www.youtube.com/embed/gUWJ-6nL5-8?si=NgKzHrDWZAnCynR5',
      },
      {
        id: 'lesson-5',
        title: 'System terminology notes',
        type: 'Reading' as const,
        duration: '12 min',
        content: 'Essential medical terminology and concepts',
        documentUrl: '#',
      },
      {
        id: 'lesson-6',
        title: 'Module assessment',
        type: 'Quiz' as const,
        duration: '15 questions',
        content: 'Assessment of anatomy knowledge',
      },
    ],
  },
  m3: {
    id: 'm3',
    title: 'Vital Signs & Monitoring',
    lessons: [
      {
        id: 'lesson-7',
        title: 'Vital signs lecture',
        type: 'Video' as const,
        duration: '24 min',
        content: 'Learn how to measure and interpret vital signs',
        videoUrl: 'https://www.youtube.com/embed/gUWJ-6nL5-8?si=NgKzHrDWZAnCynR5',
      },
      {
        id: 'lesson-8',
        title: 'Procedure PDF',
        type: 'PDF' as const,
        duration: '8 pages',
        content: 'Printable bedside checklist and procedures',
        documentUrl: '#',
      },
      {
        id: 'lesson-9',
        title: 'Clinical reading notes',
        type: 'Reading' as const,
        duration: '14 min',
        content: 'Reference ranges and documentation standards',
        documentUrl: '#',
      },
      {
        id: 'lesson-10',
        title: 'Skill demonstration',
        type: 'Skill Check' as const,
        duration: '1 upload',
        content: 'Submit your practical demonstration',
      },
      {
        id: 'lesson-11',
        title: 'Module exam',
        type: 'Quiz' as const,
        duration: '20 questions',
        content: 'Final assessment for module completion',
      },
    ],
  },
  m4: {
    id: 'm4',
    title: 'Clinical Readiness',
    lessons: [
      {
        id: 'lesson-12',
        title: 'Simulation briefing',
        type: 'Video' as const,
        duration: '20 min',
        content: 'Preparation for clinical simulation',
        videoUrl: 'https://www.youtube.com/embed/gUWJ-6nL5-8?si=NgKzHrDWZAnCynR5',
      },
      {
        id: 'lesson-13',
        title: 'Clinical packet',
        type: 'PDF' as const,
        duration: '5 pages',
        content: 'Lab expectations and supply checklist',
        documentUrl: '#',
      },
      {
        id: 'lesson-14',
        title: 'Final module exam',
        type: 'Quiz' as const,
        duration: '25 questions',
        content: 'Completion assessment',
      },
    ],
  },
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
    portalUnlocked,
    workflowStage,
    intakeJourney,
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
  const [viewMode, setViewMode] = React.useState<'lesson' | 'module'>('lesson');
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState(0);
  const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
  const remainingMinutes = Math.max(480 - learningMinutes, 0);
  const engagementPercent = Math.round((learningMinutes / 480) * 100);

  const lessons = currentModule.steps;
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const currentLessonIndex = selectedLesson ? lessons.findIndex((lesson) => lesson.id === selectedLesson.id) : -1;
  const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : undefined;
  const quizQuestionSet = selectedLesson?.type === 'Quiz'
    ? (intakeJourney?.entranceExam.questions ?? []).map((question) => ({
        ...question,
        question: question.prompt,
        correct: question.preferredAnswer,
      }))
    : [];
  const quizPassingScoreCount = intakeJourney?.entranceExam.passingScore ?? quizQuestionSet.length;
  const quizPassingPercent =
    quizQuestionSet.length > 0 ? Math.round((quizPassingScoreCount / quizQuestionSet.length) * 100) : 70;
  const nextModuleId = modules[modules.findIndex((module) => module.id === currentModule.id) + 1]?.id;
  const lessonSections = lessons.reduce<Array<{ title: string; lessons: typeof lessons }>>((sections, lesson) => {
    const title = lesson.sectionTitle || 'Module Content';
    const existing = sections.find((section) => section.title === title);

    if (existing) {
      existing.lessons.push(lesson);
      return sections;
    }

    return [...sections, { title, lessons: [lesson] }];
  }, []);

  React.useEffect(() => {
    void refreshLearning();
  }, [refreshLearning]);

  React.useEffect(() => {
    if (!portalUnlocked) {
      setWorkflowOpen(true);
    }
  }, [portalUnlocked]);

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
      new Set(modules.flatMap((module) => module.steps.filter((step) => step.complete).map((step) => step.id))),
    );
  }, [modules]);

  React.useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [selectedLessonId]);

  return (
    <main className="h-screen overflow-hidden bg-background text-on-surface">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-border-subtle bg-surface px-8">
        <div className="flex items-center gap-4">
          <a href="/student/dashboard">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high" title="Back to Dashboard">
              <IconArrowLeft className="size-5" />
            </button>
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-high"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
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
                <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">Session Time</span>
                <span className="font-mono text-[20px] font-bold text-primary">
                  {Math.floor(learningMinutes / 60)}h {String(learningMinutes % 60).padStart(2, '0')}m
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
                <div className="h-full rounded-full bg-primary" style={{ width: `${engagementPercent}%` }} />
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
                <h3 className="font-display text-[18px] font-semibold text-on-surface mb-4">
                  {currentModule.title}
                </h3>
                <div className="space-y-2">
                  {lessonSections.map((section) => (
                    <div key={section.title} className="space-y-2">
                      <p className="px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                        {section.title}
                      </p>
                      {section.lessons.map((lesson, index) => {
                        const isSelected = lesson.id === selectedLessonId;
                        const isComplete = currentModule.steps.find((step) => step.id === lesson.id)?.complete || false;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setViewMode('lesson');
                            }}
                            className={cn(
                              'w-full text-left rounded-[14px] border p-3 text-sm transition',
                              isSelected
                                ? 'border-primary/30 bg-primary/10'
                                : 'border-border-subtle bg-surface hover:border-primary/20',
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {isComplete ? <IconCheck className="size-4" /> : index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-semibold text-on-surface">{lesson.title}</p>
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
                {modules.filter(m => m.status !== 'Locked').map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      selectModule(mod.id);
                      setSelectedLessonId(mod.steps[0]?.id ?? '');
                    }}
                    className={cn(
                      'w-full text-left rounded-[14px] border p-3 text-sm transition',
                      currentModule.id === mod.id
                        ? 'border-primary/30 bg-primary/10'
                        : 'border-border-subtle bg-surface hover:border-primary/20'
                    )}
                  >
                    <p className="font-semibold text-on-surface text-[12px]">{mod.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {mod.completedHours}/{mod.requiredHours} hours
                    </p>
                  </button>
                ))}
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
          ) : viewMode === 'lesson' && selectedLesson ? (
            <div className="p-8 space-y-6">
              {/* Video or Document Viewer */}
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
                      <p className="text-sm font-semibold text-on-surface">{selectedLesson.title}</p>
                      <p className="text-[12px] text-on-surface-variant mt-1">{selectedLesson.duration} • {selectedLesson.note}</p>
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

              {(selectedLesson.type === 'PDF' || selectedLesson.type === 'Reading' || selectedLesson.type === 'Link') && (
                <div className="rounded-[20px] overflow-hidden border border-border-subtle bg-surface-muted space-y-6">
                  <div className="bg-surface rounded-[20px] p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-primary/10 text-primary shrink-0">
                        <IconFile className="size-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
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
                        <h4 className="font-display text-[20px] font-semibold text-on-surface">Reading Content</h4>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-on-surface-variant">
                          {(selectedLesson.content || selectedLesson.note || 'No lesson text was configured yet.')
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
                          {selectedLesson.content || selectedLesson.note || 'Open the configured link to continue this lesson.'}
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
                      {selectedLesson.type === 'PDF' ? 'Open PDF' : selectedLesson.type === 'Link' ? 'Open Link' : 'Open Resource'}
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

              {false && (selectedLesson.type === 'PDF' || selectedLesson.type === 'Reading' || selectedLesson.type === 'Link') && (
                <div className="rounded-[20px] overflow-hidden border border-border-subtle bg-surface-muted space-y-6">
                  {/* Document Viewer */}
                  <div className="bg-surface rounded-[20px] p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-primary/10 text-primary shrink-0">
                        <IconFile className="size-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
                        <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="rounded-[16px] bg-surface-muted p-8 border border-border-subtle space-y-6 max-h-[600px] overflow-y-auto">
                      <div className="space-y-4">
                        <h4 className="font-display text-[20px] font-semibold text-on-surface">
                          {selectedLesson.type === 'PDF'
                            ? 'Clinical Procedures & Checklists'
                            : selectedLesson.type === 'Link'
                              ? 'External Learning Resource'
                              : 'Learning Module'}
                        </h4>

                        {selectedLesson.type === 'PDF' && (
                          <div className="space-y-4">
                            <div className="bg-surface p-4 rounded-[12px] border border-border-subtle space-y-3">
                              <h5 className="font-semibold text-on-surface">Vital Signs Assessment Checklist</h5>
                              <div className="space-y-2 text-sm text-on-surface-variant">
                                <label className="flex items-center gap-2"><input type="checkbox" /> Patient identification and consent</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Wash hands and gather equipment</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Measure temperature (axillary/oral)</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Assess pulse rate and rhythm</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Count respiration rate for 60 seconds</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Measure blood pressure bilaterally</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Document findings accurately</label>
                                <label className="flex items-center gap-2"><input type="checkbox" /> Report abnormalities to supervisor</label>
                              </div>
                            </div>

                            <div className="bg-info/5 p-4 rounded-[12px] border border-info/20 space-y-3">
                              <h5 className="font-semibold text-info">Normal Values Reference</h5>
                              <div className="grid grid-cols-2 gap-3 text-sm text-on-surface-variant">
                                <div><strong>Temperature:</strong> 98.6°F (37°C)</div>
                                <div><strong>Pulse:</strong> 60-100 bpm</div>
                                <div><strong>Respiration:</strong> 12-20 breaths/min</div>
                                <div><strong>BP:</strong> &lt;120/&lt;80 mmHg</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {(selectedLesson.type === 'Reading' || selectedLesson.type === 'Link') && (
                          <div className="space-y-4">
                            <div className="bg-surface p-4 rounded-[12px] border border-border-subtle space-y-3">
                              <h5 className="font-semibold text-on-surface">Core Concepts</h5>
                              <div className="space-y-2 text-sm text-on-surface-variant leading-relaxed">
                                <p>{selectedLesson.content || selectedLesson.note}</p>
                                <p>
                                  <strong>Student Action:</strong> Review the assigned resource and capture the key ideas before moving to the next lesson item.
                                </p>
                                <p>
                                  <strong>Completion Rule:</strong> Mark the lesson complete only after you have opened the material and reviewed it fully.
                                </p>
                              </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-[12px] border border-primary/20 space-y-3">
                              <h5 className="font-semibold text-primary">Key Concepts to Remember</h5>
                              <ul className="space-y-2 text-sm text-on-surface-variant">
                                <li>• Resources are grouped by section to mimic a modern course curriculum.</li>
                                <li>• Videos, PDFs, and links can all be used as trackable lesson items.</li>
                                <li>• Use the instructor panel if a linked reference needs clarification.</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-8 pb-8 flex gap-3">
                    <Button
                      className="flex-1 rounded-[14px] h-11"
                      variant="secondary"
                      disabled={!selectedLesson.resourceUrl}
                      onClick={() => window.open(selectedLesson.resourceUrl || '#', '_blank')}
                    >
                      <IconFile className="size-4 mr-2" />
                      {selectedLesson.type === 'PDF' ? 'Open PDF' : selectedLesson.type === 'Link' ? 'Open Link' : 'Open Resource'}
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
                      {completedLessons.has(selectedLesson.id) ? 'Completed ✓' : 'Mark as Complete'}
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
                      <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
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
                          {selectedLesson.content || selectedLesson.note || 'Complete the configured module assessment to move forward.'}
                        </p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                          Section
                        </p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {selectedLesson.sectionTitle || 'Assessment'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Assessment Type</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">Configured module exam</p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Duration</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">{selectedLesson.duration}</p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Status</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">
                          {completedLessons.has(selectedLesson.id) ? 'Completed' : 'Ready to launch'}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="h-11 w-full rounded-[14px] bg-success hover:bg-success/90"
                      disabled={completedLessons.has(selectedLesson.id)}
                      onClick={() => {
                        setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                        submitModuleExam();
                        advanceLearning(30);
                      }}
                    >
                      {completedLessons.has(selectedLesson.id) ? 'Assessment Completed' : 'Launch Assessment'}
                    </Button>
                  </div>
                </div>
              )}

              {false && selectedLesson.type === 'Quiz' && quizQuestionSet.length === 0 && (
                <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-info/10 text-info">
                      <IconCircleCheckFilled className="size-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
                      <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-border-subtle bg-surface p-6 space-y-6">
                    <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-5">
                      <h4 className="font-semibold text-on-surface">Assessment Overview</h4>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        {selectedLesson.content || selectedLesson.note || 'Launch this assessment after reviewing the module materials.'}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Assessment Type</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">Configured module exam</p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Duration</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">{selectedLesson.duration}</p>
                      </div>
                      <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Completion</p>
                        <p className="mt-2 text-sm font-semibold text-on-surface">Marks this lesson complete</p>
                      </div>
                    </div>

                    <Button
                      className="h-11 w-full rounded-[14px] bg-success hover:bg-success/90"
                      onClick={() => {
                        setQuizScore(100);
                        setQuizSubmitted(true);
                        setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                        markStepComplete(currentModule.id, selectedLesson.id);
                        advanceLearning(30);
                      }}
                    >
                      Complete Assessment
                    </Button>
                  </div>
                </div>
              )}

              {false && selectedLesson.type === 'Quiz' && quizQuestionSet.length > 0 && (
                <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-[14px]",
                      quizSubmitted && quizScore >= quizPassingPercent ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                    )}>
                      <IconCircleCheckFilled className="size-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
                      <p className="mt-1 text-on-surface-variant">{selectedLesson.note}</p>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-border-subtle bg-surface p-6 space-y-6">
                    {!quizSubmitted ? (
                      <>
                        <div>
                          <h4 className="font-semibold text-on-surface mb-4">Quiz Instructions</h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            Complete this assessment to verify your understanding. You must score at least {quizPassingPercent}% to pass.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {quizQuestionSet.map((q, idx) => (
                            <div key={q.id} className="p-4 border border-border-subtle rounded-[12px] hover:bg-surface-low transition">
                              <p className="font-semibold text-sm text-on-surface mb-3">Question {idx + 1}: {q.prompt}</p>
                              {q.type === 'text' ? (
                                <Input
                                  value={quizAnswers[q.id] ?? ''}
                                  onChange={(event) =>
                                    setQuizAnswers({ ...quizAnswers, [q.id]: event.target.value })
                                  }
                                  placeholder={q.placeholder ?? 'Type your answer'}
                                  className="h-11"
                                />
                              ) : (
                                <div className="space-y-2">
                                  {q.options.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={opt.value}
                                        checked={quizAnswers[q.id] === opt.value}
                                        onChange={(event) =>
                                          setQuizAnswers({ ...quizAnswers, [q.id]: event.target.value })
                                        }
                                        className="w-4 h-4"
                                      />
                                      <span className="text-sm text-on-surface-variant">{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <Button className="w-full rounded-[14px] h-11 bg-success hover:bg-success/90" onClick={() => {
                          if (quizQuestionSet.length === 0) {
                            return;
                          }

                          const correct = quizQuestionSet.filter((q) => {
                            const answer = (quizAnswers[q.id] ?? '').trim().toLowerCase();
                            return answer.length > 0 && answer === q.preferredAnswer.trim().toLowerCase();
                          }).length;
                          const score = Math.round((correct / quizQuestionSet.length) * 100);
                          setQuizScore(score);
                          setQuizSubmitted(true);
                          advanceLearning(30);
                          if (score >= quizPassingPercent) {
                            setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
                            markStepComplete(currentModule.id, selectedLesson.id);
                          }
                        }}>
                          Submit Quiz
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className={cn(
                          "rounded-[16px] p-6 text-center",
                          quizScore >= quizPassingPercent ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'
                        )}>
                          <h4 className={cn("font-display text-[32px] font-bold", quizScore >= quizPassingPercent ? 'text-success' : 'text-warning')}>
                            {quizScore}%
                          </h4>
                          <p className={cn("text-sm font-semibold mt-2", quizScore >= quizPassingPercent ? 'text-success' : 'text-warning')}>
                            {quizScore >= quizPassingPercent ? '✓ PASSED - Great job!' : '✗ FAILED - Review and try again'}
                          </p>
                          <p className="text-sm text-on-surface-variant mt-3">
                            {quizScore >= quizPassingPercent
                              ? 'You have mastered this content. Ready to proceed!'
                              : `You need ${quizPassingPercent}% to pass. Review the material and retake the quiz.`}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {quizQuestionSet.map((q, idx) => {
                            const isCorrect = quizAnswers[q.id] === q.correct;
                            return (
                              <div key={q.id} className={cn(
                                "p-3 rounded-[12px] border",
                                isCorrect ? 'bg-success/5 border-success/20' : 'bg-error/5 border-error/20'
                              )}>
                                <p className="text-sm font-semibold text-on-surface">Q{idx + 1}: {q.question}</p>
                                <p className={cn("text-sm mt-2", isCorrect ? 'text-success font-semibold' : 'text-error font-semibold')}>
                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'} - Your answer: {quizAnswers[q.id]}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          className="w-full rounded-[14px] h-11"
                          disabled={quizScore >= quizPassingPercent}
                          onClick={() => {
                            setQuizSubmitted(false);
                            setQuizAnswers({});
                            setQuizScore(0);
                          }}
                        >
                          {quizScore >= quizPassingPercent ? '✓ Lesson Complete - Continue' : 'Retake Quiz'}
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
                      <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
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
                          {selectedLesson.content || selectedLesson.note || 'Upload the required skill evidence for instructor review.'}
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
                      {completedLessons.has(selectedLesson.id) ? 'Submission Recorded' : 'Mark Submission Complete'}
                    </Button>
                  </div>
                </div>
              )}

              {false && selectedLesson.type === 'Skill Check' && (
                <div className="rounded-[20px] border border-border-subtle bg-surface-muted p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-info/10 text-info">
                      <IconUserCircle className="size-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-[24px] font-bold text-on-surface">{selectedLesson.title}</h3>
                      <p className="mt-1 text-on-surface-variant">Demonstrate your practical skills</p>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-border-subtle bg-surface p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-on-surface mb-2">Skill Demonstration Requirements</h4>
                        <ul className="space-y-2 text-sm text-on-surface-variant">
                          <li>✓ Demonstrate proper technique</li>
                          <li>✓ Record clear video evidence (1-2 minutes)</li>
                          <li>✓ Show all key procedural steps</li>
                          <li>✓ Include brief explanation</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-[12px]">
                        <p className="text-sm text-on-surface-variant">
                          Upload your demonstration video to show mastery of this skill.
                          Your instructor will review and provide feedback within 24 hours.
                        </p>
                      </div>

                      <Button className="w-full rounded-[14px] h-11">
                        Upload Demonstration
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 pt-4 border-t border-border-subtle">
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
                ) : nextModuleId ? (
                  <Button
                    className="rounded-[14px] ml-auto bg-success hover:bg-success/90"
                    onClick={() => {
                      selectModule(nextModuleId);
                      setViewMode('module');
                      advanceLearning(30);
                      submitModuleExam();
                    }}
                  >
                    Next Module
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="rounded-[14px] ml-auto"
                    disabled={!examUnlocked}
                    onClick={submitModuleExam}
                  >
                    Take Final Exam
                    <IconPlayerPlayFilled className="size-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* AI Assistant Panel */}
        <aside className={cn(
          'border-l border-border-subtle bg-surface-low transition-all duration-300 flex flex-col overflow-hidden',
          sidebarOpen ? 'w-[300px]' : 'w-[350px]'
        )}>
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
                    <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Quick Help</p>
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
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Session Time</span>
            <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
              <IconClockHour4 className="size-4" />
              {Math.floor(learningMinutes / 60)}h {String(learningMinutes % 60).padStart(2, '0')}m
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Progress</span>
            <span className="font-mono text-sm text-on-surface">
              {examUnlocked ? '✓ Ready for exam' : `${(remainingMinutes / 60).toFixed(1)}h to unlock`}
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
