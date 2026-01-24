'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  difficulty_level: number;
  cognitive_axes: string[];
  article_type: string;
  estimated_reading_minutes: number;
  pdf_url: string;
  pdf_processed: boolean;
  week_number: number;
  created_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  async function fetchArticle() {
    try {
      setLoading(true);
      const response = await api.get(`/api/articles/${articleId}`);
      setArticle(response.data);
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startBitacora() {
    try {
      // Create student attempt for this article
      const response = await api.post('/api/attempts', { article_id: articleId });
      const attemptId = response.data.id;
      
      // Navigate to bitácora
      router.push(`/student/bitacora/${attemptId}`);
    } catch (err: any) {
      console.error('Error starting bitácora:', err);
      alert('Error al iniciar bitácora: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-[#6B7280] dark:text-[#9CA3AF]">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2">Error al cargar artículo</h3>
        <p className="text-red-600 dark:text-red-400">{error || 'Artículo no encontrado'}</p>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a artículos
      </button>

      {/* Article Header */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">
                {article.title}
              </h1>
              <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-medium">
                Semana {article.week_number}
              </span>
            </div>
            {article.subtitle && (
              <p className="text-xl text-[#6B7280] dark:text-[#9CA3AF]">
                {article.subtitle}
              </p>
            )}
          </div>
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {article.estimated_reading_minutes} min de lectura
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-6 text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6 py-4 border-t border-b border-[#E5E7EB] dark:border-[#1F2937]">
          <span className="flex items-center">
            <strong className="text-[#1F2937] dark:text-[#F3F4F6] mr-2">Nivel:</strong>
            {article.difficulty_level}
          </span>
          <span className="flex items-center">
            <strong className="text-[#1F2937] dark:text-[#F3F4F6] mr-2">Tipo:</strong>
            {article.article_type}
          </span>
          {!article.pdf_processed && (
            <span className="flex items-center text-amber-600">
              <strong className="mr-2">Estado:</strong>
              Procesando...
            </span>
          )}
        </div>

        {/* CTA Button */}
        <div className="border-t border-[#E5E7EB] dark:border-[#1F2937] pt-6">
          <Button
            onClick={startBitacora}
            size="lg"
            className="w-full md:w-auto"
          >
            Abrir Bitácora y Comenzar →
          </Button>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-3">
            Trabaja en tu bitácora interactuando con el tutor AI que te guiará en el análisis del artículo
          </p>
        </div>
      </div>

      {/* PDF Viewer */}
      {article.pdf_url && (
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mb-4">
            Artículo Completo
          </h2>
          <div className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg overflow-hidden" style={{ height: '800px' }}>
            <iframe
              src={article.pdf_url}
              className="w-full h-full"
              title={article.title}
            />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={article.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
            >
              Abrir PDF en nueva pestaña
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}