/**
 * Fallback problem generator when OpenAI is not available
 * Generates template-based problems with real mathematical/scientific content
 */

const PROBLEM_TEMPLATES = {
  matematico: [
    {
      title: "La Secuencia de Fibonacci en la Naturaleza",
      context: "Observa cómo los girasoles, las piñas y los caracoles muestran el patrón de Fibonacci. Los investigadores descubrieron que este patrón minimiza el sombreado de semillas y maximiza el uso de espacio.",
      challenge: "¿Cómo podrías modelar matemáticamente por qué la naturaleza 'elige' la secuencia de Fibonacci? ¿Qué variables afectarían este patrón?",
      scaffolding: {
        inicial: "Comienza por investigar: ¿cuál es el patrón de la secuencia de Fibonacci? ¿Dónde la ves en la naturaleza?",
        intermedio: "Piensa en términos de optimización: ¿qué problema está resolviendo este patrón? ¿Cómo medirías si es 'óptimo'?",
        avanzado: "Desarrolla un modelo matemático que prediga el patrón para estructuras más complejas o diferentes contextos ecológicos."
      },
      expected_approaches: [
        "Análisis de proporciones áureas",
        "Modelado recursivo",
        "Optimización por cobertura espacial"
      ],
      metacognitive_prompts: [
        "¿Cómo verificarías que tu modelo es correcto?",
        "¿Qué suposiciones hiciste? ¿Cuáles son cuestionables?"
      ]
    },
    {
      title: "Optimización de Rutas en Sistemas de Transporte",
      context: "Las ciudades colombianas enfrentan problemas de congestión. Un algoritmo debe encontrar rutas eficientes para minimizar tiempo y combustible mientras atiende múltiples destinos.",
      challenge: "¿Cómo diseñarías un algoritmo para que una ambulancia, un bus de recolección de basura y un taxi compartan información de rutas óptimas sin comprometer tiempos críticos?",
      scaffolding: {
        inicial: "Dibuja un mapa simple con 5-6 ubicaciones. ¿Cuántas rutas posibles existen? ¿Cómo las compararías?",
        intermedio: "Investiga el Problema del Vendedor Viajero (TSP). ¿Por qué es tan difícil? ¿Qué lo hace diferente para servicios de emergencia?",
        avanzado: "Propone un algoritmo heurístico que considere prioridades diferentes (tiempo para ambulancia vs. costo para transporte de carga)."
      },
      expected_approaches: [
        "Algoritmos greedy",
        "Programación dinámica",
        "Soluciones metaheurísticas (simulated annealing, genética)"
      ],
      metacognitive_prompts: [
        "¿Tu solución es óptima o simplemente 'buena'? ¿Cuál es la diferencia?",
        "¿Qué pasaría si agregramos restricciones nuevas (hora del día, clima)?"
      ]
    }
  ],
  fisico: [
    {
      title: "Energía en Sistemas Hidráulicos Rurales",
      context: "Una comunidad rural colombiana quiere construir un pequeño generador de energía usando una cascada. El agua cae 15 metros y el caudal es de 500 litros por minuto. Deben maximizar energía mientras mantienen agua para agricultura.",
      challenge: "¿Cómo modelarías la energía disponible? ¿Qué variables físicas y sociales influyen en tu diseño?",
      scaffolding: {
        inicial: "Revisa los conceptos de energía potencial y cinética. ¿Cómo se relacionan con el agua cayendo?",
        intermedio: "Calcula la potencia teórica. Luego investiga: ¿por qué los generadores reales producen menos? ¿Qué fricciones existen?",
        avanzado: "Diseña un sistema que genere energía mientras preserva suficiente caudal para riego. ¿Cómo optimizas ambos objetivos?"
      },
      expected_approaches: [
        "Cálculo de energía potencial y conversión a potencia",
        "Análisis de eficiencia y pérdidas",
        "Modelado de compromisos (trade-offs)"
      ],
      metacognitive_prompts: [
        "¿Qué suposiciones simplificaste? ¿Cuáles fueron válidas?",
        "¿Cómo verificarías tu modelo con datos del mundo real?"
      ]
    },
    {
      title: "Acústica en Espacios Educativos",
      context: "Un colegio rural necesita diseñar un aula usando materiales locales. El sonido de la carretera cercana interfiere con la enseñanza. Los materiales disponibles son: adobe, tejas, paja y madera.",
      challenge: "¿Cómo diseñarías el aula para minimizar ruido externo? ¿Qué principios físicos aplicarías?",
      scaffolding: {
        inicial: "¿Cómo se propaga el sonido? ¿Qué propiedades de los materiales afectan la transmisión de sonido?",
        intermedio: "Investiga absorción vs reflexión acústica. ¿Cuál necesitas? ¿Por qué algunos materiales funcionan mejor?",
        avanzado: "Diseña una configuración de capas que optimice costo y aislamiento acústico usando solo materiales locales."
      },
      expected_approaches: [
        "Análisis de ondas sonoras y propagación",
        "Propiedades acústicas de materiales",
        "Diseño de capas aislantes"
      ],
      metacognitive_prompts: [
        "¿Tu solución es física pero no práctica? ¿Cómo negociarías compromisos?",
        "¿Qué variables no consideraste inicialmente?"
      ]
    }
  ],
  integrado: [
    {
      title: "Biodiversidad y Sostenibilidad en la Amazonia",
      context: "Una comunidad indígena quiere mantener su territorio productivo sin perder biodiversidad. Necesitan equilibrar agricultura de subsistencia, ecoturismo y protección de especies clave.",
      challenge: "¿Cómo modelarías un sistema que mida y equilibre estos tres objetivos? ¿Qué indicadores usarías?",
      scaffolding: {
        inicial: "¿Qué es biodiversidad? ¿Cómo la mides? ¿Cómo se relaciona con sostenibilidad económica?",
        intermedio: "Investiga casos reales de ecoturismo en Latinoamérica. ¿Funcionaron? ¿Por qué o por qué no?",
        avanzado: "Diseña un plan de 10 años con indicadores medibles, metas alcanzables y estrategias de adaptación."
      },
      expected_approaches: [
        "Análisis de sistemas ecológicos",
        "Modelado económico y social",
        "Indicadores de sostenibilidad"
      ],
      metacognitive_prompts: [
        "¿Quién decide qué es 'sostenible'? ¿Diferentes perspectivas llevan a diferentes soluciones?",
        "¿Tu plan es resiliente a cambios climáticos o crisis externas?"
      ]
    },
    {
      title: "Innovación Tecnológica para Agricultura Colombiana",
      context: "Pequeños agricultores en el Cauca cultivan maíz pero enfrentan sequías, plagas y acceso limitado a mercados. Una startup propone drones con sensores, riego inteligente y una app de comercio directo.",
      challenge: "¿Es esta solución viable? ¿Para quién? ¿Qué riesgos y oportunidades ves?",
      scaffolding: {
        inicial: "Mapea la cadena actual: producción, distribución, venta. ¿Dónde están los cuellos de botella?",
        intermedio: "Para cada tecnología propuesta: ¿qué problema resuelve realmente? ¿Cuáles son costos vs beneficios?",
        avanzado: "Diseña una implementación realista en 3 fases. ¿Qué entrenamiento necesitan? ¿Quién financia? ¿Cómo mides éxito?"
      },
      expected_approaches: [
        "Análisis de sistemas agrícolas",
        "Evaluación tecnológica y social",
        "Planificación de implementación"
      ],
      metacognitive_prompts: [
        "¿La tecnología resuelve problemas o crea otros nuevos?",
        "¿Cuya perspectiva (agricultores, empresa, gobierno) está faltando en este plan?"
      ]
    }
  ]
};

function generateFallbackProblem({
  problemType = 'integrado',
  difficulty = 2,
  cognitiveTarget = 'representacion'
}) {
  const templates = PROBLEM_TEMPLATES[problemType] || PROBLEM_TEMPLATES.integrado;
  
  // Select a template based on difficulty
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    ...selectedTemplate,
    generated_at: new Date().toISOString(),
    problem_type: problemType,
    difficulty_level: difficulty,
    cognitive_target: cognitiveTarget,
    is_fallback: true,
    note: "Generated from template library (OpenAI not available)"
  };
}

module.exports = {
  generateFallbackProblem
};
