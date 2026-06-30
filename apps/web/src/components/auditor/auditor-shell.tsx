'use client';

import Link from 'next/link';
import {
  IconAlertSquareRounded,
  IconBell,
  IconClipboardData,
  IconFolderCheck,
  IconHelpCircle,
  IconHistory,
  IconIdBadge2,
  IconNotebook,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUserCheck,
  IconUsersGroup,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuditorNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: AuditorNavItem[] = [
  { label: 'Compliance Dashboard', href: '/auditor/dashboard', icon: IconClipboardData },
  { label: 'Student Records', href: '/auditor/dashboard', icon: IconUsersGroup },
  { label: 'Instructor Qualifications', href: '/auditor/dashboard', icon: IconUserCheck },
  { label: 'Clinical Compliance', href: '/auditor/dashboard', icon: IconNotebook },
  { label: 'Program Requirements', href: '/auditor/dashboard', icon: IconAlertSquareRounded },
  { label: 'Documents & Evidence', href: '/auditor/dashboard', icon: IconFolderCheck },
  { label: 'Reports', href: '/auditor/reports', icon: IconReportAnalytics },
  { label: 'Audit Log', href: '/auditor/dashboard', icon: IconHistory },
];

export interface AuditorShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  topActions?: React.ReactNode;
  topProgramLabel?: string;
  activeItem: string;
}

export function AuditorShell({
  children,
  title,
  subtitle,
  searchPlaceholder = 'Search students, codes...',
  topActions,
  topProgramLabel = 'Golden State Nurse Assistant Training Program',
  activeItem,
}: AuditorShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] flex-col border-r border-border-subtle bg-surface-low px-3 py-5 lg:flex">
        <div className="mb-8 px-2">
          <h1 className="font-display text-[28px] font-bold tracking-[-0.03em] text-primary">
            Class Verse
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
            Auditor Portal
          </p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === activeItem;

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[12px] px-4 py-3 text-[14px] transition-colors',
                  active
                    ? 'bg-primary-fixed font-medium text-primary'
                    : 'text-on-surface hover:bg-surface-high hover:text-primary'
                )}
              >
                <Icon className="size-5 shrink-0" stroke={1.8} />
                <span className="leading-7">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border-subtle pt-6">
          <div className="flex items-center gap-4 px-2 py-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[20px] font-semibold text-white">
              A
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-5 text-on-surface">Auditor Profile</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                Admin Access
              </p>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface px-4 lg:left-[240px] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden whitespace-nowrap font-display text-[22px] font-semibold text-on-surface md:inline">
              Compliance Audit
            </span>
            <div className="hidden h-6 w-px bg-border-subtle md:block" />
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              <span className="max-w-[260px] truncate text-sm font-medium text-primary">
                {topProgramLabel}
              </span>
              <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-secondary-fixed">
                Auditor Access
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                className="h-10 w-64 rounded-full border-border-subtle bg-surface-low pl-10"
                placeholder={searchPlaceholder}
              />
            </div>
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconSettings className="size-5" />
            </button>
            <button className="hidden text-on-surface-variant transition hover:text-primary sm:block">
              <IconHelpCircle className="size-5" />
            </button>
            <Button
              variant="secondary"
              className="hidden rounded-[12px] border-border-subtle bg-transparent px-4 text-on-surface-variant hover:bg-surface-high lg:inline-flex"
            >
              <IconIdBadge2 className="size-4" />
              Program Selector
            </Button>
            {topActions}
          </div>
        </div>
      </header>

      <main className="pb-12 pt-16 lg:ml-[240px]">
        <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1240px]">
            <div className="mb-8">
              <h2 className="font-display text-[30px] font-bold tracking-[-0.02em] text-on-surface">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-base text-on-surface-variant">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
