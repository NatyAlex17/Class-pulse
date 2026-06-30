'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowRight,
  IconBook2,
  IconChecklist,
  IconLock,
  IconMail,
  IconRosetteDiscountCheck,
  IconSchool,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const demoLogins = [
  { label: 'Student', path: '/student/dashboard' },
  { label: 'Instructor', path: '/instructor/dashboard' },
  { label: 'Admin', path: '/admin/dashboard' },
  { label: 'Auditor', path: '/auditor/dashboard' },
];

export default function LoginPage() {
  const [rememberMe, setRememberMe] = React.useState(true);
  const [selectedRole, setSelectedRole] = React.useState<string>('student');
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const path = demoLogins.find(d => d.label.toLowerCase() === selectedRole)?.path || '/student/dashboard';
    router.push(path);
  }

  return (
    <main className="fixed inset-0 flex overflow-hidden bg-background">
      {/* Left Section */}
      <section className="relative hidden w-1/2 border-r border-border-subtle px-12 py-12 xl:flex flex-col justify-between">
        <div className="cp-auth-hero absolute inset-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
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

          <div className="max-w-xl mb-12">
            <Badge variant="info" className="mb-4">
              Secure portal access
            </Badge>
            <h1 className="font-display text-[42px] font-bold leading-tight tracking-[-0.04em] text-on-surface">
              Educational management, compliance-ready.
            </h1>
            <p className="mt-6 text-base leading-7 text-on-surface-variant">
              Role-based access for students, instructors, admins, and auditors. Structured, traceable, and audit-ready.
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
                <span className="text-[11px] font-semibold uppercase text-on-surface-variant">{role}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Section - Login Form */}
      <section className="flex w-full xl:w-1/2 items-center justify-center px-6 py-8 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                <IconLock className="size-5" />
              </div>
              <Badge variant="primary">Portal Login</Badge>
            </div>
            <h2 className="font-display text-[32px] font-bold tracking-[-0.03em] text-on-surface">Sign in</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Access your Class Verse workspace</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
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
                />
              </div>
            </div>

            {/* Password */}
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
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-[12px] pl-10"
                />
              </div>
            </div>

            {/* Remember Me */}
            <label className="inline-flex items-center gap-2 text-sm text-on-surface">
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Keep me signed in</span>
            </label>

            {/* Demo Login Selection */}
            <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                Or skip to demo
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoLogins.map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => setSelectedRole(demo.label.toLowerCase())}
                    className={`rounded-[10px] px-3 py-2 text-xs font-semibold transition ${
                      selectedRole === demo.label.toLowerCase()
                        ? 'bg-primary text-on-primary'
                        : 'border border-border-subtle text-on-surface hover:border-primary/50'
                    }`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="h-11 w-full rounded-[12px]">
              {selectedRole !== 'student' ? `Open ${selectedRole} demo` : 'Open student demo'}
              <IconArrowRight className="size-4" />
            </Button>

            {/* Footer Note */}
            <div className="rounded-[12px] border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold">Demo note:</span> All portals are fully functional with demo data. Select a role above to skip credentials.
              </p>
            </div>
          </form>

          {/* Bottom Links */}
          <div className="mt-6 border-t border-border-subtle pt-4 text-center text-xs text-on-surface-variant">
            <p>Need help? Contact your program administrator</p>
          </div>
        </div>
      </section>
    </main>
  );
}
