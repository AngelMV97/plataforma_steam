"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface SessionRequest {
  id: string;
  topic: string;
  preferred_dates: string;
  notes: string;
  status: string;
  created_at: string;
  student: {
    full_name: string;
    email: string;
  };
}

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      // Fetch all sessions of type 'individual' and status 'pending' or 'scheduled'
      const res = await api.get('/api/sessions?type=individual');
      setRequests(res.data || []);
    } catch {}
    setLoading(false);
  }

  async function handleStatusChange(id: string, status: string) {
    setActionLoading(id + status);
    setActionError("");
    try {
      await api.put(`/api/sessions/${id}`, { status });
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar estado');
    }
    setActionLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
          Solicitudes de Sesiones Individuales
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
          Gestiona las solicitudes de sesiones individuales enviadas por los estudiantes.
        </p>
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
          {actionError && (
            <div className="mb-4 text-sm text-[#DC2626] dark:text-red-400">{actionError}</div>
          )}
          {loading ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">Cargando...</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">No hay solicitudes pendientes.</div>
          ) : (
            <ul className="space-y-4">
              {requests.map((r) => (
                <li key={r.id} className="border-b border-[#E5E7EB] dark:border-[#1F2937] pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{r.topic}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{r.status}</span>
                  </div>
                  <div className="text-[#4B5563] dark:text-[#D1D5DB] text-sm mt-1">{r.notes}</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Solicitado el {new Date(r.created_at).toLocaleDateString()} por {r.student.full_name} ({r.student.email})</div>
                  <div className="flex gap-2 mt-3">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(r.id, 'scheduled')}
                          disabled={actionLoading === r.id + 'scheduled'}
                          className="px-4 py-1 bg-[#2F6F6D] text-white rounded-lg font-medium hover:bg-[#1F3A5F] transition-colors disabled:opacity-60"
                        >
                          {actionLoading === r.id + 'scheduled' ? 'Agendando...' : 'Agendar'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(r.id, 'rejected')}
                          disabled={actionLoading === r.id + 'rejected'}
                          className="px-4 py-1 bg-[#DC2626] text-white rounded-lg font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-60"
                        >
                          {actionLoading === r.id + 'rejected' ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </>
                    )}
                    {r.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'completed')}
                        disabled={actionLoading === r.id + 'completed'}
                        className="px-4 py-1 bg-[#4A9B98] text-white rounded-lg font-medium hover:bg-[#2F6F6D] transition-colors disabled:opacity-60"
                      >
                        {actionLoading === r.id + 'completed' ? 'Marcando...' : 'Marcar como Completada'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Link href="/mentor" className="underline">Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
