"use client";

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage and sync with DOM
  useEffect(() => {
    // Start with light mode by default
    const stored = localStorage.getItem('theme');
    const shouldBeDark = stored === 'dark' ? true : false;
    
    // Always start with removing dark class to ensure light mode is default
    document.documentElement.classList.remove('dark');
    
    // Then add it back only if dark mode is stored
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
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
    setIsDark(prev => prev === null ? false : !prev);
  };

  return { isDark: isDark ?? false, toggle, mounted };
}
