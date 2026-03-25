import { useEffect } from 'react';

const DARK_CLASS = 'dark';

function getSystemPrefersDark() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function applySystemThemeClass() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle(DARK_CLASS, getSystemPrefersDark());
}

export function useSystemTheme() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applySystemThemeClass();

    const handleChange = (event: MediaQueryListEvent) => {
      document.documentElement.classList.toggle(DARK_CLASS, event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
}
