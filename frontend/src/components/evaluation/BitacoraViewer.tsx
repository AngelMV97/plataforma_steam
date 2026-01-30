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
  // Rich text fields that contain HTML
  const richTextFields = ['observaciones', 'hipotesis', 'experimentos', 'errores_aprendizajes', 'reflexiones', 'conclusiones'];
  
  return (
    <div className="space-y-6">
      {Object.entries(SECTION_LABELS).map(([key, label]) => {
        const value = content[key as keyof typeof content];
        const isEmpty = Array.isArray(value) ? value.length === 0 : !value;
        const isRichTextField = richTextFields.includes(key);

        return (
          <div key={key} className="border-l-4 border-[#2F6F6D] dark:border-[#4A9B98] pl-4 py-2">
            <h3 className="font-semibold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">{label}</h3>
            {isEmpty ? (
              <p className="text-gray-400 dark:text-gray-500 italic">Sin contenido</p>
            ) : Array.isArray(value) ? (
              <ul className="list-disc list-inside space-y-1">
                {value.map((item, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{item}</li>
                ))}
              </ul>
            ) : isRichTextField ? (
              <div 
                className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:text-gray-700 dark:[&_li]:text-gray-300 [&_img]:max-w-full [&_img]:rounded [&_img]:border [&_img]:border-gray-300 dark:[&_img]:border-gray-600"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}