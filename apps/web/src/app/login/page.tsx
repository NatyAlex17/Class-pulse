'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';
import {
  IconArrowRight,
  IconBook2,
  IconChecklist,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconLock,
  IconMail,
  IconRosetteDiscountCheck,
  IconSchool,
  IconShieldCheck,
} from '@tabler/icons-react';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getRoleRoute } from '@/lib/auth/role-route';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-client';

const demoLogins = [
  { label: 'Student', path: '/student/dashboard' },
  { label: 'Instructor', path: '/instructor/dashboard' },
  { label: 'Admin', path: '/admin/dashboard' },
  { label: 'Auditor', path: '/auditor/dashboard' },
];

export default function LoginPage() {
  const [rememberMe, setRememberMe] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const router = useRouter();
  const { syncedUser, isLoading, isSupabaseEnabled, refreshSyncedUser } = useAuth();

  React.useEffect(() => {
    if (syncedUser) {
      router.replace(syncedUser.redirectPath);
    }
  }, [router, syncedUser]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setErrorMessage('Supabase is not configured in the frontend env yet.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        throw error ?? new Error('Sign in failed.');
      }

      const synced = await refreshSyncedUser(data.session.access_token);
      const redirectPath = synced?.redirectPath ?? getRoleRoute(data.user.user_metadata?.role);
      router.replace(redirectPath);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : (error as AuthError | undefined)?.message ?? 'Unable to sign in right now.';
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
                Compliance-first training
              </div>
            </div>
          </div>

          <div className="mb-12 max-w-xl">
            <Badge variant="info" className="mb-4">
              Secure portal access
            </Badge>
            <h1 className="font-display text-[42px] font-bold leading-tight tracking-[-0.04em] text-on-surface">
              Educational management, compliance-ready.
            </h1>
            <p className="mt-6 text-base leading-7 text-on-surface-variant">
              Role-based access for students, instructors, admins, and auditors. Structured,
              traceable, and audit-ready.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'RBAC enforced', icon: IconShieldCheck },
              { label: 'Compliance ready', icon: IconChecklist },
              { label: 'Audit traceable', icon: IconRosetteDiscountCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex gap-3">
          {['Students', 'Instructors', 'Admins', 'Auditors'].map((role) => {
            const icons = {
              Students: IconSchool,
              Instructors: IconBook2,
              Admins: IconChecklist,
              Auditors: IconRosetteDiscountCheck,
            };
            const Icon = icons[role as keyof typeof icons];

            return (
              <div key={role} className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase text-on-surface-variant">
                  {role}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex w-full items-center justify-center px-6 py-8 sm:px-10 xl:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                <IconLock className="size-5" />
              </div>
              <Badge variant="primary">Portal Login</Badge>
            </div>
            <h2 className="font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Access your Class Verse workspace
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              New here?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create a student or instructor account
              </Link>
            </p>
            {!isSupabaseEnabled ? (
              <p className="mt-3 rounded-[12px] border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `apps/web/.env`
                before testing live login.
              </p>
            ) : null}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <IconMail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  type="email"
                  placeholder="you@classpulse.edu"
                  className="h-11 rounded-[12px] pl-10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Password
                </label>
                <Link href="/" className="text-xs font-medium text-primary hover:opacity-80">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  className="h-11 rounded-[12px] pl-10 pr-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <button
                  suppressHydrationWarning
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

            <label className="inline-flex items-center gap-2 text-sm text-on-surface">
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>

            {errorMessage ? (
              <div className="rounded-[12px] border border-error/20 bg-error/10 p-3 text-sm text-error">
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-[12px]"
              disabled={isSubmitting || isLoading || !isSupabaseEnabled}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in securely
                  <IconArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                UI walkthrough shortcuts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoLogins.map((demo) => (
                  <Button
                    key={demo.label}
                    type="button"
                    variant="secondary"
                    className="h-10 rounded-[12px]"
                    onClick={() => router.push(demo.path)}
                  >
                    {demo.label} demo
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-[12px] border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold">Integration note:</span> successful Supabase sign-in
                now calls the backend auth sync before routing you into the correct portal.
              </p>
            </div>
          </form>

          <div className="mt-6 border-t border-border-subtle pt-4 text-center text-xs text-on-surface-variant">
            <p>Need help? Contact your program administrator</p>
          </div>
        </div>
      </section>
    </main>
  );
}
