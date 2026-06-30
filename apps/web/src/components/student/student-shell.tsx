'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBell,
  IconBook2,
  IconChartLine,
  IconCreditCard,
  IconDashboard,
  IconDots,
  IconFileDescription,
  IconHelpCircle,
  IconMail,
  IconPlayerPlayFilled,
  IconSettings,
  IconStethoscope,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type StudentNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  mobileLabel?: string;
};

const navItems: StudentNavItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: IconDashboard, mobileLabel: 'Home' },
  { label: 'Learning', href: '/student/learning', icon: IconBook2, mobileLabel: 'Learn' },
  { label: 'Inbox', href: '/student/inbox', icon: IconMail, mobileLabel: 'Inbox' },
  { label: 'Progress', href: '/student/progress', icon: IconChartLine, mobileLabel: 'Stats' },
  { label: 'Clinical Hours', href: '/student/clinical-hours', icon: IconStethoscope, mobileLabel: 'Hours' },
  { label: 'Financials', href: '/student/financials', icon: IconCreditCard, mobileLabel: 'Money' },
  { label: 'Documents', href: '/student/documents', icon: IconFileDescription, mobileLabel: 'Docs' },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export interface StudentShellProps {
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
  stickyFooter?: React.ReactNode;
  patternedCanvas?: boolean;
}

export function StudentShell({
  children,
  title,
  subtitle,
  topNavLabel = 'Healthcare Portal',
  topNavLinks = [
    { label: 'Curriculum', href: '/student/learning' },
    { label: 'Resources', href: '/student/documents' },
  ],
  topActions,
  profileName = 'Amara S.',
  profileMeta = 'Lvl 4 Student',
  profileImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCORLMwhTMJTUK6FODigB1moGImYYGZQHXCXSgJ2KuWB2FlIsc1k9nXp9wA_jUMwgls2xrI8ZxGgGJ84YUd2CVx8vsALJMGelvtEszS1btbtM2nUH_cfS-eMbMz-NJSUOR8z5ji3DOJ_By_LWrgvWUDQEnnA3i3MKAQ8FHsAVoA9lS5N4JG7-FEwGe5_aRHsr-OFI5MadCqWN258EqTHYnUO_Wr-NKrhFeuJLOsNBJtdxbYq7-StZxPlypb48B-UwtjgC1BeTDccqv9',
  sidebarTitle = 'Student Portal',
  sidebarSubtitle = 'Healthcare Education',
  stickyFooter,
  patternedCanvas = false,
}: StudentShellProps) {
  const pathname = usePathname();

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
          <Link href="/student/learning">
            <Button className="mb-4 h-11 w-full rounded-[16px]">
              <IconPlayerPlayFilled className="size-4" />
              Resume Learning
            </Button>
          </Link>
          <Link
            href="/student/support"
            className="flex items-center gap-3 rounded-[14px] px-3 py-2 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
          >
            <IconHelpCircle className="size-5" />
            <span>Support</span>
          </Link>
          <Link
            href="/student/settings"
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

          <div className="flex items-center gap-4">
            {topActions}
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-border-subtle pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-on-surface">{profileName}</p>
                <p className="text-[12px] text-on-surface-variant">{profileMeta}</p>
              </div>
              <img
                className="h-10 w-10 rounded-full border-2 border-primary-fixed object-cover"
                src={profileImageUrl}
                alt={profileName}
              />
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
          <div className="mx-auto w-full max-w-[1200px]">
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
        {stickyFooter}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-white px-2 lg:hidden">
        {[
          navItems[0],
          navItems[1],
          navItems[3],
          navItems[2],
          { label: 'More', href: '/student/profile', icon: IconDots, mobileLabel: 'More' },
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
