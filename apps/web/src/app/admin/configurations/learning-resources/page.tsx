'use client';

import * as React from 'react';
import { IconCheck, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ResourceType = 'video' | 'pdf' | 'link';

type LearningResource = {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
  description: string;
  url: string;
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

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export default function LearningResourcesConfigPage() {
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
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load learning resources configuration.');
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async () => {
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
      setSuccess('Learning resources saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save learning resources.');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async () => {
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
      setSuccess('Learning resources reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset learning resources.');
    } finally {
      setResetting(false);
    }
  };

  const updateModule = (moduleId: string, updater: (module: LearningModule) => LearningModule) => {
    setConfig((current) =>
      current
        ? {
            ...current,
            modules: current.modules.map((module) => (module.id === moduleId ? updater(module) : module)),
          }
        : current,
    );
  };

  const updateSection = (
    moduleId: string,
    sectionId: string,
    updater: (section: LearningSection) => LearningSection,
  ) => {
    updateModule(moduleId, (module) => ({
      ...module,
      sections: module.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  };

  const updateResource = (
    moduleId: string,
    sectionId: string,
    resourceId: string,
    updater: (resource: LearningResource) => LearningResource,
  ) => {
    updateSection(moduleId, sectionId, (section) => ({
      ...section,
      resources: section.resources.map((resource) => (resource.id === resourceId ? updater(resource) : resource)),
    }));
  };

  const addModule = () => {
    setConfig((current) =>
      current
        ? {
            ...current,
            modules: [
              ...current.modules,
              {
                id: buildId('module'),
                title: 'New module',
                summary: 'Describe the purpose of this module.',
                requiredHours: 10,
                sections: [
                  {
                    id: buildId('section'),
                    title: 'New section',
                    description: 'Group related lessons in this section.',
                    resources: [
                      {
                        id: buildId('resource'),
                        title: 'New resource',
                        type: 'video',
                        duration: '10 min',
                        description: 'Describe what the learner should finish here.',
                        url: 'https://example.com',
                      },
                    ],
                  },
                ],
              },
            ],
          }
        : current,
    );
  };

  const addSection = (moduleId: string) => {
    updateModule(moduleId, (module) => ({
      ...module,
      sections: [
        ...module.sections,
        {
          id: buildId('section'),
          title: 'New section',
          description: 'Explain what learners should complete in this block.',
          resources: [
            {
              id: buildId('resource'),
              title: 'New resource',
              type: 'video',
              duration: '10 min',
              description: 'Describe what the learner should finish here.',
              url: 'https://example.com',
            },
          ],
        },
      ],
    }));
  };

  const addResource = (moduleId: string, sectionId: string) => {
    updateSection(moduleId, sectionId, (section) => ({
      ...section,
      resources: [
        ...section.resources,
        {
          id: buildId('resource'),
          title: 'New resource',
          type: 'video',
          duration: '10 min',
          description: 'Describe what the learner should finish here.',
          url: 'https://example.com',
        },
      ],
    }));
  };

  if (loading) {
    return (
      <AdminShell title="Learning Resources" subtitle="Build course modules, sections, and lessons.">
        <div className="p-8 text-center">Loading learning resources...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Learning Resources"
      subtitle="Build a Udemy-style course structure with modules, sections, and resource lessons."
      topActions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void fetchConfig()}>
            <IconRefresh className="size-4" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={resetConfig} disabled={resetting}>
            {resetting ? 'Resetting...' : 'Reset'}
          </Button>
          <Button size="sm" onClick={saveConfig} disabled={saving || !config}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-[14px] border border-error/20 bg-error/10 p-4 text-sm text-error">{error}</div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-[14px] border border-success/20 bg-success/10 p-4 text-sm text-success">
            <IconCheck className="size-4" />
            {success}
          </div>
        ) : null}

        <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[24px] font-semibold text-on-surface">Course Builder</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Create modules, split them into sections, and add lesson resources using `video`, `pdf`, or `link`.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{config?.modules.length ?? 0} Modules</Badge>
              <Button onClick={addModule}>
                <IconPlus className="size-4" />
                Add Module
              </Button>
            </div>
          </div>
        </div>

        {config?.modules.map((module, moduleIndex) => (
          <div key={module.id} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="info">Module {moduleIndex + 1}</Badge>
                <h3 className="mt-3 font-display text-[26px] font-semibold text-on-surface">{module.title}</h3>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">{module.summary}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setConfig((current) =>
                    current
                      ? {
                          ...current,
                          modules: current.modules.filter((item) => item.id !== module.id),
                        }
                      : current,
                  )
                }
              >
                <IconTrash className="size-4" />
                Remove Module
              </Button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_180px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Module Title</label>
                <Input value={module.title} onChange={(event) => updateModule(module.id, (current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Module ID</label>
                <Input value={module.id} onChange={(event) => updateModule(module.id, (current) => ({ ...current, id: event.target.value }))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-on-surface">Required Hours</label>
                <Input
                  type="number"
                  min={1}
                  value={module.requiredHours}
                  onChange={(event) =>
                    updateModule(module.id, (current) => ({
                      ...current,
                      requiredHours: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-on-surface">Module Summary</label>
              <Textarea
                value={module.summary}
                onChange={(event) => updateModule(module.id, (current) => ({ ...current, summary: event.target.value }))}
                className="min-h-24"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-on-surface">Sections</h4>
                  <p className="text-sm text-on-surface-variant">Each section groups a clear block of lessons, just like a course curriculum.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => addSection(module.id)}>
                  <IconPlus className="size-4" />
                  Add Section
                </Button>
              </div>

              {module.sections.map((section, sectionIndex) => (
                <div key={section.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Badge variant="neutral">Section {sectionIndex + 1}</Badge>
                      <h5 className="mt-2 font-semibold text-on-surface">{section.title}</h5>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateModule(module.id, (current) => ({
                          ...current,
                          sections: current.sections.filter((item) => item.id !== section.id),
                        }))
                      }
                    >
                      <IconTrash className="size-4" />
                      Remove Section
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Section Title</label>
                      <Input value={section.title} onChange={(event) => updateSection(module.id, section.id, (current) => ({ ...current, title: event.target.value }))} />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-on-surface">Section ID</label>
                      <Input value={section.id} onChange={(event) => updateSection(module.id, section.id, (current) => ({ ...current, id: event.target.value }))} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-on-surface">Section Description</label>
                    <Textarea
                      value={section.description}
                      onChange={(event) => updateSection(module.id, section.id, (current) => ({ ...current, description: event.target.value }))}
                      className="min-h-20"
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h6 className="font-semibold text-on-surface">Resources</h6>
                        <p className="text-sm text-on-surface-variant">Each resource becomes one student-facing lesson item.</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => addResource(module.id, section.id)}>
                        <IconPlus className="size-4" />
                        Add Resource
                      </Button>
                    </div>

                    {section.resources.map((resource, resourceIndex) => (
                      <div key={resource.id} className="rounded-[16px] border border-border-subtle bg-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="primary">Lesson {resourceIndex + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              updateSection(module.id, section.id, (current) => ({
                                ...current,
                                resources: current.resources.filter((item) => item.id !== resource.id),
                              }))
                            }
                          >
                            <IconTrash className="size-4" />
                            Remove
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson Title</label>
                            <Input value={resource.title} onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, title: event.target.value }))} />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson ID</label>
                            <Input value={resource.id} onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, id: event.target.value }))} />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-on-surface">Type</label>
                            <select
                              value={resource.type}
                              onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, type: event.target.value as ResourceType }))}
                              className="h-11 w-full rounded-[14px] border border-border-subtle bg-surface px-3 text-sm text-on-surface"
                            >
                              <option value="video">Video</option>
                              <option value="pdf">PDF</option>
                              <option value="link">Link</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-on-surface">Duration</label>
                            <Input value={resource.duration} onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, duration: event.target.value }))} />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-semibold text-on-surface">Resource URL</label>
                          <Input value={resource.url} onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, url: event.target.value }))} />
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-semibold text-on-surface">Lesson Description</label>
                          <Textarea
                            value={resource.description}
                            onChange={(event) => updateResource(module.id, section.id, resource.id, (current) => ({ ...current, description: event.target.value }))}
                            className="min-h-20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
