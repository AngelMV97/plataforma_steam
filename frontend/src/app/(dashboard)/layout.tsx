'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDarkMode } from '@/hooks/useDarkMode';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const { isDark, toggle, mounted } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto"></div>
          <p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header Navigation */}
      <header className="bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-sm shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={profile.role === 'student' ? '/student' : '/mentor'} className="flex items-center group">
                <Image
                  src="/logos/gomot-seal.png"
                  alt="Gomot Seal"
                  width={48}
                  height={48}
                  className="mr-3 rounded-sm"
                />
                <span className="hidden sm:inline font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight group-hover:text-[#2F6F6D] dark:group-hover:text-[#4A9B98] transition-colors">
                  Gomot Science Academy
                </span>
                <span className="sm:hidden font-serif text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                  Gomot
                </span>
                {/* <span className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight group-hover:text-[#2F6F6D] dark:group-hover:text-[#4A9B98] transition-colors">
                  Gomot Science Academy
                </span> */}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-6">
              {profile.role === 'student' ? (
                <>
                  <Link
                    href="/student"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/student/articles"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Artículos
                  </Link>
                  <Link
                    href="/student/problems"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Problemas
                  </Link>
                  <Link
                    href="/student/suggestions"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Sugerencias
                  </Link>
                  <Link
                    href="/student/profile"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Perfil Cognitivo
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/mentor"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/mentor/proposals"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Propuestas
                  </Link>
                  <Link
                    href="/mentor/sessions"
                    className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Sesiones
                  </Link>
                </>
              )}
            </nav>

            {/* Right side: Dark mode, user info, logout, mobile menu */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              {mounted && (
                <button
                  onClick={toggle}
                  className="p-2 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] hover:bg-[#FAFAF8] dark:hover:bg-[#1a1f26] transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <SunIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98]" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-[#1F3A5F] dark:text-[#5B8FB9]" />
                  )}
                </button>
              )}

              {/* Desktop User Info + Logout */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9]">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB] capitalize">
                    {profile.role === 'student' ? 'Estudiante' : 'Mentor'}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                  }}
                  className="px-4 py-2 text-sm font-medium !text-[#1F3A5F] dark:!text-[#5B8FB9] border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm hover:bg-[#1F3A5F] dark:hover:bg-[#5B8FB9] hover:!text-white transition-all duration-300"
                >
                  Salir
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] hover:bg-[#FAFAF8] dark:hover:bg-[#1a1f26] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6 text-[#1F3A5F] dark:text-[#5B8FB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-[#1F3A5F] dark:text-[#5B8FB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
              <div className="flex flex-col space-y-2">
                {profile.role === 'student' ? (
                  <>
                    <Link
                      href="/student"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/student/articles"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Artículos
                    </Link>
                    <Link
                      href="/student/problems"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Problemas
                    </Link>
                    <Link
                      href="/student/suggestions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Sugerencias
                    </Link>
                    <Link
                      href="/student/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Perfil Cognitivo
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/mentor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/mentor/proposals"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Propuestas
                    </Link>
                    <Link
                      href="/mentor/sessions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="!text-[#6B7280] dark:!text-[#D1D5DB] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] px-3 py-2 text-sm font-medium transition-colors rounded"
                    >
                      Sesiones
                    </Link>
                  </>
                )}
                
                {/* Mobile User Info + Logout */}
                <div className="pt-4 mt-2 border-t border-[#E5E7EB] dark:border-[#1F2937]">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9]">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#D1D5DB] capitalize">
                      {profile.role === 'student' ? 'Estudiante' : 'Mentor'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium !text-[#DC2626] dark:!text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1a1f26] border-t border-[#E5E7EB] dark:border-[#1F2937] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-[#6B7280] dark:text-[#D1D5DB]">
            © 2026 Gomot Science Academy – Formación en pensamiento científico.
          </p>
        </div>
      </footer>
    </div>
  );
}