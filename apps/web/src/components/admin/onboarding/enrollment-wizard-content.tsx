'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { EnrollmentWizardStepsTable } from '@/components/admin/enrollment-wizard-steps-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconCheck } from '@tabler/icons-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface EnrollmentWizardStep {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      label: string;
      type: 'text' | 'select' | 'choice' | 'number' | 'email';
      required?: boolean;
      placeholder?: string;
      options?: Array<{ label: string; value: string }>;
    }>;
  }>;
}

interface EnrollmentWizardConfig {
  title: string;
  description: string;
  steps: EnrollmentWizardStep[];
}

export function EnrollmentWizardConfigContent() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<EnrollmentWizardConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);
  const hasAuth = Boolean(session?.access_token);

  const fetchConfig = async () => {
    if (!adminId || !session?.access_token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/enrollment-wizard-config`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setConfig(data.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load enrollment wizard configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (hasAuth) {
      fetchConfig();
    }
  }, [hasAuth]);

  const deleteStep = async (stepId: string) => {
    if (!config || !session?.access_token) return;

    try {
      const newSteps = config.steps.filter((s) => s.id !== stepId);
      const updatedConfig = { ...config, steps: newSteps };

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/enrollment-wizard-config`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) throw new Error('Failed to delete');

      const data = await response.json();
      setConfig(data.data);
      setSuccess('Step deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading configuration...</div>;
  }

  if (!config) {
    return <div className="p-8 text-center text-error">Failed to load configuration</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-[12px] border border-error/20 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-[12px] border border-success/20 bg-success/10 p-4 text-sm text-success flex items-center gap-2">
          <IconCheck className="size-4" />
          {success}
        </div>
      )}

      <EnrollmentWizardStepsTable
        steps={config.steps}
        onDelete={deleteStep}
      />
    </div>
  );
}
