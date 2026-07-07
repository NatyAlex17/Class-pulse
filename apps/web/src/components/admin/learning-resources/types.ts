export type ResourceType = 'video' | 'pdf' | 'link' | 'text' | 'exam';

export type ExamFormat = 'text' | 'multiple-choice';

export type ExamQuestion = {
  id: string;
  prompt: string;
  points: number;
  expectedAnswer?: string;
  options?: string[];
  correctOption?: number;
};

export type LearningResource = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
  description: string;
  url?: string;
  content?: string;
  questionCount?: number;
  passingScore?: number;
  examFormat?: ExamFormat;
  questions?: ExamQuestion[];
};

export type LearningSection = {
  id: string;
  title: string;
  description: string;
  resources: LearningResource[];
};

export type LearningModule = {
  id: string;
  title: string;
  summary: string;
  requiredHours: number;
  moduleFee: number;
  order: number;
  minimumHoursForCertification?: number;
  sections: LearningSection[];
};

export type LearningResourcesConfig = {
  modules: LearningModule[];
  globalSettings?: {
    minimumHoursForCertification?: number;
  };
};

export type BuilderView = 'modules' | 'module-detail' | 'section-detail';

export type ModuleRow = {
  id: string;
  title: string;
  requiredHours: number;
  moduleFee: number;
  sections: number;
  items: number;
};

export type SectionRow = {
  id: string;
  title: string;
  description: string;
  items: number;
};

export type ResourceRow = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
};

export const resourceTypeOptions = [
  { label: 'Video', value: 'video' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Link', value: 'link' },
  { label: 'Text Lesson', value: 'text' },
  { label: 'Exam', value: 'exam' },
];

export const resourceTypeLabels: Record<ResourceType, string> = {
  video: 'Video',
  pdf: 'PDF',
  link: 'Link',
  text: 'Text Lesson',
  exam: 'Exam',
};

export const sourceModeOptions = [
  { label: 'Paste a link (URL)', value: 'url' },
  { label: 'Upload from this computer', value: 'upload' },
];

export function createBlankExamQuestion(format: ExamFormat): ExamQuestion {
  return {
    id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: '',
    points: 1,
    options: format === 'multiple-choice' ? ['', '', '', ''] : undefined,
    correctOption: undefined,
  };
}

export function resizeExamQuestions(current: ExamQuestion[], count: number, format: ExamFormat): ExamQuestion[] {
  if (count <= current.length) {
    return current.slice(0, count);
  }
  return [
    ...current,
    ...Array.from({ length: count - current.length }, () => createBlankExamQuestion(format)),
  ];
}

export function applyFormatToQuestions(questions: ExamQuestion[], format: ExamFormat): ExamQuestion[] {
  return questions.map((question) =>
    format === 'multiple-choice'
      ? { ...question, options: question.options?.length ? question.options : ['', '', '', ''] }
      : { ...question, options: undefined, correctOption: undefined },
  );
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || `item-${Date.now()}`;
}

export function getModuleHref(moduleId: string) {
  return `/admin/configurations/learning-resources/${moduleId}`;
}

export function getSectionHref(moduleId: string, sectionId: string) {
  return `/admin/configurations/learning-resources/${moduleId}/sections/${sectionId}`;
}

export function getItemCount(module: LearningModule) {
  return module.sections.reduce((sum, section) => sum + section.resources.length, 0);
}

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
