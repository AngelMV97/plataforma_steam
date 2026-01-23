// frontend/src/app/(dashboard)/mentor/students/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UsersIcon, NotebookIcon, BarChartIcon, CheckCircleIcon, ClockIcon, ArrowRightIcon } from '@/components/icons/MinimalIcons';

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
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center text-[#DC2626]">
          <p className="text-xl mb-4 font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-serif text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">Estudiantes</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Gestiona y evalúa las bitácoras de tus estudiantes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <UsersIcon className="w-8 h-8 text-[#1F3A5F]" />
            </div>
            <div className="text-3xl font-bold text-[#1F3A5F]">{students.length}</div>
            <div className="text-sm text-[#6B7280]">Total Estudiantes</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <NotebookIcon className="w-8 h-8 text-[#2F6F6D]" />
            </div>
            <div className="text-3xl font-bold text-[#2F6F6D]">
              {students.reduce((sum, s) => sum + s.attempts.length, 0)}
            </div>
            <div className="text-sm text-[#6B7280]">Bitácoras Iniciadas</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <BarChartIcon className="w-8 h-8 text-[#2F6F6D]" />
            </div>
            <div className="text-3xl font-bold text-[#2F6F6D]">{completedAttempts}</div>
            <div className="text-sm text-[#6B7280]">Bitácoras Completadas</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <CheckCircleIcon className="w-8 h-8 text-[#2F6F6D]" />
            </div>
            <div className="text-3xl font-bold text-[#2F6F6D]">{totalEvaluated}</div>
            <div className="text-sm text-[#6B7280]">Bitácoras Evaluadas</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-4 mb-6">
          <label className="text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mr-4">
            Filtrar por grado:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm px-4 py-2 focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all text-[#1F2937] dark:text-[#F3F4F6] bg-white dark:bg-[#1a1f26]"
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
            <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
              No hay estudiantes en este grado
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm hover:border-[#2F6F6D]/30 hover:shadow-md transition-all">
                <div className="p-6">
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1F3A5F]/10 dark:bg-[#5B8FB9]/10 flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 text-[#1F3A5F] dark:text-[#5B8FB9]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {student.full_name}
                        </h3>
                        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                          {student.email} • Grado {student.grade_level}°
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
                        {student.evaluatedCount}/{student.attempts.filter(a => a.status === 'completed').length}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Evaluadas</div>
                    </div>
                  </div>

                  {/* Attempts List */}
                  {student.attempts.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] italic p-3 bg-[#FAFAF8] dark:bg-[#0F1419] rounded-sm">
                      <NotebookIcon className="w-4 h-4" />
                      <span>Este estudiante aún no ha iniciado ninguna bitácora</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-3 flex items-center gap-2">
                        <NotebookIcon className="w-4 h-4 text-[#2F6F6D] dark:text-[#4A9B98]" />
                        Bitácoras ({student.attempts.length})
                      </h4>
                      {student.attempts.map((attempt) => {
                        // Skip attempts without article data
                        if (!attempt.articles) {
                          return null;
                        }
                        
                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-4 bg-[#FAFAF8] dark:bg-[#0F1419] border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm hover:border-[#2F6F6D]/30 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 text-[#2F6F6D] dark:text-[#4A9B98] border border-[#2F6F6D]/20 dark:border-[#4A9B98]/30">
                                  Semana {attempt.articles.week_number}
                                </span>
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                                    attempt.status === 'completed'
                                    ? 'bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 text-[#2F6F6D] dark:text-[#4A9B98] border border-[#2F6F6D]/20 dark:border-[#4A9B98]/30'
                                    : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                }`}>
                                    {attempt.status === 'completed' ? (
                                      <>
                                        <CheckCircleIcon className="w-3 h-3" />
                                        <span>Completada</span>
                                      </>
                                    ) : (
                                      <>
                                        <ClockIcon className="w-3 h-3" />
                                        <span>En Progreso</span>
                                      </>
                                    )}
                                </span>
                              </div>
                              <p className="text-sm text-[#1F2937] dark:text-[#F3F4F6] font-medium mb-1">
                                {attempt.articles.title}
                              </p>
                              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                                Iniciada: {new Date(attempt.started_at).toLocaleDateString('es-ES')}
                                {attempt.completed_at && ` • Completada: ${new Date(attempt.completed_at).toLocaleDateString('es-ES')}`}
                              </p>
                            </div>
                            {attempt.status === 'completed' && (
                              <button
                                onClick={() => router.push(
                                  `/mentor/students/${student.id}/attempts/${attempt.id}/evaluate`
                                )}
                                className="ml-4 group px-5 py-2.5 bg-[#1F3A5F] dark:bg-[#5B8FB9] hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] !text-white text-sm font-medium rounded-sm transition-all duration-300 flex items-center gap-2 shadow-sm"
                              >
                                Evaluar
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
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