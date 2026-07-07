'use client';

import * as React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormDesigner, type FormSchema } from '@/components/ui/form-designer';
import { InstructorShell } from '@/components/instructor/instructor-shell';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const schema: FormSchema = {
  title: 'Profile and Credentials',
  description: 'Maintain instructor profile details and audit-facing certification data.',
  sections: [
    {
      id: 'identity',
      title: 'Profile Details',
      columns: 2,
      fields: [
        { name: 'fullName', label: 'Full name', type: 'text', required: true },
        { name: 'title', label: 'Role title', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'text' },
      ],
    },
    {
      id: 'credentials',
      title: 'Compliance Notes',
      fields: [
        {
          name: 'notes',
          label: 'Credential notes',
          type: 'textarea',
          rows: 5,
          placeholder: 'Add renewal notes, reviewer comments, and licensing context.',
        },
      ],
    },
  ],
};

interface InstructorCredential {
  id: string;
  label: string;
  status: 'Active' | 'Renewal due' | 'Expired';
  expiresAt: string;
}

interface InstructorProfile {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  notes: string;
  avatarUrl?: string;
  credentials: InstructorCredential[];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length === 0 ? 'I' : parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export default function InstructorProfilePage() {
  const { session, syncedUser } = useAuth();
  const instructorId = syncedUser?.localUserId;
  const accessToken = session?.access_token;

  const [profile, setProfile] = React.useState<InstructorProfile | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async () => {
    if (!instructorId || !accessToken) {
      setError('Sign in as an instructor to load your profile.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to fetch profile (${response.status}).`);
      }

      const data = await response.json();
      setProfile(data.data);
      setValues({
        fullName: data.data.fullName ?? '',
        title: data.data.title ?? '',
        email: data.data.email ?? '',
        phone: data.data.phone ?? '',
        notes: data.data.notes ?? '',
      });
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, instructorId]);

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!instructorId || !accessToken) return;

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/instructors/${instructorId}/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save profile (${response.status}).`);
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <InstructorShell
      title="Profile and Credentials"
      subtitle="Maintain operational profile data and compliance-facing credentials."
      topActions={
        <Button className="hidden rounded-[16px] px-5 md:inline-flex" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      }
    >
      {error ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-8 text-center text-on-surface-variant">Loading profile...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-40 w-40 rounded-[24px] object-cover"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-[24px] bg-primary/10 text-4xl font-bold text-primary">
                {getInitials(values.fullName || 'Instructor')}
              </div>
            )}
            <h3 className="mt-5 font-display text-[24px] font-semibold text-on-surface">
              {values.fullName || 'Instructor'}
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">{values.title}</p>
            <div className="mt-6 space-y-3">
              {(profile?.credentials ?? []).length === 0 ? (
                <p className="text-sm text-on-surface-variant">No credentials on file yet.</p>
              ) : (
                profile?.credentials.map((credential) => (
                  <div key={credential.id} className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
                    <p className="text-sm font-semibold text-on-surface">{credential.label}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <Badge variant={credential.status === 'Renewal due' ? 'warning' : credential.status === 'Expired' ? 'error' : 'success'}>
                        {credential.status}
                      </Badge>
                      <span className="text-[12px] text-on-surface-variant">Exp {credential.expiresAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <FormDesigner
            schema={schema}
            values={values}
            onChange={(name, value) => setValues((current) => ({ ...current, [name]: String(value) }))}
            submitLabel="Save Profile"
            footer="Credential changes should remain aligned with compliance records and renewal evidence."
          />
        </div>
      )}
    </InstructorShell>
  );
}
