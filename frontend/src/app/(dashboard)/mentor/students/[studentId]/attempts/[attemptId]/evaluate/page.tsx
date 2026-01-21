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
      
      alert('Evaluación guardada exitosamente');
    } catch (err: any) {
      alert('Error al guardar evaluación: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Error</p>
          <p>{error || 'No se encontró el intento'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Evaluar Bitácora
          </h1>
          <div className="mt-2 text-sm text-gray-600">
            <p><strong>Estudiante:</strong> {student.full_name} ({student.grade_level}°)</p>
            <p><strong>Artículo:</strong> {attempt.articles.title}</p>
            <p><strong>Semana:</strong> {attempt.articles.week_number}</p>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Bitácora Viewer */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bitácora del Estudiante</h2>
            <BitacoraViewer content={attempt.bitacora_content} />
          </div>

          {/* Right: Evaluation Form */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-4 self-start">
            <h2 className="text-xl font-semibold mb-4">Formulario de Evaluación</h2>
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