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
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A5F] dark:border-[#5B8FB9] mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-xl mb-4">Error</p>
          <p>{error || 'No se pudo cargar el perfil'}</p>
        </div>
      </div>
    );
  }

  const chartData = {
    representacion: profileData.representacion?.level || 0,
    abstraccion: profileData.abstraccion?.level || 0,
    estrategia: profileData.estrategia?.level || 0,
    argumentacion: profileData.argumentacion?.level || 0,
    metacognicion: profileData.metacognicion?.level || 0,
    transferencia: profileData.transferencia?.level || 0
  };

  const hasEvaluations = Object.values(chartData).some(v => v > 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">Mi Perfil Cognitivo</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Visualiza tu progreso en las 6 dimensiones cognitivas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasEvaluations ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-400 font-medium">
              Aún no tienes evaluaciones. Completa y envía tus bitácoras para que tu mentor las evalúe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6 text-center text-[#1F2937] dark:text-[#F3F4F6]">Perfil Actual</h2>
              <RadarChart data={chartData} maxValue={4} size={400} />
            </div>

            {/* Dimension Details */}
            <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#1F2937] dark:text-[#F3F4F6]">Detalles por Dimensión</h2>
              <div className="space-y-4">
                {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                  const dimensionData = profileData[key as keyof ProfileData];
                  const level = dimensionData?.level || 0;
                  const percentage = (level / 4) * 100;
                  
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#4B5563] dark:text-[#D1D5DB]">{label}</span>
                        <span className="text-sm font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                          {LEVEL_LABELS[level]}
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] dark:bg-[#1F2937] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            level === 4 ? 'bg-green-500' :
                            level === 3 ? 'bg-[#1F3A5F] dark:bg-[#5B8FB9]' :
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
          <div className="mt-8 bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1F2937] dark:text-[#F3F4F6]">Evolución Histórica</h2>
            <div className="space-y-4">
              {history.map((point, idx) => (
                <div key={idx} className="border-l-4 border-[#1F3A5F] dark:border-[#5B8FB9] pl-4 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                        Semana {point.week_number}
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{point.article_title}</p>
                    </div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {new Date(point.evaluated_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(point.dimensions).map(([dim, data]) => (
                      <div key={dim} className="text-sm">
                        <span className="text-[#6B7280] dark:text-[#9CA3AF]">{DIMENSION_LABELS[dim].split(' ')[0]}:</span>
                        <span className={`ml-2 font-medium ${
                          data.level === 4 ? 'text-green-600' :
                          data.level === 3 ? 'text-[#1F3A5F] dark:text-[#5B8FB9]' :
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