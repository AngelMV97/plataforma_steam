"use client";

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and sync with DOM
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const shouldBeDark = stored === 'dark';
    
    // Apply theme to DOM immediately
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDark(shouldBeDark);
    setMounted(true);
  }, []);

  // Update DOM and localStorage when isDark changes
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
