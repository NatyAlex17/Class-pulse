'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { OrientationSurveyQuestionsTable } from '@/components/admin/orientation-survey-questions-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconCheck } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface SurveyQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'rating' | 'choice' | 'multiple-choice';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
}

interface OrientationSurveyConfig {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export function OrientationSurveyConfigContent() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<OrientationSurveyConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchConfig = async () => {
    if (!adminId || !session?.access_token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/orientation-survey-config`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setConfig(data.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load orientation survey configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (hasAuth) {
      fetchConfig();
    }
  }, [hasAuth]);

  const deleteQuestion = async (questionId: string) => {
    if (!config || !session?.access_token) return;

    try {
      const newQuestions = config.questions.filter((q) => q.id !== questionId);
      const updatedConfig = { ...config, questions: newQuestions };

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/orientation-survey-config`, {
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

  if (loading) {
    return <div className="p-8 text-center">Loading configuration...</div>;
  }

  if (!config) {
    return <div className="p-8 text-center text-error">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6">
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

      <OrientationSurveyQuestionsTable
        questions={config.questions}
        onDelete={deleteQuestion}
      />
    </div>
  );
}
