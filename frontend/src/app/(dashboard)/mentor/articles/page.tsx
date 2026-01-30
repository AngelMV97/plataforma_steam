'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BookOpenIcon, ArrowRightIcon, TrashIcon } from '@/components/icons/MinimalIcons';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  difficulty_level: number;
  cognitive_axes: string[];
  article_type: string;
  estimated_reading_minutes: number;
  week_number: number | null;
  created_at: string;
}

export default function MentorArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; articleId: string; articleTitle: string } | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const response = await api.get('/api/articles');
      setArticles(response.data || []);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteArticle(articleId: string, articleTitle: string) {
    setDeleteModal({ show: true, articleId, articleTitle });
  }

  async function confirmDelete() {
    if (!deleteModal) return;

    try {
      await api.delete(`/api/articles/${deleteModal.articleId}`);
      setDeleteModal(null);
      // Refresh the articles list
      await fetchArticles();
    } catch (err: any) {
      console.error('Error deleting article:', err);
      setError(err.message || 'Error al eliminar el artículo');
      setDeleteModal(null);
    }
  }

  function getDifficultyLabel(level: number): string {
    const labels = ['', 'Básico', 'Intermedio', 'Avanzado', 'Experto'];
    return labels[level] || 'Desconocido';
  }

  function getArticleTypeLabel(type: string): string {
    const types: Record<string, string> = {
      divulgacion: 'Divulgación',
      tecnico: 'Técnico',
      caso_real: 'Caso Real',
    };
    return types[type] || type;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto"></div>
          <p className="mt-4 text-[#6B7280] dark:text-[#9CA3AF]">Cargando artículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
                Gestión de Artículos
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2">
                Administra el contenido de la academia
              </p>
            </div>
            <Link
              href="/mentor/articles/new"
              className="inline-flex items-center justify-center sm:justify-start px-4 sm:px-6 py-2 sm:py-3 !bg-[#2F6F6D] !text-white font-medium text-sm rounded-lg hover:!bg-[#1F3A5F] transition-colors whitespace-nowrap"
            >
              + Nuevo Artículo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-[#DC2626] dark:border-red-800 rounded-lg p-4">
            <p className="text-xs sm:text-sm text-[#DC2626] dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg border-2 border-[#E5E7EB] dark:border-[#1F2937] p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-[#F3F4F6] dark:bg-[#1F2937] flex items-center justify-center">
                <BookOpenIcon className="w-8 sm:w-12 h-8 sm:h-12 text-[#6B7280] dark:text-[#9CA3AF]" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              No hay artículos creados
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
              Comienza creando tu primer artículo científico
            </p>
            <Link
              href="/mentor/articles/new"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 !bg-[#2F6F6D] !text-white font-medium text-sm rounded-lg hover:!bg-[#1F3A5F] transition-colors"
            >
              Crear Primer Artículo
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
              <thead className="bg-[#F9FAFB] dark:bg-[#0F1419]">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Artículo
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1a1f26] divide-y divide-[#E5E7EB] dark:divide-[#1F2937]">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-[#FAFAF8] dark:hover:bg-[#0F1419] transition-colors">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9]">
                          {article.title}
                        </div>
                        {article.subtitle && (
                          <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                            {article.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">
                      {getArticleTypeLabel(article.article_type)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">
                      {getDifficultyLabel(article.difficulty_level)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">
                      {article.week_number ? `Semana ${article.week_number}` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                    {article.estimated_reading_minutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/mentor/articles/${article.id}`}
                      className="!text-[#2F6F6D] hover:!text-[#1F3A5F] transition-colors inline-flex items-center gap-1"
                    >
                      Ver
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/mentor/articles/${article.id}/edit`}
                      className="!text-[#2F6F6D] hover:!text-[#1F3A5F] transition-colors inline-flex items-center gap-1"
                    >
                      Editar
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteArticle(article.id, article.title)}
                      className="!text-[#DC2626] hover:!text-[#991B1B] transition-colors inline-flex items-center gap-1"
                      title="Eliminar artículo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Delete Confirmation Modal */}
      {deleteModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg max-w-md w-full p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <TrashIcon className="w-6 h-6 text-[#DC2626] dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1F3A5F] dark:text-[#5B8FB9]">
                  Eliminar Artículo
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                  ¿Estás seguro de que deseas eliminar <span className="font-medium text-[#1F3A5F] dark:text-[#5B8FB9]">"{deleteModal.articleTitle}"</span>?
                </p>
                <p className="text-sm text-[#DC2626] dark:text-red-400 mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] !text-[#6B7280] dark:!text-[#9CA3AF] font-medium rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#0F1419] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 !bg-[#DC2626] !text-white font-medium rounded-lg hover:!bg-[#991B1B] transition-colors inline-flex items-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}