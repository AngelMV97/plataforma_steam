// frontend/src/app/(dashboard)/mentor/students/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Student {
  id: string;
  full_name: string;
  email: string;
  grade_level: string;
  created_at: string;
}

interface Attempt {
  id: string;
  article_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  articles: {
    title: string;
    week_number: number;
  } | null;
}

interface StudentWithAttempts extends Student {
  attempts: Attempt[];
  evaluatedCount: number;
}

export default function MentorStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentWithAttempts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);

      // Load all students
      const studentsRes = await api.get('/api/profiles');
      const allStudents: Student[] = studentsRes.data;

      // Load attempts and evaluations for each student
      const studentsWithData = await Promise.all(
        allStudents.map(async (student) => {
          try {
            // Get student's attempts
            const attemptsRes = await api.get(`/api/attempts/student/${student.id}`);
            const attempts: Attempt[] = attemptsRes.data;

            // Get evaluation count for completed attempts
            let evaluatedCount = 0;
            for (const attempt of attempts.filter(a => a.status === 'completed')) {
              try {
                const evalsRes = await api.get(`/api/evaluations/attempt/${attempt.id}`);
                if (evalsRes.data.length > 0) {
                  evaluatedCount++;
                }
              } catch (err) {
                console.error('Error loading evaluations:', err);
              }
            }

            return {
              ...student,
              attempts,
              evaluatedCount
            };
          } catch (err) {
            console.error(`Error loading data for student ${student.id}:`, err);
            return {
              ...student,
              attempts: [],
              evaluatedCount: 0
            };
          }
        })
      );

      setStudents(studentsWithData);
    } catch (err: any) {
      console.error('Load students error:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = selectedGrade === 'all'
    ? students
    : students.filter(s => s.grade_level === selectedGrade);

  const completedAttempts = students.reduce((sum, s) => 
    sum + s.attempts.filter(a => a.status === 'completed').length, 0
  );
  const totalEvaluated = students.reduce((sum, s) => sum + s.evaluatedCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y evalúa las bitácoras de tus estudiantes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{students.length}</div>
            <div className="text-sm text-gray-600">Total Estudiantes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {students.reduce((sum, s) => sum + s.attempts.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Bitácoras Iniciadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{completedAttempts}</div>
            <div className="text-sm text-gray-600">Bitácoras Completadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{totalEvaluated}</div>
            <div className="text-sm text-gray-600">Bitácoras Evaluadas</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="text-sm font-medium text-gray-700 mr-4">
            Filtrar por grado:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los grados</option>
            <option value="9">9°</option>
            <option value="10">10°</option>
            <option value="11">11°</option>
            <option value="graduate">Egresados</option>
          </select>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No hay estudiantes en este grado
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.email} • Grado {student.grade_level}°
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {student.evaluatedCount}/{student.attempts.filter(a => a.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-500">Evaluadas</div>
                    </div>
                  </div>

                  {/* Attempts List */}
                  {student.attempts.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Este estudiante aún no ha iniciado ninguna bitácora
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Bitácoras ({student.attempts.length}):
                      </h4>
                      {student.attempts.map((attempt) => {
                        // Skip attempts without article data
                        if (!attempt.articles) {
                          return null;
                        }
                        
                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Semana {attempt.articles.week_number}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    attempt.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {attempt.status === 'completed' ? '✓ Completada' : '⏳ En Progreso'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 mt-1">
                                {attempt.articles.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Iniciada: {new Date(attempt.started_at).toLocaleDateString('es-ES')}
                                {attempt.completed_at && ` • Completada: ${new Date(attempt.completed_at).toLocaleDateString('es-ES')}`}
                              </p>
                            </div>
                            {attempt.status === 'completed' && (
                              <button
                                onClick={() => router.push(
                                  `/mentor/students/${student.id}/attempts/${attempt.id}/evaluate`
                                )}
                                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Evaluar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}