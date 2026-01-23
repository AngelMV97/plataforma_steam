'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ClockIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/icons/MinimalIcons';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  meeting_link: string;
  notes: string;
  status: string;
  article: {
    title: string;
    week_number: number;
  } | null;
  facilitator: {
    full_name: string;
  };
}

export default function MentorSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    loadSessions();
  }, [filter]);

  async function loadSessions() {
    try {
      setLoading(true);
      const params = filter === 'upcoming' ? '?upcoming=true' : '';
      const res = await api.get(`/api/sessions${params}`);
      
      let filteredSessions = res.data;
      if (filter === 'completed') {
        filteredSessions = filteredSessions.filter((s: Session) => s.status === 'completed');
      }
      
      setSessions(filteredSessions);
    } catch (err) {
      console.error('Load sessions error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      core: 'Sesión Núcleo',
      reinforcement: 'Refuerzo',
      test_prep: 'Preparación ICFES',
      // Legacy support
      guided: 'Guiada',
      discussion: 'Discusión',
      metacognitive: 'Metacognitiva'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      scheduled: 'bg-[#E0F2FE] text-[#0369A1]',
      in_progress: 'bg-[#FEF3C7] text-[#92400E]',
      completed: 'bg-[#D1FAE5] text-[#065F46]',
      cancelled: 'bg-red-50 text-[#DC2626]'
    };
    const labels: Record<string, string> = {
      scheduled: 'Programada',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">Sesiones</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">Gestiona las sesiones grupales</p>
        </div>
        <button
          onClick={() => router.push('/mentor/sessions/new')}
          className="inline-flex items-center px-6 py-3 !bg-[#2F6F6D] !text-white font-medium rounded-lg hover:!bg-[#1F3A5F] transition-colors"
        >
          + Nueva Sesión
        </button>
      </div>

      <div>
        {/* Filter */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? '!bg-[#2F6F6D] dark:!bg-[#4A9B98] !text-white'
                  : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]'
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? '!bg-[#2F6F6D] dark:!bg-[#4A9B98] !text-white'
                  : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]'
              }`}
            >
              Completadas
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? '!bg-[#2F6F6D] dark:!bg-[#4A9B98] !text-white'
                  : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-8 text-center">
              <ClockIcon className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-3" />
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">No hay sesiones {filter !== 'all' && `(${filter === 'upcoming' ? 'próximas' : 'completadas'})`}</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] hover:border-[#2F6F6D] dark:hover:border-[#4A9B98] transition-all cursor-pointer"
                onClick={() => router.push(`/mentor/sessions/${session.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {session.article 
                            ? `Semana ${session.article.week_number} - ${session.article.title}`
                            : 'Sesión General'}
                        </h3>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span>
                          {new Date(session.session_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>{session.duration_minutes} min</span>
                        <span className="px-2 py-1 bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] rounded text-xs font-medium">
                          {getSessionTypeLabel(session.session_type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-3">{session.notes}</p>
                  )}

                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 !text-[#2F6F6D] hover:!text-[#1F3A5F] text-sm font-medium"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                      Enlace de reunión
                    </a>
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