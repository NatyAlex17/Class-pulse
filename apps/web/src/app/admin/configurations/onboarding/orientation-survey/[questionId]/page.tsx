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

interface SurveyQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'rating' | 'choice' | 'multiple-choice';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [question, setQuestion] = React.useState<SurveyQuestion | null>(null);
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

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'rating':
        return 'info';
      case 'choice':
        return 'success';
      case 'multiple-choice':
        return 'warning';
      default:
        return 'neutral';
    }
  };

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
      subtitle={question.question}
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
                {question.question}
              </h2>
              {question.description && (
                <p className="text-base text-on-surface-variant mt-3">{question.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={getTypeVariant(question.type)}>
                {question.type === 'multiple-choice' ? 'Multi-choice' : question.type.charAt(0).toUpperCase() + question.type.slice(1)}
              </Badge>
              {question.required && <Badge variant="neutral">Required</Badge>}
            </div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid gap-6">
          {/* Type Card */}
          <div className="rounded-xl border border-border-subtle p-6">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
              Type
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg">
                  {question.type === 'rating' && '⭐'}
                  {question.type === 'choice' && '✓'}
                  {question.type === 'multiple-choice' && '☑'}
                  {question.type === 'text' && '📝'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-on-surface">
                  {question.type === 'multiple-choice' ? 'Multiple Choice' : question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Scale Card */}
          {question.type === 'rating' && question.scale && (
            <div className="rounded-xl border border-border-subtle p-6 space-y-4">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Rating Scale
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Minimum:</span>
                  <span className="font-semibold text-on-surface">{question.scale.min}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Maximum:</span>
                  <span className="font-semibold text-on-surface">{question.scale.max}</span>
                </div>
                {question.scale.minLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Min Label:</span>
                    <span className="text-on-surface">{question.scale.minLabel}</span>
                  </div>
                )}
                {question.scale.maxLabel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Max Label:</span>
                    <span className="text-on-surface">{question.scale.maxLabel}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options Card */}
          {(question.type === 'choice' || question.type === 'multiple-choice') && question.options && (
            <div className="rounded-xl border border-border-subtle p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-4">
                  Options ({question.options.length})
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
                      <div className="flex-1">
                        <p className="font-medium text-on-surface">{option.label}</p>
                        <p className="text-xs text-on-surface-variant font-mono mt-1">{option.value}</p>
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
          <Link href={`/admin/configurations/onboarding/orientation-survey/${question.id}/edit`}>
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
