'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UsersIcon, BookOpenIcon, BarChartIcon, AlertCircleIcon, NotebookIcon } from '@/components/icons/MinimalIcons';

interface TopicProposal {
  id: string;
  topic: string;
  likes: number;
}

export default function MentorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    pendingEvaluations: 0
  });
  const [loading, setLoading] = useState(true);
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [topProposals, setTopProposals] = useState<TopicProposal[]>([]);

  useEffect(() => {
    loadStats();
    fetchSessionRequests();
    loadTopProposals();
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

  async function fetchSessionRequests() {
    setRequestsLoading(true);
    try {
      const res = await api.get('/api/session-requests');
      setSessionRequests(res.data || res || []);
    } catch (err) {
      console.error('Error fetching session requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  }

  function loadTopProposals() {
    try {
      const stored = localStorage.getItem('topic_proposals');
      if (stored) {
        const data: TopicProposal[] = JSON.parse(stored);
        data.sort((a, b) => b.likes - a.likes);
        setTopProposals(data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
    }
  }

  const sessionRequestsPreview = sessionRequests.slice(0, 3);
  const remainingRequests = Math.max(sessionRequests.length - 3, 0);
  const remainingProposals = Math.max(
    (localStorage.getItem('topic_proposals')
      ? JSON.parse(localStorage.getItem('topic_proposals') || '[]').length
      : 0) - 3,
    0
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-8">
          Panel de Mentor
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <UsersIcon className="w-8 h-8 text-[#1F3A5F] dark:text-[#5B8FB9]" />
            </div>
            <div className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
              {loading ? '...' : stats.totalStudents}
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Estudiantes</div>
          </div>
          
          <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <NotebookIcon className="w-8 h-8 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <div className="text-3xl font-bold text-[#2F6F6D] dark:text-[#4A9B98]">
              {loading ? '...' : stats.totalAttempts}
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Bitácoras Iniciadas</div>
          </div>
          
          <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <BarChartIcon className="w-8 h-8 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <div className="text-3xl font-bold text-[#2F6F6D] dark:text-[#4A9B98]">
              {loading ? '...' : stats.completedAttempts}
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Bitácoras Completadas</div>
          </div>
          
          <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <AlertCircleIcon className="w-8 h-8 text-[#DC2626] dark:text-red-500" />
            </div>
            <div className="text-3xl font-bold text-[#DC2626] dark:text-red-500">
              {loading ? '...' : stats.pendingEvaluations}
            </div>
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Pendientes de Evaluar</div>
          </div>
        </div>
        
        {/* Student Session Requests Section */}
        <button
          onClick={() => router.push('/mentor/requests')}
          className="w-full bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937] mb-6 hover:border-[#2F6F6D]/30 hover:shadow-lg transition-all text-left"
        >
          <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-4">Solicitudes de Sesiones Individuales</h2>
          {requestsLoading ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">Cargando...</div>
          ) : sessionRequests.length === 0 ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">No hay solicitudes pendientes.</div>
          ) : (
            <ul className="space-y-4">
              {sessionRequestsPreview.map((r) => (
                <li key={r.id} className="border-b border-[#E5E7EB] dark:border-[#1F2937] pb-4 mb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{r.topic}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{r.status}</span>
                  </div>
                  <div className="text-[#4B5563] dark:text-[#D1D5DB] text-sm mt-1">{r.notes}</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    Solicitado el {new Date(r.created_at).toLocaleDateString()} por {r.student?.full_name || 'Estudiante'}
                  </div>
                </li>
              ))}
              {remainingRequests > 0 && (
                <div className="text-sm text-[#2F6F6D] dark:text-[#4A9B98] font-medium pt-2">
                  + {remainingRequests} más
                </div>
              )}
            </ul>
          )}
        </button>

        {/* Topic Proposals Section */}
        <button
          onClick={() => router.push('/mentor/proposals')}
          className="w-full bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937] mb-8 hover:border-[#2F6F6D]/30 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6]">Propuestas de Temas</h2>
          </div>

          {topProposals.length === 0 ? (
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              No hay propuestas de temas aún.
            </div>
          ) : (
            <div className="space-y-3">
              {topProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#1F3A5F] dark:text-[#5B8FB9] font-medium">{proposal.topic}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] dark:bg-[#1F2937] text-[#2F6F6D] dark:text-[#4A9B98]">
                    {proposal.likes} Likes
                  </span>
                </div>
              ))}
              {remainingProposals > 0 && (
                <div className="text-sm text-[#2F6F6D] dark:text-[#4A9B98] font-medium pt-2">
                  + {remainingProposals} más
                </div>
              )}
              <div className="text-sm text-[#2F6F6D] dark:text-[#4A9B98] font-medium pt-1">
                Ir a Propuestas →
              </div>
            </div>
          )}
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/mentor/students')}
            className="group bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-8 hover:border-[#2F6F6D]/30 hover:shadow-lg transition-all text-left"
          >
            <div className="w-14 h-14 rounded-full bg-[#1F3A5F]/10 dark:bg-[#5B8FB9]/10 flex items-center justify-center mb-6 group-hover:bg-[#1F3A5F]/15 group-hover:scale-110 transition-all duration-300">
              <UsersIcon className="w-7 h-7 text-[#1F3A5F] dark:text-[#5B8FB9]" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2 group-hover:text-[#2F6F6D] dark:group-hover:text-[#4A9B98] transition-colors">
              Ver Estudiantes
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Gestiona y evalúa las bitácoras de tus estudiantes
            </p>
          </button>

          <button
            onClick={() => router.push('/mentor/articles')}
            className="group bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-sm p-8 hover:border-[#2F6F6D]/30 hover:shadow-lg transition-all text-left"
          >
            <div className="w-14 h-14 rounded-full bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center mb-6 group-hover:bg-[#2F6F6D]/15 group-hover:scale-110 transition-all duration-300">
              <BookOpenIcon className="w-7 h-7 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2 group-hover:text-[#2F6F6D] dark:group-hover:text-[#4A9B98] transition-colors">
              Gestionar Artículos
            </h2>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">
              Sube y administra artículos científicos para análisis
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}