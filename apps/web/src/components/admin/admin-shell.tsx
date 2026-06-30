'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconAppWindow,
  IconBell,
  IconClipboardList,
  IconDashboard,
  IconFileAnalytics,
  IconHelpCircle,
  IconLayoutDashboard,
  IconLogout,
  IconSearch,
  IconSettings,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: IconDashboard },
  { label: 'Command Center', href: '/admin/operations', icon: IconLayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: IconClipboardList },
  { label: 'Review Workspace', href: '/admin/applications/review', icon: IconAppWindow },
  { label: 'Reports', href: '/admin/reports', icon: IconFileAnalytics },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  topLinks?: Array<{ label: string; href: string }>;
  topActions?: React.ReactNode;
  profileName?: string;
  profileRole?: string;
}

export function AdminShell({
  children,
  title,
  subtitle,
  searchPlaceholder = 'Global search for students, records, or logs...',
  topLinks = [
    { label: 'Cohort View', href: '/admin/dashboard' },
    { label: 'Applications', href: '/admin/applications' },
    { label: 'Reports', href: '/admin/reports' },
  ],
  topActions,
  profileName = 'Charlie Admin',
  profileRole = 'Operations Lead',
}: AdminShellProps) {
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
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">Healthcare Education</p>
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
                    ? 'border-r-4 border-primary bg-primary/5 font-semibold text-primary'
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
          <Button className="mb-4 h-11 w-full rounded-[16px]">Generate Report</Button>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary">
              <IconSettings className="size-5" />
              <span>Settings</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary">
              <IconHelpCircle className="size-5" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface px-4 lg:left-[240px] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative hidden max-w-md flex-1 md:block">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input className="h-11 rounded-full pl-10" placeholder={searchPlaceholder} />
            </div>
            <nav className="hidden items-center gap-6 lg:flex">
              {topLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-sm transition-colors',
                      active
                        ? 'font-semibold text-primary'
                        : 'text-on-surface-variant hover:text-primary',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {topActions}
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
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
                  CA
                </div>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[16px] border border-border-subtle bg-white shadow-lg z-50">
                  <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        CA
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{profileName}</p>
                        <p className="text-[12px] text-on-surface-variant">{profileRole}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconUser className="size-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
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
