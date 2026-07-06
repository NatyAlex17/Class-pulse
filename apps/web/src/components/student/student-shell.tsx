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
  IconFileText,
  IconHelpCircle,
  IconMenu2,
  IconMail,
  IconPlayerPlayFilled,
  IconSettings,
  IconStethoscope,
  IconUserCheck,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useAuth } from '@/components/auth/auth-provider';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { UnreadMessageBanner } from '@/components/chat/unread-message-banner';
import { useUnreadMessagesCount } from '@/lib/chat/use-unread-count';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { StudentIntakeModal } from '@/components/student/student-intake-modal';

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
  {
    label: 'Clinical Hours',
    href: '/student/clinical-hours',
    icon: IconStethoscope,
    mobileLabel: 'Hours',
  },
  { label: 'Financials', href: '/student/financials', icon: IconCreditCard, mobileLabel: 'Money' },
  {
    label: 'Documents',
    href: '/student/documents',
    icon: IconFileDescription,
    mobileLabel: 'Docs',
  },
  { label: 'Onboarding', href: '/student/onboarding', icon: IconUserCheck, mobileLabel: 'Start' },
  { label: 'Forms', href: '/student/forms', icon: IconFileText, mobileLabel: 'Forms' },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

function formatRoleLabel(role?: string) {
  if (!role) {
    return 'Student';
  }

  return role
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return 'S';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
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
    { label: 'Curriculum', href: '/student/curriculum' },
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
  const { workflowStage, portalHydrated, portalUnlocked } = useStudentDemo();
  const { user, syncedUser } = useAuth();
  const [workflowOpen, setWorkflowOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { unreadCount, notification, dismissNotification } = useUnreadMessagesCount();

  const resolvedProfileName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : typeof user?.user_metadata?.name === 'string' && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : syncedUser?.email
          ? syncedUser.email
          : profileName;
  const resolvedProfileMeta = `${formatRoleLabel(syncedUser?.role)}${
    syncedUser?.status ? ` · ${syncedUser.status}` : ''
  }`;
  const resolvedProfileImageUrl =
    typeof user?.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url.trim()
      ? user.user_metadata.avatar_url.trim()
      : typeof user?.user_metadata?.picture === 'string' && user.user_metadata.picture.trim()
        ? user.user_metadata.picture.trim()
        : profileImageUrl;

  React.useEffect(() => {
    if (portalHydrated && !portalUnlocked) {
      setWorkflowOpen(true);
    }
  }, [portalHydrated, portalUnlocked]);

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
      <UnreadMessageBanner
        notification={notification}
        inboxHref="/student/inbox"
        onDismiss={dismissNotification}
      />
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
            const isInbox = item.href === '/student/inbox';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'border-r-4 border-primary bg-primary-container/10 font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-high hover:text-primary'
                )}
              >
                <Icon className="size-5" />
                <span className="flex-1">{item.label}</span>
                {isInbox && unreadCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
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
                const isInbox = item.href === '/student/inbox';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm transition-colors',
                      active
                        ? 'bg-primary-container/10 font-semibold text-primary'
                        : 'text-on-surface-variant hover:bg-surface-high hover:text-primary'
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1">{item.label}</span>
                    {isInbox && unreadCount > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-border-subtle pt-4">
              <Link href="/student/learning">
                <Button className="mb-4 h-11 w-full rounded-[16px]">
                  <IconPlayerPlayFilled className="size-4" />
                  Resume Learning
                </Button>
              </Link>
              <div className="space-y-1">
                <Link
                  href="/student/support"
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
                >
                  <IconHelpCircle className="size-5" />
                  <span>Support</span>
                </Link>
                <Link
                  href="/student/settings"
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
                >
                  <IconSettings className="size-5" />
                  <span>Settings</span>
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
              suppressHydrationWarning
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
            <button
              suppressHydrationWarning
              className="text-on-surface-variant transition hover:text-primary"
            >
              <IconBell className="size-5" />
            </button>
            <div className="relative" data-profile-menu>
              <button
                suppressHydrationWarning
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 border-l border-border-subtle pl-2 transition hover:opacity-80 sm:pl-4"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-on-surface">{resolvedProfileName}</p>
                  <p className="text-[12px] text-on-surface-variant">{resolvedProfileMeta}</p>
                </div>
                {resolvedProfileImageUrl ? (
                  <img
                    className="h-10 w-10 rounded-full border-2 border-primary-fixed object-cover cursor-pointer"
                    src={resolvedProfileImageUrl}
                    alt={resolvedProfileName}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-fixed bg-primary/10 text-xs font-bold text-primary">
                    {getInitials(resolvedProfileName)}
                  </div>
                )}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[16px] border border-border-subtle bg-surface shadow-lg">
                  <div className="border-b border-border-subtle p-4">
                    <div className="flex items-center gap-3">
                      {resolvedProfileImageUrl ? (
                        <img
                          className="h-12 w-12 rounded-full border-2 border-primary-fixed object-cover"
                          src={resolvedProfileImageUrl}
                          alt={resolvedProfileName}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-fixed bg-primary/10 text-sm font-bold text-primary">
                          {getInitials(resolvedProfileName)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-on-surface">{resolvedProfileName}</p>
                        <p className="text-[12px] text-on-surface-variant">{resolvedProfileMeta}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/student/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconUser className="size-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/student/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-muted"
                    >
                      <IconSettings className="size-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-border-subtle p-2">
                    <SignOutButton
                      onBeforeSignOut={() => setProfileMenuOpen(false)}
                      className="w-full flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-sm text-error transition hover:bg-error/10"
                    />
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
            patternedCanvas && 'cp-grid-pattern'
          )}
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div
              className={cn(
                'mb-6 flex flex-col gap-3 rounded-[18px] border px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
                portalUnlocked ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'
              )}
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                  Student Flow Status
                </p>
                <p className="mt-1 text-sm text-on-surface">
                  {portalUnlocked
                    ? 'Portal is active. You can still reopen the walkthrough anytime.'
                    : `Student flow is paused at ${workflowStage.replaceAll('_', ' ')}.`}
                </p>
              </div>
              <Button
                variant={portalUnlocked ? 'secondary' : 'default'}
                className="rounded-full"
                onClick={() => setWorkflowOpen(true)}
              >
                {portalUnlocked ? 'Reopen Walkthrough' : 'Continue Intake Flow'}
              </Button>
            </div>
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-surface px-2 lg:hidden">
        {[
          navItems[0],
          navItems[1],
          navItems[3],
          navItems[2],
          { label: 'More', href: '/student/profile', icon: IconDots, mobileLabel: 'More' },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.href !== '#' && isActive(pathname, item.href);
          const isInbox = item.href === '/student/inbox';

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 text-[10px] font-medium',
                active ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                {isInbox && unreadCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </span>
              <span>{item.mobileLabel ?? item.label}</span>
            </Link>
          );
        })}
      </nav>

      <StudentIntakeModal open={workflowOpen} onClose={() => setWorkflowOpen(false)} />
    </div>
  );
}
