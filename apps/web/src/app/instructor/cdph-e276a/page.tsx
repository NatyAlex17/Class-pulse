'use client';

import * as React from 'react';
import { IconStethoscope } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorCdphE276APaperWorkspace } from '@/components/instructor/instructor-cdph-e276a-paper-workspace';
import { InstructorShell } from '@/components/instructor/instructor-shell';
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
  const [headerDraft, setHeaderDraft] = React.useState<CdphSkillWorkspace['header']>({
    ssn: '',
    instructorName: '',
    trainingProgramName: '',
    clinicalSiteName: '',
    startDate: '',
    completionDate: '',
  });

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
        setHeaderDraft(
          payload.data?.header ?? {
            ssn: '',
            instructorName: '',
            trainingProgramName: '',
            clinicalSiteName: '',
            startDate: '',
            completionDate: '',
          },
        );
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
        setHeaderDraft((current) => data.data.header ?? current);
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update the skill.');
    }
  };

  const saveHeader = async (payload: Partial<CdphSkillWorkspace['header']>) => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276a/header`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error?.message ?? `Failed to update the header (${response.status}).`);
      }

      const data = await response.json();
      if (data.data) {
        setWorkspace(data.data);
        setHeaderDraft(data.data.header ?? headerDraft);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update the E276A header.');
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
      title="CDPH E276A - Skills Checklist"
      subtitle="Mark clinical skills on a paper-style checklist that matches the official export."
    >
      {loadingStudents ? (
        <div className="py-8 text-center text-on-surface-variant">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
          No assigned students yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
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
            <InstructorCdphE276APaperWorkspace
              workspace={workspace}
              headerDraft={headerDraft}
              setHeaderDraft={setHeaderDraft}
              saveHeader={saveHeader}
              downloadPdf={downloadPdf}
              downloading={downloading}
              onSaveSkill={updateSkill}
              error={error}
            />
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
