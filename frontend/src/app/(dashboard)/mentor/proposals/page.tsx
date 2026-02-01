"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircleIcon, TrashIcon } from "@/components/icons/MinimalIcons";

interface TopicProposal {
  id: string;
  topic: string;
  description: string;
  likes: number;
  created_at: string;
  student_id: string;
  student_name: string;
}

export default function MentorProposalsPage() {
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  function fetchProposals() {
    setLoading(true);
    try {
      const stored = localStorage.getItem('topic_proposals');
      if (stored) {
        const data: TopicProposal[] = JSON.parse(stored);
        data.sort((a, b) => b.likes - a.likes);
        setProposals(data);
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string) {
    setActionLoading(id);
    setActionError("");
    try {
      const stored = localStorage.getItem('topic_proposals');
      if (!stored) return;
      
      const data: TopicProposal[] = JSON.parse(stored);
      const filtered = data.filter(p => p.id !== id);
      localStorage.setItem('topic_proposals', JSON.stringify(filtered));
      
      fetchProposals();
    } catch (err: any) {
      setActionError(err.message || 'Error al eliminar propuesta');
    } finally {
      setActionLoading(null);
    }   
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Propuestas de Temas
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">
            Revisa y prioriza los temas sugeridos por los estudiantes para próximas sesiones de refuerzo.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow-sm border border-[#E5E7EB] dark:border-[#1F2937]">
          {actionError && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded text-sm flex gap-2">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-12">
              Cargando propuestas...
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-12">
              <AlertCircleIcon className="w-12 h-12 text-[#D1D5DB] dark:text-[#6B7280] mx-auto mb-3" />
              No hay propuestas aún.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="p-6 hover:bg-[#F9FAFB] dark:hover:bg-[#111618] transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-lg text-[#1F3A5F] dark:text-[#5B8FB9]">
                      {proposal.topic}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#F3F4F6] dark:bg-[#1F2937] text-[#2F6F6D] dark:text-[#4A9B98] whitespace-nowrap">
                      {proposal.likes}
                    </span>
                  </div>

                  <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-3">
                    {proposal.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                    <div>Propuesto por: <span className="font-medium">{proposal.student_name}</span></div>
                    <div>Fecha: {new Date(proposal.created_at).toLocaleDateString('es-ES')}</div>
                  </div>

                  <button
                    onClick={() => handleDelete(proposal.id)}
                    disabled={actionLoading === proposal.id}
                    className="px-4 py-2 bg-[#DC2626] text-white rounded-lg font-medium text-sm hover:bg-[#991B1B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {actionLoading === proposal.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
