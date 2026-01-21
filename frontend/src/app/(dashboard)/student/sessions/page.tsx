'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Sesiones Disponibles</h1>
          <p className="text-gray-600 mt-2">
            Regístrate para las próximas sesiones grupales
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay sesiones programadas próximamente
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isRegistered = registeredIds.has(session.id);
              const isPast = new Date(session.session_date) < new Date();

              return (
                <div key={session.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {session.article 
                          ? `Semana ${session.article.week_number} - ${session.article.title}`
                          : 'Sesión General'}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>
                          📅 {new Date(session.session_date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span>
                          🕐 {new Date(session.session_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>⏱️ {session.duration_minutes} min</span>
                        <span>👨‍🏫 {session.facilitator.full_name}</span>
                      </div>
                    </div>
                    {isRegistered && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Registrado
                      </span>
                    )}
                  </div>

                  {session.notes && (
                    <p className="text-gray-700 mb-4">{session.notes}</p>
                  )}

                  <div className="flex gap-3">
                    {!isPast && (
                      isRegistered ? (
                        <button
                          onClick={() => handleUnregister(session.id)}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                        >
                          Cancelar Registro
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(session.id)}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
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
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
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