'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorQuestionsTable } from '@/components/admin/instructor-questions-table';
import { IconCheck } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface InstructorQuestionsConfig {
  questions: Array<{
    id: string;
    prompt: string;
    type: 'choice' | 'text';
    placeholder?: string;
    preferredAnswer: string;
    options: Array<{ label: string; value: string }>;
  }>;
}

export function InstructorOnboardingQuestionsConfigContent() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<InstructorQuestionsConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchConfig = React.useCallback(async () => {
    if (!adminId || !session?.access_token) {
      setError('Sign in to manage instructor onboarding questions.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/instructor-onboarding-questions-config`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

      const data = await response.json();
      setConfig(data.data);
    } catch (err) {
      setError(`Failed to load instructor onboarding questions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    if (hasAuth) {
      fetchConfig();
    }
  }, [hasAuth, fetchConfig]);

  const deleteQuestion = async (questionId: string) => {
    if (!config || !session?.access_token) return;

    try {
      const updatedConfig = { ...config, questions: config.questions.filter((q) => q.id !== questionId) };

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/instructor-onboarding-questions-config`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
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

  if (loading) {
    return <div className="p-8 text-center">Loading instructor onboarding questions...</div>;
  }

  if (!config) {
    return <div className="p-8 text-center text-error">{error ?? 'Failed to load configuration'}</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-[12px] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
      )}

      {success && (
        <div className="rounded-[12px] border border-success/20 bg-success/10 p-4 text-sm text-success flex items-center gap-2">
          <IconCheck className="size-4" />
          {success}
        </div>
      )}

      <InstructorQuestionsTable questions={config.questions} onDelete={deleteQuestion} />
    </div>
  );
}
