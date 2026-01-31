"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from '@/lib/api';

interface TopicProposal {
  id: string;
  topic: string;
  description: string;
  likes: number;
  created_at: string;
}

export default function MentorProposalsPage() {
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    setLoading(true);
    try {
      const data = await api.get('/api/topic-proposals');
      setProposals(data);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    setActionError("");
    try {
      await api.delete(`/api/topic-proposals/${id}`);
      fetchProposals();
    } catch (err: any) {
      setActionError(err.message || 'Error al eliminar propuesta');
    }
    setActionLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
          Propuestas de Temas de Refuerzo
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
          Revisa y prioriza los temas sugeridos por los estudiantes para próximas sesiones de refuerzo.
        </p>
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
          {actionError && (
            <div className="mb-4 text-sm text-[#DC2626] dark:text-red-400">{actionError}</div>
          )}
          {loading ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">Cargando...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">No hay propuestas aún.</div>
          ) : (
            <ul className="space-y-4">
              {proposals.map((p) => (
                <li key={p.id} className="border-b border-[#E5E7EB] dark:border-[#1F2937] pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{p.topic}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#1F2937] text-[#2F6F6D] dark:text-[#4A9B98]">👍 {p.likes}</span>
                  </div>
                  <div className="text-[#4B5563] dark:text-[#D1D5DB] text-sm mt-1">{p.description}</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Propuesto el {new Date(p.created_at).toLocaleDateString()}</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={actionLoading === p.id}
                      className="px-4 py-1 bg-[#DC2626] text-white rounded-lg font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-60"
                    >
                      {actionLoading === p.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
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
