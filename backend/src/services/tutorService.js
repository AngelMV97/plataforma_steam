const openai = require('../config/openai');
const { supabase } = require('../config/supabase');

/**
 * AI Tutor Service - Cognitive interventions
 */
class TutorService {
  
  /**
   * Analyze student's bitácora and generate intervention
   */
  async generateIntervention(attemptId, bitacoraContent, interactionHistory = []) {
    try {
      // Determine intervention type based on student's progress
      const interventionType = this.determineInterventionType(
        bitacoraContent, 
        interactionHistory
      );

      // Generate contextual prompt for AI
      const prompt = this.buildPrompt(interventionType, bitacoraContent, interactionHistory);

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const tutorMessage = completion.choices[0].message.content;

      // Save interaction to database
      const { data: interaction, error } = await supabase
        .from('tutor_interactions')
        .insert({
          attempt_id: attemptId,
          interaction_type: interventionType,
          tutor_message: tutorMessage,
          context_snapshot: bitacoraContent,
          ai_model_used: process.env.OPENAI_MODEL || 'gpt-4o-mini'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        interaction,
        interventionType
      };

    } catch (error) {
      console.error('Tutor intervention error:', error);
      throw error;
    }
  }

  /**
   * Determine which type of intervention to use
   */
  determineInterventionType(bitacoraContent, interactionHistory) {
    const recentInteractions = interactionHistory.slice(-3);
    const lastTypes = recentInteractions.map(i => i.interaction_type);

    // Avoid repeating same intervention type
    const interventionTypes = [
      'clarification',
      'counterexample', 
      'metacognition',
      'transfer',
      'focus'
    ];

    // Simple logic - can be enhanced with ML later
    if (bitacoraContent.hypotheses?.length === 0) {
      return 'clarification';
    }
    
    if (bitacoraContent.attempts?.length > 2 && !lastTypes.includes('metacognition')) {
      return 'metacognition';
    }

    if (bitacoraContent.reflections?.length === 0) {
      return 'focus';
    }

    // Default to varied intervention
    const availableTypes = interventionTypes.filter(t => !lastTypes.includes(t));
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Build prompt for AI based on intervention type
   */
  buildPrompt(interventionType, bitacoraContent, interactionHistory) {
    const context = `
Student's current work:
- Initial understanding: ${bitacoraContent.initial_understanding || 'Not yet defined'}
- Hypotheses: ${JSON.stringify(bitacoraContent.hypotheses || [])}
- Attempts so far: ${JSON.stringify(bitacoraContent.attempts || [])}
- Reflections: ${JSON.stringify(bitacoraContent.reflections || [])}

Previous interactions: ${interactionHistory.length} interventions
    `;

    const prompts = {
      clarification: `${context}\n\nThe student seems unclear about the problem. Ask a clarifying question that helps them define what they're trying to solve or understand. Don't give answers, help them articulate their thinking.`,
      
      counterexample: `${context}\n\nThe student has made an assumption or claim. Provide a gentle counterexample or edge case that challenges their thinking without being discouraging. Make them reconsider.`,
      
      metacognition: `${context}\n\nThe student has been working but may not be reflecting on their process. Ask a metacognitive question that makes them think about HOW they're thinking, their strategy, or what they're learning about their own reasoning.`,
      
      transfer: `${context}\n\nHelp the student see connections. Ask if they've encountered similar ideas in other contexts, or how this concept might apply elsewhere. Encourage transferring knowledge.`,
      
      focus: `${context}\n\nThe student seems scattered or stuck. Help them focus by asking what specific part is most uncertain or what they could tackle first. Guide them to break down the problem.`
    };

    return prompts[interventionType] || prompts.clarification;
  }

  /**
   * System prompt defining tutor's role
   */
  getSystemPrompt() {
    return `You are a cognitive tutor for a STEM academy focused on scientific thinking.

Your role:
- Help students think deeply, not give answers
- Ask strategic questions that reveal reasoning
- Introduce counterexamples when appropriate
- Foster metacognition (thinking about thinking)
- Encourage multiple approaches
- Be supportive but challenging

Your constraints:
- NEVER solve the problem for them
- Keep responses brief (2-3 sentences max)
- Use clear, simple Spanish (Latin American)
- Focus on PROCESS, not just results
- Encourage experimentation and revision

Tone: Curious, supportive, Socratic`;
  }

  /**
   * Get interaction history for an attempt
   */
  async getInteractionHistory(attemptId) {
    const { data, error } = await supabase
      .from('tutor_interactions')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

module.exports = new TutorService();