'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconChevronRight, IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { ExamQuestionsEditor } from './exam-questions-editor';
import { SectionItemEditor } from './section-item-editor';
import { ConfigBanner, DeleteConfirmModal, PageToolbar, RowIconButton, type DeleteConfirmState } from './shared';
import {
  applyFormatToQuestions,
  fileInputClassName,
  formatFileSize,
  getModuleHref,
  resizeExamQuestions,
  resourceTypeLabels,
  resourceTypeOptions,
  slugify,
  sourceModeOptions,
  type ExamFormat,
  type ExamQuestion,
  type LearningResource,
  type ResourceRow,
  type ResourceType,
} from './types';
import type { LearningResourcesStore } from './use-learning-resources-config';

const emptyItemDraft = {
  title: '',
  type: 'video' as ResourceType,
  duration: '',
  description: '',
  url: '',
  content: '',
  questionCount: '10',
  passingScore: '70',
  examFormat: 'text' as ExamFormat,
};

export function SectionDetailView({
  store,
  moduleId,
  sectionId,
}: {
  store: LearningResourcesStore;
  moduleId?: string;
  sectionId?: string;
}) {
  const router = useRouter();
  const {
    config,
    setConfig,
    autoSaveConfig,
    updateSection,
    updateResource,
    uploadFile,
    error,
    success,
    setError,
    fetchConfig,
    saveConfig,
    resetConfig,
    resetting,
    saving,
  } = store;

  const [showSectionDetail, setShowSectionDetail] = React.useState(false);
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [showItemDetail, setShowItemDetail] = React.useState(false);
  const [itemDraft, setItemDraft] = React.useState(emptyItemDraft);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);
  const [itemSource, setItemSource] = React.useState<'url' | 'upload'>('url');
  const [itemFile, setItemFile] = React.useState<File | null>(null);
  const [uploadingItem, setUploadingItem] = React.useState(false);
  const [examQuestions, setExamQuestions] = React.useState<ExamQuestion[]>([]);

  const selectedModule = config?.modules.find((module) => module.id === moduleId) ?? null;
  const selectedSection = selectedModule?.sections.find((section) => section.id === sectionId) ?? null;

  const selectedItem = React.useMemo(() => {
    if (!selectedSection) {
      return null;
    }

    return (
      selectedSection.resources.find((resource) => resource.id === selectedItemId) ??
      selectedSection.resources[0] ??
      null
    );
  }, [selectedItemId, selectedSection]);

  React.useEffect(() => {
    if (!selectedSection?.resources.length) {
      setSelectedItemId(null);
      return;
    }

    if (!selectedItemId || !selectedSection.resources.some((resource) => resource.id === selectedItemId)) {
      setSelectedItemId(selectedSection.resources[0].id);
    }
  }, [selectedItemId, selectedSection]);

  if (!config || !selectedModule || !selectedSection) {
    return null;
  }

  const itemRows: ResourceRow[] = selectedSection.resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    type: resource.type,
    duration: resource.duration,
  }));

  const columns: DataTableColumn<ResourceRow>[] = [
    { id: 'title', header: 'Learning Item', accessorKey: 'title' },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => (
        <Badge variant={row.type === 'exam' ? 'warning' : 'info'}>{resourceTypeLabels[row.type]}</Badge>
      ),
    },
    { id: 'duration', header: 'Duration', accessorKey: 'duration' },
  ];

  return (
    <AdminShell
      title={selectedSection.title}
      subtitle="Manage this section and all its learning items."
      topActions={
        <PageToolbar
          onRefresh={() => void fetchConfig()}
          onReset={() => void resetConfig()}
          onSave={() => void saveConfig()}
          resetting={resetting}
          saving={saving}
        />
      }
    >
      <div className="space-y-6">
        <ConfigBanner error={error} success={success} />
        <DeleteConfirmModal state={deleteConfirm} onCancel={() => setDeleteConfirm(null)} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link href="/admin/configurations/learning-resources" className="hover:text-primary">
              Modules
            </Link>
            <IconChevronRight className="size-4" />
            <Link href={getModuleHref(selectedModule.id)} className="hover:text-primary">
              {selectedModule.title}
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-on-surface">{selectedSection.title}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowSectionDetail(true)}>
            <IconEye className="size-4" />
            Show Section Details
          </Button>
        </div>

        <Modal
          open={showSectionDetail}
          onClose={() => setShowSectionDetail(false)}
          title="Section Details"
          description="Edit the section here. Changes are saved automatically."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Section Title</label>
              <Input
                value={selectedSection.title}
                onChange={(event) =>
                  updateSection(selectedModule.id, selectedSection.id, (section) => ({
                    ...section,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module</label>
              <Input value={selectedModule.title} disabled />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
            <Textarea
              className="min-h-24"
              value={selectedSection.description}
              onChange={(event) =>
                updateSection(selectedModule.id, selectedSection.id, (section) => ({
                  ...section,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeleteConfirm({
                  title: 'Delete Section?',
                  description: `"${selectedSection.title}" and all its items will be permanently removed.`,
                  confirmLabel: 'Delete Section',
                  onConfirm: () => {
                    const updatedConfig = {
                      ...config,
                      modules: config.modules.map((m) =>
                        m.id === selectedModule.id
                          ? {
                              ...m,
                              sections: m.sections.filter((section) => section.id !== selectedSection.id),
                            }
                          : m,
                      ),
                    };
                    setConfig(updatedConfig);
                    autoSaveConfig(updatedConfig);
                    setShowSectionDetail(false);
                    router.push(getModuleHref(selectedModule.id));
                  },
                });
              }}
            >
              <IconTrash className="size-4" />
              Remove Section
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowSectionDetail(false)}>
              Done
            </Button>
          </div>
        </Modal>

        <Modal
          open={showItemForm}
          onClose={() => setShowItemForm(false)}
          title="Create Learning Item"
          description={`Select the type of content to add to "${selectedSection.title}".`}
          size="xl"
        >
          {/* Basic Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Title</label>
              <Input
                value={itemDraft.title}
                onChange={(event) =>
                  setItemDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g., Module Overview Video"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Content Type *</label>
              <Select
                value={itemDraft.type}
                onChange={(event) => {
                  const newType = event.target.value as ResourceType;
                  setItemDraft((current) => ({
                    ...current,
                    type: newType,
                    url: '',
                    content: '',
                  }));
                  setItemSource('url');
                  setItemFile(null);
                  setExamQuestions(
                    newType === 'exam'
                      ? resizeExamQuestions([], Math.max(1, Number(itemDraft.questionCount) || 0), itemDraft.examFormat)
                      : [],
                  );
                }}
                options={resourceTypeOptions}
              />
            </div>
          </div>

          {/* Type-specific content */}
          {itemDraft.type === 'video' && (
            <>
              <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                Upload a video file (MP4, WebM) or paste a YouTube/Vimeo URL.
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Video Source *</label>
                  <Select
                    value={itemSource}
                    onChange={(event) => {
                      setItemSource(event.target.value as 'url' | 'upload');
                      setItemFile(null);
                    }}
                    options={sourceModeOptions}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                  <Input
                    value={itemDraft.duration}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, duration: event.target.value }))
                    }
                    placeholder="e.g., 15 min, 1 hr 20 min"
                  />
                </div>
              </div>
              {itemSource === 'url' ? (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Video URL</label>
                  <Input
                    value={itemDraft.url}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Video File *</label>
                  <input
                    type="file"
                    accept="video/*"
                    className={fileInputClassName}
                    onChange={(event) => setItemFile(event.target.files?.[0] ?? null)}
                  />
                  {itemFile ? (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Selected: {itemFile.name} ({formatFileSize(itemFile.size)})
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-on-surface-variant">MP4, WebM, and other video formats.</p>
                  )}
                </div>
              )}
            </>
          )}

          {itemDraft.type === 'pdf' && (
            <>
              <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                Upload a PDF document or provide a link to a PDF file.
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">PDF Source *</label>
                  <Select
                    value={itemSource}
                    onChange={(event) => {
                      setItemSource(event.target.value as 'url' | 'upload');
                      setItemFile(null);
                    }}
                    options={sourceModeOptions}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                  <Input
                    value={itemDraft.duration}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, duration: event.target.value }))
                    }
                    placeholder="e.g., 12 pages, 30 min read"
                  />
                </div>
              </div>
              {itemSource === 'url' ? (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">PDF URL</label>
                  <Input
                    value={itemDraft.url}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">PDF File *</label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className={fileInputClassName}
                    onChange={(event) => setItemFile(event.target.files?.[0] ?? null)}
                  />
                  {itemFile ? (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Selected: {itemFile.name} ({formatFileSize(itemFile.size)})
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-on-surface-variant">PDF documents only.</p>
                  )}
                </div>
              )}
            </>
          )}

          {itemDraft.type === 'link' && (
            <>
              <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                Link to external resources like documentation, articles, or reference materials.
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">External URL *</label>
                  <Input
                    value={itemDraft.url}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder="https://example.com/article"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                  <Input
                    value={itemDraft.duration}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, duration: event.target.value }))
                    }
                    placeholder="e.g., 15 min, varies"
                  />
                </div>
              </div>
            </>
          )}

          {itemDraft.type === 'text' && (
            <>
              <div className="mt-4 rounded-[14px] border border-info/20 bg-info/5 p-3 text-sm text-on-surface">
                Write a lesson, guide, or instructional content directly in the system.
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                <Input
                  value={itemDraft.duration}
                  onChange={(event) =>
                    setItemDraft((current) => ({ ...current, duration: event.target.value }))
                  }
                  placeholder="e.g., 10 min read, 20 min"
                />
              </div>
            </>
          )}

          {itemDraft.type === 'exam' && (
            <>
              <div className="mt-4 rounded-[14px] border border-warning/20 bg-warning/5 p-3 text-sm text-on-surface">
                Create an assessment. Choose between text-based short answer or multiple choice format.
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Exam Format *</label>
                  <Select
                    value={itemDraft.examFormat}
                    onChange={(event) => {
                      const examFormat = event.target.value as ExamFormat;
                      setItemDraft((current) => ({ ...current, examFormat }));
                      setExamQuestions((current) => applyFormatToQuestions(current, examFormat));
                    }}
                    options={[
                      { label: 'Text-Based (Short Answer)', value: 'text' },
                      { label: 'Multiple Choice', value: 'multiple-choice' },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                  <Input
                    value={itemDraft.duration}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, duration: event.target.value }))
                    }
                    placeholder="e.g., 30 minutes, 1 hour"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Number of Questions *</label>
                  <Input
                    type="number"
                    min={1}
                    value={itemDraft.questionCount}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setItemDraft((current) => ({ ...current, questionCount: raw }));
                      const count = Math.max(0, Math.min(100, Math.floor(Number(raw) || 0)));
                      setExamQuestions((current) =>
                        resizeExamQuestions(current, count, itemDraft.examFormat),
                      );
                    }}
                    placeholder="e.g., 20"
                  />
                  <p className="mt-1 text-xs text-on-surface-variant">
                    A configuration card is created for each question below.
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score (%) *</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={itemDraft.passingScore}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, passingScore: event.target.value }))
                    }
                    placeholder="e.g., 70"
                  />
                </div>
              </div>

              <ExamQuestionsEditor
                format={itemDraft.examFormat}
                questions={examQuestions}
                onChange={(questions) => {
                  setExamQuestions(questions);
                  setItemDraft((current) => ({ ...current, questionCount: String(questions.length) }));
                }}
              />
            </>
          )}

          {/* Description - always shown */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
            <Textarea
              className="min-h-20"
              value={itemDraft.description}
              onChange={(event) =>
                setItemDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What is this content about? Who should complete it?"
            />
          </div>

          {/* Content - for text and exam */}
          {['text', 'exam'].includes(itemDraft.type) && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                {itemDraft.type === 'text' ? 'Lesson Content *' : 'Exam Instructions *'}
              </label>
              <Textarea
                className="min-h-40"
                value={itemDraft.content}
                onChange={(event) =>
                  setItemDraft((current) => ({ ...current, content: event.target.value }))
                }
                placeholder={
                  itemDraft.type === 'text'
                    ? 'Write your lesson content here. Include all instructional materials and examples.'
                    : 'Add exam instructions, rules, or any guidance students should know before starting.'
                }
              />
            </div>
          )}

          <div className="mt-6">
            <Button
              disabled={uploadingItem}
              onClick={async () => {
                const title = itemDraft.title.trim();
                const duration = itemDraft.duration.trim();
                const id = slugify(title);

                if (!title || !duration) {
                  setError('Item title and duration are required.');
                  return;
                }

                if (itemDraft.type === 'link' && !itemDraft.url.trim()) {
                  setError('Link items require a URL.');
                  return;
                }

                if (
                  ['video', 'pdf'].includes(itemDraft.type) &&
                  itemSource === 'upload' &&
                  !itemFile
                ) {
                  setError('Choose a file to upload, or switch the source to a link.');
                  return;
                }

                if (itemDraft.type === 'text' && !itemDraft.content.trim()) {
                  setError('Text lessons require content.');
                  return;
                }

                if (itemDraft.type === 'exam') {
                  if (!itemDraft.content.trim()) {
                    setError('Exams require instructions.');
                    return;
                  }
                  if (examQuestions.length === 0) {
                    setError('Exam must have at least 1 question.');
                    return;
                  }

                  for (let i = 0; i < examQuestions.length; i++) {
                    const question = examQuestions[i];

                    if (!question.prompt.trim()) {
                      setError(`Question ${i + 1} needs a prompt.`);
                      return;
                    }
                    if (!Number.isFinite(question.points) || question.points <= 0) {
                      setError(`Question ${i + 1} needs marks greater than zero.`);
                      return;
                    }
                    if (itemDraft.examFormat === 'multiple-choice') {
                      const filledOptions = (question.options ?? []).filter((option) => option.trim());
                      if (filledOptions.length < 2) {
                        setError(`Question ${i + 1} needs at least two options.`);
                        return;
                      }
                      if (
                        question.correctOption === undefined ||
                        !(question.options ?? [])[question.correctOption]?.trim()
                      ) {
                        setError(`Question ${i + 1} needs a correct answer selected.`);
                        return;
                      }
                    }
                  }
                }

                if (selectedSection.resources.some((resource) => resource.id === id)) {
                  setError('An item with this title already exists in this section.');
                  return;
                }

                let resourceUrl = itemDraft.url.trim();

                if (['video', 'pdf'].includes(itemDraft.type) && itemSource === 'upload' && itemFile) {
                  try {
                    setUploadingItem(true);
                    setError(null);
                    resourceUrl = await uploadFile(itemFile);
                  } catch (uploadError) {
                    setError(
                      uploadError instanceof Error ? uploadError.message : 'Failed to upload file.',
                    );
                    return;
                  } finally {
                    setUploadingItem(false);
                  }
                }

                const builtQuestions: ExamQuestion[] | undefined =
                  itemDraft.type === 'exam'
                    ? examQuestions.map((question, i) => {
                        if (itemDraft.examFormat === 'multiple-choice') {
                          const filled = (question.options ?? [])
                            .map((option, idx) => ({ text: option.trim(), idx }))
                            .filter((option) => option.text);
                          return {
                            id: `${id}-q${i + 1}`,
                            prompt: question.prompt.trim(),
                            points: question.points,
                            options: filled.map((option) => option.text),
                            correctOption: filled.findIndex(
                              (option) => option.idx === question.correctOption,
                            ),
                          };
                        }
                        return {
                          id: `${id}-q${i + 1}`,
                          prompt: question.prompt.trim(),
                          points: question.points,
                          expectedAnswer: question.expectedAnswer?.trim() || undefined,
                        };
                      })
                    : undefined;

                const item: LearningResource = {
                  id,
                  title,
                  type: itemDraft.type,
                  duration,
                  description: itemDraft.description.trim(),
                  url: ['video', 'pdf', 'link'].includes(itemDraft.type)
                    ? resourceUrl || undefined
                    : undefined,
                  content: ['text', 'exam'].includes(itemDraft.type)
                    ? itemDraft.content.trim() || undefined
                    : undefined,
                  questionCount: itemDraft.type === 'exam' ? builtQuestions?.length : undefined,
                  passingScore: itemDraft.type === 'exam' ? Number(itemDraft.passingScore || 0) : undefined,
                  examFormat: itemDraft.type === 'exam' ? itemDraft.examFormat : undefined,
                  questions: builtQuestions,
                };

                const updatedConfig = {
                  ...config,
                  modules: config.modules.map((m) =>
                    m.id === selectedModule.id
                      ? {
                          ...m,
                          sections: m.sections.map((s) =>
                            s.id === selectedSection.id
                              ? {
                                  ...s,
                                  resources: [...s.resources, item],
                                }
                              : s,
                          ),
                        }
                      : m,
                  ),
                };

                setConfig(updatedConfig);
                autoSaveConfig(updatedConfig);
                setSelectedItemId(id);
                setItemDraft(emptyItemDraft);
                setItemSource('url');
                setItemFile(null);
                setExamQuestions([]);
                setShowItemForm(false);
                setError(null);
              }}
            >
              <IconPlus className="size-4" />
              {uploadingItem ? 'Uploading...' : 'Create Item'}
            </Button>
          </div>
        </Modal>

        <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Section Items</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Click a row to open that item&apos;s details in a popup.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">{selectedSection.resources.length} items</Badge>
              <Button size="sm" onClick={() => setShowItemForm(true)}>
                <IconPlus className="size-4" />
                Add Item
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={itemRows}
            getRowId={(row) => row.id}
            onRowClick={(row) => {
              setSelectedItemId(row.id);
              setShowItemDetail(true);
            }}
            mobileCardTitle={(row) => row.title}
            mobileCardSubtitle={(row) => `${resourceTypeLabels[row.type]} • ${row.duration}`}
            rowActions={(row) => {
              const item = selectedSection.resources.find((r) => r.id === row.id);
              return (
                <div className="flex items-center gap-1">
                  <RowIconButton
                    title="Edit"
                    active={selectedItemId === row.id && showItemDetail}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(row.id);
                      setShowItemDetail(true);
                    }}
                  >
                    <IconEdit className="size-4" />
                  </RowIconButton>
                  <RowIconButton
                    title="Delete"
                    destructive
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!item) {
                        return;
                      }
                      setDeleteConfirm({
                        title: 'Delete Item?',
                        description: `"${item.title}" will be permanently removed from this section.`,
                        confirmLabel: 'Delete Item',
                        onConfirm: () => {
                          const updatedConfig = {
                            ...config,
                            modules: config.modules.map((m) =>
                              m.id === selectedModule.id
                                ? {
                                    ...m,
                                    sections: m.sections.map((s) =>
                                      s.id === selectedSection.id
                                        ? {
                                            ...s,
                                            resources: s.resources.filter((r) => r.id !== row.id),
                                          }
                                        : s,
                                    ),
                                  }
                                : m,
                            ),
                          };

                          setConfig(updatedConfig);
                          autoSaveConfig(updatedConfig);
                          if (selectedItemId === row.id) {
                            setSelectedItemId(null);
                            setShowItemDetail(false);
                          }
                        },
                      });
                    }}
                  >
                    <IconTrash className="size-4" />
                  </RowIconButton>
                </div>
              );
            }}
          />
        </div>

        {selectedSection.resources.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-8 text-center text-sm text-on-surface-variant">
            No items yet. Add your first learning item to start building this section.
          </div>
        ) : null}

        {selectedItem ? (
          <Modal
            open={showItemDetail}
            onClose={() => setShowItemDetail(false)}
            title={selectedItem.title}
            description={`Edit this ${resourceTypeLabels[selectedItem.type].toLowerCase()} item. Changes are saved automatically.`}
            size="xl"
          >
            <SectionItemEditor
              item={selectedItem}
              moduleId={selectedModule.id}
              sectionId={selectedSection.id}
              updateResource={updateResource}
              onUploadFile={uploadFile}
              onError={setError}
              removeResource={(resourceId) => {
                const resource = selectedSection.resources.find((r) => r.id === resourceId);
                setDeleteConfirm({
                  title: 'Delete Item?',
                  description: `"${resource?.title ?? resourceId}" will be permanently removed from this section.`,
                  confirmLabel: 'Delete Item',
                  onConfirm: () => {
                    const updatedConfig = {
                      ...config,
                      modules: config.modules.map((m) =>
                        m.id === selectedModule.id
                          ? {
                              ...m,
                              sections: m.sections.map((s) =>
                                s.id === selectedSection.id
                                  ? {
                                      ...s,
                                      resources: s.resources.filter((r) => r.id !== resourceId),
                                    }
                                  : s,
                              ),
                            }
                          : m,
                      ),
                    };

                    setConfig(updatedConfig);
                    autoSaveConfig(updatedConfig);
                    setShowItemDetail(false);
                  },
                });
              }}
            />
          </Modal>
        ) : null}
      </div>
    </AdminShell>
  );
}
