// frontend/src/components/evaluation/EvaluationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import RUBRICS from '@/config/rubrics';

interface EvaluationFormProps {
  gradeLevel: string;
  existingEvaluations: any[];
  onSubmit: (evaluation: any) => Promise<void>;
  bitacoraContent: any;
}

const DIMENSIONS = [
  { key: 'representacion', label: 'Representación y modelación' },
  { key: 'abstraccion', label: 'Abstracción y manejo de supuestos' },
  { key: 'estrategia', label: 'Estrategia y planificación' },
  { key: 'argumentacion', label: 'Argumentación y justificación' },
  { key: 'metacognicion', label: 'Metacognición y revisión' },
  { key: 'transferencia', label: 'Transferencia y conexión' }
];

const LEVELS = [
  { key: 'inicial', label: 'Inicial', color: 'bg-red-100 text-red-800' },
  { key: 'en_desarrollo', label: 'En Desarrollo', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'competente', label: 'Competente', color: 'bg-blue-100 text-blue-800' },
  { key: 'avanzado', label: 'Avanzado', color: 'bg-green-100 text-green-800' }
];

export default function EvaluationForm({
  gradeLevel,
  existingEvaluations,
  onSubmit,
  bitacoraContent
}: EvaluationFormProps) {
  const [selectedDimension, setSelectedDimension] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [feedback, setFeedback] = useState('');
  const [evidenceQuotes, setEvidenceQuotes] = useState<string[]>([]);
  const [newQuote, setNewQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const rubric = RUBRICS[gradeLevel as keyof typeof RUBRICS];

  // Load existing evaluation if dimension is already evaluated
  useEffect(() => {
    if (selectedDimension) {
      const existing = existingEvaluations.find(e => e.dimension === selectedDimension);
      if (existing) {
        setSelectedLevel(existing.level);
        setFeedback(existing.feedback || '');
        setEvidenceQuotes(existing.evidence_quotes || []);
      } else {
        setSelectedLevel('');
        setFeedback('');
        setEvidenceQuotes([]);
      }
    }
  }, [selectedDimension, existingEvaluations]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedDimension || !selectedLevel) {
      alert('Por favor selecciona dimensión y nivel');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        dimension: selectedDimension,
        level: selectedLevel,
        feedback,
        evidence_quotes: evidenceQuotes
      });
      
      // Reset form
      setSelectedDimension('');
      setSelectedLevel('');
      setFeedback('');
      setEvidenceQuotes([]);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function addQuote() {
    if (newQuote.trim()) {
      setEvidenceQuotes([...evidenceQuotes, newQuote.trim()]);
      setNewQuote('');
    }
  }

  function removeQuote(index: number) {
    setEvidenceQuotes(evidenceQuotes.filter((_, i) => i !== index));
  }

  const evaluatedDimensions = new Set(existingEvaluations.map(e => e.dimension));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Progreso: {evaluatedDimensions.size}/6 dimensiones evaluadas
        </p>
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map(dim => (
            <span
              key={dim.key}
              className={`text-xs px-2 py-1 rounded ${
                evaluatedDimensions.has(dim.key)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {evaluatedDimensions.has(dim.key) ? '✓' : '○'} {dim.label}
            </span>
          ))}
        </div>
      </div>

      {/* Dimension Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensión Cognitiva
        </label>
        <select
          value={selectedDimension}
          onChange={(e) => setSelectedDimension(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccionar dimensión...</option>
          {DIMENSIONS.map(dim => (
            <option key={dim.key} value={dim.key}>
              {dim.label}
              {evaluatedDimensions.has(dim.key) ? ' ✓' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Rubric Descriptions */}
      {selectedDimension && rubric && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Criterios de Evaluación - {rubric.dimensions[selectedDimension as keyof typeof rubric.dimensions]?.name}
          </h4>
          <div className="space-y-2">
            {LEVELS.map(level => (
              <div key={level.key} className="text-sm">
                <span className={`inline-block px-2 py-1 rounded font-medium ${level.color}`}>
                  {level.label}
                </span>
                <span className="ml-2 text-gray-700">
                  {rubric.dimensions[selectedDimension as keyof typeof rubric.dimensions]?.[level.key as 'inicial' | 'en_desarrollo' | 'competente' | 'avanzado']}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Selector */}
      {selectedDimension && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de Logro
          </label>
          <div className="grid grid-cols-2 gap-3">
            {LEVELS.map(level => (
              <button
                key={level.key}
                type="button"
                onClick={() => setSelectedLevel(level.key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedLevel === level.key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${level.color}`}
              >
                <div className="font-semibold">{level.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {selectedLevel && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retroalimentación
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe fortalezas, áreas de mejora, y sugerencias específicas..."
            />
          </div>

          {/* Evidence Quotes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencias (Citas de la Bitácora)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Copia una frase de la bitácora como evidencia..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuote())}
              />
              <button
                type="button"
                onClick={addQuote}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Agregar
              </button>
            </div>
            {evidenceQuotes.length > 0 && (
              <div className="space-y-2">
                {evidenceQuotes.map((quote, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-start">
                    <p className="text-sm text-gray-700 flex-1">"{quote}"</p>
                    <button
                      type="button"
                      onClick={() => removeQuote(idx)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </>
      )}
    </form>
  );
}