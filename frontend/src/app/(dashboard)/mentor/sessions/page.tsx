'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  UsersIcon,
  BookOpenIcon
} from '@/components/icons/MinimalIcons';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  meeting_link: string;
  notes: string;
  status: string;
  article: {
    id?: string;
    title: string;
    week_number: number;
  } | null;
}

interface Participant {
  student: {
    id: string;
    full_name: string;
  };
}

interface SessionRequest {
  id: string;
  topic: string;
  description: string;
  preferred_dates: string[];
  notes: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  student_id: string;
  student: {
    full_name: string;
    email: string;
    grade_level?: string;
  };
}

interface ArticleOption {
  id: string;
  title: string;
  week_number: number;
}

interface StudentOption {
  id: string;
  full_name: string;
}

type MentorTab = 'requests' | 'materials' | 'history';

export default function MentorSessionsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user } = useAuth();

  const [tab, setTab] = useState<MentorTab>('requests');

  // Requests (pending)
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [requestsActionLoading, setRequestsActionLoading] = useState<string | null>(null);

  // Materials form
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [materialsSubmitting, setMaterialsSubmitting] = useState(false);
  const [materialsSuccess, setMaterialsSuccess] = useState(false);
  const [materialsError, setMaterialsError] = useState('');

  const [materialStudentId, setMaterialStudentId] = useState('');
  const [materialTopic, setMaterialTopic] = useState('');
  const [materialSessionDate, setMaterialSessionDate] = useState('');
  const [materialZoomLink, setMaterialZoomLink] = useState('');
  const [materialArticleId, setMaterialArticleId] = useState('');
  const [materialGuideLink, setMaterialGuideLink] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');

  // History
  const [historySessions, setHistorySessions] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [participantsBySession, setParticipantsBySession] = useState<Record<string, Participant[]>>({});
  const [studentFilter, setStudentFilter] = useState('');

  useEffect(() => {
    if (tab === 'requests' && user?.id) {
      fetchPendingRequests();
    }
    if (tab === 'materials') {
      loadMaterialsOptions();
    }
    if (tab === 'history') {
      loadHistory();
    }
  }, [tab, user?.id]);

  async function fetchPendingRequests() {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const { data, error } = await supabase
        .from('session_requests')
        .select(`
          *,
          student:student_id(full_name, email, grade_level)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((r: any) => ({
        ...r,
        student: Array.isArray(r.student) ? r.student[0] : r.student
      }));

      setRequests(formatted);
    } catch (err: any) {
      setRequestsError(err.message || 'Error al cargar solicitudes');
    } finally {
      setRequestsLoading(false);
    }
  }

  function handleSchedule(request: SessionRequest) {
    const params = new URLSearchParams({
      requestId: request.id,
      topic: request.topic || '',
      studentId: request.student_id,
      studentName: request.student?.full_name || '',
    });
    router.push(`/mentor/sessions/new?${params.toString()}`);
  }

  async function handleReject(requestId: string) {
    setRequestsActionLoading(requestId);
    setRequestsError('');
    try {
      const { error } = await supabase
        .from('session_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      await fetchPendingRequests();
    } catch (err: any) {
      setRequestsError(err.message || 'Error al rechazar solicitud');
    } finally {
      setRequestsActionLoading(null);
    }
  }

  async function loadMaterialsOptions() {
    try {
      const [articlesRes, studentsRes] = await Promise.all([
        api.get('/api/articles'),
        supabase.from('profiles').select('id, full_name').eq('role', 'student')
      ]);

      setArticles((articlesRes.data || []) as ArticleOption[]);
      setStudents((studentsRes.data || []) as StudentOption[]);
    } catch (err) {
      // Non-blocking: keep empty lists
      console.error('Load materials options error:', err);
    }
  }

  async function handleMaterialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMaterialsSubmitting(true);
    setMaterialsError('');
    setMaterialsSuccess(false);

    try {
      if (!materialStudentId || !materialTopic || !materialSessionDate || !materialZoomLink) {
        setMaterialsError('Por favor completa todos los campos obligatorios.');
        return;
      }

      // TODO: Replace with API call to persist materials
      setTimeout(() => {
        setMaterialsSubmitting(false);
        setMaterialsSuccess(true);
        setMaterialStudentId('');
        setMaterialTopic('');
        setMaterialSessionDate('');
        setMaterialZoomLink('');
        setMaterialArticleId('');
        setMaterialGuideLink('');
        setMaterialNotes('');
      }, 800);
    } catch (err: any) {
      setMaterialsError(err.message || 'Error al registrar materiales');
    } finally {
      setMaterialsSubmitting(false);
    }
  }

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      const res = await api.get('/api/sessions');
      const completed = (res.data || []).filter((s: Session) => s.status === 'completed');
      setHistorySessions(completed);

      const details = await Promise.all(
        completed.map(async (s: Session) => {
          try {
            const detail = await api.get(`/api/sessions/${s.id}`);
            return { id: s.id, participants: detail.data.participants || [] };
          } catch {
            return { id: s.id, participants: [] as Participant[] };
          }
        })
      );

      const map: Record<string, Participant[]> = {};
      details.forEach((d) => {
        map[d.id] = d.participants;
      });
      setParticipantsBySession(map);
    } catch (err) {
      console.error('Load history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  const filteredHistory = studentFilter.trim()
    ? historySessions.filter((s) => {
        const participants = participantsBySession[s.id] || [];
        return participants.some((p) =>
          p.student.full_name.toLowerCase().includes(studentFilter.toLowerCase())
        );
      })
    : historySessions;

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      core: 'Sesión Núcleo',
      reinforcement: 'Refuerzo',
      test_prep: 'Preparación ICFES',
      guided: 'Guiada',
      discussion: 'Discusión',
      metacognitive: 'Metacognitiva'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Sesiones
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Gestiona solicitudes, materiales y el historial de sesiones.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'requests', label: 'Solicitudes Pendientes' },
            { key: 'materials', label: 'Subir Materiales' },
            { key: 'history', label: 'Historial' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as MentorTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-[#2F6F6D] text-white'
                  : 'bg-white dark:bg-[#1a1f26] text-[#4B5563] dark:text-[#D1D5DB] border border-[#E5E7EB] dark:border-[#1F2937]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'requests' && (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#1F2937] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                Solicitudes Pendientes
              </h2>
              <button
                onClick={() => router.push('/mentor/requests')}
                className="text-sm text-[#2F6F6D] dark:text-[#4A9B98] hover:underline"
              >
                Ver todas
              </button>
            </div>

            {requestsError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded text-sm flex gap-2">
                <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{requestsError}</span>
              </div>
            )}

            {requestsLoading ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                Cargando solicitudes...
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No hay solicitudes pendientes.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {request.topic}
                        </h3>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          {request.student?.full_name} • {request.student?.email}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-3">
                        {request.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSchedule(request)}
                        className="px-3 py-2 bg-[#2F6F6D] text-white rounded-lg text-sm font-medium hover:bg-[#1F3A5F] transition-colors"
                      >
                        Agendar
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={requestsActionLoading === request.id}
                        className="px-3 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-60"
                      >
                        {requestsActionLoading === request.id ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'materials' && (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#1F2937] p-6">
            <h2 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Subir Materiales
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
              Registra grabación, guía y enlaces asociados a la sesión.
            </p>

            <form onSubmit={handleMaterialsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Estudiante
                </label>
                <select
                  value={materialStudentId}
                  onChange={(e) => setMaterialStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                  required
                >
                  <option value="">Selecciona un estudiante</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Tema
                </label>
                <input
                  type="text"
                  value={materialTopic}
                  onChange={(e) => setMaterialTopic(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                  placeholder="Ejemplo: Integrales definidas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Fecha de sesión
                </label>
                <input
                  type="date"
                  value={materialSessionDate}
                  onChange={(e) => setMaterialSessionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Zoom (grabación)
                </label>
                <input
                  type="url"
                  value={materialZoomLink}
                  onChange={(e) => setMaterialZoomLink(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Artículo
                </label>
                <select
                  value={materialArticleId}
                  onChange={(e) => setMaterialArticleId(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                >
                  <option value="">Selecciona un artículo</option>
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      Semana {a.week_number} - {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Guía (Drive)
                </label>
                <input
                  type="url"
                  value={materialGuideLink}
                  onChange={(e) => setMaterialGuideLink(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                  Notas / Resumen
                </label>
                <textarea
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                />
              </div>

              {materialsError && (
                <p className="text-sm text-[#DC2626] dark:text-red-400">{materialsError}</p>
              )}
              {materialsSuccess && (
                <p className="text-sm text-[#2F6F6D] dark:text-[#4A9B98]">¡Materiales registrados!</p>
              )}

              <button
                type="submit"
                disabled={materialsSubmitting}
                className="w-full py-2 px-4 bg-[#2F6F6D] text-white font-semibold rounded-lg hover:bg-[#1F3A5F] transition-colors disabled:opacity-60"
              >
                {materialsSubmitting ? 'Registrando...' : 'Registrar Materiales'}
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#1F2937] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                Historial de Sesiones
              </h2>
              <input
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                placeholder="Filtrar por estudiante..."
                className="w-full sm:w-72 px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-sm text-[#1F3A5F] dark:text-[#D1D5DB]"
              />
            </div>

            {historyLoading ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                Cargando historial...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
                No hay sesiones completadas con ese filtro.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((session) => {
                  const participants = participantsBySession[session.id] || [];
                  return (
                    <div
                      key={session.id}
                      className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4 hover:border-[#2F6F6D] transition-colors cursor-pointer"
                      onClick={() => router.push(`/mentor/sessions/${session.id}`)}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#D1FAE5] text-[#065F46]">
                          Completada
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                          {getSessionTypeLabel(session.session_type)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                        {session.article
                          ? `Semana ${session.article.week_number} - ${session.article.title}`
                          : 'Sesión Individual'}
                      </h3>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString('es-ES')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          {participants.length === 0
                            ? 'Sin participantes'
                            : participants.map((p) => p.student.full_name).join(', ')}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mt-2">
                          {session.notes}
                        </p>
                      )}
                      {session.meeting_link && (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-sm text-[#2F6F6D] hover:text-[#1F3A5F] mt-2"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                          Enlace de sesión
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}