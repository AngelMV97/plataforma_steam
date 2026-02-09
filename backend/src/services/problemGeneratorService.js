const { openai } = require('../config/openai');
const RUBRICS = require('../config/rubrics');

/**
 * Generate a non-routine problem based on context
 */
async function generateProblem({
  studentProfile,
  articleContext,
  problemType, // 'matematico', 'fisico', 'integrado'
  difficulty, // 1-4
  cognitiveTarget // which dimension to target
}) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized - check OPENAI_API_KEY environment variable');
    }
    
    const gradeLevel = studentProfile.grade_level || '9';
    const rubric = RUBRICS[gradeLevel];
    
    if (!rubric) {
      throw new Error(`No rubric found for grade level: ${gradeLevel}`);
    }

    const targetDimension = cognitiveTarget || 'representacion';
    if (!rubric.dimensions[targetDimension]) {
      throw new Error(`Invalid cognitive target: ${targetDimension}`);
    }
    
    // Get student's cognitive profile
    const weakDimensions = identifyWeakDimensions(studentProfile);
  
  const prompt = `
Eres un diseñador experto de problemas STEM no rutinarios para estudiantes colombianos de grado ${gradeLevel}°.

CONTEXTO DEL ESTUDIANTE:
- Nivel: ${rubric.name}
- Perfil: ${rubric.profile}
- Dimensiones a desarrollar: ${weakDimensions.join(', ')}

CONTEXTO DEL ARTÍCULO:
${articleContext ? `El estudiante acaba de leer: "${articleContext.title}"
Tema principal: ${articleContext.summary}` : 'Sin artículo base'}

TIPO DE PROBLEMA SOLICITADO: ${problemType}
${problemType === 'integrado' ? `
- Debe estar contextualizado en Colombia o Latinoamérica
- Ejemplos de contextos: energía rural, biodiversidad amazónica, ingeniería de materiales locales, tecnología para comunidades, movilidad urbana, agricultura sostenible
` : ''}

NIVEL DE DIFICULTAD: ${difficulty}/4

DIMENSIÓN COGNITIVA OBJETIVO: ${targetDimension}
- Descriptor: ${rubric.dimensions[targetDimension].name}

INSTRUCCIONES:
1. Crea un problema NO RUTINARIO (sin algoritmo directo de solución)
2. Debe tener MÚLTIPLES CAMINOS de solución
3. Requiere que el estudiante:
   - Construya modelos
   - Haga supuestos explícitos
   - Justifique decisiones
   - Revise su proceso
4. NO debe ser un ejercicio tradicional con fórmula directa
5. Debe generar preguntas genuinas, no solo aplicar procedimientos

FORMATO DE RESPUESTA (JSON):
{
  "title": "Título breve y atractivo",
  "context": "Situación o escenario (2-3 párrafos)",
  "challenge": "La pregunta o desafío central",
  "scaffolding": {
    "inicial": "Pista para nivel inicial",
    "intermedio": "Pista para nivel intermedio",
    "avanzado": "Extensión para nivel avanzado"
  },
  "cognitive_target": "${targetDimension}",
  "expected_approaches": ["Enfoque 1", "Enfoque 2", "Enfoque 3"],
  "metacognitive_prompts": ["Pregunta reflexiva 1", "Pregunta reflexiva 2"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un diseñador experto de problemas STEM no rutinarios.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8 // Higher creativity
    });

    const problem = JSON.parse(response.choices[0].message.content);
    
    return {
      ...problem,
      generated_at: new Date().toISOString(),
      problem_type: problemType,
      difficulty_level: difficulty,
      student_profile: {
        grade_level: gradeLevel,
        weak_dimensions: weakDimensions
      }
    };
  } catch (error) {
    // Re-throw with context
    if (error.status === 401) {
      throw new Error('OpenAI API key is invalid or missing');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded - please try again later');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error - please try again');
    }
    throw error;
  }
}

/**
 * Identify student's weak cognitive dimensions
 */
function identifyWeakDimensions(profile) {
  if (!profile.profile_data) return [];
  
  const dimensions = ['representacion', 'abstraccion', 'estrategia', 
                      'argumentacion', 'metacognicion', 'transferencia'];
  
  const scores = dimensions.map(dim => ({
    dimension: dim,
    level: profile.profile_data[dim]?.level || 0
  }));
  
  // Return dimensions with level < 3 (below competente)
  return scores
    .filter(s => s.level < 3)
    .sort((a, b) => a.level - b.level)
    .slice(0, 2) // Top 2 weakest
    .map(s => s.dimension);
}

/**
 * Generate scaffolding hint based on student's current attempt
 */
async function generateHint({
  problem,
  studentAttempt,
  studentProfile,
  hintLevel // 'light', 'medium', 'strong'
}) {
  
  const prompt = `
El estudiante está trabajando en este problema:
${JSON.stringify(problem, null, 2)}

Su intento actual:
${studentAttempt}

Nivel de ayuda requerido: ${hintLevel}

Genera una intervención pedagógica que:
- ${hintLevel === 'light' ? 'Haga una pregunta socrática que lo haga pensar' : ''}
- ${hintLevel === 'medium' ? 'Señale un enfoque alternativo sin dar la solución' : ''}
- ${hintLevel === 'strong' ? 'Proporcione un ejemplo análogo más simple' : ''}
- NO resuelva el problema por él
- Refuerce el pensamiento metacognitivo

Responde en 2-3 oraciones máximo.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres un tutor cognitivo experto.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

module.exports = {
  generateProblem,
  generateHint
};