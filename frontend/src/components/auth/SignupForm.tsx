'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeOffIcon } from '@/components/icons/MinimalIcons';
import Link from 'next/link';

export function SignupForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    gradeLevel: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.role === 'student' && !formData.gradeLevel) {
      setError('Por favor selecciona tu grado escolar');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones para crear una cuenta');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role,
        formData.role === 'student' ? formData.gradeLevel : undefined
      );
    } catch (err: any) {
      setError(err.message || 'Error al crear cuenta');
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
            Crear cuenta
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280]">
            Únete a la comunidad de pensadores científicos
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#1F2937] mb-2">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF]"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F2937] mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF]"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#1F2937] mb-2">
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] bg-white"
                required
              >
                <option value="student">Estudiante</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>

            {/* Grade Level - only for students */}
            {formData.role === 'student' && (
              <div>
                <label htmlFor="gradeLevel" className="block text-sm font-medium text-[#1F2937] mb-2">
                  Grado escolar
                </label>
                <select
                  id="gradeLevel"
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] focus:border-[#2F6F6D] dark:focus:border-[#4A9B98] focus:ring-2 focus:ring-[#2F6F6D]/20 dark:focus:ring-[#4A9B98]/20 focus:outline-none transition-all text-[#1F2937] dark:text-[#F3F4F6] bg-white dark:bg-[#0F1419]"
                  required
                >
                  <option value="">Selecciona tu grado</option>
                  <option value="9">9° grado</option>
                  <option value="10">10° grado</option>
                  <option value="11">11° grado</option>
                  <option value="graduate">Egresado</option>
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF]"
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
              <p className="mt-1 text-xs text-[#6B7280]">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F2937] mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-sm border border-[#E5E7EB] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F3A5F] transition-colors"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#E5E7EB] text-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all cursor-pointer"
                />
                <span className="text-sm text-[#4B5563] group-hover:text-[#1F2937] transition-colors">
                  Acepto los{' '}
                  <Link href="/terms" className="!text-[#2F6F6D] hover:!text-[#1F3A5F] font-medium transition-colors" target="_blank">
                    términos y condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link href="/privacy" className="!text-[#2F6F6D] hover:!text-[#1F3A5F] font-medium transition-colors" target="_blank">
                    política de privacidad
                  </Link>
                </span>
              </label>
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
              className="w-full bg-[#1F3A5F] dark:bg-[#5B8FB9] !text-white px-6 py-3 rounded-sm font-medium hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B7280]">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="!text-[#2F6F6D] hover:!text-[#1F3A5F] font-semibold transition-colors"
            >
              Inicia sesión aquí
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