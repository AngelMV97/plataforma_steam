// Update frontend/src/app/(dashboard)/mentor/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function MentorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    pendingEvaluations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const studentsRes = await api.get('/api/profiles');
      const students = studentsRes.data;

      let totalAttempts = 0;
      let completedAttempts = 0;
      let pendingEvaluations = 0;

      for (const student of students) {
        const attemptsRes = await api.get(`/api/attempts/student/${student.id}`);
        const attempts = attemptsRes.data;
        totalAttempts += attempts.length;
        
        const completed = attempts.filter((a: any) => a.status === 'completed');
        completedAttempts += completed.length;

        for (const attempt of completed) {
          const evalsRes = await api.get(`/api/evaluations/attempt/${attempt.id}`);
          if (evalsRes.data.length === 0) {
            pendingEvaluations++;
          }
        }
      }

      setStats({
        totalStudents: students.length,
        totalAttempts,
        completedAttempts,
        pendingEvaluations
      });
    } catch (err) {
      console.error('Load stats error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Panel de Mentor
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats.totalStudents}
            </div>
            <div className="text-sm text-gray-600 mt-1">Estudiantes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {loading ? '...' : stats.totalAttempts}
            </div>
            <div className="text-sm text-gray-600 mt-1">Bitácoras Iniciadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {loading ? '...' : stats.completedAttempts}
            </div>
            <div className="text-sm text-gray-600 mt-1">Bitácoras Completadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">
              {loading ? '...' : stats.pendingEvaluations}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pendientes de Evaluar</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/mentor/students')}
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Ver Estudiantes
            </h2>
            <p className="text-gray-600">
              Gestiona y evalúa las bitácoras de tus estudiantes
            </p>
          </button>

          <button
            onClick={() => router.push('/mentor/articles')}
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow text-left group"
          >
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Gestionar Artículos
            </h2>
            <p className="text-gray-600">
              Sube y administra artículos científicos para análisis
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}