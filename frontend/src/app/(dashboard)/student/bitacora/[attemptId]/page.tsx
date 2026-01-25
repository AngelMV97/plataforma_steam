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
  const [currentSection, setCurrentSection] = useState<string>('observaciones');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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
      
      await api.put(`/api/attempts/${attemptId}/bitacora`, {
        bitacora_content: content
      });
      
      setLastSaved(new Date());
      
      if (!silent) {
        setAttempt(prev => prev ? { ...prev, bitacora_content: content } : null);
      }
    } catch (err: any) {
      console.error('Error saving bitácora:', err);
      if (!silent) {
        setError('Error al guardar. Intenta nuevamente.');
      }
    } finally {
      if (!silent) setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!confirm('¿Estás seguro de enviar tu bitácora para evaluación? No podrás editarla después.')) {
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/attempts/${attemptId}/submit`, {});
      alert('Bitácora enviada exitosamente. Espera la evaluación de tu mentor.');
      router.push('/student/articles');
    } catch (err: any) {
      console.error('Error submitting:', err);
      setError('Error al enviar bitácora');
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
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bitácora - Semana {attempt.articles.week_number}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {attempt.articles.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Image
                src="/characters/isaac-newton.png"
                alt="Isaac Newton"
                width={36}
                height={36}
                className="rounded-full border border-gray-200 dark:border-gray-700"
              />
              {/* Auto-save indicator */}
              <div className="text-sm text-gray-500">
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : lastSaved ? (
                  <span>
                    Guardado {formatTimeAgo(lastSaved)}
                  </span>
                ) : null}
              </div>

              {/* Submit button */}
              {!isSubmitted && (
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  Enviar para Evaluación
                </Button>
              )}

              {isSubmitted && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  ✓ Enviado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Problem Display */}
      {attempt.bitacora_content.generated_problem && (
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-l-4 border-blue-600">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {attempt.bitacora_content.generated_problem.title}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {attempt.bitacora_content.generated_problem.problem_type}
              </span>
            </div>
        
            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contexto</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {attempt.bitacora_content.generated_problem.context}
              </p>
            
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Desafío</h3>
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
            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium"
            >
              💡 Solicitar Pista
            </button>
          </div>
        </div>
      )}
      
      {/* Problem Reflection after submission */}
      {isSubmitted && attempt.bitacora_content.generated_problem && (
        <div className="max-w-[1800px] mx-auto px-6">
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📊 Análisis de tu Proceso de Pensamiento
              </h3>
              
              <div className="space-y-4">
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
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Bitácora Editor (2/3 width) */}
          <div className="lg:col-span-2">
            <BitacoraEditor
              bitacora_content={attempt.bitacora_content}
              onSave={saveBitacora}
              currentSection={currentSection}
            />
          </div>

          {/* Right: AI Tutor Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <AiTutorPanel
              attemptId={attemptId}
              currentSection={currentSection}
              isReadOnly={isSubmitted}
            />
          </div>
        </div>
      </div>
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