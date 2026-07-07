'use client';

import * as React from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconCircleCheckFilled,
  IconClipboardCheck,
  IconClockPause,
  IconFileUpload,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface OnboardingQuestionOption {
  label: string;
  value: string;
}

interface OnboardingQuestion {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  options: OnboardingQuestionOption[];
  answer: string;
}

interface DocumentChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  fileUrl?: string;
}

interface AvailableModule {
  id: string;
  title: string;
  summary: string;
}

interface OnboardingSnapshot {
  questions: OnboardingQuestion[];
  readinessUploads: Record<string, boolean>;
  agreedToTerms: boolean;
  selectedModuleIds: string[];
  submitted: boolean;
  documentChecklist: DocumentChecklistItem[];
  availableModules: AvailableModule[];
  workflowStage: 'onboarding' | 'admin_review' | 'active' | 'rejected';
  rejectionReason?: string;
}

const STAGES: Array<{ id: OnboardingSnapshot['workflowStage'] | 'active'; label: string }> = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'admin_review', label: 'Admin Review' },
  { id: 'active', label: 'Active' },
];

type InstructorIntakeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InstructorIntakeModal({ open, onClose }: InstructorIntakeModalProps) {
  const { session, syncedUser, signOut } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [onboarding, setOnboarding] = React.useState<OnboardingSnapshot | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingDocumentId, setUploadingDocumentId] = React.useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = React.useState<Record<string, string>>({});
  const readinessFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingUploadDocumentIdRef = React.useRef<string | null>(null);
  const [previewDocument, setPreviewDocument] = React.useState<{ title: string; fileUrl: string } | null>(null);

  const fetchOnboarding = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your onboarding status.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/onboarding`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch onboarding (${response.status}).`);
      }

      const data = await response.json();
      setOnboarding(data.data);
    } catch (err) {
      setOnboarding(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch onboarding.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    if (!open) return;
    void fetchOnboarding();
  }, [fetchOnboarding, open]);

  const patch = React.useCallback(
    async (path: string, body?: unknown) => {
      if (!instructorId || !accessToken) return;
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}${path}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Request failed (${response.status}).`);
      }

      const data = await response.json();
      setOnboarding((current) => (current ? { ...current, ...data.data } : current));
    },
    [accessToken, instructorId],
  );

  const handleAnswerChange = (questionId: string, answer: string) => {
    setOnboarding((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) =>
              question.id === questionId ? { ...question, answer } : question,
            ),
          }
        : current,
    );
  };

  const canEditOnboarding = () => Boolean(onboarding) && onboarding?.workflowStage === 'onboarding' && !submitting;

  const handleAnswerBlur = async (questionId: string, answer: string) => {
    if (!answer.trim() || !canEditOnboarding()) return;
    try {
      await patch(`/onboarding/questions/${questionId}`, { answer });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer.');
    }
  };

  const handleChoiceSelect = async (questionId: string, value: string) => {
    if (!canEditOnboarding()) return;
    handleAnswerChange(questionId, value);
    try {
      await patch(`/onboarding/questions/${questionId}`, { answer: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer.');
    }
  };

  const handleToggleAgreement = async () => {
    if (!onboarding || !canEditOnboarding()) return;
    try {
      await patch('/onboarding/agreement', { agreedToTerms: !onboarding.agreedToTerms });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agreement.');
    }
  };

  const handleToggleModule = async (moduleId: string) => {
    if (!onboarding || !canEditOnboarding()) return;
    const selected = new Set(onboarding.selectedModuleIds);
    if (selected.has(moduleId)) {
      selected.delete(moduleId);
    } else {
      selected.add(moduleId);
    }
    try {
      await patch('/onboarding/modules', { moduleIds: Array.from(selected) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module selection.');
    }
  };

  const handleRequestDocumentUpload = (documentId: string) => {
    if (!canEditOnboarding()) return;
    pendingUploadDocumentIdRef.current = documentId;
    readinessFileInputRef.current?.click();
  };

  const handleDocumentFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const documentId = pendingUploadDocumentIdRef.current;
    event.target.value = '';
    if (!file || !documentId || !instructorId || !accessToken || !canEditOnboarding()) return;

    setUploadErrors((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
    setUploadingDocumentId(documentId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/onboarding/documents/${documentId}/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to upload document (${response.status}).`);
      }

      const data = await response.json();
      setOnboarding((current) => (current ? { ...current, ...data.data } : current));
    } catch (err) {
      setUploadErrors((current) => ({
        ...current,
        [documentId]: err instanceof Error ? err.message : 'Failed to upload document.',
      }));
    } finally {
      setUploadingDocumentId(null);
    }
  };

  const handleSubmit = async () => {
    if (!instructorId || !accessToken) return;
    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/onboarding/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to submit onboarding (${response.status}).`);
      }

      const data = await response.json();
      setOnboarding((current) => (current ? { ...current, ...data.data } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Best-effort sign-out; nothing else to do if it fails.
    }
  };

  if (!open) {
    return null;
  }

  const workflowStage = onboarding?.workflowStage;
  const canClose = workflowStage === 'active';
  const stageIndex = workflowStage
    ? Math.max(STAGES.findIndex((stage) => stage.id === workflowStage), 0)
    : 0;

  const requiredDocuments = onboarding?.documentChecklist.filter((document) => document.required) ?? [];
  const allQuestionsAnswered = onboarding?.questions.every((question) => question.answer.trim()) ?? false;
  const readinessComplete = requiredDocuments.every(
    (document) => onboarding?.readinessUploads[document.id],
  );
  const hasSelectedModules = (onboarding?.selectedModuleIds.length ?? 0) > 0;
  const readyToSubmit =
    allQuestionsAnswered && readinessComplete && Boolean(onboarding?.agreedToTerms) && hasSelectedModules;
  const isEditable = workflowStage === 'onboarding' && !submitting;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-surface shadow-2xl">
        <div className="shrink-0 flex items-start justify-between gap-6 border-b border-border-subtle bg-primary px-6 py-5 text-white sm:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/75">
              Instructor Intake
            </p>
            <h2 className="mt-1 font-display text-[28px] font-bold tracking-[-0.02em]">
              Instructor Onboarding
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Complete your onboarding profile, upload required documents, and select the modules you&apos;d like to
              teach.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={!canClose}
            className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-surface/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title={!canClose ? 'Complete all steps to close' : 'Close'}
          >
            <IconX className="size-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border-subtle bg-surface-low px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                    index <= stageIndex ? 'bg-primary text-white' : 'bg-surface text-on-surface-variant',
                  )}
                >
                  {index < stageIndex ? <IconCheck className="size-4" /> : index + 1}
                </div>
                <span className="text-sm font-semibold text-on-surface">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>

        {workflowStage === 'admin_review' ? (
          <div className="shrink-0 border-b border-warning/20 bg-warning/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconClockPause className="size-5 text-warning mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Application Under Review</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Your onboarding has been submitted and is pending admin approval. You will be allowed to use the
                  portal once approved.
                </p>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="mt-3">
                  Logout & Check Back Later
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {workflowStage === 'rejected' ? (
          <div className="shrink-0 border-b border-error/20 bg-error/5 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="size-5 text-error mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-on-surface text-sm">Application Rejected</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {onboarding?.rejectionReason || 'Your onboarding application was rejected. Please contact support for more information.'}
                </p>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="mt-3">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {error ? (
            <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
          ) : null}

          {loading ? (
            <div className="py-8 text-center text-on-surface-variant">Loading onboarding...</div>
          ) : !onboarding ? (
            <div className="py-8 text-center text-on-surface-variant">Unable to load onboarding.</div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <section className="space-y-6">
                <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <IconShieldCheck className="size-5 text-primary" />
                    <h3 className="font-display text-[18px] font-semibold text-on-surface">Terms and Conditions</h3>
                  </div>
                  <button
                    onClick={handleToggleAgreement}
                    disabled={!isEditable}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition disabled:cursor-not-allowed',
                      onboarding.agreedToTerms
                        ? 'border-success/20 bg-success/5'
                        : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                    )}
                  >
                    {onboarding.agreedToTerms ? (
                      <IconCircleCheckFilled className="mt-0.5 size-5 shrink-0 text-success" />
                    ) : (
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-outline-variant" />
                    )}
                    <span className="text-sm text-on-surface">
                      I agree to the instructor terms of service, code of conduct, and clinical supervision policy.
                    </span>
                  </button>
                </div>

                <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <IconClipboardCheck className="size-5 text-primary" />
                    <h3 className="font-display text-[18px] font-semibold text-on-surface">Modules You&apos;d Like to Teach</h3>
                  </div>
                  {onboarding.availableModules.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No curriculum modules are configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {onboarding.availableModules.map((module) => {
                        const checked = onboarding.selectedModuleIds.includes(module.id);
                        return (
                          <button
                            key={module.id}
                            onClick={() => handleToggleModule(module.id)}
                            disabled={!isEditable}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition disabled:cursor-not-allowed',
                              checked
                                ? 'border-success/20 bg-success/5'
                                : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                            )}
                          >
                            {checked ? (
                              <IconCircleCheckFilled className="mt-0.5 size-5 shrink-0 text-success" />
                            ) : (
                              <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-outline-variant" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{module.title}</p>
                              <p className="mt-1 text-[12px] text-on-surface-variant">{module.summary}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <IconFileUpload className="size-5 text-primary" />
                    <h3 className="font-display text-[18px] font-semibold text-on-surface">Upload Checkpoints</h3>
                  </div>
                  {onboarding.documentChecklist.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No documents are configured for instructor onboarding yet.</p>
                  ) : (
                    <div className="space-y-3">
                      <input
                        ref={readinessFileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleDocumentFileSelected}
                      />
                      {onboarding.documentChecklist.map((document) => {
                        const complete = Boolean(onboarding.readinessUploads[document.id]);
                        const isUploading = uploadingDocumentId === document.id;
                        const uploadError = uploadErrors[document.id];
                        return (
                          <div
                            key={document.id}
                            className="flex items-center justify-between gap-3 rounded-[16px] border border-border-subtle bg-surface-muted p-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-on-surface">{document.name}</p>
                                <Badge variant={document.required ? 'warning' : 'neutral'}>
                                  {document.required ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-[12px] text-on-surface-variant">{document.description}</p>
                              {uploadError ? <p className="mt-1 text-[12px] text-error">{uploadError}</p> : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {complete && document.fileUrl ? (
                                <Button
                                  variant="secondary"
                                  className="rounded-[12px]"
                                  onClick={() =>
                                    setPreviewDocument({
                                      title: document.fileName ?? document.name,
                                      fileUrl: document.fileUrl as string,
                                    })
                                  }
                                >
                                  View
                                </Button>
                              ) : null}
                              <Button
                                variant={complete ? 'secondary' : 'default'}
                                className="rounded-[12px]"
                                disabled={isUploading || !isEditable}
                                onClick={() => handleRequestDocumentUpload(document.id)}
                              >
                                {isUploading ? 'Uploading...' : complete ? 'Replace' : 'Upload'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[20px] border border-border-subtle bg-surface p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-on-surface">
                      Instructor Onboarding Application
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Each answer updates your onboarding record so the admin review queue stays aligned.
                    </p>
                  </div>
                  <Badge variant={onboarding.submitted ? 'success' : 'info'}>
                    {onboarding.submitted ? 'Submitted' : 'Draft'}
                  </Badge>
                </div>

                <div className="space-y-6">
                  {onboarding.questions.map((question, index) => (
                    <div key={question.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                          Question {index + 1}
                        </span>
                        {question.answer.trim() ? <Badge variant="success">Saved</Badge> : <Badge variant="neutral">Awaiting response</Badge>}
                      </div>
                      <p className="mb-4 text-base font-semibold text-on-surface">{question.prompt}</p>
                      {question.type === 'choice' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => void handleChoiceSelect(question.id, option.value)}
                              disabled={!isEditable}
                              className={cn(
                                'rounded-[16px] border p-4 text-left text-sm font-medium transition disabled:cursor-not-allowed',
                                question.answer === option.value
                                  ? 'border-primary bg-primary text-white shadow-md'
                                  : 'border-border-subtle bg-surface hover:border-primary hover:bg-primary/5',
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Textarea
                          value={question.answer}
                          onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                          onBlur={(event) => void handleAnswerBlur(question.id, event.target.value)}
                          placeholder={question.placeholder || 'Write a thoughtful answer...'}
                          disabled={!isEditable}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[18px] border border-primary/10 bg-surface-low p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <IconClipboardCheck className="size-5 text-primary" />
                    <h3 className="font-display text-[18px] font-semibold text-on-surface">Submission Summary</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[16px] bg-surface p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Questions</p>
                      <p className="mt-2 font-mono text-[28px] font-semibold text-primary">
                        {onboarding.questions.filter((question) => question.answer.trim()).length}/{onboarding.questions.length}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-surface p-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Modules selected</p>
                      <p className="mt-2 font-mono text-[28px] font-semibold text-primary">
                        {onboarding.selectedModuleIds.length}
                      </p>
                    </div>
                  </div>
                  {isEditable ? (
                    <Button className="mt-5 rounded-[14px]" disabled={!readyToSubmit || submitting} onClick={handleSubmit}>
                      {submitting ? 'Submitting...' : 'Submit for Admin Review'}
                    </Button>
                  ) : null}
                  {isEditable && !readyToSubmit ? (
                    <p className="mt-3 text-sm text-on-surface-variant">
                      Finish all answers, required uploads, the terms agreement, and at least one module selection to unlock submission.
                    </p>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {previewDocument ? (
        <DocumentPreviewModal
          title={previewDocument.title}
          fileUrl={previewDocument.fileUrl}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </div>
  );
}
