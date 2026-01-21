'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import RadarChart from '@/components/profile/RadarChart';

interface ProfileData {
  representacion: { level: number; observations: any[] };
  abstraccion: { level: number; observations: any[] };
  estrategia: { level: number; observations: any[] };
  argumentacion: { level: number; observations: any[] };
  metacognicion: { level: number; observations: any[] };
  transferencia: { level: number; observations: any[] };
}

interface HistoryPoint {
  week_number: number;
  article_title: string;
  evaluated_at: string;
  dimensions: Record<string, { level: number; level_name: string; feedback: string }>;
}

const DIMENSION_LABELS: Record<string, string> = {
  representacion: 'Representación y modelación',
  abstraccion: 'Abstracción y manejo de supuestos',
  estrategia: 'Estrategia y planificación',
  argumentacion: 'Argumentación y justificación',
  metacognicion: 'Metacognición y revisión',
  transferencia: 'Transferencia y conexión'
};

const LEVEL_LABELS = ['Sin evaluar', 'Inicial', 'En Desarrollo', 'Competente', 'Avanzado'];

export default function StudentProfilePage() {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      setUserId(user.id);

      // Load cognitive profile
      const profileRes = await api.get(`/api/cognitive-profiles/${user.id}`);
      setProfileData(profileRes.data.profile_data);

      // Load history
      const historyRes = await api.get(`/api/cognitive-profiles/${user.id}/history`);
      setHistory(historyRes.data);

    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Error</p>
          <p>{error || 'No se pudo cargar el perfil'}</p>
        </div>
      </div>
    );
  }

  const chartData = {
    representacion: profileData.representacion.level,
    abstraccion: profileData.abstraccion.level,
    estrategia: profileData.estrategia.level,
    argumentacion: profileData.argumentacion.level,
    metacognicion: profileData.metacognicion.level,
    transferencia: profileData.transferencia.level
  };

  const hasEvaluations = Object.values(chartData).some(v => v > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil Cognitivo</h1>
          <p className="text-gray-600 mt-2">
            Visualiza tu progreso en las 6 dimensiones cognitivas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasEvaluations ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium">
              Aún no tienes evaluaciones. Completa y envía tus bitácoras para que tu mentor las evalúe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 text-center">Perfil Actual</h2>
              <RadarChart data={chartData} maxValue={4} size={400} />
            </div>

            {/* Dimension Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Detalles por Dimensión</h2>
              <div className="space-y-4">
                {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                  const level = profileData[key as keyof ProfileData].level;
                  const percentage = (level / 4) * 100;
                  
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {LEVEL_LABELS[level]}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            level === 4 ? 'bg-green-500' :
                            level === 3 ? 'bg-blue-500' :
                            level === 2 ? 'bg-yellow-500' :
                            level === 1 ? 'bg-red-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Historical Progress */}
        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Evolución Histórica</h2>
            <div className="space-y-4">
              {history.map((point, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Semana {point.week_number}
                      </h3>
                      <p className="text-sm text-gray-600">{point.article_title}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(point.evaluated_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(point.dimensions).map(([dim, data]) => (
                      <div key={dim} className="text-sm">
                        <span className="text-gray-600">{DIMENSION_LABELS[dim].split(' ')[0]}:</span>
                        <span className={`ml-2 font-medium ${
                          data.level === 4 ? 'text-green-600' :
                          data.level === 3 ? 'text-blue-600' :
                          data.level === 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {LEVEL_LABELS[data.level]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}