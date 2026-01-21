'use client';

import { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface BitacoraEditorProps {
  bitacora_content: {
    observaciones: string;
    preguntas: string[];
    hipotesis: string;
    variables: string[];
    experimentos: string;
    errores_aprendizajes: string;
    reflexiones: string;
    conclusiones: string;
  };
  onSave: (content: any) => void;
  currentSection?: string;
}

const SECTIONS = [
  { key: 'observaciones', label: '📋 Observaciones Iniciales', type: 'rich-text' },
  { key: 'preguntas', label: '❓ Preguntas de Investigación', type: 'list' },
  { key: 'hipotesis', label: '💡 Hipótesis', type: 'rich-text' },
  { key: 'variables', label: '🔬 Variables Identificadas', type: 'list' },
  { key: 'experimentos', label: '⚗️ Experimentos y Métodos', type: 'rich-text' },
  { key: 'errores_aprendizajes', label: '🔄 Errores y Aprendizajes', type: 'rich-text' },
  { key: 'reflexiones', label: '💭 Reflexiones', type: 'rich-text' },
  { key: 'conclusiones', label: '✅ Conclusiones', type: 'rich-text' }
];

export default function BitacoraEditor({ bitacora_content, onSave, currentSection }: BitacoraEditorProps) {
  const [content, setContent] = useState(bitacora_content);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([currentSection || 'observaciones'])
  );
  const [newListItem, setNewListItem] = useState<Record<string, string>>({});

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const updateRichText = (key: string, value: string) => {
    const updated = { ...content, [key]: value };
    setContent(updated);
    onSave(updated);
  };

  const addListItem = (key: string) => {
    const value = newListItem[key]?.trim();
    if (!value) return;

    const updated = {
      ...content,
      [key]: [...(content[key as keyof typeof content] as string[]), value]
    };
    setContent(updated);
    setNewListItem({ ...newListItem, [key]: '' });
    onSave(updated);
  };

  const removeListItem = (key: string, index: number) => {
    const updated = {
      ...content,
      [key]: (content[key as keyof typeof content] as string[]).filter((_, i) => i !== index)
    };
    setContent(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        const value = content[section.key as keyof typeof content];

        return (
          <div key={section.key} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Section Header */}
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-900">{section.label}</span>
              <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="p-4 bg-white">
                {section.type === 'rich-text' ? (
                  <RichTextEditor
                    content={value as string}
                    onChange={(newValue) => updateRichText(section.key, newValue)}
                    placeholder={`Escribe tus ${section.label.toLowerCase()}...`}
                  />
                ) : (
                  // List type
                  <div className="space-y-2">
                    {(value as string[]).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-gray-800">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeListItem(section.key, idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newListItem[section.key] || ''}
                        onChange={(e) => setNewListItem({ ...newListItem, [section.key]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addListItem(section.key)}
                        placeholder="Agregar nuevo item..."
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => addListItem(section.key)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}