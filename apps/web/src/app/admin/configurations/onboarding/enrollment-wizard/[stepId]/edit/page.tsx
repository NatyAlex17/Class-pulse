'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowLeft, IconTrash, IconPlus } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Field {
  id: string;
  label: string;
  type: 'text' | 'select' | 'choice' | 'number' | 'email';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

export default function EditStepPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [step, setStep] = React.useState<WizardStep | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const stepId = params.stepId as string;
  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  React.useEffect(() => {
    if (!hasAuth) return;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/enrollment-wizard-config`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const foundStep = data.data.steps.find((s: WizardStep) => s.id === stepId);

        if (!foundStep) {
          setError('Step not found');
          return;
        }

        setStep(foundStep);
      } catch (err) {
        setError(`Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [hasAuth, stepId, adminId, session?.access_token]);

  const addField = (sectionIndex: number) => {
    if (!step) return;
    const newSections = [...step.sections];
    newSections[sectionIndex].fields.push({
      id: `field-${Date.now()}`,
      label: '',
      type: 'text',
      required: true,
    });
    setStep({ ...step, sections: newSections });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    if (!step) return;
    const newSections = [...step.sections];
    newSections[sectionIndex].fields = newSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
    setStep({ ...step, sections: newSections });
  };

  const updateField = (
    sectionIndex: number,
    fieldIndex: number,
    field: Partial<Field>,
  ) => {
    if (!step) return;
    const newSections = [...step.sections];
    newSections[sectionIndex].fields[fieldIndex] = {
      ...newSections[sectionIndex].fields[fieldIndex],
      ...field,
    };
    setStep({ ...step, sections: newSections });
  };

  const addSection = () => {
    if (!step) return;
    const newSections = [
      ...step.sections,
      {
        id: `section-${Date.now()}`,
        title: `Section ${step.sections.length + 1}`,
        description: '',
        fields: [],
      },
    ];
    setStep({ ...step, sections: newSections });
  };

  const removeSection = (sectionIndex: number) => {
    if (!step) return;
    const newSections = step.sections.filter((_, i) => i !== sectionIndex);
    setStep({ ...step, sections: newSections });
  };

  const updateSection = (sectionIndex: number, section: Partial<Section>) => {
    if (!step) return;
    const newSections = [...step.sections];
    newSections[sectionIndex] = { ...newSections[sectionIndex], ...section };
    setStep({ ...step, sections: newSections });
  };

  const saveStep = async () => {
    if (!step || !hasAuth || !session?.access_token) {
      setError('Not authenticated');
      return;
    }

    if (!step.title.trim()) {
      setError('Step title is required');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/enrollment-wizard-config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch current config');

      const data = await response.json();
      const currentConfig = data.data;

      const updatedSteps = currentConfig.steps.map((s: WizardStep) =>
        s.id === step.id ? step : s
      );

      const updatedConfig = {
        ...currentConfig,
        steps: updatedSteps,
      };

      const updateResponse = await fetch(`${API_BASE_URL}/admins/${adminId}/enrollment-wizard-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!updateResponse.ok) throw new Error('Failed to save step');

      setSuccess('Step updated successfully!');
      setTimeout(() => {
        router.push('/admin/configurations/onboarding?tab=enrollment-wizard');
      }, 1500);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Edit Step" subtitle="Loading...">
        <div className="p-8 text-center">Loading step...</div>
      </AdminShell>
    );
  }

  if (error && !step) {
    return (
      <AdminShell title="Edit Step" subtitle="Error">
        <div className="p-8 text-center text-error">{error}</div>
      </AdminShell>
    );
  }

  if (!step) {
    return (
      <AdminShell title="Edit Step" subtitle="Not found">
        <div className="p-8 text-center text-error">Step not found</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Edit Step"
      subtitle={step.title}
      topActions={
        <Button variant="secondary" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
          Back
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-[12px] border border-error/20 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-[12px] border border-success/20 bg-success/10 p-4 text-sm text-success">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">Step Title</label>
            <Input
              value={step.title}
              onChange={(e) => setStep({ ...step, title: e.target.value })}
              placeholder="e.g., Step 1: Basic Information"
            />
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-muted p-6">
            <label className="block text-sm font-semibold text-on-surface mb-3">Description</label>
            <Textarea
              value={step.description}
              onChange={(e) => setStep({ ...step, description: e.target.value })}
              placeholder="Describe what this step is about"
              className="h-20"
            />
          </div>

          <div className="space-y-6">
            {step.sections.map((section, sectionIndex) => (
              <div key={section.id} className="rounded-xl border border-border-subtle bg-surface-muted p-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Section Title</label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                      placeholder="e.g., Contact Information"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Section Description</label>
                    <Input
                      value={section.description || ''}
                      onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-on-surface">Fields</label>
                    <Button onClick={() => addField(sectionIndex)} size="sm" variant="secondary">
                      <IconPlus className="size-4" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={field.id}
                        className="group relative p-4 rounded-lg border-2 border-border-subtle bg-surface hover:border-primary/50 transition space-y-3"
                      >
                        <div className="grid gap-3 grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Label</label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                              placeholder="Field label"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(sectionIndex, fieldIndex, { type: e.target.value as Field['type'] })}
                              className="h-9 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                              <option value="choice">Choice</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Placeholder</label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(sectionIndex, fieldIndex, { placeholder: e.target.value })}
                            placeholder="e.g., Enter your name..."
                            className="h-9 text-sm"
                          />
                        </div>

                        <button
                          onClick={() => removeField(sectionIndex, fieldIndex)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition opacity-0 group-hover:opacity-100 shrink-0 absolute right-2 top-2"
                          title="Delete field"
                        >
                          <IconTrash className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {step.sections.length > 1 && (
                  <div className="pt-4 border-t border-border-subtle">
                    <Button
                      onClick={() => removeSection(sectionIndex)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <IconTrash className="size-4" />
                      Remove Section
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addSection} variant="secondary" className="w-full">
            <IconPlus className="size-4" />
            Add Section
          </Button>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={saveStep} disabled={saving || !hasAuth}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
