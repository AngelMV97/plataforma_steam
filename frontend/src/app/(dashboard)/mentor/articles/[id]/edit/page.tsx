'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowRightIcon } from '@/components/icons/MinimalIcons';

interface Article {
  id: string;
  title: string;
  week_number: number | null;
  difficulty_level: number;
  article_type: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    week_number: 1,
    difficulty_level: 2,
    article_type: 'divulgacion',
  });

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  async function loadArticle() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/articles/${articleId}`);
      const article = response.data.data || response.data;
      
      setFormData({
        title: article.title || '',
        week_number: article.week_number || 1,
        difficulty_level: article.difficulty_level || 2,
        article_type: article.article_type || 'divulgacion',
      });
    } catch (err: any) {
      console.error('Error loading article:', err);
      setError(err.message || 'Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'difficulty_level' || name === 'week_number'
          ? parseInt(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setSaving(true);

      await api.put(`/api/articles/${articleId}`, formData);

      setSuccessMessage('Artículo actualizado exitosamente');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/mentor/articles');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating article:', err);
      setError(err.message || 'Error al actualizar el artículo');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto"></div>
          <p className="mt-4 text-[#6B7280] dark:text-[#9CA3AF]">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="!text-[#6B7280] dark:!text-[#9CA3AF] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] flex items-center mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>
        <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
          Editar Artículo
        </h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          Modifica los datos del artículo científico
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-8 space-y-6"
      >
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-[#DC2626] rounded-lg p-4">
            <p className="text-[#DC2626] font-medium mb-2">Error:</p>
            <p className="text-[#DC2626] text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Título del artículo"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
          />
        </div>

        {/* Grid for metadata fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Week Number */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] mb-2">
              Semana *
            </label>
            <input
              type="number"
              name="week_number"
              min="1"
              max="52"
              value={formData.week_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            />
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Número de semana del curso
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] mb-2">
              Nivel de Dificultad *
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value={1}>1 - Básico</option>
              <option value={2}>2 - Intermedio</option>
              <option value={3}>3 - Avanzado</option>
              <option value={4}>4 - Experto</option>
            </select>
            <p className="text-xs text-[#6B7280] mt-1">
              Nivel de complejidad
            </p>
          </div>

          {/* Article Type */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] mb-2">
              Tipo de Artículo *
            </label>
            <select
              name="article_type"
              value={formData.article_type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value="divulgacion">Divulgación</option>
              <option value="tecnico">Técnico</option>
              <option value="caso_real">Caso Real</option>
            </select>
            <p className="text-xs text-[#6B7280] mt-1">
              Categoría del artículo
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="px-6 py-3 border border-[#E5E7EB] dark:border-[#1F2937] !text-[#6B7280] dark:!text-[#9CA3AF] font-medium rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#0F1419] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 !bg-[#2F6F6D] !text-white font-medium rounded-lg hover:!bg-[#1F3A5F] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                Guardar Cambios
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
