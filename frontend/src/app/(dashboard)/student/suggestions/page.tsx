"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { TargetIcon, CheckCircleIcon, ArrowRightIcon } from '@/components/icons/MinimalIcons';

interface TopicProposal {
  id: string;
  topic: string;
  description: string;
  likes: number;
  created_at: string;
  student_id: string;
  student_name: string;
  liked_by: string[];
}

export default function TopicSuggestionsPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [loading, setLoading] = useState(true);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    
    try {
      if (!topic.trim() || !description.trim()) {
        setError('Por favor completa todos los campos');
        return;
      }

      const newProposal: TopicProposal = {
        id: `proposal_${Date.now()}`,
        topic: topic.trim(),
        description: description.trim(),
        likes: 0,
        created_at: new Date().toISOString(),
        student_id: user?.id || 'anonymous',
        student_name: user?.user_metadata?.full_name || 'Estudiante',
        liked_by: []
      };

      const stored = localStorage.getItem('topic_proposals');
      const existing: TopicProposal[] = stored ? JSON.parse(stored) : [];
      existing.unshift(newProposal);
      localStorage.setItem('topic_proposals', JSON.stringify(existing));

      setSuccess(true);
      setTopic("");
      setDescription("");
      fetchProposals();
    } catch (err: any) {
      setError(err.message || 'Error al enviar propuesta');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLike(proposalId: string) {
    try {
      const stored = localStorage.getItem('topic_proposals');
      if (!stored) return;
      
      const data: TopicProposal[] = JSON.parse(stored);
      const proposal = data.find(p => p.id === proposalId);
      
      if (proposal) {
        const userId = user?.id || 'anonymous';
        const hasLiked = proposal.liked_by.includes(userId);
        
        if (hasLiked) {
          proposal.liked_by = proposal.liked_by.filter(id => id !== userId);
          proposal.likes = Math.max(0, proposal.likes - 1);
        } else {
          proposal.liked_by.push(userId);
          proposal.likes += 1;
        }
        
        localStorage.setItem('topic_proposals', JSON.stringify(data));
        fetchProposals();
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  }

  const userHasLiked = (proposal: TopicProposal) => {
    return proposal.liked_by.includes(user?.id || 'anonymous');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F3A5F] dark:hover:text-[#5B8FB9] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </Link>
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-lg bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 flex items-center justify-center flex-shrink-0">
              <TargetIcon className="w-6 h-6 text-[#2F6F6D] dark:text-[#4A9B98]" />
            </div>
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
                Sugerencias de Temas
              </h1>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Propón temas para sesiones de refuerzo y vota por las sugerencias de tus compañeros
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Info Notice */}
        <div className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 border border-[#BFDBFE] dark:border-[#1E40AF] rounded-sm p-4 mb-8">
          <p className="text-sm text-[#1E40AF] dark:text-[#93C5FD] leading-relaxed">
            <strong className="font-semibold">Nota:</strong> Las propuestas se guardan localmente hasta que la integración con la base de datos esté lista. Tu mentor podrá ver las sugerencias más votadas.
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm shadow-sm p-6 mb-12">
          <h2 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-6">
            Nueva Propuesta
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                Tema
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm bg-white dark:bg-[#0F1419] text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all"
                placeholder="Ej: Integrales definidas, Análisis de gráficas, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                Justificación
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm bg-white dark:bg-[#0F1419] text-[#1F2937] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus:border-[#2F6F6D] focus:ring-2 focus:ring-[#2F6F6D]/20 focus:outline-none transition-all"
                rows={4}
                placeholder="Explica por qué este tema sería útil para ti y tus compañeros..."
                required
              />
            </div>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
                <p className="text-sm text-[#DC2626] dark:text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm">
                <p className="text-sm text-[#059669] dark:text-green-400">✓ Propuesta enviada exitosamente</p>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-[#1F3A5F] dark:bg-[#5B8FB9] text-white font-medium rounded-sm hover:bg-[#2F6F6D] dark:hover:bg-[#4A9B98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? "Enviando..." : "Enviar Propuesta"}
            </button>
          </form>
        </div>

        {/* Proposals List */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-6">
            Propuestas Activas
          </h2>
          {loading ? (
            <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-12">Cargando propuestas...</div>
          ) : proposals.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm p-12 text-center">
              <TargetIcon className="w-12 h-12 text-[#D1D5DB] dark:text-[#374151] mx-auto mb-4" />
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                No hay propuestas aún. ¡Sé el primero en sugerir un tema!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#1a1f26] border border-[#E5E7EB] dark:border-[#1F2937] rounded-sm p-6 hover:border-[#2F6F6D]/30 dark:hover:border-[#4A9B98]/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
                        {p.topic}
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                        Propuesto por <span className="font-medium">{p.student_name?.trim() ? p.student_name : 'Estudiante'}</span>
                      </p>
                      <p className="text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLike(p.id)}
                      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-sm font-medium transition-all min-w-[70px] ${
                        userHasLiked(p)
                          ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white shadow-md' 
                          : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#E5E7EB] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#1F2937]'
                      }`}
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-lg font-semibold">{p.likes}</span>
                    </button>
                  </div>
                  <div className="text-xs text-[#9CA3AF] dark:text-[#6B7280] pt-3 border-t border-[#F3F4F6] dark:border-[#1F2937]">
                    {new Date(p.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
