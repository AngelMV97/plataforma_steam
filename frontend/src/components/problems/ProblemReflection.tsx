'use client';

interface ProblemReflectionProps {
  problem: any;
  bitacora_content: any;
}

export default function ProblemReflection({ problem, bitacora_content }: ProblemReflectionProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        🤔 Reflexión sobre tu Proceso
      </h3>
      
      <div className="space-y-4">
        {problem.metacognitive_prompts?.map((prompt: string, idx: number) => (
          <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <p className="text-gray-800 font-medium mb-2">{prompt}</p>
            <p className="text-sm text-gray-600 italic">
              Piensa en tu respuesta mientras esperas la retroalimentación de tu mentor
            </p>
          </div>
        ))}
        
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">
            Enfoques Posibles
          </h4>
          <p className="text-sm text-gray-700 mb-2">
            Recuerda que este problema tiene múltiples caminos válidos. Algunos enfoques que otros han usado:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {problem.expected_approaches?.map((approach: string, idx: number) => (
              <li key={idx}>{approach}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mt-3">
            Tu enfoque es igualmente válido si:
            <br />• Hiciste supuestos explícitos
            <br />• Justificaste tus decisiones
            <br />• Consideraste alternativas
            <br />• Reflexionaste sobre limitaciones
          </p>
        </div>

        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
          <p className="text-blue-900 font-medium">
            ℹ️ Tu mentor evaluará tu <strong>proceso de pensamiento</strong>, no si llegaste a una "respuesta correcta".
          </p>
          <p className="text-blue-800 text-sm mt-2">
            Se enfocará en cómo representaste el problema, qué estrategias usaste, 
            cómo argumentaste, y cómo reflexionaste sobre tu trabajo.
          </p>
        </div>
      </div>
    </div>
  );
}
