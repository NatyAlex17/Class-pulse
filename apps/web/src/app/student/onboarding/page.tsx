'use client';

import * as React from 'react';
import {
  IconCircleCheckFilled,
  IconClipboardCheck,
  IconFileUpload,
  IconShieldCheck,
} from '@tabler/icons-react';
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function StudentOnboardingPage() {
  const {
    onboardingQuestions,
    onboardingSubmitted,
    onboardingProgressPercent,
    workflowStage,
    portalUnlocked,
    acknowledgements,
    readinessUploads,
    documentChecklist,
    answerOnboardingQuestion,
    toggleAcknowledgement,
    uploadReadinessDocument,
    submitOnboardingPackage,
  } = useStudentDemo();

  const [uploadingDocumentId, setUploadingDocumentId] = React.useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = React.useState<Record<string, string>>({});
  const readinessFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingUploadDocumentIdRef = React.useRef<string | null>(null);
  const [previewDocument, setPreviewDocument] = React.useState<{ title: string; fileUrl: string } | null>(null);

  const handleRequestDocumentUpload = (documentId: string) => {
    pendingUploadDocumentIdRef.current = documentId;
    readinessFileInputRef.current?.click();
  };

  const handleDocumentFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const documentId = pendingUploadDocumentIdRef.current;
    event.target.value = '';
    if (!file || !documentId) return;

    setUploadErrors((current) => {
      const next = { ...current };
      delete next[documentId];
      return next;
    });
    setUploadingDocumentId(documentId);
    try {
      await uploadReadinessDocument(documentId, file);
    } catch (err) {
      setUploadErrors((current) => ({
        ...current,
        [documentId]: err instanceof Error ? err.message : 'Failed to upload document.',
      }));
    } finally {
      setUploadingDocumentId(null);
    }
  };

  const requiredDocuments = documentChecklist.filter((document) => document.required);
  const allQuestionsAnswered = onboardingQuestions.every((question) => question.answer.trim());
  const allChecksComplete =
    Object.values(acknowledgements).every(Boolean) &&
    requiredDocuments.every((document) => readinessUploads[document.id]);
  const readyToSubmit = allQuestionsAnswered && allChecksComplete;
  const readinessChecksTotal = Object.keys(acknowledgements).length + documentChecklist.length;
  const readinessChecksComplete =
    Object.values(acknowledgements).filter(Boolean).length +
    documentChecklist.filter((document) => readinessUploads[document.id]).length;

  return (
    <StudentShell
      title="Onboarding Center"
      subtitle="Static data, real-feeling flow: intake questions, readiness checks, uploads, final submission, and the shared modal journey from exam to portal activation."
      patternedCanvas
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <div className="rounded-[20px] bg-primary p-6 text-white">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
              Student Intake
            </p>
            <h2 className="mt-2 font-display text-[30px] font-bold tracking-[-0.02em]">
              Readiness Tracker
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Admissions intake responses, acknowledgements, upload checkpoints, and submission
              gating are now persisted through the backend workflow.
            </p>
            <div className="mt-4">
              <Badge variant={portalUnlocked ? 'success' : 'warning'}>
                {portalUnlocked
                  ? 'Portal active'
                  : `Workflow stage: ${workflowStage.replaceAll('_', ' ')}`}
              </Badge>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface/15">
              <div className="h-full rounded-full bg-surface" style={{ width: `${onboardingProgressPercent}%` }} />
            </div>
            <p className="mt-3 text-sm text-white/80">{onboardingProgressPercent}% complete</p>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconShieldCheck className="size-5 text-primary" />
              <h3 className="font-display text-[18px] font-semibold text-on-surface">Acknowledgements</h3>
            </div>
            <div className="space-y-3">
              {[
                ['schedule', 'I can commit to the class and clinical schedule.'],
                ['attendance', 'I understand attendance, make-up, and withdrawal expectations.'],
                ['technology', 'I have reliable device and internet access for online study.'],
              ].map(([key, label]) => {
                const checked = acknowledgements[key as keyof typeof acknowledgements];
                return (
                  <button
                    key={key}
                    onClick={() => toggleAcknowledgement(key as keyof typeof acknowledgements)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-[16px] border p-4 text-left transition',
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
                    <span className="text-sm text-on-surface">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <IconFileUpload className="size-5 text-primary" />
              <h3 className="font-display text-[18px] font-semibold text-on-surface">Upload Checkpoints</h3>
            </div>
            {documentChecklist.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No documents are configured for onboarding yet.</p>
            ) : (
              <div className="space-y-3">
                <input
                  ref={readinessFileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleDocumentFileSelected}
                />
                {documentChecklist.map((document) => {
                  const complete = Boolean(readinessUploads[document.id]);
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
                        {uploadError ? (
                          <p className="mt-1 text-[12px] text-error">{uploadError}</p>
                        ) : null}
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
                          disabled={isUploading}
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
              <h2 className="font-display text-[28px] font-bold tracking-[-0.02em] text-on-surface">
                Student Onboarding Application
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Each answer updates the student record so the dashboard, documents, and readiness views stay aligned.
              </p>
            </div>
            <Badge variant={onboardingSubmitted ? 'success' : 'info'}>
              {onboardingSubmitted ? 'Submitted' : 'Draft'}
            </Badge>
          </div>

          <div className="space-y-6">
            {onboardingQuestions.map((question, index) => (
              <div key={question.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                    Step {index + 1}
                  </span>
                  {question.answer.trim() ? <Badge variant="success">Saved</Badge> : <Badge variant="neutral">Awaiting response</Badge>}
                </div>
                <p className="mb-4 text-base font-semibold text-on-surface">{question.prompt}</p>
                <Textarea
                  value={question.answer}
                  onChange={(event) => answerOnboardingQuestion(question.id, event.target.value)}
                  placeholder="Write a thoughtful answer..."
                />
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
                  {onboardingQuestions.filter((question) => question.answer.trim()).length}/{onboardingQuestions.length}
                </p>
              </div>
              <div className="rounded-[16px] bg-surface p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-on-surface-variant">Readiness checks</p>
                <p className="mt-2 font-mono text-[28px] font-semibold text-primary">
                  {readinessChecksComplete}/{readinessChecksTotal}
                </p>
              </div>
            </div>
            <Button
              className="mt-5 rounded-[14px]"
              disabled={!readyToSubmit}
              onClick={submitOnboardingPackage}
            >
              {onboardingSubmitted ? 'Submission Saved' : 'Submit Onboarding Package'}
            </Button>
            {!readyToSubmit ? (
              <p className="mt-3 text-sm text-on-surface-variant">
                Finish all answers and readiness checks to unlock submission.
              </p>
            ) : null}
          </div>
        </section>
      </div>
      {previewDocument ? (
        <DocumentPreviewModal
          title={previewDocument.title}
          fileUrl={previewDocument.fileUrl}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </StudentShell>
  );
}
