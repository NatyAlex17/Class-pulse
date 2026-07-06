'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconAppWindow,
  IconBell,
  IconBook2,
  IconClipboardList,
  IconDashboard,
  IconFileAnalytics,
  IconHelpCircle,
  IconLayoutDashboard,
  IconMail,
  IconMenu2,
  IconSearch,
  IconSettings,
  IconAdjustments,
  IconShieldExclamation,
  IconUser,
  IconUsersGroup,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { UnreadMessageBanner } from '@/components/chat/unread-message-banner';
import { useUnreadMessagesCount } from '@/lib/chat/use-unread-count';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type AdminNavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: AdminNavItem[];
};

const navItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: IconDashboard },
  { label: 'Command Center', href: '/admin/operations', icon: IconLayoutDashboard },
  { label: 'Applications', href: '/admin/applications', icon: IconClipboardList },
  { label: 'Review Workspace', href: '/admin/applications/review', icon: IconAppWindow },
  { label: 'Violations Log', href: '/admin/violations', icon: IconShieldExclamation },
  { label: 'Reports', href: '/admin/reports', icon: IconFileAnalytics },
  {
    label: 'Configurations',
    icon: IconAdjustments,
    children: [
      { label: 'Onboarding Configs', href: '/admin/configurations/onboarding', icon: IconSettings },
      { label: 'Learning Resources', href: '/admin/configurations/learning-resources', icon: IconBook2 },
      { label: 'Cohorts', href: '/admin/configurations/cohorts', icon: IconUsersGroup },
    ],
  },
  { label: 'Inbox', href: '/admin/inbox', icon: IconMail },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

function isActiveOrChild(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
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
    { label: 'Cohort View', href: '/admin' },
    { label: 'Applications', href: '/admin/applications' },
    { label: 'Reports', href: '/admin/reports' },
  ],
  topActions,
  profileName = 'Charlie Admin',
  profileRole = 'Operations Lead',
}: AdminShellProps) {
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { unreadCount, notification, dismissNotification } = useUnreadMessagesCount();

  // Auto-expand parent menus if child is active
  const initialExpandedMenus = React.useMemo(() => {
    const expanded = new Set<string>();
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          isActiveOrChild(pathname, child.href || '')
        );
        if (hasActiveChild) {
          expanded.add(item.label);
        }
      }
    });
    return expanded;
  }, [pathname]);

  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(initialExpandedMenus);

  const toggleMenu = (label: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedMenus(newExpanded);
  };

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
        inboxHref="/admin/inbox"
        onDismiss={dismissNotification}
      />
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] flex-col border-r border-border-subtle bg-surface-low px-4 py-6 lg:flex">
        <div className="mb-10 px-2">
          <h1 className="font-display text-[30px] font-bold tracking-[-0.02em] text-primary">
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">Healthcare Education</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus.has(item.label);
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              const hasActiveChild = (item.children ?? []).some((child) =>
                isActiveOrChild(pathname, child.href || ''),
              );
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 text-sm transition-colors hover:bg-surface-high',
                      hasActiveChild
                        ? 'font-semibold text-primary'
                        : 'text-on-surface-variant hover:text-primary',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-5" />
                      <span>{item.label}</span>
                    </div>
                    <IconChevronDown
                      className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
                    />
                  </button>
                  {isExpanded && (
                    <div className="relative mt-1 space-y-0.5 pl-7">
                      <span
                        aria-hidden
                        className="absolute bottom-2 left-5.5 top-1 w-px bg-border-subtle"
                      />
                      {(item.children ?? []).map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActiveOrChild(pathname, child.href || '');
                        return (
                          <Link
                            key={`${child.label}-${child.href ?? 'child'}`}
                            href={child.href || '#'}
                            className={cn(
                              'relative flex items-center gap-2.5 rounded-[12px] px-3 py-2 text-[13px] transition-colors',
                              childActive
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
                            )}
                          >
                            {childActive && (
                              <span
                                aria-hidden
                                className="absolute -left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                              />
                            )}
                            <ChildIcon className="size-4 shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(pathname, item.href || '');
            const isInbox = item.href === '/admin/inbox';
            return (
              <Link
                key={`${item.label}-${item.href ?? 'item'}`}
                href={item.href || '#'}
                className={cn(
                  'flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'border-r-4 border-primary bg-primary/5 font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
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
                  Admin Console
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">Healthcare Education</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-border-subtle p-2 text-on-surface-variant transition hover:bg-surface-high hover:text-primary"
              >
                <IconX className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenus.has(item.label);
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  const hasActiveChild = (item.children ?? []).some((child) =>
                    isActiveOrChild(pathname, child.href || ''),
                  );
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-3 text-sm transition-colors hover:bg-surface-high',
                          hasActiveChild
                            ? 'font-semibold text-primary'
                            : 'text-on-surface-variant hover:text-primary',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="size-5" />
                          <span>{item.label}</span>
                        </div>
                        <IconChevronDown
                          className={cn('size-4 transition-transform', isExpanded && 'rotate-180')}
                        />
                      </button>
                      {isExpanded && (
                        <div className="relative mt-1 space-y-0.5 pl-7">
                          <span
                            aria-hidden
                            className="absolute bottom-2 left-5.5 top-1 w-px bg-border-subtle"
                          />
                          {(item.children ?? []).map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActiveOrChild(pathname, child.href || '');
                            return (
                              <Link
                                key={`${child.label}-${child.href ?? 'child'}`}
                                href={child.href || '#'}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  'relative flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[13px] transition-colors',
                                  childActive
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
                                )}
                              >
                                {childActive && (
                                  <span
                                    aria-hidden
                                    className="absolute -left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                                  />
                                )}
                                <ChildIcon className="size-4 shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const active = isActive(pathname, item.href || '');
                const isInbox = item.href === '/admin/inbox';
                return (
                  <Link
                    key={`${item.label}-${item.href ?? 'item'}`}
                    href={item.href || '#'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm transition-colors',
                      active
                        ? 'bg-primary/5 font-semibold text-primary'
                        : 'text-on-surface-variant hover:bg-surface-high hover:text-primary',
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
              <Button className="mb-4 h-11 w-full rounded-[16px]">Generate Report</Button>
              <div className="space-y-1">
                <button className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary">
                  <IconSettings className="size-5" />
                  <span>Settings</span>
                </button>
                <button className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-high hover:text-primary">
                  <IconHelpCircle className="size-5" />
                  <span>Support</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-subtle bg-surface px-4 lg:left-[240px] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-on-surface-variant transition hover:bg-surface-high hover:text-primary lg:hidden"
            >
              <IconMenu2 className="size-5" />
            </button>
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

          <div className="flex items-center gap-2 sm:gap-4">
            {topActions}
            <ThemeToggle />
            <button className="text-on-surface-variant transition hover:text-primary">
              <IconBell className="size-5" />
            </button>
            <div className="relative" data-profile-menu>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 border-l border-border-subtle pl-2 transition hover:opacity-80 sm:pl-4"
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
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-[16px] border border-border-subtle bg-surface shadow-lg">
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-surface px-2 lg:hidden">
        {[
          navItems[0],
          navItems[1],
          navItems[2],
          navItems[5],
          { label: 'Settings', href: '/admin/settings', icon: IconSettings },
        ].map((item) => {
          const Icon = item.icon;
          const href = item.href || '#';
          const active = isActive(pathname, href);

          return (
            <Link
              key={`${href}-${item.label}`}
              href={href}
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
