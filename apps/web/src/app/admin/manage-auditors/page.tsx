'use client';

import * as React from 'react';
import { IconRefresh, IconShieldCheck, IconUserPlus, IconUsersGroup } from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type AuditorAccount = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  title: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ManageAuditorsPage() {
  const { session, syncedUser } = useAuth();
  const adminId = React.useMemo(
    () => (syncedUser?.role === 'admin' && syncedUser.localUserId ? syncedUser.localUserId : 'admin-001'),
    [syncedUser?.localUserId, syncedUser?.role],
  );
  const accessToken = session?.access_token;

  const [accounts, setAccounts] = React.useState<AuditorAccount[]>([]);
  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fetchAuditors = React.useCallback(async () => {
    if (!accessToken) {
      setAccounts([]);
      setError('Sign in as an admin to manage auditor accounts.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/auditors`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to load auditors (${response.status}).`);
      }

      const payload = await response.json();
      setAccounts(payload.data as AuditorAccount[]);
    } catch (nextError) {
      setAccounts([]);
      setError(nextError instanceof Error ? nextError.message : 'Failed to load auditor accounts.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, adminId]);

  React.useEffect(() => {
    void fetchAuditors();
  }, [fetchAuditors]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setSuccess(null);

      if (!email.trim() || !password.trim()) {
        setError('Email and password are required for each auditor account.');
        return;
      }

      if (password.length < 8) {
        setError('Use a password with at least 8 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Password confirmation does not match.');
        return;
      }

      if (!accessToken) {
        setError('Sign in as an admin to create auditor accounts.');
        return;
      }

      try {
        setSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/auditors`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            fullName: fullName.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message ?? `Failed to create auditor (${response.status}).`);
        }

        const payload = await response.json();
        const createdAccount = payload.data as AuditorAccount;
        setAccounts((current) => [createdAccount, ...current.filter((item) => item.id !== createdAccount.id)]);
        setEmail('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
        setSuccess(`Auditor account created for ${createdAccount.email}. Share the password securely.`);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : 'Failed to create auditor account.');
      } finally {
        setSubmitting(false);
      }
    },
    [accessToken, adminId, confirmPassword, email, fullName, password],
  );

  const activeAuditors = accounts.filter((account) => account.status === 'active').length;

  const columns: DataTableColumn<AuditorAccount>[] = [
    { id: 'fullName', header: 'Auditor', accessorKey: 'fullName' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'title', header: 'Role Label', accessorKey: 'title' },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status}</Badge>,
    },
    { id: 'createdAt', header: 'Created', cell: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <AdminShell
      title="Manage Auditors"
      subtitle="Register auditor accounts with controlled credentials so they can sign in to the compliance workspace."
      searchPlaceholder="Search auditor accounts..."
      topLinks={[
        { label: 'Manage Auditors', href: '/admin/manage-auditors' },
        { label: 'Operations', href: '/admin/operations' },
        { label: 'Reports', href: '/admin/reports' },
      ]}
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5" onClick={() => void fetchAuditors()}>
            <IconRefresh className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Badge variant="primary" className="w-fit">Auditor Access</Badge>
              <CardTitle>{accounts.length}</CardTitle>
              <CardDescription>Total auditor accounts synced into Class Verse.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="success" className="w-fit">Active</Badge>
              <CardTitle>{activeAuditors}</CardTitle>
              <CardDescription>Auditors currently marked active in the local user store.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="info" className="w-fit">Controlled Signup</Badge>
              <CardTitle>Admin Managed</CardTitle>
              <CardDescription>Auditors do not self-register. Admins provision access directly here.</CardDescription>
            </CardHeader>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                  <IconUserPlus className="size-5" />
                </div>
                <div>
                  <CardTitle>Register Auditor</CardTitle>
                  <CardDescription>Create a login with email and password for a new auditor.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-on-surface">Full name</label>
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Optional display name"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-on-surface">Email</label>
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="auditor@classpulse.edu"
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-on-surface">Password</label>
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-on-surface">Confirm password</label>
                  <Input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                    placeholder="Repeat the password"
                    autoComplete="new-password"
                  />
                </div>

                {error ? (
                  <div className="rounded-[16px] border border-error/25 bg-error/10 px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-[16px] border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
                    {success}
                  </div>
                ) : null}

                <div className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-on-surface-variant">
                  Auditor accounts are created in Supabase, synced into local users, and initialized with an auditor workspace on first access.
                </div>

                <Button type="submit" className="rounded-[16px]" disabled={submitting || !accessToken}>
                  <IconShieldCheck className="size-4" />
                  {submitting ? 'Creating auditor...' : 'Create auditor account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-secondary/10 text-secondary">
                  <IconUsersGroup className="size-5" />
                </div>
                <div>
                  <CardTitle>Auditor Directory</CardTitle>
                  <CardDescription>Live auditor accounts available to sign in to the compliance portal.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded-[16px] border border-border-subtle bg-surface-muted px-4 py-6 text-sm text-on-surface-variant">
                  Loading auditor accounts...
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={accounts}
                  getRowId={(row) => row.id}
                  mobileCardTitle={(row) => row.fullName}
                  mobileCardSubtitle={(row) => row.email}
                  emptyState="No auditor accounts have been created yet."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
