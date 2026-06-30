'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconAlertSquareRounded,
  IconBell,
  IconClipboardData,
  IconFolderCheck,
  IconHelpCircle,
  IconHistory,
  IconIdBadge2,
  IconLogout,
  IconNotebook,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUser,
  IconUserCheck,
  IconUsersGroup,
  IconX,
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
  { label: 'Student Records', href: '/auditor/student-records', icon: IconUsersGroup },
  { label: 'Instructor Qualifications', href: '/auditor/instructor-qualifications', icon: IconUserCheck },
  { label: 'Clinical Compliance', href: '/auditor/clinical-compliance', icon: IconNotebook },
  { label: 'Program Requirements', href: '/auditor/program-requirements', icon: IconAlertSquareRounded },
  { label: 'Documents & Evidence', href: '/auditor/documents', icon: IconFolderCheck },
  { label: 'Reports', href: '/auditor/reports', icon: IconReportAnalytics },
  { label: 'Audit Log', href: '/auditor/audit-log', icon: IconHistory },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export interface AuditorShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  topActions?: React.ReactNode;
  topProgramLabel?: string;
  profileName?: string;
  profileRole?: string;
}

export function AuditorShell({
  children,
  title,
  subtitle,
  searchPlaceholder = 'Search students, codes...',
  topActions,
  topProgramLabel = 'Golden State Nurse Assistant Training Program',
  profileName = 'Alex Auditor',
  profileRole = 'Compliance Officer',
}: AuditorShellProps) {
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-menu]')) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] flex-col border-r border-border-subtle bg-surface-low px-4 py-6 lg:flex">
        <div className="mb-10 px-2">
          <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
            Class Verse
          </h1>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.14em] text-on-surface-variant">
            Auditor Portal
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'border-r-4 border-primary bg-primary-container/10 font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border-subtle pt-4">
          <Button className="mb-4 h-11 w-full rounded-[16px]">Export Audit</Button>
          <Link
            href="/auditor/settings"
            className="flex items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
          >
            <IconSettings className="size-5" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface px-4 lg:left-[240px] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="truncate font-display text-[22px] font-bold text-primary">
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
                className="h-11 rounded-[16px] pl-10"
                placeholder={searchPlaceholder}
              />
            </div>
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <button className="hidden text-on-surface-variant transition hover:text-primary sm:block">
              <IconHelpCircle className="size-5" />
            </button>
            <Button
              variant="secondary"
              className="hidden rounded-[16px] px-5 lg:inline-flex"
            >
              <IconIdBadge2 className="size-4" />
              Program Selector
            </Button>
            <div className="relative" data-profile-menu>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 border-l border-border-subtle pl-4 transition hover:opacity-80"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-on-surface">{profileName}</p>
                  <p className="text-[12px] text-on-surface-variant">{profileRole}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary cursor-pointer">
                  AA
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[16px] border border-border-subtle bg-white shadow-lg z-50">
                  <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        AA
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{profileName}</p>
                        <p className="text-[12px] text-on-surface-variant">{profileRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/auditor/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconUser className="size-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/auditor/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconSettings className="size-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-border-subtle p-2">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        window.location.href = '/';
                      }}
                      className="w-full flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-error transition hover:bg-error/10"
                    >
                      <IconLogout className="size-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {topActions}
          </div>
        </div>
      </header>

      <main className="pb-24 pt-16 lg:ml-[240px]">
        <div
          className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8"
        >
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-white px-2 lg:hidden">
        {[
          navItems[0],
          navItems[1],
          navItems[6],
          navItems[3],
          { label: 'More', href: '/auditor/settings', icon: IconSettings },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-[10px] font-medium',
                active ? 'text-primary' : 'text-on-surface-variant',
              )}
            >
              <Icon className="size-5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
