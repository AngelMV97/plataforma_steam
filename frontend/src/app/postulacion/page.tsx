"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, CheckCircleIcon, DocumentIcon } from "@/components/icons/MinimalIcons";
import { useDarkMode } from '@/hooks/useDarkMode';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';

export default function PostulacionPage() {
  const { isDark, toggle, mounted } = useDarkMode();
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] dark:border-[#1F2937] bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="block sm:hidden">
              <Image
                src={isDark ? "/logos/gomot-wordmark-dark.png" : "/logos/gomot-wordmark.png"}
                alt="Gomot Science Academy"
                width={110}
                height={26}
                priority
              />
            </div>
            <div className="hidden sm:block font-serif text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight">
              Gomot Science Academy
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-[#6B7280] dark:text-[#9CA3AF] text-xs sm:text-sm">
            <Link href="/login" className="hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors duration-200 font-medium hidden sm:inline">
              Iniciar sesión
            </Link>
            <span className="text-[#E5E7EB] dark:text-[#1F2937] hidden sm:inline">|</span>
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

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 bg-[#2F6F6D]/5 dark:bg-[#4A9B98]/10 border border-[#2F6F6D]/20 dark:border-[#4A9B98]/30 rounded-full">
            <span className="text-xs sm:text-sm text-[#2F6F6D] dark:text-[#4A9B98] font-medium">Cohorte Piloto 2026</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] leading-tight mb-4 sm:mb-6">
            Postulación a la cohorte piloto
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
            Buscamos estudiantes comprometidos con el pensamiento científico. Esta es una oportunidad para ser parte del inicio de algo transformador.
          </p>
        </div>
      </section>

      {/* Qué significa ser parte del piloto */}
      <section className="bg-white/60 dark:bg-[#1a1f26]/60 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-[#2F6F6D] dark:text-[#4A9B98]">
              <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Sobre el piloto</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4 sm:mb-6">
              ¿Qué significa ser parte de la cohorte piloto?
            </h2>
            <div>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed mb-6">
                Esta <strong>no es una inscripción abierta</strong>. Es un proceso de selección para conformar 
                el primer grupo de estudiantes que experimentará un modelo educativo único en Latinoamérica.
              </p>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed mb-6">
                Como parte de la cohorte piloto, participarás en:
              </p>
              <ul className="space-y-3 text-[#4B5563] dark:text-[#D1D5DB] mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span>Un <strong>programa de formación intensivo</strong> basado en lectura científica, bitácora de pensamiento y acompañamiento socrático</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Sesiones semanales en vivo</strong> con mentores expertos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span>Una experiencia de <strong>construcción colaborativa</strong>: tu retroalimentación ayudará a refinar el modelo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Acceso gratuito</strong> para grupo selecto (condiciones especiales para estudiantes piloto)</span>
                </li>
              </ul>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed font-medium">
                A cambio, esperamos compromiso genuino, participación activa y apertura a una forma de aprender diferente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfil ideal */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
            <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Requisitos</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
            ¿Eres el estudiante que buscamos?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] max-w-3xl">
            No buscamos estudiantes "perfectos", sino estudiantes con mentalidad de crecimiento y curiosidad genuina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl">
          <div className="bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
            <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/20 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98]" />
              </div>
              Perfil académico
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Estudiantes de <strong>9°, 10°, 11° grado o recién egresados</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Con interés en carreras <strong>STEM</strong> (ciencia, tecnología, ingeniería, matemáticas)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Capacidad de <strong>lectura en español</strong> a nivel universitario (o disposición para desarrollarla rápidamente)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Conocimientos básicos de matemáticas y física de bachillerato</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
            <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1F3A5F]/10 dark:bg-[#5B8FB9]/20 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-[#1F3A5F] dark:text-[#5B8FB9]" />
              </div>
              Actitud y compromiso
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]"><strong>Curiosidad genuina</strong> por entender cómo funciona el mundo</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Disposición a <strong>enfrentarse a textos difíciles</strong> y persistir hasta comprenderlos</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Compromiso de <strong>asistir regularmente</strong> a las sesiones y completar las actividades</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Apertura a <strong>recibir retroalimentación</strong> y reflexionar sobre el propio proceso de pensamiento</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <span className="text-[#4B5563] dark:text-[#D1D5DB]">Acceso estable a <strong>internet y un dispositivo</strong> para sesiones virtuales</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Proceso de postulación */}
      <section className="bg-white/60 dark:bg-[#1a1f26]/60 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
              <DocumentIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Proceso</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
              Cómo postular
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-6 border-2 border-[#2F6F6D] dark:border-[#4A9B98] rounded-lg">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Completa el formulario
                </h3>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  Responde con honestidad y reflexión. No buscamos respuestas "correctas", sino genuinas.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-6 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Revisión de perfil
                </h3>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  Evaluaremos tu postulación en función de motivación, compromiso y ajuste al programa.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-[#1a1f26] p-6 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 mt-2">
                  Confirmación
                </h3>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  Te notificaremos si quedas seleccionado y te compartiremos los siguientes pasos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-[#2F6F6D]/5 dark:bg-[#4A9B98]/10 border-l-4 border-[#2F6F6D] dark:border-[#4A9B98] rounded">
            <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed">
              <strong>Importante:</strong> Este es un proceso de selección, no de admisión automática. 
              Buscamos conformar un grupo cohesionado y comprometido. Los cupos son limitados.
            </p>
          </div>
        </div>
      </section>

      {/* Detalles del programa */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
            <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Detalles</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
            Información del programa piloto
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
            <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Duración
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
              <strong>4 semanas</strong> (febrero - marzo 2026)
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Con posibilidad de continuar en cohortes posteriores si el piloto es exitoso.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
            <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Modalidad
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
              <strong>100% virtual</strong> con sesiones en vivo
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              3 sesiones semanales de 90-120 minutos cada una, más trabajo asíncrono en bitácora.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1f26] p-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
            <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Inversión
            </h3>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-4">
              <strong>Condiciones especiales para piloto</strong>
            </p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Acceso gratuito, con restricciones en relación a cohortes posteriores. Habrá un único grupo selecto sin distinción de grado y nivel escolar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final - Formulario */}
      <section className="bg-gradient-to-br from-[#1F3A5F]/5 to-[#2F6F6D]/5 dark:from-[#5B8FB9]/5 dark:to-[#4A9B98]/5 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="bg-white dark:bg-[#1a1f26] p-6 sm:p-8 md:p-10 lg:p-12 border border-[#E5E7EB] dark:border-[#1F2937] rounded-2xl shadow-lg max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/20 flex items-center justify-center mx-auto mb-6">
              <DocumentIcon className="w-8 h-8 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
              Completa tu postulación
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6 sm:mb-8">
              El formulario toma aproximadamente 10-15 minutos. Tómate tu tiempo para responder con cuidado.
            </p>
            
            {/* Placeholder for Google Form - user needs to replace with actual URL */}
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeyauR_JGwEPTRvgnnl6HcyvBcvUe0PhqHYwNwTF3TEJQbAxQ/viewform?usp=dialog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-[#1F3A5F] dark:bg-[#5B8FB9] !text-white px-10 py-4 rounded-sm font-medium hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] transition-all duration-300 inline-flex items-center gap-2 shadow-md hover:shadow-lg no-underline"
            >
              Ir al formulario de postulación
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>

            <div className="mt-8 p-4 bg-[#2F6F6D]/5 dark:bg-[#4A9B98]/10 rounded-lg">
              <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                <strong>Nota:</strong> El formulario se abrirá en una nueva pestaña. 
                Recibirás una copia de tus respuestas por correo electrónico.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#E5E7EB] dark:border-[#1F2937]">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-2">
                ¿Tienes preguntas sobre el proceso?
              </p>
              <a 
                href="mailto:info@gomot.academy" 
                className="text-[#2F6F6D] dark:text-[#4A9B98] hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] font-medium transition-colors"
              >
                info@gomot.academy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1a1f26] border-t border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Link href="/" className="font-serif text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-1 inline-block hover:opacity-80 transition-opacity">
                Gomot Science Academy
              </Link>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Formación en pensamiento científico
              </p>
            </div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              © 2026 Gomot Science Academy
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
