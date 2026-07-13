'use client';

import * as React from 'react';
import { IconCheck, IconEye, IconStethoscope } from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type SkillStatus = 'Verified' | 'Needs observation' | 'Ready for signoff';

interface SkillChecklistItem {
  id: string;
  label: string;
  status: SkillStatus;
  feedback?: string;
}

interface SkillChecklistGroup {
  id: string;
  title: string;
  progressPercent: number;
  items: SkillChecklistItem[];
}

interface InstructorSkillsWorkspace {
  studentId: string;
  studentName: string;
  savedAt: string;
  completionPercent: number;
  groups: SkillChecklistGroup[];
}

const statusOptions: SkillStatus[] = ['Needs observation', 'Ready for signoff', 'Verified'];

function statusBadgeVariant(status: SkillStatus) {
  if (status === 'Verified') return 'success';
  if (status === 'Ready for signoff') return 'info';
  return 'warning';
}

export default function InstructorSkillsPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [workspaces, setWorkspaces] = React.useState<InstructorSkillsWorkspace[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = React.useState<Record<string, string>>({});

  const fetchWorkspaces = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load skill checklists.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/skills`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch skill checklists (${response.status}).`);
      }

      const data = await response.json();
      const nextWorkspaces: InstructorSkillsWorkspace[] = data.data?.workspaces ?? [];
      setWorkspaces(nextWorkspaces);
      setSelectedStudentId((current) =>
        current && nextWorkspaces.some((workspace) => workspace.studentId === current)
          ? current
          : (data.data?.activeStudentId || nextWorkspaces[0]?.studentId || null),
      );
    } catch (err) {
      setWorkspaces([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch skill checklists.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const selectedWorkspace = workspaces.find((workspace) => workspace.studentId === selectedStudentId) ?? null;

  const reviewSkill = async (studentId: string, itemId: string, status: SkillStatus, feedback?: string) => {
    if (!instructorId || !accessToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/instructors/${instructorId}/skills/${studentId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, feedback }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to update skill (${response.status}).`);
      }

      const data = await response.json();
      const updated: InstructorSkillsWorkspace | undefined = data.data;
      if (updated) {
        setWorkspaces((current) =>
          current.map((workspace) => (workspace.studentId === studentId ? updated : workspace)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill.');
    }
  };

  return (
    <InstructorShell
      title="Clinical Skills Checklist"
      subtitle="Skills instructors verify for the students they teach, unlocked as each student finishes a module."
    >
      {error ? (
        <div className="mb-6 rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-8 text-center text-on-surface-variant">Loading skill checklists...</div>
      ) : workspaces.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
          No students with completed modules yet. Skills appear here as soon as a student you teach finishes a
          module that has skills configured.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[20px] border border-border-subtle bg-surface p-4 shadow-soft">
            <p className="mb-3 px-2 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
              Students ({workspaces.length})
            </p>
            <div className="space-y-2">
              {workspaces.map((workspace) => {
                const active = workspace.studentId === selectedStudentId;
                return (
                  <button
                    key={workspace.studentId}
                    onClick={() => setSelectedStudentId(workspace.studentId)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-[16px] border p-4 text-left transition',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border-subtle bg-surface-muted hover:border-primary/30',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconStethoscope className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{workspace.studentName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {workspace.groups.length} module{workspace.groups.length !== 1 ? 's' : ''} with skills
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {workspace.completionPercent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedWorkspace ? (
            <div className="space-y-4">
              <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    {selectedWorkspace.savedAt ? (
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                        Last reviewed {new Date(selectedWorkspace.savedAt).toLocaleString()}
                      </p>
                    ) : null}
                    <h3 className="mt-2 font-display text-[28px] font-bold tracking-[-0.03em] text-on-surface">
                      {selectedWorkspace.studentName}{' '}
                      <span className="font-normal text-on-surface-variant">/ Clinical Skills</span>
                    </h3>
                  </div>
                  <div className="w-full max-w-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                        Completion progress
                      </span>
                      <span className="font-mono text-sm font-semibold text-primary">
                        {selectedWorkspace.completionPercent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-high">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${selectedWorkspace.completionPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {selectedWorkspace.groups.map((group) => (
                <section
                  key={group.id}
                  className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-[20px] font-semibold">{group.title}</h4>
                      <p className="text-sm text-on-surface-variant">
                        Section completion {group.progressPercent}%
                      </p>
                    </div>
                    <Badge variant="primary">{group.progressPercent}%</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.items.map((item) => {
                      const draftKey = `${selectedWorkspace.studentId}:${item.id}`;
                      const feedbackValue = feedbackDrafts[draftKey] ?? item.feedback ?? '';

                      return (
                        <div
                          key={item.id}
                          className="rounded-[18px] border border-border-subtle bg-surface-muted p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-medium text-on-surface">{item.label}</p>
                            <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  void reviewSkill(selectedWorkspace.studentId, item.id, status, item.feedback)
                                }
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                  item.status === status
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-border-subtle bg-surface text-on-surface-variant hover:border-primary/40',
                                )}
                              >
                                {item.status === status ? <IconCheck className="size-3.5" /> : null}
                                {status}
                              </button>
                            ))}
                          </div>

                          <Textarea
                            className="mt-3 min-h-16"
                            value={feedbackValue}
                            onChange={(event) =>
                              setFeedbackDrafts((current) => ({ ...current, [draftKey]: event.target.value }))
                            }
                            onBlur={(event) =>
                              void reviewSkill(selectedWorkspace.studentId, item.id, item.status, event.target.value)
                            }
                            placeholder="Add observation feedback (optional)..."
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-[20px] border border-dashed border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
              <div>
                <IconEye className="mx-auto mb-3 size-8 text-on-surface-variant" />
                Select a student to review their skill checklist.
              </div>
            </div>
          )}
        </div>
      )}
    </InstructorShell>
  );
}
