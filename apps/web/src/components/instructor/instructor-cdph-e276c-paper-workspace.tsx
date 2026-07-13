'use client';

import * as React from 'react';
import { IconAlertCircle, IconCheck, IconDownload, IconFileText } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CdphTheoryTopic = {
  sectionId: string;
  label: string;
  hours: number | null;
  date: string | null;
  instructorInitials: string | null;
  testScore: number | null;
};

type CdphTheoryModule = {
  moduleId: string;
  moduleTitle: string;
  topics: CdphTheoryTopic[];
};

type CdphTheoryWorkspace = {
  studentId: string;
  studentName: string;
  header: {
    ssn: string;
    startDate: string;
    completionDate: string;
    instructorName: string;
  };
  finalGrade: string;
  modules: CdphTheoryModule[];
};

function PaperPage({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-stone-300 bg-[#fbfaf5] p-5 shadow-[0_18px_50px_rgba(28,25,23,0.12)]">
      {children}
      <div className="mt-5 flex items-center justify-between border-t border-stone-300 pt-3 text-[10px] text-stone-500">
        <span>CDPH E276C (12/19)</span>
        <span>California Department of Public Health</span>
      </div>
    </section>
  );
}

function PaperCell({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-stone-500 px-2 pb-2 pt-1 ${className ?? ''}`}>
      <p className="text-[10px] uppercase tracking-[0.08em] text-stone-600">{label}</p>
      {children ?? <p className="mt-2 text-[13px] text-stone-950">{value || '—'}</p>}
    </div>
  );
}

function TheoryTopicRow({
  topic,
  onSave,
}: {
  topic: CdphTheoryTopic;
  onSave: (payload: { hours?: number; date?: string; testScore?: number }) => void;
}) {
  const [hoursDraft, setHoursDraft] = React.useState(topic.hours != null ? String(topic.hours) : '');
  const [dateDraft, setDateDraft] = React.useState(topic.date ?? '');
  const [testScoreDraft, setTestScoreDraft] = React.useState(topic.testScore != null ? String(topic.testScore) : '');

  React.useEffect(() => {
    setHoursDraft(topic.hours != null ? String(topic.hours) : '');
    setDateDraft(topic.date ?? '');
    setTestScoreDraft(topic.testScore != null ? String(topic.testScore) : '');
  }, [topic.hours, topic.date, topic.testScore]);

  const commit = () => {
    onSave({
      hours: hoursDraft ? Number(hoursDraft) : undefined,
      date: dateDraft || undefined,
      testScore: testScoreDraft ? Number(testScoreDraft) : undefined,
    });
  };

  return (
    <tr className="border-b border-stone-300 align-top">
      <td className="px-2 py-2 text-[12px] text-stone-900">{topic.label}</td>
      <td className="px-2 py-2">
        <Input
          type="number"
          value={hoursDraft}
          onChange={(event) => setHoursDraft(event.target.value)}
          onBlur={commit}
          placeholder="Hours"
          className="h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={dateDraft}
          onChange={(event) => setDateDraft(event.target.value)}
          onBlur={commit}
          placeholder="MM/DD/YY"
          className="h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
        />
      </td>
      <td className="px-2 py-2 text-center text-[12px] text-stone-700">{topic.instructorInitials ?? '—'}</td>
      <td className="px-2 py-2">
        <Input
          type="number"
          value={testScoreDraft}
          onChange={(event) => setTestScoreDraft(event.target.value)}
          onBlur={commit}
          placeholder="Score"
          className="h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
        />
      </td>
    </tr>
  );
}

export function InstructorCdphE276CPaperWorkspace({
  workspace,
  finalGradeDraft,
  setFinalGradeDraft,
  headerDraft,
  setHeaderDraft,
  saveHeader,
  saveFinalGrade,
  downloadPdf,
  downloading,
  onSaveTopic,
  error,
}: {
  workspace: CdphTheoryWorkspace;
  finalGradeDraft: string;
  setFinalGradeDraft: (value: string) => void;
  headerDraft: CdphTheoryWorkspace['header'];
  setHeaderDraft: React.Dispatch<React.SetStateAction<CdphTheoryWorkspace['header']>>;
  saveHeader: (payload: Partial<CdphTheoryWorkspace['header']>) => Promise<void> | void;
  saveFinalGrade: () => Promise<void> | void;
  downloadPdf: () => Promise<void> | void;
  downloading: boolean;
  onSaveTopic: (moduleId: string, sectionId: string, payload: { hours?: number; date?: string; testScore?: number }) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-3">
      <section className="rounded-[20px] border border-border-subtle bg-surface p-4 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
              <IconFileText className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-[18px] font-semibold text-on-surface">CDPH E276C Theory Record</h3>
              <p className="text-sm text-on-surface-variant">Paper-style instructor worksheet matching the export format.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[140px]">
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant">Final Grade</label>
              <Input
                value={finalGradeDraft}
                onChange={(event) => setFinalGradeDraft(event.target.value)}
                onBlur={() => void saveFinalGrade()}
                placeholder="e.g. Pass"
                className="h-10 rounded-[12px]"
              />
            </div>
            <Button onClick={() => void downloadPdf()} disabled={downloading} variant="secondary" className="h-10 gap-2 rounded-[12px]">
              <IconDownload className="h-4 w-4" />
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
        {error ? (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-error/20 bg-error/5 p-3 text-sm text-error">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </section>

      <PaperPage>
        <div className="mb-4 flex items-start justify-between text-[11px] text-stone-600">
          <span>California Department of Public Health</span>
          <span>Instructor record worksheet</span>
        </div>

        <div className="text-center">
          <h2 className="text-[20px] font-bold tracking-[0.06em] text-stone-900">
            ONLINE NURSE ASSISTANT CERTIFICATION TRAINING PROGRAM INDIVIDUAL STUDENT RECORD
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-12 border border-stone-500">
          <PaperCell label="Student Name" value={workspace.studentName} className="col-span-7 border-l-0 border-t-0 border-b-0" />
          <PaperCell label="Social Security Number" className="col-span-5 border-r-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.ssn}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, ssn: event.target.value }))}
              onBlur={() => void saveHeader({ ssn: headerDraft.ssn })}
              placeholder="SSN"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
        </div>

        <div className="grid grid-cols-12 border-x border-b border-stone-500">
          <PaperCell label="Start Date" className="col-span-4 border-l-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.startDate}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, startDate: event.target.value }))}
              onBlur={() => void saveHeader({ startDate: headerDraft.startDate })}
              placeholder="MM/DD/YY"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
          <PaperCell label="Completion Date" className="col-span-4 border-t-0 border-b-0">
            <Input
              value={headerDraft.completionDate}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, completionDate: event.target.value }))}
              onBlur={() => void saveHeader({ completionDate: headerDraft.completionDate })}
              placeholder="MM/DD/YY"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
          <PaperCell label="Final Grade" className="col-span-4 border-r-0 border-t-0 border-b-0">
            <Input
              value={finalGradeDraft}
              onChange={(event) => setFinalGradeDraft(event.target.value)}
              onBlur={() => void saveFinalGrade()}
              placeholder="Final grade"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
        </div>

        <div className="grid grid-cols-12 border-x border-b border-stone-500">
          <PaperCell label="Instructor Name" className="col-span-12 border-l-0 border-r-0 border-t-0">
            <Input
              value={headerDraft.instructorName}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, instructorName: event.target.value }))}
              onBlur={() => void saveHeader({ instructorName: headerDraft.instructorName })}
              placeholder="Instructor name"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
        </div>

        <div className="mt-0 overflow-hidden border border-stone-500">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-300 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-stone-900">
                <th className="w-[46%] px-2 py-2">Theory Content</th>
                <th className="w-[12%] px-2 py-2">Hours</th>
                <th className="w-[16%] px-2 py-2">Date</th>
                <th className="w-[14%] px-2 py-2">Instructor Initials</th>
                <th className="w-[12%] px-2 py-2">Test Score</th>
              </tr>
            </thead>
            <tbody>
              {workspace.modules.map((module) => (
                <React.Fragment key={module.moduleId}>
                  <tr className="border-y border-stone-300 bg-stone-200">
                    <td colSpan={5} className="px-2 py-2 text-[12px] font-semibold text-stone-900">
                      {module.moduleTitle}
                    </td>
                  </tr>
                  {module.topics.map((topic) => (
                    <TheoryTopicRow
                      key={topic.sectionId}
                      topic={topic}
                      onSave={(payload) => onSaveTopic(module.moduleId, topic.sectionId, payload)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-[12px] border border-stone-300 bg-stone-100 p-3 text-[11px] leading-5 text-stone-700">
          Enter hours, date, and test score directly into the record sheet. Instructor initials populate from saved entries when updates are recorded.
        </div>

        {!error ? (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-success/30 bg-success/10 p-3 text-sm text-stone-900">
            <IconCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <span>The on-screen worksheet is aligned with the CDPH E276C export flow.</span>
          </div>
        ) : null}
      </PaperPage>
    </div>
  );
}
