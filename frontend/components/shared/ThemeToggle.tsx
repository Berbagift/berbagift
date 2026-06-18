'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className="w-8 h-8" />; // Placeholder to prevent layout shift
  }

  return (
    <div className="flex items-center p-0.5 rounded-full border border-neutral-5 bg-background">
      <button
        onClick={() => {
          setTheme('light');
          localStorage.setItem('theme', 'light');
          document.documentElement.classList.remove('dark');
        }}
        className={cn(
          "w-7 h-6 flex items-center justify-center rounded-full transition-colors",
          theme === 'light'
            ? "bg-neutral-2 text-black"
            : "text-neutral-6 hover:text-neutral-1"
        )}
        aria-label="Light mode"
      >
        <i className="fi fi-rr-sun text-[13px] mt-0.5" />
      </button>
      <button
        onClick={() => {
          setTheme('dark');
          localStorage.setItem('theme', 'dark');
          document.documentElement.classList.add('dark');
        }}
        className={cn(
          "w-7 h-6 flex items-center justify-center rounded-full transition-colors",
          theme === 'dark'
            ? "bg-neutral-10 text-white"
            : "text-neutral-6 hover:text-black"
        )}
        aria-label="Dark mode"
      >
        <i className="fi fi-rr-moon text-[13px] mt-0.5" />
      </button>
    </div>
  );
}
