'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from '@/components/icons/MinimalIcons';
import Link from 'next/link';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block mb-4 sm:mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight hover:opacity-80 transition-opacity">
              Gomot Science Academy
            </h1>
          </Link>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1F3A5F] mb-2">
            Iniciar sesión
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280]">
            Accede a tu cuenta para continuar tu formación
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0F1419] text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#0F1419] text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F3A5F] transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/reset-password"
                className="text-sm !text-[#2F6F6D] hover:!text-[#1F3A5F] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-sm bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F3A5F] !text-white px-6 py-3 rounded-sm font-medium hover:bg-[#2F6F6D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            ¿No tienes cuenta?{' '}
            <Link
              href="/signup"
              className="!text-[#2F6F6D] hover:!text-[#1F3A5F] font-semibold transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm !text-[#6B7280] hover:!text-[#1F3A5F] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}