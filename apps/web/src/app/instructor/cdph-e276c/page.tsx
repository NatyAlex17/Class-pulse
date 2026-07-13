'use client';

import * as React from 'react';
import { IconStethoscope } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorCdphE276CPaperWorkspace } from '@/components/instructor/instructor-cdph-e276c-paper-workspace';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type StudentSummary = {
  id: string;
  name: string;
};

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

export default function InstructorCdphE276CPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [students, setStudents] = React.useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [workspace, setWorkspace] = React.useState<CdphTheoryWorkspace | null>(null);
  const [loadingStudents, setLoadingStudents] = React.useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [finalGradeDraft, setFinalGradeDraft] = React.useState('');
  const [headerDraft, setHeaderDraft] = React.useState<CdphTheoryWorkspace['header']>({
    ssn: '',
    startDate: '',
    completionDate: '',
    instructorName: '',
  });

  const fetchStudents = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load theory records.');
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
          `${API_BASE_URL}/instructors/${instructorId}/students/${studentId}/cdph/e276c`,
          { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch the theory record (${response.status}).`);
        }

        const payload = await response.json();
        setWorkspace(payload.data);
        setFinalGradeDraft(payload.data?.finalGrade ?? '');
        setHeaderDraft(
          payload.data?.header ?? {
            ssn: '',
            startDate: '',
            completionDate: '',
            instructorName: '',
          },
        );
      } catch (fetchError) {
        setWorkspace(null);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch the theory record.');
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

  const updateTopic = async (
    moduleId: string,
    sectionId: string,
    payload: { hours?: number; date?: string; testScore?: number },
  ) => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276c/${sectionId}`,
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
        throw new Error(errorPayload?.error?.message ?? `Failed to update the theory entry (${response.status}).`);
      }

      await fetchWorkspace(selectedStudentId);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update the theory entry.');
    }
  };

  const saveHeader = async (payload: Partial<CdphTheoryWorkspace['header']>) => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276c/header`,
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

      await fetchWorkspace(selectedStudentId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update the E276C header.');
    }
  };

  const saveFinalGrade = async () => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276c/final-grade`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ finalGrade: finalGradeDraft }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to save the final grade (${response.status}).`);
      }

      await fetchWorkspace(selectedStudentId);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save the final grade.');
    }
  };

  const downloadPdf = async () => {
    if (!instructorId || !accessToken || !selectedStudentId) return;

    try {
      setDownloading(true);
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/students/${selectedStudentId}/cdph/e276c/pdf`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error(`Failed to generate the CDPH E276C PDF (${response.status}).`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cdph-e276c-${selectedStudentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to generate the CDPH E276C PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <InstructorShell
      title="CDPH E276C - Theory Record"
      subtitle="Record theory hours, dates, and scores in a paper-style worksheet that matches the official export."
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
            <div className="py-8 text-center text-on-surface-variant">Loading theory record...</div>
          ) : workspace ? (
            <InstructorCdphE276CPaperWorkspace
              workspace={workspace}
              finalGradeDraft={finalGradeDraft}
              setFinalGradeDraft={setFinalGradeDraft}
              headerDraft={headerDraft}
              setHeaderDraft={setHeaderDraft}
              saveHeader={saveHeader}
              saveFinalGrade={saveFinalGrade}
              downloadPdf={downloadPdf}
              downloading={downloading}
              onSaveTopic={updateTopic}
              error={error}
            />
          ) : (
            <div className="flex items-center justify-center rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
              Select a student to log their theory record.
            </div>
          )}
        </div>
      )}
    </InstructorShell>
  );
}
