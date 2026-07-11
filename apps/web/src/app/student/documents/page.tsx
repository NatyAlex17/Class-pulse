'use client';

import * as React from 'react';
import {
  IconCertificate2,
  IconFileUpload,
  IconFingerprint,
  IconIdBadge2,
  IconRosetteDiscountCheck,
  IconSchool,
  IconShieldCheck,
} from '@tabler/icons-react';
import {
  StudentCertificateModal,
  type StudentCertificatePreview,
} from '@/components/student/student-certificate-modal';
import { DocumentPreviewModal } from '@/components/ui/document-preview-modal';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'certifications', label: 'Certifications' },
  { id: 'documents', label: 'Documents' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function iconForDocument(documentId: string) {
  if (documentId === 'photoId') return IconIdBadge2;
  if (documentId === 'diploma') return IconSchool;
  return IconFingerprint;
}

export default function StudentDocumentsPage() {
  const {
    profile,
    modules,
    moduleCertificatesReady,
    programCertificateReady,
    exitSurveyComplete,
    completeExitSurvey,
    readinessUploads,
    documentChecklist,
    uploadReadinessDocument,
    lastAction,
  } = useStudentDemo();

  const [activeTab, setActiveTab] = React.useState<TabId>('certifications');
  const [activeCertificate, setActiveCertificate] =
    React.useState<StudentCertificatePreview | null>(null);
  const [previewDocument, setPreviewDocument] = React.useState<{ title: string; fileUrl: string } | null>(null);
  const [uploadingDocumentId, setUploadingDocumentId] = React.useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = React.useState<Record<string, string>>({});
  const readinessFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingUploadDocumentIdRef = React.useRef<string | null>(null);

  const issueDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const studentName = profile.fullName || profile.preferredName || 'Student';

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

  return (
    <>
      <StudentShell
        title="Documents Center"
        patternedCanvas
        stickyFooter={
          <div className="sticky bottom-16 z-30 border-t border-border-subtle bg-surface/80 px-4 py-4 backdrop-blur-md lg:bottom-0 lg:px-8">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <IconShieldCheck className="size-5 text-info" />
                <p>Student records, document actions, and certificate gates are backed by the student API.</p>
              </div>
              <span className="font-mono text-[11px]">Last action: {lastAction}</span>
            </div>
          </div>
        }
      >
        <div className="mb-8 flex gap-8 border-b border-border-subtle">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'border-b-2 px-1 py-4 text-sm font-semibold transition',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'certifications' ? (
          <section className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
            <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-on-surface">Completion Credentials</h3>
                  <p className="text-sm text-on-surface-variant">
                    Module certificates respond to completed progress. Program certificate responds to final conditions.
                  </p>
                </div>
                <IconRosetteDiscountCheck className="size-8 text-outline opacity-30" />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {modules.map((module) => (
                  <div key={module.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                        <IconCertificate2 className="size-7" />
                      </div>
                      <Badge variant={module.certificateUnlocked ? 'success' : 'neutral'}>
                        {module.certificateUnlocked ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>
                    <h4 className="font-display text-[18px] font-semibold text-on-surface">{module.title}</h4>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {module.certificateUnlocked
                        ? `Certificate ready after ${module.examScore ?? 'exam completion'}.`
                        : 'Pass the module exam to unlock the completion certificate.'}
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4 rounded-[12px]"
                      disabled={!module.certificateUnlocked}
                      onClick={() =>
                        setActiveCertificate({
                          title: `${module.title} Certificate`,
                          subtitle: 'Module Achievement Award',
                          studentName,
                          awardLine:
                            'has successfully completed the required module learning and assessment',
                          scoreLine: module.examScore
                            ? `Assessment result: ${module.examScore}`
                            : 'Assessment result pending',
                          footerNote: `${module.completedHours}/${module.requiredHours} required hours completed`,
                          unlocked: module.certificateUnlocked,
                          issueDate,
                        })
                      }
                    >
                      View Certificate
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
                <h4 className="font-display text-[18px] font-semibold text-on-surface">Program Certificate Gate</h4>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {programCertificateReady
                    ? 'All completion conditions are satisfied. Program certificate is ready.'
                    : 'This stays locked until every module is complete, financials are settled, and the exit survey is done.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="rounded-[12px]"
                    onClick={completeExitSurvey}
                    disabled={exitSurveyComplete}
                  >
                    {exitSurveyComplete ? 'Exit Survey Complete' : 'Complete Exit Survey'}
                  </Button>
                  <Button
                    className="rounded-[12px]"
                    disabled={!programCertificateReady}
                    onClick={() =>
                      setActiveCertificate({
                        title: 'Program Completion Certificate',
                        subtitle: 'Healthcare Training Program',
                        studentName,
                        awardLine:
                          'has successfully completed all theory, clinical, and administrative requirements',
                        scoreLine:
                          'Final review passed, financial standing cleared, and graduation release approved',
                        footerNote: `Module certificates ready: ${moduleCertificatesReady}/${modules.length}`,
                        unlocked: programCertificateReady,
                        issueDate,
                      })
                    }
                  >
                    View Program Certificate
                  </Button>
                </div>
                <p className="mt-4 text-[12px] text-on-surface-variant">
                  Module certificates ready: {moduleCertificatesReady} / {modules.length}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <div className="mb-6 flex items-center gap-2">
              <IconFileUpload className="size-5 text-primary" />
              <div>
                <h3 className="font-display text-[22px] font-semibold text-on-surface">Onboarding Documents</h3>
                <p className="text-sm text-on-surface-variant">
                  Identification and educational verification documents submitted during onboarding.
                </p>
              </div>
            </div>

            {documentChecklist.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No documents are configured for onboarding yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  const Icon = iconForDocument(document.id);
                  return (
                    <div
                      key={document.id}
                      className="group rounded-[18px] border border-border-subtle bg-surface-muted p-5 transition hover:shadow-sm"
                    >
                      <div className="mb-6 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 transition group-hover:bg-primary group-hover:text-white">
                          <Icon className="size-5" />
                        </div>
                        <Badge variant={complete ? 'success' : document.required ? 'warning' : 'neutral'}>
                          {complete ? 'Verified' : document.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <h5 className="font-display text-[16px] font-semibold text-on-surface">{document.name}</h5>
                      <p className="mb-4 mt-1 text-[12px] text-on-surface-variant">{document.description}</p>
                      {uploadError ? <p className="mb-3 text-[12px] text-error">{uploadError}</p> : null}
                      <div className="flex items-center gap-2">
                        {complete && document.fileUrl ? (
                          <button
                            className="text-[12px] font-semibold text-primary hover:underline"
                            onClick={() =>
                              setPreviewDocument({
                                title: document.fileName ?? document.name,
                                fileUrl: document.fileUrl as string,
                              })
                            }
                          >
                            View Document
                          </button>
                        ) : null}
                        {complete && document.fileUrl ? <span className="text-outline-variant">/</span> : null}
                        <button
                          className="text-[12px] font-semibold text-primary hover:underline disabled:opacity-50"
                          disabled={isUploading}
                          onClick={() => handleRequestDocumentUpload(document.id)}
                        >
                          {isUploading ? 'Uploading...' : complete ? 'Update' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </StudentShell>

      <StudentCertificateModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />

      {previewDocument ? (
        <DocumentPreviewModal
          title={previewDocument.title}
          fileUrl={previewDocument.fileUrl}
          onClose={() => setPreviewDocument(null)}
        />
      ) : null}
    </>
  );
}
