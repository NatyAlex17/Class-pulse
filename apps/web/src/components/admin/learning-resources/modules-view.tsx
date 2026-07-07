'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconBook2,
  IconClipboardText,
  IconEdit,
  IconEye,
  IconHierarchy3,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

import { ConfigBanner, DeleteConfirmModal, PageToolbar, RowIconButton, type DeleteConfirmState } from './shared';
import { formatMoney, getItemCount, getModuleHref, slugify, type ModuleRow } from './types';
import type { LearningResourcesStore } from './use-learning-resources-config';

const emptyModuleDraft = {
  title: '',
  summary: '',
  requiredHours: '10',
  moduleFee: '0',
  minimumHoursForCertification: '',
};

export function ModulesView({ store }: { store: LearningResourcesStore }) {
  const router = useRouter();
  const {
    config,
    setConfig,
    autoSaveConfig,
    error,
    success,
    setError,
    fetchConfig,
    saveConfig,
    resetConfig,
    resetting,
    saving,
  } = store;

  const [showModuleForm, setShowModuleForm] = React.useState(false);
  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = React.useState(emptyModuleDraft);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);

  if (!config) {
    return null;
  }

  const sortedModules = [...config.modules].sort((a, b) => a.order - b.order);

  const rows: ModuleRow[] = sortedModules.map((module) => ({
    id: module.id,
    title: module.title,
    requiredHours: module.requiredHours,
    moduleFee: module.moduleFee,
    sections: module.sections.length,
    items: getItemCount(module),
  }));

  const columns: DataTableColumn<ModuleRow>[] = [
    { id: 'title', header: 'Module', accessorKey: 'title' },
    { id: 'requiredHours', header: 'Hours', accessorKey: 'requiredHours' },
    { id: 'moduleFee', header: 'Fee', cell: (row) => <span className="font-medium">{formatMoney(row.moduleFee)}</span> },
    { id: 'sections', header: 'Lessons', accessorKey: 'sections' },
    { id: 'items', header: 'Learning Activities', accessorKey: 'items' },
  ];

  return (
    <AdminShell
      title="Learning Management Config"
      subtitle="Start with the module list, then open one module to manage its lessons."
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Modules</p>
              <IconBook2 className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">{config.modules.length}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Lessons</p>
              <IconHierarchy3 className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
              {config.modules.reduce((sum, module) => sum + module.sections.length, 0)}
            </p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Learning Activities</p>
              <IconClipboardText className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
              {config.modules.reduce((sum, module) => sum + getItemCount(module), 0)}
            </p>
          </div>
        </div>

        <Modal
          open={showModuleForm}
          onClose={() => {
            setShowModuleForm(false);
            setEditingModuleId(null);
            setModuleDraft(emptyModuleDraft);
          }}
          title={editingModuleId ? 'Edit Module' : 'Create Module'}
          description={
            editingModuleId
              ? 'Update module details, order, and certification requirements.'
              : 'Add the module first, then open it to create lessons inside it.'
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title *</label>
              <Input
                value={moduleDraft.title}
                onChange={(event) =>
                  setModuleDraft((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g., Foundation of Patient Care"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours *</label>
              <Input
                type="number"
                min={1}
                value={moduleDraft.requiredHours}
                onChange={(event) =>
                  setModuleDraft((current) => ({ ...current, requiredHours: event.target.value }))
                }
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Module Fee (USD) *</label>
            <Input
              type="number"
              min={0}
              value={moduleDraft.moduleFee}
              onChange={(event) =>
                setModuleDraft((current) => ({ ...current, moduleFee: event.target.value }))
              }
              placeholder="e.g., 750"
            />
            <p className="mt-1 text-xs text-on-surface-variant">Set the price charged for this module.</p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module Order</label>
              <Input
                type="number"
                min={0}
                value={
                  editingModuleId
                    ? (config.modules.find((m) => m.id === editingModuleId)?.order ?? 0)
                    : config.modules.length
                }
                disabled
              />
              <p className="mt-1 text-xs text-on-surface-variant">Auto-assigned based on creation order</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                Min Hours for Certification
              </label>
              <Input
                type="number"
                min={0}
                value={moduleDraft.minimumHoursForCertification}
                onChange={(event) =>
                  setModuleDraft((current) => ({
                    ...current,
                    minimumHoursForCertification: event.target.value,
                  }))
                }
                placeholder="Leave blank if no requirement"
              />
              <p className="mt-1 text-xs text-on-surface-variant">Hours before certification is unlocked</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Summary *</label>
            <Textarea
              className="min-h-24"
              value={moduleDraft.summary}
              onChange={(event) =>
                setModuleDraft((current) => ({ ...current, summary: event.target.value }))
              }
              placeholder="Describe what students will learn in this module"
            />
          </div>

          <div className="mt-5">
            <Button
              onClick={() => {
                const title = moduleDraft.title.trim();
                const summary = moduleDraft.summary.trim();
                const requiredHours = Number(moduleDraft.requiredHours);
                const moduleFee = Number(moduleDraft.moduleFee);
                const minimumHours = moduleDraft.minimumHoursForCertification
                  ? Number(moduleDraft.minimumHoursForCertification)
                  : undefined;

                if (!title || !summary || requiredHours <= 0 || !Number.isFinite(moduleFee) || moduleFee < 0) {
                  setError('Module title, summary, required hours, and a valid module fee are required.');
                  return;
                }

                if (editingModuleId) {
                  const updatedConfig = {
                    ...config,
                    modules: config.modules.map((m) =>
                      m.id === editingModuleId
                        ? {
                            ...m,
                            title,
                            summary,
                            requiredHours,
                            moduleFee,
                            minimumHoursForCertification: minimumHours,
                          }
                        : m,
                    ),
                  };

                  setConfig(updatedConfig);
                  autoSaveConfig(updatedConfig);
                  setEditingModuleId(null);
                } else {
                  const id = slugify(title);

                  if (config.modules.some((module) => module.id === id)) {
                    setError('A module with this title already exists. Please use a different title.');
                    return;
                  }

                  const nextOrder = Math.max(...config.modules.map((m) => m.order), -1) + 1;

                  const updatedConfig = {
                    ...config,
                    modules: [
                      ...config.modules,
                      {
                        id,
                        title,
                        summary,
                        requiredHours,
                        moduleFee,
                        order: nextOrder,
                        minimumHoursForCertification: minimumHours,
                        sections: [],
                      },
                    ],
                  };

                  setConfig(updatedConfig);
                  autoSaveConfig(updatedConfig);
                }
                setModuleDraft(emptyModuleDraft);
                setShowModuleForm(false);
                setError(null);
              }}
            >
              <IconPlus className="size-4" />
              {editingModuleId ? 'Update Module' : 'Create Module'}
            </Button>
          </div>
        </Modal>

        <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Modules</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Click a module row to open its detail page and manage lessons.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingModuleId(null);
                setModuleDraft(emptyModuleDraft);
                setShowModuleForm(true);
              }}
            >
              <IconPlus className="size-4" />
              Add Module
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            onRowClick={(row) => router.push(getModuleHref(row.id))}
            mobileCardTitle={(row) => row.title}
            mobileCardSubtitle={(row) =>
              `${row.sections} lessons • ${row.items} learning activities • ${formatMoney(row.moduleFee)}`
            }
            rowActions={(row) => {
              const module = config.modules.find((m) => m.id === row.id);
              return (
                <div className="flex items-center gap-1">
                  <RowIconButton
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (module) {
                        setModuleDraft({
                          title: module.title,
                          summary: module.summary,
                          requiredHours: String(module.requiredHours),
                          moduleFee: String(module.moduleFee),
                          minimumHoursForCertification: String(
                            module.minimumHoursForCertification ?? '',
                          ),
                        });
                        setEditingModuleId(module.id);
                        setShowModuleForm(true);
                      }
                    }}
                  >
                    <IconEdit className="size-4" />
                  </RowIconButton>
                  <Link href={getModuleHref(row.id)} onClick={(e) => e.stopPropagation()}>
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
                        title: 'Delete Module?',
                        description: `"${row.title}" and all its lessons will be permanently removed.`,
                        confirmLabel: 'Delete Module',
                        onConfirm: () => {
                          const updatedConfig = {
                            ...config,
                            modules: config.modules
                              .filter((m) => m.id !== row.id)
                              .sort((a, b) => a.order - b.order)
                              .map((m, index) => ({ ...m, order: index })),
                          };
                          setConfig(updatedConfig);
                          autoSaveConfig(updatedConfig);
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
