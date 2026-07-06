'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowLeft, IconTrash, IconPlus } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Option {
  label: string;
  value: string;
}

interface SurveyQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'rating' | 'choice' | 'multiple-choice';
  required?: boolean;
  options?: Option[];
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [question, setQuestion] = React.useState<SurveyQuestion | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const questionId = params.questionId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  React.useEffect(() => {
    if (!hasAuth) return;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/orientation-survey-config`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const foundQuestion = data.data.questions.find((q: SurveyQuestion) => q.id === questionId);

        if (!foundQuestion) {
          setError('Question not found');
          return;
        }

        setQuestion(foundQuestion);
      } catch (err) {
        setError(`Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [hasAuth, questionId, adminId, session?.access_token]);

  const addOption = () => {
    if (!question) return;
    setQuestion({
      ...question,
      options: [
        ...(question.options || []),
        { label: '', value: '' },
      ],
    });
  };

  const removeOption = (index: number) => {
    if (!question || !question.options) return;
    setQuestion({
      ...question,
      options: question.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    if (!question || !question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestion({ ...question, options: newOptions });
  };

  const saveQuestion = async () => {
    if (!question || !hasAuth || !session?.access_token) {
      setError('Not authenticated');
      return;
    }

    if (!question.question.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/orientation-survey-config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch current config');

      const data = await response.json();
      const currentConfig = data.data;

      const updatedQuestions = currentConfig.questions.map((q: SurveyQuestion) =>
        q.id === question.id ? question : q
      );

      const updatedConfig = {
        ...currentConfig,
        questions: updatedQuestions,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/admins/${adminId}/orientation-survey-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!updateResponse.ok) throw new Error('Failed to save question');

      setSuccess('Question updated successfully!');
      setTimeout(() => {
        router.push('/admin/configurations/onboarding?tab=orientation-survey');
      }, 1500);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Edit Question" subtitle="Loading...">
        <div className="p-8 text-center">Loading question...</div>
      </AdminShell>
    );
  }

  if (error && !question) {
    return (
      <AdminShell title="Edit Question" subtitle="Error">
        <div className="p-8 text-center text-error">{error}</div>
      </AdminShell>
    );
  }

  if (!question) {
    return (
      <AdminShell title="Edit Question" subtitle="Not found">
        <div className="p-8 text-center text-error">Question not found</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Edit Question"
      subtitle={question.question}
      topActions={
        <Button variant="secondary" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
          Back
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-[12px] border border-error/20 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[12px] border border-success/20 bg-success/10 p-4 text-sm text-success">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">Question</label>
            <Textarea
              value={question.question}
              onChange={(e) => setQuestion({ ...question, question: e.target.value })}
              placeholder="Enter the survey question"
              className="h-24"
            />
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">Description (Optional)</label>
            <Textarea
              value={question.description || ''}
              onChange={(e) => setQuestion({ ...question, description: e.target.value })}
              placeholder="Additional context or instructions"
              className="h-20"
            />
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-4">Question Type</label>
            <div className="space-y-3">
              {(['text', 'rating', 'choice', 'multiple-choice'] as const).map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-high transition">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={question.type === type}
                    onChange={(e) => setQuestion({ ...question, type: e.target.value as SurveyQuestion['type'] })}
                    className="size-4"
                  />
                  <span className="font-medium text-on-surface">
                    {type === 'multiple-choice' ? 'Multiple Choice' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {question.type === 'rating' && question.scale && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-6 space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Min Value</label>
                  <Input
                    type="number"
                    value={question.scale.min || 1}
                    onChange={(e) => setQuestion({
                      ...question,
                      scale: { ...question.scale!, min: parseInt(e.target.value) || 1 },
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Max Value</label>
                  <Input
                    type="number"
                    value={question.scale.max || 5}
                    onChange={(e) => setQuestion({
                      ...question,
                      scale: { ...question.scale!, max: parseInt(e.target.value) || 5 },
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Min Label</label>
                  <Input
                    value={question.scale.minLabel || ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      scale: { ...question.scale!, minLabel: e.target.value },
                    })}
                    placeholder="e.g., Poor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Max Label</label>
                  <Input
                    value={question.scale.maxLabel || ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      scale: { ...question.scale!, maxLabel: e.target.value },
                    })}
                    placeholder="e.g., Excellent"
                  />
                </div>
              </div>
            </div>
          )}

          {(question.type === 'choice' || question.type === 'multiple-choice') && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-on-surface">Options</label>
                <Button onClick={addOption} size="sm" variant="secondary">
                  <IconPlus className="size-4" />
                  Add Option
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-2">
                {question.options?.map((option, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-lg border-2 border-border-subtle bg-surface hover:border-primary/50 hover:bg-primary/5 transition flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 border border-primary/20">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      placeholder="Option text"
                      className="font-medium flex-1 h-9 text-sm"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition opacity-0 group-hover:opacity-100 shrink-0"
                      title="Delete option"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => setQuestion({ ...question, required: e.target.checked })}
                className="size-4"
              />
              <span className="font-medium text-on-surface">Make this question required</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={saveQuestion} disabled={saving || !hasAuth}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
