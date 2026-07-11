'use client';

import * as React from 'react';
import {
  IconCheck,
  IconFingerprint,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentCdphPaperForm } from '@/components/student/student-cdph-paper-form';
import { StudentShell } from '@/components/student/student-shell';

export default function StudentFormsPage() {
  const {
    liveScanGenerated,
    liveScanUploaded,
    cdphSigned,
    generateLiveScan,
    toggleLiveScanUpload,
  } = useStudentDemo();

  return (
    <StudentShell
      title="Forms & Applications"
      subtitle="Fill the required forms without digging through extra panels first."
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[16px] border border-border-subtle bg-surface px-4 py-3 text-sm">
        <span className="font-semibold text-on-surface">CDPH 283B is the main form below.</span>
        <span className="text-on-surface-variant">
          {liveScanGenerated && cdphSigned ? 'Both forms complete.' : liveScanGenerated || cdphSigned ? '1 of 2 complete.' : '2 forms pending.'}
        </span>
      </div>

      <StudentCdphPaperForm />

      <div className="mb-6">
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <IconFingerprint className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-[20px] font-semibold text-on-surface">Live Scan Request</h3>
                <p className="text-sm text-on-surface-variant">Background clearance form (BCIA 8016)</p>
              </div>
            </div>
            <Badge variant={liveScanGenerated && liveScanUploaded ? 'success' : liveScanGenerated ? 'info' : 'neutral'}>
              {liveScanGenerated && liveScanUploaded ? 'Submitted' : liveScanGenerated ? 'Generated' : 'Pending'}
            </Badge>
          </div>

          <div className="mb-6 rounded-[16px] border border-border-subtle bg-surface-muted p-4">
            <p className="text-sm leading-6 text-on-surface-variant">
              Generate your fingerprint request form, complete the Live Scan appointment, then mark it uploaded here.
            </p>
          </div>

          {!liveScanGenerated ? (
            <Button onClick={generateLiveScan} suppressHydrationWarning className="rounded-[14px]">
              Generate Form
            </Button>
          ) : !liveScanUploaded ? (
            <div className="space-y-3">
              <div className="rounded-[14px] border border-border-subtle bg-surface p-4 text-sm text-on-surface-variant">
                Your BCIA 8016 request has been generated. The CDPH application below is now shown in a paper-style layout to match the official form experience.
              </div>
              <Button onClick={toggleLiveScanUpload} suppressHydrationWarning className="rounded-[14px]">
                Mark as Uploaded
              </Button>
            </div>
          ) : (
            <div className="rounded-[14px] border border-success/30 bg-success/10 p-4">
              <div className="flex items-center gap-3">
                <IconCheck className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-on-surface">Form Submitted</p>
                  <p className="text-sm text-on-surface-variant">Your signed Live Scan form has been received</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </StudentShell>
  );
}
