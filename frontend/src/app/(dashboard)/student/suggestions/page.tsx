"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from '@/lib/api';

interface TopicProposal {
  id: string;
  topic: string;
  description: string;
  likes: number;
  created_at: string;
  liked_by_user?: boolean;
}

export default function TopicSuggestionsPage() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    setLoading(true);
    try {
      const data = await api.get('/api/topic-proposals');
      setProposals(data);
    } catch (err: any) {
      setError('Error al cargar propuestas');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await api.post('/api/topic-proposals', { topic, description });
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

  async function handleLike(id: string) {
    setLikeLoading(id);
    try {
      await api.post(`/api/topic-proposals/${id}/like`, {});
      fetchProposals();
    } catch {}
    setLikeLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
          Proponer Tema de Refuerzo
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
          Sugiere un tema para una sesión de refuerzo. Otros estudiantes podrán votar por los temas que les interesen.
        </p>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 space-y-6 border border-[#E5E7EB] dark:border-[#1F2937]">
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Tema</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              placeholder="Ejemplo: Integrales definidas"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              rows={4}
              placeholder="Explica por qué este tema es importante o qué dificultades tienes."
              required
            />
          </div>
          {error && <p className="text-sm text-[#DC2626] dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-[#2F6F6D] dark:text-[#4A9B98]">¡Propuesta enviada!</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-[#2F6F6D] text-white font-semibold rounded-lg hover:bg-[#1F3A5F] transition-colors disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar Propuesta"}
          </button>
        </form>
        <div className="mt-8 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Link href="/student" className="underline">Volver al Dashboard</Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-10">
        <h2 className="text-xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-4 mt-8">Temas Propuestos</h2>
        {loading ? (
          <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">Cargando...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">No hay propuestas aún.</div>
        ) : (
          <ul className="space-y-4">
            {proposals.map((p) => (
              <li key={p.id} className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">{p.topic}</span>
                  <button
                    onClick={() => handleLike(p.id)}
                    disabled={likeLoading === p.id || p.liked_by_user}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${p.liked_by_user ? 'bg-[#2F6F6D] text-white' : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#2F6F6D] dark:text-[#4A9B98] hover:bg-[#2F6F6D] hover:text-white dark:hover:bg-[#4A9B98]'} disabled:opacity-60`}
                  >
                    👍 {p.likes}
                  </button>
                </div>
                <div className="text-[#4B5563] dark:text-[#D1D5DB] text-sm">{p.description}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Propuesto el {new Date(p.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
