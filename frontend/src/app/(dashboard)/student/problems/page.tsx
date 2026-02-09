'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertCircle, Zap, Globe, Lightbulb } from 'lucide-react';

const PROBLEM_TYPES = [
  { 
    value: 'matematico', 
    label: 'Matemático',
    icon: Zap,
    description: 'Razonamiento, abstracción, patrones'
  },
  { 
    value: 'fisico', 
    label: 'Físico',
    icon: Globe,
    description: 'Modelación, sistemas, fenómenos'
  },
  { 
    value: 'integrado', 
    label: 'Integrado',
    icon: Lightbulb,
    description: 'Contexto colombiano/LATAM, multi-disciplinario'
  }
];

const COGNITIVE_DIMENSIONS = [
  { value: 'representacion', label: 'Representación y Modelación' },
  { value: 'abstraccion', label: 'Abstracción' },
  { value: 'estrategia', label: 'Estrategia' },
  { value: 'argumentacion', label: 'Argumentación' },
  { value: 'metacognicion', label: 'Metacognición' },
  { value: 'transferencia', label: 'Transferencia' }
];

export default function ProblemsPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('integrado');
  const [selectedDimension, setSelectedDimension] = useState('');

  async function handleGenerate() {
    try {
      setGenerating(true);
      
      const res = await api.post('/api/problems/generate', {
        problem_type: selectedType,
        cognitive_target: selectedDimension || undefined
      });

      // Navigate to bitácora with generated problem
      router.push(`/student/bitacora/${res.data.attempt_id}`);
    } catch (err: any) {
      alert('Error al generar problema: ' + err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] shadow-sm border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#1F3A5F]/10 rounded-lg">
              <Zap className="w-6 h-6 text-[#1F3A5F] dark:text-[#5B8FB9]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#F3F4F6]">
                Generador de Problemas No Rutinarios
              </h1>
              <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                La IA creará un problema personalizado basado en tu perfil cognitivo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-8 space-y-8">
          {/* Problem Type Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-[#1F3A5F] dark:text-[#F3F4F6]">Tipo de Problema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROBLEM_TYPES.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedType === type.value
                        ? 'border-[#2F6F6D] bg-[#2F6F6D]/10 dark:bg-[#2F6F6D]/20'
                        : 'border-[#E5E7EB] dark:border-[#1F2937] hover:border-[#2F6F6D] dark:hover:border-[#4A9B98] bg-white dark:bg-[#1a1f26]'
                    }`}
                  >
                    <div className={`mb-3 ${selectedType === type.value ? 'text-[#2F6F6D]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`}>
                      <IconComponent className="w-8 h-8" strokeWidth={2} />
                    </div>
                    <div className={`font-semibold text-lg mb-1 ${selectedType === type.value ? 'text-[#2F6F6D]' : 'text-[#1F3A5F] dark:text-[#F3F4F6]'}`}>
                      {type.label}
                    </div>
                    <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cognitive Dimension Target (Optional) */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-[#1F3A5F] dark:text-[#F3F4F6]">
              Dimensión Cognitiva a Desarrollar (Opcional)
            </h2>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full border-2 border-[#E5E7EB] dark:border-[#1F2937] rounded-lg px-4 py-3 focus:border-[#2F6F6D] focus:outline-none transition-colors bg-white dark:bg-[#1a1f26] text-[#1F3A5F] dark:text-[#F3F4F6]"
            >
              <option value="">Automático (basado en tu perfil)</option>
              {COGNITIVE_DIMENSIONS.map(dim => (
                <option key={dim.value} value={dim.value}>
                  {dim.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2">
              Si no seleccionas ninguna, la IA elegirá según tus áreas de mejora
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#2F6F6D] hover:bg-[#1F3A5F] dark:bg-[#4A9B98] dark:hover:bg-[#2F6F6D] text-white font-semibold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando problema personalizado...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" strokeWidth={2} />
                Generar Problema
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-[#2F6F6D]/10 dark:bg-[#2F6F6D]/20 border-2 border-[#2F6F6D]/30 dark:border-[#4A9B98]/40 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98] flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h3 className="font-semibold text-[#1F3A5F] dark:text-[#F3F4F6] mb-2">
                  Sobre los problemas no rutinarios
                </h3>
                <ul className="text-sm text-[#1F3A5F] dark:text-[#9CA3AF] space-y-1">
                  <li>• No tienen una fórmula directa de solución</li>
                  <li>• Tienen múltiples caminos válidos</li>
                  <li>• Requieren que construyas modelos y justifiques decisiones</li>
                  <li>• Te ayudan a desarrollar pensamiento profundo</li>
                  <li>• Cada problema es único y adaptado a tu nivel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}