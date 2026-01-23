'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Problem {
  id: string;
  title: string;
  description: string;
  problem_type: string;
  difficulty_level: number;
}

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content_text: string;
  content_url: string;
  summary: string;
  difficulty_level: number;
  cognitive_axes: string[];
  article_type: string;
  estimated_reading_minutes: number;
  created_at: string;
  problems: Problem[];
}

export default function MentorArticleDetailPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F3F4F6] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div className="flex space-x-3">
          <Link href={`/mentor/articles/${articleId}/edit`}>
            <Button variant="outline">
              Editar
            </Button>
          </Link>
          <Link href={`/mentor/articles/${articleId}/problems/new`}>
            <Button>
              + Agregar Problema
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mb-2">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-xl text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            {article.subtitle}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]">Nivel:</span>
            <p className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
              {article.difficulty_level}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {article.article_type}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Lectura:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {article.estimated_reading_minutes} min
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Creado:</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(article.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-2">Resumen</h3>
          <p className="text-[#4B5563] dark:text-[#D1D5DB]">{article.summary}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-3">Ejes Cognitivos</h3>
          <div className="flex flex-wrap gap-2">
            {article.cognitive_axes?.map((axis, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-sm"
              >
                {axis}
              </span>
            ))}
          </div>
        </div>

        {article.content_text && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-3">Contenido</h3>
            <div className="bg-[#FAFAF8] dark:bg-[#0F1419] rounded-lg p-4 whitespace-pre-wrap text-[#4B5563] dark:text-[#D1D5DB] max-h-96 overflow-y-auto">
              {article.content_text}
            </div>
          </div>
        )}

        {article.content_url && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-2">Enlace Externo</h3>
            <a
              href={article.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center"
            >
              {article.content_url}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Problems Section */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">
            Problemas Asociados
          </h2>
          <Link href={`/mentor/articles/${articleId}/problems/new`}>
            <Button size="sm">
              + Agregar
            </Button>
          </Link>
        </div>

        {article.problems && article.problems.length > 0 ? (
          <div className="space-y-4">
            {article.problems.map((problem) => (
              <div
                key={problem.id}
                className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4"
              >
                <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  {problem.title}
                </h3>
                <p className="text-[#4B5563] dark:text-[#D1D5DB] text-sm mb-3">
                  {problem.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>Tipo: {problem.problem_type}</span>
                  <span>Nivel: {problem.difficulty_level}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B7280] dark:text-[#9CA3AF] italic text-center py-8">
            No hay problemas asociados a este artículo.
            <br />
            <Link href={`/mentor/articles/${articleId}/problems/new`}>
              <span className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                Agregar el primero
              </span>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}