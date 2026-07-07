'use client';

import * as React from 'react';
import { IconEdit, IconFileCheck, IconPlus, IconTrash } from '@tabler/icons-react';

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
import {
  useDocumentRequirementsConfig,
  type DocumentAppliesTo,
  type DocumentRequirementDefinition,
} from './use-document-requirements-config';

type DocumentRow = {
  id: string;
  name: string;
  appliesTo: DocumentAppliesTo;
  required: boolean;
};

const emptyDocumentDraft = {
  name: '',
  description: '',
  appliesTo: 'student' as DocumentAppliesTo,
  required: 'required' as 'required' | 'optional',
};

const appliesToLabels: Record<DocumentAppliesTo, string> = {
  student: 'Student',
  instructor: 'Instructor',
  both: 'Both',
};

export function DocumentRequirementsContent() {
  const {
    config,
    setConfig,
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
  } = useDocumentRequirementsConfig();

  const [showDocumentForm, setShowDocumentForm] = React.useState(false);
  const [editingDocumentId, setEditingDocumentId] = React.useState<string | null>(null);
  const [documentDraft, setDocumentDraft] = React.useState(emptyDocumentDraft);
  const [deleteConfirm, setDeleteConfirm] = React.useState<DeleteConfirmState | null>(null);

  if (loading) {
    return <div className="p-8 text-center">Loading document requirements configuration...</div>;
  }

  if (!config) {
    return <ConfigBanner error={error} success={success} />;
  }

  const rows: DocumentRow[] = config.documents.map((document) => ({
    id: document.id,
    name: document.name,
    appliesTo: document.appliesTo,
    required: document.required,
  }));

  const columns: DataTableColumn<DocumentRow>[] = [
    { id: 'name', header: 'Document', accessorKey: 'name' },
    {
      id: 'appliesTo',
      header: 'Applies To',
      cell: (row) => <Badge variant="info">{appliesToLabels[row.appliesTo]}</Badge>,
    },
    {
      id: 'required',
      header: 'Requirement',
      cell: (row) => (
        <Badge variant={row.required ? 'warning' : 'neutral'}>{row.required ? 'Required' : 'Optional'}</Badge>
      ),
    },
  ];

  const openCreateForm = () => {
    setEditingDocumentId(null);
    setDocumentDraft(emptyDocumentDraft);
    setShowDocumentForm(true);
  };

  const openEditForm = (document: DocumentRequirementDefinition) => {
    setDocumentDraft({
      name: document.name,
      description: document.description,
      appliesTo: document.appliesTo,
      required: document.required ? 'required' : 'optional',
    });
    setEditingDocumentId(document.id);
    setShowDocumentForm(true);
  };

  const closeForm = () => {
    setShowDocumentForm(false);
    setEditingDocumentId(null);
    setDocumentDraft(emptyDocumentDraft);
  };

  const submitDocumentForm = () => {
    const name = documentDraft.name.trim();

    if (!name) {
      setError('Document name is required.');
      return;
    }

    const shared = {
      name,
      description: documentDraft.description.trim(),
      appliesTo: documentDraft.appliesTo,
      required: documentDraft.required === 'required',
    };

    let updatedConfig;

    if (editingDocumentId) {
      updatedConfig = {
        ...config,
        documents: config.documents.map((document) =>
          document.id === editingDocumentId ? { ...document, ...shared } : document,
        ),
      };
    } else {
      const id = slugify(name);

      if (config.documents.some((document) => document.id === id)) {
        setError('A document with this name already exists. Please use a different name.');
        return;
      }

      updatedConfig = {
        ...config,
        documents: [...config.documents, { id, ...shared }],
      };
    }

    setConfig(updatedConfig);
    autoSaveConfig(updatedConfig);
    closeForm();
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Document Requirements</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Define the documents students (and, in future, instructors) must submit during onboarding.
          </p>
        </div>
        <PageToolbar
          onRefresh={() => void fetchConfig()}
          onReset={() => void resetConfig()}
          onSave={() => void saveConfig()}
          resetting={resetting}
          saving={saving}
        />
      </div>

      <ConfigBanner error={error} success={success} />
      <DeleteConfirmModal state={deleteConfirm} onCancel={() => setDeleteConfirm(null)} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Documents</p>
            <IconFileCheck className="size-5 text-primary" />
          </div>
          <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">{config.documents.length}</p>
        </div>
        <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Required</p>
            <IconFileCheck className="size-5 text-primary" />
          </div>
          <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
            {config.documents.filter((document) => document.required).length}
          </p>
        </div>
      </div>

      <Modal
        open={showDocumentForm}
        onClose={closeForm}
        title={editingDocumentId ? 'Edit Document Requirement' : 'Create Document Requirement'}
        description="Documents marked required must be uploaded before a student can submit onboarding."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Document Name *</label>
            <Input
              value={documentDraft.name}
              onChange={(event) => setDocumentDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g., Immunization Record"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Document ID</label>
            <Input value={editingDocumentId ?? slugify(documentDraft.name || 'auto-generated')} disabled />
            <p className="mt-1 text-xs text-on-surface-variant">Auto-generated from the name</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Applies To</label>
            <Select
              value={documentDraft.appliesTo}
              onChange={(event) =>
                setDocumentDraft((current) => ({ ...current, appliesTo: event.target.value as DocumentAppliesTo }))
              }
              options={[
                { label: 'Student', value: 'student' },
                { label: 'Instructor', value: 'instructor' },
                { label: 'Both', value: 'both' },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Requirement</label>
            <Select
              value={documentDraft.required}
              onChange={(event) =>
                setDocumentDraft((current) => ({
                  ...current,
                  required: event.target.value as 'required' | 'optional',
                }))
              }
              options={[
                { label: 'Required — blocks submission until uploaded', value: 'required' },
                { label: 'Optional — does not block submission', value: 'optional' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
          <Textarea
            className="min-h-20"
            value={documentDraft.description}
            onChange={(event) => setDocumentDraft((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe what the student needs to upload."
          />
        </div>

        <div className="mt-6">
          <Button onClick={submitDocumentForm}>
            <IconPlus className="size-4" />
            {editingDocumentId ? 'Update Document' : 'Create Document'}
          </Button>
        </div>
      </Modal>

      <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[18px] font-semibold text-on-surface">Documents</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Shown to students on the onboarding readiness checklist.
            </p>
          </div>
          <Button size="sm" onClick={openCreateForm}>
            <IconPlus className="size-4" />
            Add Document
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-border-subtle p-8 text-center text-sm text-on-surface-variant">
            No document requirements yet. Add one so students know what to submit.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            onRowClick={(row) => {
              const document = config.documents.find((item) => item.id === row.id);
              if (document) {
                openEditForm(document);
              }
            }}
            mobileCardTitle={(row) => row.name}
            mobileCardSubtitle={(row) => `${appliesToLabels[row.appliesTo]} • ${row.required ? 'Required' : 'Optional'}`}
            rowActions={(row) => {
              const document = config.documents.find((item) => item.id === row.id);
              return (
                <div className="flex items-center gap-1">
                  <RowIconButton
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (document) {
                        openEditForm(document);
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
                        title: 'Delete Document Requirement?',
                        description: `"${row.name}" will no longer appear on the onboarding checklist.`,
                        confirmLabel: 'Delete Document',
                        onConfirm: () => {
                          const updatedConfig = {
                            ...config,
                            documents: config.documents.filter((item) => item.id !== row.id),
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
  );
}
