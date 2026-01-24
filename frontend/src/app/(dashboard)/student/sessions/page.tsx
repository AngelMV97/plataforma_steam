'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Clock, User } from 'lucide-react';

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

export default function StudentSessionsPage() {
  const supabase = createClientComponentClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      
      // Get upcoming sessions
      const res = await api.get('/api/sessions?upcoming=true');
      setSessions(res.data);

      // Get user's registered sessions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check registration status for each session
        const registered = new Set<string>();
        for (const session of res.data) {
          try {
            const checkRes = await api.get(`/api/sessions/${session.id}`);
            const isRegistered = checkRes.data.participants.some(
              (p: any) => p.student.id === user.id
            );
            if (isRegistered) {
              registered.add(session.id);
            }
          } catch (err) {
            console.error('Check registration error:', err);
          }
        }
        setRegisteredIds(registered);
      }
    } catch (err) {
      console.error('Load sessions error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(sessionId: string) {
    try {
      await api.post(`/api/sessions/${sessionId}/register`, {});
      alert('¡Registrado exitosamente!');
      await loadSessions();
    } catch (err: any) {
      alert('Error al registrarse: ' + err.message);
    }
  }

  async function handleUnregister(sessionId: string) {
    try {
      await api.delete(`/api/sessions/${sessionId}/register`);
      alert('Registro cancelado');
      await loadSessions();
    } catch (err: any) {
      alert('Error al cancelar registro: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="bg-white dark:bg-[#1a1f26] shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">Sesiones Disponibles</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Regístrate para las próximas sesiones grupales
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
            No hay sesiones programadas próximamente
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isRegistered = registeredIds.has(session.id);
              const isPast = new Date(session.session_date) < new Date();

              return (
                <div key={session.id} className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                        {session.article 
                          ? `Semana ${session.article.week_number} - ${session.article.title}`
                          : 'Sesión General'}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {session.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {session.facilitator.full_name}
                        </span>
                      </div>
                    </div>
                    {isRegistered && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-emerald-900/30 text-green-800 dark:text-emerald-400 rounded-full text-sm font-medium">
                        ✓ Registrado
                      </span>
                    )}
                  </div>

                  {session.notes && (
                    <p className="text-[#4B5563] dark:text-[#D1D5DB] mb-4">{session.notes}</p>
                  )}

                  <div className="flex gap-3">
                    {!isPast && (
                      isRegistered ? (
                        <button
                          onClick={() => handleUnregister(session.id)}
                          className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Cancelar Registro
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(session.id)}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold"
                        >
                          Registrarse
                        </button>
                      )
                    )}
                    {session.meeting_link && isRegistered && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg font-semibold"
                      >
                        🔗 Unirse a la Reunión
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}