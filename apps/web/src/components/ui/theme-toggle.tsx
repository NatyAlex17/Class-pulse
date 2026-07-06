'use client';

import * as React from 'react';
import { IconMoonStars, IconSunHigh } from '@tabler/icons-react';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <Button
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
