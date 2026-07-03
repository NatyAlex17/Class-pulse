'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBook2,
  IconCheck,
  IconChevronRight,
  IconClipboardText,
  IconEdit,
  IconEye,
  IconHierarchy3,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ResourceType = 'video' | 'pdf' | 'link' | 'text' | 'exam';

type ExamFormat = 'text' | 'multiple-choice';

type ExamQuestion = {
  id: string;
  prompt: string;
  points: number;
  expectedAnswer?: string;
  options?: string[];
  correctOption?: number;
};

type LearningResource = {
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

type LearningSection = {
  id: string;
  title: string;
  description: string;
  resources: LearningResource[];
};

type LearningModule = {
  id: string;
  title: string;
  summary: string;
  requiredHours: number;
  order: number;
  minimumHoursForCertification?: number;
  sections: LearningSection[];
};

type LearningResourcesConfig = {
  modules: LearningModule[];
  globalSettings?: {
    minimumHoursForCertification?: number;
  };
};

type BuilderView = 'modules' | 'module-detail' | 'section-detail';

type BuilderProps = {
  view: BuilderView;
  moduleId?: string;
  sectionId?: string;
};

type ModuleRow = {
  id: string;
  title: string;
  requiredHours: number;
  sections: number;
  items: number;
};

type SectionRow = {
  id: string;
  title: string;
  description: string;
  items: number;
};

type ResourceRow = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
};

const resourceTypeOptions = [
  { label: 'Video', value: 'video' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Link', value: 'link' },
  { label: 'Text Lesson', value: 'text' },
  { label: 'Exam', value: 'exam' },
];

const resourceTypeLabels: Record<ResourceType, string> = {
  video: 'Video',
  pdf: 'PDF',
  link: 'Link',
  text: 'Text Lesson',
  exam: 'Exam',
};

const fileInputClassName =
  'block w-full cursor-pointer text-sm text-on-surface-variant file:mr-4 file:cursor-pointer file:rounded-[10px] file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20';

const sourceModeOptions = [
  { label: 'Paste a link (URL)', value: 'url' },
  { label: 'Upload from this computer', value: 'upload' },
];

function createBlankExamQuestion(format: ExamFormat): ExamQuestion {
  return {
    id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: '',
    points: 1,
    options: format === 'multiple-choice' ? ['', '', '', ''] : undefined,
    correctOption: undefined,
  };
}

function resizeExamQuestions(current: ExamQuestion[], count: number, format: ExamFormat): ExamQuestion[] {
  if (count <= current.length) {
    return current.slice(0, count);
  }
  return [
    ...current,
    ...Array.from({ length: count - current.length }, () => createBlankExamQuestion(format)),
  ];
}

function applyFormatToQuestions(questions: ExamQuestion[], format: ExamFormat): ExamQuestion[] {
  return questions.map((question) =>
    format === 'multiple-choice'
      ? { ...question, options: question.options?.length ? question.options : ['', '', '', ''] }
      : { ...question, options: undefined, correctOption: undefined },
  );
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || `item-${Date.now()}`;
}

function getModuleHref(moduleId: string) {
  return `/admin/configurations/learning-resources/${moduleId}`;
}

function getSectionHref(moduleId: string, sectionId: string) {
  return `/admin/configurations/learning-resources/${moduleId}/sections/${sectionId}`;
}

function getItemCount(module: LearningModule) {
  return module.sections.reduce((sum, section) => sum + section.resources.length, 0);
}

function useLearningResourcesConfig() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<LearningResourcesConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  // Snapshot of the config as last persisted to the API. The auto-save effect
  // compares against this so it only saves genuine local mutations (and never
  // re-saves data that just arrived from the server).
  const lastSavedRef = React.useRef<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);

  const fetchConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to manage learning resources.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
          // Initialize with empty config if not found
          const emptyConfig = { modules: [], globalSettings: { minimumHoursForCertification: 0 } };
          lastSavedRef.current = JSON.stringify(emptyConfig);
          setConfig(emptyConfig);
        } else {
          throw new Error(`Failed to load configuration (${response.status}).`);
        }
        return;
      }

      const payload = await response.json();
      const data = payload.data || { modules: [], globalSettings: { minimumHoursForCertification: 0 } };
      lastSavedRef.current = JSON.stringify(data);
      setConfig(data);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load learning resources configuration.',
      );
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const saveConfig = React.useCallback(async () => {
    if (!config || !session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Learning management configuration saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save learning resources.');
    } finally {
      setSaving(false);
    }
  }, [adminId, config, session?.access_token]);

  // Persist a config to the API immediately (fire-and-forget). Marks the
  // snapshot as saved up front so the debounced effect doesn't double-save;
  // on failure it clears the snapshot so the next change (or manual Save) retries.
  const autoSaveConfig = React.useCallback(
    (newConfig: LearningResourcesConfig) => {
      if (!session?.access_token) {
        setError('Sign in to save learning resources.');
        return;
      }

      const snapshot = JSON.stringify(newConfig);
      lastSavedRef.current = snapshot;

      void (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: snapshot,
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error?.message ?? `Failed to save configuration (${response.status}).`);
          }
        } catch (saveError) {
          if (lastSavedRef.current === snapshot) {
            lastSavedRef.current = null;
          }
          setError(saveError instanceof Error ? saveError.message : 'Failed to save learning resources.');
        }
      })();
    },
    [adminId, session?.access_token],
  );

  // Auto-save any local mutation to the API (debounced). Deleting the last
  // module or section is a mutation too, so empty configs are saved as well.
  React.useEffect(() => {
    if (!config) {
      return;
    }

    if (JSON.stringify(config) === lastSavedRef.current) {
      return; // Already persisted (e.g. data that just arrived from the server).
    }

    const timer = setTimeout(() => {
      autoSaveConfig(config);
    }, 500); // Debounce for 500ms to avoid too many API calls

    return () => clearTimeout(timer);
  }, [config, autoSaveConfig]);

  const uploadFile = React.useCallback(
    async (file: File): Promise<string> => {
      if (!session?.access_token) {
        throw new Error('Sign in to upload files.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to upload file (${response.status}).`);
      }

      const payload = await response.json();
      const url = payload?.data?.url;

      if (typeof url !== 'string' || !url) {
        throw new Error('Upload succeeded but no file URL was returned.');
      }

      return url;
    },
    [adminId, session?.access_token],
  );

  const resetConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Learning management configuration reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset learning resources.');
    } finally {
      setResetting(false);
    }
  }, [adminId, session?.access_token]);

  return {
    config,
    setConfig,
    loading,
    saving,
    resetting,
    error,
    success,
    setError,
    setSuccess,
    fetchConfig,
    saveConfig,
    resetConfig,
    autoSaveConfig,
    uploadFile,
  };
}

type DeleteConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

function DeleteConfirmModal({
  state,
  onCancel,
}: {
  state: DeleteConfirmState | null;
  onCancel: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-md space-y-4 rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-error/10">
            <IconAlertCircle className="size-6 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-on-surface">{state.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">This action cannot be undone.</p>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
          <p className="break-words text-sm font-medium text-on-surface">{state.description}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              state.onConfirm();
              onCancel();
            }}
          >
            {state.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RowIconButton({
  title,
  destructive,
  active,
  onClick,
  children,
}: {
  title: string;
  destructive?: boolean;
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-[8px] p-2 transition ${
        destructive
          ? 'text-on-surface-variant hover:bg-error/10 hover:text-error'
          : active
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface-variant hover:bg-surface hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function ConfigBanner({ error, success }: { error: string | null; success: string | null }) {
  return (
    <>
      {error ? (
        <div className="rounded-[14px] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-[14px] border border-success/20 bg-success/10 p-4 text-sm text-success">
          <IconCheck className="size-4" />
          {success}
        </div>
      ) : null}
    </>
  );
}

function PageToolbar({
  onRefresh,
  onReset,
  onSave,
  resetting,
  saving,
}: {
  onRefresh: () => void;
  onReset: () => void;
  onSave: () => void;
  resetting: boolean;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <IconRefresh className="size-4" />
        Refresh
      </Button>
      <Button variant="secondary" size="sm" onClick={onReset} disabled={resetting}>
        {resetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}

function ExamQuestionsEditor({
  format,
  questions,
  onChange,
}: {
  format: ExamFormat;
  questions: ExamQuestion[];
  onChange: (questions: ExamQuestion[]) => void;
}) {
  const updateQuestion = (index: number, updater: (question: ExamQuestion) => ExamQuestion) => {
    onChange(questions.map((question, i) => (i === index ? updater(question) : question)));
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-on-surface">
          Question Configuration ({questions.length})
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...questions, createBlankExamQuestion(format)])}
        >
          <IconPlus className="size-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-border-subtle p-6 text-center text-sm text-on-surface-variant">
          No questions yet. Set the number of questions above or click Add Question.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-[14px] border border-border-subtle bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge variant="primary">Question {index + 1}</Badge>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-on-surface">Marks</label>
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(index, (q) => ({
                          ...q,
                          points: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <RowIconButton
                    title="Remove question"
                    destructive
                    onClick={() => onChange(questions.filter((_, i) => i !== index))}
                  >
                    <IconTrash className="size-4" />
                  </RowIconButton>
                </div>
              </div>

              <Textarea
                className="min-h-16"
                value={question.prompt}
                onChange={(event) =>
                  updateQuestion(index, (q) => ({ ...q, prompt: event.target.value }))
                }
                placeholder={`Write question ${index + 1} here...`}
              />

              {format === 'multiple-choice' ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-on-surface">
                    Options <span className="font-normal text-on-surface-variant">(select the correct answer)</span>
                  </p>
                  {(question.options ?? []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        className="size-4 shrink-0 accent-primary"
                        title="Mark as correct answer"
                        checked={question.correctOption === optionIndex}
                        onChange={() =>
                          updateQuestion(index, (q) => ({ ...q, correctOption: optionIndex }))
                        }
                      />
                      <Input
                        value={option}
                        placeholder={`Option ${optionIndex + 1}`}
                        onChange={(event) =>
                          updateQuestion(index, (q) => ({
                            ...q,
                            options: (q.options ?? []).map((o, i) =>
                              i === optionIndex ? event.target.value : o,
                            ),
                          }))
                        }
                      />
                      <RowIconButton
                        title="Remove option"
                        destructive
                        onClick={() =>
                          updateQuestion(index, (q) => {
                            const options = (q.options ?? []).filter((_, i) => i !== optionIndex);
                            let correctOption = q.correctOption;
                            if (correctOption !== undefined) {
                              if (correctOption === optionIndex) {
                                correctOption = undefined;
                              } else if (correctOption > optionIndex) {
                                correctOption -= 1;
                              }
                            }
                            return { ...q, options, correctOption };
                          })
                        }
                      >
                        <IconTrash className="size-4" />
                      </RowIconButton>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateQuestion(index, (q) => ({ ...q, options: [...(q.options ?? []), ''] }))
                      }
                    >
                      <IconPlus className="size-4" />
                      Add Option
                    </Button>
                    {question.correctOption === undefined ? (
                      <span className="text-xs text-warning">Select the correct answer.</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-on-surface">
                    Expected Answer <span className="font-normal text-on-surface-variant">(optional, shown to graders)</span>
                  </label>
                  <Textarea
                    className="min-h-16"
                    value={question.expectedAnswer ?? ''}
                    onChange={(event) =>
                      updateQuestion(index, (q) => ({
                        ...q,
                        expectedAnswer: event.target.value || undefined,
                      }))
                    }
                    placeholder="Key points a good answer should cover."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionItemEditor({
  item,
  moduleId,
  sectionId,
  updateResource,
  removeResource,
  onUploadFile,
  onError,
}: {
  item: LearningResource;
  moduleId: string;
  sectionId: string;
  updateResource: (
    moduleId: string,
    sectionId: string,
    resourceId: string,
    updater: (resource: LearningResource) => LearningResource,
  ) => void;
  removeResource: (resourceId: string) => void;
  onUploadFile: (file: File) => Promise<string>;
  onError: (message: string | null) => void;
}) {
  const typeLabel = resourceTypeLabels[item.type];
  const [uploading, setUploading] = React.useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      onError(null);
      const url = await onUploadFile(file);
      updateResource(moduleId, sectionId, item.id, (resource) => ({ ...resource, url }));
    } catch (uploadError) {
      onError(uploadError instanceof Error ? uploadError.message : 'Failed to upload file.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Edit {typeLabel}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Update the details for this {typeLabel.toLowerCase()} content.
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => removeResource(item.id)}>
          <IconTrash className="size-4" />
          Remove Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Title</label>
          <Input
            value={item.title}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                title: event.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Item ID</label>
          <Input value={item.id} disabled />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Type</label>
          <div className="flex items-center gap-2">
            <Badge variant="info">{typeLabel}</Badge>
            <span className="text-xs text-on-surface-variant">(Fixed)</span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
          <Input
            value={item.duration}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                duration: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
        <Textarea
          className="min-h-20"
          value={item.description}
          onChange={(event) =>
            updateResource(moduleId, sectionId, item.id, (resource) => ({
              ...resource,
              description: event.target.value,
            }))
          }
          placeholder="Summarize what this content covers."
        />
      </div>

      {/* Video-specific fields */}
      {item.type === 'video' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Video URL</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="YouTube, Vimeo URL, or video file URL"
          />
          <div className="mt-2 flex items-center gap-3">
            <input type="file" accept="video/*" disabled={uploading} onChange={handleFileUpload} className={fileInputClassName} />
            {uploading ? <span className="shrink-0 text-xs text-on-surface-variant">Uploading...</span> : null}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Paste a link above, or upload a video file to replace it.
          </p>
        </div>
      )}

      {/* PDF-specific fields */}
      {item.type === 'pdf' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">PDF URL or File</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="Link to PDF document"
          />
          <div className="mt-2 flex items-center gap-3">
            <input type="file" accept="application/pdf,.pdf" disabled={uploading} onChange={handleFileUpload} className={fileInputClassName} />
            {uploading ? <span className="shrink-0 text-xs text-on-surface-variant">Uploading...</span> : null}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Paste a link above, or upload a PDF document to replace it.
          </p>
        </div>
      )}

      {/* Link-specific fields */}
      {item.type === 'link' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">External URL</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="Full URL to external resource"
          />
        </div>
      )}

      {/* Text-specific fields */}
      {item.type === 'text' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson Content</label>
          <Textarea
            className="min-h-40"
            value={item.content ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                content: event.target.value,
              }))
            }
            placeholder="Write the full lesson content here."
          />
        </div>
      )}

      {/* Exam-specific fields */}
      {item.type === 'exam' && (
        <>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Format</label>
            <Select
              value={item.examFormat ?? 'text'}
              onChange={(event) => {
                const examFormat = event.target.value as ExamFormat;
                updateResource(moduleId, sectionId, item.id, (resource) => ({
                  ...resource,
                  examFormat,
                  questions: resource.questions
                    ? applyFormatToQuestions(resource.questions, examFormat)
                    : resource.questions,
                }));
              }}
              options={[
                { label: 'Text-Based (Short Answer)', value: 'text' },
                { label: 'Multiple Choice', value: 'multiple-choice' },
              ]}
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Instructions</label>
            <Textarea
              className="min-h-32"
              value={item.content ?? ''}
              onChange={(event) =>
                updateResource(moduleId, sectionId, item.id, (resource) => ({
                  ...resource,
                  content: event.target.value,
                }))
              }
              placeholder="Explain the exam rules, time limits, and instructions."
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Number of Questions</label>
              <Input
                type="number"
                min={1}
                value={item.questions?.length ? item.questions.length : (item.questionCount ?? 0)}
                disabled={Boolean(item.questions?.length)}
                onChange={(event) =>
                  updateResource(moduleId, sectionId, item.id, (resource) => ({
                    ...resource,
                    questionCount: Number(event.target.value || 0),
                  }))
                }
              />
              {item.questions?.length ? (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Managed by the question configuration below.
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={item.passingScore ?? 0}
                onChange={(event) =>
                  updateResource(moduleId, sectionId, item.id, (resource) => ({
                    ...resource,
                    passingScore: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
          </div>

          <ExamQuestionsEditor
            format={item.examFormat ?? 'text'}
            questions={item.questions ?? []}
            onChange={(questions) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                questions: questions.length > 0 ? questions : undefined,
                questionCount: questions.length > 0 ? questions.length : resource.questionCount,
              }))
            }
          />
        </>
      )}
    </div>
  );
}

export function LearningResourcesConfigBuilder({ view, moduleId, sectionId }: BuilderProps) {
  const router = useRouter();
  const {
    config,
    setConfig,
    loading,
    saving,
    resetting,
    error,
    success,
    setError,
    setSuccess,
    fetchConfig,
    saveConfig,
    resetConfig,
    autoSaveConfig,
    uploadFile,
  } = useLearningResourcesConfig();

  const [showModuleForm, setShowModuleForm] = React.useState(false);
  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [showSectionForm, setShowSectionForm] = React.useState(false);
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [moduleDraft, setModuleDraft] = React.useState({
    title: '',
    summary: '',
    requiredHours: '10',
    minimumHoursForCertification: '',
  });
  const [sectionDraft, setSectionDraft] = React.useState({ title: '', description: '' });
  const [itemDraft, setItemDraft] = React.useState({
    title: '',
    type: 'video' as ResourceType,
    duration: '',
    description: '',
    url: '',
    content: '',
    questionCount: '10',
    passingScore: '70',
    examFormat: 'text' as 'text' | 'multiple-choice',
  });
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);
  const [itemSource, setItemSource] = React.useState<'url' | 'upload'>('url');
  const [itemFile, setItemFile] = React.useState<File | null>(null);
  const [uploadingItem, setUploadingItem] = React.useState(false);
  const [examQuestions, setExamQuestions] = React.useState<ExamQuestion[]>([]);

  const selectedModule = config?.modules.find((module) => module.id === moduleId) ?? null;
  const selectedSection = selectedModule?.sections.find((section) => section.id === sectionId) ?? null;

  const selectedItem = React.useMemo(() => {
    if (!selectedSection) {
      return null;
    }

    return (
      selectedSection.resources.find((resource) => resource.id === selectedItemId) ??
      selectedSection.resources[0] ??
      null
    );
  }, [selectedItemId, selectedSection]);

  React.useEffect(() => {
    if (!selectedSection?.resources.length) {
      setSelectedItemId(null);
      return;
    }

    if (!selectedItemId || !selectedSection.resources.some((resource) => resource.id === selectedItemId)) {
      setSelectedItemId(selectedSection.resources[0].id);
    }
  }, [selectedItemId, selectedSection]);

  const updateModule = React.useCallback(
    (targetModuleId: string, updater: (module: LearningModule) => LearningModule) => {
      setConfig((current) =>
        current
          ? {
              ...current,
              modules: current.modules.map((module) =>
                module.id === targetModuleId ? updater(module) : module,
              ),
            }
          : current,
      );
    },
    [setConfig],
  );

  const updateSection = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      updater: (section: LearningSection) => LearningSection,
    ) => {
      updateModule(targetModuleId, (module) => ({
        ...module,
        sections: module.sections.map((section) =>
          section.id === targetSectionId ? updater(section) : section,
        ),
      }));
    },
    [updateModule],
  );

  const updateResource = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      targetResourceId: string,
      updater: (resource: LearningResource) => LearningResource,
    ) => {
      updateSection(targetModuleId, targetSectionId, (section) => ({
        ...section,
        resources: section.resources.map((resource) =>
          resource.id === targetResourceId ? updater(resource) : resource,
        ),
      }));
    },
    [updateSection],
  );

  if (loading) {
    return (
      <AdminShell title="Learning Management Config" subtitle="Loading module and section configuration.">
        <div className="p-8 text-center">Loading learning management configuration...</div>
      </AdminShell>
    );
  }

  if (!config) {
    return (
      <AdminShell
        title="Learning Management Config"
        subtitle="Module and section authoring."
        topActions={
          <PageToolbar
            onRefresh={() => void fetchConfig()}
            onReset={() => void resetConfig()}
            onSave={() => void saveConfig()}
            resetting={resetting}
            saving={saving}
          />
        }
      >
        <ConfigBanner error={error} success={success} />
      </AdminShell>
    );
  }

  if (view === 'module-detail' && !selectedModule) {
    return (
      <AdminShell title="Module Not Found" subtitle="Return to the module list to choose another module.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'section-detail' && (!selectedModule || !selectedSection)) {
    return (
      <AdminShell title="Section Not Found" subtitle="Return to the module list to choose another section.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'modules') {
    const sortedModules = [...config.modules].sort((a, b) => a.order - b.order);

    const rows: ModuleRow[] = sortedModules.map((module) => ({
      id: module.id,
      title: module.title,
      requiredHours: module.requiredHours,
      sections: module.sections.length,
      items: getItemCount(module),
    }));

    const columns: DataTableColumn<ModuleRow>[] = [
      { id: 'title', header: 'Module', accessorKey: 'title' },
      { id: 'requiredHours', header: 'Hours', accessorKey: 'requiredHours' },
      { id: 'sections', header: 'Sections', accessorKey: 'sections' },
      { id: 'items', header: 'Items', accessorKey: 'items' },
    ];

    return (
      <AdminShell
        title="Learning Management Config"
        subtitle="Start with the module list, then open one module to manage its sections."
        topActions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowModuleForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Module
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />
          <DeleteConfirmModal state={deleteConfirm} onCancel={() => setDeleteConfirm(null)} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Modules</p>
                <IconBook2 className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">{config.modules.length}</p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Sections</p>
                <IconHierarchy3 className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
                {config.modules.reduce((sum, module) => sum + module.sections.length, 0)}
              </p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Learning Items</p>
                <IconClipboardText className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
                {config.modules.reduce((sum, module) => sum + getItemCount(module), 0)}
              </p>
            </div>
          </div>

          {showModuleForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">
                    {editingModuleId ? 'Edit Module' : 'Create Module'}
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {editingModuleId
                      ? 'Update module details, order, and certification requirements.'
                      : 'Add the module first, then open it to create sections inside it.'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowModuleForm(false);
                    setEditingModuleId(null);
                    setModuleDraft({ title: '', summary: '', requiredHours: '10', minimumHoursForCertification: '' });
                  }}
                >
                  Close
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title *</label>
                  <Input
                    value={moduleDraft.title}
                    onChange={(event) =>
                      setModuleDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="e.g., Foundation of Patient Care"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours *</label>
                  <Input
                    type="number"
                    min={1}
                    value={moduleDraft.requiredHours}
                    onChange={(event) =>
                      setModuleDraft((current) => ({ ...current, requiredHours: event.target.value }))
                    }
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Module Order</label>
                  <Input
                    type="number"
                    min={0}
                    value={
                      editingModuleId
                        ? (config?.modules.find((m) => m.id === editingModuleId)?.order ?? 0)
                        : config?.modules.length ?? 0
                    }
                    disabled
                  />
                  <p className="mt-1 text-xs text-on-surface-variant">Auto-assigned based on creation order</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">
                    Min Hours for Certification
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={moduleDraft.minimumHoursForCertification}
                    onChange={(event) =>
                      setModuleDraft((current) => ({
                        ...current,
                        minimumHoursForCertification: event.target.value,
                      }))
                    }
                    placeholder="Leave blank if no requirement"
                  />
                  <p className="mt-1 text-xs text-on-surface-variant">Hours before certification is unlocked</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Summary *</label>
                <Textarea
                  className="min-h-24"
                  value={moduleDraft.summary}
                  onChange={(event) =>
                    setModuleDraft((current) => ({ ...current, summary: event.target.value }))
                  }
                  placeholder="Describe what students will learn in this module"
                />
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => {
                    const title = moduleDraft.title.trim();
                    const summary = moduleDraft.summary.trim();
                    const requiredHours = Number(moduleDraft.requiredHours);
                    const minimumHours = moduleDraft.minimumHoursForCertification
                      ? Number(moduleDraft.minimumHoursForCertification)
                      : undefined;

                    if (!title || !summary || requiredHours <= 0) {
                      setError('Module title, summary, and required hours are required.');
                      return;
                    }

                    if (editingModuleId) {
                      const updatedConfig = {
                        ...config,
                        modules: config.modules.map((m) =>
                          m.id === editingModuleId
                            ? {
                                ...m,
                                title,
                                summary,
                                requiredHours,
                                minimumHoursForCertification: minimumHours,
                              }
                            : m,
                        ),
                      };

                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                      setEditingModuleId(null);
                    } else {
                      const id = slugify(title);

                      if (config.modules.some((module) => module.id === id)) {
                        setError('A module with this title already exists. Please use a different title.');
                        return;
                      }

                      const nextOrder = Math.max(...config.modules.map((m) => m.order), -1) + 1;

                      const updatedConfig = {
                        ...config,
                        modules: [
                          ...config.modules,
                          {
                            id,
                            title,
                            summary,
                            requiredHours,
                            order: nextOrder,
                            minimumHoursForCertification: minimumHours,
                            sections: [],
                          },
                        ],
                      };

                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                    }
                    setModuleDraft({ title: '', summary: '', requiredHours: '10', minimumHoursForCertification: '' });
                    setShowModuleForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  {editingModuleId ? 'Update Module' : 'Create Module'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5">
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Modules</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Click a module row to open its detail page and manage sections.
              </p>
            </div>

            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.id}
              onRowClick={(row) => router.push(getModuleHref(row.id))}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${row.sections} sections • ${row.items} items`}
              rowActions={(row) => {
                const module = config.modules.find((m) => m.id === row.id);
                return (
                  <div className="flex items-center gap-1">
                    <RowIconButton
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (module) {
                          setModuleDraft({
                            title: module.title,
                            summary: module.summary,
                            requiredHours: String(module.requiredHours),
                            minimumHoursForCertification: String(
                              module.minimumHoursForCertification ?? '',
                            ),
                          });
                          setEditingModuleId(module.id);
                          setShowModuleForm(true);
                        }
                      }}
                    >
                      <IconEdit className="size-4" />
                    </RowIconButton>
                    <Link href={getModuleHref(row.id)} onClick={(e) => e.stopPropagation()}>
                      <RowIconButton title="Open">
                        <IconEye className="size-4" />
                      </RowIconButton>
                    </Link>
                    <RowIconButton
                      title="Delete"
                      destructive
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          title: 'Delete Module?',
                          description: `"${row.title}" and all its sections will be permanently removed.`,
                          confirmLabel: 'Delete Module',
                          onConfirm: () => {
                            const updatedConfig = {
                              ...config,
                              modules: config.modules
                                .filter((m) => m.id !== row.id)
                                .sort((a, b) => a.order - b.order)
                                .map((m, index) => ({ ...m, order: index })),
                            };
                            setConfig(updatedConfig);
                            autoSaveConfig(updatedConfig);
                          },
                        });
                      }}
                    >
                      <IconTrash className="size-4" />
                    </RowIconButton>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (view === 'module-detail' && selectedModule) {
    const sectionRows: SectionRow[] = selectedModule.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      items: section.resources.length,
    }));

    const columns: DataTableColumn<SectionRow>[] = [
      { id: 'title', header: 'Section', accessorKey: 'title' },
      { id: 'description', header: 'Description', accessorKey: 'description' },
      { id: 'items', header: 'Items', accessorKey: 'items' },
    ];

    return (
      <AdminShell
        title={selectedModule.title}
        subtitle="Manage this module and the sections inside it."
        topActions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowSectionForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Section
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />
          <DeleteConfirmModal state={deleteConfirm} onCancel={() => setDeleteConfirm(null)} />

          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link href="/admin/configurations/learning-resources" className="hover:text-primary">
              Modules
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-on-surface">{selectedModule.title}</span>
          </div>

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <Badge variant="primary">Module Detail</Badge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Edit the module here, then open a section to manage its content items.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteConfirm({
                    title: 'Delete Module?',
                    description: `"${selectedModule.title}" and all its sections will be permanently removed.`,
                    confirmLabel: 'Delete Module',
                    onConfirm: () => {
                      const updatedConfig = {
                        ...config,
                        modules: config.modules
                          .filter((module) => module.id !== selectedModule.id)
                          .sort((a, b) => a.order - b.order)
                          .map((m, index) => ({ ...m, order: index })),
                      };
                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                      router.push('/admin/configurations/learning-resources');
                    },
                  });
                }}
              >
                <IconTrash className="size-4" />
                Remove Module
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title</label>
                <Input
                  value={selectedModule.title}
                  onChange={(event) =>
                    updateModule(selectedModule.id, (module) => ({
                      ...module,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours</label>
                <Input
                  type="number"
                  min={1}
                  value={selectedModule.requiredHours}
                  onChange={(event) =>
                    updateModule(selectedModule.id, (module) => ({
                      ...module,
                      requiredHours: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Module Order</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={selectedModule.order}
                    disabled
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={selectedModule.order === 0}
                    onClick={() => {
                      const previousModule = config.modules.find((m) => m.order === selectedModule.order - 1);
                      if (previousModule) {
                        updateModule(selectedModule.id, (m) => ({
                          ...m,
                          order: m.order - 1,
                        }));
                        updateModule(previousModule.id, (m) => ({
                          ...m,
                          order: m.order + 1,
                        }));
                      }
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={selectedModule.order === config.modules.length - 1}
                    onClick={() => {
                      const nextModule = config.modules.find((m) => m.order === selectedModule.order + 1);
                      if (nextModule) {
                        updateModule(selectedModule.id, (m) => ({
                          ...m,
                          order: m.order + 1,
                        }));
                        updateModule(nextModule.id, (m) => ({
                          ...m,
                          order: m.order - 1,
                        }));
                      }
                    }}
                  >
                    ↓
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">
                  Min Hours for Certification
                </label>
                <Input
                  type="number"
                  min={0}
                  value={selectedModule.minimumHoursForCertification ?? ''}
                  onChange={(event) =>
                    updateModule(selectedModule.id, (module) => ({
                      ...module,
                      minimumHoursForCertification: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="Leave blank if no requirement"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-on-surface">Summary</label>
              <Textarea
                className="min-h-24"
                value={selectedModule.summary}
                onChange={(event) =>
                  updateModule(selectedModule.id, (module) => ({
                    ...module,
                    summary: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {showSectionForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">Create Section</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Add sections under <strong>{selectedModule.title}</strong>.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowSectionForm(false)}>
                  Close
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Section Title</label>
                  <Input
                    value={sectionDraft.title}
                    onChange={(event) =>
                      setSectionDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Module</label>
                  <Input value={selectedModule.title} disabled />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
                <Textarea
                  className="min-h-24"
                  value={sectionDraft.description}
                  onChange={(event) =>
                    setSectionDraft((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => {
                    const title = sectionDraft.title.trim();
                    const id = slugify(title);

                    if (!title) {
                      setError('Section title is required.');
                      return;
                    }

                    if (editingSectionId) {
                      const updatedConfig = {
                        ...config,
                        modules: config.modules.map((m) =>
                          m.id === selectedModule.id
                            ? {
                                ...m,
                                sections: m.sections.map((s) =>
                                  s.id === editingSectionId
                                    ? {
                                        ...s,
                                        title,
                                        description: sectionDraft.description.trim(),
                                      }
                                    : s,
                                ),
                              }
                            : m,
                        ),
                      };
                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                      setEditingSectionId(null);
                    } else {
                      if (selectedModule.sections.some((section) => section.id === id)) {
                        setError('A section with this title already exists in this module.');
                        return;
                      }

                      const updatedConfig = {
                        ...config,
                        modules: config.modules.map((m) =>
                          m.id === selectedModule.id
                            ? {
                                ...m,
                                sections: [
                                  ...m.sections,
                                  {
                                    id,
                                    title,
                                    description: sectionDraft.description.trim(),
                                    resources: [],
                                  },
                                ],
                              }
                            : m,
                        ),
                      };
                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                    }
                    setSectionDraft({ title: '', description: '' });
                    setShowSectionForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  {editingSectionId ? 'Update Section' : 'Create Section'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface">Sections</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Open a section to manage the full curriculum items inside it.
                </p>
              </div>
              <Badge variant="info">{selectedModule.sections.length} sections</Badge>
            </div>

            <DataTable
              columns={columns}
              data={sectionRows}
              getRowId={(row) => row.id}
              onRowClick={(row) => router.push(getSectionHref(selectedModule.id, row.id))}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${row.items} items`}
              rowActions={(row) => {
                const section = selectedModule.sections.find((s) => s.id === row.id);
                return (
                  <div className="flex items-center gap-1">
                    <RowIconButton
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (section) {
                          setSectionDraft({
                            title: section.title,
                            description: section.description,
                          });
                          setEditingSectionId(section.id);
                          setShowSectionForm(true);
                        }
                      }}
                    >
                      <IconEdit className="size-4" />
                    </RowIconButton>
                    <Link href={getSectionHref(selectedModule.id, row.id)} onClick={(e) => e.stopPropagation()}>
                      <RowIconButton title="Open">
                        <IconEye className="size-4" />
                      </RowIconButton>
                    </Link>
                    <RowIconButton
                      title="Delete"
                      destructive
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          title: 'Delete Section?',
                          description: `"${row.title}" and all its items will be permanently removed.`,
                          confirmLabel: 'Delete Section',
                          onConfirm: () => {
                            updateModule(selectedModule.id, (module) => ({
                              ...module,
                              sections: module.sections.filter((s) => s.id !== row.id),
                            }));
                          },
                        });
                      }}
                    >
                      <IconTrash className="size-4" />
                    </RowIconButton>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (view === 'section-detail' && selectedModule && selectedSection) {
    const itemRows: ResourceRow[] = selectedSection.resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: resource.type,
      duration: resource.duration,
    }));

    const columns: DataTableColumn<ResourceRow>[] = [
      { id: 'title', header: 'Learning Item', accessorKey: 'title' },
      {
        id: 'type',
        header: 'Type',
        cell: (row) => (
          <Badge variant={row.type === 'exam' ? 'warning' : 'info'}>{resourceTypeLabels[row.type]}</Badge>
        ),
      },
      { id: 'duration', header: 'Duration', accessorKey: 'duration' },
    ];

    return (
      <AdminShell
        title={selectedSection.title}
        subtitle="Manage this section and all its learning items."
        topActions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowItemForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Item
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />
          <DeleteConfirmModal state={deleteConfirm} onCancel={() => setDeleteConfirm(null)} />

          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link href="/admin/configurations/learning-resources" className="hover:text-primary">
              Modules
            </Link>
            <IconChevronRight className="size-4" />
            <Link href={getModuleHref(selectedModule.id)} className="hover:text-primary">
              {selectedModule.title}
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-on-surface">{selectedSection.title}</span>
          </div>

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <Badge variant="primary">Section Detail</Badge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Update the section details here, then click an item below to edit it.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeleteConfirm({
                    title: 'Delete Section?',
                    description: `"${selectedSection.title}" and all its items will be permanently removed.`,
                    confirmLabel: 'Delete Section',
                    onConfirm: () => {
                      const updatedConfig = {
                        ...config,
                        modules: config.modules.map((m) =>
                          m.id === selectedModule.id
                            ? {
                                ...m,
                                sections: m.sections.filter((section) => section.id !== selectedSection.id),
                              }
                            : m,
                        ),
                      };
                      setConfig(updatedConfig);
                      autoSaveConfig(updatedConfig);
                      router.push(getModuleHref(selectedModule.id));
                    },
                  });
                }}
              >
                <IconTrash className="size-4" />
                Remove Section
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Section Title</label>
                <Input
                  value={selectedSection.title}
                  onChange={(event) =>
                    updateSection(selectedModule.id, selectedSection.id, (section) => ({
                      ...section,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Module</label>
                <Input value={selectedModule.title} disabled />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
              <Textarea
                className="min-h-24"
                value={selectedSection.description}
                onChange={(event) =>
                  updateSection(selectedModule.id, selectedSection.id, (section) => ({
                    ...section,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {showItemForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">Create Learning Item</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Select the type of content to add to <strong>{selectedSection.title}</strong>.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowItemForm(false)}>
                  Close
                </Button>
              </div>

              {/* Basic Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Title</label>
                  <Input
                    value={itemDraft.title}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="e.g., Module Overview Video"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Content Type *</label>
                  <Select
                    value={itemDraft.type}
                    onChange={(event) => {
                      const newType = event.target.value as ResourceType;
                      setItemDraft((current) => ({
                        ...current,
                        type: newType,
                        url: '',
                        content: '',
                      }));
                      setItemSource('url');
                      setItemFile(null);
                      setExamQuestions(
                        newType === 'exam'
                          ? resizeExamQuestions([], Math.max(1, Number(itemDraft.questionCount) || 0), itemDraft.examFormat)
                          : [],
                      );
                    }}
                    options={resourceTypeOptions}
                  />
                </div>
              </div>

              {/* Type-specific content */}
              {itemDraft.type === 'video' && (
                <>
                  <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                    Upload a video file (MP4, WebM) or paste a YouTube/Vimeo URL.
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Video Source *</label>
                      <Select
                        value={itemSource}
                        onChange={(event) => {
                          setItemSource(event.target.value as 'url' | 'upload');
                          setItemFile(null);
                        }}
                        options={sourceModeOptions}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                      <Input
                        value={itemDraft.duration}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, duration: event.target.value }))
                        }
                        placeholder="e.g., 15 min, 1 hr 20 min"
                      />
                    </div>
                  </div>
                  {itemSource === 'url' ? (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Video URL</label>
                      <Input
                        value={itemDraft.url}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, url: event.target.value }))
                        }
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Video File *</label>
                      <input
                        type="file"
                        accept="video/*"
                        className={fileInputClassName}
                        onChange={(event) => setItemFile(event.target.files?.[0] ?? null)}
                      />
                      {itemFile ? (
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Selected: {itemFile.name} ({formatFileSize(itemFile.size)})
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-on-surface-variant">MP4, WebM, and other video formats.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {itemDraft.type === 'pdf' && (
                <>
                  <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                    Upload a PDF document or provide a link to a PDF file.
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">PDF Source *</label>
                      <Select
                        value={itemSource}
                        onChange={(event) => {
                          setItemSource(event.target.value as 'url' | 'upload');
                          setItemFile(null);
                        }}
                        options={sourceModeOptions}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                      <Input
                        value={itemDraft.duration}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, duration: event.target.value }))
                        }
                        placeholder="e.g., 12 pages, 30 min read"
                      />
                    </div>
                  </div>
                  {itemSource === 'url' ? (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-on-surface">PDF URL</label>
                      <Input
                        value={itemDraft.url}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, url: event.target.value }))
                        }
                        placeholder="https://example.com/document.pdf"
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-on-surface">PDF File *</label>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className={fileInputClassName}
                        onChange={(event) => setItemFile(event.target.files?.[0] ?? null)}
                      />
                      {itemFile ? (
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Selected: {itemFile.name} ({formatFileSize(itemFile.size)})
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-on-surface-variant">PDF documents only.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {itemDraft.type === 'link' && (
                <>
                  <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                    Link to external resources like documentation, articles, or reference materials.
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">External URL *</label>
                      <Input
                        value={itemDraft.url}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, url: event.target.value }))
                        }
                        placeholder="https://example.com/article"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                      <Input
                        value={itemDraft.duration}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, duration: event.target.value }))
                        }
                        placeholder="e.g., 15 min, varies"
                      />
                    </div>
                  </div>
                </>
              )}

              {itemDraft.type === 'text' && (
                <>
                  <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                    Write a lesson, guide, or instructional content directly in the system.
                  </div>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                    <Input
                      value={itemDraft.duration}
                      onChange={(event) =>
                        setItemDraft((current) => ({ ...current, duration: event.target.value }))
                      }
                      placeholder="e.g., 10 min read, 20 min"
                    />
                  </div>
                </>
              )}

              {itemDraft.type === 'exam' && (
                <>
                  <div className="mt-4 rounded-[14px] border border-warning/20 bg-warning/5 p-3 text-sm text-on-surface">
                    Create an assessment. Choose between text-based short answer or multiple choice format.
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Format *</label>
                      <Select
                        value={itemDraft.examFormat}
                        onChange={(event) => {
                          const examFormat = event.target.value as ExamFormat;
                          setItemDraft((current) => ({ ...current, examFormat }));
                          setExamQuestions((current) => applyFormatToQuestions(current, examFormat));
                        }}
                        options={[
                          { label: 'Text-Based (Short Answer)', value: 'text' },
                          { label: 'Multiple Choice', value: 'multiple-choice' },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                      <Input
                        value={itemDraft.duration}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, duration: event.target.value }))
                        }
                        placeholder="e.g., 30 minutes, 1 hour"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Number of Questions *</label>
                      <Input
                        type="number"
                        min={1}
                        value={itemDraft.questionCount}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setItemDraft((current) => ({ ...current, questionCount: raw }));
                          const count = Math.max(0, Math.min(100, Math.floor(Number(raw) || 0)));
                          setExamQuestions((current) =>
                            resizeExamQuestions(current, count, itemDraft.examFormat),
                          );
                        }}
                        placeholder="e.g., 20"
                      />
                      <p className="mt-1 text-xs text-on-surface-variant">
                        A configuration card is created for each question below.
                      </p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score (%) *</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={itemDraft.passingScore}
                        onChange={(event) =>
                          setItemDraft((current) => ({ ...current, passingScore: event.target.value }))
                        }
                        placeholder="e.g., 70"
                      />
                    </div>
                  </div>

                  <ExamQuestionsEditor
                    format={itemDraft.examFormat}
                    questions={examQuestions}
                    onChange={(questions) => {
                      setExamQuestions(questions);
                      setItemDraft((current) => ({ ...current, questionCount: String(questions.length) }));
                    }}
                  />
                </>
              )}

              {/* Description - always shown */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
                <Textarea
                  className="min-h-20"
                  value={itemDraft.description}
                  onChange={(event) =>
                    setItemDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="What is this content about? Who should complete it?"
                />
              </div>

              {/* Content - for text and exam */}
              {['text', 'exam'].includes(itemDraft.type) && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">
                    {itemDraft.type === 'text' ? 'Lesson Content *' : 'Exam Instructions *'}
                  </label>
                  <Textarea
                    className="min-h-40"
                    value={itemDraft.content}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, content: event.target.value }))
                    }
                    placeholder={
                      itemDraft.type === 'text'
                        ? 'Write your lesson content here. Include all instructional materials and examples.'
                        : 'Add exam instructions, rules, or any guidance students should know before starting.'
                    }
                  />
                </div>
              )}

              <div className="mt-6">
                <Button
                  disabled={uploadingItem}
                  onClick={async () => {
                    const title = itemDraft.title.trim();
                    const duration = itemDraft.duration.trim();
                    const id = slugify(title);

                    if (!title || !duration) {
                      setError('Item title and duration are required.');
                      return;
                    }

                    if (itemDraft.type === 'link' && !itemDraft.url.trim()) {
                      setError('Link items require a URL.');
                      return;
                    }

                    if (
                      ['video', 'pdf'].includes(itemDraft.type) &&
                      itemSource === 'upload' &&
                      !itemFile
                    ) {
                      setError('Choose a file to upload, or switch the source to a link.');
                      return;
                    }

                    if (itemDraft.type === 'text' && !itemDraft.content.trim()) {
                      setError('Text lessons require content.');
                      return;
                    }

                    if (itemDraft.type === 'exam') {
                      if (!itemDraft.content.trim()) {
                        setError('Exams require instructions.');
                        return;
                      }
                      if (examQuestions.length === 0) {
                        setError('Exam must have at least 1 question.');
                        return;
                      }

                      for (let i = 0; i < examQuestions.length; i++) {
                        const question = examQuestions[i];

                        if (!question.prompt.trim()) {
                          setError(`Question ${i + 1} needs a prompt.`);
                          return;
                        }
                        if (!Number.isFinite(question.points) || question.points <= 0) {
                          setError(`Question ${i + 1} needs marks greater than zero.`);
                          return;
                        }
                        if (itemDraft.examFormat === 'multiple-choice') {
                          const filledOptions = (question.options ?? []).filter((option) => option.trim());
                          if (filledOptions.length < 2) {
                            setError(`Question ${i + 1} needs at least two options.`);
                            return;
                          }
                          if (
                            question.correctOption === undefined ||
                            !(question.options ?? [])[question.correctOption]?.trim()
                          ) {
                            setError(`Question ${i + 1} needs a correct answer selected.`);
                            return;
                          }
                        }
                      }
                    }

                    if (selectedSection.resources.some((resource) => resource.id === id)) {
                      setError('An item with this title already exists in this section.');
                      return;
                    }

                    let resourceUrl = itemDraft.url.trim();

                    if (['video', 'pdf'].includes(itemDraft.type) && itemSource === 'upload' && itemFile) {
                      try {
                        setUploadingItem(true);
                        setError(null);
                        resourceUrl = await uploadFile(itemFile);
                      } catch (uploadError) {
                        setError(
                          uploadError instanceof Error ? uploadError.message : 'Failed to upload file.',
                        );
                        return;
                      } finally {
                        setUploadingItem(false);
                      }
                    }

                    const builtQuestions: ExamQuestion[] | undefined =
                      itemDraft.type === 'exam'
                        ? examQuestions.map((question, i) => {
                            if (itemDraft.examFormat === 'multiple-choice') {
                              const filled = (question.options ?? [])
                                .map((option, idx) => ({ text: option.trim(), idx }))
                                .filter((option) => option.text);
                              return {
                                id: `${id}-q${i + 1}`,
                                prompt: question.prompt.trim(),
                                points: question.points,
                                options: filled.map((option) => option.text),
                                correctOption: filled.findIndex(
                                  (option) => option.idx === question.correctOption,
                                ),
                              };
                            }
                            return {
                              id: `${id}-q${i + 1}`,
                              prompt: question.prompt.trim(),
                              points: question.points,
                              expectedAnswer: question.expectedAnswer?.trim() || undefined,
                            };
                          })
                        : undefined;

                    const item: LearningResource = {
                      id,
                      title,
                      type: itemDraft.type,
                      duration,
                      description: itemDraft.description.trim(),
                      url: ['video', 'pdf', 'link'].includes(itemDraft.type)
                        ? resourceUrl || undefined
                        : undefined,
                      content: ['text', 'exam'].includes(itemDraft.type)
                        ? itemDraft.content.trim() || undefined
                        : undefined,
                      questionCount: itemDraft.type === 'exam' ? builtQuestions?.length : undefined,
                      passingScore: itemDraft.type === 'exam' ? Number(itemDraft.passingScore || 0) : undefined,
                      examFormat: itemDraft.type === 'exam' ? itemDraft.examFormat : undefined,
                      questions: builtQuestions,
                    };

                    const updatedConfig = {
                      ...config,
                      modules: config.modules.map((m) =>
                        m.id === selectedModule.id
                          ? {
                              ...m,
                              sections: m.sections.map((s) =>
                                s.id === selectedSection.id
                                  ? {
                                      ...s,
                                      resources: [...s.resources, item],
                                    }
                                  : s,
                              ),
                            }
                          : m,
                      ),
                    };

                    setConfig(updatedConfig);
                    autoSaveConfig(updatedConfig);
                    setSelectedItemId(id);
                    setItemDraft({
                      title: '',
                      type: 'video',
                      duration: '',
                      description: '',
                      url: '',
                      content: '',
                      questionCount: '10',
                      passingScore: '70',
                      examFormat: 'text',
                    });
                    setItemSource('url');
                    setItemFile(null);
                    setExamQuestions([]);
                    setShowItemForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  {uploadingItem ? 'Uploading...' : 'Create Item'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface">Section Items</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Select a row to open that item&apos;s editor below.
                </p>
              </div>
              <Badge variant="info">{selectedSection.resources.length} items</Badge>
            </div>

            <DataTable
              columns={columns}
              data={itemRows}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedItemId(row.id)}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${resourceTypeLabels[row.type]} • ${row.duration}`}
              rowActions={(row) => {
                const item = selectedSection.resources.find((r) => r.id === row.id);
                return (
                  <div className="flex items-center gap-1">
                    <RowIconButton
                      title="Edit"
                      active={selectedItemId === row.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(row.id);
                      }}
                    >
                      <IconEdit className="size-4" />
                    </RowIconButton>
                    <RowIconButton
                      title="Delete"
                      destructive
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!item) {
                          return;
                        }
                        setDeleteConfirm({
                          title: 'Delete Item?',
                          description: `"${item.title}" will be permanently removed from this section.`,
                          confirmLabel: 'Delete Item',
                          onConfirm: () => {
                            const updatedConfig = {
                              ...config,
                              modules: config.modules.map((m) =>
                                m.id === selectedModule.id
                                  ? {
                                      ...m,
                                      sections: m.sections.map((s) =>
                                        s.id === selectedSection.id
                                          ? {
                                              ...s,
                                              resources: s.resources.filter((r) => r.id !== row.id),
                                            }
                                          : s,
                                      ),
                                    }
                                  : m,
                              ),
                            };

                            setConfig(updatedConfig);
                            autoSaveConfig(updatedConfig);
                            if (selectedItemId === row.id) {
                              setSelectedItemId(null);
                            }
                          },
                        });
                      }}
                    >
                      <IconTrash className="size-4" />
                    </RowIconButton>
                  </div>
                );
              }}
            />
          </div>

          {selectedItem ? (
            <SectionItemEditor
              item={selectedItem}
              moduleId={selectedModule.id}
              sectionId={selectedSection.id}
              updateResource={updateResource}
              onUploadFile={uploadFile}
              onError={setError}
              removeResource={(resourceId) => {
                const resource = selectedSection.resources.find((r) => r.id === resourceId);
                setDeleteConfirm({
                  title: 'Delete Item?',
                  description: `"${resource?.title ?? resourceId}" will be permanently removed from this section.`,
                  confirmLabel: 'Delete Item',
                  onConfirm: () => {
                    const updatedConfig = {
                      ...config,
                      modules: config.modules.map((m) =>
                        m.id === selectedModule.id
                          ? {
                              ...m,
                              sections: m.sections.map((s) =>
                                s.id === selectedSection.id
                                  ? {
                                      ...s,
                                      resources: s.resources.filter((r) => r.id !== resourceId),
                                    }
                                  : s,
                              ),
                            }
                          : m,
                      ),
                    };

                    setConfig(updatedConfig);
                    autoSaveConfig(updatedConfig);
                  },
                });
              }}
            />
          ) : (
            <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-8 text-center text-sm text-on-surface-variant">
              No items yet. Add your first learning item to start building this section.
            </div>
          )}
        </div>
      </AdminShell>
    );
  }

  return null;
}
