'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Calendar, Target, FileText } from 'lucide-react';

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
          <p className="mt-4 text-[#6B7280] dark:text-[#9CA3AF]">Cargando artículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2">Error al cargar artículos</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchArticles}
          className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded hover:bg-red-700 dark:hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">
            Artículos Científicos
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Explora artículos y desarrolla tu pensamiento científico
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-4 sm:p-6 space-y-4">
          {/* Current Week Toggle */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCurrentWeek}
                onChange={(e) => setShowCurrentWeek(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-[#E5E7EB] dark:border-[#1F2937] rounded"
              />
              <span className="ml-3 text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#D1D5DB]">
                📅 Mostrar solo artículo de la semana actual
              </span>
            </label>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-[#4B5563] dark:text-[#D1D5DB]">
              Filtrar por dificultad:
            </span>
            <div className="flex flex-wrap gap-2">
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
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg p-8 sm:p-12 text-center">
            <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            <h3 className="text-lg sm:text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6] mb-2">
              No hay artículos disponibles
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              {showCurrentWeek 
                ? 'No hay artículo para la semana actual aún'
                : 'Pronto habrá nuevos artículos para explorar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
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
          : 'bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#E5E7EB] dark:hover:bg-[#374151]'
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
      <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow hover:shadow-lg transition p-6 h-full flex flex-col">
        {/* Week Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded text-xs font-medium">
            Semana {article.week_number}
          </span>
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {article.estimated_reading_minutes} min
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F3F4F6] mb-2 line-clamp-2">
          {article.title}
        </h3>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-3 line-clamp-2">
            {article.subtitle}
          </p>
        )}

        {/* Summary */}
        <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mb-4 line-clamp-3 flex-grow">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF] pt-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            {difficultyLabels[article.difficulty_level]}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {typeLabels[article.article_type] || article.article_type}
          </span>
        </div>

        {/* Cognitive Axes Count */}
        <div className="mt-3">
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {article.cognitive_axes?.length || 0} ejes cognitivos
          </span>
        </div>
      </div>
    </Link>
  );
}