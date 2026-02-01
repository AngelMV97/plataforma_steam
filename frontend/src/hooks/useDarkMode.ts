"use client";

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
    setMounted(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (isDark === null) return; // Wait for initialization

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggle = () => {
    setIsDark(prev => !prev);
  };

  return { isDark: isDark ?? false, toggle, mounted };
}
