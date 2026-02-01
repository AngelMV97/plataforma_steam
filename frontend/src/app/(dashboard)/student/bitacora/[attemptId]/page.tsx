'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

// Dynamically import heavy components to avoid memory issues during compilation
const BitacoraEditor = dynamic(() => import('@/components/bitacora/BitacoraEditor'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
      <div className="text-gray-600">Cargando editor de bitácora...</div>
    </div>
  ),
});

const AiTutorPanel = dynamic(() => import('@/components/bitacora/AiTutorPanel'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
      <div className="text-gray-600">Cargando tutor IA...</div>
    </div>
  ),
});

const ProblemReflection = dynamic(() => import('@/components/problems/ProblemReflection'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
      <div className="text-gray-600">Cargando problema...</div>
    </div>
  ),
});

interface Article {
  id: string;
  title: string;
  subtitle: string;
  week_number: number;
  pdf_url: string;
}

interface Attempt {
  id: string;
  article_id: string;
  student_id: string;
  status: string;
  bitacora_content: {
    observaciones: string;
    preguntas: string[];
    hipotesis: string;
    variables: string[];
    experimentos: string;
    errores_aprendizajes: string;
    reflexiones: string;
    conclusiones: string;
    generated_problem?: {
      title: string;
      context: string;
      challenge: string;
      problem_type: string;
      scaffolding?: {
        inicial: string;
        intermedio: string;
        avanzado: string;
      };
      expected_approaches?: string[];
      metacognitive_prompts?: string[];
    };
  };
  started_at: string;
  last_updated: string;
  articles: Article;
}

export default function BitacoraPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('observaciones');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [tutorDialogOpen, setTutorDialogOpen] = useState(false);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!attempt) return;

    const interval = setInterval(() => {
      saveBitacora(attempt.bitacora_content, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [attempt]);

  async function fetchAttempt() {
    try {
      setLoading(true);
      const response = await api.get(`/api/attempts/${attemptId}`);
      setAttempt(response.data);
    } catch (err: any) {
      console.error('Error fetching attempt:', err);
      setError(err.message || 'Error al cargar bitácora');
    } finally {
      setLoading(false);
    }
  }

  async function saveBitacora(content: any, silent = false) {
    try {
      if (!silent) setSaving(true);
      setSaveError(null);
      
      await api.put(`/api/attempts/${attemptId}/bitacora`, {
        bitacora_content: content
      });
      
      setLastSaved(new Date());
      setSaveError(null);
      
      if (!silent) {
        setAttempt(prev => prev ? { ...prev, bitacora_content: content } : null);
      }
    } catch (err: any) {
      console.error('Error saving bitácora:', err);
      setSaveError('No se pudo guardar.');
      if (!silent) {
        // Clear error after 5 seconds
        setTimeout(() => setSaveError(null), 5000);
      }
    } finally {
      if (!silent) setSaving(false);
    }
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      await api.put(`/api/attempts/${attemptId}/submit`, {});
      setSubmitConfirmOpen(false);
      // Success message and redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/student/articles');
    } catch (err: any) {
      console.error('Error submitting:', err);
      setError('Error al enviar bitácora');
      setSubmitConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando bitácora...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600">{error || 'Bitácora no encontrada'}</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitted = attempt.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="hidden sm:block flex-shrink-0">
                <Image
                src="/characters/isaac-newton.png"
                alt="Isaac Newton"
                width={80}
                height={80}
                className="rounded-full border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Bitácora - Semana {attempt.articles.week_number}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {attempt.articles.title}
                </p>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">              
              {/* Save error notification */}
              {saveError && (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs sm:text-sm border border-red-200 dark:border-red-800 flex-1 sm:flex-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="line-clamp-1">{saveError}</span>
                </div>
              )}

              {/* Auto-save indicator */}
              <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap self-center">
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Guardado {formatTimeAgo(lastSaved)}
                  </span>
                ) : null}
              </div>

              {/* Submit button */}
              {!isSubmitted && (
                <Button
                  onClick={() => setSubmitConfirmOpen(true)}
                  disabled={saving}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  Enviar
                </Button>
              )}

              {isSubmitted && (
                <span className="px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap text-center">
                  ✓ Enviado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Problem Display */}
      {attempt.bitacora_content.generated_problem && (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 border-l-4 border-blue-600">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {attempt.bitacora_content.generated_problem.title}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                {attempt.bitacora_content.generated_problem.problem_type}
              </span>
            </div>
        
            <div className="prose max-w-none mb-6 text-sm sm:text-base">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Contexto</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {attempt.bitacora_content.generated_problem.context}
              </p>
            
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mt-4 mb-2">Desafío</h3>
              <p className="text-gray-900 font-medium">
                {attempt.bitacora_content.generated_problem.challenge}
              </p>
            </div>

            <button
              onClick={async () => {
              const hint = await api.post('/api/problems/hint', {
                attempt_id: attemptId,
                hint_level: 'light'
              });
              alert(hint.data.hint);
            }}
            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs sm:text-sm font-medium"
            >
              💡 Solicitar Pista
            </button>
          </div>
        </div>
      )}
      
      {/* Problem Reflection after submission */}
      {isSubmitted && attempt.bitacora_content.generated_problem && (
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <ProblemReflection 
            problem={attempt.bitacora_content.generated_problem}
            bitacora_content={attempt.bitacora_content}
          />
          
          {/* AI Analysis Button */}
          <div className="mb-6">
            <button
              onClick={async () => {
                try {
                  setLoadingAnalysis(true);
                  const analysis = await api.post('/api/problems/analyze', {
                    attempt_id: attemptId
                  });
                  setAiAnalysis(analysis.data);
                } catch (err: any) {
                  alert('Error al analizar: ' + err.message);
                } finally {
                  setLoadingAnalysis(false);
                }
              }}
              disabled={loadingAnalysis}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loadingAnalysis ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analizando tu proceso...
                </>
              ) : (
                '✨ Ver Análisis de tu Proceso de Pensamiento'
              )}
            </button>
          </div>

          {/* AI Analysis Display */}
          {aiAnalysis && (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                📊 Análisis de tu Proceso de Pensamiento
              </h3>
              
              <div className="space-y-4 text-sm sm:text-base">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">✅ Fortalezas Observadas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiAnalysis.strengths?.map((strength: string, idx: number) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>

                {/* Growth Areas */}
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">🌱 Áreas de Crecimiento:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiAnalysis.growth_areas?.map((area: string, idx: number) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>

                {/* Deep Question */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h4 className="font-semibold text-purple-900 mb-2">💭 Pregunta para Profundizar:</h4>
                  <p className="text-purple-800">{aiAnalysis.deep_question}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Bitácora Editor (full width on mobile, 2/3 on desktop) */}
          <div className="lg:col-span-2">
            <BitacoraEditor
              bitacora_content={attempt.bitacora_content}
              onSave={saveBitacora}
              currentSection={currentSection}
            />
          </div>

          {/* Right: AI Tutor Panel (hidden on mobile, visible on lg) */}
          <div className="hidden lg:block lg:col-span-1">
            <AiTutorPanel
              attemptId={attemptId}
              currentSection={currentSection}
              isReadOnly={isSubmitted}
            />
          </div>

          {/* Mobile: Floating Tutor Button */}
          <div className="fixed bottom-6 right-6 lg:hidden z-40">
            <button
              onClick={() => setTutorDialogOpen(true)}
              className="w-14 h-14 bg-[#2F6F6D] dark:bg-[#4A9B98] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center border-2 border-white dark:border-[#111827]"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                <path fillOpacity="0.5" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v1h-4a3 3 0 00-3 3v2a3 3 0 00-3 3H4a2 2 0 01-2-2V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tutor Dialog */}
      {tutorDialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden flex items-end sm:items-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-t-lg sm:rounded-lg w-full sm:max-w-md h-[80vh] sm:h-auto shadow-xl">
            {/* Dialog Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#111827]">
              <h2 className="text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6]">Tutor AI</h2>
              <button
                onClick={() => setTutorDialogOpen(false)}
                className="text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#1F2937] dark:hover:text-[#F3F4F6] transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tutor Panel Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AiTutorPanel
                attemptId={attemptId}
                currentSection={currentSection}
                isReadOnly={isSubmitted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {submitConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-xl max-w-md w-full p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-[#FEF3C7] dark:bg-[#92400E]">
                <svg className="h-6 w-6 text-[#D97706] dark:text-[#FCD34D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 11-18 0 9 9 0 0118 0" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                  Enviar Bitácora
                </h3>
              </div>
            </div>

            <p className="text-[#4B5563] dark:text-[#D1D5DB] mb-6">
              ¿Estás seguro de enviar tu bitácora para evaluación? No podrás editarla después.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSubmitConfirmOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-[#1F2937] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#111827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-[#2F6F6D] dark:bg-[#4A9B98] hover:bg-[#1F4A48] dark:hover:bg-[#3A8A87] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 10) return 'ahora';
  if (seconds < 60) return `hace ${seconds}s`;
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  return `hace ${Math.floor(seconds / 3600)}h`;
}