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
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">Perfiles Cognitivos</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            Compara el progreso cognitivo de todos tus estudiantes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-4 mb-6">
          <label className="text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mr-4">
            Filtrar por grado:
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
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
                className="bg-white dark:bg-[#1a1f26] rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/mentor/students/${profile.student_id}/profile`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                        {profile.student?.full_name || 'Estudiante'}
                      </h3>
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                        Grado {profile.student?.grade_level}°
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {avgLevel.toFixed(1)}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Promedio</div>
                    </div>
                  </div>
                  <RadarChart data={chartData} maxValue={4} size={280} />
                </div>
              </div>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8 text-center text-[#6B7280] dark:text-[#9CA3AF]">
            No hay perfiles en este grado
          </div>
        )}
      </div>
    </div>
  );
}