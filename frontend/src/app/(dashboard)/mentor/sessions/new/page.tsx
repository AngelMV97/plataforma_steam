'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Article {
  id: string;
  title: string;
  week_number: number;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    article_id: '',
    session_date: '',
    session_time: '',
    duration_minutes: 90,
    session_type: 'core',
    meeting_link: '',
    notes: ''
  });

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const res = await api.get('/api/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Load articles error:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const sessionDateTime = `${formData.session_date}T${formData.session_time}:00`;
      
      await api.post('/api/sessions', {
        article_id: formData.article_id || null,
        session_date: sessionDateTime,
        duration_minutes: formData.duration_minutes,
        session_type: formData.session_type,
        meeting_link: formData.meeting_link,
        notes: formData.notes
      });

      setSuccessMessage('Sesión creada exitosamente');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/mentor/sessions');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#FAFAF8] dark:bg-[#0F1419]">
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
        <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">Crear Sesión</h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          Programa una nueva sesión grupal
        </p>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-8 space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-[#DC2626] dark:border-red-800 rounded-lg p-4">
              <p className="text-[#DC2626] dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Article Selection */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Artículo (Opcional)
            </label>
            <select
              value={formData.article_id}
              onChange={(e) => setFormData({ ...formData, article_id: e.target.value })}
              className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value="">Sin artículo específico</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  Semana {article.week_number} - {article.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#6B7280] mt-1">
              Vincula esta sesión a un artículo específico o déjalo vacío para sesiones generales
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
                Fecha <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
                Hora <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.session_time}
                onChange={(e) => setFormData({ ...formData, session_time: e.target.value })}
                className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Duración (minutos)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Tipo de Sesión *
            </label>
            <select
              value={formData.session_type}
              onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
              className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value="core">Sesión Núcleo - Guiada + Discusión + Metacognitiva</option>
              <option value="reinforcement">Sesión de Refuerzo - Apoyo adicional</option>
              <option value="test_prep">Sesión de Preparación - ICFES y exámenes de admisión</option>
            </select>
            <p className="text-xs text-[#6B7280] mt-1">
              La sesión núcleo incluye lectura guiada, discusión socrática y reflexión metacognitiva
            </p>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Enlace de Reunión
            </label>
            <input
              type="url"
              placeholder="https://zoom.us/j/..."
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] mb-2">
              Notas
            </label>
            <textarea
              rows={4}
              placeholder="Agenda, objetivos, preparación requerida..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#E5E7EB] dark:border-[#1F2937]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#E5E7EB] dark:border-[#1F2937] !text-[#6B7280] dark:!text-[#9CA3AF] font-medium rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#0F1419] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 !bg-[#2F6F6D] !text-white font-medium rounded-lg hover:!bg-[#1F3A5F] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}