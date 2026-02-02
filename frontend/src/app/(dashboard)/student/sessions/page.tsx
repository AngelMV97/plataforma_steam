'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import { ClockIcon, UsersIcon, BookOpenIcon, ArrowRightIcon, CheckCircleIcon, AlertCircleIcon } from '@/components/icons/MinimalIcons';

interface Session {
  id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  meeting_link?: string;
  recording_link?: string;
  guide_link?: string;
  notes: string;
  status: string;
  article: {
    id?: string;
    title: string;
    week_number: number;
  } | null;
  facilitator: {
    full_name: string;
  };
}

interface SessionRequest {
  id: string;
  topic: string;
  preferred_dates: string;
  notes: string;
  status: string;
  created_at: string;
}

type StudentTab = 'request' | 'history';

export default function StudentSessionsPage() {
  const supabase = createClientComponentClient();
  const { user } = useAuth();

  const [tab, setTab] = useState<StudentTab>('request');

  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [myRequests, setMyRequests] = useState<SessionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // Individual session request form state
  const [topic, setTopic] = useState('');
  const [preferredDates, setPreferredDates] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadCompletedSessions();
      fetchMyRequests();
    }
  }, [user?.id]);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      if (!topic.trim() || !preferredDates.trim()) {
        setError('Por favor completa el tema y fechas preferidas');
        return;
      }

      const { error } = await supabase
        .from('session_requests')
        .insert({
          student_id: user?.id,
          topic: topic.trim(),
          description: '',
          preferred_dates: preferredDates
            .split(',')
            .map((d) => d.trim())
            .filter((d) => d),
          notes: notes.trim(),
        });

      if (error) throw error;

      setSuccess(true);
      setTopic('');
      setPreferredDates('');
      setNotes('');
      fetchMyRequests();
    } catch (err: any) {
      setError(err.message || 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchMyRequests() {
    setRequestsLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_requests')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  }

  async function loadCompletedSessions() {
    try {
      setLoading(true);
      const res = await api.get('/api/sessions');
      const allSessions: Session[] = res.data || [];
      const completed = allSessions.filter((s) => s.status === 'completed');

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setCompletedSessions([]);
        return;
      }

      const myCompleted: Session[] = [];
      for (const session of completed) {
        try {
          const detail = await api.get(`/api/sessions/${session.id}`);
          const isParticipant = (detail.data.participants || []).some(
            (p: any) => p.student.id === authUser.id
          );
          if (isParticipant) {
            myCompleted.push(detail.data);
          }
        } catch (err) {
          console.error('Check session detail error:', err);
        }
      }

      setCompletedSessions(myCompleted);
    } catch (err) {
      console.error('Load sessions error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Sesiones
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Solicita sesiones y revisa el historial con materiales.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'request', label: 'Solicitar Sesión' },
            { key: 'history', label: 'Mis Sesiones' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as StudentTab)}
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

        {tab === 'request' && (
          <>
            <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 space-y-6 border border-[#E5E7EB] dark:border-[#1F2937]">
              <h2 className="text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                Solicitar Sesión Individual
              </h2>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Describe el tema y tus preferencias de horario.
              </p>
              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                    Tema
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                    placeholder="Ejemplo: Ecuaciones diferenciales"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                    Fechas Preferidas
                  </label>
                  <input
                    type="text"
                    value={preferredDates}
                    onChange={(e) => setPreferredDates(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                    placeholder="Ejemplo: Lunes o miércoles por la tarde"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                    rows={3}
                    placeholder="¿Hay algo más que debamos saber?"
                  />
                </div>
                {error && <p className="text-sm text-[#DC2626] dark:text-red-400">{error}</p>}
                {success && <p className="text-sm text-[#2F6F6D] dark:text-[#4A9B98]">¡Solicitud enviada!</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 px-4 bg-[#2F6F6D] text-white font-semibold rounded-lg hover:bg-[#1F3A5F] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </div>

            <h3 className="text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mt-16 mb-4">
              Mis Solicitudes
            </h3>
            {requestsLoading ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-6">
                Cargando...
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-6">
                No has enviado solicitudes.
              </div>
            ) : (
              <ul className="space-y-4">
                {myRequests.map((r) => (
                  <li key={r.id} className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{r.topic}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        r.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : r.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[#4B5563] dark:text-[#D1D5DB] text-sm">{r.notes}</div>
                    <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      Solicitado el {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
            <h2 className="text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4">
              Mis Sesiones Completadas
            </h2>

            {loading ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-6">
                Cargando historial...
              </div>
            ) : completedSessions.length === 0 ? (
              <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-6">
                Aún no tienes sesiones completadas.
              </div>
            ) : (
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {session.article
                            ? `Semana ${session.article.week_number} - ${session.article.title}`
                            : 'Sesión Individual'}
                        </h3>
                        <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex flex-wrap gap-3 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {new Date(session.session_date).toLocaleDateString('es-ES')}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            {session.facilitator?.full_name || 'Mentor'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-[#D1FAE5] text-[#065F46]">
                        Completada
                      </span>
                    </div>

                    {session.notes && (
                      <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-3">
                        {session.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      {(session.recording_link || session.meeting_link) && (
                        <a
                          href={session.recording_link || session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2F6F6D] hover:text-[#1F3A5F]"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                          Grabación (Zoom)
                        </a>
                      )}
                      {session.article?.id && (
                        <a
                          href={`/student/articles/${session.article.id}`}
                          className="inline-flex items-center gap-2 text-[#2F6F6D] hover:text-[#1F3A5F]"
                        >
                          <BookOpenIcon className="w-4 h-4" />
                          Artículo
                        </a>
                      )}
                      {session.guide_link && (
                        <a
                          href={session.guide_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#2F6F6D] hover:text-[#1F3A5F]"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Guía
                        </a>
                      )}
                      {!session.guide_link && !session.article?.id && !(session.recording_link || session.meeting_link) && (
                        <span className="text-xs text-[#9CA3AF]">
                          Sin materiales registrados
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}