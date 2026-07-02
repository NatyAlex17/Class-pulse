'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconBook2,
  IconCheck,
  IconChevronRight,
  IconClipboardText,
  IconHierarchy3,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ResourceType = 'video' | 'pdf' | 'link' | 'text' | 'exam';

type LearningResource = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
  description: string;
  url?: string;
  content?: string;
  questionCount?: number;
  passingScore?: number;
};

type LearningSection = {
  id: string;
  title: string;
  description: string;
  resources: LearningResource[];
};

type LearningModule = {
  id: string;
  title: string;
  summary: string;
  requiredHours: number;
  sections: LearningSection[];
};

type LearningResourcesConfig = {
  modules: LearningModule[];
};

type BuilderView = 'modules' | 'module-detail' | 'section-detail';

type BuilderProps = {
  view: BuilderView;
  moduleId?: string;
  sectionId?: string;
};

type ModuleRow = {
  id: string;
  title: string;
  requiredHours: number;
  sections: number;
  items: number;
};

type SectionRow = {
  id: string;
  title: string;
  description: string;
  items: number;
};

type ResourceRow = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
};

const resourceTypeOptions = [
  { label: 'Video', value: 'video' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Link', value: 'link' },
  { label: 'Text Lesson', value: 'text' },
  { label: 'Exam', value: 'exam' },
];

const resourceTypeLabels: Record<ResourceType, string> = {
  video: 'Video',
  pdf: 'PDF',
  link: 'Link',
  text: 'Text Lesson',
  exam: 'Exam',
};

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || `item-${Date.now()}`;
}

function getModuleHref(moduleId: string) {
  return `/admin/configurations/learning-resources/${moduleId}`;
}

function getSectionHref(moduleId: string, sectionId: string) {
  return `/admin/configurations/learning-resources/${moduleId}/sections/${sectionId}`;
}

function getItemCount(module: LearningModule) {
  return module.sections.reduce((sum, section) => sum + section.resources.length, 0);
}

function useLearningResourcesConfig() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<LearningResourcesConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);

  const fetchConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to manage learning resources.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to load configuration (${response.status}).`);
      }

      const payload = await response.json();
      setConfig(payload.data);
    } catch (fetchError) {
      setConfig(null);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load learning resources configuration.',
      );
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const saveConfig = React.useCallback(async () => {
    if (!config || !session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save configuration (${response.status}).`);
      }

      const payload = await response.json();
      setConfig(payload.data);
      setSuccess('Learning management configuration saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save learning resources.');
    } finally {
      setSaving(false);
    }
  }, [adminId, config, session?.access_token]);

  const resetConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset configuration (${response.status}).`);
      }

      const payload = await response.json();
      setConfig(payload.data);
      setSuccess('Learning management configuration reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset learning resources.');
    } finally {
      setResetting(false);
    }
  }, [adminId, session?.access_token]);

  return {
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
  };
}

function ConfigBanner({ error, success }: { error: string | null; success: string | null }) {
  return (
    <>
      {error ? (
        <div className="rounded-[14px] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-[14px] border border-success/20 bg-success/10 p-4 text-sm text-success">
          <IconCheck className="size-4" />
          {success}
        </div>
      ) : null}
    </>
  );
}

function PageToolbar({
  onRefresh,
  onReset,
  onSave,
  resetting,
  saving,
}: {
  onRefresh: () => void;
  onReset: () => void;
  onSave: () => void;
  resetting: boolean;
  saving: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <IconRefresh className="size-4" />
        Refresh
      </Button>
      <Button variant="secondary" size="sm" onClick={onReset} disabled={resetting}>
        {resetting ? 'Resetting...' : 'Reset'}
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}

function SectionItemEditor({
  item,
  moduleId,
  sectionId,
  updateResource,
  removeResource,
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
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-on-surface">Item Editor</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Update the selected lesson, reading, file, link, or exam here.
          </p>
        </div>
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
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Type</label>
          <Select
            value={item.type}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                type: event.target.value as ResourceType,
              }))
            }
            options={resourceTypeOptions}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-on-surface">Item ID</label>
          <Input value={item.id} disabled />
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
        />
      </div>

      {['video', 'pdf', 'link'].includes(item.type) ? (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Launch URL</label>
          <Input
            value={item.url ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                url: event.target.value,
              }))
            }
          />
        </div>
      ) : null}

      {['text', 'exam'].includes(item.type) ? (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-on-surface">Content</label>
          <Textarea
            className="min-h-32"
            value={item.content ?? ''}
            onChange={(event) =>
              updateResource(moduleId, sectionId, item.id, (resource) => ({
                ...resource,
                content: event.target.value,
              }))
            }
          />
        </div>
      ) : null}

      {item.type === 'exam' ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Question Count</label>
            <Input
              type="number"
              min={1}
              value={item.questionCount ?? 0}
              onChange={(event) =>
                updateResource(moduleId, sectionId, item.id, (resource) => ({
                  ...resource,
                  questionCount: Number(event.target.value || 0),
                }))
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score %</label>
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
      ) : null}
    </div>
  );
}

export function LearningResourcesConfigBuilder({ view, moduleId, sectionId }: BuilderProps) {
  const router = useRouter();
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
  } = useLearningResourcesConfig();

  const [showModuleForm, setShowModuleForm] = React.useState(false);
  const [showSectionForm, setShowSectionForm] = React.useState(false);
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [moduleDraft, setModuleDraft] = React.useState({ title: '', summary: '', requiredHours: '10' });
  const [sectionDraft, setSectionDraft] = React.useState({ title: '', description: '' });
  const [itemDraft, setItemDraft] = React.useState({
    title: '',
    type: 'video' as ResourceType,
    duration: '',
    description: '',
    url: '',
    content: '',
    questionCount: '10',
    passingScore: '70',
  });
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

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

  const updateModule = React.useCallback(
    (targetModuleId: string, updater: (module: LearningModule) => LearningModule) => {
      setConfig((current) =>
        current
          ? {
              ...current,
              modules: current.modules.map((module) =>
                module.id === targetModuleId ? updater(module) : module,
              ),
            }
          : current,
      );
    },
    [setConfig],
  );

  const updateSection = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      updater: (section: LearningSection) => LearningSection,
    ) => {
      updateModule(targetModuleId, (module) => ({
        ...module,
        sections: module.sections.map((section) =>
          section.id === targetSectionId ? updater(section) : section,
        ),
      }));
    },
    [updateModule],
  );

  const updateResource = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      targetResourceId: string,
      updater: (resource: LearningResource) => LearningResource,
    ) => {
      updateSection(targetModuleId, targetSectionId, (section) => ({
        ...section,
        resources: section.resources.map((resource) =>
          resource.id === targetResourceId ? updater(resource) : resource,
        ),
      }));
    },
    [updateSection],
  );

  if (loading) {
    return (
      <AdminShell title="Learning Management Config" subtitle="Loading module and section configuration.">
        <div className="p-8 text-center">Loading learning management configuration...</div>
      </AdminShell>
    );
  }

  if (!config) {
    return (
      <AdminShell
        title="Learning Management Config"
        subtitle="Module and section authoring."
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
        <ConfigBanner error={error} success={success} />
      </AdminShell>
    );
  }

  if (view === 'module-detail' && !selectedModule) {
    return (
      <AdminShell title="Module Not Found" subtitle="Return to the module list to choose another module.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'section-detail' && (!selectedModule || !selectedSection)) {
    return (
      <AdminShell title="Section Not Found" subtitle="Return to the module list to choose another section.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'modules') {
    const rows: ModuleRow[] = config.modules.map((module) => ({
      id: module.id,
      title: module.title,
      requiredHours: module.requiredHours,
      sections: module.sections.length,
      items: getItemCount(module),
    }));

    const columns: DataTableColumn<ModuleRow>[] = [
      { id: 'title', header: 'Module', accessorKey: 'title' },
      { id: 'requiredHours', header: 'Hours', accessorKey: 'requiredHours' },
      { id: 'sections', header: 'Sections', accessorKey: 'sections' },
      { id: 'items', header: 'Items', accessorKey: 'items' },
    ];

    return (
      <AdminShell
        title="Learning Management Config"
        subtitle="Start with the module list, then open one module to manage its sections."
        topActions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowModuleForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Module
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />

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
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Sections</p>
                <IconHierarchy3 className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
                {config.modules.reduce((sum, module) => sum + module.sections.length, 0)}
              </p>
            </div>
            <div className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Learning Items</p>
                <IconClipboardText className="size-5 text-primary" />
              </div>
              <p className="mt-3 font-display text-[30px] font-semibold text-on-surface">
                {config.modules.reduce((sum, module) => sum + getItemCount(module), 0)}
              </p>
            </div>
          </div>

          {showModuleForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">Create Module</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Add the module first, then open it to create sections inside it.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowModuleForm(false)}>
                  Close
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title</label>
                  <Input
                    value={moduleDraft.title}
                    onChange={(event) =>
                      setModuleDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours</label>
                  <Input
                    type="number"
                    min={1}
                    value={moduleDraft.requiredHours}
                    onChange={(event) =>
                      setModuleDraft((current) => ({ ...current, requiredHours: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Summary</label>
                <Textarea
                  className="min-h-24"
                  value={moduleDraft.summary}
                  onChange={(event) =>
                    setModuleDraft((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => {
                    const title = moduleDraft.title.trim();
                    const summary = moduleDraft.summary.trim();
                    const requiredHours = Number(moduleDraft.requiredHours);
                    const id = slugify(title);

                    if (!title || !summary || requiredHours <= 0) {
                      setError('Module title, summary, and required hours are required.');
                      return;
                    }

                    if (config.modules.some((module) => module.id === id)) {
                      setError('A module with this title already exists. Please use a different title.');
                      return;
                    }

                    setConfig((current) =>
                      current
                        ? {
                            ...current,
                            modules: [
                              ...current.modules,
                              { id, title, summary, requiredHours, sections: [] },
                            ],
                          }
                        : current,
                    );
                    setModuleDraft({ title: '', summary: '', requiredHours: '10' });
                    setShowModuleForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  Create Module
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5">
              <h2 className="font-display text-[22px] font-semibold text-on-surface">Modules</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Click a module row to open its detail page and manage sections.
              </p>
            </div>

            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => row.id}
              onRowClick={(row) => router.push(getModuleHref(row.id))}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${row.sections} sections • ${row.items} items`}
              rowActions={(row) => (
                <Link href={getModuleHref(row.id)}>
                  <Button variant="secondary" size="sm">
                    Open
                    <IconChevronRight className="size-4" />
                  </Button>
                </Link>
              )}
            />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (view === 'module-detail' && selectedModule) {
    const sectionRows: SectionRow[] = selectedModule.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      items: section.resources.length,
    }));

    const columns: DataTableColumn<SectionRow>[] = [
      { id: 'title', header: 'Section', accessorKey: 'title' },
      { id: 'description', header: 'Description', accessorKey: 'description' },
      { id: 'items', header: 'Items', accessorKey: 'items' },
    ];

    return (
      <AdminShell
        title={selectedModule.title}
        subtitle="Manage this module and the sections inside it."
        topActions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowSectionForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Section
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />

          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Link href="/admin/configurations/learning-resources" className="hover:text-primary">
              Modules
            </Link>
            <IconChevronRight className="size-4" />
            <span className="text-on-surface">{selectedModule.title}</span>
          </div>

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <Badge variant="primary">Module Detail</Badge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Edit the module here, then open a section to manage its content items.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          modules: current.modules.filter((module) => module.id !== selectedModule.id),
                        }
                      : current,
                  );
                  router.push('/admin/configurations/learning-resources');
                }}
              >
                <IconTrash className="size-4" />
                Remove Module
              </Button>
            </div>

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
          </div>

          {showSectionForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">Create Section</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Add sections under <strong>{selectedModule.title}</strong>.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowSectionForm(false)}>
                  Close
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Section Title</label>
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
                      setError('Section title is required.');
                      return;
                    }

                    if (selectedModule.sections.some((section) => section.id === id)) {
                      setError('A section with this title already exists in this module.');
                      return;
                    }

                    updateModule(selectedModule.id, (module) => ({
                      ...module,
                      sections: [
                        ...module.sections,
                        {
                          id,
                          title,
                          description: sectionDraft.description.trim(),
                          resources: [],
                        },
                      ],
                    }));
                    setSectionDraft({ title: '', description: '' });
                    setShowSectionForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  Create Section
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface">Sections</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Open a section to manage the full curriculum items inside it.
                </p>
              </div>
              <Badge variant="info">{selectedModule.sections.length} sections</Badge>
            </div>

            <DataTable
              columns={columns}
              data={sectionRows}
              getRowId={(row) => row.id}
              onRowClick={(row) => router.push(getSectionHref(selectedModule.id, row.id))}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${row.items} items`}
              rowActions={(row) => (
                <Link href={getSectionHref(selectedModule.id, row.id)}>
                  <Button variant="secondary" size="sm">
                    Open
                    <IconChevronRight className="size-4" />
                  </Button>
                </Link>
              )}
            />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (view === 'section-detail' && selectedModule && selectedSection) {
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
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowItemForm((current) => !current)}>
              <IconPlus className="size-4" />
              Add Item
            </Button>
            <PageToolbar
              onRefresh={() => void fetchConfig()}
              onReset={() => void resetConfig()}
              onSave={() => void saveConfig()}
              resetting={resetting}
              saving={saving}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <ConfigBanner error={error} success={success} />

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

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <Badge variant="primary">Section Detail</Badge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Update the section details here, then click an item below to edit it.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  updateModule(selectedModule.id, (module) => ({
                    ...module,
                    sections: module.sections.filter((section) => section.id !== selectedSection.id),
                  }));
                  router.push(getModuleHref(selectedModule.id));
                }}
              >
                <IconTrash className="size-4" />
                Remove Section
              </Button>
            </div>

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
          </div>

          {showItemForm ? (
            <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] font-semibold text-on-surface">Create Learning Item</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Add a lesson, reading, link, file, or exam into <strong>{selectedSection.title}</strong>.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowItemForm(false)}>
                  Close
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Title</label>
                  <Input
                    value={itemDraft.title}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Type</label>
                  <Select
                    value={itemDraft.type}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, type: event.target.value as ResourceType }))
                    }
                    options={resourceTypeOptions}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                  <Input
                    value={itemDraft.duration}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, duration: event.target.value }))
                    }
                  />
                </div>
                {['video', 'pdf', 'link'].includes(itemDraft.type) ? (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Launch URL</label>
                    <Input
                      value={itemDraft.url}
                      onChange={(event) =>
                        setItemDraft((current) => ({ ...current, url: event.target.value }))
                      }
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-on-surface">Description</label>
                <Textarea
                  className="min-h-20"
                  value={itemDraft.description}
                  onChange={(event) =>
                    setItemDraft((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>

              {['text', 'exam'].includes(itemDraft.type) ? (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-on-surface">Content</label>
                  <Textarea
                    className="min-h-32"
                    value={itemDraft.content}
                    onChange={(event) =>
                      setItemDraft((current) => ({ ...current, content: event.target.value }))
                    }
                  />
                </div>
              ) : null}

              {itemDraft.type === 'exam' ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Question Count</label>
                    <Input
                      type="number"
                      min={1}
                      value={itemDraft.questionCount}
                      onChange={(event) =>
                        setItemDraft((current) => ({ ...current, questionCount: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Passing Score %</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={itemDraft.passingScore}
                      onChange={(event) =>
                        setItemDraft((current) => ({ ...current, passingScore: event.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-5">
                <Button
                  onClick={() => {
                    const title = itemDraft.title.trim();
                    const duration = itemDraft.duration.trim();
                    const id = slugify(title);

                    if (!title || !duration) {
                      setError('Item title and duration are required.');
                      return;
                    }

                    if (selectedSection.resources.some((resource) => resource.id === id)) {
                      setError('An item with this title already exists in this section.');
                      return;
                    }

                    const item: LearningResource = {
                      id,
                      title,
                      type: itemDraft.type,
                      duration,
                      description: itemDraft.description.trim(),
                      url: ['video', 'pdf', 'link'].includes(itemDraft.type)
                        ? itemDraft.url.trim() || undefined
                        : undefined,
                      content: ['text', 'exam'].includes(itemDraft.type)
                        ? itemDraft.content.trim() || undefined
                        : undefined,
                      questionCount: itemDraft.type === 'exam' ? Number(itemDraft.questionCount || 0) : undefined,
                      passingScore: itemDraft.type === 'exam' ? Number(itemDraft.passingScore || 0) : undefined,
                    };

                    updateSection(selectedModule.id, selectedSection.id, (section) => ({
                      ...section,
                      resources: [...section.resources, item],
                    }));
                    setSelectedItemId(id);
                    setItemDraft({
                      title: '',
                      type: 'video',
                      duration: '',
                      description: '',
                      url: '',
                      content: '',
                      questionCount: '10',
                      passingScore: '70',
                    });
                    setShowItemForm(false);
                    setError(null);
                  }}
                >
                  <IconPlus className="size-4" />
                  Create Item
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[22px] font-semibold text-on-surface">Section Items</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Select a row to open that item&apos;s editor below.
                </p>
              </div>
              <Badge variant="info">{selectedSection.resources.length} items</Badge>
            </div>

            <DataTable
              columns={columns}
              data={itemRows}
              getRowId={(row) => row.id}
              onRowClick={(row) => setSelectedItemId(row.id)}
              mobileCardTitle={(row) => row.title}
              mobileCardSubtitle={(row) => `${resourceTypeLabels[row.type]} • ${row.duration}`}
              rowActions={(row) => (
                <Button
                  variant={selectedItemId === row.id ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedItemId(row.id)}
                >
                  Edit
                </Button>
              )}
            />
          </div>

          {selectedItem ? (
            <SectionItemEditor
              item={selectedItem}
              moduleId={selectedModule.id}
              sectionId={selectedSection.id}
              updateResource={updateResource}
              removeResource={(resourceId) => {
                updateSection(selectedModule.id, selectedSection.id, (section) => ({
                  ...section,
                  resources: section.resources.filter((resource) => resource.id !== resourceId),
                }));
              }}
            />
          ) : (
            <div className="rounded-[20px] border border-dashed border-border-subtle bg-surface p-8 text-center text-sm text-on-surface-variant">
              No items yet. Add your first learning item to start building this section.
            </div>
          )}
        </div>
      </AdminShell>
    );
  }

  return null;
}
