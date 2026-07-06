'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Question {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  preferredAnswer: string;
  options: Array<{ label: string; value: string }>;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [question, setQuestion] = React.useState<Question | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const questionId = params.questionId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  React.useEffect(() => {
    if (!hasAuth) return;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/exam-config`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const foundQuestion = data.data.questions.find((q: Question) => q.id === questionId);

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

  if (loading) {
    return (
      <AdminShell title="Question Details" subtitle="Loading...">
        <div className="p-8 text-center">Loading question...</div>
      </AdminShell>
    );
  }

  if (error || !question) {
    return (
      <AdminShell title="Question Details" subtitle="Error">
        <div className="p-8 text-center text-error">{error || 'Question not found'}</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Question Details"
      subtitle={question.prompt}
      topActions={
        <Button variant="secondary" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
          Back
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Header Card */}
        <div className="rounded-xl border border-border-subtle bg-surface-muted p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                Question #{question.id}
              </p>
              <h2 className="text-2xl font-bold text-on-surface leading-relaxed">
                {question.prompt}
              </h2>
            </div>
            <Badge variant={question.type === 'choice' ? 'info' : 'neutral'} className="shrink-0">
              {question.type === 'choice' ? 'Multiple Choice' : 'Text Answer'}
            </Badge>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid gap-6">
          {/* Question Type Card */}
          <div className="rounded-xl border border-border-subtle p-6">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                Reviewer Guidance
              </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg">
                  {question.type === 'choice' ? '✓' : '📝'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-on-surface">
                  {question.type === 'choice' ? 'Multiple Choice' : 'Text Answer'}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {question.type === 'choice'
                    ? `Preferred option: ${question.options.find((option) => option.value === question.preferredAnswer)?.label ?? question.preferredAnswer}`
                    : `Preferred response: ${question.preferredAnswer}`}
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Card (if text) */}
          {question.type === 'text' && question.placeholder && (
            <div className="rounded-xl border border-border-subtle p-6">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                Placeholder Text
              </p>
              <p className="text-on-surface italic bg-surface-muted p-4 rounded-lg">
                "{question.placeholder}"
              </p>
            </div>
          )}

          {/* Options Card (if choice) */}
          {question.type === 'choice' && (
            <div className="rounded-xl border border-border-subtle p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-4">
                  Answer Options ({question.options.length})
                </p>
              </div>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-surface-muted border border-border-subtle hover:border-primary/50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-on-surface break-words">{option.label}</p>
                        <p className="text-xs text-on-surface-variant font-mono mt-1">{option.value}</p>
                        {option.value === question.preferredAnswer ? (
                          <Badge variant="success" className="mt-2">Preferred Answer</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={() => router.back()}>
            Close
          </Button>
          <Link href={`/admin/configurations/onboarding/entrance-exam/${question.id}/edit`}>
            <Button>
              <IconEdit className="size-4" />
              Edit Question
            </Button>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
