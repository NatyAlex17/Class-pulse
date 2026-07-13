'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { ExamQuestionsTable } from '@/components/admin/exam-questions-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconCheck } from '@tabler/icons-react';
import { InstructorOnboardingQuestionsConfigContent } from '@/components/admin/onboarding/instructor-questions-content';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ExamConfig {
  intro: string;
  passingScore: number;
  questions: Array<{
    id: string;
    prompt: string;
    type: 'choice' | 'text';
    placeholder?: string;
    preferredAnswer: string;
    options: Array<{ label: string; value: string }>;
  }>;
}

export function EntranceExamConfigContent() {
  const { session, syncedUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const audience = searchParams.get('audience') === 'instructor' ? 'instructor' : 'student';
  const setAudience = (next: 'student' | 'instructor') => {
    router.push(`?tab=entrance-exam&audience=${next}`, { scroll: false } as any);
  };
  const [config, setConfig] = React.useState<ExamConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchConfig = async () => {
    if (!adminId || !session?.access_token) {
      setError('Sign in to manage the entrance exam configuration.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/exam-config`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setConfig(null);
          setError('Your admin session is not authorized to load exam configuration right now.');
          return;
        }

        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setConfig(data.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load exam configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (hasAuth) {
      fetchConfig();
    }
  }, [hasAuth]);

  const saveBasicSettings = async () => {
    if (!config || !session?.access_token) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/exam-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error(`Failed to save: ${response.statusText}`);

      const data = await response.json();
      setConfig(data.data);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!config || !session?.access_token) return;

    try {
      const newQuestions = config.questions.filter((q) => q.id !== questionId);
      const updatedConfig = { ...config, questions: newQuestions };

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/exam-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) throw new Error('Failed to delete');

      const data = await response.json();
      setConfig(data.data);
      setSuccess('Question deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const audienceFilter = (
    <div className="inline-flex items-center gap-1 rounded-[14px] border border-border-subtle bg-surface-muted p-1">
      {(['student', 'instructor'] as const).map((option) => (
        <button
          key={option}
          onClick={() => setAudience(option)}
          className={cn(
            'rounded-[10px] px-4 py-2 text-sm font-semibold transition',
            audience === option
              ? 'bg-primary text-white'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {option === 'student' ? 'Student' : 'Instructor'}
        </button>
      ))}
    </div>
  );

  if (audience === 'instructor') {
    return (
      <div className="space-y-6">
        {audienceFilter}
        <InstructorOnboardingQuestionsConfigContent />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {audienceFilter}
        <div className="p-8 text-center">Loading configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        {audienceFilter}
        <div className="p-8 text-center text-error">{error ?? 'Failed to load configuration'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {audienceFilter}

      {error && (
        <div className="rounded-[12px] border border-error/20 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[12px] border border-success/20 bg-success/10 p-4 text-sm text-success flex items-center gap-2">
          <IconCheck className="size-4" />
          {success}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-5">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Intro</label>
          <Textarea
            value={config.intro}
            onChange={(event) => setConfig({ ...config, intro: event.target.value })}
            placeholder="Explain how the entrance exam works."
            className="min-h-28"
          />
        </div>
        <div className="rounded-[16px] border border-border-subtle bg-surface-muted p-5">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score</label>
          <Input
            type="number"
            min={1}
            max={Math.max(config.questions.length, 1)}
            value={config.passingScore}
            onChange={(event) =>
              setConfig({
                ...config,
                passingScore: Number(event.target.value || 0),
              })
            }
          />
          <p className="mt-2 text-xs text-on-surface-variant">
            Reviewers use this threshold after marking each question correct or wrong during intake review.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveBasicSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Exam Settings'}
        </Button>
      </div>

      <ExamQuestionsTable
        questions={config.questions}
        onDelete={deleteQuestion}
        passingScore={config.passingScore}
        totalQuestions={config.questions.length}
      />
    </div>
  );
}
