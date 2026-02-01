"use client";

import Link from "next/link";
import { DocumentIcon, NotebookIcon, NodeIcon, UsersIcon, ClockIcon, TargetIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/icons/MinimalIcons";
import { useDarkMode } from '@/hooks/useDarkMode';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';
import Image from 'next/image';

export default function Home() {
  const { isDark, toggle, mounted } = useDarkMode();
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] dark:border-[#1F2937] bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center">
            <div className="block sm:hidden">
              {mounted ? (
                <Image
                  src={isDark ? "/logos/gomot-wordmark-dark.png" : "/logos/gomot-wordmark.png"}
                  alt="Gomot Science Academy"
                  width={110}
                  height={26}
                  priority
                />
              ) : (
                <div className="w-[110px] h-[26px] bg-gray-200 dark:bg-gray-700 rounded" />
              )}
            </div>
            <div className="hidden sm:block font-serif text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight">
              Gomot Science Academy
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-[#6B7280] dark:text-[#D1D5DB] text-xs sm:text-sm">
            <Link href="/login" className="hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors duration-200 font-medium">
              Iniciar sesión
            </Link>
            <span className="hidden sm:inline text-[#E5E7EB] dark:text-[#1F2937]">|</span>
            <Link href="/signup" className="hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors duration-200 font-medium">
              Registrarse
            </Link>
            {mounted && (
              <button
                onClick={toggle}
                className="p-2 rounded-sm border border-[#E5E7EB] dark:border-[#1F2937] hover:bg-white/80 dark:hover:bg-[#1a1f26]/80 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98]" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-[#1F3A5F] dark:text-[#5B8FB9]" />
                )}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section - with subtle pattern */}
      <section className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
        {/* Subtle geometric background */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#1F3A5F" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="50" fill="none" stroke="#2F6F6D" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="20" fill="none" stroke="#1F3A5F" strokeWidth="0.5"/>
            <line x1="100" y1="20" x2="100" y2="180" stroke="#2F6F6D" strokeWidth="0.3"/>
            <line x1="20" y1="100" x2="180" y2="100" stroke="#2F6F6D" strokeWidth="0.3"/>
          </svg>
        </div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#2F6F6D]/5 border border-[#2F6F6D]/20 rounded-full">
            <span className="text-xs sm:text-sm text-[#2F6F6D] font-medium">Cohorte Piloto 2026</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] leading-tight mb-4 sm:mb-6">
            Formación en pensamiento matemático y científico para la vida universitaria
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6 sm:mb-8 md:mb-10">
            Analizamos artículos, construimos modelos y aprendemos a pensar como científicos e ingenieros.
          </p>
          <Link href="/enfoque" className="group bg-white border-2 border-[#1F3A5F] !text-[#1F3A5F] px-6 sm:px-8 py-3 sm:py-4 rounded-sm font-medium hover:!bg-[#1F3A5F] hover:!text-white transition-all duration-300 inline-flex items-center gap-2 no-underline text-sm sm:text-base">
            Conoce el enfoque
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* Problem Section - with subtle background */}
      <section className="bg-white/60 dark:bg-[#1a1f26]/60 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-10 sm:py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-[#2F6F6D]">
              <div className="w-1 h-1 rounded-full bg-[#2F6F6D]"></div>
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">El desafío</span>
            </div>
            <p className="text-lg sm:text-xl text-[#1F2937] leading-relaxed mb-6 sm:mb-8 font-medium">
              Muchos estudiantes llegan a la universidad sabiendo resolver ejercicios, pero sin saber leer, comprender y cuestionar textos científicos.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="group p-5 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#2F6F6D]/30 hover:shadow-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#2F6F6D]/10 flex items-center justify-center mb-3 group-hover:bg-[#2F6F6D]/15 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#2F6F6D]"></div>
                </div>
                <p className="text-[#4B5563]">Dificultad para entender artículos científicos</p>
              </div>
              <div className="group p-5 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#2F6F6D]/30 hover:shadow-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#2F6F6D]/10 flex items-center justify-center mb-3 group-hover:bg-[#2F6F6D]/15 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#2F6F6D]"></div>
                </div>
                <p className="text-[#4B5563]">Clases universitarias incomprensibles</p>
              </div>
              <div className="group p-5 bg-white border border-[#E5E7EB] rounded-lg hover:border-[#2F6F6D]/30 hover:shadow-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#2F6F6D]/10 flex items-center justify-center mb-3 group-hover:bg-[#2F6F6D]/15 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#2F6F6D]"></div>
                </div>
                <p className="text-[#4B5563]">Frustración temprana en carreras STEM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Propuesta Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
            <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Nuestra propuesta</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
            ¿Qué hacemos diferente?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Block 1 */}
          <div className="group bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#2F6F6D]/30 dark:hover:border-[#4A9B98]/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mb-6 group-hover:bg-[#2F6F6D]/15 dark:group-hover:bg-[#4A9B98]/15 group-hover:scale-110 transition-all duration-300">
              <DocumentIcon className="text-[#2F6F6D] dark:text-[#4A9B98] w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Sesión núcleo basada en artículos
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
              Entrenamos lectura científica y razonamiento profundo, no memorización.
            </p>
          </div>

          {/* Block 2 */}
          <div className="group bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#2F6F6D]/30 dark:hover:border-[#4A9B98]/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mb-6 group-hover:bg-[#2F6F6D]/15 dark:group-hover:bg-[#4A9B98]/15 group-hover:scale-110 transition-all duration-300">
              <NotebookIcon className="text-[#2F6F6D] dark:text-[#4A9B98] w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Pensamiento visible
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
              Los estudiantes escriben, modelan y reflexionan sobre cómo piensan.
            </p>
          </div>

          {/* Block 3 */}
          <div className="group bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#2F6F6D]/30 dark:hover:border-[#4A9B98]/30 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mb-6 group-hover:bg-[#2F6F6D]/15 dark:group-hover:bg-[#4A9B98]/15 group-hover:scale-110 transition-all duration-300">
              <NodeIcon className="text-[#2F6F6D] dark:text-[#4A9B98] w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Acompañamiento cognitivo
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
              Mentores y tutor cognitivo guían el proceso sin dar respuestas.
            </p>
          </div>
        </div>
      </section>

      {/* Semana Section - with visual timeline */}
      <section className="bg-white/60 dark:bg-[#1a1f26]/60 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Estructura semanal</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
              Así se vive una semana en Gomot
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2F6F6D]/20 via-[#2F6F6D]/40 to-[#2F6F6D]/20 dark:from-[#4A9B98]/20 dark:via-[#4A9B98]/40 dark:to-[#4A9B98]/20"></div>
            
            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#2F6F6D] dark:border-[#4A9B98] rounded-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Sesión núcleo
                </h3>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
                  Análisis guiado de un artículo científico o de divulgación
                </p>
                <div className="flex items-center gap-2 text-sm text-[#2F6F6D] dark:text-[#4A9B98]">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Lectura profunda</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Sesión de refuerzo
                </h3>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
                  Matemáticas y física necesarias para comprender los conceptos
                </p>
                <div className="flex items-center gap-2 text-sm text-[#2F6F6D] dark:text-[#4A9B98]">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Fundamentos sólidos</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Sesión de preparación
                </h3>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
                  Lectura crítica y razonamiento para pruebas estandarizadas
                </p>
                <div className="flex items-center gap-2 text-sm text-[#2F6F6D] dark:text-[#4A9B98]">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Aplicación práctica</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
            <TargetIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Para quién</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
            A quién va dirigido
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="group bg-gradient-to-br from-white dark:from-[#1a1f26] to-[#2F6F6D]/5 dark:to-[#4A9B98]/5 p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#2F6F6D]/40 dark:hover:border-[#4A9B98]/40 hover:shadow-md transition-all duration-300">
            <UsersIcon className="w-8 h-8 text-[#2F6F6D] dark:text-[#4A9B98] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed font-medium">
              Estudiantes de 9° a 11° que buscan preparación universitaria real
            </p>
          </div>
          <div className="group bg-gradient-to-br from-white dark:from-[#1a1f26] to-[#1F3A5F]/5 dark:to-[#5B8FB9]/5 p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#1F3A5F]/40 dark:hover:border-[#5B8FB9]/40 hover:shadow-md transition-all duration-300">
            <UsersIcon className="w-8 h-8 text-[#1F3A5F] dark:text-[#5B8FB9] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed font-medium">
              Egresados que se preparan para la universidad
            </p>
          </div>
          <div className="group bg-gradient-to-br from-white dark:from-[#1a1f26] to-[#2F6F6D]/5 dark:to-[#4A9B98]/5 p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:border-[#2F6F6D]/40 dark:hover:border-[#4A9B98]/40 hover:shadow-md transition-all duration-300">
            <UsersIcon className="w-8 h-8 text-[#2F6F6D] dark:text-[#4A9B98] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed font-medium">
              Familias que buscan formación profunda, no atajos
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[#1F3A5F]/5 dark:from-[#5B8FB9]/5 to-[#2F6F6D]/5 dark:to-[#4A9B98]/5 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="bg-white dark:bg-[#1a1f26] p-6 sm:p-8 md:p-10 lg:p-12 border border-[#E5E7EB] dark:border-[#1F2937] rounded-2xl shadow-lg max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6">
              <TargetIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
              Gomot está iniciando su primera cohorte piloto
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6 sm:mb-8">
              Buscamos estudiantes comprometidos con aprender a pensar.
            </p>
            <Link href="/postulacion" className="group bg-white dark:bg-[#1a1f26] border-2 border-[#1F3A5F] dark:border-[#5B8FB9] !text-[#1F3A5F] dark:!text-[#5B8FB9] px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-sm font-medium hover:!bg-[#1F3A5F] dark:hover:!bg-[#5B8FB9] hover:!text-white transition-all duration-300 inline-flex items-center gap-2 shadow-sm hover:shadow-md no-underline text-sm sm:text-base">
              Postulación piloto
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-4 sm:mt-5 md:mt-6">
              Cupos limitados · Inicio febrero 2026
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1a1f26] border-t border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 md:gap-6">
            <div>
              <div className="font-serif text-lg sm:text-xl font-semibold text-[#1F3A5F] mb-1 sm:mb-2">
                Gomot Science Academy
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                Formación en pensamiento científico
              </p>
            </div>
            <div className="text-xs sm:text-sm text-[#6B7280]">
              © 2026 Gomot Science Academy
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
