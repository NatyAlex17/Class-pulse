'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  preferredAnswer: string;
  options: QuestionOption[];
}

export default function CreateInstructorQuestionPage() {
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [question, setQuestion] = React.useState<Question>({
    id: `q${Date.now()}`,
    prompt: 'New question',
    type: 'choice',
    placeholder: '',
    preferredAnswer: 'a',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
    ],
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const addOption = () => {
    setQuestion({
      ...question,
      options: [
        ...question.options,
        { label: `Option ${String.fromCharCode(65 + question.options.length)}`, value: String(question.options.length) },
      ],
    });
  };

  const removeOption = (index: number) => {
    const nextOptions = question.options.filter((_, i) => i !== index);
    setQuestion({
      ...question,
      options: nextOptions,
      preferredAnswer: nextOptions.some((option) => option.value === question.preferredAnswer)
        ? question.preferredAnswer
        : (nextOptions[0]?.value ?? ''),
    });
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestion({ ...question, options: newOptions });
  };

  const saveQuestion = async () => {
    if (!hasAuth || !session?.access_token) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/instructor-onboarding-questions-config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch current config');

      const data = await response.json();
      const currentConfig = data.data;

      const updatedConfig = {
        ...currentConfig,
        questions: [...currentConfig.questions, question],
      };

      const updateResponse = await fetch(`${API_BASE_URL}/admins/${adminId}/instructor-onboarding-questions-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!updateResponse.ok) throw new Error('Failed to save question');

      router.push('/admin/configurations/onboarding?tab=entrance-exam&audience=instructor');
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell
      title="Create Instructor Question"
      subtitle="Add a new instructor onboarding question"
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

        <div className="space-y-6">
          {/* Question Text */}
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">Question Text</label>
            <Textarea
              value={question.prompt}
              onChange={(e) => setQuestion({ ...question, prompt: e.target.value })}
              placeholder="Enter question text"
              className="h-24"
            />
          </div>

          {/* Question Type */}
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-4">Question Type</label>
            <div className="flex gap-3">
              {(['choice', 'text'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setQuestion({
                      ...question,
                      type,
                      options: type === 'choice' ? question.options : [],
                      preferredAnswer:
                        type === 'choice'
                          ? question.preferredAnswer || question.options[0]?.value || ''
                          : question.preferredAnswer,
                    })
                  }
                  className={cn(
                    'px-4 py-3 rounded-lg font-semibold transition capitalize',
                    question.type === type
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border-subtle text-on-surface-variant hover:bg-surface-high',
                  )}
                >
                  {type === 'choice' ? 'Multiple Choice' : 'Text Answer'}
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder (for text questions) */}
          {question.type === 'text' && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
              <label className="block text-sm font-semibold text-on-surface mb-3">
                Placeholder Text
              </label>
              <Input
                value={question.placeholder || ''}
                onChange={(e) => setQuestion({ ...question, placeholder: e.target.value })}
                placeholder="e.g., Write your response..."
              />

              <label className="mt-4 block text-sm font-semibold text-on-surface mb-3">
                Preferred Answer
              </label>
              <Textarea
                value={question.preferredAnswer}
                onChange={(e) => setQuestion({ ...question, preferredAnswer: e.target.value })}
                placeholder="Enter the reviewer guidance answer"
                className="h-24"
              />
            </div>
          )}

          {/* Options (for choice questions) */}
          {question.type === 'choice' && (
            <div className="rounded-xl border border-border-subtle bg-surface-muted p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-on-surface">Answer Options</label>
                <Button onClick={addOption} size="sm" variant="secondary">
                  <IconPlus className="size-4" />
                  Add Option
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-2">
                {question.options.map((option, index) => (
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
                      type="button"
                      onClick={() => setQuestion({ ...question, preferredAnswer: option.value })}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition shrink-0',
                        question.preferredAnswer === option.value
                          ? 'border-success bg-success text-white'
                          : 'border-border-subtle bg-surface text-on-surface-variant hover:border-success/40',
                      )}
                    >
                      {question.preferredAnswer === option.value ? 'Preferred' : 'Mark Preferred'}
                    </button>
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
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={saveQuestion} disabled={loading || !hasAuth}>
            {loading ? 'Creating...' : 'Create Question'}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
