'use client';

import { IconTrash } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { ExamQuestionsEditor } from './exam-questions-editor';
import {
  applyFormatToQuestions,
  resourceTypeLabels,
  type ExamFormat,
  type LearningResource,
} from './types';

export function SectionItemEditor({
  item,
  moduleId,
  sectionId,
  updateResource,
  removeResource,
  onUploadFile,
}: {
  item: LearningResource;
  moduleId: string;
  sectionId: string;
  updateResource: (
    moduleId: string,
    sectionId: string,
    resourceId: string,
    updater: (resource: LearningResource) => LearningResource,
  ) => void;
  removeResource: (resourceId: string) => void;
  onUploadFile: (file: File) => Promise<string>;
}) {
  const typeLabel = resourceTypeLabels[item.type];

  const uploadAndAttach = async (file: File) => {
    const url = await onUploadFile(file);
    updateResource(moduleId, sectionId, item.id, (resource) => ({ ...resource, url }));
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-end">
        <Button variant="destructive" size="sm" onClick={() => removeResource(item.id)}>
          <IconTrash className="size-4" />
          Remove Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Title</label>
          <Input
            value={item.title}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                title: event.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Item ID</label>
          <Input value={item.id} disabled />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Type</label>
          <div className="flex items-center gap-2">
            <Badge variant="info">{typeLabel}</Badge>
            <span className="text-xs text-on-surface-variant">(Fixed)</span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
          <Input
            value={item.duration}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                duration: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
        <Textarea
          className="min-h-20"
          value={item.description}
          onChange={(event) =>
            updateResource(moduleId, sectionId, item.id, (resource) => ({
              ...resource,
              description: event.target.value,
            }))
          }
          placeholder="Summarize what this content covers."
        />
      </div>

      {/* Video-specific fields */}
      {item.type === 'video' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Video URL</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="YouTube, Vimeo URL, or video file URL"
          />
          <p className="mb-2 mt-1 text-xs text-on-surface-variant">
            Paste a link above, or upload a video file to replace it.
          </p>
          <FileUploader kind="video" previewUrl={item.url || undefined} onUpload={uploadAndAttach} />
        </div>
      )}

      {/* PDF-specific fields */}
      {item.type === 'pdf' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">PDF URL or File</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="Link to PDF document"
          />
          <p className="mb-2 mt-1 text-xs text-on-surface-variant">
            Paste a link above, or upload a PDF document to replace it.
          </p>
          <FileUploader kind="pdf" previewUrl={item.url || undefined} onUpload={uploadAndAttach} />
        </div>
      )}

      {/* Link-specific fields */}
      {item.type === 'link' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">External URL</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
            placeholder="Full URL to external resource"
          />
        </div>
      )}

      {/* Text-specific fields */}
      {item.type === 'text' && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson Content</label>
          <Textarea
            className="min-h-40"
            value={item.content ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                content: event.target.value,
              }))
            }
            placeholder="Write the full lesson content here."
          />
        </div>
      )}

      {/* Exam-specific fields */}
      {item.type === 'exam' && (
        <>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Format</label>
            <Select
              value={item.examFormat ?? 'text'}
              onChange={(event) => {
                const examFormat = event.target.value as ExamFormat;
                updateResource(moduleId, sectionId, item.id, (resource) => ({
                  ...resource,
                  examFormat,
                  questions: resource.questions
                    ? applyFormatToQuestions(resource.questions, examFormat)
                    : resource.questions,
                }));
              }}
              options={[
                { label: 'Text-Based (Short Answer)', value: 'text' },
                { label: 'Multiple Choice', value: 'multiple-choice' },
              ]}
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Instructions</label>
            <Textarea
              className="min-h-32"
              value={item.content ?? ''}
              onChange={(event) =>
                updateResource(moduleId, sectionId, item.id, (resource) => ({
                  ...resource,
                  content: event.target.value,
                }))
              }
              placeholder="Explain the exam rules, time limits, and instructions."
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Number of Questions</label>
              <Input
                type="number"
                min={1}
                value={item.questions?.length ? item.questions.length : (item.questionCount ?? 0)}
                disabled={Boolean(item.questions?.length)}
                onChange={(event) =>
                  updateResource(moduleId, sectionId, item.id, (resource) => ({
                    ...resource,
                    questionCount: Number(event.target.value || 0),
                  }))
                }
              />
              {item.questions?.length ? (
                <p className="mt-1 text-xs text-on-surface-variant">
                  Managed by the question configuration below.
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={item.passingScore ?? 0}
                onChange={(event) =>
                  updateResource(moduleId, sectionId, item.id, (resource) => ({
                    ...resource,
                    passingScore: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
          </div>

          <ExamQuestionsEditor
            format={item.examFormat ?? 'text'}
            questions={item.questions ?? []}
            onChange={(questions) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                questions: questions.length > 0 ? questions : undefined,
                questionCount: questions.length > 0 ? questions.length : resource.questionCount,
              }))
            }
          />
        </>
      )}
    </div>
  );
}
