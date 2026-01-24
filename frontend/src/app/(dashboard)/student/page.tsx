'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  difficulty_level: number;
  cognitive_axes: string[];
  article_type: string;
  estimated_reading_minutes: number;
  week_number: number;
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  async function fetchRecentArticles() {
    try {
      const response = await api.get('/api/articles');
      // Get only the 3 most recent articles
      const recentArticles = (response.data || []).slice(0, 3);
      setArticles(recentArticles);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {profile?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-indigo-100">
          Continúa desarrollando tu pensamiento científico y matemático
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Artículos Disponibles</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mt-1">{articles.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Sesiones esta Semana</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mt-1">2</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Interacciones IA</p>
              <p className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6] mt-1">12</p>
            </div>
            <div className="text-4xl">🤖</div>
          </div>
        </div>
      </div>

      {/* Active Work Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow">
          <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1F2937]">
            <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
              Artículos Recientes
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando artículos...</p>
            ) : articles.length === 0 ? (
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">No hay artículos disponibles</p>
            ) : (
              articles.map((article) => (
                <Link key={article.id} href={`/student/articles/${article.id}`}>
                  <ArticleCard
                    title={article.title}
                    subtitle={article.subtitle}
                    difficultyLevel={article.difficulty_level}
                  />
                </Link>
              ))
            )}
          </div>
          <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
            <Link
              href="/student/articles"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
            >
              Ver todos los artículos →
            </Link>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow">
          <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1F2937]">
            <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
              Próximas Sesiones
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <SessionCard
              title="Sesión Guiada: Análisis de Artículos"
              date="Lunes, 20 Ene - 4:00 PM"
              type="Virtual"
            />
            <SessionCard
              title="Discusión Colectiva"
              date="Miércoles, 22 Ene - 5:30 PM"
              type="Virtual"
            />
          </div>
          <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
            <Link
              href="/student/sessions"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
            >
              Ver todas las sesiones →
            </Link>
          </div>
        </div>
      </div>

      {/* Cognitive Profile Preview */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1F2937]">
          <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
            Tu Perfil Cognitivo
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Así está evolucionando tu proceso de pensamiento
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <DimensionBar label="Representación y Modelación" level={3} />
            <DimensionBar label="Abstracción y Supuestos" level={2} />
            <DimensionBar label="Estrategia y Planificación" level={3} />
            <DimensionBar label="Argumentación" level={2} />
            <DimensionBar label="Metacognición" level={3} />
            <DimensionBar label="Transferencia" level={2} />
          </div>
        </div>
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <Link
            href="/student/profile"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
          >
            Ver perfil completo →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/student/articles"
          className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-6 hover:border-indigo-400 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📖</div>
            <div>
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                Explorar Artículos
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Descubre nuevos problemas y desafíos
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/student/bitacora"
          className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:border-purple-400 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">✍️</div>
            <div>
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                Continuar en Bitácora
              </h3>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Retoma tu trabajo en progreso
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Helper Components
function ArticleCard({ 
  title, 
  subtitle, 
  difficultyLevel 
}: { 
  title: string; 
  subtitle: string; 
  difficultyLevel: number;
}) {
  const difficultyLabels = ['Fácil', 'Medio', 'Difícil'];
  const difficultyColors = [
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  ];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-[#1F2937] dark:text-[#F3F4F6] text-sm mb-1">
            {title}
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {subtitle}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap ${difficultyColors[difficultyLevel - 1]}`}>
          {difficultyLabels[difficultyLevel - 1]}
        </span>
      </div>
    </div>
  );
}

function SessionCard({ title, date, type }: { title: string; date: string; type: string }) {
  return (
    <div className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-[#1F2937] dark:text-[#F3F4F6] text-sm mb-1">
            {title}
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{date}</p>
        </div>
        <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded">
          {type}
        </span>
      </div>
    </div>
  );
}

function DimensionBar({ label, level }: { label: string; level: number }) {
  const levels = ['Inicial', 'En Desarrollo', 'Competente', 'Avanzado'];
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#4B5563] dark:text-[#D1D5DB]">
          {label}
        </span>
        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          {levels[level - 1]}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i <= level ? colors[level - 1] : 'bg-[#E5E7EB] dark:bg-[#374151]'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}