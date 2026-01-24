"use client";

import Link from "next/link";
import { DocumentIcon, NotebookIcon, NodeIcon, ArrowRightIcon, CheckCircleIcon } from "@/components/icons/MinimalIcons";
import { useDarkMode } from '@/hooks/useDarkMode';
import { SunIcon, MoonIcon } from '@/components/icons/ThemeIcons';

export default function EnfoquePage() {
  const { isDark, toggle, mounted } = useDarkMode();
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] dark:border-[#1F2937] bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] tracking-tight hover:opacity-80 transition-opacity">
            Gomot Science Academy
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-[#6B7280] dark:text-[#D1D5DB] text-xs sm:text-sm">
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
            <span className="text-xs sm:text-sm text-[#2F6F6D] dark:text-[#4A9B98] font-medium">Nuestro enfoque</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] leading-tight mb-4 sm:mb-6">
            Una formación que te prepara para pensar, no para repetir
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
            En Gomot, entrenamos las capacidades cognitivas que los estudiantes necesitan para triunfar en carreras STEM universitarias.
          </p>
        </div>
      </section>

      {/* Filosofía */}
      <section className="bg-white/60 dark:bg-[#1a1f26]/60 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-[#2F6F6D] dark:text-[#4A9B98]">
              <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Filosofía educativa</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-6 sm:mb-8">
              Por qué es diferente
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed mb-6">
                La mayoría de programas de preparación universitaria se centran en <strong>entrenar para exámenes</strong>: 
                resolver ejercicios repetitivos, memorizar fórmulas, responder preguntas tipo test.
              </p>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed mb-6">
                Pero cuando los estudiantes llegan a la universidad, se encuentran con un abismo: 
                clases magistrales densas, artículos científicos incomprensibles, conceptos abstractos que no tienen referencia concreta.
              </p>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed mb-6">
                <strong>Gomot entrena para el pensamiento científico real</strong>, no para exámenes. 
                Desarrollamos las capacidades cognitivas fundamentales que un universitario necesita desde el primer día:
              </p>
              <ul className="space-y-3 text-[#4B5563] dark:text-[#D1D5DB] mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Lectura profunda</strong> de textos científicos complejos</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Construcción de modelos mentales</strong> y representaciones visuales</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Razonamiento cuantitativo</strong> aplicado a problemas reales</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] mt-1 flex-shrink-0" />
                  <span><strong>Pensamiento metacognitivo</strong>: reflexionar sobre cómo pensamos</span>
                </li>
              </ul>
              <p className="text-[#1F2937] dark:text-[#F3F4F6] leading-relaxed font-medium">
                No se trata de "facilitar" la ciencia. Se trata de entrenar sistemáticamente las habilidades 
                que te permiten enfrentarte a textos y problemas difíciles con éxito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metodología - 3 pilares */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
            <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Metodología</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
            Los tres pilares de Gomot
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] max-w-3xl">
            Nuestra metodología se basa en tres componentes integrados que entrenan diferentes dimensiones del pensamiento científico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pilar 1 */}
          <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#2F6F6D] dark:border-[#4A9B98] rounded-lg">
            <div className="w-14 h-14 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mb-6">
              <DocumentIcon className="text-[#2F6F6D] dark:text-[#4A9B98] w-7 h-7" />
            </div>
            <div className="mb-4">
              <span className="text-sm font-medium text-[#2F6F6D] dark:text-[#4A9B98] uppercase tracking-wider">Pilar 1</span>
              <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mt-2 mb-4">
                Lectura científica
              </h3>
            </div>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6">
              Cada semana analizamos un <strong>artículo científico o de divulgación rigurosa</strong>. 
              No se trata de leer rápido, sino de leer profundo.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Identificamos conceptos clave y su relación</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Construimos modelos mentales de fenómenos complejos</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Evaluamos argumentos y evidencia científica</p>
              </div>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
            <div className="w-14 h-14 rounded-full bg-[#1F3A5F]/10 dark:bg-[#5B8FB9]/10 flex items-center justify-center mb-6">
              <NotebookIcon className="text-[#1F3A5F] dark:text-[#5B8FB9] w-7 h-7" />
            </div>
            <div className="mb-4">
              <span className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] uppercase tracking-wider">Pilar 2</span>
              <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mt-2 mb-4">
                Bitácora de pensamiento
              </h3>
            </div>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6">
              Los estudiantes escriben, dibujan y modelan en una <strong>bitácora digital</strong>. 
              El objetivo: hacer visible el proceso de pensamiento.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Representar conceptos de múltiples formas</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Reflexionar sobre el propio razonamiento</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Documentar el proceso de comprensión</p>
              </div>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white dark:bg-[#1a1f26] p-8 border-2 border-[#1F3A5F]/30 dark:border-[#5B8FB9]/30 rounded-lg">
            <div className="w-14 h-14 rounded-full bg-[#1F3A5F]/10 dark:bg-[#5B8FB9]/10 flex items-center justify-center mb-6">
              <NodeIcon className="text-[#1F3A5F] dark:text-[#5B8FB9] w-7 h-7" />
            </div>
            <div className="mb-4">
              <span className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] uppercase tracking-wider">Pilar 3</span>
              <h3 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mt-2 mb-4">
                Acompañamiento socrático
              </h3>
            </div>
            <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6">
              Los mentores no dan respuestas, <strong>hacen preguntas</strong>. 
              El tutor cognitivo guía sin resolver por el estudiante.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Preguntas estratégicas que activan el pensamiento</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Retroalimentación formativa continua</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A5F] dark:bg-[#5B8FB9] mt-2 flex-shrink-0"></div>
                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">Desarrollo de autonomía intelectual</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dimensiones cognitivas */}
      <section className="bg-gradient-to-br from-[#1F3A5F]/5 to-[#2F6F6D]/5 dark:from-[#5B8FB9]/5 dark:to-[#4A9B98]/5 border-y border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 text-[#2F6F6D] dark:text-[#4A9B98]">
              <div className="w-1 h-1 rounded-full bg-[#2F6F6D] dark:bg-[#4A9B98]"></div>
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Resultados</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
              Capacidades que desarrollamos
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB]">
              Estas son las dimensiones cognitivas que entrenamos sistemáticamente a lo largo del programa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                1. Comprensión conceptual profunda
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                No memorizar definiciones, sino entender conceptos complejos en múltiples niveles y poder explicarlos con claridad.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                2. Razonamiento cuantitativo
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                Aplicar matemáticas a problemas reales, interpretar datos, estimar órdenes de magnitud, evaluar la validez de modelos.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                3. Pensamiento representacional
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                Construir y alternar entre múltiples representaciones (diagramas, gráficos, ecuaciones, modelos mentales) de un mismo fenómeno.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                4. Lectura crítica
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                Identificar argumentos, evaluar evidencia, distinguir entre hechos e interpretaciones, detectar sesgos y limitaciones.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                5. Resolución de problemas complejos
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                Abordar problemas abiertos sin solución inmediata, descomponerlos, plantear hipótesis, iterarlas hasta encontrar soluciones.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1f26] p-6 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg">
              <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3">
                6. Metacognición
              </h3>
              <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                Reflexionar sobre el propio pensamiento: dónde se estanca, qué estrategias funcionan, cómo mejorar el proceso de aprendizaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 sm:py-16 md:py-20">
        <div className="bg-white dark:bg-[#1a1f26] p-6 sm:p-8 md:p-10 lg:p-12 border border-[#E5E7EB] dark:border-[#1F2937] rounded-2xl shadow-lg max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-3 sm:mb-4">
            ¿Listo para entrenar tu pensamiento científico?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed mb-6 sm:mb-8">
            La cohorte piloto inicia en febrero 2026. Los cupos son limitados.
          </p>
          <Link 
            href="/postulacion" 
            className="group bg-transparent border-2 border-[#1F3A5F] dark:border-[#5B8FB9] !text-[#1F3A5F] dark:!text-[#5B8FB9] px-10 py-4 rounded-sm font-medium hover:!bg-[#1F3A5F] dark:hover:!bg-[#5B8FB9] hover:!text-white transition-all duration-300 inline-flex items-center gap-2 shadow-sm hover:shadow-md no-underline"
          >
            Postula a la cohorte piloto
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
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
