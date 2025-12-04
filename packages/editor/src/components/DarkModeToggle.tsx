'use client';

import { Sun, Moon, Gear } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'react-email-dnd-theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

interface DarkModeToggleProps {
  minimize?: boolean;
  daisyui?: boolean;
  className?: string;
}

export function DarkModeToggle({
  minimize = false,
  daisyui = false,
  className,
}: DarkModeToggleProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeMode(stored);
    }
  }, []);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const effectiveTheme = getEffectiveTheme(mode);
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyTheme(themeMode);
    localStorage.setItem(STORAGE_KEY, themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(themeMode);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, mounted, applyTheme]);

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Gear;
    }
  };

  if (!mounted) {
    return null;
  }

  const IconComponent = getIcon();

  if (minimize) {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        className={clsx(
          'p-2 rounded-full transition-colors',
          {
            'hover:bg-slate-200 text-slate-700': !daisyui,
            'btn btn-ghost btn-circle btn-sm': daisyui,
          },
          className,
        )}
        title={`Theme: ${themeMode}`}
      >
        <IconComponent size={18} weight="duotone" />
      </button>
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-1 rounded-full p-1',
        {
          'bg-slate-200': !daisyui,
          'bg-base-200': daisyui,
        },
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setThemeMode('light')}
        className={clsx('p-2 rounded-full transition-colors', {
          'bg-white text-slate-900 shadow-sm': !daisyui && themeMode === 'light',
          'text-slate-500 hover:text-slate-700': !daisyui && themeMode !== 'light',
          'btn btn-circle btn-sm btn-primary': daisyui && themeMode === 'light',
          'btn btn-circle btn-sm btn-ghost': daisyui && themeMode !== 'light',
        })}
        title="Light mode"
      >
        <Sun size={16} weight="duotone" />
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('dark')}
        className={clsx('p-2 rounded-full transition-colors', {
          'bg-white text-slate-900 shadow-sm': !daisyui && themeMode === 'dark',
          'text-slate-500 hover:text-slate-700': !daisyui && themeMode !== 'dark',
          'btn btn-circle btn-sm btn-primary': daisyui && themeMode === 'dark',
          'btn btn-circle btn-sm btn-ghost': daisyui && themeMode !== 'dark',
        })}
        title="Dark mode"
      >
        <Moon size={16} weight="duotone" />
      </button>
      <button
        type="button"
        onClick={() => setThemeMode('system')}
        className={clsx('p-2 rounded-full transition-colors', {
          'bg-white text-slate-900 shadow-sm': !daisyui && themeMode === 'system',
          'text-slate-500 hover:text-slate-700': !daisyui && themeMode !== 'system',
          'btn btn-circle btn-sm btn-primary': daisyui && themeMode === 'system',
          'btn btn-circle btn-sm btn-ghost': daisyui && themeMode !== 'system',
        })}
        title="System preference"
      >
        <Gear size={16} weight="duotone" />
      </button>
    </div>
  );
}

export default DarkModeToggle;

