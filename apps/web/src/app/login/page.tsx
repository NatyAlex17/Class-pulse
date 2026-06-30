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

const trustMetrics = [
  {
    label: 'Access Model',
    value: 'RBAC enforced',
    icon: IconShieldCheck,
  },
  {
    label: 'Program State',
    value: 'Compliance ready',
    icon: IconChecklist,
  },
  {
    label: 'Records',
    value: 'Audit traceable',
    icon: IconRosetteDiscountCheck,
  },
] as const;

const roleCards = [
  {
    title: 'Students',
    description: 'Learning progress, financials, attendance, forms, and onboarding gates.',
    icon: IconSchool,
  },
  {
    title: 'Instructors',
    description: 'Checklist review, scheduling, student records, and clinical oversight.',
    icon: IconBook2,
  },
  {
    title: 'Admins',
    description: 'Admissions, reporting, audit controls, and full operational oversight.',
    icon: IconChecklist,
  },
  {
    title: 'Auditors',
    description: 'Compliance oversight, evidence review, and regulator-ready exports.',
    icon: IconRosetteDiscountCheck,
  },
] as const;

export default function LoginPage() {
  const [rememberMe, setRememberMe] = React.useState(true);
  const [skipAsStudent, setSkipAsStudent] = React.useState(true);
  const [skipAsInstructor, setSkipAsInstructor] = React.useState(false);
  const [skipAsAdmin, setSkipAsAdmin] = React.useState(false);
  const [skipAsAuditor, setSkipAsAuditor] = React.useState(false);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (skipAsAuditor) {
      router.push('/auditor/dashboard');
      return;
    }

    if (skipAsAdmin) {
      router.push('/admin/dashboard');
      return;
    }

    if (skipAsInstructor) {
      router.push('/instructor/dashboard');
      return;
    }

    if (skipAsStudent) {
      router.push('/student/dashboard');
      return;
    }
  }

  return (
    <main className="cp-grid-pattern min-h-screen overflow-hidden bg-background">
      <div className="relative mx-auto grid min-h-screen max-w-[1600px] gap-0 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between overflow-hidden border-b border-white/70 px-6 py-8 sm:px-10 lg:px-14 xl:border-b-0 xl:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,16,142,0.12),transparent_30%),radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.10),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.65),rgba(248,250,252,0.8))]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-[18px] bg-primary text-on-primary shadow-soft">
                  <IconShieldCheck className="size-6" />
                </div>
                <div>
                  <div className="font-display text-[24px] font-bold tracking-[-0.03em] text-primary">
                    Class Verse
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Compliance-first training operations
                  </div>
                </div>
              </div>

              <Badge variant="primary" className="hidden sm:inline-flex">
                Daisy Medical Institute
              </Badge>
            </div>

            <div className="mt-16 max-w-2xl">
              <Badge variant="info" className="mb-5">
                Secure portal access
              </Badge>
              <h1 className="font-display text-[38px] font-bold leading-[1.02] tracking-[-0.04em] text-on-surface sm:text-[52px]">
                Official access point for students, instructors, and program operations.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-on-surface-variant sm:text-[17px]">
                Sign in to continue into your Class Verse workspace. Access remains structured,
                role-based, and traceable across enrollment, learning, clinical scheduling, and
                compliance workflows.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {trustMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <Card key={metric.label} className="bg-white/72">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                            {metric.label}
                          </div>
                          <div className="mt-1 text-[15px] font-semibold text-on-surface">
                            {metric.value}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-4 lg:max-w-2xl lg:grid-cols-2">
            {roleCards.map((role) => {
              const Icon = role.icon;
              const href =
                role.title === 'Students'
                  ? '/student/dashboard'
                  : role.title === 'Instructors'
                    ? '/instructor/dashboard'
                    : role.title === 'Admins'
                      ? '/admin/dashboard'
                      : '/auditor/dashboard';

              return (
                <Link key={role.title} href={href}>
                  <Card className="bg-white/68 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 items-center justify-center rounded-[16px] bg-surface-muted text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="font-display text-[18px] font-semibold tracking-[-0.02em] text-on-surface">
                            {role.title}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(226,223,255,0.20))]" />
          <div className="relative z-10 w-full max-w-[520px]">
            <Card className="overflow-hidden rounded-[28px] border-white/80 bg-white/84">
              <CardContent className="p-0">
                <div className="border-b border-border-subtle bg-white/78 px-6 py-6 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="primary">Portal login</Badge>
                      <h2 className="mt-4 font-display text-[30px] font-bold tracking-[-0.03em] text-on-surface">
                        Sign in
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                        Use your assigned account credentials to continue.
                      </p>
                    </div>
                    <div className="hidden size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary sm:flex">
                      <IconLock className="size-5" />
                    </div>
                  </div>
                </div>

                <form className="space-y-6 px-6 py-6 sm:px-8 sm:py-8" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <IconMail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@classpulse.edu"
                        className="h-12 rounded-[16px] pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
                      >
                        Password
                      </label>
                      <Link
                        href="/student/support"
                        className="text-sm font-medium text-primary transition hover:opacity-80"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <IconLock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="h-12 rounded-[16px] pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-3 text-sm text-on-surface">
                      <Checkbox
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                      <span>Keep me signed in on this device</span>
                    </label>
                    <Badge variant="neutral" className="self-start sm:self-auto">
                      Protected session
                    </Badge>
                  </div>

                  <label className="inline-flex items-center gap-3 text-sm text-on-surface">
                    <Checkbox
                      checked={skipAsStudent}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setSkipAsStudent(checked);
                        if (checked) {
                          setSkipAsInstructor(false);
                          setSkipAsAdmin(false);
                          setSkipAsAuditor(false);
                        }
                      }}
                    />
                    <span>Login as a student demo and skip credentials</span>
                  </label>

                  <label className="inline-flex items-center gap-3 text-sm text-on-surface">
                    <Checkbox
                      checked={skipAsInstructor}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setSkipAsInstructor(checked);
                        if (checked) {
                          setSkipAsStudent(false);
                          setSkipAsAdmin(false);
                          setSkipAsAuditor(false);
                        }
                      }}
                    />
                    <span>Login as an instructor demo and skip credentials</span>
                  </label>

                  <label className="inline-flex items-center gap-3 text-sm text-on-surface">
                    <Checkbox
                      checked={skipAsAdmin}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setSkipAsAdmin(checked);
                        if (checked) {
                          setSkipAsStudent(false);
                          setSkipAsInstructor(false);
                          setSkipAsAuditor(false);
                        }
                      }}
                    />
                    <span>Login as an admin demo and skip credentials</span>
                  </label>

                  <label className="inline-flex items-center gap-3 text-sm text-on-surface">
                    <Checkbox
                      checked={skipAsAuditor}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setSkipAsAuditor(checked);
                        if (checked) {
                          setSkipAsStudent(false);
                          setSkipAsInstructor(false);
                          setSkipAsAdmin(false);
                        }
                      }}
                    />
                    <span>Login as an auditor demo and skip credentials</span>
                  </label>

                  <Button type="submit" className="h-12 w-full rounded-[16px] text-sm">
                    {skipAsAuditor
                      ? 'Open auditor demo'
                      : skipAsAdmin
                        ? 'Open admin demo'
                        : skipAsInstructor
                          ? 'Open instructor demo'
                          : skipAsStudent
                            ? 'Open student demo'
                            : 'Sign in to Class Verse'}
                    <IconArrowRight className="size-4" />
                  </Button>

                  <div className="rounded-[18px] border border-border-subtle bg-surface-muted px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-info/10 text-info">
                        <IconShieldCheck className="size-4" />
                      </div>
                      <div>
                        <div className="font-display text-[16px] font-semibold tracking-[-0.02em] text-on-surface">
                          Access note
                        </div>
                        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                          Protected areas require backend-enforced role permissions. All compliance
                          sensitive actions are logged after authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="border-t border-border-subtle bg-white/84 px-6 py-4 sm:px-8">
                  <div className="flex flex-col gap-3 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Need help accessing your account? Contact your program administrator.
                    </span>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/student/dashboard"
                        className="font-medium text-primary transition hover:opacity-80"
                      >
                        Student area
                      </Link>
                      <Link
                        href="/ui-lab"
                        className="font-medium text-primary transition hover:opacity-80"
                      >
                        UI foundation
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
