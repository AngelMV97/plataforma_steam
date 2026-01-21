'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const PROBLEM_TYPES = [
  { 
    value: 'matematico', 
    label: 'Matemático',
    icon: '🔢',
    description: 'Razonamiento, abstracción, patrones'
  },
  { 
    value: 'fisico', 
    label: 'Físico',
    icon: '⚗️',
    description: 'Modelación, sistemas, fenómenos'
  },
  { 
    value: 'integrado', 
    label: 'Integrado',
    icon: '🌎',
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Generador de Problemas No Rutinarios
          </h1>
          <p className="text-gray-600 mt-2">
            La IA creará un problema personalizado basado en tu perfil cognitivo
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Problem Type Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tipo de Problema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROBLEM_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <div className="font-semibold text-lg mb-1">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cognitive Dimension Target (Optional) */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Dimensión Cognitiva a Desarrollar (Opcional)
            </h2>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Automático (basado en tu perfil)</option>
              {COGNITIVE_DIMENSIONS.map(dim => (
                <option key={dim.value} value={dim.value}>
                  {dim.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Si no seleccionas ninguna, la IA elegirá según tus áreas de mejora
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                ✨ Generar Problema
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ Sobre los problemas no rutinarios
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
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
  );
}