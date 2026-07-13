'use client';

import * as React from 'react';
import { IconAlertCircle, IconCheck, IconDownload, IconFileText } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type CdphSkillStatus = 'S' | 'U';

type CdphSkillItem = {
  skillId: string;
  label: string;
  status: CdphSkillStatus | null;
  comments: string | null;
  datePerformed: string | null;
  instructorInitials: string | null;
};

type CdphSkillModule = {
  moduleId: string;
  moduleTitle: string;
  clinicalHours: number;
  items: CdphSkillItem[];
};

type CdphSkillWorkspace = {
  studentId: string;
  studentName: string;
  header: {
    ssn: string;
    instructorName: string;
    trainingProgramName: string;
    clinicalSiteName: string;
    startDate: string;
    completionDate: string;
  };
  modules: CdphSkillModule[];
};

function PaperPage({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border border-stone-300 bg-[#fbfaf5] p-5 shadow-[0_18px_50px_rgba(28,25,23,0.12)]">
      {children}
      <div className="mt-5 flex items-center justify-between border-t border-stone-300 pt-3 text-[10px] text-stone-500">
        <span>CDPH E276A (12/19)</span>
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

function SkillChecklistRow({
  item,
  onSave,
}: {
  item: CdphSkillItem;
  onSave: (payload: { status?: CdphSkillStatus; comments?: string; datePerformed?: string }) => void;
}) {
  const [commentsDraft, setCommentsDraft] = React.useState(item.comments ?? '');
  const [dateDraft, setDateDraft] = React.useState(item.datePerformed ?? '');

  React.useEffect(() => {
    setCommentsDraft(item.comments ?? '');
    setDateDraft(item.datePerformed ?? '');
  }, [item.comments, item.datePerformed]);

  const commit = (status?: CdphSkillStatus) => {
    onSave({
      status: status ?? item.status ?? undefined,
      comments: commentsDraft,
      datePerformed: dateDraft || undefined,
    });
  };

  return (
    <tr className="border-b border-stone-300 align-top">
      <td className="px-2 py-2 text-[12px] text-stone-900">{item.label}</td>
      <td className="px-2 py-2">
        <div className="flex gap-2">
          {(['S', 'U'] as CdphSkillStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => commit(status)}
              className={cn(
                'inline-flex min-w-9 items-center justify-center rounded-[8px] border px-2 py-1 text-[11px] font-semibold transition',
                item.status === status
                  ? status === 'S'
                    ? 'border-success bg-success text-white'
                    : 'border-error bg-error text-white'
                  : 'border-stone-300 bg-white text-stone-700'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </td>
      <td className="px-2 py-2">
        <Textarea
          value={commentsDraft}
          onChange={(event) => setCommentsDraft(event.target.value)}
          onBlur={() => commit()}
          placeholder="Comments"
          className="min-h-16 rounded-[8px] border-stone-300 bg-white text-[12px]"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          value={dateDraft}
          onChange={(event) => setDateDraft(event.target.value)}
          onBlur={() => commit()}
          placeholder="MM/DD/YY"
          className="h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
        />
      </td>
      <td className="px-2 py-2 text-center text-[12px] text-stone-700">{item.instructorInitials ?? '—'}</td>
    </tr>
  );
}

export function InstructorCdphE276APaperWorkspace({
  workspace,
  headerDraft,
  setHeaderDraft,
  saveHeader,
  downloadPdf,
  downloading,
  onSaveSkill,
  error,
}: {
  workspace: CdphSkillWorkspace;
  headerDraft: CdphSkillWorkspace['header'];
  setHeaderDraft: React.Dispatch<React.SetStateAction<CdphSkillWorkspace['header']>>;
  saveHeader: (payload: Partial<CdphSkillWorkspace['header']>) => Promise<void> | void;
  downloadPdf: () => Promise<void> | void;
  downloading: boolean;
  onSaveSkill: (moduleId: string, skillId: string, payload: { status?: CdphSkillStatus; comments?: string; datePerformed?: string }) => void;
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
              <h3 className="font-display text-[18px] font-semibold text-on-surface">CDPH E276A Skills Checklist</h3>
              <p className="text-sm text-on-surface-variant">Paper-style checklist matching the official export format.</p>
            </div>
          </div>
          <Button onClick={() => void downloadPdf()} disabled={downloading} variant="secondary" className="h-10 gap-2 rounded-[12px]">
            <IconDownload className="h-4 w-4" />
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
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
          <span>Instructor skills worksheet</span>
        </div>

        <div className="text-center">
          <h2 className="text-[20px] font-bold tracking-[0.06em] text-stone-900">
            ONLINE NURSE ASSISTANT TRAINING PROGRAM SKILLS CHECKLIST
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
          <PaperCell label="Instructor Name" className="col-span-6 border-l-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.instructorName}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, instructorName: event.target.value }))}
              onBlur={() => void saveHeader({ instructorName: headerDraft.instructorName })}
              placeholder="Instructor name"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
          <PaperCell label="Training Program Name" className="col-span-6 border-r-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.trainingProgramName}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, trainingProgramName: event.target.value }))}
              onBlur={() => void saveHeader({ trainingProgramName: headerDraft.trainingProgramName })}
              placeholder="Training program"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
        </div>

        <div className="grid grid-cols-12 border-x border-b border-stone-500">
          <PaperCell label="Clinical Site Name" className="col-span-6 border-l-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.clinicalSiteName}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, clinicalSiteName: event.target.value }))}
              onBlur={() => void saveHeader({ clinicalSiteName: headerDraft.clinicalSiteName })}
              placeholder="Clinical site"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
          <PaperCell label="Start Date" className="col-span-3 border-t-0 border-b-0">
            <Input
              value={headerDraft.startDate}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, startDate: event.target.value }))}
              onBlur={() => void saveHeader({ startDate: headerDraft.startDate })}
              placeholder="MM/DD/YY"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
          <PaperCell label="Completion Date" className="col-span-3 border-r-0 border-t-0 border-b-0">
            <Input
              value={headerDraft.completionDate}
              onChange={(event) => setHeaderDraft((current) => ({ ...current, completionDate: event.target.value }))}
              onBlur={() => void saveHeader({ completionDate: headerDraft.completionDate })}
              placeholder="MM/DD/YY"
              className="mt-2 h-8 rounded-[8px] border-stone-300 bg-white text-[12px]"
            />
          </PaperCell>
        </div>

        <div className="mt-0 overflow-hidden border border-stone-500">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-300 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-stone-900">
                <th className="w-[38%] px-2 py-2">Skill Demonstrated</th>
                <th className="w-[10%] px-2 py-2">S/U</th>
                <th className="w-[26%] px-2 py-2">Comments</th>
                <th className="w-[14%] px-2 py-2">Date Performed</th>
                <th className="w-[12%] px-2 py-2">Instructor Initials</th>
              </tr>
            </thead>
            <tbody>
              {workspace.modules.map((module) => (
                <React.Fragment key={module.moduleId}>
                  <tr className="border-y border-stone-300 bg-stone-200">
                    <td colSpan={5} className="px-2 py-2 text-[12px] font-semibold text-stone-900">
                      {module.moduleTitle} ({module.clinicalHours} clinical hour{module.clinicalHours === 1 ? '' : 's'})
                    </td>
                  </tr>
                  {module.items.map((item) => (
                    <SkillChecklistRow
                      key={item.skillId}
                      item={item}
                      onSave={(payload) => onSaveSkill(module.moduleId, item.skillId, payload)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {!error ? (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-success/30 bg-success/10 p-3 text-sm text-stone-900">
            <IconCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <span>The on-screen worksheet is aligned with the CDPH E276A export flow.</span>
          </div>
        ) : null}
      </PaperPage>
    </div>
  );
}
