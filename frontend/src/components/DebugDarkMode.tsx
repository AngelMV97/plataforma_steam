"use client";

import { useEffect, useState } from 'react';

export function DebugDarkMode() {
  const [mounted, setMounted] = useState(false);
  const [isDarkClassPresent, setIsDarkClassPresent] = useState(false);
  const [theme, setTheme] = useState('unknown');

  useEffect(() => {
    setIsDarkClassPresent(document.documentElement.classList.contains('dark'));
    setTheme(localStorage.getItem('theme') || 'null');
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-black p-3 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">
      <div className="text-black dark:text-white">
        <p>Dark class on HTML: <span className="font-bold">{isDarkClassPresent ? 'YES' : 'NO'}</span></p>
        <p>localStorage theme: <span className="font-bold">{theme}</span></p>
        <button
          onClick={() => {
            localStorage.removeItem('theme');
            document.documentElement.classList.remove('dark');
            window.location.reload();
          }}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          Reset to Light
        </button>
      </div>
    </div>
  );
}
