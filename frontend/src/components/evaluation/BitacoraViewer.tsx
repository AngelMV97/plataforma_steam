// frontend/src/components/evaluation/BitacoraViewer.tsx
'use client';

interface BitacoraViewerProps {
  content: {
    observaciones: string;
    preguntas: string[];
    hipotesis: string;
    variables: string[];
    experimentos: string;
    errores_aprendizajes: string;
    reflexiones: string;
    conclusiones: string;
  };
}

const SECTION_LABELS: Record<string, string> = {
  observaciones: '📋 Observaciones Iniciales',
  preguntas: '❓ Preguntas de Investigación',
  hipotesis: '💡 Hipótesis',
  variables: '🔬 Variables Identificadas',
  experimentos: '⚗️ Experimentos y Métodos',
  errores_aprendizajes: '🔄 Errores y Aprendizajes',
  reflexiones: '💭 Reflexiones',
  conclusiones: '✅ Conclusiones'
};

export default function BitacoraViewer({ content }: BitacoraViewerProps) {
  return (
    <div className="space-y-6">
      {Object.entries(SECTION_LABELS).map(([key, label]) => {
        const value = content[key as keyof typeof content];
        const isEmpty = Array.isArray(value) ? value.length === 0 : !value;

        return (
          <div key={key} className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
            {isEmpty ? (
              <p className="text-gray-400 italic">Sin contenido</p>
            ) : Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-1">
                {value.map((item, idx) => (
                  <li key={idx} className="text-gray-700">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}