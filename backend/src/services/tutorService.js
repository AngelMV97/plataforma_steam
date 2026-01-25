const OpenAI = require('openai');
const { supabase } = require('../config/supabase');
const {
  getRubricCriteria,
  getGradeProfile,
  getDimensionForSection,
  LEVEL_DESCRIPTORS
} = require('../config/rubrics');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class TutorService {
  /**
   * Generate cognitive intervention based on student interaction
   */
  async generateCognitiveIntervention({
    studentMessage,
    bitacoraContent,
    articleContext,
    conversationHistory,
    studentProfile,
    currentSection
  }) {
    try {
      // Get student's grade level
      const gradeLevel = studentProfile.grade_level || '9';
      
      // Get student's cognitive profile
      const { data: cognitiveProfile } = await supabase
        .from('cognitive_profiles')
        .select('profile_data')
        .eq('student_id', studentProfile.id)
        .single();
      
      // Determine cognitive dimension for current section
      const focusDimension = getDimensionForSection(currentSection);
      
      // Get current level on this dimension (1-4)
      const currentLevel = cognitiveProfile?.profile_data?.[focusDimension]?.level || 1;
      const nextLevel = Math.min(currentLevel + 1, 4);
      
      // Get rubric criteria
      const currentCriteria = getRubricCriteria(gradeLevel, focusDimension, currentLevel);
      const nextCriteria = getRubricCriteria(gradeLevel, focusDimension, nextLevel);
      const gradeProfile = getGradeProfile(gradeLevel);
      
      // Build context from article chunks
      const articleText = articleContext
        .map((chunk, i) => `[Fragmento ${i + 1}]: ${chunk.content}`)
        .join('\n\n');
      
      // Build conversation context (last 6 messages)
      const conversationText = conversationHistory
        .slice(-6)
        .map(msg => `${msg.role === 'student' ? 'Estudiante' : 'Tutor'}: ${msg.tutor_message}`)
        .join('\n');
      
      // Create adaptive system prompt
      const systemPrompt = `Eres un tutor AI cognitivo especializado en desarrollo de pensamiento científico.

╔══════════════════════════════════════════════════════════════╗
║ PERFIL DEL ESTUDIANTE                                         ║
╚══════════════════════════════════════════════════════════════╝
Nivel: ${gradeProfile.name} (Grado ${gradeLevel}°)
Descripción: ${gradeProfile.profile}
Expectativa para este nivel: ${gradeProfile.expectations}

╔══════════════════════════════════════════════════════════════╗
║ DIMENSIÓN COGNITIVA EN FOCO                                   ║
╚══════════════════════════════════════════════════════════════╝
Dimensión: ${gradeProfile.dimensions[focusDimension].name}
Sección de bitácora: ${currentSection}

Nivel actual del estudiante: ${LEVEL_DESCRIPTORS[currentLevel]}
→ "${currentCriteria}"

Objetivo (siguiente nivel): ${LEVEL_DESCRIPTORS[nextLevel]}
→ "${nextCriteria}"

╔══════════════════════════════════════════════════════════════╗
║ ESTRATEGIA PEDAGÓGICA                                         ║
╚══════════════════════════════════════════════════════════════╝
Tu misión es guiar al estudiante desde su nivel actual hacia el siguiente nivel.

Según su nivel actual (${currentLevel}/4):
${currentLevel === 1 ? `
- Estudiante en nivel INICIAL: Necesita MUCHA estructura y guía
- Usa preguntas cerradas para orientar
- Divide problemas en pasos pequeños
- Da ejemplos concretos del artículo
- Valida intentos y celebra avances pequeños
` : currentLevel === 2 ? `
- Estudiante EN DESARROLLO: Necesita guía moderada
- Usa preguntas socráticas simples
- Ayuda a organizar su pensamiento
- Pide que justifique con evidencia del artículo
- Señala conexiones que podría hacer
` : currentLevel === 3 ? `
- Estudiante COMPETENTE: Puede trabajar con autonomía
- Usa preguntas abiertas y desafiantes
- Pide análisis crítico
- Fomenta que proponga alternativas
- Desafía supuestos implícitos
` : `
- Estudiante AVANZADO: Altamente autónomo
- Usa preguntas muy abiertas
- Desafía a generalizar y transferir
- Pide que critique y proponga nuevos enfoques
- Fomenta pensamiento original
`}

MÉTODO: Siempre usa método socrático. NO des respuestas directas.
- Si pregunta "¿Es correcto?", responde con otra pregunta
- Si pide la respuesta, guía el razonamiento
- Si comete un error, pregunta cómo podría verificarlo
- Controla el ritmo: si faltan observaciones, variables o hipótesis, pregunta por ellas primero.
- No propongas hipótesis ni respuestas propias; pide que el estudiante formule y justifique con evidencia del artículo/bitácora.
- Mantén 1-2 preguntas socráticas; evita afirmaciones de solución.

╔══════════════════════════════════════════════════════════════╗
║ CONTEXTO DEL ARTÍCULO                                         ║
╚══════════════════════════════════════════════════════════════╝
${articleText || 'No hay fragmentos del artículo disponibles'}

╔══════════════════════════════════════════════════════════════╗
║ BITÁCORA DEL ESTUDIANTE                                       ║
╚══════════════════════════════════════════════════════════════╝
Observaciones: ${bitacoraContent.observaciones || 'Sin observaciones aún'}
Preguntas: ${JSON.stringify(bitacoraContent.preguntas || [])}
Hipótesis: ${bitacoraContent.hipotesis || 'Sin hipótesis aún'}
Variables: ${JSON.stringify(bitacoraContent.variables || [])}
Experimentos: ${bitacoraContent.experimentos || 'Sin experimentos aún'}

╔══════════════════════════════════════════════════════════════╗
║ CONVERSACIÓN RECIENTE                                         ║
╚══════════════════════════════════════════════════════════════╝
${conversationText || 'Primera interacción'}

╔══════════════════════════════════════════════════════════════╗
║ TU RESPUESTA                                                  ║
╚══════════════════════════════════════════════════════════════╝
Responde de forma breve (máx 3-4 oraciones), en español, con tono cercano pero profesional.
Ajusta la complejidad de tu lenguaje al nivel ${gradeProfile.name}.
Usa el artículo como referencia cuando sea relevante.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: studentMessage }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const aiMessage = response.choices[0].message.content;

      // Determine intervention type and strategy
      const interventionType = this.classifyInterventionType(aiMessage);
      const strategy = this.determineStrategy(aiMessage, currentLevel);

      return {
        message: aiMessage,
        intervention_type: interventionType,
        cognitive_dimension: focusDimension,
        strategy: strategy
      };
    } catch (error) {
      console.error('Cognitive intervention error:', error);
      throw error;
    }
  }

  /**
   * Classify intervention type
   */
  classifyInterventionType(aiMessage) {
    const lower = aiMessage.toLowerCase();

    if (lower.includes('?') && !lower.includes('observ')) {
      return 'socratic_question';
    }
    if (lower.includes('considera') || lower.includes('piensa en')) {
      return 'hint';
    }
    if (lower.includes('contradicc') || lower.includes('pero')) {
      return 'challenge';
    }
    if (lower.includes('bien') || lower.includes('correcto') || lower.includes('exacto')) {
      return 'validation';
    }
    if (lower.includes('evidencia') || lower.includes('artículo')) {
      return 'clarification';
    }

    return 'guidance';
  }

  /**
   * Determine pedagogical strategy based on message and student level
   */
  determineStrategy(aiMessage, studentLevel) {
    const lower = aiMessage.toLowerCase();

    // Level-aware strategies
    if (studentLevel <= 2) {
      if (lower.includes('ejemplo') || lower.includes('por ejemplo')) {
        return 'concrete_example';
      }
      if (lower.includes('paso') || lower.includes('primero')) {
        return 'step_by_step';
      }
    }

    if (lower.includes('¿cómo') || lower.includes('¿por qué')) {
      return 'metacognitive_prompt';
    }
    if (lower.includes('artículo') || lower.includes('texto')) {
      return 'evidence_request';
    }
    if (lower.includes('relacion') || lower.includes('conect')) {
      return 'transfer_facilitation';
    }
    if (lower.includes('compara') || lower.includes('diferen')) {
      return 'comparison';
    }
    if (lower.includes('alternativa') || lower.includes('otro modo')) {
      return 'alternative_thinking';
    }

    return 'socratic_questioning';
  }

  /**
   * Get interaction history for an attempt
   */
  async getInteractionHistory(attemptId) {
    try {
      const { data, error } = await supabase
        .from('tutor_interactions')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  }

  /**
   * Analyze student's problem-solving process (not correctness)
   */
  async analyzeProblemSolvingProcess(bitacoraContent, generatedProblem, studentProfile) {
    const prompt = `
Eres un evaluador experto de procesos de pensamiento en STEM.

PROBLEMA TRABAJADO:
${JSON.stringify(generatedProblem, null, 2)}

TRABAJO DEL ESTUDIANTE:
${JSON.stringify(bitacoraContent, null, 2)}

INSTRUCCIONES:
Analiza el PROCESO de pensamiento del estudiante, NO la corrección de su respuesta.

Evalúa:
1. **Representación**: ¿Cómo modeló el problema? ¿Usó diagramas, ecuaciones, analogías?
2. **Abstracción**: ¿Identificó variables clave? ¿Hizo supuestos explícitos?
3. **Estrategia**: ¿Planificó un enfoque? ¿Probó alternativas?
4. **Argumentación**: ¿Justificó sus decisiones? ¿Explicó su razonamiento?
5. **Metacognición**: ¿Reflexionó sobre errores? ¿Reconoció limitaciones?
6. **Transferencia**: ¿Conectó con otros contextos? ¿Vio patrones generales?

Proporciona:
- 2-3 fortalezas observadas en su proceso
- 1-2 áreas de mejora (sin decirle "la respuesta correcta")
- 1 pregunta socrática para profundizar

Formato JSON:
{
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "growth_areas": ["área 1", "área 2"],
  "deep_question": "pregunta reflexiva"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Eres un evaluador de procesos cognitivos.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = new TutorService();