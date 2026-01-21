'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  difficulty_level: number;
  cognitive_axes: string[];
  article_type: string;
  estimated_reading_minutes: number;
  week_number: number;
  created_at: string;
}

export default function StudentArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showCurrentWeek, setShowCurrentWeek] = useState(false);

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

  const filteredArticles = articles.filter(article => {
    // Difficulty filter
    if (difficultyFilter !== 'all' && article.difficulty_level !== parseInt(difficultyFilter)) {
      return false;
    }
    
    // Current week filter (simplified - you can add actual week calculation)
    if (showCurrentWeek) {
      // For now, show articles from the latest week_number
      const latestWeek = Math.max(...articles.map(a => a.week_number));
      return article.week_number === latestWeek;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando artículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error al cargar artículos</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchArticles}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Artículos Científicos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explora artículos y desarrolla tu pensamiento científico
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        {/* Current Week Toggle */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCurrentWeek}
              onChange={(e) => setShowCurrentWeek(e.target.checked)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              📅 Mostrar solo artículo de la semana actual
            </span>
          </label>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por dificultad:
          </span>
          <div className="flex space-x-2">
            <FilterButton
              active={difficultyFilter === 'all'}
              onClick={() => setDifficultyFilter('all')}
              label="Todos"
            />
            <FilterButton
              active={difficultyFilter === '1'}
              onClick={() => setDifficultyFilter('1')}
              label="Básico"
            />
            <FilterButton
              active={difficultyFilter === '2'}
              onClick={() => setDifficultyFilter('2')}
              label="Intermedio"
            />
            <FilterButton
              active={difficultyFilter === '3'}
              onClick={() => setDifficultyFilter('3')}
              label="Avanzado"
            />
            <FilterButton
              active={difficultyFilter === '4'}
              onClick={() => setDifficultyFilter('4')}
              label="Experto"
            />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay artículos disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {showCurrentWeek 
              ? 'No hay artículo para la semana actual aún'
              : 'Pronto habrá nuevos artículos para explorar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const difficultyLabels = ['', 'Básico', 'Intermedio', 'Avanzado', 'Experto'];
  const typeLabels: Record<string, string> = {
    divulgacion: 'Divulgación',
    tecnico: 'Técnico',
    caso_real: 'Caso Real',
  };

  return (
    <Link href={`/student/articles/${article.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 h-full flex flex-col">
        {/* Week Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded text-xs font-medium">
            Semana {article.week_number}
          </span>
          <span className="text-xs text-gray-500">
            {article.estimated_reading_minutes} min
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {article.subtitle}
          </p>
        )}

        {/* Summary */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span>🎯 {difficultyLabels[article.difficulty_level]}</span>
          <span>📑 {typeLabels[article.article_type] || article.article_type}</span>
        </div>

        {/* Cognitive Axes Count */}
        <div className="mt-3">
          <span className="text-xs text-gray-500">
            {article.cognitive_axes?.length || 0} ejes cognitivos
          </span>
        </div>
      </div>
    </Link>
  );
}