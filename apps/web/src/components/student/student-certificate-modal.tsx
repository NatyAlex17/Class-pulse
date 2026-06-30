'use client';

import * as React from 'react';
import {
  IconDownload,
  IconRosetteDiscountCheck,
  IconX,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type StudentCertificatePreview = {
  title: string;
  subtitle: string;
  studentName: string;
  awardLine: string;
  scoreLine: string;
  footerNote: string;
  unlocked: boolean;
  issueDate: string;
};

type StudentCertificateModalProps = {
  certificate: StudentCertificatePreview | null;
  onClose: () => void;
};

function buildPrintableCertificateHtml(certificate: StudentCertificatePreview) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${certificate.title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background: #f6f8fb;
      color: #1b2e52;
    }
    .page {
      width: 1200px;
      max-width: 100%;
      margin: 24px auto;
      background: white;
      display: grid;
      grid-template-columns: 300px 1fr;
      min-height: 860px;
      box-shadow: 0 24px 60px rgba(18, 40, 84, 0.14);
    }
    .sidebar {
      background: linear-gradient(180deg, #0f2c5c, #1a4b93, #2c73d2);
      color: white;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 999px;
      font: 700 12px/1.2 Arial, sans-serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: rgba(255,255,255,0.12);
    }
    .content {
      padding: 48px;
      background: linear-gradient(180deg, #fffdfa, #fffaf1);
      border: 2px solid #d6b26e;
      margin: 28px;
      position: relative;
    }
    .eyebrow {
      font: 700 12px/1.4 Arial, sans-serif;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #9a7b42;
      text-align: center;
    }
    h1 {
      margin: 24px 0 0;
      text-align: center;
      font-size: 56px;
      line-height: 1;
    }
    h2 {
      margin: 28px 0 0;
      text-align: center;
      font-size: 48px;
      font-style: italic;
      font-weight: 600;
      color: #13315c;
    }
    .divider {
      width: 160px;
      height: 1px;
      background: #d6b26e;
      margin: 24px auto 0;
    }
    .copy {
      max-width: 720px;
      margin: 32px auto 0;
      text-align: center;
      font-size: 20px;
      line-height: 1.8;
      color: #42506b;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 48px;
    }
    .card {
      border: 1px solid #eadbb8;
      background: rgba(255,255,255,0.82);
      border-radius: 18px;
      padding: 20px;
    }
    .card-label {
      font: 700 11px/1.4 Arial, sans-serif;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #8b6d35;
    }
    .card-copy {
      margin-top: 12px;
      font-size: 16px;
      line-height: 1.7;
      color: #42506b;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 88px;
    }
    .line {
      border-top: 1px solid #cbb178;
      padding-top: 12px;
      font-family: Arial, sans-serif;
      color: #6b7280;
      font-size: 14px;
    }
    .line strong {
      display: block;
      margin-bottom: 4px;
      color: #1b2e52;
      font-size: 14px;
    }
    @media print {
      body {
        background: white;
      }
      .page {
        margin: 0;
        width: 100%;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div>
        <div class="badge">Class Verse</div>
        <h3 style="margin: 28px 0 0; font: 700 34px/1.1 Georgia, serif;">Official Student Credential</h3>
        <p style="margin-top: 18px; font: 400 14px/1.8 Arial, sans-serif; color: rgba(255,255,255,0.82);">
          This certificate preview is rendered as a real HTML document so it can be reviewed and exported as PDF in the student workflow.
        </p>
      </div>
      <div>
        <div class="badge">${certificate.unlocked ? 'Ready To Export' : 'Locked'}</div>
        <p style="margin-top: 18px; font: 600 18px/1.4 Arial, sans-serif;">${certificate.studentName}</p>
      </div>
    </aside>
    <section class="content">
      <div class="eyebrow">Certificate Of Completion</div>
      <h1>${certificate.subtitle}</h1>
      <div class="divider"></div>
      <div class="eyebrow" style="margin-top: 34px;">Presented To</div>
      <h2>${certificate.studentName}</h2>
      <p class="copy">
        This certifies that the above student ${certificate.awardLine} within the Class Verse training environment.
      </p>
      <div class="grid">
        <div class="card">
          <div class="card-label">Completion Detail</div>
          <div class="card-copy">${certificate.scoreLine}</div>
        </div>
        <div class="card">
          <div class="card-label">Academic Record</div>
          <div class="card-copy">${certificate.footerNote}</div>
        </div>
      </div>
      <div class="signatures">
        <div class="line">
          <strong>Program Director</strong>
          Class Verse Academic Operations
        </div>
        <div class="line">
          <strong>Date of Issue</strong>
          ${certificate.issueDate}
        </div>
      </div>
    </section>
  </div>
</body>
</html>`;
}

export function StudentCertificateModal({
  certificate,
  onClose,
}: StudentCertificateModalProps) {
  if (!certificate) {
    return null;
  }

  const handleExport = () => {
    if (!certificate.unlocked) {
      return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1280,height=920');
    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildPrintableCertificateHtml(certificate));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
              Certificate Preview
            </p>
            <h2 className="mt-1 font-display text-[26px] font-bold tracking-[-0.02em] text-primary">
              {certificate.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="rounded-[14px]"
              disabled={!certificate.unlocked}
              onClick={handleExport}
            >
              <IconDownload className="size-4" />
              Export PDF
            </Button>
            <button
              onClick={onClose}
              className="rounded-full border border-border-subtle p-2 text-on-surface-variant transition hover:bg-surface-muted hover:text-on-surface"
            >
              <IconX className="size-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(94vh-80px)] overflow-y-auto bg-[linear-gradient(180deg,#f4f7fb,#eef3f8)] p-6">
          <div className="mx-auto grid min-h-[820px] max-w-5xl overflow-hidden rounded-[28px] border border-[#d8e0ea] bg-white shadow-[0_28px_80px_rgba(18,40,84,0.14)] lg:grid-cols-[0.28fr_0.72fr]">
            <aside className="bg-[linear-gradient(180deg,#0f2c5c,#1a4b93,#2c73d2)] p-8 text-white">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/15 bg-white/10">
                    <IconRosetteDiscountCheck className="size-8" />
                  </div>
                  <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
                    Class Verse
                  </p>
                  <h3 className="mt-3 font-display text-[30px] font-bold tracking-[-0.02em]">
                    Official Student Credential
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/80">
                    This certificate is rendered as a polished HTML document and can be exported to
                    PDF directly from the student portal walkthrough.
                  </p>
                </div>

                <div className="space-y-4">
                  <Badge variant={certificate.unlocked ? 'success' : 'warning'}>
                    {certificate.unlocked ? 'Ready To Export' : 'Locked'}
                  </Badge>
                  <div className="rounded-[18px] border border-white/10 bg-white/10 p-4 text-sm text-white/80">
                    <p>Issued for demo student:</p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {certificate.studentName}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="relative overflow-hidden p-8 sm:p-12">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-success/5 blur-2xl" />

              <div className="relative z-10 flex h-full flex-col rounded-[28px] border-2 border-[#d6b26e] bg-[linear-gradient(180deg,#fffdfa,#fffaf1)] p-8 sm:p-12">
                <div className="text-center">
                  <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#9a7b42]">
                    Certificate Of Completion
                  </p>
                  <h3 className="mt-5 font-display text-[40px] font-bold tracking-[-0.03em] text-[#1b2e52] sm:text-[56px]">
                    {certificate.subtitle}
                  </h3>
                  <div className="mx-auto mt-6 h-px w-40 bg-[#d6b26e]" />
                  <p className="mt-8 text-sm uppercase tracking-[0.24em] text-[#7c869c]">
                    Presented To
                  </p>
                  <h4 className="mt-4 font-display text-[36px] font-semibold italic text-[#13315c] sm:text-[48px]">
                    {certificate.studentName}
                  </h4>
                  <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#42506b] sm:text-[18px]">
                    This certifies that the above student {certificate.awardLine} within the Class
                    Verse training environment.
                  </p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-[#eadbb8] bg-white/80 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8b6d35]">
                      Completion Detail
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#42506b]">
                      {certificate.scoreLine}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-[#eadbb8] bg-white/80 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8b6d35]">
                      Academic Record
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#42506b]">
                      {certificate.footerNote}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-14">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div>
                      <div className="h-px w-full bg-[#cbb178]" />
                      <p className="mt-3 text-sm font-semibold text-[#1b2e52]">
                        Program Director
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        Class Verse Academic Operations
                      </p>
                    </div>
                    <div>
                      <div className="h-px w-full bg-[#cbb178]" />
                      <p className="mt-3 text-sm font-semibold text-[#1b2e52]">
                        Date of Issue
                      </p>
                      <p className="text-sm text-[#6b7280]">{certificate.issueDate}</p>
                    </div>
                  </div>

                  {!certificate.unlocked ? (
                    <div className="mt-10 rounded-[20px] border border-warning/20 bg-warning/5 p-5 text-sm text-[#7a5e21]">
                      This certificate is not yet released. Complete the remaining student
                      conditions before exporting the final PDF.
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
