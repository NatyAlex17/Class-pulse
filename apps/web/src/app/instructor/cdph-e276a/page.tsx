'use client';

import * as React from 'react';
import { IconCheck, IconDownload, IconStethoscope } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type StudentSummary = {
  id: string;
  name: string;
};

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
  modules: CdphSkillModule[];
};

export default function InstructorCdphE276APage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [students, setStudents] = React.useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [workspace, setWorkspace] = React.useState<CdphSkillWorkspace | null>(null);
  const [loadingStudents, setLoadingStudents] = React.useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStudents = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load skill checklists.');
      setLoadingStudents(false);
      return;
    }

    try {
      setLoadingStudents(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch students (${response.status}).`);
      }

      const payload = await response.json();
      const nextStudents: StudentSummary[] = (payload.data?.students ?? []).map((student: { id: string; name: string }) => ({
        id: student.id,
        name: student.name,
      }));
      setStudents(nextStudents);
      setSelectedStudentId((current) => current ?? payload.data?.activeStudentId ?? nextStudents[0]?.id ?? null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch students.');
    } finally {
      setLoadingStudents(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const fetchWorkspace = React.useCallback(
    async (studentId: string) => {
      if (!instructorId || !accessToken) return;

      try {
        setLoadingWorkspace(true);
        setError(null);
        const response = await fetch(
          `${API_BASE_URL}/instructors/${instructorId}/students/${studentId}/cdph/e276a`,
          { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch the skills checklist (${response.status}).`);
        }

        const payload = await response.json();
        setWorkspace(payload.data);
      } catch (fetchError) {
        setWorkspace(null);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch the skills checklist.');
      } finally {
        setLoadingWorkspace(false);
      }
    },
    [accessToken, instructorId],
  );

  React.useEffect(() => {
    if (selectedStudentId) {
      void fetchWorkspace(selectedStudentId);
    }
  }, [selectedStudentId, fetchWorkspace]);

  const updateSkill = async (
    moduleId: string,
    skillId: string,
    payload: { status?: CdphSkillStatus; comments?: string; datePerformed?: string },
  ) => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276a/${skillId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ moduleId, ...payload }),
        },
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error?.message ?? `Failed to update the skill (${response.status}).`);
      }

      const data = await response.json();
      if (data.data) {
        setWorkspace(data.data);
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update the skill.');
    }
  };

  const downloadPdf = async () => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      setDownloading(true);
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276a/pdf`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error(`Failed to generate the CDPH E276A PDF (${response.status}).`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cdph-e276a-${selectedStudentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to generate the CDPH E276A PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <InstructorShell
      title="CDPH E276A — Skills Checklist"
      subtitle="Mark clinical skills satisfactory/unsatisfactory as each student demonstrates them."
    >
      {error ? (
        <div className="mb-6 rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loadingStudents ? (
        <div className="py-8 text-center text-on-surface-variant">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
          No assigned students yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[20px] border border-border-subtle bg-surface p-4 shadow-soft">
            <p className="mb-3 px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
              Students ({students.length})
            </p>
            <div className="space-y-2">
              {students.map((student) => {
                const active = student.id === selectedStudentId;
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[16px] border p-4 text-left transition',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <IconStethoscope className="size-5" />
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{student.name}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {loadingWorkspace ? (
            <div className="py-8 text-center text-on-surface-variant">Loading skills checklist...</div>
          ) : workspace ? (
            <div className="space-y-4">
              <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <h3 className="font-display text-[24px] font-bold tracking-[-0.03em] text-on-surface">
                    {workspace.studentName} <span className="font-normal text-on-surface-variant">/ Skills Checklist</span>
                  </h3>
                  <Button onClick={() => void downloadPdf()} disabled={downloading} variant="secondary" className="h-10 gap-2 rounded-[12px]">
                    <IconDownload className="h-4 w-4" />
                    {downloading ? 'Generating…' : 'Download PDF'}
                  </Button>
                </div>
              </section>

              {workspace.modules.map((module) => (
                <section key={module.moduleId} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                  <h4 className="mb-4 font-display text-[16px] font-semibold text-on-surface">
                    {module.moduleTitle} <span className="text-sm font-normal text-on-surface-variant">({module.clinicalHours} clinical hour{module.clinicalHours === 1 ? '' : 's'})</span>
                  </h4>
                  <div className="space-y-3">
                    {module.items.map((item) => (
                      <SkillRow
                        key={item.skillId}
                        item={item}
                        onSave={(payload) => updateSkill(module.moduleId, item.skillId, payload)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
              Select a student to grade their skills checklist.
            </div>
          )}
        </div>
      )}
    </InstructorShell>
  );
}

function SkillRow({
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

  return (
    <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-on-surface">{item.label}</p>
        {item.instructorInitials ? (
          <span className="font-mono text-xs text-on-surface-variant">Initialed: {item.instructorInitials}</span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['S', 'U'] as CdphSkillStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onSave({ status, comments: commentsDraft, datePerformed: dateDraft || undefined })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              item.status === status
                ? status === 'S'
                  ? 'border-success bg-success text-white'
                  : 'border-error bg-error text-white'
                : 'border-border-subtle bg-surface text-on-surface-variant hover:border-primary/40',
            )}
          >
            {item.status === status ? <IconCheck className="size-3.5" /> : null}
            {status === 'S' ? 'Satisfactory' : 'Unsatisfactory'}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input
          value={dateDraft}
          onChange={(event) => setDateDraft(event.target.value)}
          onBlur={() => onSave({ status: item.status ?? undefined, comments: commentsDraft, datePerformed: dateDraft || undefined })}
          placeholder="Date performed"
          className="h-10 rounded-[10px]"
        />
      </div>
      <Textarea
        className="mt-3 min-h-14"
        value={commentsDraft}
        onChange={(event) => setCommentsDraft(event.target.value)}
        onBlur={() => onSave({ status: item.status ?? undefined, comments: commentsDraft, datePerformed: dateDraft || undefined })}
        placeholder="Comments (optional)..."
      />
    </div>
  );
}
