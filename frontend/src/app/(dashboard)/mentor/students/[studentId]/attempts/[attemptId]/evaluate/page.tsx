// frontend/src/app/(dashboard)/mentor/students/[studentId]/attempts/[attemptId]/evaluate/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import EvaluationForm from '@/components/evaluation/EvaluationForm';
import BitacoraViewer from '@/components/evaluation/BitacoraViewer';

interface Attempt {
  id: string;
  student_id: string;
  article_id: string;
  bitacora_content: any;
  status: string;
  started_at: string;
  completed_at?: string;
  articles: {
    id: string;
    title: string;
    week_number: number;
  };
}

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  grade_level: string;
}

export default function EvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [existingEvaluations, setExistingEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [params.attemptId]);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load attempt with article data
      const attemptRes = await api.get(`/api/attempts/${params.attemptId}`);
      setAttempt(attemptRes.data);

      // Load student profile
      const profileRes = await api.get(`/api/profiles/${params.studentId}`);
      setStudent(profileRes.data);

      // Load existing evaluations
      const evalsRes = await api.get(`/api/evaluations/attempt/${params.attemptId}`);
      setExistingEvaluations(evalsRes.data);

    } catch (err: any) {
      console.error('Load error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluationSubmit(evaluation: any) {
    try {
      await api.post('/api/evaluations', {
        attempt_id: params.attemptId,
        ...evaluation
      });

      // Reload evaluations
      await loadData();
      
      setSuccessMessage('Evaluación guardada exitosamente');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError('Error al guardar evaluación: ' + err.message);
      setTimeout(() => setError(''), 5000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-xl mb-4">Error</p>
          <p>{error || 'No se encontró el intento'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#E5E7EB] dark:bg-[#1F2937] text-[#1F2937] dark:text-[#F3F4F6] rounded-lg hover:bg-[#D1D5DB] dark:hover:bg-[#374151] transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-[#2F6F6D] dark:text-[#4A9B98] hover:text-[#1F4A48] dark:hover:text-[#3A8A87] mb-2 flex items-center gap-2 transition-colors font-medium"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
            Evaluar Bitácora
          </h1>
          <div className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <p><strong>Estudiante:</strong> {student.full_name} ({student.grade_level}°)</p>
            <p><strong>Artículo:</strong> {attempt.articles.title}</p>
            <p><strong>Semana:</strong> {attempt.articles.week_number}</p>
          </div>
        </div>
      </div>

      {/* Success/Error Notifications */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Split View */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Bitácora Viewer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
            <h2 className="text-xl font-semibold mb-4 text-[#1F3A5F] dark:text-[#5B8FB9] flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Bitácora del Estudiante
            </h2>
            <BitacoraViewer content={attempt.bitacora_content} />
          </div>

          {/* Right: Evaluation Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-[#E5E7EB] dark:border-[#1F2937] sticky top-4 self-start">
            <h2 className="text-xl font-semibold mb-4 text-[#1F3A5F] dark:text-[#5B8FB9] flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Formulario de Evaluación
            </h2>
            <EvaluationForm
              gradeLevel={student.grade_level}
              existingEvaluations={existingEvaluations}
              onSubmit={handleEvaluationSubmit}
              bitacoraContent={attempt.bitacora_content}
            />
          </div>
        </div>
      </div>
    </div>
  );
}