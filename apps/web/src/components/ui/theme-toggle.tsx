'use client';

import * as React from 'react';
import { IconMoonStars, IconSunHigh } from '@tabler/icons-react';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      suppressHydrationWarning
      type="button"
      variant="secondary"
      size="sm"
      className="rounded-full px-3.5"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <IconSunHigh className="size-4" /> : <IconMoonStars className="size-4" />}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </Button>
  );
}
