'use client';

import * as React from 'react';
import { IconDownload, IconStethoscope } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      title="CDPH E276C — Theory Record"
      subtitle="Log theory hours, dates, and exam scores per curriculum topic as each student progresses."
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
            <div className="py-8 text-center text-on-surface-variant">Loading theory record...</div>
          ) : workspace ? (
            <div className="space-y-4">
              <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <h3 className="font-display text-[24px] font-bold tracking-[-0.03em] text-on-surface">
                    {workspace.studentName} <span className="font-normal text-on-surface-variant">/ Theory Record</span>
                  </h3>
                  <div className="flex items-end gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-on-surface-variant">Final Grade</label>
                      <Input
                        value={finalGradeDraft}
                        onChange={(event) => setFinalGradeDraft(event.target.value)}
                        onBlur={() => void saveFinalGrade()}
                        placeholder="e.g. Pass"
                        className="h-10 w-32 rounded-[12px]"
                      />
                    </div>
                    <Button onClick={() => void downloadPdf()} disabled={downloading} variant="secondary" className="h-10 gap-2 rounded-[12px]">
                      <IconDownload className="h-4 w-4" />
                      {downloading ? 'Generating…' : 'Download PDF'}
                    </Button>
                  </div>
                </div>
              </section>

              {workspace.modules.map((module) => (
                <section key={module.moduleId} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                  <h4 className="mb-4 font-display text-[16px] font-semibold text-on-surface">{module.moduleTitle}</h4>
                  <div className="space-y-3">
                    {module.topics.map((topic) => (
                      <TopicRow
                        key={topic.sectionId}
                        topic={topic}
                        onSave={(payload) => updateTopic(module.moduleId, topic.sectionId, payload)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
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

function TopicRow({
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
    <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-on-surface">{topic.label}</p>
        {topic.instructorInitials ? (
          <span className="font-mono text-xs text-on-surface-variant">Initialed: {topic.instructorInitials}</span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Input
          type="number"
          value={hoursDraft}
          onChange={(event) => setHoursDraft(event.target.value)}
          onBlur={commit}
          placeholder="Hours"
          className="h-10 rounded-[10px]"
        />
        <Input
          value={dateDraft}
          onChange={(event) => setDateDraft(event.target.value)}
          onBlur={commit}
          placeholder="Date"
          className="h-10 rounded-[10px]"
        />
        <Input
          type="number"
          value={testScoreDraft}
          onChange={(event) => setTestScoreDraft(event.target.value)}
          onBlur={commit}
          placeholder="Test score"
          className="h-10 rounded-[10px]"
        />
      </div>
    </div>
  );
}
