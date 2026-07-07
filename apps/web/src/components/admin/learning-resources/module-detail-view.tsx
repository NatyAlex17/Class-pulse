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
import { Textarea } from '@/components/ui/textarea';

import { ConfigBanner, DeleteConfirmModal, PageToolbar, RowIconButton, type DeleteConfirmState } from './shared';
import { formatMoney, getSectionHref, slugify, type SectionRow } from './types';
import type { LearningResourcesStore } from './use-learning-resources-config';

const emptySectionDraft = { title: '', description: '' };

export function ModuleDetailView({
  store,
  moduleId,
}: {
  store: LearningResourcesStore;
  moduleId?: string;
}) {
  const router = useRouter();
  const {
    config,
    setConfig,
    autoSaveConfig,
    updateModule,
    error,
    success,
    setError,
    fetchConfig,
    saveConfig,
    resetConfig,
    resetting,
    saving,
  } = store;

  const [showModuleDetail, setShowModuleDetail] = React.useState(false);
  const [showSectionForm, setShowSectionForm] = React.useState(false);
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = React.useState(emptySectionDraft);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);

  const selectedModule = config?.modules.find((module) => module.id === moduleId) ?? null;

  if (!config || !selectedModule) {
    return null;
  }

  const sectionRows: SectionRow[] = selectedModule.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    items: section.resources.length,
  }));

  const columns: DataTableColumn<SectionRow>[] = [
    { id: 'title', header: 'Lesson', accessorKey: 'title' },
    { id: 'description', header: 'Description', accessorKey: 'description' },
    { id: 'items', header: 'Learning Activities', accessorKey: 'items' },
  ];

  return (
    <AdminShell
      title={selectedModule.title}
      subtitle="Manage this module and the lessons inside it."
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
            <span className="text-on-surface">{selectedModule.title}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowModuleDetail(true)}>
            <IconEye className="size-4" />
            Show Module Details
          </Button>
        </div>

        <Modal
          open={showModuleDetail}
          onClose={() => setShowModuleDetail(false)}
          title="Module Details"
          description="Edit the module here. Changes are saved automatically."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title</label>
              <Input
                value={selectedModule.title}
                onChange={(event) =>
                  updateModule(selectedModule.id, (module) => ({
                    ...module,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours</label>
              <Input
                type="number"
                min={1}
                value={selectedModule.requiredHours}
                onChange={(event) =>
                  updateModule(selectedModule.id, (module) => ({
                    ...module,
                    requiredHours: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Module Fee (USD)</label>
            <Input
              type="number"
              min={0}
              value={selectedModule.moduleFee}
              onChange={(event) =>
                updateModule(selectedModule.id, (module) => ({
                  ...module,
                  moduleFee: Math.max(0, Number(event.target.value || 0)),
                }))
              }
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              Current module fee: {formatMoney(selectedModule.moduleFee)}
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module Order</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={selectedModule.order}
                  disabled
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedModule.order === 0}
                  onClick={() => {
                    const previousModule = config.modules.find((m) => m.order === selectedModule.order - 1);
                    if (previousModule) {
                      updateModule(selectedModule.id, (m) => ({
                        ...m,
                        order: m.order - 1,
                      }));
                      updateModule(previousModule.id, (m) => ({
                        ...m,
                        order: m.order + 1,
                      }));
                    }
                  }}
                >
                  ↑
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedModule.order === config.modules.length - 1}
                  onClick={() => {
                    const nextModule = config.modules.find((m) => m.order === selectedModule.order + 1);
                    if (nextModule) {
                      updateModule(selectedModule.id, (m) => ({
                        ...m,
                        order: m.order + 1,
                      }));
                      updateModule(nextModule.id, (m) => ({
                        ...m,
                        order: m.order - 1,
                      }));
                    }
                  }}
                >
                  ↓
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                Min Hours for Certification
              </label>
              <Input
                type="number"
                min={0}
                value={selectedModule.minimumHoursForCertification ?? ''}
                onChange={(event) =>
                  updateModule(selectedModule.id, (module) => ({
                    ...module,
                    minimumHoursForCertification: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
                placeholder="Leave blank if no requirement"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Summary</label>
            <Textarea
              className="min-h-24"
              value={selectedModule.summary}
              onChange={(event) =>
                updateModule(selectedModule.id, (module) => ({
                  ...module,
                  summary: event.target.value,
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
                  title: 'Delete Module?',
                  description: `"${selectedModule.title}" and all its lessons will be permanently removed.`,
                  confirmLabel: 'Delete Module',
                  onConfirm: () => {
                    const updatedConfig = {
                      ...config,
                      modules: config.modules
                        .filter((module) => module.id !== selectedModule.id)
                        .sort((a, b) => a.order - b.order)
                        .map((m, index) => ({ ...m, order: index })),
                    };
                    setConfig(updatedConfig);
                    autoSaveConfig(updatedConfig);
                    setShowModuleDetail(false);
                    router.push('/admin/configurations/learning-resources');
                  },
                });
              }}
            >
              <IconTrash className="size-4" />
              Remove Module
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowModuleDetail(false)}>
              Done
            </Button>
          </div>
        </Modal>

        <Modal
          open={showSectionForm}
          onClose={() => {
            setShowSectionForm(false);
            setEditingSectionId(null);
            setSectionDraft(emptySectionDraft);
          }}
          title={editingSectionId ? 'Edit Lesson' : 'Create Lesson'}
          description={`${editingSectionId ? 'Update this lesson under' : 'Add a lesson under'} "${selectedModule.title}".`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson Title</label>
              <Input
                value={sectionDraft.title}
                onChange={(event) =>
                  setSectionDraft((current) => ({ ...current, title: event.target.value }))
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
              value={sectionDraft.description}
              onChange={(event) =>
                setSectionDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="mt-5">
            <Button
              onClick={() => {
                const title = sectionDraft.title.trim();
                const id = slugify(title);

                if (!title) {
                  setError('Lesson title is required.');
                  return;
                }

                if (editingSectionId) {
                  const updatedConfig = {
                    ...config,
                    modules: config.modules.map((m) =>
                      m.id === selectedModule.id
                        ? {
                            ...m,
                            sections: m.sections.map((s) =>
                              s.id === editingSectionId
                                ? {
                                    ...s,
                                    title,
                                    description: sectionDraft.description.trim(),
                                  }
                                : s,
                            ),
                          }
                        : m,
                    ),
                  };
                  setConfig(updatedConfig);
                  autoSaveConfig(updatedConfig);
                  setEditingSectionId(null);
                } else {
                  if (selectedModule.sections.some((section) => section.id === id)) {
                    setError('A lesson with this title already exists in this module.');
                    return;
                  }

                  const updatedConfig = {
                    ...config,
                    modules: config.modules.map((m) =>
                      m.id === selectedModule.id
                        ? {
                            ...m,
                            sections: [
                              ...m.sections,
                              {
                                id,
                                title,
                                description: sectionDraft.description.trim(),
                                resources: [],
                              },
                            ],
                          }
                        : m,
                    ),
                  };
                  setConfig(updatedConfig);
                  autoSaveConfig(updatedConfig);
                }
                setSectionDraft(emptySectionDraft);
                setShowSectionForm(false);
                setError(null);
              }}
            >
              <IconPlus className="size-4" />
              {editingSectionId ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </div>
        </Modal>

        <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Lessons</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Open a lesson to manage all learning activities inside it.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">{selectedModule.sections.length} lessons</Badge>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSectionId(null);
                  setSectionDraft(emptySectionDraft);
                  setShowSectionForm(true);
                }}
              >
                <IconPlus className="size-4" />
                Add Lesson
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={sectionRows}
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(getSectionHref(selectedModule.id, row.id))}
            mobileCardTitle={(row) => row.title}
            mobileCardSubtitle={(row) => `${row.items} learning activities`}
            rowActions={(row) => {
              const section = selectedModule.sections.find((s) => s.id === row.id);
              return (
                <div className="flex items-center gap-1">
                  <RowIconButton
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (section) {
                        setSectionDraft({
                          title: section.title,
                          description: section.description,
                        });
                        setEditingSectionId(section.id);
                        setShowSectionForm(true);
                      }
                    }}
                  >
                    <IconEdit className="size-4" />
                  </RowIconButton>
                  <Link href={getSectionHref(selectedModule.id, row.id)} onClick={(e) => e.stopPropagation()}>
                    <RowIconButton title="Open">
                      <IconEye className="size-4" />
                    </RowIconButton>
                  </Link>
                  <RowIconButton
                    title="Delete"
                    destructive
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({
                        title: 'Delete Lesson?',
                        description: `"${row.title}" and all its learning activities will be permanently removed.`,
                        confirmLabel: 'Delete Lesson',
                        onConfirm: () => {
                          updateModule(selectedModule.id, (module) => ({
                            ...module,
                            sections: module.sections.filter((s) => s.id !== row.id),
                          }));
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
      </div>
    </AdminShell>
  );
}
