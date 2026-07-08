'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const schema: FormSchema = {
  title: 'Weekly Availability',
  description: 'Set recurring time windows and override dates for clinical instruction.',
  sections: [
    {
      id: 'weekdays',
      title: 'Recurring Schedule',
      description: 'Use the same fields to override or extend the default pattern.',
      columns: 2,
      fields: [
        { name: 'monday', label: 'Monday', type: 'text', placeholder: '08:00 - 04:00' },
        { name: 'tuesday', label: 'Tuesday', type: 'text', placeholder: '08:00 - 04:00' },
        { name: 'wednesday', label: 'Wednesday', type: 'text', placeholder: '09:00 - 12:00' },
        { name: 'thursday', label: 'Thursday', type: 'text', placeholder: '10:00 - 06:00' },
        { name: 'friday', label: 'Friday', type: 'text', placeholder: '08:00 - 02:00' },
        { name: 'weekend', label: 'Weekend notes', type: 'textarea', rows: 4, placeholder: 'On-call weekends are limited to assessment coverage.' },
      ],
    },
    {
      id: 'rules',
      title: 'Scheduling Controls',
      description: 'These toggles drive when the scheduler can place student sessions.',
      fields: [
        { name: 'allowAutoPlacement', label: 'Allow auto-placement within open hours', type: 'checkbox', description: 'Scheduling can place students directly into open lab windows.' },
        { name: 'travelBuffer', label: 'Require travel buffer between sites', type: 'checkbox', description: 'Blocks back-to-back placement when sites differ.' },
      ],
    },
  ],
};

type AvailabilityValues = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  weekend: string;
  allowAutoPlacement: boolean;
  travelBuffer: boolean;
};

const emptyValues: AvailabilityValues = {
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '',
  weekend: '',
  allowAutoPlacement: false,
  travelBuffer: false,
};

export default function InstructorAvailabilityPage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [values, setValues] = React.useState<AvailabilityValues>(emptyValues);
  const [savedValues, setSavedValues] = React.useState<AvailabilityValues>(emptyValues);
  const [conflicts, setConflicts] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchAvailability = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your availability.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/availability`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch availability (${response.status}).`);
      }

      const data = await response.json();
      const nextValues: AvailabilityValues = {
        monday: data.data.monday ?? '',
        tuesday: data.data.tuesday ?? '',
        wednesday: data.data.wednesday ?? '',
        thursday: data.data.thursday ?? '',
        friday: data.data.friday ?? '',
        weekend: data.data.weekend ?? '',
        allowAutoPlacement: Boolean(data.data.allowAutoPlacement),
        travelBuffer: Boolean(data.data.travelBuffer),
      };
      setValues(nextValues);
      setSavedValues(nextValues);
      setConflicts(data.data.conflicts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchAvailability();
  }, [fetchAvailability]);

  const saveAvailability = async () => {
    if (!instructorId || !accessToken) return;

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/availability`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save availability (${response.status}).`);
      }

      const data = await response.json();
      const nextValues: AvailabilityValues = {
        monday: data.data.monday ?? '',
        tuesday: data.data.tuesday ?? '',
        wednesday: data.data.wednesday ?? '',
        thursday: data.data.thursday ?? '',
        friday: data.data.friday ?? '',
        weekend: data.data.weekend ?? '',
        allowAutoPlacement: Boolean(data.data.allowAutoPlacement),
        travelBuffer: Boolean(data.data.travelBuffer),
      };
      setValues(nextValues);
      setSavedValues(nextValues);
      setConflicts(data.data.conflicts ?? []);
      setSuccess('Availability saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => setValues(savedValues);

  const hasUnsavedChanges = JSON.stringify(values) !== JSON.stringify(savedValues);

  return (
    <InstructorShell
      title="My Availability"
      subtitle="Configure clinical instruction schedule and date-specific exceptions."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="secondary"
            className="rounded-[16px] px-5"
            disabled={!hasUnsavedChanges || saving}
            onClick={discardChanges}
          >
            Discard
          </Button>
          <Button
            className="rounded-[16px] px-5"
            disabled={!hasUnsavedChanges || saving}
            onClick={() => void saveAvailability()}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        {error ? (
          <div className="rounded-[16px] border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
        ) : null}

        {success ? (
          <div className="rounded-[16px] border border-success/20 bg-success/5 p-4 text-sm text-success">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[20px] border border-border-subtle bg-surface p-10 text-center text-sm text-on-surface-variant">
            Loading your availability...
          </div>
        ) : (
          <>
            {conflicts.length > 0 ? (
              <div className="rounded-[20px] border border-error/20 bg-error/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-error">Schedule Conflict Detected</h3>
                    <div className="mt-2 space-y-2">
                      {conflicts.map((conflict) => (
                        <p key={conflict} className="text-sm text-on-surface-variant">
                          {conflict}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Badge variant="error">
                    {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-success/20 bg-success/5 p-5">
                <h3 className="text-sm font-semibold text-success">No schedule conflicts</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Your booked clinical sessions all fall within your declared availability.
                </p>
              </div>
            )}

            <FormDesigner
              schema={schema}
              values={values}
              onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
              onSubmit={(event) => {
                event.preventDefault();
                void saveAvailability();
              }}
              submitLabel={saving ? 'Saving...' : 'Save Availability'}
              footer="Scheduler updates are reflected in student placement workflows after approval."
            />
          </>
        )}
      </div>
    </InstructorShell>
  );
}
