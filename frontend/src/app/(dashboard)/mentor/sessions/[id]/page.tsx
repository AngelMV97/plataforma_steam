'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ClockIcon, UsersIcon, CheckCircleIcon, ArrowRightIcon, TrashIcon } from '@/components/icons/MinimalIcons';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, sessionTitle: '' });

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
      setError(null);
      setSuccessMessage(null);
      const attendanceArray = Object.entries(attendance).map(([student_id, data]) => ({
        student_id,
        status: data.status,
        notes: data.notes
      }));

      await api.put(`/api/sessions/${params.id}/attendance`, { attendance: attendanceArray });
      setSuccessMessage('Asistencia guardada exitosamente');
      await loadSession();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar asistencia');
    } finally {
      setSaving(false);
    }
  }

  async function updateSessionStatus(newStatus: string) {
    try {
      setError(null);
      setSuccessMessage(null);
      await api.put(`/api/sessions/${params.id}`, { status: newStatus });
      await loadSession();
      setSuccessMessage('Estado actualizado exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
    }
  }

  async function handleDeleteSession() {
    try {
      setError(null);
      console.log('Deleting session:', params.id);
      const response = await api.delete(`/api/sessions/${params.id}`);
      console.log('Delete response:', response);
      setDeleteModal({ show: false, sessionTitle: '' });
      router.push('/mentor/sessions');
      router.refresh();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Error al eliminar sesión');
      setDeleteModal({ show: false, sessionTitle: '' });
    }
  }

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="!text-[#6B7280] dark:!text-[#9CA3AF] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] flex items-center mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
          {session.article 
            ? `Semana ${session.article.week_number} - ${session.article.title}`
            : 'Sesión General'}
        </h1>
        <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          <ClockIcon className="w-5 h-5" />
          <p>
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

      <div>
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-emerald-400 font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-[#DC2626] dark:border-red-800 rounded-lg p-4">
            <p className="text-[#DC2626] dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Duración</div>
              <div className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{session.duration_minutes} minutos</div>
            </div>
            <div>
              <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Tipo</div>
              <div className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] capitalize">{session.session_type}</div>
            </div>
            <div>
              <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Estado</div>
              <div className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] capitalize">{session.status}</div>
            </div>
            <div>
              <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Participantes</div>
              <div className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{session.participants.length}</div>
            </div>
          </div>

          {session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 !text-[#2F6F6D] hover:!text-[#1F3A5F] font-medium transition-colors"
            >
              <ArrowRightIcon className="w-5 h-5" />
              Ir a la reunión
            </a>
          )}

          {session.notes && (
            <div className="mt-4 p-4 bg-[#FAFAF8] dark:bg-[#0F1419] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937]">
              <div className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Notas:</div>
              <p className="text-[#4B5563] dark:text-[#D1D5DB]">{session.notes}</p>
            </div>
          )}

          {/* Session Status Actions */}
          <div className="mt-6 flex gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
            {session.status === 'scheduled' && (
              <button
                onClick={() => updateSessionStatus('in_progress')}
                className="px-4 py-2 !bg-[#2F6F6D] hover:!bg-[#1F3A5F] !text-white rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
            {session.status === 'in_progress' && (
              <button
                onClick={() => updateSessionStatus('completed')}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] dark:bg-emerald-600 dark:hover:bg-emerald-700 !text-white rounded-lg font-medium transition-colors"
              >
                Marcar como Completada
              </button>
            )}
            {session.status !== 'cancelled' && (
              <button
                onClick={() => updateSessionStatus('cancelled')}
                className="px-4 py-2 bg-[#DC2626] hover:bg-[#991B1B] !text-white rounded-lg font-medium transition-colors"
              >
                Cancelar Sesión
              </button>
            )}
            <button
              onClick={() => setDeleteModal({ 
                show: true, 
                sessionTitle: session.article 
                  ? `Semana ${session.article.week_number} - ${session.article.title}`
                  : 'Sesión General'
              })}
              className="ml-auto px-4 py-2 border border-[#DC2626] !text-[#DC2626] hover:bg-[#DC2626] hover:!text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </button>
          </div>
        </div>

        {/* Attendance Tracking */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-[#1F3A5F] dark:text-[#5B8FB9]" />
              <h2 className="text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">Control de Asistencia</h2>
            </div>
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 !bg-[#2F6F6D] hover:!bg-[#1F3A5F] !text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>

          {session.participants.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-3" />
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">Aún no hay estudiantes registrados en esta sesión</p>
            </div>
          ) : (
            <div className="space-y-3">
              {session.participants.map((participant) => (
                <div key={participant.id} className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4 hover:border-[#2F6F6D] dark:hover:border-[#4A9B98] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                        {participant.student.full_name}
                      </div>
                      <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
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
                      className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
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
                    className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-[#DC2626]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] text-center mb-2">
              ¿Eliminar sesión?
            </h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] text-center mb-6">
              ¿Estás seguro que deseas eliminar la sesión <span className="font-semibold">{deleteModal.sessionTitle}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, sessionTitle: '' })}
                className="flex-1 px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] !text-[#6B7280] dark:!text-[#9CA3AF] hover:bg-[#FAFAF8] dark:hover:bg-[#0F1419] rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSession}
                className="flex-1 px-4 py-2 bg-[#DC2626] hover:bg-[#991B1B] !text-white rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}