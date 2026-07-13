'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase2,
  IconCircleCheckFilled,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconLock,
  IconMail,
  IconSchool,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRoleRoute, type AppRole } from '@/lib/auth/role-route';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-client';

type PublicRegistrationRole = Extract<AppRole, 'student' | 'instructor'>;

const publicRoles: Array<{
  value: PublicRegistrationRole;
  label: string;
  description: string;
  icon: typeof IconSchool;
}> = [
  {
    value: 'student',
    label: 'Student',
    description: 'Self-service learner access for onboarding, coursework, and support.',
    icon: IconSchool,
  },
  {
    value: 'instructor',
    label: 'Instructor',
    description: 'Teaching workspace access for scheduling, coaching, and messaging.',
    icon: IconBriefcase2,
  },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = React.useState<PublicRegistrationRole>('student');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const router = useRouter();
  const { isSupabaseEnabled, refreshSyncedUser } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setErrorMessage('Supabase is not configured in the frontend env yet.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Full name, email, and password are required.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Use a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: selectedRole,
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.access_token) {
        const synced = await refreshSyncedUser(data.session.access_token);
        router.replace(synced?.redirectPath ?? getRoleRoute(selectedRole));
        return;
      }

      setSuccessMessage(
        'Account created in Supabase. If email confirmation is enabled, confirm your email first, then sign in.',
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (error as AuthError | undefined)?.message ?? 'Unable to complete registration right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-background">
      <section className="relative hidden w-1/2 flex-col justify-between border-r border-border-subtle px-12 py-12 xl:flex">
        <div className="cp-auth-hero absolute inset-0" />

        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-[18px] bg-primary text-on-primary shadow-soft">
              <IconShieldCheck className="size-6" />
            </div>
            <div>
              <div className="font-display text-[24px] font-bold tracking-[-0.03em] text-primary">
                Class Verse
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Role-aware registration
              </div>
            </div>
          </div>

          <div className="mb-12 max-w-xl">
            <Badge variant="info" className="mb-4">
              New user onboarding
            </Badge>
            <h1 className="font-display text-[42px] font-bold leading-tight tracking-[-0.04em] text-on-surface">
              Create a secure workspace account.
            </h1>
            <p className="mt-6 text-base leading-7 text-on-surface-variant">
              Public self-registration is enabled only for students and instructors. Admins remain
              seeded, and auditors are created through admin workflows.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <IconSchool className="h-4 w-4 text-primary" />
              Students can register directly from the app.
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <IconBriefcase2 className="h-4 w-4 text-primary" />
              Instructors can register directly from the app.
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <IconShieldCheck className="h-4 w-4 text-primary" />
              Admin and auditor roles stay controlled outside public signup.
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center px-6 py-8 sm:px-10 xl:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/login"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <IconArrowLeft className="size-4" />
              Back to sign in
            </Link>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                <IconUser className="size-5" />
              </div>
              <Badge variant="primary">Register</Badge>
            </div>
            <h2 className="font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
              Create account
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Register as a student or instructor and sync into Class Verse automatically.
            </p>
            {!isSupabaseEnabled ? (
              <p className="mt-3 rounded-[12px] border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `apps/web/.env`
                before testing live registration.
              </p>
            ) : null}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              {publicRoles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedRole(role.value)}
                    className={`relative rounded-[16px] border-2 p-4 text-left transition ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-4 ring-primary/20'
                        : 'border-border-subtle bg-surface hover:border-primary/30'
                    }`}
                  >
                    {isSelected ? (
                      <IconCircleCheckFilled className="absolute -right-2 -top-2 size-6 rounded-full bg-surface text-primary" />
                    ) : null}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-[12px] transition ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {role.label}
                        </p>
                        <p className="text-xs text-on-surface-variant">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Full name
              </label>
              <div className="relative">
                <IconUser className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  className="h-11 rounded-[12px] pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <IconMail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="you@classpulse.edu"
                  className="h-11 rounded-[12px] pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  className="h-11 rounded-[12px] pl-10 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isPasswordVisible}
                >
                  {isPasswordVisible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Confirm password
              </label>
              <div className="relative">
                <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="h-11 rounded-[12px] pl-10 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition hover:text-on-surface"
                  aria-label={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isConfirmPasswordVisible}
                >
                  {isConfirmPasswordVisible ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-[12px] border border-error/20 bg-error/10 p-3 text-sm text-error">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-[12px] border border-success/20 bg-success/10 p-3 text-sm text-success">
                {successMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-[12px]"
              disabled={isSubmitting || !isSupabaseEnabled}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Register securely
                  <IconArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="rounded-[12px] border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold">Registration flow:</span> account is created in Supabase
                first, then synced into local Postgres on the first authenticated session.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
