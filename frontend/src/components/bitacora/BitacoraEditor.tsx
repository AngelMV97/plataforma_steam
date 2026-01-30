'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DocumentIcon,
  AlertCircleIcon,
  TrashIcon,
  BookOpenIcon,
  NodeIcon,
  BarChartIcon,
  ClockIcon,
  CheckCircleIcon
} from '@/components/icons/MinimalIcons';

// Dynamically import RichTextEditor to avoid memory issues during compilation
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg p-4 min-h-[100px] flex items-center justify-center text-[#9CA3AF] dark:text-[#6B7280]">
      Cargando editor...
    </div>
  ),
});

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
  { key: 'observaciones', label: 'Observaciones Iniciales', icon: DocumentIcon, type: 'rich-text' },
  { key: 'preguntas', label: 'Preguntas de Investigación', icon: AlertCircleIcon, type: 'list' },
  { key: 'hipotesis', label: 'Hipótesis', icon: BookOpenIcon, type: 'rich-text' },
  { key: 'variables', label: 'Variables Identificadas', icon: NodeIcon, type: 'list' },
  { key: 'experimentos', label: 'Experimentos y Métodos', icon: BarChartIcon, type: 'rich-text' },
  { key: 'errores_aprendizajes', label: 'Errores y Aprendizajes', icon: ClockIcon, type: 'rich-text' },
  { key: 'reflexiones', label: 'Reflexiones', icon: DocumentIcon, type: 'rich-text' },
  { key: 'conclusiones', label: 'Conclusiones', icon: CheckCircleIcon, type: 'rich-text' }
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
        const SectionIcon = section.icon;

        return (
          <div key={section.key} className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg overflow-hidden bg-white dark:bg-[#1a1f26]">
            {/* Section Header */}
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between p-4 bg-[#F9FAFB] dark:bg-[#111827] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937] transition-colors border-b border-[#E5E7EB] dark:border-[#1F2937]"
            >
              <div className="flex items-center gap-3">
                <SectionIcon className="w-5 h-5 text-[#2F6F6D] dark:text-[#4A9B98]" />
                <span className="font-semibold text-[#1F3A5F] dark:text-[#F3F4F6]">{section.label}</span>
              </div>
              <span className="text-[#6B7280] dark:text-[#D1D5DB]">{isExpanded ? '▼' : '▶'}</span>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="p-4">
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
                      <div key={idx} className="flex items-center gap-2 p-3 bg-[#F9FAFB] dark:bg-[#111827] rounded border border-[#E5E7EB] dark:border-[#1F2937]">
                        <span className="flex-1 text-[#1F2937] dark:text-[#F3F4F6]">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeListItem(section.key, idx)}
                          className="text-[#EF4444] dark:text-[#F87171] hover:text-[#DC2626] dark:hover:text-[#FCA5A5] transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={newListItem[section.key] || ''}
                        onChange={(e) => setNewListItem({ ...newListItem, [section.key]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addListItem(section.key)}
                        placeholder="Agregar nuevo item..."
                        className="flex-1 border border-[#E5E7EB] dark:border-[#1F2937] rounded px-3 py-2 bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6] placeholder-[#9CA3AF] dark:placeholder-[#6B7280] focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addListItem(section.key)}
                        className="px-4 py-2 bg-[#2F6F6D] dark:bg-[#4A9B98] hover:bg-[#1F4F4D] dark:hover:bg-[#367A78] text-white rounded font-medium transition-colors"
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