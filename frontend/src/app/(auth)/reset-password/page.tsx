'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { EyeIcon, EyeOffIcon } from '@/components/icons/MinimalIcons';

function ResetPasswordContent() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(!code); // if no code, we are on request stage

  // If we arrived with a recovery code, exchange it for a session so updateUser works
  useEffect(() => {
    async function exchange() {
      if (!code) return;
      setLoading(true);
      setError(null);
      setMessage(null);
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError(exchangeError.message || 'No se pudo validar el enlace. Pide uno nuevo.');
        setSessionReady(false);
      } else {
        setSessionReady(true);
        setMessage('Enlace validado. Ingresa tu nueva contraseña.');
      }
      setLoading(false);
    }
    exchange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) {
      setError(resetError.message || 'No se pudo enviar el enlace.');
    } else {
      setMessage('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.');
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || 'No se pudo actualizar la contraseña.');
    } else {
      setMessage('Contraseña actualizada. Puedes iniciar sesión nuevamente.');
      // After a short delay, return to login
      setTimeout(() => router.push('/login'), 1200);
    }
    setLoading(false);
  }

  const isResetStage = Boolean(code);

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
            {isResetStage ? 'Restablecer contraseña' : 'Recuperar acceso'}
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280]">
            {isResetStage
              ? 'Ingresa tu nueva contraseña para continuar.'
              : 'Recibirás un correo con el enlace para restablecer tu contraseña.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6 sm:p-8">
          {isResetStage ? (
            <form onSubmit={handleReset} className="space-y-5">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] focus:border-[#2F6F6D] dark:focus:border-[#4A9B98] focus:ring-2 focus:ring-[#2F6F6D]/20 dark:focus:ring-[#4A9B98]/20 focus:outline-none transition-all text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] bg-white dark:bg-[#0F1419]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">Mínimo 6 caracteres.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] focus:border-[#2F6F6D] dark:focus:border-[#4A9B98] focus:ring-2 focus:ring-[#2F6F6D]/20 dark:focus:ring-[#4A9B98]/20 focus:outline-none transition-all text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] bg-white dark:bg-[#0F1419]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Alert messages */}
              {error && (
                <div className="p-4 rounded-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-4 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full bg-[#1F3A5F] dark:bg-[#5B8FB9] !text-white px-6 py-3 rounded-sm font-medium hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendLink} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] focus:border-[#2F6F6D] dark:focus:border-[#4A9B98] focus:ring-2 focus:ring-[#2F6F6D]/20 dark:focus:ring-[#4A9B98]/20 focus:outline-none transition-all text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] bg-white dark:bg-[#0F1419]"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-4 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1F3A5F] dark:bg-[#5B8FB9] !text-white px-6 py-3 rounded-sm font-medium hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}
        </div>

        {/* Secondary actions */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="!text-[#2F6F6D] dark:!text-[#4A9B98] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/signup" className="!text-[#2F6F6D] dark:!text-[#4A9B98] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] font-semibold transition-colors">
              Regístrate aquí
            </Link>
          </p>
          <Link href="/" className="text-sm !text-[#6B7280] dark:!text-[#9CA3AF] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] transition-colors inline-flex items-center gap-1">
            <span>←</span> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419] flex items-center justify-center"><div className="animate-pulse text-[#6B7280]">Cargando...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
