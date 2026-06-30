'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBell,
  IconCalendarTime,
  IconChartBar,
  IconClockCog,
  IconDashboard,
  IconDots,
  IconFileDescription,
  IconHelpCircle,
  IconHistory,
  IconLogout,
  IconMail,
  IconMenu2,
  IconReportAnalytics,
  IconSettings,
  IconStethoscope,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

type InstructorNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileLabel?: string;
};

const navItems: InstructorNavItem[] = [
  { label: 'Dashboard', href: '/instructor/dashboard', icon: IconDashboard, mobileLabel: 'Home' },
  { label: 'My Students', href: '/instructor/students', icon: IconUsers, mobileLabel: 'Students' },
  { label: 'Messages', href: '/instructor/inbox', icon: IconMail, mobileLabel: 'Inbox' },
  {
    label: 'Clinical Scheduling',
    href: '/instructor/clinical-scheduling',
    icon: IconCalendarTime,
    mobileLabel: 'Schedule',
  },
  { label: 'Skills Checklists', href: '/instructor/skills', icon: IconChartBar, mobileLabel: 'Skills' },
  { label: 'Clinical Logs', href: '/instructor/clinical-logs', icon: IconHistory, mobileLabel: 'Logs' },
  { label: 'Availability', href: '/instructor/availability', icon: IconClockCog, mobileLabel: 'Time' },
  { label: 'Documents', href: '/instructor/documents', icon: IconFileDescription, mobileLabel: 'Docs' },
  { label: 'Reports', href: '/instructor/reports', icon: IconReportAnalytics, mobileLabel: 'Reports' },
  { label: 'Profile', href: '/instructor/profile', icon: IconStethoscope, mobileLabel: 'Profile' },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export interface InstructorShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  topNavLabel?: string;
  topNavLinks?: Array<{ label: string; href: string }>;
  topActions?: React.ReactNode;
  profileName?: string;
  profileMeta?: string;
  profileImageUrl?: string;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  patternedCanvas?: boolean;
}

export function InstructorShell({
  children,
  title,
  subtitle,
  topNavLabel = 'Instructor Portal',
  topNavLinks = [
    { label: 'Students', href: '/instructor/students' },
    { label: 'Clinical Logs', href: '/instructor/clinical-logs' },
    { label: 'Reports', href: '/instructor/reports' },
  ],
  topActions,
  profileName = 'Dr. Sarah Chen',
  profileMeta = 'Lead Clinical Instructor',
  profileImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMc9gChTQuisc1D56Bhd6dfcmWbkEn2eqgEcjSKvIiTjNKILXnLCqO7wkIJoCKaCJ_EOLe2wxXAv_qm5ZV0hHIEpAOW015KtdoDo-BLSyEhbGD_Mi1ARELwpZVYSqI33xSM28P3t5bKKeRC-U-sG0grXPXjW7v4GUpMuH90npGXm_WXjUqc2Ofm93aZFkf2pCR8FPbNpAiBRsuFnwXTOZdEv08vvpyVT0HZzpjH7j2kMb2-XdJ3wrfoUGP2dt4SCNo-NMjKts85GTG',
  sidebarTitle = 'Class Verse',
  sidebarSubtitle = 'Instructor Portal',
  patternedCanvas = false,
}: InstructorShellProps) {
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] flex-col border-r border-border-subtle bg-surface-low px-4 py-6 lg:flex">
        <div className="mb-10 px-2">
          <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
            {sidebarTitle}
          </h1>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.14em] text-on-surface-variant">
            {sidebarSubtitle}
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
          <Button className="mb-4 h-11 w-full rounded-[16px]">Check-in Session</Button>
          <Link
            href="/instructor/profile"
            className="flex items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
          >
            <IconSettings className="size-5" />
            <span>Profile Settings</span>
          </Link>
          <Link
            href="/instructor/reports"
            className="flex items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
          >
            <IconReportAnalytics className="size-5" />
            <span>Exports</span>
          </Link>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[290px] max-w-[86vw] flex-col border-r border-border-subtle bg-surface-low px-4 py-6 shadow-2xl">
            <div className="mb-8 flex items-start justify-between gap-4 px-2">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-primary">
                  {sidebarTitle}
                </h1>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
                  {sidebarSubtitle}
                </p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-border-subtle p-2 text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
              >
                <IconX className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm transition-colors',
                      active
                        ? 'bg-primary-container/10 font-semibold text-primary'
                        : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
                    )}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-border-subtle pt-4">
              <Button className="mb-4 h-11 w-full rounded-[16px]">Check-in Session</Button>
              <div className="space-y-1">
                <Link
                  href="/instructor/profile"
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
                >
                  <IconSettings className="size-5" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/instructor/reports"
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
                >
                  <IconReportAnalytics className="size-5" />
                  <span>Exports</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface px-4 lg:left-[240px] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-on-surface-variant transition hover:bg-surface-high hover:text-primary lg:hidden"
            >
              <IconMenu2 className="size-5" />
            </button>
            <span className="truncate font-display text-[22px] font-bold text-primary">
              {topNavLabel}
            </span>
            <div className="hidden h-6 w-px bg-border-subtle md:block" />
            <nav className="hidden items-center gap-6 md:flex">
              {topNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-on-surface-variant transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {topActions}
            <ThemeToggle />
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <button className="hidden text-on-surface-variant transition hover:text-primary sm:block">
              <IconHelpCircle className="size-5" />
            </button>
            <div className="relative" data-profile-menu>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 border-l border-border-subtle pl-2 transition hover:opacity-80 sm:pl-4"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-on-surface">{profileName}</p>
                  <p className="text-[12px] text-on-surface-variant">{profileMeta}</p>
                </div>
                <img
                  className="h-10 w-10 rounded-full border-2 border-primary-fixed object-cover cursor-pointer"
                  src={profileImageUrl}
                  alt={profileName}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[16px] border border-border-subtle bg-surface shadow-lg">
                  <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-12 w-12 rounded-full border-2 border-primary-fixed object-cover"
                        src={profileImageUrl}
                        alt={profileName}
                      />
                      <div>
                        <p className="font-semibold text-on-surface">{profileName}</p>
                        <p className="text-[12px] text-on-surface-variant">{profileMeta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/instructor/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconUser className="size-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/instructor/profile"
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

      <main className="pb-24 pt-16 lg:ml-[240px]">
        <div
          className={cn(
            'min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8',
            patternedCanvas && 'cp-grid-pattern',
          )}
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-surface px-2 lg:hidden">
        {[
          navItems[0],
          navItems[1],
          navItems[3],
          navItems[2],
          { label: 'More', href: '/instructor/profile', icon: IconDots, mobileLabel: 'More' },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.href !== '#' && isActive(pathname, item.href);

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
              <span>{item.mobileLabel ?? item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
