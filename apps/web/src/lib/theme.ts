export const THEME_STORAGE_KEY = 'class-verse-theme';

export const THEMES = ['light', 'dark'] as const;

export type ThemeMode = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeMode = 'light';

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value != null && THEMES.includes(value as ThemeMode);
}
