'use client';

import * as React from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { RowIconButton } from './shared';
import { createBlankExamQuestion, type ExamFormat, type ExamQuestion } from './types';

export function ExamQuestionsEditor({
  format,
  questions,
  onChange,
}: {
  format: ExamFormat;
  questions: ExamQuestion[];
  onChange: (questions: ExamQuestion[]) => void;
}) {
  const updateQuestion = (index: number, updater: (question: ExamQuestion) => ExamQuestion) => {
    onChange(questions.map((question, i) => (i === index ? updater(question) : question)));
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-on-surface">
          Question Configuration ({questions.length})
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...questions, createBlankExamQuestion(format)])}
        >
          <IconPlus className="size-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-border-subtle p-6 text-center text-sm text-on-surface-variant">
          No questions yet. Set the number of questions above or click Add Question.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-[14px] border border-border-subtle bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge variant="primary">Question {index + 1}</Badge>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-on-surface">Marks</label>
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(index, (q) => ({
                          ...q,
                          points: Number(event.target.value || 0),
                        }))
                      }
                    />
                  </div>
                  <RowIconButton
                    title="Remove question"
                    destructive
                    onClick={() => onChange(questions.filter((_, i) => i !== index))}
                  >
                    <IconTrash className="size-4" />
                  </RowIconButton>
                </div>
              </div>

              <Textarea
                className="min-h-16"
                value={question.prompt}
                onChange={(event) =>
                  updateQuestion(index, (q) => ({ ...q, prompt: event.target.value }))
                }
                placeholder={`Write question ${index + 1} here...`}
              />

              {format === 'multiple-choice' ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-on-surface">
                    Options <span className="font-normal text-on-surface-variant">(select the correct answer)</span>
                  </p>
                  {(question.options ?? []).map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        className="size-4 shrink-0 accent-primary"
                        title="Mark as correct answer"
                        checked={question.correctOption === optionIndex}
                        onChange={() =>
                          updateQuestion(index, (q) => ({ ...q, correctOption: optionIndex }))
                        }
                      />
                      <Input
                        value={option}
                        placeholder={`Option ${optionIndex + 1}`}
                        onChange={(event) =>
                          updateQuestion(index, (q) => ({
                            ...q,
                            options: (q.options ?? []).map((o, i) =>
                              i === optionIndex ? event.target.value : o,
                            ),
                          }))
                        }
                      />
                      <RowIconButton
                        title="Remove option"
                        destructive
                        onClick={() =>
                          updateQuestion(index, (q) => {
                            const options = (q.options ?? []).filter((_, i) => i !== optionIndex);
                            let correctOption = q.correctOption;
                            if (correctOption !== undefined) {
                              if (correctOption === optionIndex) {
                                correctOption = undefined;
                              } else if (correctOption > optionIndex) {
                                correctOption -= 1;
                              }
                            }
                            return { ...q, options, correctOption };
                          })
                        }
                      >
                        <IconTrash className="size-4" />
                      </RowIconButton>
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateQuestion(index, (q) => ({ ...q, options: [...(q.options ?? []), ''] }))
                      }
                    >
                      <IconPlus className="size-4" />
                      Add Option
                    </Button>
                    {question.correctOption === undefined ? (
                      <span className="text-xs text-warning">Select the correct answer.</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-on-surface">
                    Expected Answer <span className="font-normal text-on-surface-variant">(optional, shown to graders)</span>
                  </label>
                  <Textarea
                    className="min-h-16"
                    value={question.expectedAnswer ?? ''}
                    onChange={(event) =>
                      updateQuestion(index, (q) => ({
                        ...q,
                        expectedAnswer: event.target.value || undefined,
                      }))
                    }
                    placeholder="Key points a good answer should cover."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
