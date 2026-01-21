'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function StudentDashboard() {
  const { profile } = useAuth();

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Artículos en Progreso</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">3</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones esta Semana</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">2</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interacciones IA</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">12</p>
            </div>
            <div className="text-4xl">🤖</div>
          </div>
        </div>
      </div>

      {/* Active Work Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Artículos Recientes
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <ArticleCard
              title="El Problema de Monty Hall: Probabilidad e Intuición"
              status="En progreso"
              progress={60}
            />
            <ArticleCard
              title="Modelación de Sistemas Dinámicos"
              status="Completado"
              progress={100}
            />
            <ArticleCard
              title="Análisis de Datos: COVID-19"
              status="Pendiente"
              progress={0}
            />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/student/articles"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Ver todos los artículos →
            </Link>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/student/sessions"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Ver todas las sesiones →
            </Link>
          </div>
        </div>
      </div>

      {/* Cognitive Profile Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tu Perfil Cognitivo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/student/profile"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
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
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Explorar Artículos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Continuar en Bitácora
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
function ArticleCard({ title, status, progress }: { title: string; status: string; progress: number }) {
  const statusColors = {
    'En progreso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Completado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Pendiente': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
          {title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function SessionCard({ title, date, type }: { title: string; date: string; type: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{date}</p>
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
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {levels[level - 1]}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i <= level ? colors[level - 1] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}