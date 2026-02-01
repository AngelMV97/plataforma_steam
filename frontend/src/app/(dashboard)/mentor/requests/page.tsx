'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircleIcon, AlertCircleIcon, ClockIcon, UsersIcon, DocumentIcon, BookOpenIcon } from '@/components/icons/MinimalIcons';

interface SessionRequest {
  id: string;
  topic: string;
  description: string;
  preferred_dates: string[];
  notes: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  student_id: string;
  mentor_id: string | null;
  student: {
    full_name: string;
    email: string;
    grade_level?: string;
  };
}

export default function MentorRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user?.id]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_requests')
        .select(`
          *,
          student:student_id(full_name, email, grade_level)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format student data
      const formatted = (data || []).map((r: any) => ({
        ...r,
        student: Array.isArray(r.student) ? r.student[0] : r.student
      }));
      
      setRequests(formatted);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setActionError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
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

  async function handleStatusChange(requestId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') {
    setActionLoading(requestId + newStatus);
    setActionError('');
    setActionSuccess('');

    try {
      const { error } = await supabase
        .from('session_requests')
        .update({
          status: newStatus,
          mentor_id: newStatus === 'scheduled' ? user?.id : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      setActionSuccess(`Solicitud marcada como ${getStatusLabel(newStatus).toLowerCase()}`);
      await fetchRequests();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar estado');
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircleIcon className="w-4 h-4" />;
      case 'scheduled':
        return <ClockIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Gestión de Solicitudes
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Revisa y gestiona las solicitudes de sesiones individuales de tus estudiantes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pendientes', count: stats.pending, color: 'yellow', icon: AlertCircleIcon },
            { label: 'Agendadas', count: stats.scheduled, color: 'blue', icon: ClockIcon },
            { label: 'Completadas', count: stats.completed, color: 'green', icon: CheckCircleIcon },
            { label: 'Canceladas', count: stats.cancelled, color: 'red', icon: null },
          ].map((stat, i) => (
            <button
              key={i}
              onClick={() => {
                if (stat.label === 'Pendientes') setFilterStatus('pending');
                else if (stat.label === 'Agendadas') setFilterStatus('scheduled');
                else if (stat.label === 'Completadas') setFilterStatus('completed');
                else if (stat.label === 'Canceladas') setFilterStatus('cancelled');
              }}
              className={`group p-4 rounded-lg border-2 transition-all ${
                filterStatus === (stat.label.toLowerCase() === 'pendientes' ? 'pending' : 
                                 stat.label.toLowerCase() === 'agendadas' ? 'scheduled' :
                                 stat.label.toLowerCase() === 'completadas' ? 'completed' : 'cancelled')
                  ? `border-[#2F6F6D] bg-[#2F6F6D]/5 dark:bg-[#2F6F6D]/10`
                  : `border-[#E5E7EB] dark:border-[#1F2937] bg-white dark:bg-[#1a1f26] hover:border-[#2F6F6D]/30`
              }`}
            >
              <div className={`text-2xl font-bold mb-1 ${
                stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {stat.count}
              </div>
              <div className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                {stat.label}
              </div>
            </button>
          ))}
        </div>

        {/* Messages */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm flex gap-2">
            <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm flex gap-2">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#1F2937] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#6B7280] dark:text-[#9CA3AF]">
              Cargando solicitudes...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircleIcon className="w-12 h-12 text-[#D1D5DB] dark:text-[#6B7280] mx-auto mb-4" />
              <div className="text-[#6B7280] dark:text-[#9CA3AF]">
                {filterStatus === 'all' 
                  ? 'No hay solicitudes'
                  : `No hay solicitudes ${getStatusLabel(filterStatus).toLowerCase()}`}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
              {filteredRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="p-4 sm:p-6 hover:bg-[#F9FAFB] dark:hover:bg-[#111618] transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {request.topic}
                        </h3>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {getStatusLabel(request.status)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-3">
                        {request.description}
                      </p>

                      {/* Student Info */}
                      <div className="flex flex-wrap gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                        <div className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          {request.student?.full_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <DocumentIcon className="w-4 h-4" />
                          {request.student?.email}
                        </div>
                        {request.student?.grade_level && (
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            Grado: {request.student.grade_level}
                          </div>
                        )}
                      </div>

                      {/* Preferred Dates */}
                      {request.preferred_dates && request.preferred_dates.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                          <ClockIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Fechas preferidas:</span> {request.preferred_dates.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {request.notes && (
                        <div className="p-3 bg-[#F3F4F6] dark:bg-[#0F1419] rounded text-xs text-[#4B5563] dark:text-[#D1D5DB] border border-[#E5E7EB] dark:border-[#1F2937]">
                          <span className="font-medium block mb-1">Notas del estudiante:</span>
                          {request.notes}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                        <div>
                          Solicitada: {new Date(request.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {request.updated_at && request.updated_at !== request.created_at && (
                          <div>
                            Actualizada: {new Date(request.updated_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSchedule(request)}
                          className="px-4 py-2 bg-[#2F6F6D] text-white rounded-lg font-medium text-sm hover:bg-[#1F3A5F] transition-colors flex items-center gap-2"
                        >
                          <ClockIcon className="w-4 h-4" />
                          Agendar Sesión
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'cancelled')}
                          disabled={actionLoading === request.id + 'cancelled'}
                          className="px-4 py-2 bg-[#DC2626] text-white rounded-lg font-medium text-sm hover:bg-[#991B1B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id + 'cancelled' ? 'Cancelando...' : 'Rechazar'}
                        </button>
                      </>
                    )}

                    {request.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request.id, 'completed')}
                          disabled={actionLoading === request.id + 'completed'}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          {actionLoading === request.id + 'completed' ? 'Marcando...' : 'Marcar Completada'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'cancelled')}
                          disabled={actionLoading === request.id + 'cancelled'}
                          className="px-4 py-2 bg-[#DC2626] text-white rounded-lg font-medium text-sm hover:bg-[#991B1B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {actionLoading === request.id + 'cancelled' ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </>
                    )}

                    {request.status === 'completed' && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Sesión completada
                      </span>
                    )}

                    {request.status === 'cancelled' && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                        ✕ Solicitud rechazada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/mentor" className="text-[#2F6F6D] dark:text-[#4A9B98] hover:underline text-sm font-medium flex items-center gap-1">
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
