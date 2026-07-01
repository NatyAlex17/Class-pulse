'use client';

import * as React from 'react';
import Link from 'next/link';
import { IconEdit, IconTrash, IconEye, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  options: Array<{ label: string; value: string }>;
}

interface ExamQuestionsTableProps {
  questions: Question[];
  onDelete: (id: string) => void;
  passingScore?: number;
  totalQuestions?: number;
}

export function ExamQuestionsTable({
  questions,
  onDelete,
  passingScore,
  totalQuestions,
}: ExamQuestionsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; prompt: string } | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-on-surface">Questions ({questions.length})</h3>
          {passingScore !== undefined && totalQuestions !== undefined && (
            <p className="mt-1 text-sm text-on-surface-variant">
              Pass: {passingScore} out of {totalQuestions}
            </p>
          )}
        </div>
        <Link href="/admin/configurations/onboarding/entrance-exam/create">
          <Button>
            <IconPlus className="size-4" />
            Add Question
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[16px] border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-on-surface">#</th>
              <th className="px-6 py-3 text-left font-semibold text-on-surface">Question</th>
              <th className="px-6 py-3 text-left font-semibold text-on-surface">Type</th>
              <th className="px-6 py-3 text-left font-semibold text-on-surface">Options</th>
              <th className="px-6 py-3 text-center font-semibold text-on-surface">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {questions.map((question, index) => (
              <tr key={question.id} className="hover:bg-surface-muted/50 transition">
                <td className="px-6 py-4 text-on-surface-variant">{index + 1}</td>
                <td className="px-6 py-4 max-w-xs truncate text-on-surface">{question.prompt}</td>
                <td className="px-6 py-4">
                  <Badge variant={question.type === 'choice' ? 'info' : 'neutral'}>
                    {question.type === 'choice' ? 'Multiple Choice' : 'Text'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {question.type === 'choice' ? `${question.options.length} options` : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/configurations/onboarding/entrance-exam/${question.id}`}>
                      <button
                        className="p-2 text-on-surface-variant transition hover:bg-surface hover:text-primary rounded-[8px]"
                        title="View details"
                      >
                        <IconEye className="size-4" />
                      </button>
                    </Link>
                    <Link href={`/admin/configurations/onboarding/entrance-exam/${question.id}/edit`}>
                      <button
                        className="p-2 text-on-surface-variant transition hover:bg-surface hover:text-primary rounded-[8px]"
                        title="Edit"
                      >
                        <IconEdit className="size-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ id: question.id, prompt: question.prompt })}
                      className="p-2 text-on-surface-variant transition hover:bg-error/10 hover:text-error rounded-[8px]"
                      title="Delete"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {questions.length === 0 && (
        <div className="rounded-[16px] border border-border-subtle border-dashed p-8 text-center">
          <p className="text-on-surface-variant">No questions yet</p>
          <Link href="/admin/configurations/onboarding/entrance-exam/create">
            <Button className="mt-4" variant="secondary">
              <IconPlus className="size-4" />
              Create First Question
            </Button>
          </Link>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl border border-border-subtle bg-surface shadow-2xl max-w-md mx-4 p-6 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                <IconAlertCircle className="size-6 text-error" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-on-surface text-lg">Delete Question?</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-surface-muted rounded-lg p-3 border border-border-subtle">
              <p className="text-sm font-medium text-on-surface break-words">"{deleteConfirm.prompt}"</p>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                Delete Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
