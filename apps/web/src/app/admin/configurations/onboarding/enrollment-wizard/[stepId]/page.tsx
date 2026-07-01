'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Field {
  id: string;
  label: string;
  type: string;
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

export default function StepDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, syncedUser } = useAuth();
  const [step, setStep] = React.useState<WizardStep | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  if (loading) {
    return (
      <AdminShell title="Step Details" subtitle="Loading...">
        <div className="p-8 text-center">Loading step...</div>
      </AdminShell>
    );
  }

  if (error || !step) {
    return (
      <AdminShell title="Step Details" subtitle="Error">
        <div className="p-8 text-center text-error">{error || 'Step not found'}</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Step Details"
      subtitle={step.title}
      topActions={
        <Button variant="secondary" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
          Back
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Header Card */}
        <div className="rounded-xl border border-border-subtle bg-surface-muted p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                Step #{step.id}
              </p>
              <h2 className="text-2xl font-bold text-on-surface leading-relaxed">
                {step.title}
              </h2>
              {step.description && (
                <p className="text-base text-on-surface-variant mt-3">{step.description}</p>
              )}
            </div>
            <Badge variant="info" className="shrink-0">
              {step.sections.length} Section{step.sections.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {step.sections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-xl border border-border-subtle p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                  Section {sectionIndex + 1}
                </p>
                <h3 className="text-lg font-semibold text-on-surface">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-on-surface-variant mt-2">{section.description}</p>
                )}
              </div>

              <div className="grid gap-4 pt-4 border-t border-border-subtle">
                {section.fields.map((field, fieldIndex) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-lg bg-surface-muted border border-border-subtle"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium text-on-surface">{field.label}</p>
                        <p className="text-xs text-on-surface-variant mt-1 font-mono">
                          {field.id}
                        </p>
                      </div>
                      <Badge variant="neutral">{field.type}</Badge>
                    </div>
                    {field.placeholder && (
                      <p className="text-sm text-on-surface-variant italic mt-2">
                        Placeholder: "{field.placeholder}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border-subtle">
          <Button variant="secondary" onClick={() => router.back()}>
            Close
          </Button>
          <Link href={`/admin/configurations/onboarding/enrollment-wizard/${step.id}/edit`}>
            <Button>
              <IconEdit className="size-4" />
              Edit Step
            </Button>
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
