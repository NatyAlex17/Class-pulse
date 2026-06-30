'use client';

import * as React from 'react';
import {
  IconBook2,
  IconCertificate2,
  IconDownload,
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
import { useStudentDemo } from '@/components/student/student-demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';

const programDocuments = [
  { title: 'Program Handbook', meta: 'Updated Sep 2023 / 2.4 MB' },
  { title: 'Code of Conduct', meta: 'Updated Aug 2023 / 1.1 MB' },
  { title: 'Clinical Placement Agreement', meta: 'Updated Jan 2024 / 4.8 MB' },
];

export default function StudentDocumentsPage() {
  const {
    uploads,
    modules,
    textbookOpened,
    moduleCertificatesReady,
    programCertificateReady,
    exitSurveyComplete,
    issueTextbook,
    completeExitSurvey,
    uploadDocument,
    replaceDocument,
    lastAction,
  } = useStudentDemo();
  const [preview, setPreview] = React.useState('Textbook preview is ready. Open a resource to show its static viewer state.');
  const [activeCertificate, setActiveCertificate] =
    React.useState<StudentCertificatePreview | null>(null);

  const issueDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  return (
    <>
      <StudentShell
        title="Documents Center"
        patternedCanvas
        topActions={
          <Button className="hidden rounded-[12px] md:inline-flex" onClick={uploadDocument}>
            Add Demo Upload
          </Button>
        }
        stickyFooter={
          <div className="sticky bottom-16 z-30 border-t border-border-subtle bg-surface/80 px-4 py-4 backdrop-blur-md lg:bottom-0 lg:px-8">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <IconShieldCheck className="size-5 text-info" />
                <p>All student records remain local demo state while still behaving like a working portal.</p>
              </div>
              <span className="font-mono text-[11px]">Last action: {lastAction}</span>
            </div>
          </div>
        }
      >
        <section className="mb-12 grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
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
                      studentName: 'Amara Singh',
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
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <IconBook2 className="size-5" />
              </div>
              <div>
                <h4 className="font-display text-[18px] font-semibold text-on-surface">Digital Textbook</h4>
                <p className="text-sm text-on-surface-variant">
                  {textbookOpened ? 'Opened and logged' : 'Issued and ready'}
                </p>
              </div>
            </div>
            <Button className="w-full rounded-[14px]" onClick={() => {
              issueTextbook();
              setPreview('Digital textbook preview opened. The student access event has been logged in local state.');
            }}>
              Open Textbook Demo
            </Button>
          </div>

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
                    studentName: 'Amara Singh',
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

          <div className="rounded-[18px] border border-border-subtle bg-surface p-6">
            <h4 className="font-display text-[18px] font-semibold text-on-surface">Preview Panel</h4>
            <div className="mt-4 rounded-[16px] border border-dashed border-outline-variant bg-surface-muted p-4 text-sm text-on-surface-variant">
              {preview}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6">
          <h3 className="font-display text-[22px] font-semibold text-on-surface">Program Documents</h3>
          <p className="text-sm text-on-surface-variant">
            Essential policies and agreements for your current enrollment.
          </p>
        </div>
        <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-surface">
          <div className="divide-y divide-border-subtle">
            {programDocuments.map((document) => (
              <button
                key={document.title}
                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-surface-muted"
                onClick={() => setPreview(`${document.title} opened in the static PDF viewer.`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-error-container/20">
                    <IconDownload className="size-5 text-error" />
                  </div>
                  <div>
                    <h5 className="text-base font-semibold text-on-surface">{document.title}</h5>
                    <p className="text-[12px] text-on-surface-variant">{document.meta}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">Preview</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Your Uploads</h3>
            <p className="text-sm text-on-surface-variant">
              Identification and educational verification documents you have submitted.
            </p>
          </div>
          <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-primary" onClick={uploadDocument}>
            <IconFileUpload className="size-4" />
            Upload New
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((upload) => {
            const Icon =
              upload.title === 'Photo ID'
                ? IconIdBadge2
                : upload.title === 'High School Diploma'
                  ? IconSchool
                  : IconFingerprint;
            return (
              <div key={upload.id} className="group rounded-[18px] border border-border-subtle bg-surface p-5 transition hover:shadow-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={upload.status === 'Verified' ? 'success' : 'warning'}>
                      {upload.status}
                    </Badge>
                    <span className="font-mono text-[10px] text-on-surface-variant">{upload.date}</span>
                  </div>
                </div>
                <h5 className="font-display text-[16px] font-semibold text-on-surface">{upload.title}</h5>
                <p className="mb-4 mt-1 text-[12px] text-on-surface-variant">{upload.subtitle}</p>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-primary">
                  <button className="hover:underline" onClick={() => setPreview(`${upload.title} opened in the secure demo viewer.`)}>
                    View Document
                  </button>
                  <span className="text-outline-variant">/</span>
                  <button className="hover:underline" onClick={() => replaceDocument(upload.id)}>
                    Replace
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </StudentShell>

      <StudentCertificateModal
        certificate={activeCertificate}
        onClose={() => setActiveCertificate(null)}
      />
    </>
  );
}
