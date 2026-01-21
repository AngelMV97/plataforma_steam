'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import RadarChart from '@/components/profile/RadarChart';

interface StudentProfile {
  student_id: string;
  profile_data: any;
  last_updated: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    grade_level: string;
  };
}

export default function MentorProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      const res = await api.get('/api/cognitive-profiles');
      setProfiles(res.data);
    } catch (err) {
      console.error('Load profiles error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProfiles = selectedGrade === 'all'
    ? profiles
    : profiles.filter(p => p.student?.grade_level === selectedGrade);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Perfiles Cognitivos</h1>
          <p className="text-gray-600 mt-2">
            Compara el progreso cognitivo de todos tus estudiantes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="text-sm font-medium text-gray-700 mr-4">
            Filtrar por grado:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los grados</option>
            <option value="9">9°</option>
            <option value="10">10°</option>
            <option value="11">11°</option>
            <option value="graduate">Egresados</option>
          </select>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const chartData = {
              representacion: profile.profile_data?.representacion?.level || 0,
              abstraccion: profile.profile_data?.abstraccion?.level || 0,
              estrategia: profile.profile_data?.estrategia?.level || 0,
              argumentacion: profile.profile_data?.argumentacion?.level || 0,
              metacognicion: profile.profile_data?.metacognicion?.level || 0,
              transferencia: profile.profile_data?.transferencia?.level || 0
            };

            const avgLevel = Object.values(chartData).reduce((sum, v) => sum + v, 0) / 6;

            return (
              <div
                key={profile.student_id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/mentor/students/${profile.student_id}/profile`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {profile.student?.full_name || 'Estudiante'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Grado {profile.student?.grade_level}°
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {avgLevel.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Promedio</div>
                    </div>
                  </div>
                  <RadarChart data={chartData} maxValue={4} size={280} />
                </div>
              </div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay perfiles en este grado
          </div>
        )}
      </div>
    </div>
  );
}