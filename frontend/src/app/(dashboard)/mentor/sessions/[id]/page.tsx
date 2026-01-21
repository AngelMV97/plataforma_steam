'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Participant {
  id: string;
  attendance_status: string;
  participation_notes: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    grade_level: string;
  };
}

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
  participants: Participant[];
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSession();
  }, [params.id]);

  async function loadSession() {
    try {
      setLoading(true);
      const res = await api.get(`/api/sessions/${params.id}`);
      setSession(res.data);

      // Initialize attendance state
      const initialAttendance: Record<string, { status: string; notes: string }> = {};
      res.data.participants.forEach((p: Participant) => {
        initialAttendance[p.student.id] = {
          status: p.attendance_status,
          notes: p.participation_notes || ''
        };
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('Load session error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveAttendance() {
    try {
      setSaving(true);
      const attendanceArray = Object.entries(attendance).map(([student_id, data]) => ({
        student_id,
        status: data.status,
        notes: data.notes
      }));

      await api.put(`/api/sessions/${params.id}/attendance`, { attendance: attendanceArray });
      alert('Asistencia guardada exitosamente');
      await loadSession();
    } catch (err: any) {
      alert('Error al guardar asistencia: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateSessionStatus(newStatus: string) {
    try {
      await api.put(`/api/sessions/${params.id}`, { status: newStatus });
      await loadSession();
    } catch (err: any) {
      alert('Error al actualizar estado: ' + err.message);
    }
  }

  if (loading || !session) {
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
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {session.article 
              ? `Semana ${session.article.week_number} - ${session.article.title}`
              : 'Sesión General'}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date(session.session_date).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Duración</div>
              <div className="font-semibold">{session.duration_minutes} minutos</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Tipo</div>
              <div className="font-semibold capitalize">{session.session_type}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Estado</div>
              <div className="font-semibold capitalize">{session.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Participantes</div>
              <div className="font-semibold">{session.participants.length}</div>
            </div>
          </div>

          {session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              🔗 Ir a la reunión
            </a>
          )}

          {session.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700 mb-1">Notas:</div>
              <p className="text-gray-800">{session.notes}</p>
            </div>
          )}

          {/* Session Status Actions */}
          <div className="mt-4 flex gap-2">
            {session.status === 'scheduled' && (
              <button
                onClick={() => updateSessionStatus('in_progress')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Iniciar Sesión
              </button>
            )}
            {session.status === 'in_progress' && (
              <button
                onClick={() => updateSessionStatus('completed')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Marcar como Completada
              </button>
            )}
            {session.status !== 'cancelled' && (
              <button
                onClick={() => updateSessionStatus('cancelled')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Cancelar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Attendance Tracking */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Control de Asistencia</h2>
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>

          {session.participants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aún no hay estudiantes registrados en esta sesión
            </p>
          ) : (
            <div className="space-y-3">
              {session.participants.map((participant) => (
                <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {participant.student.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {participant.student.email} • Grado {participant.student.grade_level}°
                      </div>
                    </div>
                    <select
                      value={attendance[participant.student.id]?.status || 'registered'}
                      onChange={(e) => setAttendance({
                        ...attendance,
                        [participant.student.id]: {
                          ...attendance[participant.student.id],
                          status: e.target.value
                        }
                      })}
                      className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                      <option value="registered">Registrado</option>
                      <option value="present">Presente</option>
                      <option value="absent">Ausente</option>
                      <option value="late">Llegó Tarde</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Notas de participación..."
                    value={attendance[participant.student.id]?.notes || ''}
                    onChange={(e) => setAttendance({
                      ...attendance,
                      [participant.student.id]: {
                        ...attendance[participant.student.id],
                        notes: e.target.value
                      }
                    })}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}