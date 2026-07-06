'use client';

import * as React from 'react';
import {
  IconBook2,
  IconCurrencyDollar,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUsersGroup,
} from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  ConfigBanner,
  DeleteConfirmModal,
  PageToolbar,
  RowIconButton,
  type DeleteConfirmState,
} from '../learning-resources/shared';
import { slugify } from '../learning-resources/types';
import { useCohortsConfig, type CohortDefinition } from './use-cohorts-config';

type CohortRow = {
  id: string;
  name: string;
  modules: number;
  feeAmount: number;
  isOpen: boolean;
};

const emptyCohortDraft = {
  name: '',
  description: '',
  feeAmount: '',
  isOpen: 'open',
  moduleIds: [] as string[],
};

function formatFee(amount: number) {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function CohortsConfigView() {
  const {
    config,
    setConfig,
    moduleOptions,
    loading,
    saving,
    resetting,
    error,
    success,
    setError,
    fetchConfig,
    saveConfig,
    resetConfig,
    autoSaveConfig,
  } = useCohortsConfig();

  const [showCohortForm, setShowCohortForm] = React.useState(false);
  const [editingCohortId, setEditingCohortId] = React.useState<string | null>(null);
  const [cohortDraft, setCohortDraft] = React.useState(emptyCohortDraft);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);

  if (loading) {
    return (
      <AdminShell title="Cohorts" subtitle="Loading cohort configuration.">
        <div className="p-8 text-center">Loading cohort configuration...</div>
      </AdminShell>
    );
  }

  if (!config) {
    return (
      <AdminShell title="Cohorts" subtitle="Group modules into cohorts students can register for.">
        <ConfigBanner error={error} success={success} />
      </AdminShell>
    );
  }

  const rows: CohortRow[] = config.cohorts.map((cohort) => ({
    id: cohort.id,
    name: cohort.name,
    modules: cohort.moduleIds.length,
    feeAmount: cohort.feeAmount,
    isOpen: cohort.isOpen,
  }));

  const columns: DataTableColumn<CohortRow>[] = [
    { id: 'name', header: 'Cohort', accessorKey: 'name' },
    { id: 'modules', header: 'Modules', accessorKey: 'modules' },
    {
      id: 'feeAmount',
      header: 'Fee',
      cell: (row) => <span className="font-medium">{formatFee(row.feeAmount)}</span>,
    },
    {
      id: 'isOpen',
      header: 'Registration',
      cell: (row) => (
        <Badge variant={row.isOpen ? 'success' : 'neutral'}>{row.isOpen ? 'Open' : 'Closed'}</Badge>
      ),
    },
  ];

  const openCreateForm = () => {
    setEditingCohortId(null);
    setCohortDraft(emptyCohortDraft);
    setShowCohortForm(true);
  };

  const openEditForm = (cohort: CohortDefinition) => {
    setCohortDraft({
      name: cohort.name,
      description: cohort.description,
      feeAmount: String(cohort.feeAmount),
      isOpen: cohort.isOpen ? 'open' : 'closed',
      moduleIds: [...cohort.moduleIds],
    });
    setEditingCohortId(cohort.id);
    setShowCohortForm(true);
  };

  const closeForm = () => {
    setShowCohortForm(false);
    setEditingCohortId(null);
    setCohortDraft(emptyCohortDraft);
  };

  const toggleDraftModule = (moduleId: string) => {
    setCohortDraft((current) => ({
      ...current,
      moduleIds: current.moduleIds.includes(moduleId)
        ? current.moduleIds.filter((id) => id !== moduleId)
        : [...current.moduleIds, moduleId],
    }));
  };

  const submitCohortForm = () => {
    const name = cohortDraft.name.trim();
    const feeAmount = Number(cohortDraft.feeAmount);

    if (!name) {
      setError('Cohort name is required.');
      return;
    }

    if (!Number.isFinite(feeAmount) || feeAmount < 0) {
      setError('Fee amount must be zero or more.');
      return;
    }

    if (cohortDraft.moduleIds.length === 0) {
      setError('Select at least one module for this cohort.');
      return;
    }

    const shared = {
      name,
      description: cohortDraft.description.trim(),
      moduleIds: cohortDraft.moduleIds,
      feeAmount,
      isOpen: cohortDraft.isOpen === 'open',
    };

    let updatedConfig;

    if (editingCohortId) {
      updatedConfig = {
        ...config,
        cohorts: config.cohorts.map((cohort) =>
          cohort.id === editingCohortId ? { ...cohort, ...shared } : cohort,
        ),
      };
    } else {
      const id = slugify(name);

      if (config.cohorts.some((cohort) => cohort.id === id)) {
        setError('A cohort with this name already exists. Please use a different name.');
        return;
      }

      updatedConfig = {
        ...config,
        cohorts: [...config.cohorts, { id, ...shared }],
      };
    }

    setConfig(updatedConfig);
    autoSaveConfig(updatedConfig);
    closeForm();
    setError(null);
  };

  return (
    <AdminShell
      title="Cohorts"
      subtitle="Group modules into cohorts students register for, and set the program fee."
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
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Cohorts</p>
              <IconUsersGroup className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">{config.cohorts.length}</p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Open for Registration
              </p>
              <IconBook2 className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
              {config.cohorts.filter((cohort) => cohort.isOpen).length}
            </p>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Average Fee</p>
              <IconCurrencyDollar className="size-5 text-primary" />
            </div>
            <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
              {config.cohorts.length > 0
                ? formatFee(
                    config.cohorts.reduce((sum, cohort) => sum + cohort.feeAmount, 0) / config.cohorts.length,
                  )
                : '$0'}
            </p>
          </div>
        </div>

        <Modal
          open={showCohortForm}
          onClose={closeForm}
          title={editingCohortId ? 'Edit Cohort' : 'Create Cohort'}
          description={
            editingCohortId
              ? 'Update the cohort details, fee, and included modules.'
              : 'Students who register for this cohort get access to all of its modules and are billed the fee.'
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Cohort Name *</label>
              <Input
                value={cohortDraft.name}
                onChange={(event) => setCohortDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g., CNA Cohort 13 — Fall 2026"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Fee Amount (USD) *</label>
              <Input
                type="number"
                min={0}
                value={cohortDraft.feeAmount}
                onChange={(event) =>
                  setCohortDraft((current) => ({ ...current, feeAmount: event.target.value }))
                }
                placeholder="e.g., 3500"
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Charged as the student&apos;s total tuition when they register.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Registration Status</label>
              <Select
                value={cohortDraft.isOpen}
                onChange={(event) =>
                  setCohortDraft((current) => ({ ...current, isOpen: event.target.value }))
                }
                options={[
                  { label: 'Open — students can register', value: 'open' },
                  { label: 'Closed — hidden from registration', value: 'closed' },
                ]}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">Cohort ID</label>
              <Input value={editingCohortId ?? slugify(cohortDraft.name || 'auto-generated')} disabled />
              <p className="mt-1 text-xs text-on-surface-variant">Auto-generated from the name</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
            <Textarea
              className="min-h-20"
              value={cohortDraft.description}
              onChange={(event) =>
                setCohortDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Describe the schedule, audience, or focus of this cohort."
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              Included Modules *{' '}
              <span className="font-normal text-on-surface-variant">
                ({cohortDraft.moduleIds.length} selected)
              </span>
            </label>
            {moduleOptions.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-border-subtle p-5 text-center text-sm text-on-surface-variant">
                No modules configured yet. Create modules under Learning Resources first.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {moduleOptions.map((module) => {
                  const checked = cohortDraft.moduleIds.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => toggleDraftModule(module.id)}
                      className={`flex items-start gap-3 rounded-[14px] border p-3 text-left text-sm transition ${
                        checked
                          ? 'border-primary/40 bg-primary/5 text-on-surface'
                          : 'border-border-subtle bg-surface text-on-surface-variant hover:border-primary/30'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] font-bold text-white ${
                          checked ? 'border-primary bg-primary' : 'border-outline-variant'
                        }`}
                      >
                        {checked ? '✓' : ''}
                      </span>
                      <span className="font-medium">{module.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button onClick={submitCohortForm}>
              <IconPlus className="size-4" />
              {editingCohortId ? 'Update Cohort' : 'Create Cohort'}
            </Button>
          </div>
        </Modal>

        <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Cohorts</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Students pick one of the open cohorts when they register and get all of its modules.
              </p>
            </div>
            <Button size="sm" onClick={openCreateForm}>
              <IconPlus className="size-4" />
              Add Cohort
            </Button>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-border-subtle p-8 text-center text-sm text-on-surface-variant">
              No cohorts yet. Create your first cohort so students can register.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                const cohort = config.cohorts.find((item) => item.id === row.id);
                if (cohort) {
                  openEditForm(cohort);
                }
              }}
              mobileCardTitle={(row) => row.name}
              mobileCardSubtitle={(row) => `${row.modules} modules • ${formatFee(row.feeAmount)}`}
              rowActions={(row) => {
                const cohort = config.cohorts.find((item) => item.id === row.id);
                return (
                  <div className="flex items-center gap-1">
                    <RowIconButton
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (cohort) {
                          openEditForm(cohort);
                        }
                      }}
                    >
                      <IconEdit className="size-4" />
                    </RowIconButton>
                    <RowIconButton
                      title="Delete"
                      destructive
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          title: 'Delete Cohort?',
                          description: `"${row.name}" will be removed. Students already registered keep their current access until re-assigned.`,
                          confirmLabel: 'Delete Cohort',
                          onConfirm: () => {
                            const updatedConfig = {
                              ...config,
                              cohorts: config.cohorts.filter((item) => item.id !== row.id),
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
          )}
        </div>
      </div>
    </AdminShell>
  );
}
